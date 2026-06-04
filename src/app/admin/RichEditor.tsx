"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useRef } from "react";

// WYSIWYG-редактор на TipTap. Зберігає HTML у прихований input із заданим `name`,
// щоб існуючий server action прочитав його зі звичайної FormData.
// `immediatelyRender: false` обов'язковий у Next App Router — інакше hydration mismatch.
export default function RichEditor({
  name,
  defaultValue = "",
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content: defaultValue || "",
    editorProps: {
      attributes: {
        class:
          "richtext min-h-[160px] rounded-b-xl px-4 py-3 outline-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (hiddenRef.current) {
        // Якщо контент фактично порожній — пишемо "", щоб не зберігати <p></p>.
        hiddenRef.current.value = editor.isEmpty ? "" : editor.getHTML();
      }
    },
  });

  return (
    <div className="mt-1.5 overflow-hidden rounded-xl border border-slate-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
      <input type="hidden" name={name} defaultValue={defaultValue} ref={hiddenRef} />
      {editor && <Toolbar editor={editor} />}
      <div className="relative">
        {editor && editor.isEmpty && placeholder && (
          <p className="pointer-events-none absolute left-0 top-0 px-4 py-3 text-slate-400">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  function addImageByUrl() {
    const url = window.prompt("Вкажи URL картинки:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }

  function addImageFromFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // дозволяємо вибрати той самий файл повторно
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result;
      if (typeof src === "string") {
        editor.chain().focus().setImage({ src }).run();
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Жирний"
      >
        <b>B</b>
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Курсив"
      >
        <i>I</i>
      </Btn>
      <Sep />
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Заголовок"
      >
        H2
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Підзаголовок"
      >
        H3
      </Btn>
      <Sep />
      <Btn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Маркований список"
      >
        • Список
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Нумерований список"
      >
        1. Список
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Цитата"
      >
        ❝
      </Btn>
      <Sep />
      <Btn onClick={addImageByUrl} title="Картинка за URL">
        🔗🖼
      </Btn>
      <label
        className="cursor-pointer rounded-md px-2 py-1 text-sm text-slate-700 transition hover:bg-slate-200"
        title="Завантажити картинку"
      >
        ⬆🖼
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={addImageFromFile}
        />
      </label>
      <Sep />
      <Btn
        onClick={() => editor.chain().focus().undo().run()}
        title="Скасувати"
      >
        ↶
      </Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} title="Повторити">
        ↷
      </Btn>
    </div>
  );
}

function Btn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`min-w-8 rounded-md px-2 py-1 text-sm transition ${
        active
          ? "bg-brand-600 text-white"
          : "text-slate-700 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-0.5 h-5 w-px bg-slate-300" aria-hidden />;
}
