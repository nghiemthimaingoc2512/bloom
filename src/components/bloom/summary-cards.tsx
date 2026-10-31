"use client";

import { Check, Clock, Flame, Flower2, Leaf, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { earnedOnDay, minutesOnDay, stepsDoneOnDay, todaysFocuses } from "@/lib/reward-engine";
import { formatVND, todayKey } from "@/lib/utils";
import { AnimatedNumber } from "./animated-number";
import { useShallow } from "zustand/react/shallow";

function Card({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl glass glass-hover p-5">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="grid place-items-center w-7 h-7 rounded-lg bg-blush/80 dark:bg-white/5">{icon}</span>
        <span className="text-[13px] font-medium uppercase tracking-wide text-ink-soft">{label}</span>
      </div>
      <div className="text-3xl font-bold font-mono tracking-tight">{value}</div>
      {hint && <div className="text-[13px] text-ink-soft mt-1">{hint}</div>}
    </div>
  );
}

export function SummaryCards() {
  const t = useTranslations("home");
  const { streak, focuses, history, garden } = useBloomStore(
    useShallow((s) => ({
      streak: s.streak,
      focuses: s.focuses,
      history: s.history,
      garden: s.garden,
    }))
  );

  const today = todayKey();
  const todays = todaysFocuses(focuses, today);
  const completed = todays.filter((f) => f.checklist.every((c) => c.done)).length;
  const openSteps = focuses.reduce((n, f) => n + f.checklist.filter((c) => !c.done).length, 0);
  const todayMinutes = minutesOnDay({ focuses, history }, today);
  const earnedToday = earnedOnDay({ focuses, history }, today);
  const blooming = garden.filter((f) => f.stage === "bloom").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Card
        icon={<Sparkles size={16} className="text-amber-400" />}
        label={t("earnedToday")}
        value={<AnimatedNumber value={earnedToday} format={formatVND} />}
      />
      <Card icon={<Flame size={16} className="text-orange-400" />} label={t("streak")} value={`${streak} ${t("days")}`} />
      <Card icon={<Clock size={16} className="text-rose" />} label={t("focusHours")} value={`${(todayMinutes / 60).toFixed(1)}h`} />
      <Card icon={<Check size={16} className="text-green-500" />} label={t("tasks")} value={`${completed}/${todays.length}`} hint={`${stepsDoneOnDay(focuses, today)} ${t("stepsDone")}`} />
      <Card icon={<Leaf size={16} className="text-pink-400" />} label={t("remaining")} value={openSteps} />
      <Card icon={<Flower2 size={16} className="text-rose" />} label={t("gardenState")} value={`${blooming}/${garden.length}`} />
    </div>
  );
}
