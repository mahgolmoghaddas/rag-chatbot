# Internal Knowledge Base RAG Chatbot (Next.js + OpenAI)

A Retrieval-Augmented Generation (RAG) chatbot built with **Next.js App Router** and **OpenAI**, designed to answer user questions **only from internal documents**.  
If the system cannot confidently find an answer in the knowledge base, it gracefully falls back to **human customer support**.

This project demonstrates how to build a **production-style AI assistant** with grounding, retrieval, and safety controls.

---

## ✨ Features

- 📄 **Document ingestion & chunking**
- 🧠 **Vector embeddings + semantic retrieval (RAG)**
- 🤖 **LLM answers grounded strictly in internal docs**
- 🚫 **Hallucination guard** with similarity threshold
- 🧑‍💼 **Human handoff fallback** when answer is not found
- 🔐 **Secure server-side OpenAI API usage**
- ⚡ **Next.js App Router (API routes + UI)**

---

## 🧱 Architecture Overview

┌────────────┐
│ User │
│ (Browser) │
└─────┬──────┘
│ Question
▼
┌──────────────────────────┐
│ Next.js UI (page.tsx) │
│ - Chat interface │
│ - Input / loading state │
└─────┬────────────────────┘
│ POST /api/chat
▼
┌──────────────────────────┐
│ Next.js API Route │
│ app/api/chat/route.ts │
│ │
│ 1. Embed user question │
│ 2. Retrieve top-K docs │
│ 3. Similarity threshold │
└─────┬───────────┬────────┘
│ │
│ │ (low confidence)
│ ▼
│ ┌──────────────────────┐
│ │ Human Handoff │
│ │ "Contact support" │
│ └──────────────────────┘
│
│ (high confidence)
▼
┌──────────────────────────┐
│ OpenAI LLM Generation │
│ - Context-grounded prompt│
│ - Answer only from docs │
└─────┬────────────────────┘
│
▼
┌──────────────────────────┐
│ Response to UI │
│ - Answer text │
│ - (Optional) sources │
└──────────────────────────┘
