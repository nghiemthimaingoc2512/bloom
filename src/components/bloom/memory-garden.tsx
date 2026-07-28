"use client";

import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { Flower } from "./flower";

export function MemoryGarden() {
  const t = useTranslations("memory");
  const memory = useBloomStore((s) => s.memory);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-display">{t("title")}</div>
        <div className="text-sm text-ink-soft">{t("subtitle")}</div>
      </div>
      {memory.length === 0 ? (
        <div className="text-sm text-ink-soft text-center py-16 rounded-2xl glass">{t("empty")}</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {memory.map((m) => (
            <div key={m.id} className="rounded-2xl glass p-5 flex flex-col items-center text-center gap-2">
              <Flower stage={m.bloomLevel} kind={m.mood === "🌸" ? "sakura" : "tulip"} />
              <div className="text-xs text-ink-soft">{m.date}</div>
              <div className="text-sm italic">&ldquo;{m.quote}&rdquo;</div>
              <div className="text-lg">{m.mood}</div>
              <div className="text-[11px] text-ink-soft">
                {m.completedTasks} {t("tasksCompleted")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
