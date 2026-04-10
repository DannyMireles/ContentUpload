"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock3, LoaderCircle, Trash2, UploadCloud, WandSparkles } from "lucide-react";

import { PlatformPlanEditor } from "@/components/automation/platform-plan-editor";
import { platformMeta, platformList } from "@/lib/platforms";
import {
  canScheduleChannel,
  getAutomationEligibility,
  getCompanyChannelMap
} from "@/lib/oauth/policy";
import type { Automation, ChannelConnection, Company, PlatformPlan } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AutomationComposerProps {
  channels: ChannelConnection[];
  mode: "create" | "edit";
  companies: Company[];
  initialAutomation?: Automation | null;
  initialCompanyId?: string;
}

function buildEmptyPlans() {
  const date = new Date();
  date.setHours(date.getHours() + 2);

  const template = date.toISOString().slice(0, 16);

  return platformList.map(
    (platform): PlatformPlan => ({
      platform,
      enabled: false,
      seoMode: "ai",
      title: "",
      caption: "",
      description: "",
      scheduledFor: template
    })
  );
}

function normalizePlansForCompany(
  plans: PlatformPlan[],
  companyId: string,
  channels: ChannelConnection[]
) {
  const companyChannelMap = getCompanyChannelMap(channels, companyId);

  return plans.map((plan) => {
    if (canScheduleChannel(companyChannelMap[plan.platform])) {
      return plan;
    }

    return {
      ...plan,
      enabled: false
    };
  });
}

export function AutomationComposer({
  channels,
  mode,
  companies,
  initialAutomation,
  initialCompanyId
}: AutomationComposerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [videoName, setVideoName] = useState(initialAutomation?.videoName ?? "");
  const [previewUrl, setPreviewUrl] = useState(initialAutomation?.videoUrl ?? "");
  const [contentType, setContentType] = useState(initialAutomation?.contentType ?? "");
  const [mediaAssetId, setMediaAssetId] = useState(initialAutomation?.mediaAssetId ?? "");
  const [ownedPreviewUrl, setOwnedPreviewUrl] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState(() => {
    if (initialAutomation?.companyId) {
      return initialAutomation.companyId;
    }

    if (initialCompanyId && companies.some((company) => company.id === initialCompanyId)) {
      return initialCompanyId;
    }

    return companies[0]?.id ?? "";
  });
  const [plans, setPlans] = useState<PlatformPlan[]>(() =>
    normalizePlansForCompany(
      initialAutomation?.plans?.map((plan) => ({
        ...plan,
        scheduledFor: plan.scheduledFor ? plan.scheduledFor.slice(0, 16) : ""
      })) ?? buildEmptyPlans(),
      initialAutomation?.companyId ?? initialCompanyId ?? companies[0]?.id ?? "",
      channels
    )
  );

  const company = companies.find((entry) => entry.id === companyId);
  const companyChannelMap = getCompanyChannelMap(channels, companyId);
  const settingsHref = `/settings?company=${companyId}`;
  const eligibility = getAutomationEligibility(companyId, plans, channels);
  const enabledPlans = eligibility.enabledPlans;
  const availableChannels = Object.values(companyChannelMap).filter(
    (channel) => channel?.status === "connected"
  );
  const hasUpload = Boolean(mediaAssetId);
  const isAudio = contentType.startsWith("audio/");
  const isVideo = contentType.startsWith("video/");

  useEffect(() => {
    return () => {
      if (ownedPreviewUrl) {
        URL.revokeObjectURL(ownedPreviewUrl);
      }
    };
  }, [ownedPreviewUrl]);

  useEffect(() => {
    setPlans((current) => normalizePlansForCompany(current, companyId, channels));
  }, [companyId, channels]);

  async function handleUpload(file: File) {
    setStatusMessage(null);

    if (!companyId) {
      setStatusMessage("Create or select a company before uploading.");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    if (ownedPreviewUrl) {
      URL.revokeObjectURL(ownedPreviewUrl);
    }

    setOwnedPreviewUrl(localUrl);
    setPreviewUrl(localUrl);
    setVideoName(file.name);
    setContentType(file.type);

    const formData = new FormData();
    formData.append("companyId", companyId);
    formData.append("file", file);

    startTransition(async () => {
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData
      });

      const data = (await response.json()) as {
        mediaAssetId?: string;
        signedUrl?: string;
        filename?: string;
        contentType?: string;
        message?: string;
      };

      if (!response.ok || !data.mediaAssetId) {
        setStatusMessage(data.message ?? "Upload failed. Try a different file.");
        return;
      }

      setMediaAssetId(data.mediaAssetId);
      setPreviewUrl(data.signedUrl ?? localUrl);
      setVideoName(data.filename ?? file.name);
      setContentType(data.contentType ?? file.type);
      setStatusMessage("Upload completed. Configure the schedule per platform.");
    });
  }

  function updatePlan(nextPlan: PlatformPlan) {
    setPlans((current) =>
      normalizePlansForCompany(
        current.map((plan) => (plan.platform === nextPlan.platform ? nextPlan : plan)),
        companyId,
        channels
      )
    );
  }

  async function handleSubmit() {
    setStatusMessage(null);

    if (!mediaAssetId) {
      setStatusMessage("Upload a video or audio file before scheduling.");
      return;
    }

    if (!eligibility.ok) {
      setStatusMessage(eligibility.message);
      return;
    }

    const payload = {
      companyId,
      mediaAssetId,
      plans
    };

    const endpoint =
      mode === "create"
        ? "/api/automations"
        : `/api/automations/${initialAutomation?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    startTransition(async () => {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatusMessage(data.message ?? "Something blocked the save.");
        return;
      }

      setStatusMessage(
        data.message ??
          (mode === "create"
            ? "Automation scheduled. AI SEO will generate metadata immediately."
            : "Automation updated. AI SEO refresh is running now.")
      );

      router.refresh();
    });
  }

  async function handleDelete() {
    if (!initialAutomation) {
      return;
    }

    const confirmed = window.confirm("Delete this automation? This should only remove the scheduled job after confirmation.");

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/automations/${initialAutomation.id}`, {
        method: "DELETE"
      });

      const data = (await response.json()) as { message?: string };
      setStatusMessage(data.message ?? "Deletion request sent.");
    });
  }

  return (
    <div className="grid gap-4">
      <section className="space-y-4">
        <div className="panel rounded-[2rem] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-rose-900/55">
                {mode === "create" ? "Composer" : "Edit automation"}
              </div>
              <h3 className="mt-3 text-3xl text-rose-950">
                {mode === "create"
                  ? "Upload once, schedule per channel."
                  : "Refine scheduled content without losing the workflow."}
              </h3>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-rose-900/70">
              Only OAuth-linked channels can be enabled for scheduling.
            </div>
          </div>

          <div className="mt-6">
            {company ? (
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-rose-900/70">
                <span className="text-xs uppercase tracking-[0.22em] text-rose-900/55">Company</span>
                <span className="font-medium text-rose-950">{company.name}</span>
                <span className="text-rose-900/60">Connected channels: {availableChannels.length}</span>
                <Link
                  href={settingsHref}
                  className="inline-flex items-center rounded-full border border-rose-200/70 bg-white/80 px-3 py-1 text-xs text-rose-900 transition hover:bg-white"
                >
                  Manage OAuth
                </Link>
              </div>
            ) : null}

            <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-rose-900/55">Source media</div>
                  <h4 className="mt-3 text-2xl text-rose-950">
                    {videoName || "Upload a video or audio file"}
                  </h4>
                  <p className="mt-2 text-sm text-rose-900/70">
                    Upload once. We store the original to transcribe and generate platform-specific SEO.
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center rounded-full border border-rose-200/70 bg-white/80 px-4 py-2 text-sm text-rose-900/80 transition hover:bg-white">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {hasUpload ? "Replace upload" : "Upload media"}
                  <input
                    type="file"
                    accept="video/*,audio/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void handleUpload(file);
                      }
                    }}
                  />
                </label>
              </div>

              <div className="mt-5 overflow-hidden rounded-3xl border border-rose-200/60 bg-white/60 p-4">
                {previewUrl ? (
                  isAudio ? (
                    <audio controls className="w-full">
                      <source src={previewUrl} />
                      Your browser does not support audio playback.
                    </audio>
                  ) : isVideo ? (
                    <video controls className="w-full rounded-2xl">
                      <source src={previewUrl} />
                      Your browser does not support video playback.
                    </video>
                  ) : (
                    <div className="flex h-40 items-center justify-center text-sm text-rose-900/60">
                      Media preview unavailable.
                    </div>
                  )
                ) : (
                  <div className="flex h-40 items-center justify-center text-sm text-rose-900/60">
                    Drop a file to preview it here.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[1.75rem] border border-rose-200/60 bg-white/70 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-rose-900/55">OAuth requirement</div>
                <div className="mt-3 text-lg text-rose-950">
                  {company?.name ?? "Selected company"} currently has {availableChannels.length} publishable channel{availableChannels.length === 1 ? "" : "s"}.
                </div>
                <div className="mt-2 text-sm leading-6 text-rose-900/70">
                  If a platform is not connected here, it stays disabled in the scheduler. There is no manual fallback path.
                </div>
              </div>
              <Link
                href={settingsHref}
                className="rounded-full border border-rose-200/70 bg-white/80 px-4 py-2 text-sm text-rose-900 transition hover:bg-white"
              >
                Manage OAuth in Settings
              </Link>
            </div>

            {availableChannels.length === 0 ? (
              <div className="mt-4 flex items-start gap-3 rounded-3xl border border-amber-200/60 bg-amber-100/70 px-4 py-4 text-sm text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                This company cannot schedule any uploads yet. Link at least one platform in Settings before creating an automation.
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          {plans.map((plan) => (
            <PlatformPlanEditor
              channel={companyChannelMap[plan.platform]}
              key={plan.platform}
              plan={plan}
              settingsHref={settingsHref}
              onChange={updatePlan}
            />
          ))}
        </div>
        <div className="panel rounded-[2rem] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-100 p-3 text-red-600">
              <WandSparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-rose-900/55">Schedule summary</div>
              <h3 className="mt-2 text-2xl text-rose-950">Ready targets</h3>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {enabledPlans.length > 0 ? enabledPlans.map((plan) => {
              const meta = platformMeta[plan.platform];

              return (
                <div key={plan.platform} className="rounded-3xl border border-rose-200/60 bg-white/70 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-rose-950">{meta.label}</div>
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs",
                        plan.seoMode === "ai"
                          ? "border-red-200/80 bg-red-100/80 text-red-700"
                          : "border-rose-200/70 bg-white/80 text-rose-900/70"
                      )}
                    >
                      {plan.seoMode === "ai" ? "AI SEO" : "Manual copy"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-rose-900/70">
                    <Clock3 className="h-4 w-4" />
                    {plan.scheduledFor || "Choose a post time"}
                  </div>
                </div>
              );
            }) : (
              <div className="rounded-3xl border border-rose-200/60 bg-white/70 p-4 text-sm text-rose-900/70">
                No connected platform has been enabled yet.
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !eligibility.ok || !mediaAssetId}
              className="button-primary inline-flex items-center rounded-full px-5 py-3 text-sm font-medium transition disabled:opacity-60"
            >
              {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              {mode === "create" ? "Schedule automation" : "Save changes"}
            </button>

            {mode === "edit" ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="button-danger inline-flex items-center rounded-full px-5 py-3 text-sm font-medium transition disabled:opacity-60"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete automation
              </button>
            ) : null}
          </div>

          {statusMessage ? (
            <div className={cn(
              "mt-5 rounded-3xl px-4 py-3 text-sm",
              statusMessage.toLowerCase().includes("scheduled") || statusMessage.toLowerCase().includes("updated")
                ? "border border-emerald-200/70 bg-emerald-100/70 text-emerald-900"
                : "border border-amber-200/60 bg-amber-100/70 text-amber-900"
            )}>
              {statusMessage}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
