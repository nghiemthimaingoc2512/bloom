"use client";

import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { formatVND } from "@/lib/utils";

/** The rules shown here are exactly what store.ts implements, with the
 *  person's own hourly value filled in - no promises the app does not keep. */
export function MomentumRules() {
  const t = useTranslations("momentum");
  const hourly = useBloomStore((s) => s.hourlyValue.hourlyValue);

  const rules = [
    t("ruleStep", { amount: formatVND(hourly) }),
    t("ruleStreak", { amount: formatVND(hourly) }),
    t("ruleFullDay", { amount: formatVND(hourly) }),
    t("ruleLostStreak", { amount: formatVND(hourly / 2) }),
    t("ruleLate", { amount: formatVND(hourly * 3) }),
    t("ruleRefund"),
    t("ruleMath"),
  ];

  return (
    <details className="rounded-2xl glass p-5 group">
      <summary className="flex items-center gap-2 cursor-pointer list-none min-h-8">
        <Info size={15} className="text-ink-soft shrink-0" />
        <span className="font-medium text-base">{t("title")}</span>
        <span className="text-sm text-ink-soft ml-auto group-open:hidden">{t("show")}</span>
        <span className="text-sm text-ink-soft ml-auto hidden group-open:inline">{t("hide")}</span>
      </summary>
      <ul className="text-base text-ink-soft mt-3 space-y-1.5 list-disc pl-5">
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </details>
  );
}
