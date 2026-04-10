import { NextResponse } from "next/server";

import { createCompany } from "@/lib/data/repository";

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; summary?: string };

  const name = body.name?.trim() ?? "";
  if (!name) {
    return NextResponse.json({ message: "Company name is required." }, { status: 400 });
  }

  const company = await createCompany({
    name,
    summary: body.summary?.trim() ?? ""
  });

  return NextResponse.json({
    message: "Company created.",
    companyId: company.id
  });
}
