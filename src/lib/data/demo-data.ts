import type { Automation, ChannelConnection, Company, DashboardSnapshot } from "@/lib/types";

export const companies: Company[] = [
  {
    id: "nova-labs",
    name: "Nova Labs",
    accent: "from-rose-500 to-orange-300",
    summary: "Consumer tech launches and creator-led product teasers."
  },
  {
    id: "ember-auto",
    name: "Ember Auto",
    accent: "from-red-500 to-amber-200",
    summary: "Luxury automotive clips, showroom walkarounds, and service promos."
  },
  {
    id: "atlas-fitness",
    name: "Atlas Fitness",
    accent: "from-red-400 to-pink-200",
    summary: "Training reels, educational shorts, and gym event recaps."
  }
];

export const channels: ChannelConnection[] = [
  {
    id: "nova-tiktok",
    companyId: "nova-labs",
    platform: "tiktok",
    handle: "@novalabs",
    status: "connected",
    followers: "284K",
    avatarHue: "from-rose-400 to-fuchsia-300",
    connectedAt: "2026-04-03T16:15:00.000Z",
    providerAccountId: "nova-labs-tiktok",
    scopeSummary: "video.publish,user.info.basic",
    tokenExpiresAt: "2026-05-03T16:15:00.000Z",
    lastRefreshedAt: "2026-04-08T15:45:00.000Z"
  },
  {
    id: "nova-instagram",
    companyId: "nova-labs",
    platform: "instagram",
    handle: "@nova.launches",
    status: "connected",
    followers: "93K",
    avatarHue: "from-orange-300 to-rose-400",
    connectedAt: "2026-04-02T10:00:00.000Z",
    providerAccountId: "nova-launches-instagram",
    scopeSummary: "instagram_basic,pages_show_list,instagram_content_publish",
    tokenExpiresAt: "2026-05-02T10:00:00.000Z",
    lastRefreshedAt: "2026-04-08T14:10:00.000Z"
  },
  {
    id: "nova-youtube",
    companyId: "nova-labs",
    platform: "youtube",
    handle: "@NovaLabsOfficial",
    status: "needs-auth",
    followers: "12K",
    avatarHue: "from-red-400 to-orange-200",
    connectedAt: "2026-03-28T08:00:00.000Z",
    lastError: "No OAuth link has been completed for this company yet."
  },
  {
    id: "ember-tiktok",
    companyId: "ember-auto",
    platform: "tiktok",
    handle: "@emberauto",
    status: "connected",
    followers: "418K",
    avatarHue: "from-red-500 to-amber-200",
    connectedAt: "2026-03-14T13:30:00.000Z",
    providerAccountId: "ember-auto-tiktok",
    scopeSummary: "video.publish,user.info.basic",
    tokenExpiresAt: "2026-05-14T13:30:00.000Z",
    lastRefreshedAt: "2026-04-06T09:00:00.000Z"
  },
  {
    id: "ember-youtube",
    companyId: "ember-auto",
    platform: "youtube",
    handle: "@EmberAuto",
    status: "expired",
    followers: "64K",
    avatarHue: "from-red-500 to-stone-200",
    connectedAt: "2026-02-01T09:20:00.000Z",
    providerAccountId: "ember-auto-youtube",
    scopeSummary: "youtube.upload,youtube.readonly",
    tokenExpiresAt: "2026-03-01T09:20:00.000Z",
    lastError: "Refresh token failed and the channel must be re-linked."
  },
  {
    id: "atlas-instagram",
    companyId: "atlas-fitness",
    platform: "instagram",
    handle: "@atlasfitnessclub",
    status: "connected",
    followers: "147K",
    avatarHue: "from-pink-300 to-red-500",
    connectedAt: "2026-04-04T11:45:00.000Z",
    providerAccountId: "atlas-fitness-instagram",
    scopeSummary: "instagram_basic,instagram_content_publish",
    tokenExpiresAt: "2026-05-04T11:45:00.000Z",
    lastRefreshedAt: "2026-04-09T12:00:00.000Z"
  }
];

export const automations: Automation[] = [
  {
    id: "auto-001",
    companyId: "nova-labs",
    companyName: "Nova Labs",
    videoName: "Headset launch teaser.mp4",
    videoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    transcriptStatus: "completed",
    createdAt: "2026-04-08T19:12:00.000Z",
    updatedAt: "2026-04-08T20:03:00.000Z",
    status: "scheduled",
    plans: [
      {
        platform: "tiktok",
        enabled: true,
        seoMode: "ai",
        title: "This AR reveal changes everything",
        caption: "Fast reveal, strong hook, CTA in the first sentence.",
        description: "AI-generated TikTok SEO package based on transcript and product reveal pacing.",
        scheduledFor: "2026-04-09T20:30:00.000Z",
        generatedSummary: "Hook-first copy with short punchy CTA and 6 niche hashtags."
      },
      {
        platform: "instagram",
        enabled: true,
        seoMode: "manual",
        title: "Nova One arrives tonight",
        caption: "We built this teaser to feel cinematic and direct.",
        description: "Manual Instagram caption for launch-day hype.",
        scheduledFor: "2026-04-09T21:00:00.000Z"
      },
      {
        platform: "youtube",
        enabled: false,
        seoMode: "manual",
        title: "",
        caption: "",
        description: "",
        scheduledFor: ""
      }
    ]
  },
  {
    id: "auto-002",
    companyId: "ember-auto",
    companyName: "Ember Auto",
    videoName: "Track mode walkaround.mov",
    videoUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
    transcriptStatus: "pending",
    createdAt: "2026-04-09T09:12:00.000Z",
    updatedAt: "2026-04-09T09:20:00.000Z",
    status: "processing",
    plans: [
      {
        platform: "tiktok",
        enabled: true,
        seoMode: "ai",
        title: "Track mode in 12 seconds",
        caption: "Transcript is queued. SEO pack will be generated when AI transcription completes.",
        description: "Auto-generated metadata pending transcript.",
        scheduledFor: "2026-04-10T17:15:00.000Z"
      },
      {
        platform: "youtube",
        enabled: false,
        seoMode: "manual",
        title: "Ember GT Track Mode Walkaround",
        caption: "A sharper chassis, louder exhaust, and a more aggressive aero package.",
        description: "Long-form YouTube description focusing on specs and performance.",
        scheduledFor: "2026-04-10T18:00:00.000Z"
      },
      {
        platform: "instagram",
        enabled: false,
        seoMode: "manual",
        title: "",
        caption: "",
        description: "",
        scheduledFor: ""
      }
    ]
  }
];

export const demoSnapshot: DashboardSnapshot = {
  companies,
  channels,
  automations
};
