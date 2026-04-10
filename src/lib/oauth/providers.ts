import { env } from "@/lib/env";
import { getCompanyOAuthApp } from "@/lib/data/repository";
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

export async function getProviderConfigForCompany(
  platform: PlatformId,
  companyId: string
): Promise<OAuthProviderConfig> {
  const baseConfig = getProviderConfig(platform);
  const companyApp = await getCompanyOAuthApp({ companyId, platform });

  if (!companyApp) {
    return baseConfig;
  }

  return {
    ...baseConfig,
    clientId: companyApp.clientId,
    clientSecret: companyApp.clientSecret
  };
}

export function ensureProviderConfigured(config: OAuthProviderConfig) {
  return Boolean(config.clientId && config.clientSecret);
}
