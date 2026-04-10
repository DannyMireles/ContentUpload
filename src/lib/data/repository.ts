import type { SupabaseClient } from "@supabase/supabase-js";

import { AUTOMATION_MEDIA_BUCKET, createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { decryptSecret, encryptSecret } from "@/lib/security/encryption";
import type {
  Automation,
  ChannelConnection,
  Company,
  DashboardSnapshot,
  OAuthChannelCandidate,
  PendingOAuthLinkSession,
  PlatformId,
  PlatformPlan
} from "@/lib/types";

interface CompanyRow {
  id: string;
  name: string;
  summary: string;
}

interface ChannelRow {
  id: string;
  company_id: string;
  platform: PlatformId;
  handle: string;
  status: ChannelConnection["status"];
  provider_account_id: string | null;
  scope_summary: string | null;
  token_expires_at: string | null;
  last_refreshed_at: string | null;
  last_error: string | null;
  created_at: string;
}

interface MediaAssetRow {
  id: string;
  company_id: string;
  original_filename: string;
  storage_path: string;
  transcript: string | null;
  transcript_status: "pending" | "processing" | "completed" | "failed";
  content_type: string | null;
  created_at: string;
  updated_at: string | null;
}

interface AutomationRow {
  id: string;
  company_id: string;
  media_asset_id: string;
  status: Automation["status"] | "failed";
  created_at: string;
  updated_at: string;
}

interface AutomationTargetRow {
  id: string;
  automation_id: string;
  platform: PlatformId;
  seo_mode: PlatformPlan["seoMode"];
  title: string;
  caption: string;
  description: string;
  generated_payload: Record<string, unknown> | null;
  scheduled_for: string | null;
  status: string;
}

interface OAuthLinkStateRow {
  id: string;
  company_id: string;
  platform: PlatformId;
  code_verifier: string;
  return_to: string;
  expires_at: string;
}

interface OAuthLinkSessionRow {
  id: string;
  company_id: string;
  platform: PlatformId;
  encrypted_access_token: Record<string, string>;
  encrypted_refresh_token: Record<string, string> | null;
  token_expires_at: string | null;
  refresh_token_expires_at: string | null;
  scope_summary: string | null;
  candidates: OAuthChannelCandidate[];
  return_to: string;
  expires_at: string;
}

interface CompanyOAuthAppRow {
  id: string;
  company_id: string;
  platform: PlatformId;
  client_id: string;
  encrypted_client_secret: Record<string, string>;
}

type ClientOptions = { useAdmin?: boolean };

async function getSupabaseClient(options?: ClientOptions) {
  if (options?.useAdmin) {
    return createSupabaseAdminClient();
  }

  return await createSupabaseServerClient();
}

async function requireUser(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("Unauthorized.");
  }

  return data.user;
}

function companyAccent(id: string) {
  const accents = [
    "from-red-400 to-orange-200",
    "from-rose-400 to-red-200",
    "from-orange-300 to-rose-200",
    "from-red-500 to-amber-200"
  ];

  let total = 0;
  for (const character of id) {
    total += character.charCodeAt(0);
  }

  return accents[total % accents.length];
}

function channelAvatar(id: string) {
  const accents = [
    "from-red-400 to-orange-200",
    "from-orange-300 to-rose-400",
    "from-rose-300 to-red-500"
  ];

  let total = 0;
  for (const character of id) {
    total += character.charCodeAt(0);
  }

  return accents[total % accents.length];
}

function mapCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    summary: row.summary,
    accent: companyAccent(row.id)
  };
}

function mapChannel(row: ChannelRow): ChannelConnection {
  return {
    id: row.id,
    companyId: row.company_id,
    platform: row.platform,
    handle: row.handle,
    status: row.status,
    followers: row.scope_summary ? "OAuth linked" : "OAuth pending",
    avatarHue: channelAvatar(row.id),
    connectedAt: row.created_at,
    providerAccountId: row.provider_account_id ?? undefined,
    scopeSummary: row.scope_summary ?? undefined,
    tokenExpiresAt: row.token_expires_at ?? undefined,
    lastRefreshedAt: row.last_refreshed_at ?? undefined,
    lastError: row.last_error ?? undefined
  };
}

async function getSignedUrlMap(paths: string[]) {
  const supabase = await getSupabaseClient();
  const signedUrls = await Promise.all(
    [...new Set(paths.filter(Boolean))].map(async (path) => {
      const { data } = await supabase.storage
        .from(AUTOMATION_MEDIA_BUCKET)
        .createSignedUrl(path, 60 * 60);

      return [path, data?.signedUrl ?? ""] as const;
    })
  );

  return new Map(signedUrls);
}

function mapAutomation(
  row: AutomationRow,
  companyMap: Map<string, Company>,
  mediaMap: Map<string, MediaAssetRow>,
  targetMap: Map<string, AutomationTargetRow[]>,
  urlMap: Map<string, string>
): Automation | null {
  const company = companyMap.get(row.company_id);
  const media = mediaMap.get(row.media_asset_id);

  if (!company || !media) {
    return null;
  }

  return {
    id: row.id,
    companyId: row.company_id,
    companyName: company.name,
    mediaAssetId: row.media_asset_id,
    videoName: media.original_filename,
    videoUrl: urlMap.get(media.storage_path) ?? "",
    contentType: media.content_type ?? "application/octet-stream",
    transcript: media.transcript,
    transcriptStatus:
      media.transcript_status === "completed" ? "completed" : "pending",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status === "failed" ? "processing" : row.status,
    plans: (targetMap.get(row.id) ?? []).map((target) => ({
      platform: target.platform,
      enabled: target.status !== "cancelled",
      seoMode: target.seo_mode,
      title: target.title,
      caption: target.caption,
      description: target.description,
      scheduledFor: target.scheduled_for ?? "",
      generatedSummary:
        typeof target.generated_payload?.summary === "string"
          ? target.generated_payload.summary
          : undefined,
      transcriptExcerpt:
        typeof target.generated_payload?.transcriptExcerpt === "string"
          ? target.generated_payload.transcriptExcerpt
          : undefined
    }))
  };
}

async function getBaseData() {
  const supabase = await getSupabaseClient();
  const [companiesResult, channelsResult, mediaResult, automationsResult, targetsResult] =
    await Promise.all([
      supabase.from("companies").select("id,name,summary").order("created_at"),
      supabase
        .from("company_channels")
        .select(
          "id,company_id,platform,handle,status,provider_account_id,scope_summary,token_expires_at,last_refreshed_at,last_error,created_at"
        )
        .order("created_at"),
      supabase
        .from("media_assets")
        .select(
          "id,company_id,original_filename,storage_path,transcript,transcript_status,content_type,created_at,updated_at"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("automations")
        .select("id,company_id,media_asset_id,status,created_at,updated_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("automation_targets")
        .select(
          "id,automation_id,platform,seo_mode,title,caption,description,generated_payload,scheduled_for,status"
        )
        .order("scheduled_for", { ascending: true })
    ]);

  if (companiesResult.error) throw companiesResult.error;
  if (channelsResult.error) throw channelsResult.error;
  if (mediaResult.error) throw mediaResult.error;
  if (automationsResult.error) throw automationsResult.error;
  if (targetsResult.error) throw targetsResult.error;

  return {
    companies: companiesResult.data as CompanyRow[],
    channels: channelsResult.data as ChannelRow[],
    mediaAssets: mediaResult.data as MediaAssetRow[],
    automations: automationsResult.data as AutomationRow[],
    targets: targetsResult.data as AutomationTargetRow[]
  };
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const { companies, channels, mediaAssets, automations, targets } = await getBaseData();

  const mappedCompanies = companies.map(mapCompany);
  const companyMap = new Map(mappedCompanies.map((company) => [company.id, company]));
  const mediaMap = new Map(mediaAssets.map((media) => [media.id, media]));
  const targetMap = new Map<string, AutomationTargetRow[]>();

  targets.forEach((target) => {
    const existing = targetMap.get(target.automation_id) ?? [];
    existing.push(target);
    targetMap.set(target.automation_id, existing);
  });

  const urlMap = await getSignedUrlMap(mediaAssets.map((media) => media.storage_path));
  const mappedAutomations = automations
    .map((automation) =>
      mapAutomation(automation, companyMap, mediaMap, targetMap, urlMap)
    )
    .filter(Boolean) as Automation[];

  return {
    companies: mappedCompanies,
    channels: channels.map(mapChannel),
    automations: mappedAutomations
  };
}

export async function getAutomationById(id: string) {
  const snapshot = await getDashboardSnapshot();
  return snapshot.automations.find((automation) => automation.id === id) ?? null;
}

export async function getChannels() {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("company_channels")
    .select(
      "id,company_id,platform,handle,status,provider_account_id,scope_summary,token_expires_at,last_refreshed_at,last_error,created_at"
    )
    .order("created_at");

  if (error) {
    throw error;
  }

  return (data as ChannelRow[]).map(mapChannel);
}

export async function createCompany(input: {
  name: string;
  summary: string;
}) {
  const supabase = await getSupabaseClient();
  const user = await requireUser(supabase);
  const { data, error } = await supabase
    .from("companies")
    .insert({
      name: input.name,
      summary: input.summary
    })
    .select("id,name,summary")
    .single();

  if (error) {
    throw error;
  }

  const company = mapCompany(data as CompanyRow);

  const { error: memberError } = await supabase.from("company_members").insert({
    company_id: company.id,
    user_id: user.id,
    role: "owner"
  });

  if (memberError) {
    throw memberError;
  }

  return company;
}

export async function updateCompany(input: {
  id: string;
  name: string;
  summary: string;
}) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("companies")
    .update({
      name: input.name,
      summary: input.summary
    })
    .eq("id", input.id)
    .select("id,name,summary")
    .single();

  if (error) {
    throw error;
  }

  return mapCompany(data as CompanyRow);
}

export async function deleteCompany(companyId: string) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("companies").delete().eq("id", companyId);

  if (error) {
    throw error;
  }
}

export async function getCompanyOAuthApp(input: {
  companyId: string;
  platform: PlatformId;
}) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("company_oauth_apps")
    .select("id,company_id,platform,client_id,encrypted_client_secret")
    .eq("company_id", input.companyId)
    .eq("platform", input.platform)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as CompanyOAuthAppRow;
  return {
    clientId: row.client_id,
    clientSecret: decryptSecret(row.encrypted_client_secret)
  };
}

export async function upsertCompanyOAuthApp(input: {
  companyId: string;
  platform: PlatformId;
  clientId: string;
  clientSecret: string;
}) {
  const supabase = await getSupabaseClient();
  const encryptedClientSecret = encryptSecret(input.clientSecret);

  const { error } = await supabase.from("company_oauth_apps").upsert(
    {
      company_id: input.companyId,
      platform: input.platform,
      client_id: input.clientId,
      encrypted_client_secret: encryptedClientSecret
    },
    {
      onConflict: "company_id,platform"
    }
  );

  if (error) {
    throw error;
  }
}

export async function deleteCompanyOAuthApp(input: {
  companyId: string;
  platform: PlatformId;
}) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from("company_oauth_apps")
    .delete()
    .eq("company_id", input.companyId)
    .eq("platform", input.platform);

  if (error) {
    throw error;
  }
}

export async function createMediaAsset(input: {
  companyId: string;
  storagePath: string;
  originalFilename: string;
  contentType: string | null;
}) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      company_id: input.companyId,
      storage_path: input.storagePath,
      original_filename: input.originalFilename,
      content_type: input.contentType,
      transcript_status: "pending"
    })
    .select(
      "id,company_id,original_filename,storage_path,transcript,transcript_status,content_type,created_at,updated_at"
    )
    .single();

  if (error) {
    throw error;
  }

  return data as MediaAssetRow;
}

export async function getMediaAssetById(id: string, options?: ClientOptions) {
  const supabase = await getSupabaseClient(options);
  const { data, error } = await supabase
    .from("media_assets")
    .select(
      "id,company_id,original_filename,storage_path,transcript,transcript_status,content_type,created_at,updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as MediaAssetRow | null) ?? null;
}

export async function updateMediaTranscript(
  input: {
  mediaAssetId: string;
  transcript: string;
  },
  options?: ClientOptions
) {
  const supabase = await getSupabaseClient(options);
  const { error } = await supabase
    .from("media_assets")
    .update({
      transcript: input.transcript,
      transcript_status: "completed"
    })
    .eq("id", input.mediaAssetId);

  if (error) {
    throw error;
  }
}

export async function markMediaTranscriptFailed(
  mediaAssetId: string,
  message: string,
  options?: ClientOptions
) {
  const supabase = await getSupabaseClient(options);
  const { error } = await supabase
    .from("media_assets")
    .update({
      transcript_status: "failed",
      transcript: message
    })
    .eq("id", mediaAssetId);

  if (error) {
    throw error;
  }
}

export async function createAutomationWithTargets(input: {
  companyId: string;
  mediaAssetId: string;
  plans: PlatformPlan[];
}) {
  const supabase = await getSupabaseClient();
  const { data: automation, error } = await supabase
    .from("automations")
    .insert({
      company_id: input.companyId,
      media_asset_id: input.mediaAssetId,
      status: "scheduled"
    })
    .select("id,company_id,media_asset_id,status,created_at,updated_at")
    .single();

  if (error) {
    throw error;
  }

  const targets = input.plans
    .filter((plan) => plan.enabled)
    .map((plan) => ({
      automation_id: automation.id,
      platform: plan.platform,
      seo_mode: plan.seoMode,
      title: plan.seoMode === "manual" ? plan.title : "",
      caption: plan.seoMode === "manual" ? plan.caption : "",
      description: plan.seoMode === "manual" ? plan.description : "",
      scheduled_for: plan.scheduledFor,
      status: "scheduled"
    }));

  if (targets.length > 0) {
    const { error: targetError } = await supabase
      .from("automation_targets")
      .insert(targets);

    if (targetError) {
      throw targetError;
    }
  }

  return automation as AutomationRow;
}

export async function replaceAutomationTargets(input: {
  automationId: string;
  plans: PlatformPlan[];
}) {
  const supabase = await getSupabaseClient();
  const { error: deleteError } = await supabase
    .from("automation_targets")
    .delete()
    .eq("automation_id", input.automationId);

  if (deleteError) {
    throw deleteError;
  }

  const targets = input.plans
    .filter((plan) => plan.enabled)
    .map((plan) => ({
      automation_id: input.automationId,
      platform: plan.platform,
      seo_mode: plan.seoMode,
      title: plan.seoMode === "manual" ? plan.title : "",
      caption: plan.seoMode === "manual" ? plan.caption : "",
      description: plan.seoMode === "manual" ? plan.description : "",
      scheduled_for: plan.scheduledFor,
      status: "scheduled"
    }));

  if (targets.length > 0) {
    const { error: insertError } = await supabase
      .from("automation_targets")
      .insert(targets);

    if (insertError) {
      throw insertError;
    }
  }
}

export async function updateAutomationTargetSeo(
  input: {
  automationId: string;
  platform: PlatformId;
  title: string;
  caption: string;
  description: string;
  generatedPayload: Record<string, unknown>;
  },
  options?: ClientOptions
) {
  const supabase = await getSupabaseClient(options);
  const { error } = await supabase
    .from("automation_targets")
    .update({
      title: input.title,
      caption: input.caption,
      description: input.description,
      generated_payload: input.generatedPayload
    })
    .eq("automation_id", input.automationId)
    .eq("platform", input.platform);

  if (error) {
    throw error;
  }
}

export async function updateAutomationStatus(automationId: string, status: string) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from("automations")
    .update({
      status
    })
    .eq("id", automationId);

  if (error) {
    throw error;
  }
}

export async function updateAutomationMediaAsset(input: {
  automationId: string;
  mediaAssetId: string;
}) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from("automations")
    .update({
      media_asset_id: input.mediaAssetId
    })
    .eq("id", input.automationId);

  if (error) {
    throw error;
  }
}

export async function deleteAutomation(automationId: string) {
  const supabase = await getSupabaseClient();
  const { error: targetError } = await supabase
    .from("automation_targets")
    .delete()
    .eq("automation_id", automationId);

  if (targetError) {
    throw targetError;
  }

  const { error: automationError } = await supabase
    .from("automations")
    .delete()
    .eq("id", automationId);

  if (automationError) {
    throw automationError;
  }
}

export async function saveOAuthLinkState(input: {
  id: string;
  companyId: string;
  platform: PlatformId;
  codeVerifier: string;
  returnTo: string;
  expiresAt: string;
}) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("oauth_link_states").insert({
    id: input.id,
    company_id: input.companyId,
    platform: input.platform,
    code_verifier: input.codeVerifier,
    return_to: input.returnTo,
    expires_at: input.expiresAt
  });

  if (error) {
    throw error;
  }
}

export async function consumeOAuthLinkState(id: string) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("oauth_link_states")
    .select("id,company_id,platform,code_verifier,return_to,expires_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  await supabase.from("oauth_link_states").delete().eq("id", id);
  return data as OAuthLinkStateRow;
}

export async function createPendingOAuthLinkSession(input: {
  id: string;
  companyId: string;
  platform: PlatformId;
  encryptedAccessToken: Record<string, string>;
  encryptedRefreshToken: Record<string, string> | null;
  tokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  scopeSummary: string | null;
  candidates: OAuthChannelCandidate[];
  returnTo: string;
  expiresAt: string;
}) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("oauth_link_sessions").insert({
    id: input.id,
    company_id: input.companyId,
    platform: input.platform,
    encrypted_access_token: input.encryptedAccessToken,
    encrypted_refresh_token: input.encryptedRefreshToken,
    token_expires_at: input.tokenExpiresAt,
    refresh_token_expires_at: input.refreshTokenExpiresAt,
    scope_summary: input.scopeSummary,
    candidates: input.candidates,
    return_to: input.returnTo,
    expires_at: input.expiresAt
  });

  if (error) {
    throw error;
  }
}

export async function getPendingOAuthLinkSession(id: string) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("oauth_link_sessions")
    .select(
      "id,company_id,platform,encrypted_access_token,encrypted_refresh_token,token_expires_at,refresh_token_expires_at,scope_summary,candidates,return_to,expires_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as OAuthLinkSessionRow | null) ?? null;
}

export async function deletePendingOAuthLinkSession(id: string) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("oauth_link_sessions").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getPendingOAuthLinkSessionSummary(
  id: string
): Promise<PendingOAuthLinkSession | null> {
  const session = await getPendingOAuthLinkSession(id);

  if (!session) {
    return null;
  }

  return {
    id: session.id,
    companyId: session.company_id,
    platform: session.platform,
    candidates: session.candidates,
    returnTo: session.return_to,
    expiresAt: session.expires_at
  };
}

export async function upsertCompanyChannelLink(input: {
  companyId: string;
  platform: PlatformId;
  handle: string;
  providerAccountId: string;
  encryptedAccessToken: Record<string, string>;
  encryptedRefreshToken: Record<string, string> | null;
  tokenExpiresAt: string | null;
  scopeSummary: string | null;
}) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("company_channels").upsert(
    {
      company_id: input.companyId,
      platform: input.platform,
      handle: input.handle,
      provider_account_id: input.providerAccountId,
      status: "connected",
      encrypted_access_token: input.encryptedAccessToken,
      encrypted_refresh_token: input.encryptedRefreshToken,
      token_expires_at: input.tokenExpiresAt,
      scope_summary: input.scopeSummary,
      last_refreshed_at: new Date().toISOString(),
      last_error: null
    },
    {
      onConflict: "company_id,platform"
    }
  );

  if (error) {
    throw error;
  }
}

export async function disconnectCompanyChannel(input: {
  companyId: string;
  platform: PlatformId;
}) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from("company_channels")
    .update({
      status: "needs-auth",
      handle: `${input.platform} not linked`,
      provider_account_id: null,
      encrypted_access_token: null,
      encrypted_refresh_token: null,
      token_expires_at: null,
      scope_summary: null,
      last_refreshed_at: null,
      last_error: "Channel unlinked from the control panel."
    })
    .eq("company_id", input.companyId)
    .eq("platform", input.platform);

  if (error) {
    throw error;
  }
}
