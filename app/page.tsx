"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Msg = { role: "user" | "assistant"; text: string };

export default function Page() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  async function ask() {
    const q = question.trim();
    if (!q || loading) return;

    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();
      console.log('data', data)

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: data?.answer ?? "Something went wrong.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Internal Knowledge Assistant</h1>
          <p className={styles.subtitle}>
            Ask questions based on internal documentation
          </p>
        </div>
  
        {/* Chat messages */}
        <div className={styles.chatBox}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.message} ${
                msg.role === "user"
                  ? styles.userMessage
                  : styles.assistantMessage
              }`}
            >
              {msg.text}
            </div>
          ))}
  
          {loading && (
            <div className={`${styles.message} ${styles.assistantMessage}`}>
              Thinking…
            </div>
          )}
        </div>
  
        {/* Sticky input */}
        <div className={styles.inputContainer}>
          <div className={styles.inputRow}>
            <input
              className={styles.input}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about internal docs…"
              onKeyDown={(e) => {
                if (e.key === "Enter") ask();
              }}
            />
            <button
              className={styles.button}
              onClick={ask}
              disabled={loading || !question.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
}
