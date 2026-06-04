"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
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
      ImageExtension.configure({ inline: false, allowBase64: true }),
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

  async function addImageFromFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // дозволяємо вибрати той самий файл повторно
    if (!file) return;
    try {
      const src = await compressImage(file);
      editor.chain().focus().setImage({ src }).run();
    } catch {
      window.alert("Не вдалося обробити зображення. Спробуй інший файл.");
    }
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

// Стискаємо й зменшуємо зображення у браузері перед вставкою як data-URL:
// зменшуємо до MAX по довшій стороні і кодуємо в JPEG. Так контент теми
// лишається легким (не впирається в ліміт Server Actions і розмір рядка в БД).
function compressImage(file: File, max = 1400, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no 2d context"));
      // Білий фон, бо JPEG не має прозорості (інакше PNG-прозорість стане чорною).
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image load failed"));
    };
    img.src = url;
  });
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
