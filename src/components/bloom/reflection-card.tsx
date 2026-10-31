"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { minutesOnDay, todaysFocuses } from "@/lib/reward-engine";
import { formatVND, todayKey } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

const MOODS: { emoji: string; key: "good" | "okay" | "hard" | "calm" }[] = [
  { emoji: "🌸", key: "good" },
  { emoji: "🌤️", key: "okay" },
  { emoji: "🌧️", key: "hard" },
  { emoji: "🌿", key: "calm" },
];

export function ReflectionCard() {
  const t = useTranslations("reflection");
  const { focuses, history, reflectedOn, hourlyValue, submitReflection, showToast } = useBloomStore(
    useShallow((s) => ({
      focuses: s.focuses,
      history: s.history,
      reflectedOn: s.reflectedOn,
      hourlyValue: s.hourlyValue.hourlyValue,
      submitReflection: s.submitReflection,
      showToast: s.showToast,
    }))
  );

  const [text, setText] = React.useState("");
  const [mood, setMood] = React.useState(MOODS[0].emoji);

  const today = todayKey();
  const doneToday = minutesOnDay({ focuses, history }, today) > 0;
  const todays = todaysFocuses(focuses, today);
  const completed = todays.filter((f) => f.checklist.every((c) => c.done)).length;
  const ratio = todays.length ? completed / todays.length : 0;
  const perfect = todays.length > 0 && ratio >= 1;
  const planted = perfect ? 5 : ratio >= 2 / 3 ? 3 : 1;

  if (reflectedOn === today) {
    return (
      <div className="rounded-2xl glass p-5 flex items-center gap-3">
        <Sparkles size={20} className="text-rose-deep shrink-0" />
        <div>
          <div className="font-medium">{t("doneTitle")}</div>
          <div className="text-base text-ink-soft">{t("doneSubtitle")}</div>
        </div>
      </div>
    );
  }

  if (!doneToday) {
    if (focuses.length === 0) return null;
    return <p className="text-base text-ink-soft px-1">{t("locked")}</p>;
  }

  function submit() {
    const result = submitReflection(text, mood);
    const bonus = result.bonus ? ` · +${formatVND(result.bonus)}` : "";
    showToast(`${t("plantedToast", { count: result.planted })}${bonus}`);
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl glass p-6">
      <div className="font-medium mb-1">{t("unlocked")}</div>
      <div className="text-base text-ink-soft mb-4">
        {t("subtitle", { count: planted })}
        {perfect ? ` ${t("perfectBonus", { amount: formatVND(hourlyValue) })}` : ""}
      </div>
      <label htmlFor="reflection-text" className="sr-only">
        {t("unlocked")}
      </label>
      <textarea
        id="reflection-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("placeholder")}
        rows={3}
        className="w-full rounded-xl p-3 text-base outline-none border border-petal bg-blush/40 focus:border-rose transition dark:bg-night"
      />
      <div className="mt-4 space-y-3">
        <div>
          <div className="text-sm text-ink-soft mb-1.5">{t("mood")}</div>
          <div className="flex gap-1.5 flex-wrap">
            {MOODS.map((m) => (
              <button
                key={m.emoji}
                onClick={() => setMood(m.emoji)}
                aria-pressed={mood === m.emoji}
                className={`text-base px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                  mood === m.emoji ? "border-rose bg-blush" : "border-petal hover:border-rose"
                }`}
              >
                <span aria-hidden="true">{m.emoji}</span> {t(`moods.${m.key}`)}
              </button>
            ))}
          </div>
        </div>
        <button onClick={submit} className="btn-primary px-5 py-2.5 rounded-full text-base font-medium">
          {t("save")}
        </button>
      </div>
    </motion.div>
  );
}
