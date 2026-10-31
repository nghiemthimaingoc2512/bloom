"use client";

import * as React from "react";
import { Flame, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBloomBalance, useBloomStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { completedMinutesTotal, completionStats } from "@/lib/reward-engine";
import { formatVND } from "@/lib/utils";
import { ShareCardDialog } from "./share-card-dialog";
import type { ShareCardContent } from "@/lib/share-card";

export function DailyShareButtons() {
  const t = useTranslations("share");
  const { streak, focuses } = useBloomStore(
    useShallow((s) => ({
      streak: s.streak,
      focuses: s.focuses,
    }))
  );
  const balance = useBloomBalance();
  const [content, setContent] = React.useState<ShareCardContent | null>(null);
  const [open, setOpen] = React.useState(false);

  function shareStreak() {
    setContent({
      eyebrow: t("streakEyebrow"),
      emoji: "🔥",
      headline: t("streakHeadline", { days: streak }),
      stats: [{ label: t("streakLabel"), value: String(streak) }],
    });
    setOpen(true);
  }

  function shareToday() {
    const { completed } = completionStats(focuses);
    const hours = completedMinutesTotal(focuses) / 60;
    setContent({
      eyebrow: t("todayEyebrow"),
      emoji: "✨",
      headline: t("todayHeadline"),
      stats: [
        { label: t("sessionsLabel"), value: String(completed) },
        { label: t("hoursLabel"), value: `${hours.toFixed(1)}h` },
        { label: t("balanceLabel"), value: formatVND(balance) },
      ],
    });
    setOpen(true);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={shareStreak}
        className="btn-secondary flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium"
      >
        <Flame size={13} /> {t("shareStreak")}
      </button>
      <button
        onClick={shareToday}
        className="btn-secondary flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium"
      >
        <Sparkles size={13} /> {t("shareToday")}
      </button>
      <ShareCardDialog open={open} onOpenChange={setOpen} content={content} />
    </div>
  );
}
