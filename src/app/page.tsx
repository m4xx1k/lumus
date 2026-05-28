import Link from "next/link";
import { getAllTopics } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function Home() {
  const topics = getAllTopics();

  return (
    <div className="flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-5 pt-6">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white shadow-xl shadow-brand-200">
          <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
            <div>
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur">
                ✦ Навчання з AI-репетитором
              </span>
              <h1 className="font-display mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
                Вчися математиці у власному темпі
              </h1>
              <p className="mt-5 max-w-md text-base text-brand-100 sm:text-lg">
                Обери тему, розв&apos;яжи задачу й отримай миттєвий розбір.
                Персональний AI-репетитор пояснить усе крок за кроком.
              </p>
              <Link
                href="#temy"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Обрати тему <span aria-hidden>→</span>
              </Link>
            </div>

            {/* Декоративна «картка формул» замість фото */}
            <div className="relative hidden lg:block">
              <div className="rotate-3 rounded-3xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
                <div className="font-display space-y-3 text-2xl">
                  <p>∫ f(x) dx</p>
                  <p>aₙ = a₁ + (n−1)·d</p>
                  <p>D = b² − 4ac</p>
                  <p>logₐ(xy) = logₐx + logₐy</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 -rotate-6 rounded-2xl bg-brand-400/30 px-5 py-3 text-sm font-medium backdrop-blur ring-1 ring-white/20">
                💡 Зрозуміло й без зубріння
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="mx-auto w-full max-w-6xl px-5 py-12">
        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat value={`${topics.length}`} label="навчальних тем" />
          <Stat value="24/7" label="доступ до репетитора" />
          <Stat value="∞" label="спроб без оцінок" />
          <Stat value="UA" label="українською мовою" />
        </dl>
      </section>

      {/* Теми */}
      <section id="temy" className="mx-auto w-full max-w-6xl px-5 pb-20">
        <h2 className="font-display mb-6 text-2xl font-bold sm:text-3xl">
          Оберіть тему
        </h2>

        {topics.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Поки що немає тем. Додайте першу в{" "}
            <Link href="/admin" className="text-brand-600 underline">
              адмін-панелі
            </Link>
            .
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <li key={topic.id}>
                <Link
                  href={`/topic/${topic.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-100"
                >
                  {topic.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={topic.imageUrl}
                      alt={topic.title}
                      className="h-36 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-5xl">
                      {topic.emoji}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-semibold group-hover:text-brand-700">
                      {topic.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">{topic.short}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                      Перейти <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
      <Link href="/" className="font-display text-2xl font-extrabold tracking-tight">
        <span className="text-brand-600">Lumos</span>
        <span className="text-slate-300">.</span>
      </Link>
      <Link
        href="/admin"
        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
      >
        Адмін-панель
      </Link>
    </header>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-3xl font-extrabold text-brand-700 sm:text-4xl">
        {value}
      </dt>
      <dd className="mt-1 text-sm text-slate-500">{label}</dd>
    </div>
  );
}
