"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FeedbackDialog } from "./feedback-dialog";

export function FeedbackLauncher() {
  const t = useTranslations("feedback");
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t("trigger")}
        className="fixed bottom-6 right-5 z-40 btn-primary flex items-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-full text-xs font-medium shadow-lg"
      >
        <span>✨</span>
        <span className="hidden sm:inline">{t("trigger")}</span>
      </button>
      <FeedbackDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
