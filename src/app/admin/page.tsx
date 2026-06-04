import Link from "next/link";
import { getAllTopics } from "@/lib/db";
import { deleteTopicAction } from "./actions";
import { logoutAction } from "./auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const topics = await getAllTopics();

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-brand-700"
      >
        ← На головну
      </Link>

      <div className="mt-4 mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold">Адмін-панель</h1>
        <div className="flex items-center gap-2">
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Вийти
            </button>
          </form>
          <Link
            href="/admin/new"
            className="rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700"
          >
            + Нова тема
          </Link>
        </div>
      </div>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {topics.map((topic) => (
          <li
            key={topic.id}
            className="flex items-center gap-4 p-4 hover:bg-slate-50"
          >
            <span className="text-2xl" aria-hidden>
              {topic.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{topic.title}</p>
              <p className="truncate text-sm text-slate-400">{topic.short}</p>
            </div>
            <Link
              href={`/admin/${topic.id}/edit`}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
            >
              Редагувати
            </Link>
            <form action={deleteTopicAction}>
              <input type="hidden" name="id" value={topic.id} />
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Видалити
              </button>
            </form>
          </li>
        ))}
        {topics.length === 0 && (
          <li className="p-8 text-center text-slate-400">Тем поки немає.</li>
        )}
      </ul>
    </main>
  );
}
