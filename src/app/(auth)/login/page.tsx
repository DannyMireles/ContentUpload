import { LockKeyhole, ShieldEllipsis } from "lucide-react";
import { redirect } from "next/navigation";

import { getSessionState } from "@/lib/auth/session";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const authenticated = await getSessionState();

  if (authenticated) {
    redirect("/scheduled");
  }

  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="panel rounded-[2.5rem] p-8 sm:p-10">
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-rose-100/62">
            Internal upload control
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl leading-none sm:text-7xl">
            Private publishing cockpit for multi-channel video automation.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-rose-100/72">
            Secure access first, then clean scheduling by company, platform-specific SEO, and a controlled posting pipeline.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="panel-soft rounded-[1.75rem] p-5">
              <ShieldEllipsis className="h-6 w-6 text-red-100" />
              <div className="mt-4 text-xl text-white">Secret-first architecture</div>
              <p className="mt-3 text-sm leading-6 text-rose-100/68">
                Password gate, cron secret, encrypted channel tokens, and clean handoff points for Supabase and provider OAuth.
              </p>
            </div>
            <div className="panel-soft rounded-[1.75rem] p-5">
              <LockKeyhole className="h-6 w-6 text-red-100" />
              <div className="mt-4 text-xl text-white">Operator-friendly UI</div>
              <p className="mt-3 text-sm leading-6 text-rose-100/68">
                One controller surface, fast company switching, per-channel schedules, and full edit/delete visibility for every automation.
              </p>
            </div>
          </div>
        </section>

        <section className="panel rounded-[2.5rem] p-8 sm:p-10">
          <div className="text-xs uppercase tracking-[0.28em] text-rose-100/55">App access</div>
          <h2 className="mt-4 text-4xl">Unlock the dashboard</h2>
          <p className="mt-4 text-sm leading-6 text-rose-100/72">
            This starter uses a single application password from the environment. It is the fastest secure gate for the first internal version.
          </p>

          <form action="/api/auth/login" method="post" className="mt-8 space-y-5">
            <label className="grid gap-2">
              <span className="text-sm text-rose-50/88">Password</span>
              <input
                name="password"
                type="password"
                className="rounded-[1.5rem] border border-white/10 bg-black/24 px-4 py-4 text-white outline-none transition focus:border-red-300/50"
                placeholder="Enter app password"
                required
              />
            </label>

            {params.error ? (
              <div className="rounded-[1.5rem] border border-red-300/16 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                Invalid password. Try again.
              </div>
            ) : null}

            <button className="button-primary w-full rounded-[1.5rem] px-5 py-4 text-sm font-medium transition">
              Open private dashboard
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
