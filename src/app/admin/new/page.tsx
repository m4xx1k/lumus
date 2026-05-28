import Link from "next/link";
import TopicForm from "../TopicForm";
import { createTopicAction } from "../actions";

export default function NewTopicPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-brand-700"
      >
        ← До списку тем
      </Link>
      <h1 className="font-display mt-4 mb-8 text-3xl font-extrabold">
        Нова тема
      </h1>
      <TopicForm action={createTopicAction} submitLabel="Створити тему" />
    </main>
  );
}
