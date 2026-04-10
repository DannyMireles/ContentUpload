import { env } from "@/lib/env";

interface SessionPayload {
  authenticated: true;
  issuedAt: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array) {
  let output = "";

  bytes.forEach((byte) => {
    output += String.fromCharCode(byte);
  });

  return btoa(output).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function getSessionKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(env.SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(value: string) {
  const key = await getSessionKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return toBase64Url(new Uint8Array(signature));
}

export async function createSessionToken() {
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({
        authenticated: true,
        issuedAt: Date.now()
      } satisfies SessionPayload)
    )
  );

  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || (await sign(payload)) !== signature) {
    return false;
  }

  const parsed = JSON.parse(decoder.decode(fromBase64Url(payload))) as SessionPayload;

  return parsed.authenticated === true;
}
