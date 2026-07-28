"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { Flower } from "./flower";

export function GardenHero() {
  const t = useTranslations("home");
  const garden = useBloomStore((s) => s.garden);

  const blooming = garden.filter((f) => f.stage === "bloom").length;
  const wilting = garden.filter((f) => f.stage === "wilt").length;
  const fading = garden.filter((f) => f.stage === "fade").length;

  return (
    <div className="relative overflow-hidden rounded-3xl glass p-6">
      <div className="flex items-start justify-between mb-2 gap-4">
        <div>
          <div className="text-lg font-display">{t("welcomeBack")}</div>
          <div className="text-sm text-ink-soft max-w-md">{t("gardenWaiting")}</div>
        </div>
        <Sparkles className="text-amber-300 shrink-0" size={22} />
      </div>
      <div className="flex flex-wrap items-end gap-1 justify-center py-4">
        {garden.map((f, i) => (
          <Flower key={f.id} stage={f.stage} kind={f.kind} delay={i * 0.03} />
        ))}
      </div>
      <div className="text-center text-xs text-ink-soft">
        {t("gardenState")}: {blooming} {t("blooming")} · {wilting} {t("wilting")} · {fading} {t("fading")}
      </div>
    </div>
  );
}
