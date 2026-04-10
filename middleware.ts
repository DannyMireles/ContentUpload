import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/session";
import { verifySessionToken } from "@/lib/auth/token";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/cron", "/api/oauth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const authenticated = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if ((pathname === "/" || pathname.startsWith("/scheduled") || pathname.startsWith("/automations") || pathname.startsWith("/companies")) && !authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicApi) {
    return NextResponse.next();
  }

  if (pathname === "/login" && authenticated) {
    return NextResponse.redirect(new URL("/scheduled", request.url));
  }

  if (!isPublicPath && !authenticated && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
