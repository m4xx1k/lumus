import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { getTopic } from "@/lib/db";
import { hasApiKey, model } from "@/lib/ai";
import { tutorSystemPrompt } from "@/lib/prompts";

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    topicId,
  }: { messages: UIMessage[]; topicId: string } = await req.json();

  const topic = getTopic(topicId);
  if (!topic) {
    return Response.json({ error: "Тему не знайдено" }, { status: 404 });
  }

  // Mock-режим: без ключа повертаємо заздалегідь підготовлену відповідь стрімом.
  if (!hasApiKey) {
    const text =
      `Привіт! Я твій репетитор з теми «${topic.title}» 🤖\n\n` +
      "Зараз я працюю в демо-режимі без AI (не задано GOOGLE_GENERATIVE_AI_API_KEY), " +
      "тому відповідаю шаблонно. Додай ключ у файл .env.local — і я почну справді допомагати з твоїми питаннями.\n\n" +
      `Підказка до задачі: ${topic.hint}`;

    const stream = createUIMessageStream({
      execute({ writer }) {
        writer.write({ type: "text-start", id: "0" });
        writer.write({ type: "text-delta", id: "0", delta: text });
        writer.write({ type: "text-end", id: "0" });
      },
    });
    return createUIMessageStreamResponse({ stream });
  }

  const result = streamText({
    model,
    system: tutorSystemPrompt(topic),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
