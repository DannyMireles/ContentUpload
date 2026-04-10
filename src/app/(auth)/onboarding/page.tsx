"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function OnboardingIntroPage() {
  const router = useRouter();

  async function handleSkip() {
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
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="panel w-full rounded-[2.5rem] p-8 sm:p-10">
        <div className="text-xs uppercase tracking-[0.28em] text-rose-900/60">Welcome</div>
        <h1 className="mt-4 text-4xl">Private Publisher Console</h1>
        <p className="mt-4 text-sm leading-6 text-rose-900/70">
          A calm, controlled workflow for scheduling platform-specific uploads across every company you manage.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            "Upload once, schedule per channel with clear guardrails.",
            "OAuth-only publishing keeps every token scoped and encrypted.",
            "Review scheduled tasks, edit timing, and audit every upload."
          ].map((item) => (
            <div key={item} className="panel-soft rounded-[1.75rem] p-5 text-sm text-rose-900/70">
              <Sparkles className="h-4 w-4 text-rose-700" />
              <p className="mt-3 leading-6">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/onboarding/company"
            className="button-primary inline-flex items-center rounded-full px-5 py-3 text-sm font-medium transition"
          >
            Continue setup
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={handleSkip}
            className="button-secondary inline-flex items-center rounded-full px-5 py-3 text-sm transition"
          >
            Skip for now
          </button>
        </div>
      </section>
    </main>
  );
}
