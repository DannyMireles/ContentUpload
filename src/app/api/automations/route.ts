import { NextResponse } from "next/server";

import {
  createAutomationWithTargets,
  getDashboardSnapshot
} from "@/lib/data/repository";
import { getAutomationEligibility } from "@/lib/oauth/policy";
import { runAutomationSeoPipeline } from "@/lib/seo/automation";
import { automationSchema } from "@/lib/validation/automation";

export async function GET() {
  const snapshot = await getDashboardSnapshot();
  return NextResponse.json(snapshot.automations);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = automationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Automation payload failed validation.",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const snapshot = await getDashboardSnapshot();

  const eligibility = getAutomationEligibility(
    parsed.data.companyId,
    parsed.data.plans,
    snapshot.channels
  );

  if (!eligibility.ok) {
    return NextResponse.json(
      {
        message: eligibility.message
      },
      { status: 400 }
    );
  }

  const automation = await createAutomationWithTargets({
    companyId: parsed.data.companyId,
    mediaAssetId: parsed.data.mediaAssetId,
    plans: parsed.data.plans
  });

  try {
    await runAutomationSeoPipeline({
      automationId: automation.id,
      mediaAssetId: parsed.data.mediaAssetId,
      plans: parsed.data.plans
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Automation saved, but AI SEO failed."
      },
      { status: 202 }
    );
  }

  return NextResponse.json({
    message: "Automation scheduled and AI SEO pipeline started.",
    automationId: automation.id
  });
}
