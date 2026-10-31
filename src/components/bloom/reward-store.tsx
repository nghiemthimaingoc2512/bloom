"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useBloomBalance, useBloomStore } from "@/lib/store";
import { formatDayKey, formatVND } from "@/lib/utils";
import { REWARD_ICON, REWARD_TEMPLATES } from "@/lib/reward-meta";
import type { Reward } from "@/lib/types";
import { NewRewardDialog, type RewardDraft } from "./new-reward-dialog";

export function RewardStore() {
  const t = useTranslations("store");
  const locale = useLocale();
  const balance = useBloomBalance();
  const rewards = useBloomStore((s) => s.rewards);
  const redemptions = useBloomStore((s) => s.redemptions);
  const redeem = useBloomStore((s) => s.redeem);
  const deleteReward = useBloomStore((s) => s.deleteReward);
  const showToast = useBloomStore((s) => s.showToast);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Reward | null>(null);
  const [draft, setDraft] = React.useState<RewardDraft | null>(null);
  const [dialogKey, setDialogKey] = React.useState(0);
  const [confirm, setConfirm] = React.useState<{ kind: "redeem" | "delete"; reward: Reward } | null>(null);

  function openCreate() {
    setEditing(null);
    setDraft(null);
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }

  function openEdit(reward: Reward) {
    setEditing(reward);
    setDraft(null);
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }

  // An idea card only pre-fills the form: the person sets the name and the
  // price they actually want before the reward exists.
  function openFromTemplate(key: string) {
    const template = REWARD_TEMPLATES.find((tpl) => tpl.key === key);
    if (!template) return;
    setEditing(null);
    setDraft({ name: t(`templates.${template.key}`), cost: template.cost, icon: template.icon });
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  }

  function confirmAction() {
    if (!confirm) return;
    if (confirm.kind === "redeem") {
      const ok = redeem(confirm.reward);
      if (ok) showToast(`${t("redeemed")} · ${confirm.reward.name}`);
    } else {
      deleteReward(confirm.reward.id);
    }
    setConfirm(null);
  }

  const recent = [...redemptions].reverse().slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-display font-medium">{t("title")}</h1>
          <div className="text-sm text-ink-soft mt-0.5">{t("subtitle")}</div>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium"
        >
          <Plus size={15} /> {t("newReward")}
        </button>
      </div>

      <div className="rounded-2xl glass p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs text-ink-soft">{t("balanceLabel")}</div>
          <div className="text-2xl font-semibold font-mono tracking-tight">{formatVND(balance)}</div>
        </div>
        <p className="text-xs text-ink-soft max-w-[34ch]">{t("balanceNote")}</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-medium text-sm">{t("mine")}</h2>
        {rewards.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("empty")}</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {rewards.map((reward) => {
              const unlocked = balance >= reward.cost;
              const pct = Math.min(100, Math.round((balance / reward.cost) * 100));
              const Icon = REWARD_ICON[reward.icon];
              return (
                <div key={reward.id} className="rounded-2xl glass glass-hover p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`grid place-items-center w-10 h-10 rounded-xl shrink-0 ${unlocked ? "gradient-primary text-white shadow-md shadow-rose/25" : "bg-blush text-rose-deep"}`}>
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{reward.name}</div>
                      <div className="text-xs text-ink-soft font-mono">{formatVND(reward.cost)}</div>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-blush overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${unlocked ? "bg-success" : "gradient-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className={`text-xs ${unlocked ? "text-success font-medium" : "text-ink-soft"}`}>
                    {unlocked ? t("ready") : t("need", { amount: formatVND(reward.cost - balance) })}
                  </div>
                  <button
                    disabled={!unlocked}
                    onClick={() => setConfirm({ kind: "redeem", reward })}
                    className={`w-full py-2.5 rounded-full text-sm font-medium ${unlocked ? "btn-primary" : "bg-stone-100 text-stone-400 cursor-not-allowed dark:bg-white/5"}`}
                  >
                    {t("redeem")}
                  </button>
                  <div className="flex justify-end gap-1 -mb-1">
                    <button
                      onClick={() => openEdit(reward)}
                      className="flex items-center gap-1 text-xs text-ink-soft hover:text-rose-deep px-2 py-1.5 rounded-lg hover:bg-blush"
                    >
                      <Pencil size={12} /> {t("edit")}
                    </button>
                    <button
                      onClick={() => setConfirm({ kind: "delete", reward })}
                      className="flex items-center gap-1 text-xs text-ink-soft hover:text-error px-2 py-1.5 rounded-lg hover:bg-blush"
                    >
                      <Trash2 size={12} /> {t("delete")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {recent.length > 0 && (
        <section className="rounded-2xl glass p-5">
          <h2 className="font-medium text-sm mb-2">{t("history")}</h2>
          <div className="divide-y divide-petal">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <div className="truncate">{r.rewardName}</div>
                  <div className="text-xs text-ink-soft">{formatDayKey(r.redeemedAt.slice(0, 10), locale)}</div>
                </div>
                <div className="font-mono text-xs text-ink-soft shrink-0">-{formatVND(r.cost)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="font-medium text-sm">{t("inspiration")}</h2>
          <div className="text-xs text-ink-soft mt-0.5">{t("inspirationSubtitle")}</div>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {REWARD_TEMPLATES.map((template) => {
            const Icon = REWARD_ICON[template.icon];
            return (
              <div key={template.key} className="rounded-2xl border border-dashed border-petal p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-blush text-rose-deep shrink-0">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">{t(`templates.${template.key}`)}</div>
                    <div className="text-xs text-ink-soft font-mono">
                      {t("suggestedPrice", { amount: formatVND(template.cost) })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => openFromTemplate(template.key)}
                  className="btn-secondary w-full py-2 rounded-full text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <Plus size={13} /> {t("useTemplate")}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <NewRewardDialog key={dialogKey} open={dialogOpen} onOpenChange={setDialogOpen} reward={editing} initial={draft} />

      {confirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reward-confirm-title"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/25 p-4"
          onClick={() => setConfirm(null)}
        >
          <div className="w-full max-w-sm rounded-2xl glass p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div id="reward-confirm-title" className="font-display text-lg font-medium">
              {confirm.kind === "redeem"
                ? t("confirmRedeemTitle", { name: confirm.reward.name })
                : t("confirmDeleteTitle", { name: confirm.reward.name })}
            </div>
            <p className="text-sm text-ink-soft">
              {confirm.kind === "redeem"
                ? t("confirmRedeemBody", {
                    amount: formatVND(confirm.reward.cost),
                    left: formatVND(balance - confirm.reward.cost),
                  })
                : t("confirmDeleteBody")}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="btn-secondary px-4 py-2 rounded-full text-sm font-medium">
                {t("cancel")}
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 rounded-full text-sm font-medium ${confirm.kind === "redeem" ? "btn-primary" : "bg-error text-white"}`}
              >
                {confirm.kind === "redeem" ? t("redeem") : t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
