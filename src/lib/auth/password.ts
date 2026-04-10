import crypto from "node:crypto";

import { env } from "@/lib/env";

function digest(value: string) {
  return crypto.createHash("sha256").update(value).digest();
}

export function validatePassword(candidate: string) {
  return crypto.timingSafeEqual(digest(candidate), digest(env.APP_PASSWORD));
}
