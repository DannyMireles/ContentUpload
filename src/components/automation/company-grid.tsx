"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Pencil, Plus, Sparkles, Unplug, X } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { platformMeta } from "@/lib/platforms";
import type { ChannelConnection, Company, PlatformId } from "@/lib/types";

interface CompanyGridProps {
  companies: Company[];
  channels: ChannelConnection[];
}

const platforms: PlatformId[] = ["tiktok", "instagram", "youtube"];

export function CompanyGrid({ companies, channels }: CompanyGridProps) {
  const router = useRouter();
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id ?? "");
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanySummary, setNewCompanySummary] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editCompanySummary, setEditCompanySummary] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const selectedCompany = companies.find((company) => company.id === selectedCompanyId);
  const companyChannels = channels.filter((channel) => channel.companyId === selectedCompanyId);

  useEffect(() => {
    if (!selectedCompany) {
      setEditCompanyName("");
      setEditCompanySummary("");
      return;
    }

    setEditCompanyName(selectedCompany.name);
    setEditCompanySummary(selectedCompany.summary);
  }, [selectedCompany]);

  async function handleDisconnect(platform: PlatformId) {
    if (!selectedCompanyId) {
      return;
    }

    if (!window.confirm(`Unlink ${platformMeta[platform].label} for this company?`)) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/oauth/${platform}/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ companyId: selectedCompanyId })
      });

      const data = (await response.json()) as { message?: string };
      setNotice(data.message ?? "Connection updated.");
      router.refresh();
    });
  }

  async function handleUpdateCompany() {
    if (!selectedCompany) {
      return;
    }

    if (!editCompanyName.trim()) {
      setNotice("Company name is required.");
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: editCompanyName.trim(),
          summary: editCompanySummary.trim()
        })
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setNotice(data.message ?? "Failed to update company.");
        return;
      }

      setNotice("Company updated.");
      setIsEditOpen(false);
      router.refresh();
    });
  }

  async function handleCreateCompany() {
    if (!newCompanyName.trim()) {
      setNotice("Company name is required.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newCompanyName.trim(),
          summary: newCompanySummary.trim()
        })
      });

      const data = (await response.json()) as { message?: string; companyId?: string };
      if (!response.ok) {
        setNotice(data.message ?? "Failed to create company.");
        return;
      }

      setNewCompanyName("");
      setNewCompanySummary("");
      setNotice("Company created.");
      setIsCreateOpen(false);

      if (data.companyId) {
        setSelectedCompanyId(data.companyId);
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Companies"
        title="Manage platform links per company"
        description="Pick a company to review the connected TikTok, Instagram, and YouTube accounts. Unlinking removes stored tokens immediately."
        actions={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="button-primary inline-flex items-center justify-center rounded-full p-3 transition"
              aria-label="Add company"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => selectedCompany && setIsEditOpen(true)}
              className="button-primary inline-flex items-center justify-center rounded-full p-3 transition disabled:opacity-60"
              aria-label="Edit company"
              disabled={!selectedCompany}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <Link
              href={selectedCompanyId ? `/automations/new?company=${selectedCompanyId}` : "/automations/new"}
              className="button-primary inline-flex items-center justify-center rounded-full p-3 transition"
              aria-label="New automation"
            >
              <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        }
      />

      {notice ? (
        <div className="rounded-[1.5rem] border border-amber-200/60 bg-amber-100/70 px-4 py-3 text-sm text-amber-900">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="panel rounded-[2rem] p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-rose-900/55">Companies</div>
          <div className="mt-4 grid gap-3">
            {companies.map((company) => (
              <button
                key={company.id}
                type="button"
                onClick={() => setSelectedCompanyId(company.id)}
                className={`flex w-full items-center justify-between rounded-[1.5rem] border px-4 py-3 text-left text-sm transition ${
                  company.id === selectedCompanyId
                    ? "border-rose-200/70 bg-white/80 text-rose-950 shadow-[0_12px_24px_rgba(160,86,56,0.12)]"
                    : "border-white/60 bg-white/60 text-rose-900/70 hover:bg-white"
                }`}
              >
                <div>
                  <div className="font-medium">{company.name}</div>
                  <div className="text-xs text-rose-900/60">{company.summary}</div>
                </div>
                <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${company.accent}`} />
              </button>
            ))}
            {companies.length === 0 ? (
              <div className="rounded-[1.5rem] border border-rose-200/60 bg-white/70 px-4 py-3 text-sm text-rose-900/70">
                No companies yet.
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-5">
          <div className="panel rounded-[2rem] p-5">
            <div className={`h-1.5 rounded-full bg-gradient-to-r ${selectedCompany?.accent ?? "from-rose-300 to-rose-200"}`} />
            <div className="mt-4">
              <h3 className="text-2xl text-rose-950">
                {selectedCompany?.name ?? "Select a company"}
              </h3>
              <p className="mt-2 text-sm text-rose-900/70">
                {selectedCompany?.summary ?? "Pick a company to review its channel connections."}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {platforms.map((platform) => {
              const channel = companyChannels.find((entry) => entry.platform === platform);
              const meta = platformMeta[platform];
              const Icon = meta.icon;

              return (
                <div key={platform} className="panel rounded-[1.75rem] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white/80 p-3 text-rose-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-rose-950">{meta.label}</div>
                        <div className="text-sm text-rose-900/70">
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

                  <div className="mt-4 text-sm text-rose-900/70">
                    {channel?.status === "connected"
                      ? "Ready to publish."
                      : "OAuth is required before scheduling uploads."}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/settings?company=${selectedCompanyId}`}
                      className="button-secondary inline-flex items-center rounded-full px-4 py-2 text-sm transition hover:bg-white"
                    >
                      Manage in Settings
                    </Link>

                    {channel?.status === "connected" ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDisconnect(platform)}
                        className="button-danger inline-flex items-center rounded-full px-4 py-2 text-sm transition disabled:opacity-60"
                      >
                        <Unplug className="mr-2 h-4 w-4" />
                        Unlink
                      </button>
                    ) : null}
                  </div>

                  {!channel ? (
                    <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200/60 bg-amber-100/70 px-3 py-3 text-sm text-amber-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      This platform is reserved but not connected yet.
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur">
          <div className="panel w-full max-w-xl rounded-[2rem] p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-rose-900/55">Create company</div>
                <h3 className="mt-2 text-2xl text-rose-950">New company</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="button-secondary inline-flex items-center rounded-full p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 grid gap-3">
              <label className="grid gap-2 text-sm text-rose-900/70">
                Company name
                <input
                  value={newCompanyName}
                  onChange={(event) => setNewCompanyName(event.target.value)}
                  className="rounded-2xl border border-rose-200/60 bg-white/80 px-4 py-3 text-sm text-rose-900 outline-none transition focus:border-rose-300"
                  placeholder="Acme Media"
                />
              </label>
              <label className="grid gap-2 text-sm text-rose-900/70">
                Summary (optional)
                <textarea
                  value={newCompanySummary}
                  onChange={(event) => setNewCompanySummary(event.target.value)}
                  className="min-h-24 rounded-2xl border border-rose-200/60 bg-white/80 px-4 py-3 text-sm text-rose-900 outline-none transition focus:border-rose-300"
                  placeholder="Short description for this brand."
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCreateCompany}
                  disabled={isPending}
                  className="button-primary inline-flex items-center rounded-full px-5 py-3 text-sm font-medium transition disabled:opacity-60"
                >
                  Add company
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="button-secondary inline-flex items-center rounded-full px-5 py-3 text-sm transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isEditOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur">
          <div className="panel w-full max-w-xl rounded-[2rem] p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-rose-900/55">Edit company</div>
                <h3 className="mt-2 text-2xl text-rose-950">Update details</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="button-secondary inline-flex items-center rounded-full p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {selectedCompany ? (
              <div className="mt-5 grid gap-3">
                <label className="grid gap-2 text-sm text-rose-900/70">
                  Company name
                  <input
                    value={editCompanyName}
                    onChange={(event) => setEditCompanyName(event.target.value)}
                    className="rounded-2xl border border-rose-200/60 bg-white/80 px-4 py-3 text-sm text-rose-900 outline-none transition focus:border-rose-300"
                  />
                </label>
                <label className="grid gap-2 text-sm text-rose-900/70">
                  Summary
                  <textarea
                    value={editCompanySummary}
                    onChange={(event) => setEditCompanySummary(event.target.value)}
                    className="min-h-24 rounded-2xl border border-rose-200/60 bg-white/80 px-4 py-3 text-sm text-rose-900 outline-none transition focus:border-rose-300"
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleUpdateCompany}
                    disabled={isPending}
                    className="button-primary inline-flex items-center rounded-full px-5 py-3 text-sm font-medium transition disabled:opacity-60"
                  >
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="button-secondary inline-flex items-center rounded-full px-5 py-3 text-sm transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.5rem] border border-rose-200/60 bg-white/70 px-4 py-3 text-sm text-rose-900/70">
                Select a company to edit its details.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
