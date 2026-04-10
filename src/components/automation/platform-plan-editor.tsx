"use client";

import Link from "next/link";

import { platformMeta } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import type { ChannelConnection, PlatformPlan } from "@/lib/types";

interface PlatformPlanEditorProps {
  channel?: ChannelConnection;
  plan: PlatformPlan;
  settingsHref: string;
  onChange: (plan: PlatformPlan) => void;
}

export function PlatformPlanEditor({
  channel,
  plan,
  settingsHref,
  onChange
}: PlatformPlanEditorProps) {
  const meta = platformMeta[plan.platform];
  const Icon = meta.icon;
  const isConnected = channel?.status === "connected";
  const statusLabel =
    channel?.status === "connected"
      ? channel.handle
      : channel?.status === "expired"
        ? "OAuth expired"
        : "OAuth required";

  return (
    <section
      className={cn(
        "panel-soft rounded-[1.5rem] border border-white/60 px-4 py-3"
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/70 p-2.5 text-rose-700 shadow-[0_10px_20px_rgba(190,102,78,0.2)]">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-rose-950">{meta.label}</h3>
              <p className="text-xs text-rose-900/60">{meta.helper}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={cn(
                "rounded-full border px-3 py-1 text-xs uppercase tracking-[0.22em]",
                isConnected
                  ? "border-emerald-200 bg-emerald-100/60 text-emerald-900"
                  : channel?.status === "expired"
                    ? "border-red-200 bg-red-100/60 text-red-900"
                    : "border-amber-200 bg-amber-100/70 text-amber-900"
              )}
            >
              {statusLabel}
            </div>

            <label className="inline-flex items-center gap-2 rounded-full border border-rose-200/70 bg-white/70 px-3 py-1 text-xs text-rose-900/80">
              <input
                type="checkbox"
                checked={plan.enabled}
                disabled={!isConnected}
                onChange={(event) =>
                  onChange({
                    ...plan,
                    enabled: event.target.checked
                  })
                }
                className="h-3.5 w-3.5 accent-red-500 disabled:cursor-not-allowed"
              />
              Enabled
            </label>
          </div>
        </div>

        {!isConnected ? (
          <div className="rounded-2xl border border-amber-200/60 bg-amber-100/60 px-3 py-2 text-xs text-amber-900">
            {channel?.status === "expired"
              ? `${meta.label} was linked before, but the OAuth session expired. Reconnect it in Settings before this company can publish there.`
              : `${meta.label} is not linked for this company yet. Uploads stay blocked until OAuth is completed in Settings.`}
            <div className="mt-2">
              <Link
                href={settingsHref}
                className="inline-flex items-center rounded-full border border-amber-200/80 bg-white/70 px-3 py-1 text-xs text-amber-900 transition hover:bg-white"
              >
                Open Settings
              </Link>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-3 py-2">
          <label className="flex items-center gap-2 text-xs text-rose-900/70">
            Scheduled time
            <input
              type="datetime-local"
              value={plan.scheduledFor}
              disabled={!isConnected || !plan.enabled}
              onChange={(event) =>
                onChange({
                  ...plan,
                  scheduledFor: event.target.value
                })
              }
              className="rounded-full border border-rose-200/60 bg-white/80 px-3 py-1 text-xs text-rose-900 outline-none transition focus:border-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex items-center gap-2 text-xs text-rose-900/70">
            <input
              type="checkbox"
              checked={plan.seoMode === "ai"}
              disabled={!isConnected || !plan.enabled}
              onChange={(event) =>
                onChange({
                  ...plan,
                  seoMode: event.target.checked ? "ai" : "manual"
                })
              }
              className="h-3.5 w-3.5 accent-red-500 disabled:cursor-not-allowed"
            />
            AI SEO
          </label>
        </div>

        {plan.seoMode === "manual" ? (
          <div className="grid gap-3 rounded-2xl border border-white/60 bg-white/70 p-3">
            <label className="grid gap-2">
              <span className="text-xs text-rose-900/70">Title</span>
              <input
                value={plan.title}
                disabled={!isConnected || !plan.enabled}
                onChange={(event) =>
                  onChange({
                    ...plan,
                    title: event.target.value
                  })
                }
                className="rounded-2xl border border-rose-200/60 bg-white/80 px-3 py-2 text-sm text-rose-900 outline-none transition focus:border-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={`Enter ${meta.label} title`}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs text-rose-900/70">Caption</span>
              <textarea
                value={plan.caption}
                disabled={!isConnected || !plan.enabled}
                onChange={(event) =>
                  onChange({
                    ...plan,
                    caption: event.target.value
                  })
                }
                className="min-h-20 rounded-2xl border border-rose-200/60 bg-white/80 px-3 py-2 text-sm text-rose-900 outline-none transition focus:border-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={`Enter ${meta.label} caption`}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs text-rose-900/70">Description</span>
              <textarea
                value={plan.description}
                disabled={!isConnected || !plan.enabled}
                onChange={(event) =>
                  onChange({
                    ...plan,
                    description: event.target.value
                  })
                }
                className="min-h-24 rounded-2xl border border-rose-200/60 bg-white/80 px-3 py-2 text-sm text-rose-900 outline-none transition focus:border-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={`Enter ${meta.label} description`}
              />
            </label>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-xs text-rose-900/70">
            AI SEO is enabled. Transcript-based metadata will be generated right after scheduling.
          </div>
        )}
      </div>
    </section>
  );
}
