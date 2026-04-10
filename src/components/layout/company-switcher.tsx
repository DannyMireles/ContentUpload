"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { Company } from "@/lib/types";

interface CompanySwitcherProps {
  companies: Company[];
}

export function CompanySwitcher({ companies }: CompanySwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCompany = searchParams.get("company") ?? "all";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextValue === "all") {
      params.delete("company");
    } else {
      params.set("company", nextValue);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setOpen(false);
  }

  const selectedLabel =
    currentCompany === "all"
      ? "All Companies"
      : companies.find((company) => company.id === currentCompany)?.name ?? "Select company";

  return (
    <div ref={containerRef} className="relative max-w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="max-w-[12rem] truncate rounded-full border border-white/70 bg-white/90 px-4 py-2 text-[8px] uppercase tracking-[0.32em] text-rose-900/80 shadow-[0_10px_24px_rgba(130,80,52,0.16)]"
        title={selectedLabel}
      >
        {selectedLabel}
      </button>

      {open ? (
        <div className="absolute right-0 mt-3 w-60 max-w-[80vw] rounded-[1.25rem] border border-rose-200/60 bg-white/95 p-2 text-sm shadow-[0_18px_40px_rgba(120,72,48,0.18)]">
          <button
            type="button"
            onClick={() => handleChange("all")}
            className={`w-full rounded-[0.9rem] px-3 py-2 text-left text-sm transition ${
              currentCompany === "all"
                ? "bg-white text-rose-950 shadow"
                : "text-rose-900/80 hover:bg-white"
            }`}
          >
            All Companies
          </button>
          <div className="mt-2 max-h-64 overflow-y-auto">
            {companies.map((company) => (
              <button
                key={company.id}
                type="button"
                onClick={() => handleChange(company.id)}
                className={`mt-1 w-full rounded-[0.9rem] px-3 py-2 text-left text-sm transition ${
                  currentCompany === company.id
                    ? "bg-white text-rose-950 shadow"
                    : "text-rose-900/80 hover:bg-white"
                }`}
              >
                <span className="block truncate" title={company.name}>
                  {company.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
