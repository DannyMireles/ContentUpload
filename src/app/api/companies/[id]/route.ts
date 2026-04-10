import { NextResponse } from "next/server";

import { updateCompany } from "@/lib/data/repository";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = (await request.json()) as { name?: string; summary?: string };

  const name = body.name?.trim() ?? "";
  if (!name) {
    return NextResponse.json({ message: "Company name is required." }, { status: 400 });
  }

  const company = await updateCompany({
    id,
    name,
    summary: body.summary?.trim() ?? ""
  });

  return NextResponse.json({
    message: "Company updated.",
    companyId: company.id
  });
}
