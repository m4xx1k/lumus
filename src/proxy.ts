import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next 16: файл-конвенція middleware перейменована на `proxy`.
// Простий захист адмінки: усе під /admin вимагає cookie `admin_auth`, що дорівнює
// паролю з env ADMIN_PASSWORD. Поки пароль не задано — захист вимкнено (зручно
// для локальної розробки, нічого не ламається до налаштування).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Сторінку логіну пропускаємо завжди.
  if (pathname === "/admin/login") return NextResponse.next();

  const password = process.env.ADMIN_PASSWORD;
  if (!password) return NextResponse.next();

  const authed = request.cookies.get("admin_auth")?.value === password;
  if (!authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
