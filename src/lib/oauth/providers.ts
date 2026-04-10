import { env } from "@/lib/env";
import type { PlatformId } from "@/lib/types";

export interface OAuthProviderConfig {
  platform: PlatformId;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientId: string;
  clientSecret: string;
}

export function getProviderConfig(platform: PlatformId): OAuthProviderConfig {
  switch (platform) {
    case "tiktok":
      return {
        platform,
        authUrl: "https://www.tiktok.com/v2/auth/authorize/",
        tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
        scopes: ["user.info.basic", "video.publish"],
        clientId: env.TIKTOK_CLIENT_ID ?? "",
        clientSecret: env.TIKTOK_CLIENT_SECRET ?? ""
      };
    case "instagram":
      return {
        platform,
        authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
        tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
        scopes: ["pages_show_list", "instagram_basic", "instagram_content_publish"],
        clientId: env.INSTAGRAM_CLIENT_ID ?? "",
        clientSecret: env.INSTAGRAM_CLIENT_SECRET ?? ""
      };
    case "youtube":
      return {
        platform,
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scopes: [
          "https://www.googleapis.com/auth/youtube.upload",
          "https://www.googleapis.com/auth/youtube.readonly"
        ],
        clientId: env.YOUTUBE_CLIENT_ID ?? "",
        clientSecret: env.YOUTUBE_CLIENT_SECRET ?? ""
      };
  }
}

export function ensureProviderConfigured(config: OAuthProviderConfig) {
  return Boolean(config.clientId && config.clientSecret);
}
