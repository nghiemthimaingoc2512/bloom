"use client";

import { Clapperboard, Coffee, Lock, Music2, Plane, Users2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { formatVND } from "@/lib/utils";

const ITEMS = [
  { key: "coffee", cost: 600_000, Icon: Coffee },
  { key: "networking", cost: 1_200_000, Icon: Users2 },
  { key: "movie", cost: 2_400_000, Icon: Clapperboard },
  { key: "music", cost: 1_200_000, Icon: Music2 },
  { key: "travel", cost: 2_400_000, Icon: Plane },
] as const;

export function DreamStore() {
  const t = useTranslations("store");
  const balance = useBloomStore((s) => s.balance);
  const redeem = useBloomStore((s) => s.redeem);
  const showToast = useBloomStore((s) => s.showToast);

  function handleRedeem(cost: number, name: string) {
    const ok = redeem(cost);
    if (ok) showToast(`${t("redeemed")} · ${name}`);
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-display">{t("title")}</div>
        <div className="text-sm text-ink-soft">{t("subtitle")}</div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {ITEMS.map(({ key, cost, Icon }) => {
          const unlocked = balance >= cost;
          const name = t(`items.${key}`);
          return (
            <div key={key} className="relative rounded-2xl glass p-5 flex flex-col items-center text-center gap-2">
              {!unlocked && <Lock size={14} className="absolute top-4 right-4 text-stone-300" />}
              <div className={`p-3 rounded-full ${unlocked ? "bg-rose-100 text-rose-500" : "bg-stone-100 text-stone-400"}`}>
                <Icon size={20} />
              </div>
              <div className="font-medium text-sm">{name}</div>
              <div className="text-xs text-ink-soft font-mono">{formatVND(cost)}</div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  unlocked ? "bg-green-50 text-green-600" : "bg-stone-100 text-stone-400"
                }`}
              >
                {unlocked ? t("unlocked") : t("locked")}
              </span>
              <button
                disabled={!unlocked}
                onClick={() => handleRedeem(cost, name)}
                className={`mt-2 w-full py-2 rounded-full text-sm transition ${
                  unlocked ? "bg-rose text-white hover:bg-rose-deep" : "bg-stone-100 text-stone-400 cursor-not-allowed"
                }`}
              >
                {t("redeem")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
