import { NextResponse } from "next/server";

import { deleteCompany, updateCompany, upsertCompanyOAuthApp } from "@/lib/data/repository";
import { isPlatformId } from "@/lib/oauth/policy";
import type { PlatformId } from "@/lib/types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    name?: string;
    summary?: string;
    oauthApps?: Record<string, { clientId?: string; clientSecret?: string }>;
  };

  const name = body.name?.trim() ?? "";
  if (!name) {
    return NextResponse.json({ message: "Company name is required." }, { status: 400 });
  }

  const { entries, invalidPlatforms } = normalizeOAuthApps(body.oauthApps);
  if (invalidPlatforms.length > 0) {
    return NextResponse.json(
      {
        message: `Both client ID and secret are required for: ${invalidPlatforms
          .map(platformLabel)
          .join(", ")}.`
      },
      { status: 400 }
    );
  }

  const company = await updateCompany({
    id,
    name,
    summary: body.summary?.trim() ?? ""
  });

  if (entries.length > 0) {
    await Promise.all(
      entries.map((entry) =>
        upsertCompanyOAuthApp({
          companyId: id,
          platform: entry.platform,
          clientId: entry.clientId,
          clientSecret: entry.clientSecret
        })
      )
    );
  }

  return NextResponse.json({
    message: "Company updated.",
    companyId: company.id
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await deleteCompany(id);

  return NextResponse.json({
    message: "Company deleted."
  });
}

function normalizeOAuthApps(
  oauthApps?: Record<string, { clientId?: string; clientSecret?: string }>
) {
  const entries: Array<{
    platform: PlatformId;
    clientId: string;
    clientSecret: string;
  }> = [];
  const invalidPlatforms: PlatformId[] = [];

  if (!oauthApps) {
    return { entries, invalidPlatforms };
  }

  for (const [platform, creds] of Object.entries(oauthApps)) {
    if (!isPlatformId(platform)) {
      continue;
    }
    const clientId = creds?.clientId?.trim() ?? "";
    const clientSecret = creds?.clientSecret?.trim() ?? "";
    if (!clientId && !clientSecret) {
      continue;
    }
    if (!clientId || !clientSecret) {
      invalidPlatforms.push(platform);
      continue;
    }
    entries.push({ platform, clientId, clientSecret });
  }

  return { entries, invalidPlatforms };
}

function platformLabel(platform: PlatformId) {
  return {
    tiktok: "TikTok",
    instagram: "Instagram",
    youtube: "YouTube"
  }[platform];
}
