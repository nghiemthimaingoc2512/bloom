"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/field";
import { useBloomStore } from "@/lib/store";
import { REWARD_ICON, REWARD_ICON_KEYS } from "@/lib/reward-meta";
import { formatVND } from "@/lib/utils";
import type { Reward, RewardIcon } from "@/lib/types";

export interface RewardDraft {
  name: string;
  cost: number;
  icon: RewardIcon;
}

export function NewRewardDialog({
  open,
  onOpenChange,
  reward,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** An existing reward to edit. */
  reward?: Reward | null;
  /** Pre-filled values for a new reward, e.g. from an idea card; the
   *  person still sets the final name and price before anything is saved. */
  initial?: RewardDraft | null;
}) {
  const t = useTranslations("store");
  const addReward = useBloomStore((s) => s.addReward);
  const updateReward = useBloomStore((s) => s.updateReward);
  const hourlyValue = useBloomStore((s) => s.hourlyValue.hourlyValue);

  const seed = reward ?? initial;
  const [name, setName] = React.useState(seed?.name ?? "");
  const [cost, setCost] = React.useState(String(seed?.cost ?? 100_000));
  const [icon, setIcon] = React.useState<RewardIcon>(seed?.icon ?? "gift");
  const [errors, setErrors] = React.useState<{ name?: boolean; cost?: boolean }>({});

  const costNumber = Number(cost);
  const hours = hourlyValue > 0 && costNumber > 0 ? costNumber / hourlyValue : 0;

  function submit() {
    const nextErrors = { name: !name.trim(), cost: !(costNumber > 0) };
    if (nextErrors.name || nextErrors.cost) {
      setErrors(nextErrors);
      return;
    }
    const payload = { name: name.trim(), cost: Math.round(costNumber), icon };
    if (reward) {
      updateReward(reward.id, payload);
    } else {
      addReward(payload);
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
            <Label htmlFor="reward-name">{t("rewardName")}</Label>
            <Input
              id="reward-name"
              autoFocus
              value={name}
              aria-invalid={errors.name || undefined}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((er) => ({ ...er, name: false }));
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={t("rewardNamePlaceholder")}
              className={errors.name ? "border-error" : undefined}
            />
            {errors.name && <p className="text-xs text-error mt-1">{t("nameRequired")}</p>}
          </div>
          <div>
            <Label htmlFor="reward-cost">{t("cost")}</Label>
            <Input
              id="reward-cost"
              type="number"
              min={0}
              step={10_000}
              inputMode="numeric"
              value={cost}
              aria-invalid={errors.cost || undefined}
              onChange={(e) => {
                setCost(e.target.value);
                if (errors.cost) setErrors((er) => ({ ...er, cost: false }));
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className={errors.cost ? "border-error" : undefined}
            />
            {errors.cost ? (
              <p className="text-xs text-error mt-1">{t("costRequired")}</p>
            ) : (
              hours > 0 && (
                <p className="text-xs text-ink-soft mt-1">
                  {t("costHint", { amount: formatVND(costNumber), hours: hours.toFixed(1) })}
                </p>
              )
            )}
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
                    aria-pressed={active}
                    className={`grid place-items-center w-10 h-10 rounded-xl border transition-all ${
                      active
                        ? "gradient-primary text-white border-transparent shadow-md shadow-rose/25"
                        : "border-petal text-ink-soft hover:border-rose hover:text-rose-deep"
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
