import { cookies } from "next/headers";

import { verifySessionToken } from "@/lib/auth/token";

export const SESSION_COOKIE = "content-upload-session";

export async function getSessionState() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}
