import { CompanySwitcher } from "@/components/layout/company-switcher";
import { PrimaryNav } from "@/components/layout/primary-nav";
import type { ChannelConnection, Company } from "@/lib/types";

interface AppShellProps {
  companies: Company[];
  channels: ChannelConnection[];
  children: React.ReactNode;
}

export function AppShell({ companies, channels, children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="controller sticky top-6 z-20 flex flex-wrap items-center justify-between gap-4 rounded-[2.75rem] px-7 py-5 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-[1.6rem] bg-white text-lg font-semibold text-rose-700 shadow-[0_12px_28px_rgba(207,112,78,0.22)]">
            <span className="absolute inset-0 rounded-[1.6rem] border border-rose-200/70" />
            <span className="relative font-serif text-xl">CU</span>
          </div>
          <div className="flex flex-col">
            <div className="text-[11px] uppercase tracking-[0.5em] text-rose-900/55">
              Content Upload
            </div>
            <div className="text-lg font-semibold text-rose-950">Private Publisher Console</div>
          </div>
        </div>

        <PrimaryNav />

        <div className="flex flex-wrap items-center gap-3">
          {companies.length > 0 ? <CompanySwitcher companies={companies} /> : null}
        </div>
      </header>

      <main className="flex-1 pb-12">{children}</main>
    </div>
  );
}
