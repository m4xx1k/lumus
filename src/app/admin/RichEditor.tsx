"use client";

import {
  useEditor,
  useEditorState,
  EditorContent,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
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
      // Плейсхолдер малюється самим ProseMirror через CSS ::before на порожньому
      // вузлі (клас .is-editor-empty + data-placeholder) — без React-оверлею, тож
      // нема проблем зі «застиглим» станом і накладанням тексту.
      Placeholder.configure({ placeholder: placeholder ?? "" }),
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
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  // Реактивні active-стани: інакше підсвітка кнопок (жирний, курсив тощо) не
  // оновлюється при зміні виділення/курсору, бо v3 не ререндерить на транзакції.
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      blockquote: editor.isActive("blockquote"),
    }),
  });

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
        active={state.bold}
        title="Жирний"
      >
        <b>B</b>
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={state.italic}
        title="Курсив"
      >
        <i>I</i>
      </Btn>
      <Sep />
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={state.h2}
        title="Заголовок"
      >
        H2
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={state.h3}
        title="Підзаголовок"
      >
        H3
      </Btn>
      <Sep />
      <Btn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={state.bulletList}
        title="Маркований список"
      >
        • Список
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={state.orderedList}
        title="Нумерований список"
      >
        1. Список
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={state.blockquote}
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
// зменшуємо до MAX по довшій стороні і кодуємо у WebP (на ~30% легший за
// JPEG тієї ж якості). Так контент теми лишається легким (не впирається в
// ліміт Server Actions і розмір рядка в БД).
function compressImage(file: File, max = 1400, quality = 0.8): Promise<string> {
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
      // Білий фон: прозорість усе одно «з'їдається» (JPEG-фолбек її не має),
      // а на білій сторінці так виглядає однаково в обох форматах.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      // Якщо браузер не вміє кодувати WebP, toDataURL мовчки поверне PNG —
      // тоді відкочуємось на JPEG.
      const webp = canvas.toDataURL("image/webp", quality);
      resolve(
        webp.startsWith("data:image/webp")
          ? webp
          : canvas.toDataURL("image/jpeg", 0.82),
      );
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
      // Не даємо кнопці забирати фокус у редактора — інакше виділення збивається
      // ще до того, як спрацює onClick (toggleBold і т.д.).
      onMouseDown={(e) => e.preventDefault()}
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
