import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Content Upload Control",
  description: "Terms of Service for Content Upload Control."
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <article className="panel rounded-[2rem] p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-rose-900/55">Legal</p>
        <h1 className="mt-3 text-4xl text-rose-950 sm:text-5xl">Terms of Service</h1>
        <p className="mt-4 text-sm text-rose-900/70">
          Effective date: April 13, 2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-rose-900/80">
          <section>
            <h2 className="text-xl text-rose-950">1. Agreement</h2>
            <p className="mt-2">
              These Terms govern access to and use of Content Upload Control, operated by Zenfulnote
              LLC. By accessing or using the service, you agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-rose-950">2. Intended use</h2>
            <p className="mt-2">
              The service is intended for authorized publishing workflows and internal business
              operations. You are responsible for all activity under your account and for maintaining
              lawful rights to all uploaded media and connected channels.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-rose-950">3. Third-party platforms</h2>
            <p className="mt-2">
              The service integrates with third-party platforms, including TikTok, Instagram, and
              YouTube, through OAuth. Your use of those platforms is also governed by their separate
              terms, policies, API rules, and enforcement decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-rose-950">4. Acceptable use</h2>
            <p className="mt-2">
              You agree not to misuse the service, attempt unauthorized access, violate platform
              policies, infringe rights, upload unlawful content, or interfere with service operation.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-rose-950">5. Disclaimers and limits</h2>
            <p className="mt-2">
              The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties
              of any kind, to the maximum extent permitted by applicable law. Zenfulnote LLC is not
              responsible for third-party platform outages, API changes, account restrictions, content
              takedowns, or lost business opportunities resulting from platform actions.
            </p>
            <p className="mt-2">
              To the maximum extent permitted by law, Zenfulnote LLC will not be liable for indirect,
              incidental, special, consequential, or punitive damages, or for lost profits, revenues,
              data, or goodwill.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-rose-950">6. Termination</h2>
            <p className="mt-2">
              Access may be suspended or terminated at any time for security, policy, legal, or
              operational reasons.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-rose-950">7. Contact</h2>
            <p className="mt-2">
              For support, legal requests, and data-related requests, contact{" "}
              <a className="underline decoration-rose-300/60 underline-offset-4" href="mailto:contact@zenfulnote.app">
                contact@zenfulnote.app
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-8 text-sm text-rose-900/75">
          Read our{" "}
          <Link href="/privacy" className="underline decoration-rose-300/60 underline-offset-4">
            Privacy Policy
          </Link>
          .
        </div>
      </article>
    </main>
  );
}
