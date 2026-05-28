import "server-only";
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { seedTopics, type Topic } from "./topics";

// На Vercel/serverless писати можна ЛИШЕ в /tmp (решта ФС — read-only).
// Локально тримаємо БД у каталозі data/ в корені проєкту.
// Шлях можна перевизначити через env DB_PATH (напр. том на хостингу).
function resolveDbPath(): string {
  if (process.env.DB_PATH) return process.env.DB_PATH;
  const base = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
  return path.join(base, "lumos.db");
}

let _db: Database.Database | null = null;

// Лінива ініціалізація: БД відкривається при першому запиті, а не при імпорті
// модуля. Так помилка ФС не «вбиває» весь застосунок на етапі завантаження.
function getDb(): Database.Database {
  if (_db) return _db;

  const dbPath = resolveDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
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

  _db = db;
  return db;
}

export function getAllTopics(): Topic[] {
  return getDb()
    .prepare("SELECT * FROM topics ORDER BY createdAt ASC")
    .all() as Topic[];
}

export function getTopic(id: string): Topic | undefined {
  return getDb().prepare("SELECT * FROM topics WHERE id = ?").get(id) as
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

  getDb()
    .prepare(`
      INSERT INTO topics (id, title, emoji, imageUrl, short, theory, question, answer, hint, createdAt)
      VALUES (@id, @title, @emoji, @imageUrl, @short, @theory, @question, @answer, @hint, @createdAt)
    `)
    .run({
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
  getDb()
    .prepare(`
      UPDATE topics SET
        title = @title, emoji = @emoji, imageUrl = @imageUrl, short = @short,
        theory = @theory, question = @question, answer = @answer, hint = @hint
      WHERE id = @id
    `)
    .run({
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
  getDb().prepare("DELETE FROM topics WHERE id = ?").run(id);
}
