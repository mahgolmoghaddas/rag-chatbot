import fs from "fs";
import path from "path";
import OpenAI from "openai";

type ChunkRecord = {
  id: string;
  source: string;
  text: string;
  embedding: number[];
};

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function chunkText(text: string, maxChars = 900, overlap = 150) {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + maxChars, text.length);
    chunks.push(text.slice(i, end));
    i = end - overlap;
    if (i < 0) i = 0;
    if (end === text.length) break;
  }
  return chunks.map((c) => c.trim()).filter(Boolean);
}

async function embed(texts: string[]) {
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

async function main() {
  if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");

  const docsDir = path.join(process.cwd(), "data", "docs");
  const outPath = path.join(process.cwd(), "data", "vector_store.json");

  const files = fs.readdirSync(docsDir).filter((f) => f.endsWith(".txt") || f.endsWith(".md"));
  const records: ChunkRecord[] = [];

  for (const file of files) {
    const fullPath = path.join(docsDir, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const chunks = chunkText(raw);

    // embed in small batches
    const batchSize = 64;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const embs = await embed(batch);

      for (let j = 0; j < batch.length; j++) {
        records.push({
          id: `${file}::${i + j}`,
          source: file,
          text: batch[j],
          embedding: embs[j],
        });
      }
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ createdAt: new Date().toISOString(), records }, null, 2));
  console.log(`Saved ${records.length} chunks to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
