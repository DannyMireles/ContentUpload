"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Clock, LogOut } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function PendingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="panel w-full rounded-[2.5rem] p-8 sm:p-10">
        <div className="text-xs uppercase tracking-[0.28em] text-rose-900/60">Awaiting approval</div>
        <h1 className="mt-4 text-4xl">Your account is pending access</h1>
        <p className="mt-4 text-sm leading-6 text-rose-900/70">
          You&apos;re signed in, but an admin still needs to approve this account before the dashboard
          unlocks.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-rose-200/60 bg-white/70 px-4 py-4 text-sm text-rose-900/70">
          <Clock className="h-5 w-5 text-rose-700" />
          We&apos;ll enable access as soon as your profile is approved in Supabase.
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="button-secondary rounded-full px-5 py-3 text-sm transition"
          >
            Refresh status
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            className="button-danger inline-flex items-center rounded-full px-5 py-3 text-sm font-medium transition disabled:opacity-60"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>
      </section>
    </main>
  );
}
