"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/field";
import { useBloomStore } from "@/lib/store";
import { REWARD_ICON, REWARD_ICON_KEYS } from "@/lib/reward-meta";
import type { Reward, RewardIcon } from "@/lib/types";

export function NewRewardDialog({
  open,
  onOpenChange,
  reward,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reward?: Reward | null;
}) {
  const t = useTranslations("store");
  const addReward = useBloomStore((s) => s.addReward);
  const updateReward = useBloomStore((s) => s.updateReward);

  const [name, setName] = React.useState(reward?.name ?? "");
  const [cost, setCost] = React.useState(reward?.cost ?? 100_000);
  const [icon, setIcon] = React.useState<RewardIcon>(reward?.icon ?? "gift");

  function submit() {
    if (!name.trim() || cost <= 0) return;
    if (reward) {
      updateReward(reward.id, { name, cost, icon });
    } else {
      addReward({ name, cost, icon });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-lg font-display font-medium mb-5">
          {reward ? t("editReward") : t("createReward")}
        </DialogTitle>
        <div className="space-y-4">
          <div>
            <Label>{t("rewardName")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("rewardNamePlaceholder")} />
          </div>
          <div>
            <Label>{t("cost")}</Label>
            <Input type="number" min={0} step={10_000} value={cost} onChange={(e) => setCost(Number(e.target.value))} />
          </div>
          <div>
            <Label>{t("icon")}</Label>
            <div className="flex flex-wrap gap-2">
              {REWARD_ICON_KEYS.map((key) => {
                const Icon = REWARD_ICON[key];
                const active = icon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIcon(key)}
                    aria-label={key}
                    className={`grid place-items-center w-10 h-10 rounded-xl border transition-all ${
                      active
                        ? "gradient-primary text-white border-transparent shadow-md shadow-rose/25"
                        : "border-petal/60 text-ink-soft hover:border-rose hover:text-rose-deep"
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => onOpenChange(false)} className="btn-secondary px-4 py-2.5 rounded-full text-sm font-medium">
            {t("cancel")}
          </button>
          <button onClick={submit} className="btn-primary px-5 py-2.5 rounded-full text-sm font-medium">
            {reward ? t("save") : t("create")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
