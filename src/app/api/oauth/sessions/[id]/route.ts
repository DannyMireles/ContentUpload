import { NextResponse } from "next/server";

import { deletePendingOAuthLinkSession, getPendingOAuthLinkSessionSummary } from "@/lib/data/repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getPendingOAuthLinkSessionSummary(id);

  if (!session) {
    return NextResponse.json({ message: "OAuth session not found." }, { status: 404 });
  }

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await deletePendingOAuthLinkSession(id);
    return NextResponse.json({ message: "OAuth session expired." }, { status: 410 });
  }

  return NextResponse.json(session);
}
