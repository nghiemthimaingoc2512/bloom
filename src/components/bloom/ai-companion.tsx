"use client";

import * as React from "react";
import { Heart, Quote, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { ShareCardDialog } from "./share-card-dialog";
import type { ShareCardContent } from "@/lib/share-card";
import type { GrowthArea } from "@/lib/types";

/** Deterministic pick so the message is stable across re-renders,
 *  but still varies from day to day. */
function pickForToday<T>(items: T[]): T {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return items[dayOfYear % items.length];
}

export function AiCompanion() {
  const t = useTranslations("companion");
  const tShare = useTranslations("share");
  const { growthAreas, savedQuotes, toggleSavedQuote } = useBloomStore(
    useShallow((s) => ({
      growthAreas: s.growthAreas,
      savedQuotes: s.savedQuotes,
      toggleSavedQuote: s.toggleSavedQuote,
    }))
  );
  const [shareOpen, setShareOpen] = React.useState(false);
  const [shareContent, setShareContent] = React.useState<ShareCardContent | null>(null);

  const pool = React.useMemo(() => {
    const general = t.raw("quotes") as string[];
    if (growthAreas.length === 0) return general;
    const byArea = t.raw("quotesByArea") as Record<GrowthArea, string[]>;
    const personalized = growthAreas.flatMap((area) => byArea[area] ?? []);
    if (personalized.length === 0) return general;
    // Weight quotes from the user's chosen growth areas so they show up
    // more often, while keeping the general pool in the mix for variety.
    return [...personalized, ...personalized, ...general];
  }, [growthAreas, t]);

  const message = React.useMemo(() => pickForToday(pool), [pool]);
  const isSaved = savedQuotes.some((q) => q.text === message);

  function share() {
    setShareContent({
      eyebrow: "Bloom",
      emoji: "🌸",
      headline: message,
      stats: [],
    });
    setShareOpen(true);
  }

  return (
    <div className="rounded-2xl glass p-5 flex gap-3 items-center">
      <span className="grid place-items-center w-9 h-9 rounded-xl gradient-primary text-white shrink-0">
        <Quote size={16} />
      </span>
      <div className="text-sm font-medium text-ink flex-1">{message}</div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => toggleSavedQuote(message)}
          aria-label={t("save")}
          className={isSaved ? "text-rose" : "text-stone-300 hover:text-rose-deep transition-colors"}
        >
          <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
        </button>
        <button onClick={share} aria-label={tShare("share")} className="text-stone-300 hover:text-rose-deep transition-colors">
          <Share2 size={15} />
        </button>
      </div>
      <ShareCardDialog open={shareOpen} onOpenChange={setShareOpen} content={shareContent} />
    </div>
  );
}
