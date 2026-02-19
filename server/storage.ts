import { db } from "./db";
import { eq, desc, asc, lt, and } from "drizzle-orm";
import {
  documents, timelineEvents, tasks, medications, medicationLogs, symptomLogs, chatMessages, aiChatMessages, knowledgeEntries,
  type Document, type CreateDocumentRequest,
  type TimelineEvent, type CreateTimelineEventRequest,
  type Task, type CreateTaskRequest, type UpdateTaskRequest,
  type Medication, type CreateMedicationRequest, type UpdateMedicationRequest,
  type MedicationLog, type CreateMedicationLogRequest,
  type SymptomLog, type CreateSymptomLogRequest,
  type ChatMessage, type CreateChatMessageRequest,
  type AiChatMessage, type CreateAiChatMessageRequest,
  type KnowledgeEntry, type CreateKnowledgeEntryRequest, type UpdateKnowledgeEntryRequest
} from "@shared/schema";

export interface IStorage {
  // Documents
  getDocuments(userId: string): Promise<Document[]>;
  createDocument(doc: CreateDocumentRequest): Promise<Document>;
  deleteDocument(id: number): Promise<void>;

  // Timeline
  getTimelineEvents(userId: string): Promise<TimelineEvent[]>;
  createTimelineEvent(event: CreateTimelineEventRequest): Promise<TimelineEvent>;
  deleteTimelineEvent(id: number): Promise<void>;

  // Tasks
  getTasks(userId: string): Promise<Task[]>;
  createTask(task: CreateTaskRequest): Promise<Task>;
  updateTask(id: number, updates: UpdateTaskRequest): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  deletePastTasks(userId: string): Promise<number>;

  // Medications
  getMedications(userId: string): Promise<Medication[]>;
  createMedication(med: CreateMedicationRequest): Promise<Medication>;
  updateMedication(id: number, updates: UpdateMedicationRequest): Promise<Medication>;
  deleteMedication(id: number): Promise<void>;
  createMedicationLog(log: CreateMedicationLogRequest): Promise<MedicationLog>;
  getMedicationLogs(userId: string): Promise<MedicationLog[]>;

  // Symptoms
  getSymptomLogs(userId: string): Promise<SymptomLog[]>;
  createSymptomLog(log: CreateSymptomLogRequest): Promise<SymptomLog>;

  // Chat
  getChatMessages(): Promise<ChatMessage[]>;
  createChatMessage(msg: CreateChatMessageRequest): Promise<ChatMessage>;

  // AI Chat
  getAiChatMessages(userId: string): Promise<AiChatMessage[]>;
  createAiChatMessage(msg: CreateAiChatMessageRequest): Promise<AiChatMessage>;
  clearAiChatHistory(userId: string): Promise<void>;

  // Knowledge Base
  getKnowledgeEntries(): Promise<KnowledgeEntry[]>;
  createKnowledgeEntry(entry: CreateKnowledgeEntryRequest): Promise<KnowledgeEntry>;
  updateKnowledgeEntry(id: number, updates: UpdateKnowledgeEntryRequest): Promise<KnowledgeEntry>;
  deleteKnowledgeEntry(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Documents
  async getDocuments(userId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt));
  }
  async createDocument(doc: CreateDocumentRequest): Promise<Document> {
    const [newDoc] = await db.insert(documents).values(doc).returning();
    return newDoc;
  }
  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Timeline
  async getTimelineEvents(userId: string): Promise<TimelineEvent[]> {
    return await db.select().from(timelineEvents).where(eq(timelineEvents.userId, userId)).orderBy(desc(timelineEvents.date));
  }
  async createTimelineEvent(event: CreateTimelineEventRequest): Promise<TimelineEvent> {
    const [newEvent] = await db.insert(timelineEvents).values(event).returning();
    return newEvent;
  }
  async deleteTimelineEvent(id: number): Promise<void> {
    await db.delete(timelineEvents).where(eq(timelineEvents.id, id));
  }

  // Tasks
  async getTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }
  async createTask(task: CreateTaskRequest): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }
  async updateTask(id: number, updates: UpdateTaskRequest): Promise<Task> {
    const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updated;
  }
  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }
  
  async deletePastTasks(userId: string): Promise<number> {
    const now = new Date();
    const result = await db.delete(tasks)
      .where(and(
        eq(tasks.userId, userId),
        lt(tasks.dueDate, now)
      ))
      .returning();
    return result.length;
  }

  // Medications
  async getMedications(userId: string): Promise<Medication[]> {
    return await db.select().from(medications).where(eq(medications.userId, userId)).orderBy(desc(medications.createdAt));
  }
  async createMedication(med: CreateMedicationRequest): Promise<Medication> {
    const [newMed] = await db.insert(medications).values(med).returning();
    return newMed;
  }
  async updateMedication(id: number, updates: UpdateMedicationRequest): Promise<Medication> {
    const [updated] = await db.update(medications).set(updates).where(eq(medications.id, id)).returning();
    return updated;
  }
  async deleteMedication(id: number): Promise<void> {
    await db.delete(medicationLogs).where(eq(medicationLogs.medicationId, id));
    await db.delete(medications).where(eq(medications.id, id));
  }
  async createMedicationLog(log: CreateMedicationLogRequest): Promise<MedicationLog> {
    const [newLog] = await db.insert(medicationLogs).values(log).returning();
    return newLog;
  }
  async getMedicationLogs(userId: string): Promise<MedicationLog[]> {
    // For simplicity, we might need a join here, but for now let's just return all logs for meds owned by user
    // Or simpler: fetching all logs for a specific med ID in the route handler is easier.
    // Let's implement a joined query for charts later if needed.
    // For now, let's just return all logs (MVP hack: filter in memory or add userId to logs? - Schema has medicationId, so we need to join)
    // Let's do a join:
    return await db.select({
      id: medicationLogs.id,
      medicationId: medicationLogs.medicationId,
      takenAt: medicationLogs.takenAt,
      status: medicationLogs.status,
      notes: medicationLogs.notes
    })
    .from(medicationLogs)
    .innerJoin(medications, eq(medicationLogs.medicationId, medications.id))
    .where(eq(medications.userId, userId))
    .orderBy(desc(medicationLogs.takenAt));
  }

  // Symptoms
  async getSymptomLogs(userId: string): Promise<SymptomLog[]> {
    return await db.select().from(symptomLogs).where(eq(symptomLogs.userId, userId)).orderBy(desc(symptomLogs.createdAt));
  }
  async createSymptomLog(log: CreateSymptomLogRequest): Promise<SymptomLog> {
    const [newLog] = await db.insert(symptomLogs).values(log).returning();
    return newLog;
  }

  // Chat
  async getChatMessages(): Promise<ChatMessage[]> {
    // In a real app, filter by "familyId" or similar. For now, return all (demo mode) or filter by userId if it's personal notes.
    // The requirement is "Family Chat". All users in a "family".
    // MVP: Everyone sees everything? Or just filter by userId? 
    // "Family Chat" implies multiple users.
    // Let's just return all messages for now to simulate a chat.
    return await db.select().from(chatMessages).orderBy(desc(chatMessages.createdAt));
  }
  async createChatMessage(msg: CreateChatMessageRequest): Promise<ChatMessage> {
    const [newMsg] = await db.insert(chatMessages).values(msg).returning();
    return newMsg;
  }

  // AI Chat
  async getAiChatMessages(userId: string): Promise<AiChatMessage[]> {
    return await db.select().from(aiChatMessages).where(eq(aiChatMessages.userId, userId)).orderBy(asc(aiChatMessages.createdAt));
  }
  async createAiChatMessage(msg: CreateAiChatMessageRequest): Promise<AiChatMessage> {
    const [newMsg] = await db.insert(aiChatMessages).values(msg).returning();
    return newMsg;
  }
  async clearAiChatHistory(userId: string): Promise<void> {
    await db.delete(aiChatMessages).where(eq(aiChatMessages.userId, userId));
  }

  // Knowledge Base
  async getKnowledgeEntries(): Promise<KnowledgeEntry[]> {
    return await db.select().from(knowledgeEntries).orderBy(desc(knowledgeEntries.id));
  }
  async createKnowledgeEntry(entry: CreateKnowledgeEntryRequest): Promise<KnowledgeEntry> {
    const [newEntry] = await db.insert(knowledgeEntries).values(entry).returning();
    return newEntry;
  }
  async updateKnowledgeEntry(id: number, updates: UpdateKnowledgeEntryRequest): Promise<KnowledgeEntry> {
    const [updated] = await db.update(knowledgeEntries).set(updates).where(eq(knowledgeEntries.id, id)).returning();
    return updated;
  }
  async deleteKnowledgeEntry(id: number): Promise<void> {
    await db.delete(knowledgeEntries).where(eq(knowledgeEntries.id, id));
  }
}

export const storage = new DatabaseStorage();
