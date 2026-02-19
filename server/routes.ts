import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { getChatResponse } from "./openai";
import { generateAndStoreEmbedding, ensureAllEmbeddings } from "./embeddings";
import { seedKnowledgeBase } from "./knowledgeBase";

// Track which users have been seeded to avoid re-seeding after they delete their data
const seededUsers = new Set<string>();

async function seedDatabase(userId: string) {
  // Skip if user has already been seeded (even if they deleted their data)
  if (seededUsers.has(userId)) return;
  
  // Check if data exists for this user
  const tasks = await storage.getTasks(userId);
  if (tasks.length > 0) {
    seededUsers.add(userId); // Mark as seeded since they have data
    return;
  }
  
  // Also check if user has any other data (symptoms, meds, etc.) to avoid re-seeding
  const symptoms = await storage.getSymptomLogs(userId);
  if (symptoms.length > 0) {
    seededUsers.add(userId);
    return;
  }

  console.log("Seeding database for user:", userId);

  // Seed Tasks
  await storage.createTask({
    userId,
    title: "Call Insurance Provider",
    description: "Ask about coverage for 7-day inpatient stay. Use script from Navigator.",
    assignedTo: "Dad",
    isComplete: false,
    dueDate: new Date(Date.now() + 86400000) // Tomorrow
  });
  await storage.createTask({
    userId,
    title: "Upload Medical History",
    description: "Scan and upload the timeline of events from the last month.",
    assignedTo: "Mom",
    isComplete: false,
  });

  // Seed Timeline
  await storage.createTimelineEvent({
    userId,
    title: "Hospital Admission",
    date: new Date(Date.now() - 172800000), // 2 days ago
    type: "medical",
    description: "Admitted to General Hospital ER via ambulance."
  });
  await storage.createTimelineEvent({
    userId,
    title: "Qualified for Olympics",
    date: new Date(Date.now() - 2592000000), // 30 days ago
    type: "life_event",
    description: "Qualified for 200m Freestyle. Baseline functioning high."
  });

  // Seed Medications
  const med = await storage.createMedication({
    userId,
    name: "Lithium",
    dosage: "300mg",
    frequency: "Twice daily",
    notes: "Take with food."
  });
  await storage.createMedication({
    userId,
    name: "Olanzapine",
    dosage: "10mg",
    frequency: "Nightly",
    notes: "May cause drowsiness."
  });

  // Seed Med Logs
  await storage.createMedicationLog({
    medicationId: med.id,
    status: "taken",
    notes: "Taken on time."
  });

  // Seed Symptoms
  await storage.createSymptomLog({
    userId,
    type: "mood",
    severity: 8,
    notes: "Agitated in the morning, calmer by evening."
  });

  // Seed Chat
  await storage.createChatMessage({
    userId,
    userName: "System",
    content: "Welcome to The Anchor. This is your family crisis command center."
  });
  
  // Mark user as seeded so we don't reseed if they delete everything
  seededUsers.add(userId);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app); // For file uploads
  
  // Seed knowledge base on startup
  seedKnowledgeBase()
    .then(() => ensureAllEmbeddings())
    .catch(console.error);

  // Middleware to ensure authentication for all API routes
  // Except login/logout which are handled by Auth integration
  // And maybe some public endpoints if needed.
  // For now, let's protect everything under /api except auth
  // Note: registerAuthRoutes handles /api/auth/*
  
  // Helper to extract user ID from req.user
  const getUserId = (req: any) => req.user?.claims?.sub;
  const getUserName = (req: any) => `${req.user?.claims?.first_name || ''} ${req.user?.claims?.last_name || ''}`.trim() || req.user?.claims?.email || 'Unknown';

  // Seed data on first authenticated request (hacky but effective for per-user seeding without a "signup" hook)
  app.use('/api', async (req, res, next) => {
    if (req.isAuthenticated()) {
      const userId = getUserId(req);
      // We don't want to block every request, but for MVP/demo this ensures new users get data.
      // Better: check once or have a specific "onboard" route. 
      // Let's just fire and forget, or check quickly.
      // We'll trust the seed function to return quickly if data exists.
      await seedDatabase(userId).catch(console.error);
    }
    next();
  });


  // --- DOCUMENTS ---
  app.get(api.documents.list.path, isAuthenticated, async (req, res) => {
    const docs = await storage.getDocuments(getUserId(req));
    res.json(docs);
  });
  app.post(api.documents.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.documents.create.input.parse({ ...req.body, userId: getUserId(req) });
      const doc = await storage.createDocument(input);
      res.status(201).json(doc);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });
  app.delete(api.documents.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteDocument(Number(req.params.id));
    res.status(204).end();
  });

  // Document AI Analysis (analyze document content for auto-tagging)
  app.post('/api/documents/analyze', isAuthenticated, async (req, res) => {
    try {
      const { content, filename } = req.body;
      if (!content || content.trim().length < 10) {
        return res.status(400).json({ message: 'Document content too short for analysis' });
      }
      const { analyzeDocumentContent } = await import('./openai');
      const analysis = await analyzeDocumentContent(content, filename);
      res.json(analysis);
    } catch (err: any) {
      console.error('Document analysis error:', err);
      res.status(500).json({ message: err.message || 'Failed to analyze document' });
    }
  });

  // Document download endpoint - serves private files via object storage
  app.get('/api/documents/:id/download', isAuthenticated, async (req, res) => {
    try {
      const docId = Number(req.params.id);
      const userId = getUserId(req);
      const documents = await storage.getDocuments(userId);
      const doc = documents.find(d => d.id === docId);
      
      if (!doc) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      const { ObjectStorageService, ObjectNotFoundError } = await import('./replit_integrations/object_storage');
      const objectStorageService = new ObjectStorageService();
      
      // Convert the GCS URL to object path
      const objectPath = objectStorageService.normalizeObjectEntityPath(doc.fileUrl);
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      
      // Set content disposition for download
      const filename = doc.title.replace(/[^a-zA-Z0-9.-]/g, '_') + '.' + (doc.fileType.split('/')[1] || 'bin');
      res.set('Content-Disposition', `attachment; filename="${filename}"`);
      
      await objectStorageService.downloadObject(objectFile, res);
    } catch (err: any) {
      console.error('Document download error:', err);
      if (err.name === 'ObjectNotFoundError') {
        return res.status(404).json({ message: 'File not found in storage' });
      }
      res.status(500).json({ message: 'Failed to download document' });
    }
  });

  // Document view endpoint - serves private files inline for viewing
  app.get('/api/documents/:id/view', isAuthenticated, async (req, res) => {
    try {
      const docId = Number(req.params.id);
      const userId = getUserId(req);
      const documents = await storage.getDocuments(userId);
      const doc = documents.find(d => d.id === docId);
      
      if (!doc) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      const { ObjectStorageService, ObjectNotFoundError } = await import('./replit_integrations/object_storage');
      const objectStorageService = new ObjectStorageService();
      
      // Convert the GCS URL to object path
      const objectPath = objectStorageService.normalizeObjectEntityPath(doc.fileUrl);
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      
      // Set content disposition for inline viewing
      const filename = doc.title.replace(/[^a-zA-Z0-9.-]/g, '_') + '.' + (doc.fileType.split('/')[1] || 'bin');
      res.set('Content-Disposition', `inline; filename="${filename}"`);
      res.set('Content-Type', doc.fileType);
      
      await objectStorageService.downloadObject(objectFile, res);
    } catch (err: any) {
      console.error('Document view error:', err);
      if (err.name === 'ObjectNotFoundError') {
        return res.status(404).json({ message: 'File not found in storage' });
      }
      res.status(500).json({ message: 'Failed to view document' });
    }
  });

  // --- TIMELINE ---
  app.get(api.timeline.list.path, isAuthenticated, async (req, res) => {
    const events = await storage.getTimelineEvents(getUserId(req));
    res.json(events);
  });
  app.post(api.timeline.create.path, isAuthenticated, async (req, res) => {
    try {
      // Coerce date string to Date object if needed, handled by Zod?
      // Zod schema expects Date object for timestamp fields usually. 
      // Frontend sends ISO string. Drizzle-zod might need coercion.
      // Let's assume frontend sends proper format that Zod accepts or use z.coerce in schema (which we didn't do explicitly).
      // Actually createInsertSchema usually handles basic types.
      const input = api.timeline.create.input.parse({ ...req.body, userId: getUserId(req), date: new Date(req.body.date) });
      const event = await storage.createTimelineEvent(input);
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });
  app.delete(api.timeline.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteTimelineEvent(Number(req.params.id));
    res.status(204).end();
  });

  // --- TASKS ---
  app.get(api.tasks.list.path, isAuthenticated, async (req, res) => {
    const tasks = await storage.getTasks(getUserId(req));
    res.json(tasks);
  });
  app.post(api.tasks.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse({ ...req.body, userId: getUserId(req) });
      const task = await storage.createTask(input);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });
  app.patch(api.tasks.update.path, isAuthenticated, async (req, res) => {
    const task = await storage.updateTask(Number(req.params.id), req.body);
    res.json(task);
  });
  app.delete(api.tasks.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.status(204).end();
  });
  
  // Cleanup past-due tasks
  app.post('/api/tasks/cleanup', isAuthenticated, async (req, res) => {
    const count = await storage.deletePastTasks(getUserId(req));
    res.json({ deleted: count });
  });

  // --- MEDICATIONS ---
  app.get(api.medications.list.path, isAuthenticated, async (req, res) => {
    const meds = await storage.getMedications(getUserId(req));
    res.json(meds);
  });
  app.post(api.medications.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.medications.create.input.parse({ ...req.body, userId: getUserId(req) });
      const med = await storage.createMedication(input);
      res.status(201).json(med);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });
  app.patch(api.medications.update.path, isAuthenticated, async (req, res) => {
    const med = await storage.updateMedication(Number(req.params.id), req.body);
    res.json(med);
  });
  app.delete(api.medications.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteMedication(Number(req.params.id));
    res.status(204).end();
  });
  
  // Medication Logs
  app.post(api.medications.log.create.path, isAuthenticated, async (req, res) => {
     try {
      const input = api.medications.log.create.input.parse({ 
        ...req.body, 
        medicationId: Number(req.params.id) 
      });
      const log = await storage.createMedicationLog(input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });
  
  app.get(api.medications.log.list.path, isAuthenticated, async (req, res) => {
    const logs = await storage.getMedicationLogs(getUserId(req));
    res.json(logs);
  });


  // --- SYMPTOMS ---
  app.get(api.symptoms.list.path, isAuthenticated, async (req, res) => {
    const logs = await storage.getSymptomLogs(getUserId(req));
    res.json(logs);
  });
  app.post(api.symptoms.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.symptoms.create.input.parse({ ...req.body, userId: getUserId(req) });
      const log = await storage.createSymptomLog(input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });

  // --- CHAT ---
  app.get(api.chat.list.path, isAuthenticated, async (req, res) => {
    const messages = await storage.getChatMessages();
    res.json(messages);
  });
  app.post(api.chat.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.chat.create.input.parse({ 
        ...req.body, 
        userId: getUserId(req),
        userName: getUserName(req)
      });
      const msg = await storage.createChatMessage(input);
      res.status(201).json(msg);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });

  // --- AI CHAT ---
  const aiChatSchema = z.object({
    message: z.string().optional().default(''),
    fileContent: z.string().optional(),
    fileName: z.string().optional()
  });

  // Get AI chat history
  app.get('/api/ai-chat/history', isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getAiChatMessages(getUserId(req));
      res.json(messages);
    } catch (err: any) {
      console.error('AI Chat history error:', err);
      res.status(500).json({ message: 'Failed to get chat history', error: err.message });
    }
  });

  // Send message and get AI response (persists both user message and AI response)
  app.post('/api/ai-chat', isAuthenticated, async (req, res) => {
    try {
      const parsed = aiChatSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { message, fileContent, fileName } = parsed.data;
      
      // Require either a message or file content
      if (!message && !fileContent) {
        return res.status(400).json({ message: 'Message or file content is required' });
      }
      
      const userId = getUserId(req);

      // Get existing history BEFORE saving new message (for context to OpenAI)
      const existingHistory = await storage.getAiChatMessages(userId);
      const recentHistory = existingHistory.slice(-20).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

      // Build user message for storage (includes file reference)
      let storedMessage = message;
      if (fileName) {
        storedMessage = message 
          ? `[Attached: ${fileName}]\n\n${message}` 
          : `[Attached: ${fileName}]`;
      }

      // Save user message
      await storage.createAiChatMessage({
        userId,
        role: 'user',
        content: storedMessage
      });

      // Get AI response with recent history context (includes prior assistant replies)
      const aiResult = await getChatResponse(message, recentHistory, fileContent, fileName);

      // Save AI response with source info
      await storage.createAiChatMessage({
        userId,
        role: 'assistant',
        content: aiResult.response,
        responseSource: aiResult.responseSource,
        sources: JSON.stringify(aiResult.sources)
      });

      res.json({ 
        response: aiResult.response,
        usedExpertKnowledge: aiResult.usedExpertKnowledge,
        responseSource: aiResult.responseSource,
        sources: aiResult.sources
      });
    } catch (err: any) {
      console.error('AI Chat error:', err);
      res.status(500).json({ message: 'Failed to get AI response', error: err.message });
    }
  });

  // Clear AI chat history
  app.delete('/api/ai-chat/history', isAuthenticated, async (req, res) => {
    try {
      await storage.clearAiChatHistory(getUserId(req));
      res.status(204).end();
    } catch (err: any) {
      console.error('AI Chat clear error:', err);
      res.status(500).json({ message: 'Failed to clear chat history', error: err.message });
    }
  });

  // --- ADMIN KNOWLEDGE BASE ---
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  const isAdmin = (req: any, res: any, next: any) => {
    const providedPassword = req.headers['x-admin-password'];
    if (!adminPassword || providedPassword !== adminPassword) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

  // Verify admin password
  app.post('/api/admin/verify', (req, res) => {
    const { password } = req.body;
    if (!adminPassword || password !== adminPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    res.json({ success: true });
  });

  // Extract text from uploaded document (PDF/Word)
  app.post('/api/admin/knowledge/extract-document', isAdmin, async (req, res) => {
    try {
      const contentType = req.headers['content-type'] || '';
      const fileName = (req.headers['x-file-name'] as string) || '';
      
      // Get raw body data
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      
      if (buffer.length === 0) {
        return res.status(400).json({ message: 'No file data received' });
      }
      
      let extractedText = '';
      
      if (fileName.endsWith('.pdf') || contentType.includes('pdf')) {
        // Extract from PDF using pdf-parse v2
        const { PDFParse } = await import('pdf-parse');
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        extractedText = result.text || '';
      } else if (fileName.endsWith('.docx') || contentType.includes('word') || contentType.includes('openxmlformats')) {
        // Extract from Word document
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } else if (fileName.endsWith('.doc')) {
        return res.status(400).json({ message: 'Old .doc format not supported. Please convert to .docx or PDF.' });
      } else {
        return res.status(400).json({ message: 'Unsupported file type. Please upload a PDF or Word (.docx) file.' });
      }
      
      if (!extractedText || extractedText.trim().length < 10) {
        return res.status(400).json({ message: 'Could not extract text from document. The file may be empty or image-based.' });
      }
      
      res.json({ text: extractedText.trim() });
    } catch (err: any) {
      console.error('Document extraction error:', err);
      res.status(400).json({ message: err.message || 'Failed to extract text from document' });
    }
  });

  // AI-generate knowledge draft with streaming progress
  app.post('/api/admin/knowledge/ai-draft', isAdmin, async (req, res) => {
    try {
      const { rawContent, sourceUrl } = req.body;
      if (!rawContent || rawContent.trim().length < 10) {
        return res.status(400).json({ message: 'Please provide at least 10 characters of content' });
      }
      const { generateKnowledgeDraft } = await import('./openai');
      const draft = await generateKnowledgeDraft(rawContent, sourceUrl);
      res.json(draft);
    } catch (err: any) {
      console.error('AI Draft error:', err);
      res.status(400).json({ message: err.message || 'Failed to generate draft' });
    }
  });

  // AI-generate knowledge draft with SSE streaming progress
  app.post('/api/admin/knowledge/ai-draft-stream', isAdmin, async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendProgress = (step: string, percent: number) => {
      res.write(`data: ${JSON.stringify({ type: 'progress', step, percent })}\n\n`);
    };

    try {
      const { rawContent, sourceUrl } = req.body;
      console.log('AI Draft stream request received, content length:', rawContent?.length);
      
      if (!rawContent || rawContent.trim().length < 10) {
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Please provide at least 10 characters of content' })}\n\n`);
        return res.end();
      }

      sendProgress('Analyzing content...', 10);
      
      // Clean up URL - remove trailing backslashes and whitespace
      let contentToProcess = rawContent.trim().replace(/\\+$/, '').replace(/%5C+$/gi, '');
      let detectedSourceUrl = sourceUrl || '';
      
      console.log('Processing content:', contentToProcess.slice(0, 100));
      
      // Check for YouTube URL or regular URL
      const isYouTubeUrl = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/.test(contentToProcess);
      const isJustUrl = /^https?:\/\/[^\s]+$/i.test(contentToProcess);

      if (isYouTubeUrl) {
        sendProgress('Fetching YouTube transcript...', 20);
        detectedSourceUrl = contentToProcess;
        try {
          const { fetchYouTubeTranscript } = await import('./openai');
          contentToProcess = await fetchYouTubeTranscript(contentToProcess);
          sendProgress('Transcript fetched successfully', 40);
        } catch {
          sendProgress('Transcript unavailable, using AI knowledge...', 40);
          contentToProcess = `YouTube video URL: ${contentToProcess}\n\nNote: Transcript not available.`;
        }
      } else if (isJustUrl) {
        sendProgress('Fetching webpage content...', 20);
        detectedSourceUrl = contentToProcess;
        try {
          const { fetchWebpageContent } = await import('./openai');
          contentToProcess = await fetchWebpageContent(contentToProcess);
          sendProgress('Content extracted from webpage', 40);
        } catch (err: any) {
          throw new Error(`Could not fetch content from URL: ${err.message}. Try pasting the article text directly.`);
        }
      } else {
        sendProgress('Preparing content for AI...', 30);
      }

      sendProgress('Generating knowledge entry with AI...', 50);
      
      const { generateKnowledgeDraft } = await import('./openai');
      const draft = await generateKnowledgeDraft(contentToProcess, detectedSourceUrl);
      
      sendProgress('Finalizing draft...', 90);
      
      res.write(`data: ${JSON.stringify({ type: 'complete', draft })}\n\n`);
      res.end();
    } catch (err: any) {
      console.error('AI Draft stream error:', err);
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message || 'Failed to generate draft' })}\n\n`);
      res.end();
    }
  });

  // Get all knowledge entries
  app.get('/api/admin/knowledge', isAdmin, async (req, res) => {
    try {
      const entries = await storage.getKnowledgeEntries();
      res.json(entries);
    } catch (err: any) {
      res.status(500).json({ message: 'Failed to get entries', error: err.message });
    }
  });

  // Create knowledge entry
  app.post('/api/admin/knowledge', isAdmin, async (req, res) => {
    try {
      const { expert, source, sourceUrl, category, title, content, keywords } = req.body;
      const keywordsArray = Array.isArray(keywords) ? keywords : keywords.split(',').map((k: string) => k.trim());
      const entry = await storage.createKnowledgeEntry({
        expert,
        source,
        sourceUrl: sourceUrl || null,
        category,
        title,
        content,
        keywords: keywordsArray
      });
      
      generateAndStoreEmbedding(entry.id, { title, content, keywords: keywordsArray, expert, category })
        .catch(err => console.error('Failed to generate embedding:', err));
      
      res.status(201).json(entry);
    } catch (err: any) {
      res.status(500).json({ message: 'Failed to create entry', error: err.message });
    }
  });

  // Update knowledge entry
  app.patch('/api/admin/knowledge/:id', isAdmin, async (req, res) => {
    try {
      const { keywords, ...rest } = req.body;
      const updates: any = { ...rest };
      if (keywords !== undefined) {
        updates.keywords = Array.isArray(keywords) ? keywords : keywords.split(',').map((k: string) => k.trim());
      }
      const entry = await storage.updateKnowledgeEntry(Number(req.params.id), updates);
      
      generateAndStoreEmbedding(entry.id, entry)
        .catch(err => console.error('Failed to generate embedding:', err));
      
      res.json(entry);
    } catch (err: any) {
      res.status(500).json({ message: 'Failed to update entry', error: err.message });
    }
  });

  // Delete knowledge entry
  app.delete('/api/admin/knowledge/:id', isAdmin, async (req, res) => {
    try {
      await storage.deleteKnowledgeEntry(Number(req.params.id));
      res.status(204).end();
    } catch (err: any) {
      res.status(500).json({ message: 'Failed to delete entry', error: err.message });
    }
  });

  // Downloadable HTML export for AI reading
  app.get('/export/app.html', async (req, res) => {
    try {
      const knowledgeEntries = await storage.getKnowledgeEntries();
      
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SchizoStream - Mental Health Crisis Navigation Platform</title>
  <meta name="description" content="A 501(c)(3) non-profit mental health crisis navigation app for families facing schizophrenia and schizoaffective disorder.">
</head>
<body>
  <header>
    <h1>SchizoStream</h1>
    <nav>
      <ul>
        <li><a href="/">Dashboard</a></li>
        <li><a href="/vault">The Vault</a></li>
        <li><a href="/navigator">Navigator</a></li>
        <li><a href="/care-team">Care Team</a></li>
        <li><a href="/data-logger">Data Logger</a></li>
        <li><a href="/chat">AI Crisis Chat</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section id="overview">
      <h2>Overview</h2>
      <p>SchizoStream is a 501(c)(3) non-profit mental health crisis navigation app designed to support families dealing with sudden-onset serious mental illness, particularly schizophrenia and schizoaffective disorder. The app provides hope-centered messaging emphasizing recovery, evidence-based education, and comprehensive HIPAA-compliant support tools.</p>
    </section>

    <section id="dashboard">
      <h2>Dashboard</h2>
      <p>The central hub showing a timeline of events, quick stats, and navigation to all features. Displays recent medical events, life milestones, and family coordination tasks.</p>
    </section>

    <section id="vault">
      <h2>The Vault</h2>
      <p>Secure document storage for medical records, legal documents, and emergency packets. AI-powered document analysis automatically suggests titles and descriptions when uploading PDF or Word files. Documents can be marked as "Emergency" for quick access during crisis situations.</p>
      <ul>
        <li>Upload and store medical records securely</li>
        <li>AI-powered automatic title and description suggestions</li>
        <li>Mark critical documents as Emergency for quick access</li>
        <li>Organize legal, medical, and insurance documents</li>
      </ul>
    </section>

    <section id="navigator">
      <h2>Navigator</h2>
      <p>Evidence-based guides and resources for navigating the mental health system.</p>
      <ul>
        <li>Treatment options (especially Clozapine as gold standard for treatment-resistant schizophrenia)</li>
        <li>Legal resources (5150 holds, conservatorship, patient rights)</li>
        <li>Insurance advocacy scripts and appeals guidance</li>
        <li>Hospital discharge planning</li>
        <li>HIPAA authorization forms</li>
      </ul>
    </section>

    <section id="care-team">
      <h2>Care Team</h2>
      <p>Family coordination tools for managing care responsibilities.</p>
      <ul>
        <li>Task management with assignments and due dates</li>
        <li>Family communication chat</li>
        <li>Shared calendar for appointments</li>
        <li>Care team contact management</li>
      </ul>
    </section>

    <section id="data-logger">
      <h2>Data Logger</h2>
      <p>Comprehensive tracking system for monitoring health patterns.</p>
      <ul>
        <li>Medication compliance logging</li>
        <li>Symptom monitoring with severity ratings</li>
        <li>Mood and behavior pattern visualization</li>
        <li>Charts and trends over time</li>
      </ul>
    </section>

    <section id="chat">
      <h2>AI Crisis Chat</h2>
      <p>OpenAI-powered support assistant providing compassionate guidance.</p>
      <ul>
        <li>Hope-focused guidance during difficult moments</li>
        <li>Evidence-based information from curated knowledge base</li>
        <li>Real-time web search for current resources</li>
        <li>Compassionate, non-judgmental responses</li>
      </ul>
    </section>

    <section id="knowledge-base">
      <h2>Knowledge Base</h2>
      ${knowledgeEntries.map(entry => `
      <article>
        <h3>${entry.title}</h3>
        <p><strong>Category:</strong> ${entry.category}</p>
        <p>${entry.content}</p>
      </article>`).join('\n')}
    </section>

    <section id="key-messages">
      <h2>Key Messages</h2>
      <ol>
        <li>Recovery is possible - many people with schizophrenia lead fulfilling lives</li>
        <li>Early intervention and consistent treatment improve outcomes</li>
        <li>Clozapine is the most effective medication for treatment-resistant cases</li>
        <li>Family support and education are crucial components of care</li>
        <li>You are not alone - resources and community support exist</li>
      </ol>
    </section>
  </main>

  <footer>
    <p>SchizoStream - A 501(c)(3) Non-Profit Organization</p>
    <p>Website: <a href="https://schizostream.com">https://schizostream.com</a></p>
  </footer>
</body>
</html>`;

      res.header('Content-Type', 'text/html; charset=utf-8');
      res.header('Content-Disposition', 'attachment; filename="schizostream-app.html"');
      res.send(html);
    } catch (err: any) {
      res.status(500).json({ message: 'Failed to generate HTML export', error: err.message });
    }
  });

  // Downloadable content export for AI reading
  app.get('/export/content.txt', async (req, res) => {
    try {
      // Get all knowledge base entries
      const knowledgeEntries = await storage.getKnowledgeEntries();
      
      const content = `# SchizoStream - Mental Health Crisis Navigation Platform
      
## Overview
SchizoStream is a 501(c)(3) non-profit mental health crisis navigation app designed to support families dealing with sudden-onset serious mental illness, particularly schizophrenia and schizoaffective disorder. The app provides hope-centered messaging emphasizing recovery, evidence-based education, and comprehensive HIPAA-compliant support tools.

## Main Features

### Dashboard (Home)
The central hub showing a timeline of events, quick stats, and navigation to all features. Displays recent medical events, life milestones, and family coordination tasks.

### The Vault
Secure document storage for medical records, legal documents, and emergency packets. AI-powered document analysis automatically suggests titles and descriptions when uploading PDF or Word files. Documents can be marked as "Emergency" for quick access during crisis situations.

### Navigator
Evidence-based guides and resources including:
- Treatment options (especially Clozapine as gold standard for treatment-resistant schizophrenia)
- Legal resources (5150 holds, conservatorship, patient rights)
- Insurance advocacy scripts and appeals guidance
- Hospital discharge planning
- HIPAA authorization forms

### Care Team
Family coordination tools including:
- Task management with assignments and due dates
- Family communication chat
- Shared calendar for appointments
- Care team contact management

### Data Logger
Comprehensive tracking system for:
- Medication compliance logging
- Symptom monitoring with severity ratings
- Mood and behavior pattern visualization
- Charts and trends over time

### AI Crisis Chat
OpenAI-powered support assistant providing:
- Hope-focused guidance during difficult moments
- Evidence-based information from curated knowledge base
- Real-time web search for current resources
- Compassionate, non-judgmental responses

## Knowledge Base Content

${knowledgeEntries.map(entry => `### ${entry.title}
Category: ${entry.category}
${entry.content}
`).join('\n')}

## Key Messages
1. Recovery is possible - many people with schizophrenia lead fulfilling lives
2. Early intervention and consistent treatment improve outcomes
3. Clozapine is the most effective medication for treatment-resistant cases
4. Family support and education are crucial components of care
5. You are not alone - resources and community support exist

## Contact
Website: https://schizostream.com
`;

      res.header('Content-Type', 'text/plain; charset=utf-8');
      res.header('Content-Disposition', 'attachment; filename="schizostream-content.txt"');
      res.send(content);
    } catch (err: any) {
      res.status(500).json({ message: 'Failed to generate export', error: err.message });
    }
  });

  // Robots.txt for SEO
  app.get('/robots.txt', (req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin

Sitemap: https://schizostream.com/sitemap.xml`;
    res.header('Content-Type', 'text/plain');
    res.send(robots);
  });

  // Sitemap.xml for SEO
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = 'https://schizostream.com';
    const pages = [
      { path: '/', priority: '1.0', changefreq: 'weekly' },
      { path: '/vault', priority: '0.8', changefreq: 'weekly' },
      { path: '/navigator', priority: '0.9', changefreq: 'monthly' },
      { path: '/care-team', priority: '0.8', changefreq: 'weekly' },
      { path: '/data-logger', priority: '0.8', changefreq: 'daily' },
      { path: '/chat', priority: '0.9', changefreq: 'weekly' },
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  return httpServer;
}
