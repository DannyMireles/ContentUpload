"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link2, LogOut, ShieldCheck, Unplug } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { platformMeta, platformList } from "@/lib/platforms";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { ChannelConnection, Company, PendingOAuthLinkSession } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

interface OAuthSettingsPanelProps {
  channels: ChannelConnection[];
  companies: Company[];
  initialCompanyId?: string;
  initialNotice?: string;
  initialSessionId?: string;
}

export function OAuthSettingsPanel({
  channels,
  companies,
  initialCompanyId,
  initialNotice,
  initialSessionId
}: OAuthSettingsPanelProps) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(initialNotice ?? null);
  const [pendingSession, setPendingSession] = useState<PendingOAuthLinkSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!initialSessionId) {
      return;
    }

    setIsLoadingSession(true);
    fetch(`/api/oauth/sessions/${initialSessionId}`)
      .then(async (response) => {
        const data = (await response.json()) as PendingOAuthLinkSession & {
          message?: string;
        };

        if (!response.ok) {
          setNotice(data.message ?? "OAuth session could not be loaded.");
          setPendingSession(null);
          return;
        }

        setPendingSession(data);
      })
      .catch(() => {
        setNotice("OAuth session could not be loaded.");
        setPendingSession(null);
      })
      .finally(() => setIsLoadingSession(false));
  }, [initialSessionId]);

  async function handleDisconnect(companyId: string, platform: string) {
    if (!window.confirm(`Unlink ${platformMeta[platform as keyof typeof platformMeta].label} for this company? This should remove all encrypted tokens for that connection.`)) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/oauth/${platform}/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ companyId })
      });

      const data = (await response.json()) as { message?: string };
      setNotice(data.message ?? "OAuth unlink request finished.");
      router.refresh();
    });
  }

  async function handleCompleteSession(candidateId: string) {
    if (!pendingSession) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/oauth/sessions/${pendingSession.id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ candidateId })
      });

      const data = (await response.json()) as { message?: string; returnTo?: string };
      setNotice(data.message ?? "OAuth link completed.");

      if (response.ok) {
        setPendingSession(null);
        if (data.returnTo) {
          router.replace(data.returnTo);
        } else {
          router.refresh();
        }
      }
    });
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="OAuth linking per company and platform"
        description="This is the single place to connect or reconnect TikTok, Instagram, and YouTube for each company. If a connection is missing or expired here, the scheduler will not allow uploads for that target."
      />

      <div className="panel rounded-[2rem] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-rose-900/55">Security</div>
            <h3 className="mt-2 text-2xl text-rose-950">Account safety</h3>
            <p className="mt-2 text-sm text-rose-900/70">
              OAuth is the only way to connect channels. Tokens are encrypted in Supabase and isolated per company.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="button-secondary inline-flex items-center rounded-full px-4 py-2 text-sm transition hover:bg-white"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </button>
        </div>
      </div>

      {notice ? (
        <div className="rounded-[1.75rem] border border-amber-200/60 bg-amber-100/70 px-4 py-4 text-sm text-amber-900">
          {notice}
        </div>
      ) : null}

      {isLoadingSession ? (
        <div className="rounded-[1.75rem] border border-rose-200/60 bg-white/70 px-4 py-4 text-sm text-rose-900/70">
          Loading OAuth session details...
        </div>
      ) : pendingSession ? (
        <div className="panel rounded-[2rem] p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-rose-900/55">Account selection</div>
              <h3 className="mt-2 text-2xl text-rose-950">
                Pick the {platformMeta[pendingSession.platform].label} account to link
              </h3>
              <p className="mt-2 text-sm text-rose-900/70">
                This provider returned multiple accounts. Choose the one that should publish for this company.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {pendingSession.candidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => handleCompleteSession(candidate.id)}
                disabled={isPending}
                className="flex items-center gap-4 rounded-[1.5rem] border border-rose-200/60 bg-white/70 px-4 py-4 text-left text-sm text-rose-900 transition hover:bg-white disabled:opacity-60"
              >
                {candidate.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={candidate.avatarUrl}
                    alt={candidate.displayName}
                    className="h-12 w-12 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                    {(candidate.displayName?.slice(0, 1).toUpperCase() ?? "?")}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate font-medium" title={candidate.displayName}>
                    {candidate.displayName}
                  </div>
                  <div className="truncate text-xs text-rose-900/60" title={candidate.handle}>
                    {candidate.handle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-5">
        {companies.map((company) => {
          const companyChannels = channels.filter((channel) => channel.companyId === company.id);
          const connectedCount = companyChannels.filter(
            (channel) => channel.status === "connected"
          ).length;

          return (
            <article
              key={company.id}
              className={cn(
                "panel rounded-[2rem] p-5",
                initialCompanyId === company.id && "ring-1 ring-red-300/30"
              )}
            >
              <div className={`h-1.5 rounded-full bg-gradient-to-r ${company.accent}`} />
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="break-words text-2xl text-rose-950">{company.name}</h3>
                  <p className="mt-3 break-words text-sm leading-6 text-rose-900/70">
                    {company.summary}
                  </p>
                </div>
                <StatusPill tone={connectedCount > 0 ? "success" : "warning"}>
                  {connectedCount}/3 linked
                </StatusPill>
              </div>

              <div className="mt-5 space-y-3">
                {platformList.map((platform) => {
                  const channel = companyChannels.find(
                    (entry) => entry.platform === platform
                  );
                  const meta = platformMeta[platform];
                  const Icon = meta.icon;

                  return (
                    <section
                      key={platform}
                      className="rounded-[1.25rem] border border-rose-200/60 bg-white/70 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="rounded-2xl bg-white/80 p-2.5 text-rose-700">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-rose-950">{meta.label}</div>
                            <div
                              className="max-w-[220px] truncate text-xs text-rose-900/68"
                              title={channel?.handle ?? "No linked account"}
                            >
                              {channel?.handle ?? "No linked account"}
                            </div>
                          </div>
                        </div>

                        {channel?.status === "connected" ? (
                          <StatusPill tone="success">Connected</StatusPill>
                        ) : channel?.status === "expired" ? (
                          <StatusPill tone="danger">Expired</StatusPill>
                        ) : (
                          <StatusPill tone="warning">Needs OAuth</StatusPill>
                        )}
                      </div>

                      <div className="mt-3 space-y-2 break-words text-xs text-rose-900/70">
                        <div>
                          OAuth-only publishing is enforced. This platform cannot be scheduled unless this connection is healthy.
                        </div>
                        {channel?.scopeSummary ? (
                          <div>Scopes: {channel.scopeSummary}</div>
                        ) : null}
                        {channel?.tokenExpiresAt ? (
                          <div>Token expiry: {formatDateTime(channel.tokenExpiresAt)}</div>
                        ) : null}
                        {channel?.lastError ? (
                          <div className="text-amber-800">{channel.lastError}</div>
                        ) : null}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3">
                        <Link
                          href={`/api/oauth/${platform}/start?companyId=${company.id}&returnTo=/settings?company=${company.id}`}
                          className="button-secondary inline-flex items-center rounded-full px-4 py-2 text-sm transition hover:bg-white"
                        >
                          <Link2 className="mr-2 h-4 w-4" />
                          {channel?.status === "connected" ? "Reconnect OAuth" : "Link account"}
                        </Link>

                        {channel ? (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleDisconnect(company.id, platform)}
                            className="button-danger inline-flex items-center rounded-full px-4 py-2 text-sm transition disabled:opacity-60"
                          >
                            <Unplug className="mr-2 h-4 w-4" />
                            Unlink
                          </button>
                        ) : null}
                      </div>
                    </section>
                  );
                })}
              </div>

              <div className="mt-4 rounded-[1.25rem] border border-rose-200/60 bg-white/70 px-4 py-3 text-xs text-rose-900/68">
                <div className="flex items-center gap-2 text-rose-900">
                  <ShieldCheck className="h-4 w-4" />
                  Encrypted tokens only
                </div>
                <div className="mt-2 leading-6">
                  Company tokens belong in encrypted database rows, one per platform per company. They should never be entered manually in the scheduler.
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
