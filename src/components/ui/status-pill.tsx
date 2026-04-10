import { cn } from "@/lib/utils";

interface StatusPillProps {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}

export function StatusPill({ children, tone = "default" }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-medium",
        tone === "success" && "border-emerald-400/30 bg-emerald-500/10 text-emerald-900",
        tone === "warning" && "border-amber-300/40 bg-amber-400/15 text-amber-900",
        tone === "danger" && "border-red-300/30 bg-red-500/10 text-red-900",
        tone === "default" && "border-rose-200/70 bg-white/60 text-rose-900/80"
      )}
    >
      {children}
    </span>
  );
}
