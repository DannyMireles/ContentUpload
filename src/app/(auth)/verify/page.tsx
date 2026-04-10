"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, RefreshCcw } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const mode = searchParams.get("mode") ?? "login";
  const redirectTo = searchParams.get("redirect") ?? "/scheduled";
  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace(redirectTo);
      }
    });
  }, [redirectTo, router]);

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email"
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.replace(redirectTo);
  }

  async function handleResend() {
    setMessage(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: mode === "signup"
      }
    });
    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Verification code resent.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="panel w-full rounded-[2.5rem] p-8 sm:p-10">
        <div className="text-xs uppercase tracking-[0.28em] text-rose-900/60">Verify access</div>
        <h1 className="mt-4 text-4xl">Enter the code from your email</h1>
        <p className="mt-4 text-sm leading-6 text-rose-900/70">
          We sent a short verification code to your inbox. Enter it here to continue.
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-5">
          <label className="grid gap-2">
            <span className="text-sm text-rose-900/80">Email</span>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-[1.5rem] border border-rose-200/70 bg-white/80 px-4 py-4 text-rose-900 outline-none transition focus:border-rose-400"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-rose-900/80">Verification code</span>
            <input
              name="token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="rounded-[1.5rem] border border-rose-200/70 bg-white/80 px-4 py-4 text-rose-900 outline-none transition focus:border-rose-400"
              placeholder="6-digit code"
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
            <KeyRound className="mr-2 h-4 w-4" />
            {loading ? "Verifying..." : "Verify and continue"}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-rose-900/70">
          <button
            type="button"
            onClick={handleResend}
            className="inline-flex items-center gap-2 underline decoration-rose-200/40 underline-offset-4"
          >
            <RefreshCcw className="h-4 w-4" />
            Resend code
          </button>
          <span className="text-rose-100/40">•</span>
          <Link href="/login" className="underline decoration-rose-200/40 underline-offset-4">
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}
