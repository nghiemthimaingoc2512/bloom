"use client";

import * as React from "react";
import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";

/** Deterministic pick so the message is stable across re-renders,
 *  but still varies from day to day. */
function pickForToday<T>(items: T[]): T {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return items[dayOfYear % items.length];
}

export function AiCompanion() {
  const t = useTranslations("companion");
  const pool = t.raw("quotes") as string[];

  const message = React.useMemo(() => pickForToday(pool), [pool]);

  return (
    <div className="rounded-2xl glass p-5 flex gap-3 items-center">
      <span className="grid place-items-center w-9 h-9 rounded-xl gradient-primary text-white shrink-0">
        <Quote size={16} />
      </span>
      <div className="text-sm font-medium text-ink">{message}</div>
    </div>
  );
}
