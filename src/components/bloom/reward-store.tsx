"use client";

import * as React from "react";
import { Lock, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { formatVND } from "@/lib/utils";
import { REWARD_ICON, REWARD_TEMPLATES } from "@/lib/reward-meta";
import type { Reward } from "@/lib/types";
import { NewRewardDialog } from "./new-reward-dialog";

export function RewardStore() {
  const t = useTranslations("store");
  const balance = useBloomStore((s) => s.balance);
  const rewards = useBloomStore((s) => s.rewards);
  const redeem = useBloomStore((s) => s.redeem);
  const addReward = useBloomStore((s) => s.addReward);
  const deleteReward = useBloomStore((s) => s.deleteReward);
  const showToast = useBloomStore((s) => s.showToast);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Reward | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(reward: Reward) {
    setEditing(reward);
    setDialogOpen(true);
  }

  function handleRedeem(reward: Reward) {
    const ok = redeem(reward.cost);
    if (ok) showToast(`${t("redeemed")} · ${reward.name}`);
  }

  function applyTemplate(key: string) {
    const template = REWARD_TEMPLATES.find((tpl) => tpl.key === key);
    if (!template) return;
    addReward({ name: t(`templates.${template.key}`), cost: template.cost, icon: template.icon });
    showToast(t("templateAdded"));
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xl font-display font-medium">{t("title")}</div>
          <div className="text-sm text-ink-soft mt-0.5">{t("subtitle")}</div>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium"
        >
          <Plus size={15} /> {t("newReward")}
        </button>
      </div>

      {rewards.length === 0 ? (
        <div className="text-sm text-ink-soft text-center py-16">{t("empty")}</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {rewards.map((reward) => {
            const unlocked = balance >= reward.cost;
            const Icon = REWARD_ICON[reward.icon];
            return (
              <div
                key={reward.id}
                className="relative rounded-2xl glass glass-hover p-6 flex flex-col items-center text-center gap-2"
              >
                <div className="absolute top-4 right-4 flex items-center gap-2.5">
                  <button
                    onClick={() => openEdit(reward)}
                    aria-label={t("edit")}
                    className="text-stone-300 hover:text-rose-deep transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => deleteReward(reward.id)}
                    aria-label={t("delete")}
                    className="text-stone-300 hover:text-rose transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                {!unlocked && <Lock size={14} className="absolute top-5 left-5 text-stone-300" />}
                <div
                  className={`p-3.5 rounded-2xl mt-2 ${
                    unlocked ? "gradient-primary text-white shadow-md shadow-rose/25" : "bg-stone-100 text-stone-400 dark:bg-white/5"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <div className="font-medium text-sm mt-1">{reward.name}</div>
                <div className="text-xs text-ink-soft font-mono">{formatVND(reward.cost)}</div>
                <span
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                    unlocked
                      ? "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                      : "bg-stone-100 text-stone-400 dark:bg-white/5"
                  }`}
                >
                  {unlocked ? t("unlocked") : t("locked")}
                </span>
                <button
                  disabled={!unlocked}
                  onClick={() => handleRedeem(reward)}
                  className={`mt-3 w-full py-2.5 rounded-full text-sm font-medium transition ${
                    unlocked ? "btn-primary" : "bg-stone-100 text-stone-400 cursor-not-allowed dark:bg-white/5"
                  }`}
                >
                  {t("redeem")}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <div className="font-medium text-sm flex items-center gap-1.5">
            <Sparkles size={15} className="text-amber-400" /> {t("inspiration")}
          </div>
          <div className="text-xs text-ink-soft mt-0.5">{t("inspirationSubtitle")}</div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {REWARD_TEMPLATES.map((template) => {
            const Icon = REWARD_ICON[template.icon];
            return (
              <div
                key={template.key}
                className="rounded-2xl border border-dashed border-petal/70 p-5 flex flex-col items-center text-center gap-2"
              >
                <div className="p-3 rounded-2xl bg-blush/70 text-rose-deep dark:bg-white/5">
                  <Icon size={18} />
                </div>
                <div className="font-medium text-sm mt-1">{t(`templates.${template.key}`)}</div>
                <div className="text-xs text-ink-soft font-mono">{formatVND(template.cost)}</div>
                <button
                  onClick={() => applyTemplate(template.key)}
                  className="btn-secondary mt-2 w-full py-2 rounded-full text-xs font-medium"
                >
                  {t("useTemplate")}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <NewRewardDialog key={editing?.id ?? "new"} open={dialogOpen} onOpenChange={setDialogOpen} reward={editing} />
    </div>
  );
}
