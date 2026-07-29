"use client";

import * as React from "react";
import { Award, Clock, Flame, Flower2, Heart, Share2, Sparkles, Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { computeLevel, levelTitleKey } from "@/lib/leveling";
import { evaluateAchievements, type Rarity } from "@/lib/achievements";
import { computeWrapped } from "@/lib/bloom-wrapped";
import { formatVND } from "@/lib/utils";
import { ShareCardDialog } from "./share-card-dialog";
import type { ShareCardContent } from "@/lib/share-card";

const RARITY_STYLES: Record<Rarity, string> = {
  common: "bg-stone-100 text-stone-500 dark:bg-white/5",
  rare: "bg-blush text-rose-deep",
  epic: "bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-300",
  legendary: "gradient-primary text-white shadow-md shadow-rose/25",
};

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl glass glass-hover p-5">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="grid place-items-center w-7 h-7 rounded-lg bg-blush/80 dark:bg-white/5">{icon}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">{label}</span>
      </div>
      <div className="text-xl font-semibold font-mono tracking-tight">{value}</div>
    </div>
  );
}

export function ProfilePage() {
  const t = useTranslations("profile");
  const tAch = useTranslations("achievements");
  const tCat = useTranslations("categories");
  const locale = useLocale();
  const [shareOpen, setShareOpen] = React.useState(false);
  const [shareContent, setShareContent] = React.useState<ShareCardContent | null>(null);

  const {
    displayName,
    joinedAt,
    streak,
    longestStreak,
    focuses,
    garden,
    memory,
    redemptions,
    savedQuotes,
    history,
    lifetimeBalanceEarned,
    lifetimeFocusMinutes,
    toggleSavedQuote,
  } = useBloomStore(
    useShallow((s) => ({
      displayName: s.displayName,
      joinedAt: s.joinedAt,
      streak: s.streak,
      longestStreak: s.longestStreak,
      focuses: s.focuses,
      garden: s.garden,
      memory: s.memory,
      redemptions: s.redemptions,
      savedQuotes: s.savedQuotes,
      history: s.history,
      lifetimeBalanceEarned: s.lifetimeBalanceEarned,
      lifetimeFocusMinutes: s.lifetimeFocusMinutes,
      toggleSavedQuote: s.toggleSavedQuote,
    }))
  );

  const achievementState = { focuses, garden, memory, redemptions, savedQuotes, streak, longestStreak, lifetimeFocusMinutes, lifetimeBalanceEarned };
  const achievements = evaluateAchievements(achievementState);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const { level, currentLevelXp, xpForNextLevel } = computeLevel(lifetimeFocusMinutes);
  const levelPct = xpForNextLevel > 0 ? Math.min(100, Math.round((currentLevelXp / xpForNextLevel) * 100)) : 0;

  const initial = displayName.trim().charAt(0).toUpperCase() || "🌸";
  const joinedLabel = joinedAt
    ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(new Date(joinedAt))
    : "-";

  function shareWrapped() {
    const wrapped = computeWrapped({ ...achievementState, history });
    setShareContent({
      eyebrow: `Bloom Wrapped ${wrapped.year}`,
      emoji: "🌸",
      headline: t("wrappedHeadline", { year: wrapped.year }),
      stats: [
        { label: t("wrappedFocusHours"), value: `${wrapped.totalFocusHours.toFixed(1)}h` },
        { label: t("wrappedBalance"), value: formatVND(wrapped.balanceCreated) },
        { label: t("wrappedFlowers"), value: String(wrapped.flowersBloomed) },
        { label: t("wrappedStreak"), value: String(wrapped.longestStreak) },
        ...(wrapped.favoriteCategory
          ? [{ label: t("wrappedFavoriteCategory"), value: tCat(`${wrapped.favoriteCategory}.label`) }]
          : []),
        ...(wrapped.topAchievementId
          ? [{ label: t("wrappedTopAchievement"), value: tAch(`${wrapped.topAchievementId}.name`) }]
          : []),
      ],
    });
    setShareOpen(true);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] glass p-7 md:p-8 flex items-center gap-5">
        <span className="grid place-items-center w-16 h-16 rounded-2xl gradient-primary text-white text-2xl font-semibold shadow-lg shadow-rose/25 shrink-0">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xl font-display font-medium truncate">{displayName || "-"}</div>
          <div className="text-xs text-ink-soft mt-0.5">
            {t("joined")} {joinedLabel}
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-ink-soft mb-1">
              <span>
                {t("level")} {level} · {t(`levelTitle.${levelTitleKey(level)}`)}
              </span>
              <span className="font-mono">
                {currentLevelXp}/{xpForNextLevel}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-petal/30 overflow-hidden">
              <div className="h-full gradient-primary transition-all duration-500" style={{ width: `${levelPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={<Flame size={16} className="text-orange-400" />} label={t("currentStreak")} value={streak} />
        <StatCard icon={<Flame size={16} className="text-orange-300" />} label={t("longestStreak")} value={longestStreak} />
        <StatCard icon={<Clock size={16} className="text-rose" />} label={t("lifetimeFocusHours")} value={`${(lifetimeFocusMinutes / 60).toFixed(1)}h`} />
        <StatCard icon={<Sparkles size={16} className="text-amber-400" />} label={t("lifetimeBalance")} value={formatVND(lifetimeBalanceEarned)} />
        <StatCard icon={<Flower2 size={16} className="text-rose" />} label={t("flowersCollected")} value={garden.length} />
        <StatCard icon={<Trophy size={16} className="text-amber-500" />} label={t("challengesCompleted")} value={0} />
      </div>

      <div className="rounded-[28px] p-7 gradient-primary text-white flex items-center justify-between gap-4 flex-wrap shadow-lg shadow-rose/25">
        <div>
          <div className="text-lg font-display font-medium">🌸 {t("wrappedTitle", { year: new Date().getFullYear() })}</div>
          <div className="text-sm opacity-90 mt-0.5">{t("wrappedSubtitle")}</div>
        </div>
        <button
          onClick={shareWrapped}
          className="bg-white text-rose-deep flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium shrink-0"
        >
          <Share2 size={14} /> {t("viewWrapped")}
        </button>
      </div>

      <div className="rounded-2xl glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award size={16} className="text-amber-400" />
          <div className="font-medium text-sm">{t("achievements")}</div>
          <span className="text-xs text-ink-soft ml-auto font-mono">
            {unlockedCount}/{achievements.length}
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {achievements.map((a) => (
            <div key={a.id} className={`flex flex-col items-center text-center gap-1.5 ${a.unlocked ? "" : "opacity-40 grayscale"}`}>
              <span className={`grid place-items-center w-12 h-12 rounded-2xl text-xl ${RARITY_STYLES[a.rarity]}`}>{a.emoji}</span>
              <div className="text-[11px] font-medium leading-tight">{tAch(`${a.id}.name`)}</div>
              <div className="text-[9px] uppercase tracking-wide text-ink-soft">{tAch(`rarity.${a.rarity}`)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart size={16} className="text-rose" />
          <div className="font-medium text-sm">{t("savedQuotes")}</div>
        </div>
        {savedQuotes.length === 0 ? (
          <div className="text-sm text-ink-soft text-center py-8">{t("noSavedQuotes")}</div>
        ) : (
          <div className="space-y-2">
            {savedQuotes.map((q) => (
              <div key={q.id} className="flex items-center gap-3 text-sm px-3.5 py-2.5 rounded-xl border border-petal/50">
                <div className="min-w-0 flex-1 italic text-ink-soft">&ldquo;{q.text}&rdquo;</div>
                <button
                  onClick={() => toggleSavedQuote(q.text)}
                  aria-label={t("removeQuote")}
                  className="text-rose hover:text-rose-deep transition-colors shrink-0"
                >
                  <Heart size={15} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl glass p-6">
        <div className="font-medium text-sm mb-4">{t("recentActivity")}</div>
        {memory.length === 0 ? (
          <div className="text-sm text-ink-soft text-center py-8">{t("noActivity")}</div>
        ) : (
          <div className="space-y-2">
            {memory.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center gap-3 text-sm px-3 py-2.5 rounded-xl border border-petal/50">
                <span className="text-lg shrink-0">{m.mood}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate italic text-ink-soft">&ldquo;{m.quote}&rdquo;</div>
                </div>
                <div className="text-xs text-ink-soft shrink-0">{m.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ShareCardDialog open={shareOpen} onOpenChange={setShareOpen} content={shareContent} />
    </div>
  );
}
