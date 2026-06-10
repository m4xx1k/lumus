"use client";

import { useFormStatus } from "react-dom";

// Кнопка сабміту з pending-станом: поки server action виконується, кнопка
// заблокована — інакше повторні кліки створювали тему кілька разів.
export default function SubmitButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Зберігаю…" : children}
    </button>
  );
}
