import { NextResponse } from "next/server";

import {
  deleteAutomation,
  getAutomationById,
  getDashboardSnapshot,
  replaceAutomationTargets,
  updateAutomationMediaAsset
} from "@/lib/data/repository";
import { getAutomationEligibility } from "@/lib/oauth/policy";
import { runAutomationSeoPipeline } from "@/lib/seo/automation";
import { automationSchema } from "@/lib/validation/automation";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const automation = await getAutomationById(id);

  if (!automation) {
    return NextResponse.json({ message: "Automation not found." }, { status: 404 });
  }

  return NextResponse.json(automation);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const [automation, snapshot] = await Promise.all([
    getAutomationById(id),
    getDashboardSnapshot()
  ]);

  if (!automation) {
    return NextResponse.json({ message: "Automation not found." }, { status: 404 });
  }

  const body = await request.json();
  const parsed = automationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Automation update failed validation.",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

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

  if (parsed.data.companyId !== automation.companyId) {
    return NextResponse.json(
      { message: "Company cannot be changed for an existing automation." },
      { status: 400 }
    );
  }

  if (parsed.data.mediaAssetId !== automation.mediaAssetId) {
    await updateAutomationMediaAsset({
      automationId: automation.id,
      mediaAssetId: parsed.data.mediaAssetId
    });
  }

  await replaceAutomationTargets({
    automationId: automation.id,
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
            : "Automation updated, but AI SEO failed."
      },
      { status: 202 }
    );
  }

  return NextResponse.json({
    message: "Automation updated and AI SEO pipeline refreshed.",
    automationId: automation.id
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const automation = await getAutomationById(id);

  if (!automation) {
    return NextResponse.json({ message: "Automation not found." }, { status: 404 });
  }

  await deleteAutomation(automation.id);

  return NextResponse.json({
    message: "Automation deleted."
  });
}
