import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Content Upload Control",
  description: "Privacy Policy for Content Upload Control."
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <article className="panel rounded-[2rem] p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-rose-900/55">Legal</p>
        <h1 className="mt-3 text-4xl text-rose-950 sm:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-rose-900/70">
          Effective date: April 13, 2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-rose-900/80">
          <section>
            <h2 className="text-xl text-rose-950">1. What we collect</h2>
            <p className="mt-2">
              We collect account identifiers (such as email), company/workspace metadata, OAuth token
              data required to connect channels, uploaded media, and scheduling metadata required to
              operate the publishing service.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-rose-950">2. Why we collect it</h2>
            <p className="mt-2">
              We use data to authenticate users, connect social platforms through OAuth, schedule and
              publish content, secure accounts, monitor reliability, and provide support.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-rose-950">3. OAuth and third-party services</h2>
            <p className="mt-2">
              When you connect TikTok, Instagram, or YouTube, you authorize those platforms to share
              data and tokens with this service according to their own policies. We do not control
              third-party privacy practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-rose-950">4. Security</h2>
            <p className="mt-2">
              We implement reasonable safeguards, including encrypted token storage and access controls.
              No method of storage or transmission is guaranteed to be completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-rose-950">5. Data retention and deletion</h2>
            <p className="mt-2">
              We retain data only as needed for service operation, legal obligations, and legitimate
              business purposes. For data deletion requests, contact{" "}
              <a className="underline decoration-rose-300/60 underline-offset-4" href="mailto:contact@zenfulnote.app">
                contact@zenfulnote.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl text-rose-950">6. Contact</h2>
            <p className="mt-2">
              For privacy, support, or data requests, contact{" "}
              <a className="underline decoration-rose-300/60 underline-offset-4" href="mailto:contact@zenfulnote.app">
                contact@zenfulnote.app
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-8 text-sm text-rose-900/75">
          Read our{" "}
          <Link href="/terms" className="underline decoration-rose-300/60 underline-offset-4">
            Terms of Service
          </Link>
          .
        </div>
      </article>
    </main>
  );
}
