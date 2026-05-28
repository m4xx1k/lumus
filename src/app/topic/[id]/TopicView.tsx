"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { Topic } from "@/lib/topics";

type CheckResult = { correct: boolean; explanation: string };

export default function TopicView({ topic }: { topic: Topic }) {
  return (
    <div className="space-y-8">
      <AnswerCard topic={topic} />
      <ChatCard topic={topic} />
    </div>
  );
}

function AnswerCard({ topic }: { topic: Topic }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id, answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Помилка перевірки");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Щось пішло не так");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Задача
      </h2>
      <p className="mt-2 text-lg font-medium">{topic.question}</p>

      <form onSubmit={handleCheck} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Введи свою відповідь…"
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={loading || !answer.trim()}
          className="rounded-xl bg-brand-600 px-5 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Перевіряю…" : "Перевірити"}
        </button>
      </form>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {result && (
        <div
          className={`mt-4 rounded-xl p-4 ${
            result.correct
              ? "bg-green-50 text-green-800"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          <p className="font-semibold">
            {result.correct ? "✅ Правильно!" : "🤔 Ще не зовсім"}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{result.explanation}</p>
        </div>
      )}
    </section>
  );
}

function ChatCard({ topic }: { topic: Topic }) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { topicId: topic.id },
    }),
  });

  const busy = status === "submitted" || status === "streaming";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Чат з репетитором
      </h2>

      <div className="mt-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400">
            Запитай будь-що про тему «{topic.title}» — поясню крок за кроком 🙂
          </p>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {m.parts.map((p, i) =>
                p.type === "text" ? <span key={i}>{p.text}</span> : null,
              )}
            </div>
          </div>
        ))}

        {status === "submitted" && (
          <p className="text-sm text-slate-400">Репетитор друкує…</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Напиши своє питання…"
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl bg-slate-900 px-5 py-2.5 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Надіслати
        </button>
      </form>
    </section>
  );
}
