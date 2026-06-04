"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "admin_auth";
const MAX_AGE = 60 * 60 * 24 * 7; // тиждень

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    redirect("/admin/login?error=1");
  }

  const c = await cookies();
  c.set(COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/admin");
}

export async function logoutAction() {
  const c = await cookies();
  c.delete(COOKIE);
  redirect("/admin/login");
}
