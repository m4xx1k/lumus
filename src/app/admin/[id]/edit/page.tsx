import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/db";
import TopicForm from "../../TopicForm";
import { updateTopicAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const topic = getTopic(id);
  if (!topic) notFound();

  const action = updateTopicAction.bind(null, id);

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-brand-700"
      >
        ← До списку тем
      </Link>
      <h1 className="font-display mt-4 mb-8 text-3xl font-extrabold">
        Редагувати: {topic.title}
      </h1>
      <TopicForm action={action} topic={topic} submitLabel="Зберегти зміни" />
    </main>
  );
}
