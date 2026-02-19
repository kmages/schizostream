import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatKnowledgeForPrompt, seedKnowledgeBase } from "./knowledgeBase";
import { storage } from "./storage";
import { semanticSearchWithScores, ensureAllEmbeddings } from "./embeddings";
import type { KnowledgeEntry } from "@shared/schema";
import { YoutubeTranscript } from "youtube-transcript";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function fetchYouTubeTranscript(videoIdOrUrl: string): Promise<string> {
  const videoId = extractYouTubeVideoId(videoIdOrUrl);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }
  
  const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
  if (!transcriptItems || transcriptItems.length === 0) {
    throw new Error('No transcript available for this video. The video may not have captions enabled.');
  }
  
  return transcriptItems.map(item => item.text).join(' ');
}

async function fetchYouTubeMetadata(videoIdOrUrl: string): Promise<{ title: string; description: string; channelTitle: string } | null> {
  const videoId = extractYouTubeVideoId(videoIdOrUrl);
  if (!videoId) return null;
  
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.log('No Google API key available for YouTube metadata');
    return null;
  }
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    );
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const snippet = data.items[0].snippet;
      return {
        title: snippet.title || '',
        description: snippet.description || '',
        channelTitle: snippet.channelTitle || ''
      };
    }
  } catch (err) {
    console.log('Failed to fetch YouTube metadata:', err);
  }
  return null;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let knowledgeSeeded = false;
let embeddingsGenerated = false;

const SYSTEM_PROMPT = `You are a compassionate mental health crisis support assistant for families navigating serious mental illness, particularly schizophrenia and schizoaffective disorder.

INFORMATION SOURCES:
1. PRIMARY: The EXPERT KNOWLEDGE BASE content provided below - always prioritize and cite this when relevant
2. SUPPLEMENTARY: Your general knowledge - use this for topics not covered in the knowledge base

GUIDELINES:
- When knowledge base content is relevant, cite the expert name and source
- When the knowledge base doesn't cover a specific request (like TED talks, specific books, videos), you MAY provide recommendations from your general knowledge
- Be clear about the source: "From our expert knowledge base..." vs "From general resources..."
- Never claim a knowledge base expert said something unless it's actually in the provided content
- Prioritize hope-centered, recovery-focused information

Your role is to:
- Provide hope and reassurance that recovery IS possible with proper treatment
- Share expert knowledge base content when available, supplemented by general knowledge when needed
- Help families understand their options and navigate the healthcare system
- Offer practical guidance on topics like HIPAA, insurance advocacy, and crisis communication
- Never replace professional medical advice - always encourage working with healthcare providers

Be warm, supportive, and practical. Acknowledge the family's pain while providing concrete next steps.`;

export interface ChatResponse {
  response: string;
  usedExpertKnowledge: boolean;
  responseSource: 'knowledge_base' | 'general_ai';
  sources: Array<{
    expert: string;
    source: string;
    sourceUrl?: string;
  }>;
}

export interface KnowledgeDraft {
  expert: string;
  source: string;
  sourceUrl: string;
  category: string;
  title: string;
  content: string;
  keywords: string;
}

export async function fetchWebpageContent(url: string): Promise<string> {
  console.log('Fetching webpage content from:', url);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SchizoStreamBot/1.0)',
      'Accept': 'text/html,application/xhtml+xml'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch webpage: ${response.status}`);
  }
  
  const html = await response.text();
  
  // Extract text content from HTML
  let text = html
    // Remove scripts and styles
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
  
  // Limit to reasonable size
  if (text.length > 15000) {
    text = text.slice(0, 15000) + '...';
  }
  
  return text;
}

export async function generateKnowledgeDraft(rawContent: string, sourceUrl?: string): Promise<KnowledgeDraft> {
  let contentToProcess = rawContent.trim();
  let detectedSourceUrl = sourceUrl || '';
  
  const isYouTubeUrl = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/.test(contentToProcess);
  const isJustUrl = /^https?:\/\/[^\s]+$/i.test(contentToProcess);
  
  if (isYouTubeUrl) {
    console.log('Detected YouTube URL, fetching transcript...');
    detectedSourceUrl = contentToProcess;
    try {
      contentToProcess = await fetchYouTubeTranscript(contentToProcess);
      console.log('Transcript fetched successfully, length:', contentToProcess.length);
      if (contentToProcess.length < 100) {
        throw new Error('Transcript too short - video may not have proper captions');
      }
    } catch (err: any) {
      console.log('Transcript fetch failed, trying YouTube metadata fallback:', err.message);
      
      // Try to get video metadata as fallback
      const metadata = await fetchYouTubeMetadata(detectedSourceUrl);
      if (metadata && (metadata.description.length > 50 || metadata.title)) {
        console.log('Using YouTube metadata as fallback');
        contentToProcess = `YouTube Video Title: ${metadata.title}\n\nChannel: ${metadata.channelTitle}\n\nVideo Description:\n${metadata.description}\n\nNote: Transcript was not available. Generate content based on the video title and description above.`;
      } else {
        // Prompt user to paste content manually
        console.log('Metadata also unavailable, requesting manual input');
        throw new Error(`MANUAL_INPUT_NEEDED:${detectedSourceUrl}`);
      }
    }
  } else if (isJustUrl) {
    console.log('Detected URL, fetching webpage content...');
    detectedSourceUrl = contentToProcess;
    try {
      contentToProcess = await fetchWebpageContent(contentToProcess);
      console.log('Webpage content fetched, length:', contentToProcess.length);
    } catch (err: any) {
      console.log('Webpage fetch failed:', err.message);
      throw new Error(`Could not fetch content from URL: ${err.message}. Try pasting the article text directly.`);
    }
  } else if (contentToProcess.length < 50) {
    throw new Error('Please provide more content. Paste at least a paragraph of text from the article or research.');
  }

  const prompt = `You are a knowledge base curator for a mental health crisis support platform focused on schizophrenia and schizoaffective disorder.

Given the following raw content (article, research summary, or notes), extract and structure it into a knowledge base entry.

Raw Content:
${contentToProcess}

${detectedSourceUrl ? `Source URL: ${detectedSourceUrl}` : ''}

Generate a structured knowledge base entry in JSON format with these fields:
- expert: The primary expert/author name (e.g., "Dr. Robert Laitman", "Dr. Xavier Amador"). If unclear, use "Clinical Consensus" or identify from the content.
- source: The organization or publication (e.g., "Team Daniel", "Yale Medicine", "NAMI")
- sourceUrl: The URL if provided, otherwise empty string
- category: One of: clozapine, anosognosia, cannabis, recovery, early-intervention, symptoms, treatment, advocacy, family-support, legal, hipaa
- title: A concise, descriptive title (max 60 chars)
- content: The key information rewritten clearly for families (200-400 words). Focus on practical takeaways, statistics, and hope-centered messaging.
- keywords: Comma-separated keywords for semantic search (5-10 keywords)

Respond ONLY with valid JSON, no markdown or explanation.`;

  let text = '{}';
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    text = result.response.text() || '{}';
    console.log('AI Draft (Gemini) raw response:', text.slice(0, 200));
  } catch (geminiError: any) {
    console.log('Gemini error, falling back to OpenAI:', geminiError.message || geminiError.status);
    const openAiResponse = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    text = openAiResponse.choices[0].message.content || '{}';
    console.log('AI Draft (OpenAI) raw response:', text.slice(0, 200));
  }
  
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    if (!parsed.title || !parsed.content) {
      throw new Error('AI response missing required fields');
    }
    
    return {
      expert: parsed.expert || 'Clinical Consensus',
      source: parsed.source || 'Research',
      sourceUrl: parsed.sourceUrl || detectedSourceUrl || '',
      category: parsed.category || 'treatment',
      title: parsed.title || '',
      content: parsed.content || '',
      keywords: parsed.keywords || ''
    };
  } catch (parseErr) {
    console.error('Failed to parse AI response:', parseErr, 'Raw text:', text);
    throw new Error('Failed to parse AI response. Please try again with different content.');
  }
}

const WEB_SEARCH_SYSTEM_PROMPT = `You are a helpful assistant for families navigating mental health crises. You are responding from general AI knowledge (not from our curated expert knowledge base).

Your role is to:
- Provide helpful, accurate information based on your general knowledge
- Recommend specific resources like TED talks, books, videos, and experts when asked
- Be specific with names and details - users are asking because they want concrete recommendations
- Maintain a supportive, hope-centered tone appropriate for families in crisis
- Always encourage verification with official sources for critical medical decisions
- Never replace professional medical advice

When recommending resources:
- Share well-known, reputable TED talks, books, and experts in the mental health field
- Be specific - users want actual names and titles they can search for
- Focus on hope-centered, recovery-oriented content
- Prioritize evidence-based information about treatments like Clozapine when relevant`;

const CONFIDENCE_THRESHOLD = 0.35;

export async function getChatResponse(
  userMessage: string, 
  conversationHistory: { role: 'user' | 'assistant', content: string }[],
  fileContent?: string,
  fileName?: string
): Promise<ChatResponse> {
  let relevantKnowledge: KnowledgeEntry[] = [];
  let usedExpertKnowledge = false;
  let responseSource: 'knowledge_base' | 'general_ai' = 'knowledge_base';
  let highestSimilarity = 0;
  
  // Build the effective message that includes file content if provided
  let effectiveMessage = userMessage || '';
  if (fileContent) {
    const truncatedContent = fileContent.length > 15000 
      ? fileContent.substring(0, 15000) + '\n\n[Document truncated due to length...]' 
      : fileContent;
    
    if (userMessage) {
      effectiveMessage = `The user has attached a document${fileName ? ` named "${fileName}"` : ''} with the following content:\n\n---\n${truncatedContent}\n---\n\nUser's question: ${userMessage}`;
    } else {
      effectiveMessage = `The user has attached a document${fileName ? ` named "${fileName}"` : ''} for analysis. Please review and provide a helpful summary or insights about this document:\n\n---\n${truncatedContent}\n---`;
    }
    console.log(`Processing attached file: ${fileName || 'unnamed'} (${fileContent.length} chars)`);
  }
  
  try {
    if (!knowledgeSeeded) {
      await seedKnowledgeBase();
      knowledgeSeeded = true;
    }
    
    if (!embeddingsGenerated) {
      await ensureAllEmbeddings();
      embeddingsGenerated = true;
    }
    
    const allEntries = await storage.getKnowledgeEntries();
    console.log(`Knowledge base has ${allEntries.length} entries, ${allEntries.filter(e => e.embedding).length} with embeddings`);
    
    // For file attachments, search using original user message if available, otherwise use a generic query
    const searchQuery = userMessage || (fileContent ? 'document analysis medical records' : '');
    const searchResults = await semanticSearchWithScores(searchQuery, allEntries, 3);
    console.log(`Search results for "${searchQuery.substring(0, 50)}...": ${searchResults.length} results`);
    
    if (searchResults.length > 0) {
      highestSimilarity = searchResults[0].similarity;
      // Only include entries that are above the confidence threshold
      const relevantResults = searchResults.filter(r => r.similarity >= CONFIDENCE_THRESHOLD);
      relevantKnowledge = relevantResults.map(r => r.entry);
      console.log(`Top matches: ${searchResults.map(r => `${r.entry.title}: ${r.similarity.toFixed(3)}`).join(', ')}`);
      console.log(`Entries above threshold: ${relevantResults.length}`);
    }
    
    usedExpertKnowledge = highestSimilarity >= CONFIDENCE_THRESHOLD;
    console.log(`Decision: similarity ${highestSimilarity.toFixed(3)} vs threshold ${CONFIDENCE_THRESHOLD} => ${usedExpertKnowledge ? 'KB' : 'Web'}`);
  } catch (err) {
    console.error('Knowledge search error (continuing without):', err);
  }
  
  let systemPrompt: string;
  let sources: Array<{ expert: string; source: string; sourceUrl?: string }> = [];
  
  let responseText: string;
  
  if (usedExpertKnowledge && relevantKnowledge.length > 0) {
    const knowledgeContext = formatKnowledgeForPrompt(relevantKnowledge);
    systemPrompt = SYSTEM_PROMPT + knowledgeContext;
    responseSource = 'knowledge_base';
    // Deduplicate sources by expert+source combination
    const seenSources = new Set<string>();
    sources = relevantKnowledge
      .map(entry => ({
        expert: entry.expert,
        source: entry.source,
        sourceUrl: entry.sourceUrl || undefined
      }))
      .filter(s => {
        const key = `${s.expert}|${s.source}`;
        if (seenSources.has(key)) return false;
        seenSources.add(key);
        return true;
      });
    console.log(`Using Gemini with knowledge base (similarity: ${highestSimilarity.toFixed(3)})`);
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview",
        systemInstruction: systemPrompt
      });
      
      const chatHistory = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user' as const,
        parts: [{ text: msg.content }]
      }));
      
      const chat = model.startChat({ history: chatHistory });
      const result = await chat.sendMessage(effectiveMessage);
      
      responseText = result.response.text() || "I'm sorry, I couldn't generate a response. Please try again.";
    } catch (geminiError: any) {
      console.log('Gemini error, falling back to OpenAI for chat:', geminiError.message || geminiError.status);
      const openAiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory.map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content })),
        { role: 'user' as const, content: effectiveMessage }
      ];
      const openAiResponse = await openai.chat.completions.create({
        model: "gpt-5",
        messages: openAiMessages,
      });
      responseText = openAiResponse.choices[0].message.content || "I'm sorry, I couldn't generate a response. Please try again.";
    }
  } else {
    responseSource = 'general_ai';
    console.log(`Using Gemini general AI (similarity: ${highestSimilarity.toFixed(3)} < ${CONFIDENCE_THRESHOLD})`);
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview",
        systemInstruction: WEB_SEARCH_SYSTEM_PROMPT
      });
      
      const chatHistory = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user' as const,
        parts: [{ text: msg.content }]
      }));
      
      const chat = model.startChat({ history: chatHistory });
      const result = await chat.sendMessage(effectiveMessage);
      console.log('Gemini response completed successfully');
      
      responseText = result.response.text() || "I'm sorry, I couldn't generate a response. Please try again.";
    } catch (geminiError: any) {
      console.log('Gemini error, falling back to OpenAI for chat:', geminiError.message || geminiError.status);
      const openAiMessages = [
        { role: 'system' as const, content: WEB_SEARCH_SYSTEM_PROMPT },
        ...conversationHistory.map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content })),
        { role: 'user' as const, content: effectiveMessage }
      ];
      const openAiResponse = await openai.chat.completions.create({
        model: "gpt-5",
        messages: openAiMessages,
      });
      responseText = openAiResponse.choices[0].message.content || "I'm sorry, I couldn't generate a response. Please try again.";
    }
  }

  return {
    response: responseText,
    usedExpertKnowledge,
    responseSource,
    sources
  };
}

export interface DocumentAnalysis {
  title: string;
  description: string;
  isEmergency: boolean;
  confidence: number;
}

export async function analyzeDocumentContent(content: string, filename?: string): Promise<DocumentAnalysis> {
  const prompt = `You are analyzing a document uploaded to a mental health crisis support platform for families dealing with schizophrenia and schizoaffective disorder.

The platform's "Vault" stores important documents like:
- Medical records, prescriptions, treatment plans
- HIPAA waivers and authorization forms
- Court orders, guardianship documents, POA
- Insurance cards and EOB statements
- Emergency contact sheets
- Hospital discharge summaries

Analyze this document content and determine:
1. An appropriate title (concise, max 60 chars)
2. A helpful description (1-2 sentences explaining what this document is)
3. Whether this is an "emergency" document (documents that would be critical in a crisis: court orders, psychiatric holds, emergency contacts, medication lists, treatment authorizations)
4. Your confidence level (0-1)

${filename ? `Original filename: ${filename}` : ''}

Document content (first 3000 chars):
${content.slice(0, 3000)}

Respond ONLY with valid JSON:
{
  "title": "...",
  "description": "...",
  "isEmergency": true/false,
  "confidence": 0.0-1.0
}`;

  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  const result = await model.generateContent(prompt);
  const text = result.response.text() || '{}';
  console.log('Document analysis response:', text.slice(0, 200));
  
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      title: parsed.title || 'Untitled Document',
      description: parsed.description || '',
      isEmergency: Boolean(parsed.isEmergency),
      confidence: parseFloat(parsed.confidence) || 0.5
    };
  } catch (err) {
    console.error('Failed to parse document analysis:', err);
    return {
      title: filename?.replace(/\.[^.]+$/, '') || 'Untitled Document',
      description: '',
      isEmergency: false,
      confidence: 0
    };
  }
}
