import fs from "fs";
import path from "path";
import OpenAI from "openai";

type ChunkRecord = {
  id: string;
  source: string;
  text: string;
  embedding: number[];
};

type VectorStore = {
  createdAt: string;
  records: ChunkRecord[];
};

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cosineSim(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}

function loadStore(): VectorStore {
  const p = path.join(process.cwd(), "data", "vector_store.json");
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

async function embedQuery(q: string) {
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: q,
  });
  return res.data[0].embedding;
}

export async function retrieve(query: string, topK = 5) {
  const store = loadStore();
  const qEmb = await embedQuery(query);

  const scored = store.records
    .map((r) => ({ r, score: cosineSim(qEmb, r.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}
