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
  const [tab, setTab] = React.useState<"active" | "done">("active");
  const [pendingDelete, setPendingDelete] = React.useState<Focus | null>(null);
  const isDone = (f: Focus) => f.checklist.length > 0 && f.checklist.every((c) => c.done);
  const active = focuses.filter((f) => !isDone(f));
  const finished = focuses.filter(isDone).reverse();
  const list = tab === "active" ? active : finished;

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

      <div role="tablist" className="inline-flex gap-1 p-1 rounded-full bg-blush">
        {(["active", "done"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === k ? "bg-surface text-rose-deep shadow-sm" : "text-ink-soft"}`}
          >
            {k === "active" ? t("tabActive") : t("tabDone")} ({k === "active" ? active.length : finished.length})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center space-y-3">
          <p className="text-sm text-ink-soft max-w-[46ch] mx-auto">{tab === "active" ? t("empty") : t("emptyDone")}</p>
          {tab === "active" && (
            <button onClick={openCreate} className="btn-primary inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium">
              <Plus size={15} /> {t("newFocus")}
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {list.map((f) => (
            <FocusCard key={f.id} focus={f} onEdit={openEdit} onDelete={setPendingDelete} />
          ))}
        </div>
      )}

      {pendingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="focus-delete-title"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/25 p-4"
          onClick={() => setPendingDelete(null)}
        >
          <div className="w-full max-w-sm rounded-2xl glass p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div id="focus-delete-title" className="font-display text-lg font-medium">{t("confirmDeleteTitle")}</div>
            <p className="text-sm text-ink-soft">{t("confirmDeleteBody", { title: pendingDelete.title })}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setPendingDelete(null)} className="btn-secondary px-4 py-2 rounded-full text-sm font-medium">{t("cancel")}</button>
              <button
                onClick={() => {
                  deleteFocus(pendingDelete.id);
                  setPendingDelete(null);
                }}
                className="bg-error text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      <FocusDialog key={editing?.id ?? "new"} open={open} onOpenChange={setOpen} focus={editing} />
    </div>
  );
}
