"use client";

import { useEffect, useState } from "react";
import { getCompletedTopics, isTopicCompleted } from "@/lib/progress";

// Підписка на зміни прогресу в localStorage (поточна + інші вкладки).
function useCompleted(): Set<string> {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => setIds(new Set(getCompletedTopics()));
    sync();
    window.addEventListener("lumos:progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("lumos:progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return ids;
}

// Загальний прогрес: «пройдено X з Y тем» + смужка.
export function ProgressSummary({ total }: { total: number }) {
  const completed = useCompleted();
  const done = completed.size;
  if (total === 0) return null;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Твій прогрес</h3>
        <span className="text-sm font-medium text-slate-500">
          {done} з {total} тем
        </span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {done === total ? (
        <p className="mt-2 text-sm text-green-600">🎉 Усі теми пройдено — молодець!</p>
      ) : (
        <p className="mt-2 text-sm text-slate-400">
          Розв&apos;яжи задачу правильно, щоб позначити тему пройденою.
        </p>
      )}
    </div>
  );
}

// Бейдж «Пройдено» на картці теми.
export function CompletedBadge({ topicId }: { topicId: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const sync = () => setDone(isTopicCompleted(topicId));
    sync();
    window.addEventListener("lumos:progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("lumos:progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, [topicId]);

  if (!done) return null;

  return (
    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-xs font-semibold text-white shadow">
      ✓ Пройдено
    </span>
  );
}
