import { platformList, platformMeta } from "@/lib/platforms";
import type { ChannelConnection, PlatformId, PlatformPlan } from "@/lib/types";

export function isPlatformId(value: string): value is PlatformId {
  return platformList.includes(value as PlatformId);
}

export function canScheduleChannel(channel?: ChannelConnection | null) {
  return channel?.status === "connected";
}

export function getCompanyChannelMap(
  channels: ChannelConnection[],
  companyId: string
): Record<PlatformId, ChannelConnection | undefined> {
  return {
    tiktok: channels.find(
      (channel) => channel.companyId === companyId && channel.platform === "tiktok"
    ),
    instagram: channels.find(
      (channel) =>
        channel.companyId === companyId && channel.platform === "instagram"
    ),
    youtube: channels.find(
      (channel) => channel.companyId === companyId && channel.platform === "youtube"
    )
  };
}

function formatPlatformList(platforms: PlatformId[]) {
  return platforms.map((platform) => platformMeta[platform].label).join(", ");
}

export function getAutomationEligibility(
  companyId: string,
  plans: PlatformPlan[],
  channels: ChannelConnection[]
) {
  const channelMap = getCompanyChannelMap(channels, companyId);
  const invalidEnabledPlatforms = plans
    .filter((plan) => plan.enabled && !canScheduleChannel(channelMap[plan.platform]))
    .map((plan) => plan.platform);

  if (invalidEnabledPlatforms.length > 0) {
    return {
      ok: false as const,
      enabledPlans: [] as PlatformPlan[],
      message: `OAuth must be linked in Settings before you can schedule ${formatPlatformList(invalidEnabledPlatforms)}.`
    };
  }

  const enabledPlans = plans.filter((plan) => plan.enabled);

  if (enabledPlans.length === 0) {
    return {
      ok: false as const,
      enabledPlans,
      message:
        "Enable at least one connected platform before scheduling this automation."
    };
  }

  const missingSchedulePlatforms = enabledPlans
    .filter((plan) => !plan.scheduledFor)
    .map((plan) => plan.platform);

  if (missingSchedulePlatforms.length > 0) {
    return {
      ok: false as const,
      enabledPlans,
      message: `Select a schedule time for ${formatPlatformList(missingSchedulePlatforms)} before saving.`
    };
  }

  return {
    ok: true as const,
    enabledPlans,
    message: null
  };
}
