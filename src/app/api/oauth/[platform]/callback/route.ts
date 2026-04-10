import crypto from "node:crypto";
import { NextResponse } from "next/server";

import {
  consumeOAuthLinkState,
  createPendingOAuthLinkSession,
  upsertCompanyChannelLink
} from "@/lib/data/repository";
import { encryptSecret } from "@/lib/security/encryption";
import {
  ensureProviderConfigured,
  getProviderConfigForCompany,
  type OAuthProviderConfig
} from "@/lib/oauth/providers";
import { isPlatformId } from "@/lib/oauth/policy";
import type { OAuthChannelCandidate, PlatformId } from "@/lib/types";

const SESSION_TTL_MS = 15 * 60 * 1000;

export async function GET(
  request: Request,
  context: { params: Promise<{ platform: string }> }
) {
  const { platform } = await context.params;
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!isPlatformId(platform)) {
    return NextResponse.redirect(
      new URL("/settings?notice=Invalid OAuth callback.", request.url)
    );
  }

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings?notice=OAuth error: ${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/settings?notice=OAuth callback missing code or state.", request.url)
    );
  }

  const linkState = await consumeOAuthLinkState(state);

  if (!linkState) {
    return NextResponse.redirect(
      new URL("/settings?notice=OAuth link session expired. Try again.", request.url)
    );
  }

  if (new Date(linkState.expires_at).getTime() < Date.now()) {
    return NextResponse.redirect(
      new URL("/settings?notice=OAuth link session expired. Try again.", request.url)
    );
  }

  if (linkState.platform !== platform) {
    return NextResponse.redirect(
      new URL("/settings?notice=OAuth platform mismatch. Try again.", request.url)
    );
  }

  const provider = await getProviderConfigForCompany(platform, linkState.company_id);

  if (!ensureProviderConfigured(provider)) {
    return NextResponse.redirect(
      buildReturnUrl(request, linkState.return_to, {
        notice: `${platformLabel(platform)} OAuth cannot complete because no client ID/secret is configured for this company.`
      })
    );
  }

  try {
    const redirectUri = new URL(`/api/oauth/${platform}/callback`, request.url).toString();
    const tokenPayload = await exchangeToken(platform, provider, {
      code,
      codeVerifier: linkState.code_verifier,
      redirectUri
    });

    if (!tokenPayload.accessToken) {
      throw new Error("OAuth token exchange did not return an access token.");
    }

    const encryptedAccessToken = encryptSecret(tokenPayload.accessToken);
    const encryptedRefreshToken = tokenPayload.refreshToken
      ? encryptSecret(tokenPayload.refreshToken)
      : null;
    const tokenExpiresAt = tokenPayload.expiresIn
      ? new Date(Date.now() + tokenPayload.expiresIn * 1000).toISOString()
      : null;
    const refreshTokenExpiresAt = tokenPayload.refreshExpiresIn
      ? new Date(Date.now() + tokenPayload.refreshExpiresIn * 1000).toISOString()
      : null;

    const candidates = await fetchCandidates(platform, tokenPayload.accessToken, tokenPayload.providerAccountId);

    if (candidates.length === 0) {
      throw new Error("OAuth completed but no account profile was returned.");
    }

    const scopeSummary = tokenPayload.scope ?? provider.scopes.join(", ");

    if (candidates.length === 1) {
      const candidate = candidates[0];
      await upsertCompanyChannelLink({
        companyId: linkState.company_id,
        platform,
        handle: candidate.handle || candidate.displayName || candidate.id,
        providerAccountId: candidate.id,
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiresAt,
        scopeSummary
      });

      return NextResponse.redirect(
        buildReturnUrl(request, linkState.return_to, {
          notice: `${platformLabel(platform)} account linked successfully.`
        })
      );
    }

    const sessionId = crypto.randomUUID();
    await createPendingOAuthLinkSession({
      id: sessionId,
      companyId: linkState.company_id,
      platform,
      encryptedAccessToken,
      encryptedRefreshToken,
      tokenExpiresAt,
      refreshTokenExpiresAt,
      scopeSummary,
      candidates,
      returnTo: linkState.return_to,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString()
    });

    return NextResponse.redirect(
      buildReturnUrl(request, linkState.return_to, {
        notice: "Select the account to link.",
        session: sessionId
      })
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth failed.";
    return NextResponse.redirect(
      buildReturnUrl(request, linkState.return_to, {
        notice: message
      })
    );
  }
}

async function exchangeToken(
  platform: PlatformId,
  provider: OAuthProviderConfig,
  input: { code: string; codeVerifier: string; redirectUri: string }
) {
  const body = new URLSearchParams();

  switch (platform) {
    case "tiktok":
      body.set("client_key", provider.clientId);
      body.set("client_secret", provider.clientSecret);
      body.set("code", input.code);
      body.set("grant_type", "authorization_code");
      body.set("redirect_uri", input.redirectUri);
      body.set("code_verifier", input.codeVerifier);
      break;
    case "instagram":
      body.set("client_id", provider.clientId);
      body.set("client_secret", provider.clientSecret);
      body.set("grant_type", "authorization_code");
      body.set("redirect_uri", input.redirectUri);
      body.set("code", input.code);
      break;
    case "youtube":
      body.set("client_id", provider.clientId);
      body.set("client_secret", provider.clientSecret);
      body.set("grant_type", "authorization_code");
      body.set("redirect_uri", input.redirectUri);
      body.set("code", input.code);
      body.set("code_verifier", input.codeVerifier);
      break;
  }

  const response = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      `OAuth token exchange failed: ${response.status} ${JSON.stringify(payload)}`
    );
  }

  const raw = (payload?.data ?? payload) as Record<string, unknown>;

  return {
    accessToken: (raw.access_token ?? raw.accessToken) as string | undefined,
    refreshToken: (raw.refresh_token ?? raw.refreshToken) as string | undefined,
    expiresIn: Number(raw.expires_in ?? raw.expiresIn) || null,
    refreshExpiresIn: Number(raw.refresh_expires_in ?? raw.refreshExpiresIn) || null,
    scope: typeof raw.scope === "string" ? (raw.scope as string) : undefined,
    providerAccountId: (raw.open_id ?? raw.user_id ?? raw.account_id ?? raw.id) as string | undefined
  };
}

async function fetchCandidates(
  platform: PlatformId,
  accessToken: string,
  providerAccountId?: string
): Promise<OAuthChannelCandidate[]> {
  switch (platform) {
    case "tiktok":
      return await fetchTikTokCandidates(accessToken, providerAccountId);
    case "instagram":
      return await fetchInstagramCandidates(accessToken, providerAccountId);
    case "youtube":
      return await fetchYouTubeCandidates(accessToken, providerAccountId);
  }
}

async function fetchTikTokCandidates(accessToken: string, openId?: string) {
  try {
    const response = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,username",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    const payload = await response.json();
    const user = payload?.data?.user ?? payload?.data?.user_info ?? payload?.user;
    const id = (user?.open_id ?? user?.id ?? openId) as string | undefined;

    if (id) {
      return [
        {
          id,
          handle: user?.username ?? user?.display_name ?? `tiktok:${id}`,
          displayName: user?.display_name ?? user?.username ?? `TikTok ${id}`,
          avatarUrl: user?.avatar_url
        }
      ];
    }
  } catch {
    // ignore and fall through
  }

  return openId
    ? [
        {
          id: openId,
          handle: `tiktok:${openId}`,
          displayName: `TikTok ${openId}`
        }
      ]
    : [];
}

async function fetchInstagramCandidates(accessToken: string, userId?: string) {
  try {
    const pages = await fetchJson(
      "https://graph.facebook.com/v19.0/me/accounts?fields=id,name,instagram_business_account",
      accessToken
    );

    if (Array.isArray(pages?.data)) {
      const candidates: OAuthChannelCandidate[] = [];

      for (const page of pages.data as Array<Record<string, any>>) {
        const igAccount = page.instagram_business_account;
        if (!igAccount?.id) {
          continue;
        }

        const igProfile = await fetchJson(
          `https://graph.facebook.com/v19.0/${igAccount.id}?fields=id,username,profile_picture_url`,
          accessToken
        );

        candidates.push({
          id: igProfile?.id ?? igAccount.id,
          handle: igProfile?.username ?? page.name ?? `instagram:${igAccount.id}`,
          displayName: page.name ?? igProfile?.username ?? `Instagram ${igAccount.id}`,
          avatarUrl: igProfile?.profile_picture_url
        });
      }

      if (candidates.length > 0) {
        return candidates;
      }
    }

    const profile = await fetchJson(
      "https://graph.facebook.com/v19.0/me?fields=id,name",
      accessToken
    );
    const id = (profile?.id ?? userId) as string | undefined;
    const name = profile?.name ?? "Instagram account";

    if (id) {
      return [
        {
          id,
          handle: name,
          displayName: name
        }
      ];
    }
  } catch {
    // ignore
  }

  return userId
    ? [
        {
          id: userId,
          handle: `instagram:${userId}`,
          displayName: `Instagram ${userId}`
        }
      ]
    : [];
}

async function fetchYouTubeCandidates(accessToken: string, fallbackId?: string) {
  try {
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    const payload = await response.json();
    const items = Array.isArray(payload?.items) ? payload.items : [];

    const candidates = items
      .map((item: Record<string, any>) => {
        const snippet = item.snippet ?? {};
        return {
          id: String(item.id ?? ""),
          handle: snippet.customUrl ?? snippet.title ?? String(item.id ?? ""),
          displayName: snippet.title ?? String(item.id ?? ""),
          avatarUrl: snippet.thumbnails?.default?.url
        };
      })
      .filter((candidate: OAuthChannelCandidate) => candidate.id);

    if (candidates.length > 0) {
      return candidates;
    }
  } catch {
    // ignore
  }

  return fallbackId
    ? [
        {
          id: fallbackId,
          handle: `youtube:${fallbackId}`,
          displayName: `YouTube ${fallbackId}`
        }
      ]
    : [];
}

function platformLabel(platform: PlatformId) {
  return {
    tiktok: "TikTok",
    instagram: "Instagram",
    youtube: "YouTube"
  }[platform];
}

async function fetchJson(url: string, accessToken: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`Graph API error: ${response.status} ${JSON.stringify(payload)}`);
  }

  return payload;
}

function buildReturnUrl(request: Request, returnTo: string, params: Record<string, string>) {
  const safeReturnTo = returnTo.startsWith("/") ? returnTo : "/settings";
  const target = new URL(safeReturnTo, request.url);
  Object.entries(params).forEach(([key, value]) => {
    target.searchParams.set(key, value);
  });
  return target;
}
