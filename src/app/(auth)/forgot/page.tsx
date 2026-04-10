"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCcw } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ForgotPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false
      }
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push(`/verify?email=${encodeURIComponent(email)}&mode=login`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="panel w-full rounded-[2.5rem] p-8 sm:p-10">
        <div className="text-xs uppercase tracking-[0.28em] text-rose-900/60">Recover access</div>
        <h1 className="mt-4 text-4xl">Resend your login code</h1>
        <p className="mt-4 text-sm leading-6 text-rose-900/70">
          Enter your email and we&apos;ll send a fresh OTP to sign you back in.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="grid gap-2">
            <span className="text-sm text-rose-900/80">Email</span>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-[1.5rem] border border-rose-200/70 bg-white/80 px-4 py-4 text-rose-900 outline-none transition focus:border-rose-400"
              placeholder="you@company.com"
              required
            />
          </label>

          {message ? (
            <div className="rounded-[1.5rem] border border-red-200/60 bg-red-100/70 px-4 py-3 text-sm text-red-900">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="button-primary inline-flex w-full items-center justify-center rounded-[1.5rem] px-5 py-4 text-sm font-medium transition disabled:opacity-60"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            {loading ? "Sending..." : "Send new code"}
          </button>
        </form>

        <div className="mt-6 text-sm text-rose-900/70">
          <Link href="/login" className="underline decoration-rose-200/40 underline-offset-4">
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}
