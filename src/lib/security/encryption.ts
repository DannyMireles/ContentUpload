import crypto from "node:crypto";

import { env } from "@/lib/env";

function getKey() {
  if (!env.CHANNEL_TOKEN_ENCRYPTION_KEY) {
    throw new Error("CHANNEL_TOKEN_ENCRYPTION_KEY is required to encrypt tokens.");
  }

  return Buffer.from(env.CHANNEL_TOKEN_ENCRYPTION_KEY, "base64");
}

export function encryptSecret(plainText: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    value: encrypted.toString("base64")
  };
}

export function decryptSecret(payload: {
  iv: string;
  tag: string;
  value: string;
}) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(payload.iv, "base64")
  );

  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(payload.value, "base64")),
    decipher.final()
  ]).toString("utf8");
}
