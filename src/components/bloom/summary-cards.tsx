"use client";

import { Check, Clock, Flame, Flower2, Leaf, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBloomBalance, useBloomStore } from "@/lib/store";
import { minutesOnDay, stepsDoneOnDay, todaysFocuses } from "@/lib/reward-engine";
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
    <div className="rounded-2xl glass p-5">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="grid place-items-center w-7 h-7 rounded-lg bg-blush text-rose-deep">{icon}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">{label}</span>
      </div>
      <div className="text-xl font-semibold font-mono tracking-tight">{value}</div>
      {hint && <div className="text-[11px] text-ink-soft mt-1">{hint}</div>}
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
  const balance = useBloomBalance();

  const today = todayKey();
  const todays = todaysFocuses(focuses, today);
  const completed = todays.filter((f) => f.checklist.every((c) => c.done)).length;
  const openSteps = focuses.reduce((n, f) => n + f.checklist.filter((c) => !c.done).length, 0);
  const todayMinutes = minutesOnDay({ focuses, history }, today);
  const earnedToday = focuses.reduce(
    (sum, f) => sum + f.checklist.filter((c) => c.done && c.doneAt === today).reduce((a, c) => a + c.reward, 0),
    0
  ) + history.filter((h) => h.date === today && h.balanceDelta > 0).reduce((a, h) => a + h.balanceDelta, 0);
  const blooming = garden.filter((f) => f.stage === "bloom").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Card
        icon={<Sparkles size={16} />}
        label={t("balance")}
        value={<AnimatedNumber value={balance} format={formatVND} />}
        hint={t("balanceNote")}
      />
      <Card icon={<Flame size={16} />} label={t("streak")} value={`${streak} ${t("days")}`} />
      <Card icon={<Clock size={16} />} label={t("focusHours")} value={`${(todayMinutes / 60).toFixed(1)}h`} hint={`${t("earnedToday")}: ${formatVND(earnedToday)}`} />
      <Card icon={<Check size={16} />} label={t("tasks")} value={`${completed}/${todays.length}`} hint={`${stepsDoneOnDay(focuses, today)} ${t("stepsDone")}`} />
      <Card icon={<Leaf size={16} />} label={t("remaining")} value={openSteps} />
      <Card icon={<Flower2 size={16} />} label={t("gardenState")} value={`${blooming}/${garden.length}`} />
    </div>
  );
}
