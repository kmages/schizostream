import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// Import auth models to ensure they are included in schema
export * from "./models/auth";

// === TABLE DEFINITIONS ===

// Documents (The Vault)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Links to auth users
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // 'pdf', 'image', etc.
  isEmergency: boolean("is_emergency").default(false), // e.g. for "The First 48 Hours" packet
  createdAt: timestamp("created_at").defaultNow(),
});

// Timeline Events (History)
export const timelineEvents = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'medical', 'legal', 'life_event'
  createdAt: timestamp("created_at").defaultNow(),
});

// Tasks (Care Team)
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: text("assigned_to"), // Simple text for MVP, could be user ID later
  isComplete: boolean("is_complete").default(false),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medications (Data Logger)
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(), // e.g. "Morning", "Twice daily"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medication Logs (Compliance)
export const medicationLogs = pgTable("medication_logs", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").notNull(), // References medications.id
  takenAt: timestamp("taken_at").defaultNow(),
  status: text("status").notNull(), // 'taken', 'skipped'
  notes: text("notes"),
});

// Symptom Logs (Mood/Side Effects)
export const symptomLogs = pgTable("symptom_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // 'mood', 'side_effect', 'symptom'
  severity: integer("severity").notNull(), // 1-10
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Messages (Family Chat)
// For MVP, simple table. Real-time via polling or simple refresh.
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(), // Cache name for display
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Chat Messages (Crisis Support AI)
// Stores persistent AI conversation history per user
export const aiChatMessages = pgTable("ai_chat_messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  responseSource: text("response_source"), // 'knowledge_base' or 'general_ai' (for assistant messages)
  sources: text("sources"), // JSON string of source info (for assistant messages)
  createdAt: timestamp("created_at").defaultNow(),
});

// Knowledge Base Entries (RAG Corpus for AI)
export const knowledgeEntries = pgTable("knowledge_entries", {
  id: serial("id").primaryKey(),
  expert: text("expert").notNull(),
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  category: text("category").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  keywords: text("keywords").array().notNull(),
  embedding: text("embedding"), // JSON string of float array for semantic search
  createdAt: timestamp("created_at").defaultNow(),
});


// === BASE SCHEMAS ===
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export const insertTimelineEventSchema = createInsertSchema(timelineEvents).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertMedicationSchema = createInsertSchema(medications).omit({ id: true, createdAt: true });
export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({ id: true, takenAt: true });
export const insertSymptomLogSchema = createInsertSchema(symptomLogs).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertAiChatMessageSchema = createInsertSchema(aiChatMessages).omit({ id: true, createdAt: true });
export const insertKnowledgeEntrySchema = createInsertSchema(knowledgeEntries).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

// Documents
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type CreateDocumentRequest = InsertDocument;
export type UpdateDocumentRequest = Partial<InsertDocument>;

// Timeline
export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type CreateTimelineEventRequest = InsertTimelineEvent;

// Tasks
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type CreateTaskRequest = InsertTask;
export type UpdateTaskRequest = Partial<InsertTask>;

// Medications
export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type CreateMedicationRequest = InsertMedication;
export type UpdateMedicationRequest = Partial<InsertMedication>;

export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;
export type CreateMedicationLogRequest = InsertMedicationLog;

// Symptoms
export type SymptomLog = typeof symptomLogs.$inferSelect;
export type InsertSymptomLog = z.infer<typeof insertSymptomLogSchema>;
export type CreateSymptomLogRequest = InsertSymptomLog;

// Chat
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type CreateChatMessageRequest = InsertChatMessage;

// AI Chat
export type AiChatMessage = typeof aiChatMessages.$inferSelect;
export type InsertAiChatMessage = z.infer<typeof insertAiChatMessageSchema>;
export type CreateAiChatMessageRequest = InsertAiChatMessage;

// Knowledge Base
export type KnowledgeEntry = typeof knowledgeEntries.$inferSelect;
export type InsertKnowledgeEntry = z.infer<typeof insertKnowledgeEntrySchema>;
export type CreateKnowledgeEntryRequest = InsertKnowledgeEntry;
export type UpdateKnowledgeEntryRequest = Partial<InsertKnowledgeEntry>;

