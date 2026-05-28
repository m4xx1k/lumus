import "server-only";
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { seedTopics, type Topic } from "./topics";

// Файл БД зберігаємо в каталозі data/ у корені проєкту.
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "lumos.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS topics (
    id        TEXT PRIMARY KEY,
    title     TEXT NOT NULL,
    emoji     TEXT NOT NULL DEFAULT '📘',
    imageUrl  TEXT,
    short     TEXT NOT NULL DEFAULT '',
    theory    TEXT NOT NULL DEFAULT '',
    question  TEXT NOT NULL DEFAULT '',
    answer    TEXT NOT NULL DEFAULT '',
    hint      TEXT NOT NULL DEFAULT '',
    createdAt INTEGER NOT NULL
  );
`);

// Наповнюємо базу початковими темами лише якщо вона порожня.
const count = db.prepare("SELECT COUNT(*) AS n FROM topics").get() as {
  n: number;
};
if (count.n === 0) {
  const insert = db.prepare(`
    INSERT INTO topics (id, title, emoji, imageUrl, short, theory, question, answer, hint, createdAt)
    VALUES (@id, @title, @emoji, @imageUrl, @short, @theory, @question, @answer, @hint, @createdAt)
  `);
  const seedAll = db.transaction((rows: Topic[]) => {
    rows.forEach((t, i) =>
      insert.run({ ...t, createdAt: 1_700_000_000_000 + i }),
    );
  });
  seedAll(seedTopics);
}

export function getAllTopics(): Topic[] {
  return db
    .prepare("SELECT * FROM topics ORDER BY createdAt ASC")
    .all() as Topic[];
}

export function getTopic(id: string): Topic | undefined {
  return db.prepare("SELECT * FROM topics WHERE id = ?").get(id) as
    | Topic
    | undefined;
}

export type TopicInput = Omit<Topic, "id"> & { id?: string };

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9а-яіїєґ]+/giu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "tema"
  );
}

export function createTopic(input: TopicInput, createdAt: number): string {
  let id = input.id?.trim() || slugify(input.title);
  // Гарантуємо унікальність id.
  let suffix = 1;
  while (getTopic(id)) id = `${slugify(input.title)}-${++suffix}`;

  db.prepare(`
    INSERT INTO topics (id, title, emoji, imageUrl, short, theory, question, answer, hint, createdAt)
    VALUES (@id, @title, @emoji, @imageUrl, @short, @theory, @question, @answer, @hint, @createdAt)
  `).run({
    id,
    title: input.title,
    emoji: input.emoji || "📘",
    imageUrl: input.imageUrl || null,
    short: input.short,
    theory: input.theory,
    question: input.question,
    answer: input.answer,
    hint: input.hint,
    createdAt,
  });
  return id;
}

export function updateTopic(id: string, input: TopicInput): void {
  db.prepare(`
    UPDATE topics SET
      title = @title, emoji = @emoji, imageUrl = @imageUrl, short = @short,
      theory = @theory, question = @question, answer = @answer, hint = @hint
    WHERE id = @id
  `).run({
    id,
    title: input.title,
    emoji: input.emoji || "📘",
    imageUrl: input.imageUrl || null,
    short: input.short,
    theory: input.theory,
    question: input.question,
    answer: input.answer,
    hint: input.hint,
  });
}

export function deleteTopic(id: string): void {
  db.prepare("DELETE FROM topics WHERE id = ?").run(id);
}
