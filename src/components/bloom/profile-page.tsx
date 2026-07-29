"use client";

import { Award, Clock, Flame, Flower2, Heart, Sparkles, Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { computeLevel } from "@/lib/leveling";
import { formatVND } from "@/lib/utils";

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
  const locale = useLocale();

  const {
    displayName,
    joinedAt,
    streak,
    longestStreak,
    garden,
    memory,
    savedQuotes,
    lifetimeBalanceEarned,
    lifetimeFocusMinutes,
    toggleSavedQuote,
  } = useBloomStore(
    useShallow((s) => ({
      displayName: s.displayName,
      joinedAt: s.joinedAt,
      streak: s.streak,
      longestStreak: s.longestStreak,
      garden: s.garden,
      memory: s.memory,
      savedQuotes: s.savedQuotes,
      lifetimeBalanceEarned: s.lifetimeBalanceEarned,
      lifetimeFocusMinutes: s.lifetimeFocusMinutes,
      toggleSavedQuote: s.toggleSavedQuote,
    }))
  );

  const { level, currentLevelXp, xpForNextLevel } = computeLevel(lifetimeFocusMinutes);
  const levelPct = xpForNextLevel > 0 ? Math.min(100, Math.round((currentLevelXp / xpForNextLevel) * 100)) : 0;

  const initial = displayName.trim().charAt(0).toUpperCase() || "🌸";
  const joinedLabel = joinedAt
    ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(new Date(joinedAt))
    : "-";

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
                {t("level")} {level}
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

      <div className="rounded-2xl glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award size={16} className="text-amber-400" />
          <div className="font-medium text-sm">{t("achievements")}</div>
        </div>
        <div className="text-sm text-ink-soft text-center py-8">{t("comingSoon")}</div>
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
    </div>
  );
}
