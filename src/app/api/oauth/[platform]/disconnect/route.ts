import { NextResponse } from "next/server";

import { disconnectCompanyChannel } from "@/lib/data/repository";
import { isPlatformId } from "@/lib/oauth/policy";

export async function POST(
  request: Request,
  context: { params: Promise<{ platform: string }> }
) {
  const { platform } = await context.params;

  if (!isPlatformId(platform)) {
    return NextResponse.json({ message: "Invalid platform." }, { status: 400 });
  }

  const body = (await request.json()) as { companyId?: string };

  if (!body.companyId) {
    return NextResponse.json(
      { message: "Company id is required to unlink OAuth." },
      { status: 400 }
    );
  }

  await disconnectCompanyChannel({
    companyId: body.companyId,
    platform
  });

  return NextResponse.json({
    message: `${platform.toUpperCase()} connection removed.`
  });
}
