"use client";

import { Check, Pencil, Sparkles, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { Focus } from "@/lib/types";
import { useBloomStore } from "@/lib/store";
import { formatVND, pickRandom } from "@/lib/utils";
import { CATEGORY_BG, CATEGORY_ICON } from "@/lib/category-meta";

export function FocusCard({
  focus,
  onEdit,
  onDelete,
}: {
  focus: Focus;
  onEdit: (focus: Focus) => void;
  onDelete: (focus: Focus) => void;
}) {
  const t = useTranslations("board");
  const tCat = useTranslations("categories");
  const toggleStep = useBloomStore((s) => s.toggleStep);
  const showToast = useBloomStore((s) => s.showToast);
  const clearLastReward = useBloomStore((s) => s.clearLastReward);
  const encourageDone = t.raw("encourageDone") as string[];

  const done = focus.checklist.filter((c) => c.done).length;
  const total = focus.checklist.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const Icon = CATEGORY_ICON[focus.category];

  const barColor =
    pct >= 100 ? "bg-green-400" : pct >= 66 ? "bg-lime-400" : pct >= 33 ? "bg-yellow-400" : pct > 0 ? "bg-orange-400" : "bg-red-300";

  function handleToggle(stepId: string) {
    toggleStep(focus.id, stepId);
    // toggleStep updates `lastReward` synchronously in the store; read it
    // right after so we only toast when a step was newly completed.
    const reward = useBloomStore.getState().lastReward;
    if (reward) {
      const msg = pickRandom(encourageDone);
      showToast(`+${formatVND(reward.amount)} · ${msg}`);
      clearLastReward();
    }
  }

  return (
    <div className="rounded-2xl glass glass-hover p-6">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-lg ${CATEGORY_BG[focus.category]}`}>
            <Icon size={14} />
          </span>
          <span className="text-xs text-ink-soft font-medium">{tCat(`${focus.category}.label`)}</span>
        </div>
        <div className="flex items-center gap-2.5">
          {pct >= 100 && <Sparkles size={16} className="text-amber-400" />}
          <button
            onClick={() => onEdit(focus)}
            aria-label={t("edit")}
            className="text-stone-300 hover:text-rose-deep transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(focus)}
            aria-label={t("delete")}
            className="text-stone-300 hover:text-rose transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <div className="font-medium tracking-tight">{focus.title}</div>
      {focus.purpose && <div className="text-xs text-ink-soft mb-3 mt-0.5">{focus.purpose}</div>}
      <div className="w-full h-1.5 rounded-full bg-petal/30 overflow-hidden mb-4 mt-3">
        <motion.div className={`h-full ${barColor}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
      </div>
      <div className="space-y-1.5">
        {focus.checklist.map((c) => (
          <button
            key={c.id}
            onClick={() => handleToggle(c.id)}
            className={`w-full flex items-center justify-between text-sm px-3.5 py-2.5 rounded-xl border transition-all text-left ${
              c.done
                ? "border-green-200/70 bg-green-50/60 text-stone-400 line-through dark:bg-green-950/10 dark:border-green-800/30"
                : "border-petal/60 hover:border-rose hover:bg-blush/25"
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  c.done ? "bg-green-400 border-green-400" : "border-stone-300"
                }`}
              >
                {c.done && <Check size={10} className="text-white" />}
              </span>
              {c.title}
            </span>
            <span className="text-xs text-ink-soft shrink-0 ml-2">
              {c.estimatedMinutes} {t("minutes")} · {formatVND(c.reward)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
