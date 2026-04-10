import Link from "next/link";
import { ArrowRight, CalendarClock, FileAudio2, Pencil } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import { platformMeta } from "@/lib/platforms";
import type { Automation } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

interface ScheduledTaskListProps {
  automations: Automation[];
}

export function ScheduledTaskList({ automations }: ScheduledTaskListProps) {
  return (
    <div className="grid gap-5">
      {automations.map((automation) => (
        <article key={automation.id} className="panel overflow-hidden rounded-[2rem]">
          <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
            <div className="relative min-h-64 bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={automation.videoUrl}
                alt={automation.videoName}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            <div className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-rose-100/55">{automation.companyName}</div>
                  <h3 className="mt-3 text-3xl">{automation.videoName}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill tone={automation.status === "scheduled" ? "success" : "warning"}>
                      {automation.status}
                    </StatusPill>
                    <StatusPill tone={automation.transcriptStatus === "completed" ? "success" : "default"}>
                      Transcript {automation.transcriptStatus}
                    </StatusPill>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/automations/${automation.id}`}
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-rose-50 transition hover:bg-white/10"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.75rem] border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-rose-100/55">
                    <CalendarClock className="h-4 w-4" />
                    Planned delivery
                  </div>
                  <div className="mt-4 grid gap-3">
                    {automation.plans
                      .filter((plan) => plan.enabled)
                      .map((plan) => {
                        const meta = platformMeta[plan.platform];

                        return (
                          <div
                            key={plan.platform}
                            className="rounded-3xl border border-white/8 bg-white/4 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-medium text-white">{meta.label}</div>
                              <StatusPill tone={plan.seoMode === "ai" ? "warning" : "default"}>
                                {plan.seoMode === "ai" ? "AI generated" : "Manual"}
                              </StatusPill>
                            </div>
                            <div className="mt-3 text-sm text-rose-100/70">
                              Scheduled for {formatDateTime(plan.scheduledFor)}
                            </div>
                            <div className="mt-2 text-sm text-rose-50/90">{plan.title || "Pending AI generation"}</div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-rose-100/55">
                    <FileAudio2 className="h-4 w-4" />
                    Generated notes
                  </div>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-rose-100/72">
                    {automation.plans
                      .filter((plan) => plan.enabled)
                      .map((plan) => (
                        <div key={plan.platform} className="rounded-3xl border border-white/8 bg-white/4 p-4">
                          <div className="font-medium text-white">{platformMeta[plan.platform].label}</div>
                          <div className="mt-2">{plan.generatedSummary ?? plan.description}</div>
                        </div>
                      ))}
                  </div>
                  <Link
                    href={`/automations/${automation.id}`}
                    className="mt-4 inline-flex items-center text-sm text-red-100/88 transition hover:text-white"
                  >
                    Inspect full automation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
