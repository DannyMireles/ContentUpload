import { NextResponse } from "next/server";

import { validatePassword } from "@/lib/auth/password";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { createSessionToken } from "@/lib/auth/token";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!validatePassword(password)) {
    return NextResponse.redirect(new URL("/login?error=1", request.url));
  }

  const response = NextResponse.redirect(new URL("/scheduled", request.url));

  response.cookies.set({
    name: SESSION_COOKIE,
    value: await createSessionToken(),
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return response;
}
