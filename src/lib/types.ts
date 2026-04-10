export type PlatformId = "tiktok" | "instagram" | "youtube";

export type SeoMode = "ai" | "manual";

export type ChannelStatus = "connected" | "needs-auth" | "expired";

export interface Company {
  id: string;
  name: string;
  accent: string;
  summary: string;
}

export interface ChannelConnection {
  id: string;
  companyId: string;
  platform: PlatformId;
  handle: string;
  status: ChannelStatus;
  followers: string;
  avatarHue: string;
  connectedAt: string;
  providerAccountId?: string;
  scopeSummary?: string;
  tokenExpiresAt?: string;
  lastRefreshedAt?: string;
  lastError?: string;
}

export interface PlatformPlan {
  platform: PlatformId;
  enabled: boolean;
  seoMode: SeoMode;
  title: string;
  caption: string;
  description: string;
  scheduledFor: string;
  generatedSummary?: string;
  transcriptExcerpt?: string;
}

export interface Automation {
  id: string;
  companyId: string;
  companyName: string;
  mediaAssetId: string;
  videoName: string;
  videoUrl: string;
  contentType: string;
  transcript?: string | null;
  transcriptStatus: "pending" | "completed";
  createdAt: string;
  updatedAt: string;
  status: "draft" | "scheduled" | "processing" | "posted";
  plans: PlatformPlan[];
}

export interface AiTranscriptJob {
  automationId: string;
  sourceVideoUrl: string;
  requestedAt: string;
}

export interface GeneratedSeoPackage {
  platform: PlatformId;
  title: string;
  caption: string;
  description: string;
  hashtags: string[];
}

export interface DashboardSnapshot {
  companies: Company[];
  channels: ChannelConnection[];
  automations: Automation[];
}

export interface OAuthChannelCandidate {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PendingOAuthLinkSession {
  id: string;
  companyId: string;
  platform: PlatformId;
  candidates: OAuthChannelCandidate[];
  returnTo: string;
  expiresAt: string;
}
