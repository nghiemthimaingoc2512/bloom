"use client";

import { Sparkles, X } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { Flower } from "./flower";

export function GardenHero() {
  const t = useTranslations("home");
  const garden = useBloomStore((s) => s.garden);
  const displayName = useBloomStore((s) => s.displayName);
  const rolloverEvents = useBloomStore((s) => s.rolloverEvents);
  const clearRolloverEvents = useBloomStore((s) => s.clearRolloverEvents);
  const hasHistory = useBloomStore((s) => s.history.length > 0 || s.focuses.some((f) => f.checklist.some((c) => c.done)));

  const blooming = garden.filter((f) => f.stage === "bloom").length;
  const wilting = garden.filter((f) => f.stage === "wilt").length;
  const fading = garden.filter((f) => f.stage === "fade").length;

  return (
    <div className="space-y-3">
      {rolloverEvents.length > 0 && (
        <div role="status" className="rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm flex items-start gap-3">
          <ul className="flex-1 space-y-1">
            {rolloverEvents.map((e, i) => (
              <li key={i}>
                {e.kind === "quiet"
                  ? `${t("quietNotice")}${e.amount > 0 ? ` ${t("quietLost", { amount: formatVND(e.amount) })}` : ""}`
                  : t("lateNotice", { title: e.label ?? "", amount: formatVND(e.amount) })}
              </li>
            ))}
          </ul>
          <button onClick={clearRolloverEvents} aria-label={t("dismiss")} className="grid place-items-center w-8 h-8 rounded-lg hover:bg-blush text-ink-soft shrink-0">
            <X size={15} />
          </button>
        </div>
      )}
    <div className="relative overflow-hidden rounded-[28px] p-7 md:p-10 glass">

      <div className="relative flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="text-[15px] font-medium text-ink-soft mb-1.5">
            {t(hasHistory ? "welcomeBack" : "welcomeNew", { name: displayName || "" })}
          </div>
          <h1 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.025em] text-ink leading-[1.15] max-w-md text-balance">
            {t("gardenWaiting")}
          </h1>
        </div>
        <span className="shrink-0 grid place-items-center w-12 h-12 rounded-2xl bg-blush text-rose-deep">
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
    </div>
  );
}
