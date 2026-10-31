"use client";

import { useTranslations } from "next-intl";
import { useBloomBalance, useBloomStore } from "@/lib/store";
import { formatVND } from "@/lib/utils";
import { AnimatedNumber } from "./animated-number";
import { Flower } from "./flower";

/** Top of the dashboard: what the person's focused time has added up to,
 *  and the garden it has grown. */
export function GardenHero() {
  const t = useTranslations("home");
  const garden = useBloomStore((s) => s.garden);
  const balance = useBloomBalance();

  const blooming = garden.filter((f) => f.stage === "bloom").length;
  const wilting = garden.filter((f) => f.stage === "wilt").length;
  const fading = garden.filter((f) => f.stage === "fade").length;

  return (
    <section className="relative overflow-hidden rounded-[28px] p-6 md:p-9 border border-petal/60 shadow-[0_24px_64px_-28px_rgba(214,41,112,0.45)] bg-gradient-to-br from-white via-blush/70 to-petal/40 dark:from-night-card dark:via-night dark:to-night">
      <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 rounded-full bg-rose/25 blur-[100px]" />
      <div className="relative">
        <div className="text-base font-semibold text-rose-deep">{t("balance")}</div>
        <div className="text-5xl md:text-6xl font-bold font-mono tracking-tight mt-1 text-ink">
          <AnimatedNumber value={balance} format={formatVND} />
        </div>
        <p className="text-base text-ink-soft mt-2">{t("balanceNote")}</p>

        {garden.length > 0 ? (
          <>
            <div className="flex flex-wrap items-end gap-1 justify-center pt-6 pb-2">
              {garden.map((f, i) => (
                <Flower key={f.id} stage={f.stage} kind={f.kind} delay={i * 0.03} />
              ))}
            </div>
            <div className="text-center text-sm text-ink-soft">
              {blooming} {t("blooming")} · {wilting} {t("wilting")} · {fading} {t("fading")}
            </div>
          </>
        ) : (
          <p className="text-base text-ink-soft pt-6">{t("gardenEmpty")}</p>
        )}
      </div>
    </section>
  );
}
