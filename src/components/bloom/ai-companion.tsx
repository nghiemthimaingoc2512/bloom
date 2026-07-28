"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";

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
  const focuses = useBloomStore((s) => s.focuses);

  const total = focuses.length;
  const completed = focuses.filter((f) => f.checklist.every((c) => c.done)).length;
  const ratio = total ? completed / total : 0;
  const key = ratio >= 0.8 ? "great" : ratio >= 0.34 ? "okay" : "low";
  const pool = t.raw(key) as string[];

  const message = React.useMemo(() => pickForToday(pool), [pool]);

  return (
    <div className="rounded-2xl glass p-4 flex gap-3 items-start">
      <div className="mt-0.5 text-lg">🌷</div>
      <div className="text-sm text-ink-soft italic">{message}</div>
    </div>
  );
}
