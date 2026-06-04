"use client";

// Прогрес учня зберігаємо локально в браузері (localStorage).
// Жодного бекенду — приватно й працює навіть офлайн.

const KEY = "lumos:completed-topics";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

function write(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...ids]));
    // Сповіщаємо інші вкладки/компоненти про зміну прогресу.
    window.dispatchEvent(new Event("lumos:progress"));
  } catch {
    // localStorage недоступний (приватний режим) — мовчки ігноруємо.
  }
}

export function getCompletedTopics(): string[] {
  return [...read()];
}

export function isTopicCompleted(id: string): boolean {
  return read().has(String(id));
}

export function markTopicCompleted(id: string) {
  const ids = read();
  if (ids.has(String(id))) return;
  ids.add(String(id));
  write(ids);
}
