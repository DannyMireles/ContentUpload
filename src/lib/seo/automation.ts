import { AUTOMATION_MEDIA_BUCKET, createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateSeoFromTranscript, transcribeAudioBuffer } from "@/lib/seo/pipeline";
import {
  getMediaAssetById,
  markMediaTranscriptFailed,
  updateAutomationTargetSeo,
  updateMediaTranscript
} from "@/lib/data/repository";
import type { PlatformPlan } from "@/lib/types";

export async function runAutomationSeoPipeline(input: {
  automationId: string;
  mediaAssetId: string;
  plans: PlatformPlan[];
}) {
  const aiPlans = input.plans.filter((plan) => plan.enabled && plan.seoMode === "ai");

  if (aiPlans.length === 0) {
    return;
  }

  const mediaAsset = await getMediaAssetById(input.mediaAssetId, { useAdmin: true });

  if (!mediaAsset) {
    throw new Error("Media asset not found for AI SEO pipeline.");
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(AUTOMATION_MEDIA_BUCKET)
    .download(mediaAsset.storage_path);

  if (error || !data) {
    throw new Error(`Failed to download media for transcription: ${error?.message ?? "Unknown error"}`);
  }

  try {
    const buffer = await data.arrayBuffer();
    const transcript = await transcribeAudioBuffer({
      filename: mediaAsset.original_filename,
      contentType: mediaAsset.content_type ?? "application/octet-stream",
      buffer
    });

    await updateMediaTranscript(
      {
        mediaAssetId: mediaAsset.id,
        transcript
      },
      { useAdmin: true }
    );

    for (const plan of aiPlans) {
      const seo = await generateSeoFromTranscript(plan.platform, transcript);
      await updateAutomationTargetSeo(
        {
          automationId: input.automationId,
          platform: plan.platform,
          title: seo.title,
          caption: seo.caption,
          description: seo.description,
          generatedPayload: {
            summary: seo.caption.slice(0, 160),
            transcriptExcerpt: transcript.slice(0, 800),
            hashtags: seo.hashtags
          }
        },
        { useAdmin: true }
      );
    }
  } catch (error) {
    await markMediaTranscriptFailed(
      mediaAsset.id,
      error instanceof Error ? error.message : "Transcription failed.",
      { useAdmin: true }
    );
    throw error;
  }
}
