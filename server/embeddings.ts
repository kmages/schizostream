import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";
import type { KnowledgeEntry } from "@shared/schema";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
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

export async function semanticSearchWithScores(query: string, entries: KnowledgeEntry[], limit: number = 3): Promise<SemanticSearchResult[]> {
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
    .filter(s => s.similarity > 0.3);
}

export async function ensureAllEmbeddings(): Promise<void> {
  const entries = await storage.getKnowledgeEntries();
  const withoutEmbeddings = entries.filter(e => !e.embedding);
  
  if (withoutEmbeddings.length === 0) return;
  
  console.log(`Generating embeddings for ${withoutEmbeddings.length} entries...`);
  
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
