import Link from "next/link";
import { loginAction } from "../auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const configured = Boolean(process.env.ADMIN_PASSWORD);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-brand-700"
      >
        ← На головну
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-extrabold">Вхід в адмінку</h1>
        <p className="mt-2 text-sm text-slate-500">
          Введи пароль адміністратора, щоб керувати темами.
        </p>

        {!configured && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Пароль ще не налаштовано: додай <code>ADMIN_PASSWORD</code> у
            <code> .env.local</code>. Поки змінної немає, адмінка відкрита без
            пароля.
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            Невірний пароль. Спробуй ще раз.
          </p>
        )}

        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Пароль</span>
            <input
              type="password"
              name="password"
              autoFocus
              required
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white transition hover:bg-brand-700"
          >
            Увійти
          </button>
        </form>
      </div>
    </main>
  );
}
