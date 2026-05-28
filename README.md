# ✦ Lumos

Платформа для вивчення математики з AI-репетитором. Студент обирає тему,
розв'язує задачу, отримує миттєвий розбір відповіді від AI та може поставити
будь-яке питання у чаті, де модель діє як персональний репетитор.

> MVP для дипломної роботи. Мова інтерфейсу — українська. Рівень тем —
> професійна освіта / коледж.

## Можливості

- **Головна** — фіолетовий hero, статистика та сітка карток тем.
- **Сторінка теми** — фото/іконка, теорія, задача та поле для введення відповіді.
- **Перевірка відповіді** — відповідь надсилається в AI, який повертає вердикт
  (правильно / ні) + коротке пояснення.
- **Чат-репетитор** — діалог із AI; у системний промпт закладено теорію теми та
  роль терплячого репетитора.
- **Адмін-панель** (`/admin`) — CRUD тем: назва, емодзі, фото (URL), опис,
  теорія, завдання, правильна відповідь, підказка. Лінк є на головній.
- **SQLite** — теми зберігаються в локальній БД (`data/lumos.db`), яка
  автоматично наповнюється початковими темами при першому запуску.
- **Демо-режим (mock)** — без API-ключа застосунок повністю працює зі
  спрощеними відповідями.

## Технології

- [Next.js 16](https://nextjs.org) (App Router, TypeScript, Server Actions)
- [Tailwind CSS v4](https://tailwindcss.com) — фіолетова тема
- Шрифти: [Unbounded](https://fonts.google.com/specimen/Unbounded) (заголовки) +
  [Inter](https://fonts.google.com/specimen/Inter) (текст)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — зберігання тем
- [Vercel AI SDK v6](https://ai-sdk.dev) + провайдер [Google Gemini](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai)

## Запуск

```bash
npm install
npm run dev
```

Відкрий [http://localhost:3000](http://localhost:3000).

### Підключення AI (Google Gemini)

Без ключа застосунок працює в демо-режимі. Щоб увімкнути справжній AI:

1. Отримай безкоштовний ключ у [Google AI Studio](https://aistudio.google.com/apikey).
2. Скопіюй `.env.example` у `.env.local` і встав ключ:

   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=твій_ключ
   ```

3. Перезапусти `npm run dev`.

## Структура проєкту

```
src/
├── app/
│   ├── page.tsx                 # головна — hero + теми з БД
│   ├── topic/[id]/
│   │   ├── page.tsx             # сторінка теми (server component)
│   │   └── TopicView.tsx        # перевірка відповіді + чат (client)
│   ├── admin/
│   │   ├── page.tsx             # список тем + видалення
│   │   ├── new/page.tsx         # створення теми
│   │   ├── [id]/edit/page.tsx   # редагування теми
│   │   ├── TopicForm.tsx        # форма теми (спільна)
│   │   └── actions.ts           # server actions: create / update / delete
│   └── api/
│       ├── check/route.ts       # перевірка відповіді (generateObject)
│       └── chat/route.ts        # стрімінговий чат (streamText)
└── lib/
    ├── db.ts                    # SQLite: ініціалізація, seed, CRUD
    ├── topics.ts                # тип Topic + початкові (seed) дані
    ├── ai.ts                    # налаштування провайдера + детект ключа
    └── prompts.ts               # системні промпти репетитора
```

## База даних

Файл `data/lumos.db` створюється автоматично і додається в `.gitignore`.
Щоб скинути теми до початкових — видали файл і перезапусти застосунок.
