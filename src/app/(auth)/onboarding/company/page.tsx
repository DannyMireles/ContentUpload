"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Building2 } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function OnboardingCompanyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function completeOnboarding() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;

    if (!userId) {
      router.replace("/login");
      return;
    }

    await supabase
      .from("user_profiles")
      .update({ onboarding_complete: true })
      .eq("user_id", userId);

    router.replace("/scheduled");
  }

  async function handleCreateCompany(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    const response = await fetch("/api/companies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name.trim(),
        summary: summary.trim()
      })
    });

    const data = (await response.json()) as { message?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.message ?? "Unable to create company.");
      return;
    }

    await completeOnboarding();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="panel w-full rounded-[2.5rem] p-8 sm:p-10">
        <div className="text-xs uppercase tracking-[0.28em] text-rose-900/60">First company</div>
        <h1 className="mt-4 text-4xl">Add your first company</h1>
        <p className="mt-4 text-sm leading-6 text-rose-900/70">
          This is optional and can be added later. Creating it now lets you connect OAuth accounts right away.
        </p>

        <form onSubmit={handleCreateCompany} className="mt-8 space-y-5">
          <label className="grid gap-2">
            <span className="text-sm text-rose-900/80">Company name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-[1.5rem] border border-rose-200/70 bg-white/80 px-4 py-4 text-rose-900 outline-none transition focus:border-rose-400"
              placeholder="Zenfulnote"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-rose-900/80">Summary (optional)</span>
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              className="min-h-28 rounded-[1.5rem] border border-rose-200/70 bg-white/80 px-4 py-4 text-rose-900 outline-none transition focus:border-rose-400"
              placeholder="Short description for this brand."
            />
          </label>

          {message ? (
            <div className="rounded-[1.5rem] border border-red-200/60 bg-red-100/70 px-4 py-3 text-sm text-red-900">
              {message}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="button-primary inline-flex items-center rounded-full px-5 py-3 text-sm font-medium transition disabled:opacity-60"
            >
              <Building2 className="mr-2 h-4 w-4" />
              {loading ? "Creating..." : "Create company & continue"}
            </button>
            <button
              type="button"
              onClick={completeOnboarding}
              className="button-secondary inline-flex items-center rounded-full px-5 py-3 text-sm transition"
            >
              Skip for now
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
