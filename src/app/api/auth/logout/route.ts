import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });

  return response;
}
