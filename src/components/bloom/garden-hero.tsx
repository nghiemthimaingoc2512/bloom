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
    <div className="relative overflow-hidden rounded-[28px] p-7 md:p-10 border border-petal/50 shadow-[0_24px_64px_-28px_rgba(214,41,112,0.4)] bg-gradient-to-br from-white via-blush/60 to-petal/30 dark:from-night-card dark:via-night dark:to-night">
      <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 rounded-full bg-rose/25 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-[#FF7FB5]/25 blur-[90px]" />

      <div className="relative flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="text-[12px] uppercase tracking-[0.16em] text-rose-deep font-semibold mb-2">
            {t("welcomeBack")}
          </div>
          <h1 className="text-2xl md:text-[28px] font-display font-medium tracking-tight text-ink leading-snug max-w-md">
            {t("gardenWaiting")}
          </h1>
        </div>
        <span className="shrink-0 grid place-items-center w-12 h-12 rounded-2xl gradient-primary text-white shadow-lg shadow-rose/30">
          <Sparkles size={20} />
        </span>
      </div>

      {garden.length > 0 ? (
        <>
          <div className="relative flex flex-wrap items-end gap-1 justify-center py-4">
            {garden.map((f, i) => (
              <Flower key={f.id} stage={f.stage} kind={f.kind} delay={i * 0.03} />
            ))}
          </div>
          <div className="relative text-center text-xs text-ink-soft mt-2">
            {t("gardenState")}: {blooming} {t("blooming")} · {wilting} {t("wilting")} · {fading} {t("fading")}
          </div>
        </>
      ) : (
        <div className="relative text-center py-12 text-sm text-ink-soft">{t("gardenEmpty")}</div>
      )}
    </div>
  );
}
