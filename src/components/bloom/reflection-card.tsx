"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { formatVND } from "@/lib/utils";

const MOODS = ["🌸", "🌤️", "🌧️", "🌿"];

export function ReflectionCard() {
  const t = useTranslations("reflection");
  const { focuses, reflectedToday, submitReflection, showToast } = useBloomStore((s) => ({
    focuses: s.focuses,
    reflectedToday: s.reflectedToday,
    submitReflection: s.submitReflection,
    showToast: s.showToast,
  }));

  const [text, setText] = React.useState("");
  const [mood, setMood] = React.useState(MOODS[0]);

  const total = focuses.length;
  const completed = focuses.filter((f) => f.checklist.every((c) => c.done)).length;
  const ratio = total ? completed / total : 0;

  if (ratio < 2 / 3) return null;

  if (reflectedToday) {
    if (ratio >= 1) {
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-amber-700 flex items-center gap-3">
          <Sparkles size={20} className="text-amber-400" />
          <div>
            <div className="font-medium">{t("perfectTitle")}</div>
            <div className="text-sm opacity-80">{t("perfectSubtitle")}</div>
          </div>
        </div>
      );
    }
    return null;
  }

  function submit() {
    const { perfect } = submitReflection(text, mood);
    if (perfect) {
      showToast(`🌟 ${t("perfectTitle")} · +${formatVND(120000)}`);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl glass p-5">
      <div className="font-medium mb-1">{t("unlocked")}</div>
      <div className="text-sm text-ink-soft mb-3">{t("subtitle")}</div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("placeholder")}
        rows={3}
        className="w-full rounded-xl p-3 text-sm outline-none border border-blush bg-blush/30 focus:border-rose dark:bg-night dark:border-ink-soft/30"
      />
      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`text-lg px-2 py-1 rounded-lg transition ${mood === m ? "bg-petal" : ""}`}
              aria-label={m}
            >
              {m}
            </button>
          ))}
        </div>
        <button onClick={submit} className="px-4 py-2 rounded-full bg-rose text-white text-sm hover:bg-rose-deep transition">
          {t("save")}
        </button>
      </div>
    </motion.div>
  );
}
