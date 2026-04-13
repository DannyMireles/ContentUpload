"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";

import { LegalLinks } from "@/components/layout/legal-links";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") ?? "/scheduled";
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

    router.push(`/verify?email=${encodeURIComponent(email)}&mode=login&redirect=${encodeURIComponent(redirectTo)}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="panel rounded-[2.5rem] p-8 sm:p-10">
          <div className="rounded-full border border-rose-200/60 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.28em] text-rose-900/70">
            Secure access
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl leading-none sm:text-7xl">
            Sign in to your private publisher console.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-rose-900/70">
            Email-only access with one-time codes. Each company stays isolated with per-channel OAuth.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="panel-soft rounded-[1.75rem] p-5">
              <ShieldCheck className="h-6 w-6 text-rose-800" />
              <div className="mt-4 text-xl text-rose-950">Multi-company isolation</div>
              <p className="mt-3 text-sm leading-6 text-rose-900/70">
                Each company and channel token is separated by membership and encrypted at rest.
              </p>
            </div>
            <div className="panel-soft rounded-[1.75rem] p-5">
              <Mail className="h-6 w-6 text-rose-800" />
              <div className="mt-4 text-xl text-rose-950">OTP email login</div>
              <p className="mt-3 text-sm leading-6 text-rose-900/70">
                Enter your email, verify the code, and continue the workflow without passwords.
              </p>
            </div>
          </div>
        </section>

        <section className="panel rounded-[2.5rem] p-8 sm:p-10">
          <div className="text-xs uppercase tracking-[0.28em] text-rose-900/60">Log in</div>
          <h2 className="mt-4 text-4xl">Request a login code</h2>
          <p className="mt-4 text-sm leading-6 text-rose-900/70">
            We&apos;ll email a short verification code. Use the same screen for passwordless sign in.
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
              className="button-primary w-full rounded-[1.5rem] px-5 py-4 text-sm font-medium transition disabled:opacity-60"
            >
              {loading ? "Sending code..." : "Send code"}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-rose-900/75">
            <Link
              href="/signup"
              className="font-medium underline decoration-rose-300/60 underline-offset-4"
            >
              Sign up
            </Link>
            <span className="text-rose-900/40">•</span>
            <Link
              href="/forgot"
              className="font-medium underline decoration-rose-300/60 underline-offset-4"
            >
              Forgot code?
            </Link>
          </div>
          <LegalLinks className="mt-4 flex flex-wrap items-center gap-3 text-xs text-rose-900/75" />
        </section>
      </div>
    </main>
  );
}
