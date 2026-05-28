import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/db";
import TopicView from "./TopicView";

export const dynamic = "force-dynamic";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const topic = getTopic(id);
  if (!topic) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-brand-700"
      >
        ← До всіх тем
      </Link>

      <header className="mt-4 mb-8">
        {topic.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={topic.imageUrl}
            alt={topic.title}
            className="mb-5 h-48 w-full rounded-2xl object-cover"
          />
        )}
        <h1 className="font-display flex items-center gap-3 text-3xl font-extrabold sm:text-4xl">
          <span aria-hidden>{topic.emoji}</span>
          {topic.title}
        </h1>
        <p className="mt-4 leading-relaxed text-slate-600">{topic.theory}</p>
      </header>

      <TopicView topic={topic} />
    </main>
  );
}
