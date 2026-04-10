import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { saveOAuthLinkState } from "@/lib/data/repository";
import { createCodeChallenge, createCodeVerifier } from "@/lib/oauth/pkce";
import { getProviderConfig, ensureProviderConfigured } from "@/lib/oauth/providers";
import { isPlatformId } from "@/lib/oauth/policy";
import type { PlatformId } from "@/lib/types";

const STATE_TTL_MS = 10 * 60 * 1000;

export async function GET(
  request: Request,
  context: { params: Promise<{ platform: string }> }
) {
  const { platform } = await context.params;
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId");
  const returnTo = url.searchParams.get("returnTo") ?? "/settings";
  const safeReturnTo = returnTo.startsWith("/") ? returnTo : "/settings";

  if (!isPlatformId(platform) || !companyId) {
    return NextResponse.redirect(
      new URL("/settings?notice=Invalid OAuth link request.", request.url)
    );
  }

  const provider = getProviderConfig(platform);

  if (!ensureProviderConfigured(provider)) {
    return NextResponse.redirect(
      buildReturnUrl(request, safeReturnTo, {
        notice: `${platformLabel(platform)} OAuth cannot start yet because the provider app credentials are not configured server-side.`
      })
    );
  }

  const state = crypto.randomUUID();
  const codeVerifier = createCodeVerifier();
  const codeChallenge = createCodeChallenge(codeVerifier);
  const redirectUri = new URL(`/api/oauth/${platform}/callback`, request.url).toString();

  await saveOAuthLinkState({
    id: state,
    companyId,
    platform,
    codeVerifier,
    returnTo: safeReturnTo,
    expiresAt: new Date(Date.now() + STATE_TTL_MS).toISOString()
  });

  const authUrl = buildAuthUrl(platform, provider, {
    redirectUri,
    state,
    codeChallenge
  });

  return NextResponse.redirect(authUrl);
}

function buildAuthUrl(
  platform: PlatformId,
  provider: ReturnType<typeof getProviderConfig>,
  input: { redirectUri: string; state: string; codeChallenge: string }
) {
  const authUrl = new URL(provider.authUrl);

  switch (platform) {
    case "tiktok": {
      authUrl.searchParams.set("client_key", provider.clientId);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", provider.scopes.join(","));
      authUrl.searchParams.set("redirect_uri", input.redirectUri);
      authUrl.searchParams.set("state", input.state);
      authUrl.searchParams.set("code_challenge", input.codeChallenge);
      authUrl.searchParams.set("code_challenge_method", "S256");
      break;
    }
    case "instagram": {
      authUrl.searchParams.set("client_id", provider.clientId);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", provider.scopes.join(","));
      authUrl.searchParams.set("redirect_uri", input.redirectUri);
      authUrl.searchParams.set("state", input.state);
      break;
    }
    case "youtube": {
      authUrl.searchParams.set("client_id", provider.clientId);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", provider.scopes.join(" "));
      authUrl.searchParams.set("redirect_uri", input.redirectUri);
      authUrl.searchParams.set("state", input.state);
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("include_granted_scopes", "true");
      authUrl.searchParams.set("prompt", "consent");
      authUrl.searchParams.set("code_challenge", input.codeChallenge);
      authUrl.searchParams.set("code_challenge_method", "S256");
      break;
    }
  }

  return authUrl;
}

function platformLabel(platform: PlatformId) {
  return {
    tiktok: "TikTok",
    instagram: "Instagram",
    youtube: "YouTube"
  }[platform];
}

function buildReturnUrl(request: Request, returnTo: string, params: Record<string, string>) {
  const target = new URL(returnTo, request.url);
  Object.entries(params).forEach(([key, value]) => {
    target.searchParams.set(key, value);
  });
  return target;
}
