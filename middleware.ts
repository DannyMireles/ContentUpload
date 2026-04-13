import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { env } from "@/lib/env";

const PUBLIC_PATHS = ["/login", "/signup", "/verify", "/forgot", "/pending"];
const ONBOARDING_PREFIX = "/onboarding";
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/cron"];

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const supabase = createServerClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      }
    }
  });

  const userResponse = await withTimeout(supabase.auth.getUser(), 4000);
  const user = userResponse?.data.user ?? null;

  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isOnboarding = pathname.startsWith(ONBOARDING_PREFIX);
  const isApi = pathname.startsWith("/api");

  if (!user) {
    if (isApi) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    if (!isPublicPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  const profileResponse = await withTimeout(
    supabase
      .from("user_profiles")
      .select("approved,onboarding_complete")
      .eq("user_id", user.id)
      .maybeSingle(),
    4000
  );
  const profile = profileResponse?.data ?? null;
  const error = profileResponse?.error ?? null;

  if (!profile && !error) {
    await supabase.from("user_profiles").insert({
      user_id: user.id,
      email: user.email ?? ""
    });
  }

  const effectiveProfile = profile ?? { approved: false, onboarding_complete: false };

  if (!effectiveProfile.approved) {
    if (isApi) {
      return NextResponse.json({ message: "Account pending approval." }, { status: 403 });
    }

    if (pathname !== "/pending") {
      return NextResponse.redirect(new URL("/pending", request.url));
    }
    return response;
  }

  if (!effectiveProfile.onboarding_complete && !isOnboarding) {
    if (isApi) {
      return NextResponse.json({ message: "Onboarding incomplete." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (isPublicPath || (isOnboarding && effectiveProfile.onboarding_complete)) {
    return NextResponse.redirect(new URL("/scheduled", request.url));
  }

  return response;
}

async function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race<T | null>([
      promise,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), ms);
      })
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
