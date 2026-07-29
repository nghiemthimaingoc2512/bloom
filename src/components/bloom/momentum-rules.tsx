"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CloudFog } from "lucide-react";
import { useTranslations } from "next-intl";

export function MomentumRules() {
  const t = useTranslations("momentum");
  const [preview, setPreview] = React.useState(false);

  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-medium text-sm">{t("title")}</div>
          <div className="text-xs text-ink-soft mt-0.5">{t("subtitle")}</div>
        </div>
        <button
          onClick={() => setPreview((v) => !v)}
          className="btn-secondary text-xs px-3.5 py-1.5 rounded-full transition"
        >
          {t("preview")}
        </button>
      </div>
      <ul className="text-xs text-ink-soft mt-3 space-y-1.5 list-disc list-inside">
        <li>{t("rule1")}</li>
        <li>{t("rule2")}</li>
        <li>{t("rule3")}</li>
        <li>{t("rule4")}</li>
      </ul>
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 text-sm text-amber-700 bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 flex items-center gap-2 dark:bg-amber-950/20 dark:border-amber-800/40 dark:text-amber-300">
              <CloudFog size={16} className="shrink-0" /> {t("quietMessage")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
