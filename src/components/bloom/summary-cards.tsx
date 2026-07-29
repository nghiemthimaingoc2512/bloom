"use client";

import { Check, Clock, Flame, Flower2, Leaf, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBloomBalance, useBloomStore } from "@/lib/store";
import { formatVND } from "@/lib/utils";
import { AnimatedNumber } from "./animated-number";
import { useShallow } from "zustand/react/shallow";

function Card({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
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

export function SummaryCards() {
  const t = useTranslations("home");
  const { streak, focuses, garden } = useBloomStore(
    useShallow((s) => ({
      streak: s.streak,
      focuses: s.focuses,
      garden: s.garden,
    }))
  );
  const balance = useBloomBalance();

  const total = focuses.length;
  const completed = focuses.filter((f) => f.checklist.every((c) => c.done)).length;
  const remaining = total - completed;
  const focusMinutes = focuses.reduce(
    (sum, f) => sum + f.checklist.filter((c) => c.done).reduce((a, c) => a + c.estimatedMinutes, 0),
    0
  );
  const blooming = garden.filter((f) => f.stage === "bloom").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Card icon={<Sparkles size={16} className="text-amber-400" />} label={t("balance")} value={<AnimatedNumber value={balance} format={formatVND} />} />
      <Card icon={<Flame size={16} className="text-orange-400" />} label={t("streak")} value={`${streak} ${t("days")}`} />
      <Card icon={<Clock size={16} className="text-rose" />} label={t("focusHours")} value={`${(focusMinutes / 60).toFixed(1)}h`} />
      <Card icon={<Check size={16} className="text-green-500" />} label={t("tasks")} value={`${completed}/${total}`} />
      <Card icon={<Leaf size={16} className="text-pink-400" />} label={t("remaining")} value={remaining} />
      <Card icon={<Flower2 size={16} className="text-rose" />} label={t("gardenState")} value={`${blooming} 🌸`} />
    </div>
  );
}
