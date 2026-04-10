import { NextResponse } from "next/server";

import {
  deletePendingOAuthLinkSession,
  getPendingOAuthLinkSession,
  upsertCompanyChannelLink
} from "@/lib/data/repository";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = (await request.json()) as { candidateId?: string };

  if (!body.candidateId) {
    return NextResponse.json(
      { message: "Candidate id is required." },
      { status: 400 }
    );
  }

  const session = await getPendingOAuthLinkSession(id);

  if (!session) {
    return NextResponse.json({ message: "OAuth session not found." }, { status: 404 });
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    await deletePendingOAuthLinkSession(id);
    return NextResponse.json({ message: "OAuth session expired." }, { status: 410 });
  }

  const candidate = session.candidates.find((item) => item.id === body.candidateId);

  if (!candidate) {
    return NextResponse.json({ message: "OAuth account not found." }, { status: 400 });
  }

  await upsertCompanyChannelLink({
    companyId: session.company_id,
    platform: session.platform,
    handle: candidate.handle || candidate.displayName || candidate.id,
    providerAccountId: candidate.id,
    encryptedAccessToken: session.encrypted_access_token,
    encryptedRefreshToken: session.encrypted_refresh_token,
    tokenExpiresAt: session.token_expires_at,
    scopeSummary: session.scope_summary
  });

  await deletePendingOAuthLinkSession(id);

  return NextResponse.json({
    message: "OAuth account linked successfully.",
    returnTo: session.return_to
  });
}
