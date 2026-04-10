import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { dispatchUpload, getDueUploads } from "@/lib/upload/queue";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized cron call." }, { status: 401 });
  }

  const due = await getDueUploads();
  const results = await Promise.all(due.items.map((item) => dispatchUpload(item)));

  return NextResponse.json({
    checkedAt: due.checkedAt,
    processed: results.length,
    results
  });
}
