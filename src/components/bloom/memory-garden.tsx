"use client";

import * as React from "react";
import { Heart, Share2, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { Flower } from "./flower";
import { ShareCardDialog } from "./share-card-dialog";
import type { ShareCardContent } from "@/lib/share-card";
import type { MemoryEntry } from "@/lib/types";

export function MemoryGarden() {
  const t = useTranslations("memory");
  const tShare = useTranslations("share");
  const memory = useBloomStore((s) => s.memory);
  const toggleMemoryLiked = useBloomStore((s) => s.toggleMemoryLiked);
  const toggleMemoryFavorited = useBloomStore((s) => s.toggleMemoryFavorited);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [shareContent, setShareContent] = React.useState<ShareCardContent | null>(null);

  function share(m: MemoryEntry) {
    setShareContent({
      eyebrow: `Bloom · ${m.date === "Today" ? t("today") : m.date}`,
      emoji: m.mood,
      headline: `"${m.quote}"`,
      stats: [{ label: t("tasksCompleted"), value: String(m.completedTasks) }],
    });
    setShareOpen(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-display font-medium">{t("title")}</div>
        <div className="text-sm text-ink-soft mt-0.5">{t("subtitle")}</div>
      </div>
      {memory.length === 0 ? (
        <div className="text-sm text-ink-soft text-center py-20">{t("empty")}</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {memory.map((m) => (
            <div key={m.id} className="rounded-2xl glass glass-hover p-6 flex flex-col items-center text-center gap-2">
              <Flower stage={m.bloomLevel} kind={m.mood === "🌸" ? "sakura" : "tulip"} />
              <div className="text-xs text-ink-soft mt-1">{m.date === "Today" ? t("today") : m.date}</div>
              <div className="text-sm italic">&ldquo;{m.quote}&rdquo;</div>
              <div className="text-lg">{m.mood}</div>
              <div className="text-[11px] text-ink-soft">
                {m.completedTasks} {t("tasksCompleted")}
              </div>
              <div className="flex items-center gap-3 mt-2 pt-3 border-t border-petal/40 w-full justify-center">
                <button
                  onClick={() => toggleMemoryLiked(m.id)}
                  aria-label={t("like")}
                  className={m.liked ? "text-rose" : "text-stone-300 hover:text-rose-deep transition-colors"}
                >
                  <Heart size={15} fill={m.liked ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => toggleMemoryFavorited(m.id)}
                  aria-label={t("favorite")}
                  className={m.favorited ? "text-amber-400" : "text-stone-300 hover:text-amber-400 transition-colors"}
                >
                  <Star size={15} fill={m.favorited ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => share(m)}
                  aria-label={tShare("share")}
                  className="text-stone-300 hover:text-rose-deep transition-colors"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ShareCardDialog open={shareOpen} onOpenChange={setShareOpen} content={shareContent} />
    </div>
  );
}
