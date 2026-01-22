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
This project implements a production-style RAG pipeline:

CMS (Contentful) → offline ingestion & embedding

Vector similarity search (top-K cosine similarity)

Confidence-based gating before LLM invocation

Context-restricted generation (no external knowledge)

Fallback to human support when confidence is insufficient

The system prioritizes correctness over coverage, explicitly avoiding hallucinated responses.

Built with Next.js (API routes + UI), OpenAI embeddings, and a modular retrieval layer designed to be easily swapped for a managed vector DB.│ - Context-grounded prompt│

