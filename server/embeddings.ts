import OpenAI from "openai";
import { storage } from "./storage";
import type { KnowledgeEntry } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return result.data[0].embedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

export function createEmbeddingText(entry: { title: string; content: string; keywords: string[]; expert: string; category: string }): string {
  return `${entry.title}\n${entry.category}\n${entry.expert}\nKeywords: ${entry.keywords.join(", ")}\n${entry.content}`;
}

export async function generateAndStoreEmbedding(entryId: number, entry: { title: string; content: string; keywords: string[]; expert: string; category: string }): Promise<void> {
  const text = createEmbeddingText(entry);
  const embedding = await generateEmbedding(text);
  await storage.updateKnowledgeEntry(entryId, { 
    embedding: JSON.stringify(embedding) 
  } as any);
}

export interface SemanticSearchResult {
  entry: KnowledgeEntry;
  similarity: number;
}

export async function semanticSearch(query: string, entries: KnowledgeEntry[], limit: number = 3): Promise<KnowledgeEntry[]> {
  const results = await semanticSearchWithScores(query, entries, limit);
  return results.map(r => r.entry);
}

export async function semanticSearchWithScores(query: string, entries: KnowledgeEntry[], limit: number = 5): Promise<SemanticSearchResult[]> {
  const queryEmbedding = await generateEmbedding(query);
  
  const scored = entries
    .filter(entry => entry.embedding)
    .map(entry => {
      const entryEmbedding = JSON.parse(entry.embedding!) as number[];
      const similarity = cosineSimilarity(queryEmbedding, entryEmbedding);
      return { entry, similarity };
    });
  
  return scored
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .filter(s => s.similarity > 0.15);
}

export async function clearAllEmbeddings(): Promise<void> {
  const entries = await storage.getKnowledgeEntries();
  console.log(`Clearing ${entries.length} old embeddings to force regeneration with new model...`);
  for (const entry of entries) {
    if (entry.embedding) {
      await storage.updateKnowledgeEntry(entry.id, { embedding: null } as any);
    }
  }
  console.log("All embeddings cleared.");
}

export async function ensureAllEmbeddings(): Promise<void> {
  const entries = await storage.getKnowledgeEntries();
  const withoutEmbeddings = entries.filter(e => !e.embedding);
  
  if (withoutEmbeddings.length === 0) return;
  
  console.log(`Generating embeddings for ${withoutEmbeddings.length} entries with OpenAI text-embedding-3-small...`);
  
  for (const entry of withoutEmbeddings) {
    try {
      await generateAndStoreEmbedding(entry.id, entry);
      console.log(`Generated embedding for: ${entry.title}`);
    } catch (err) {
      console.error(`Failed to generate embedding for ${entry.title}:`, err);
    }
  }
  
  console.log("Embedding generation complete.");
}
