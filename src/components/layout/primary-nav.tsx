"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Building2, CalendarClock, PlusCircle, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  {
    href: "/automations/new",
    label: "New Automation",
    icon: PlusCircle
  },
  {
    href: "/scheduled",
    label: "Scheduled Tasks",
    icon: CalendarClock
  },
  {
    href: "/companies",
    label: "Companies",
    icon: Building2
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings
  }
];

export function PrimaryNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("company");

  return (
    <nav className="flex w-full flex-wrap items-center justify-center gap-2 rounded-full bg-white/90 px-3 py-2.5 shadow-[0_14px_40px_rgba(110,62,36,0.14)] lg:w-auto lg:justify-start">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        const withCompany =
          companyId && (item.href.startsWith("/scheduled") || item.href.startsWith("/automations"));
        const href = withCompany ? `${item.href}?company=${companyId}` : item.href;

        return (
          <Link
            key={item.href}
            href={href}
            className={cn(
              "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-white text-rose-950 shadow-lg shadow-orange-100/60 after:absolute after:-bottom-1 after:left-4 after:right-4 after:h-[2px] after:rounded-full after:bg-rose-600"
                : "text-rose-900/80 hover:bg-white/90"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
