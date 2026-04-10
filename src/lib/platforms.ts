import { Camera, Film, Music2, PlaySquare } from "lucide-react";

import type { PlatformId } from "@/lib/types";

export const platformMeta: Record<
  PlatformId,
  {
    label: string;
    color: string;
    accent: string;
    icon: typeof Music2;
    helper: string;
  }
> = {
  tiktok: {
    label: "TikTok",
    color: "from-rose-500/30 via-red-500/15 to-zinc-950",
    accent: "border-rose-400/30 text-rose-50",
    icon: Music2,
    helper: "Short-form headline, hooks, and rapid caption structure."
  },
  instagram: {
    label: "Instagram",
    color: "from-orange-400/30 via-rose-500/20 to-zinc-950",
    accent: "border-orange-300/30 text-orange-50",
    icon: Camera,
    helper: "Caption-first storytelling with visual-first metadata."
  },
  youtube: {
    label: "YouTube",
    color: "from-red-600/30 via-red-400/20 to-zinc-950",
    accent: "border-red-300/30 text-red-50",
    icon: PlaySquare,
    helper: "Longer title and description with searchable topic framing."
  }
};

export const platformList: PlatformId[] = ["tiktok", "instagram", "youtube"];

export const defaultVideoArt = Film;
