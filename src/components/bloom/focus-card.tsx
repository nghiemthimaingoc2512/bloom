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

  const barColor = pct >= 100 ? "bg-success" : "gradient-primary";

  function handleToggle(stepId: string) {
    toggleStep(focus.id, stepId);
    // toggleStep updates `lastReward` synchronously in the store; read it
    // right after so we only toast when a step was newly completed.
    const reward = useBloomStore.getState().lastReward;
    if (reward) {
      if (reward.undone) {
        showToast(reward.amount > 0 ? t("undoneToast", { amount: formatVND(reward.amount) }) : t("undoneFree"));
      } else if (reward.finishedTask) {
        showToast(`${t("taskDone", { title: focus.title })}${reward.amount > 0 ? ` · +${formatVND(reward.amount)}` : ""}`);
      } else if (reward.amount > 0) {
        showToast(`+${formatVND(reward.amount)} · ${pickRandom(encourageDone)}`);
      } else {
        showToast(t("loggedOnly"));
      }
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
          {pct >= 100 && <Sparkles size={16} className="text-success" />}
          <button
            onClick={() => onEdit(focus)}
            aria-label={t("edit")}
            className="flex items-center gap-1 text-xs text-ink-soft hover:text-rose-deep px-2 py-1 rounded-lg hover:bg-blush transition-colors"
          >
            <Pencil size={13} /> {t("edit")}
          </button>
          <button
            onClick={() => onDelete(focus)}
            aria-label={t("delete")}
            className="flex items-center gap-1 text-xs text-ink-soft hover:text-error px-2 py-1 rounded-lg hover:bg-blush transition-colors"
          >
            <Trash2 size={13} /> {t("delete")}
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
            aria-pressed={c.done}
            aria-label={`${c.title}: ${c.done ? t("markUndone") : t("markDone")}`}
            className={`w-full flex items-center justify-between text-sm px-3.5 py-2.5 rounded-xl border transition-all text-left min-h-11 ${
              c.done
                ? "border-success/40 bg-success/10 text-ink-soft line-through"
                : "border-petal hover:border-rose hover:bg-blush"
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  c.done ? "bg-success border-success" : "border-ink-muted"
                }`}
              >
                {c.done && <Check size={10} className="text-white" />}
              </span>
              {c.title}
            </span>
            <span className="text-xs text-ink-soft shrink-0 ml-2">
              {c.estimatedMinutes} {t("minutes")} · {c.reward > 0 ? formatVND(c.reward) : t("noReward")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
