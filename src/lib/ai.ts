import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Чи є ключ Gemini. Якщо ні — застосунок працює в mock-режимі (без реальних запитів до AI).
export const hasApiKey = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Модель можна перевизначити через env, дефолт — швидка та дешева gemini-2.5-flash.
export const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const model = google(MODEL);
