"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { FocusCard } from "./focus-card";
import { NewFocusDialog } from "./new-focus-dialog";

export function FocusBoard() {
  const t = useTranslations("board");
  const focuses = useBloomStore((s) => s.focuses);
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-lg font-display">{t("title")}</div>
          <div className="text-sm text-ink-soft">{t("subtitle")}</div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 px-4 py-2 rounded-full bg-rose text-white text-sm hover:bg-rose-deep transition"
        >
          <Plus size={15} /> {t("newFocus")}
        </button>
      </div>

      {focuses.length === 0 ? (
        <div className="text-sm text-ink-soft text-center py-16 rounded-2xl glass">{t("empty")}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {focuses.map((f) => (
            <FocusCard key={f.id} focus={f} />
          ))}
        </div>
      )}

      <NewFocusDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
