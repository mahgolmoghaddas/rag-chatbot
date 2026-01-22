import { openai } from "@/lib/openai";
import { retrieve } from "@/lib/rag";

export async function POST(req: Request) {
  const { question } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  const q = String(question || "").trim();
  if (!q) return Response.json({ error: "Empty question" }, { status: 400 });

  // 1) Retrieve
  const hits = await retrieve(q, 5);


  // 2) Threshold: if top score too low, treat as "not found"
  const topScore = hits[0]?.score ?? 0;
  const THRESHOLD = 0; // tune this

  if (topScore < THRESHOLD) {
    return Response.json({
      answer:
        "I couldn’t find this in our internal documents. Please contact customer service so a human can help you.",
      found: false,
      sources: [],
      topScore,
    });
  }

  const context = hits
    .map(
      (h, idx) =>
        `Source ${idx + 1} (${h.r.source}, score=${h.score.toFixed(3)}):\n${h.r.text}`
    )
    .join("\n\n---\n\n");

  // 3) Generate answer grounded in context (Responses API is recommended) :contentReference[oaicite:2]{index=2}
  const response = await openai.responses.create({
    model: "gpt-5.2",
    instructions:
      "You are a support assistant. Answer ONLY using the provided internal document context. " +
      "If the answer is not clearly in the context, say you don't know and recommend contacting customer service.",
    input: [
      { role: "user", content: `Question: ${q}\n\nINTERNAL CONTEXT:\n${context}` },
    ],
  });
 

  return Response.json({
    answer: response.output_text,
    found: true,
    topScore,
    sources: hits.map((h) => ({
      source: h.r.source,
      id: h.r.id,
      score: h.score,
    })),
  });

  

}
