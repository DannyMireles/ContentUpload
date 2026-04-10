import type { PlatformId } from "@/lib/types";

interface DueUpload {
  automationId: string;
  platform: PlatformId;
  scheduledFor: string;
}

export async function getDueUploads(referenceTime = new Date()) {
  return {
    checkedAt: referenceTime.toISOString(),
    items: [] as DueUpload[]
  };
}

export async function dispatchUpload(upload: DueUpload) {
  return {
    ...upload,
    status: "not-implemented" as const
  };
}
