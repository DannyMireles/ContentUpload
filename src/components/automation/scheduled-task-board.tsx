"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, PlayCircle, Sparkles, X } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import { platformMeta } from "@/lib/platforms";
import type { Automation, PlatformPlan } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

interface ScheduledTaskBoardProps {
  automations: Automation[];
}

function hasAiSeo(plans: PlatformPlan[]) {
  return plans.some((plan) => plan.enabled && plan.seoMode === "ai");
}

export function ScheduledTaskBoard({ automations }: ScheduledTaskBoardProps) {
  const [activeAutomation, setActiveAutomation] = useState<Automation | null>(null);

  return (
    <>
      {automations.length === 0 ? (
        <div className="panel rounded-[2rem] px-5 py-6 text-sm text-rose-900/70">
          No scheduled automations yet. Create one to see it here.
        </div>
      ) : null}

      <div className="grid gap-5">
        {automations.map((automation) => {
          const aiEnabled = hasAiSeo(automation.plans);
          const enabledPlans = automation.plans.filter((plan) => plan.enabled);
          const isAudio = automation.contentType.startsWith("audio/");
          const isVideo = automation.contentType.startsWith("video/");

          return (
            <article
              key={automation.id}
              className="panel rounded-[2rem] p-5 transition hover:shadow-[0_18px_34px_rgba(150,82,52,0.18)]"
            >
              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <div className="rounded-[1.5rem] border border-rose-200/60 bg-white/70 p-3">
                  {isAudio ? (
                    <div className="flex h-full min-h-32 flex-col items-center justify-center text-rose-900/60">
                      <PlayCircle className="h-8 w-8" />
                      <div className="mt-2 text-xs uppercase tracking-[0.24em]">Audio</div>
                    </div>
                  ) : isVideo ? (
                    <video
                      src={automation.videoUrl}
                      muted
                      playsInline
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-32 flex-col items-center justify-center text-rose-900/60">
                      <PlayCircle className="h-8 w-8" />
                      <div className="mt-2 text-xs uppercase tracking-[0.24em]">Media</div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-xs uppercase tracking-[0.24em] text-rose-900/55" title={automation.companyName}>
                        {automation.companyName}
                      </div>
                      <h3 className="mt-2 break-words text-2xl text-rose-950">
                        {automation.videoName}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <StatusPill tone={automation.status === "scheduled" ? "success" : "warning"}>
                          {automation.status}
                        </StatusPill>
                        {aiEnabled ? (
                          <StatusPill tone="warning">AI SEO</StatusPill>
                        ) : (
                          <StatusPill tone="default">Manual only</StatusPill>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveAutomation(automation)}
                      className="inline-flex items-center rounded-full border border-rose-200/70 bg-white/80 px-4 py-2 text-sm text-rose-900 transition hover:bg-white"
                    >
                      View details
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {enabledPlans.map((plan) => (
                      <div
                        key={plan.platform}
                        className="rounded-[1.25rem] border border-rose-200/60 bg-white/70 px-4 py-3 text-sm text-rose-900/70"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-rose-950">
                            {platformMeta[plan.platform].label}
                          </div>
                          <StatusPill tone={plan.seoMode === "ai" ? "warning" : "default"}>
                            {plan.seoMode === "ai" ? "AI SEO" : "Manual"}
                          </StatusPill>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-rose-900/60">
                          <CalendarClock className="h-4 w-4" />
                          {plan.scheduledFor ? formatDateTime(plan.scheduledFor) : "Unscheduled"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {activeAutomation ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur"
          onClick={() => setActiveAutomation(null)}
        >
          <div
            className="panel max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="truncate text-xs uppercase tracking-[0.24em] text-rose-900/55" title={activeAutomation.companyName}>
                  {activeAutomation.companyName}
                </div>
                <h3 className="mt-2 break-words text-3xl text-rose-950">
                  {activeAutomation.videoName}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusPill tone={activeAutomation.status === "scheduled" ? "success" : "warning"}>
                    {activeAutomation.status}
                  </StatusPill>
                  {hasAiSeo(activeAutomation.plans) ? (
                    <StatusPill tone="warning">AI SEO enabled</StatusPill>
                  ) : (
                    <StatusPill tone="default">Manual only</StatusPill>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveAutomation(null)}
                className="inline-flex items-center rounded-full border border-rose-200/70 bg-white/80 px-4 py-2 text-sm text-rose-900 transition hover:bg-white"
              >
                <X className="mr-2 h-4 w-4" />
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.5rem] border border-rose-200/60 bg-white/70 p-4">
                {activeAutomation.contentType.startsWith("audio/") ? (
                  <audio controls className="w-full">
                    <source src={activeAutomation.videoUrl} />
                    Your browser does not support audio playback.
                  </audio>
                ) : activeAutomation.contentType.startsWith("video/") ? (
                  <video controls className="w-full rounded-2xl">
                    <source src={activeAutomation.videoUrl} />
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <div className="flex h-40 items-center justify-center text-sm text-rose-900/60">
                    Media preview unavailable.
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {activeAutomation.plans
                  .filter((plan) => plan.enabled)
                  .map((plan) => (
                    <div
                      key={plan.platform}
                      className="rounded-[1.5rem] border border-rose-200/60 bg-white/70 px-4 py-4 text-sm text-rose-900/70"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium text-rose-950">
                          {platformMeta[plan.platform].label}
                        </div>
                        <StatusPill tone={plan.seoMode === "ai" ? "warning" : "default"}>
                          {plan.seoMode === "ai" ? "AI SEO" : "Manual"}
                        </StatusPill>
                      </div>
                      <div className="mt-2 text-xs text-rose-900/60">
                        Scheduled for {plan.scheduledFor ? formatDateTime(plan.scheduledFor) : "Not set"}
                      </div>
                      <div className="mt-2 break-words text-sm text-rose-900/70">
                        {plan.seoMode === "ai"
                          ? plan.generatedSummary ?? "AI metadata queued."
                          : plan.caption || plan.description || "Manual copy not provided."}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {hasAiSeo(activeAutomation.plans) ? (
              <div className="mt-6 rounded-[1.5rem] border border-rose-200/60 bg-white/70 px-4 py-4 text-sm text-rose-900/70">
                <div className="flex items-center gap-2 text-rose-950">
                  <Sparkles className="h-4 w-4" />
                  Transcript
                </div>
                <div className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap break-words">
                  {activeAutomation.transcript ?? "Transcript is still processing."}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/automations/${activeAutomation.id}`}
                className="button-primary inline-flex items-center rounded-full px-5 py-3 text-sm font-medium transition"
              >
                Edit automation
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
