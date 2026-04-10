import { z } from "zod";

const platformPlanSchema = z.object({
  platform: z.enum(["tiktok", "instagram", "youtube"]),
  enabled: z.boolean(),
  seoMode: z.enum(["ai", "manual"]),
  title: z.string(),
  caption: z.string(),
  description: z.string(),
  scheduledFor: z.string()
});

export const automationSchema = z.object({
  companyId: z.string().min(1),
  mediaAssetId: z.string().min(1),
  plans: z.array(platformPlanSchema).min(1)
});
