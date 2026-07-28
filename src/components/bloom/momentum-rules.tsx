"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function MomentumRules() {
  const t = useTranslations("momentum");
  const [preview, setPreview] = React.useState(false);

  return (
    <div className="rounded-2xl glass p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-medium text-sm">{t("title")}</div>
          <div className="text-xs text-ink-soft">{t("subtitle")}</div>
        </div>
        <button
          onClick={() => setPreview((v) => !v)}
          className="text-xs px-3 py-1.5 rounded-full glass text-ink-soft hover:text-rose-deep transition"
        >
          {t("preview")}
        </button>
      </div>
      <ul className="text-xs text-ink-soft mt-3 space-y-1 list-disc list-inside">
        <li>{t("rule1")}</li>
        <li>{t("rule2")}</li>
      </ul>
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 text-sm text-amber-700 bg-amber-50/70 border border-amber-200 rounded-xl p-3">
              ☁️ {t("quietMessage")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
