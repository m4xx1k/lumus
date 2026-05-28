import { generateObject } from "ai";
import { z } from "zod";
import { getTopic } from "@/lib/db";
import { hasApiKey, model } from "@/lib/ai";
import { checkAnswerPrompt } from "@/lib/prompts";

const resultSchema = z.object({
  correct: z.boolean(),
  explanation: z.string(),
});

// Проста нормалізація для mock-перевірки без AI.
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "").replace(/,/g, ".");
}

export async function POST(req: Request) {
  const { topicId, answer } = await req.json();
  const topic = getTopic(topicId);

  if (!topic) {
    return Response.json({ error: "Тему не знайдено" }, { status: 404 });
  }
  if (typeof answer !== "string" || !answer.trim()) {
    return Response.json({ error: "Порожня відповідь" }, { status: 400 });
  }

  // Mock-режим: без ключа порівнюємо з канонічною відповіддю.
  if (!hasApiKey) {
    const correct = normalize(answer) === normalize(topic.answer);
    return Response.json({
      correct,
      explanation: correct
        ? "Правильно! (демо-режим без AI) Гарна робота 🎉"
        : `Поки що неправильно. (демо-режим без AI) Підказка: ${topic.hint}`,
      mock: true,
    });
  }

  try {
    const { object } = await generateObject({
      model,
      schema: resultSchema,
      prompt: checkAnswerPrompt(topic, answer),
    });
    return Response.json(object);
  } catch (e) {
    console.error("check error", e);
    return Response.json(
      { error: "Не вдалося перевірити відповідь. Спробуй ще раз." },
      { status: 500 },
    );
  }
}
