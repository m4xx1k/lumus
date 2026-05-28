import type { Topic } from "@/lib/topics";

type Props = {
  action: (formData: FormData) => void;
  topic?: Topic;
  submitLabel: string;
};

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  textarea,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  textarea?: boolean;
  required?: boolean;
}) {
  const base =
    "mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-brand-600"> *</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={3}
          className={base}
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className={base}
        />
      )}
    </label>
  );
}

export default function TopicForm({ action, topic, submitLabel }: Props) {
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Назва теми"
          name="title"
          defaultValue={topic?.title}
          placeholder="Напр. Похідна функції"
          required
        />
        <Field
          label="Емодзі / іконка"
          name="emoji"
          defaultValue={topic?.emoji}
          placeholder="📈"
        />
      </div>

      <Field
        label="Фото (URL)"
        name="imageUrl"
        defaultValue={topic?.imageUrl ?? ""}
        placeholder="https://…/image.jpg"
      />
      <Field
        label="Короткий опис (для картки)"
        name="short"
        defaultValue={topic?.short}
        placeholder="Один рядок про тему"
      />
      <Field
        label="Опис / теорія"
        name="theory"
        defaultValue={topic?.theory}
        placeholder="Пояснення теми — піде і в чат-репетитор"
        textarea
      />
      <Field
        label="Завдання (умова задачі)"
        name="question"
        defaultValue={topic?.question}
        placeholder="Напр. Знайдіть похідну f(x) = 3x² + 5x − 7"
        textarea
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Правильна відповідь"
          name="answer"
          defaultValue={topic?.answer}
          placeholder="6x + 5"
        />
        <Field
          label="Підказка"
          name="hint"
          defaultValue={topic?.hint}
          placeholder="Натяк без готового розв'язку"
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white transition hover:bg-brand-700"
      >
        {submitLabel}
      </button>
    </form>
  );
}
