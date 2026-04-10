import crypto from "node:crypto";

export function base64UrlEncode(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createStateToken() {
  return base64UrlEncode(crypto.randomBytes(24));
}

export function createCodeVerifier() {
  return base64UrlEncode(crypto.randomBytes(32));
}

export function createCodeChallenge(verifier: string) {
  return base64UrlEncode(crypto.createHash("sha256").update(verifier).digest());
}
