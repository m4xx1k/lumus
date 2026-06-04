import "server-only";
import { createClient, type Client } from "@libsql/client";
import { seedTopics, type Topic } from "./topics";

// БД працює через libSQL (Turso). На проді задаємо TURSO_DATABASE_URL (libsql://…)
// та TURSO_AUTH_TOKEN. Якщо їх немає — локально відкриваємо вбудований файл SQLite,
// тож розробка працює «з коробки» без жодних креденшелів.
function makeClient(): Client {
  const url = process.env.TURSO_DATABASE_URL || "file:data/lumos.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, authToken });
}

let _client: Client | null = null;
let _ready: Promise<Client> | null = null;

// Лінива ініціалізація: створюємо клієнт, таблицю й засіваємо дані при першому
// запиті. Проміс кешуємо, щоб паралельні виклики не ініціалізували двічі.
function getDb(): Promise<Client> {
  if (_client) return Promise.resolve(_client);
  if (!_ready) _ready = init();
  return _ready;
}

async function init(): Promise<Client> {
  const client = makeClient();

  await client.execute(`
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
  const countRes = await client.execute("SELECT COUNT(*) AS n FROM topics");
  const n = Number(countRes.rows[0].n);
  if (n === 0) {
    await client.batch(
      seedTopics.map((t, i) => ({
        sql: `INSERT INTO topics (id, title, emoji, imageUrl, short, theory, question, answer, hint, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          t.id,
          t.title,
          t.emoji,
          t.imageUrl,
          t.short,
          t.theory,
          t.question,
          t.answer,
          t.hint,
          1_700_000_000_000 + i,
        ],
      })),
      "write",
    );
  }

  _client = client;
  return client;
}

export async function getAllTopics(): Promise<Topic[]> {
  const db = await getDb();
  const res = await db.execute("SELECT * FROM topics ORDER BY createdAt ASC");
  return res.rows as unknown as Topic[];
}

export async function getTopic(id: string): Promise<Topic | undefined> {
  const db = await getDb();
  const res = await db.execute({
    sql: "SELECT * FROM topics WHERE id = ?",
    args: [id],
  });
  return (res.rows[0] as unknown as Topic) ?? undefined;
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

export async function createTopic(
  input: TopicInput,
  createdAt: number,
): Promise<string> {
  let id = input.id?.trim() || slugify(input.title);
  // Гарантуємо унікальність id.
  let suffix = 1;
  while (await getTopic(id)) id = `${slugify(input.title)}-${++suffix}`;

  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO topics (id, title, emoji, imageUrl, short, theory, question, answer, hint, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.title,
      input.emoji || "📘",
      input.imageUrl || null,
      input.short,
      input.theory,
      input.question,
      input.answer,
      input.hint,
      createdAt,
    ],
  });
  return id;
}

export async function updateTopic(
  id: string,
  input: TopicInput,
): Promise<void> {
  const db = await getDb();
  await db.execute({
    sql: `UPDATE topics SET
            title = ?, emoji = ?, imageUrl = ?, short = ?,
            theory = ?, question = ?, answer = ?, hint = ?
          WHERE id = ?`,
    args: [
      input.title,
      input.emoji || "📘",
      input.imageUrl || null,
      input.short,
      input.theory,
      input.question,
      input.answer,
      input.hint,
      id,
    ],
  });
}

export async function deleteTopic(id: string): Promise<void> {
  const db = await getDb();
  await db.execute({ sql: "DELETE FROM topics WHERE id = ?", args: [id] });
}
