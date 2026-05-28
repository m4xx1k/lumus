"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createTopic,
  updateTopic,
  deleteTopic,
  type TopicInput,
} from "@/lib/db";

function parse(formData: FormData): TopicInput {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  return {
    title: get("title"),
    emoji: get("emoji") || "📘",
    imageUrl: get("imageUrl") || null,
    short: get("short"),
    theory: get("theory"),
    question: get("question"),
    answer: get("answer"),
    hint: get("hint"),
  };
}

export async function createTopicAction(formData: FormData) {
  const input = parse(formData);
  if (!input.title) return;
  createTopic(input, 1_700_000_000_000 + Date.now() % 1_000_000_000);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateTopicAction(id: string, formData: FormData) {
  const input = parse(formData);
  if (!input.title) return;
  updateTopic(id, input);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/topic/${id}`);
  redirect("/admin");
}

export async function deleteTopicAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) {
    deleteTopic(id);
    revalidatePath("/");
    revalidatePath("/admin");
  }
}
