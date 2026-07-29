"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import type { Focus } from "@/lib/types";
import { FocusCard } from "./focus-card";
import { FocusDialog } from "./focus-dialog";

export function FocusBoard() {
  const t = useTranslations("board");
  const focuses = useBloomStore((s) => s.focuses);
  const deleteFocus = useBloomStore((s) => s.deleteFocus);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Focus | null>(null);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(focus: Focus) {
    setEditing(focus);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xl font-display font-medium">{t("title")}</div>
          <div className="text-sm text-ink-soft mt-0.5">{t("subtitle")}</div>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium"
        >
          <Plus size={15} /> {t("newFocus")}
        </button>
      </div>

      {focuses.length === 0 ? (
        <div className="text-sm text-ink-soft text-center py-20">{t("empty")}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {focuses.map((f) => (
            <FocusCard key={f.id} focus={f} onEdit={openEdit} onDelete={(focus) => deleteFocus(focus.id)} />
          ))}
        </div>
      )}

      <FocusDialog key={editing?.id ?? "new"} open={open} onOpenChange={setOpen} focus={editing} />
    </div>
  );
}
