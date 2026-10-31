"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useBloomStore } from "@/lib/store";

export function BetaBanner() {
  const t = useTranslations("beta");
  const dismissed = useBloomStore((s) => s.betaBannerDismissed);
  const dismissBetaBanner = useBloomStore((s) => s.dismissBetaBanner);

  if (dismissed) return null;

  return (
    <div className="max-w-5xl mx-auto px-5 pt-4">
      <div className="glass rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full gradient-primary text-white font-medium text-[11px] shrink-0">
            🌸 {t("badge")}
          </span>
          <span className="text-ink-soft">{t("message")}</span>
        </div>
        <button
          onClick={dismissBetaBanner}
          aria-label={t("dismiss")}
          className="text-ink-soft hover:text-rose-deep transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
