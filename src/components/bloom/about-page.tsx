"use client";

import { useTranslations } from "next-intl";
import { Compass, Rocket, Target } from "lucide-react";

const WHY_KEYS = ["why1", "why2", "why3", "why4", "why5", "why6"] as const;

export function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3 py-4">
        <div className="text-3xl">🌸</div>
        <div className="text-2xl font-display font-medium">{t("title")}</div>
        <div className="text-rose-deep font-medium text-base">{t("tagline")}</div>
        <p className="text-base text-ink-soft max-w-md mx-auto">{t("description")}</p>
      </div>

      <section className="rounded-2xl glass p-6 space-y-3">
        <div className="font-medium text-base flex items-center gap-2">
          <Target size={16} className="text-rose-deep" /> {t("whyTitle")}
        </div>
        <p className="text-sm text-ink-soft">{t("whyIntro")}</p>
        <ul className="grid sm:grid-cols-2 gap-2 text-base">
          {WHY_KEYS.map((key) => (
            <li key={key} className="flex items-center gap-2 text-ink">
              <span className="w-1.5 h-1.5 rounded-full bg-rose shrink-0" />
              {t(key)}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl glass p-6 space-y-2">
        <div className="font-medium text-base flex items-center gap-2">
          <Compass size={16} className="text-rose-deep" /> {t("philosophyTitle")}
        </div>
        <p className="text-base text-ink-soft">{t("philosophyBody")}</p>
      </section>

      <section className="rounded-2xl glass p-6 space-y-2">
        <div className="font-medium text-base flex items-center gap-2">
          <Rocket size={16} className="text-rose-deep" /> {t("visionTitle")}
        </div>
        <p className="text-base text-ink-soft">{t("visionBody")}</p>
      </section>

      <section className="rounded-2xl glass p-6 space-y-2">
        <div className="font-medium text-base">{t("statusTitle")}</div>
        <p className="text-base font-medium text-rose-deep">{t("statusBadge")}</p>
        <p className="text-base text-ink-soft">{t("statusBody")}</p>
      </section>
    </div>
  );
}
