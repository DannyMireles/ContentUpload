import { NextResponse } from "next/server";
import crypto from "node:crypto";

import { createMediaAsset } from "@/lib/data/repository";
import { AUTOMATION_MEDIA_BUCKET, createSupabaseAdminClient } from "@/lib/supabase/admin";

const ACCEPTED_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/aac"
];

export async function POST(request: Request) {
  const formData = await request.formData();
  const companyId = String(formData.get("companyId") ?? "");
  const file = formData.get("file");

  if (!companyId) {
    return NextResponse.json({ message: "Company is required." }, { status: 400 });
  }

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: "Media file is required." }, { status: 400 });
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { message: "Unsupported media format. Use mp3, mp4, mov, m4a, wav, webm, or aac." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const extension = file.name.split(".").pop() ?? "media";
  const path = `${companyId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(AUTOMATION_MEDIA_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    return NextResponse.json(
      { message: `Storage upload failed: ${uploadError.message}` },
      { status: 500 }
    );
  }

  const mediaAsset = await createMediaAsset({
    companyId,
    storagePath: path,
    originalFilename: file.name,
    contentType: file.type
  });

  const { data: signed } = await supabase.storage
    .from(AUTOMATION_MEDIA_BUCKET)
    .createSignedUrl(path, 60 * 60);

  return NextResponse.json({
    mediaAssetId: mediaAsset.id,
    storagePath: path,
    signedUrl: signed?.signedUrl ?? "",
    contentType: file.type,
    filename: file.name
  });
}
