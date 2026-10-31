"use client";

import * as React from "react";
import { Clock, Flame, Plus, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { earnedOnDay, minutesOnDay } from "@/lib/reward-engine";
import { formatVND, minutesToReward, pickRandom, todayKey, uid } from "@/lib/utils";
import type { Focus } from "@/lib/types";
import { FocusCard } from "./focus-card";
import { FocusDialog } from "./focus-dialog";

function Stat({ icon, label, value, wide }: { icon: React.ReactNode; label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-2xl bg-surface/80 border border-petal/60 px-4 py-3 min-w-0 ${wide ? "col-span-2 sm:col-span-1" : ""}`}>
      <div className="flex items-center gap-1.5 text-[13px] font-medium text-ink-soft">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-xl md:text-2xl font-bold font-mono tracking-tight mt-0.5">{value}</div>
    </div>
  );
}

/** The Today screen: say what is left, make adding the next task the obvious
 *  move, and keep every open step one tap away. */
export function FocusBoard() {
  const t = useTranslations("board");
  const tHome = useTranslations("home");
  const focuses = useBloomStore((s) => s.focuses);
  const history = useBloomStore((s) => s.history);
  const streak = useBloomStore((s) => s.streak);
  const displayName = useBloomStore((s) => s.displayName);
  const hourlyValue = useBloomStore((s) => s.hourlyValue.hourlyValue);
  const addFocus = useBloomStore((s) => s.addFocus);
  const deleteFocus = useBloomStore((s) => s.deleteFocus);
  const showToast = useBloomStore((s) => s.showToast);
  const rolloverEvents = useBloomStore((s) => s.rolloverEvents);
  const clearRolloverEvents = useBloomStore((s) => s.clearRolloverEvents);
  const encourageNew = t.raw("encourageNew") as string[];

  const [open, setOpen] = React.useState(false);
  const [dialogKey, setDialogKey] = React.useState(0);
  const [editing, setEditing] = React.useState<Focus | null>(null);
  const [draftTitle, setDraftTitle] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [tab, setTab] = React.useState<"active" | "done">("active");
  const [pendingDelete, setPendingDelete] = React.useState<Focus | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isDone = (f: Focus) => f.checklist.length > 0 && f.checklist.every((c) => c.done);
  const active = focuses.filter((f) => !isDone(f));
  const finished = focuses.filter(isDone).reverse();
  const list = tab === "active" ? active : finished;

  const today = todayKey();
  const openSteps = focuses.flatMap((f) => f.checklist.filter((c) => !c.done));
  const openMinutes = openSteps.reduce((a, c) => a + c.estimatedMinutes, 0);
  const minutesToday = minutesOnDay({ focuses, history }, today);
  const formatTime = (m: number) => (m < 60 ? `${m} ${t("minutes")}` : `${(m / 60).toFixed(1)}h`);

  const headline =
    focuses.length === 0
      ? tHome("heroEmpty")
      : openSteps.length > 0
        ? tHome("heroLeft", { count: openSteps.length, time: formatTime(openMinutes) })
        : tHome("heroDone");

  function quickAdd(e: React.FormEvent) {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) {
      inputRef.current?.focus();
      return;
    }
    addFocus({
      title: clean,
      purpose: "",
      category: "create",
      priority: "medium",
      startDate: null,
      deadline: null,
      estimatedDuration: "",
      stakeholders: "",
      expectedOutput: "",
      notes: "",
      checklist: [
        { id: uid(), title: clean, estimatedMinutes: 30, reward: minutesToReward(30, hourlyValue), done: false, doneAt: null },
      ],
    });
    setTitle("");
    setTab("active");
    showToast(pickRandom(encourageNew));
  }

  function openDetails() {
    setEditing(null);
    setDraftTitle(title.trim());
    setDialogKey((k) => k + 1);
    setOpen(true);
    setTitle("");
  }

  function openEdit(focus: Focus) {
    setEditing(focus);
    setDraftTitle("");
    setDialogKey((k) => k + 1);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      {rolloverEvents.length > 0 && (
        <div role="status" className="rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-base flex items-start gap-3">
          <ul className="flex-1 space-y-1">
            {rolloverEvents.map((e, i) => (
              <li key={i}>
                {e.kind === "quiet"
                  ? `${tHome("quietNotice")}${e.amount > 0 ? ` ${tHome("quietLost", { amount: formatVND(e.amount) })}` : ""}`
                  : tHome("lateNotice", { title: e.label ?? "", amount: formatVND(e.amount) })}
              </li>
            ))}
          </ul>
          <button onClick={clearRolloverEvents} aria-label={tHome("dismiss")} className="grid place-items-center w-9 h-9 rounded-lg hover:bg-blush text-ink-soft shrink-0">
            <X size={18} />
          </button>
        </div>
      )}

      <section className="relative overflow-hidden rounded-[28px] p-5 md:p-7 border border-petal/60 shadow-[0_24px_64px_-28px_rgba(214,41,112,0.45)] bg-gradient-to-br from-white via-blush/70 to-petal/40 dark:from-night-card dark:via-night dark:to-night">
        <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 rounded-full bg-rose/25 blur-[100px]" />
        <div className="relative space-y-5">
          <div>
            <div className="text-sm font-semibold text-rose-deep mb-1">
              {tHome(focuses.length === 0 && history.length === 0 ? "welcomeNew" : "welcomeBack", { name: displayName })}
            </div>
            <h1 className="text-2xl md:text-[32px] font-display font-semibold tracking-tight text-ink leading-[1.15]">{headline}</h1>
          </div>

          <form onSubmit={quickAdd} data-tour="quick-add" className="flex flex-col sm:flex-row gap-2.5">
            <label htmlFor="quick-add" className="sr-only">
              {tHome("quickPlaceholder")}
            </label>
            <input
              id="quick-add"
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={tHome("quickPlaceholder")}
              className="w-full sm:flex-1 min-w-0 h-12 shrink-0 sm:shrink rounded-2xl px-4 text-base outline-none border-2 border-petal bg-surface focus:border-rose transition shadow-sm"
            />
            <button type="submit" className="btn-primary h-12 flex items-center justify-center gap-2 px-6 rounded-2xl text-base shrink-0">
              <Plus size={18} /> {t("newFocus")}
            </button>
          </form>
          <button type="button" onClick={openDetails} className="text-sm font-semibold text-rose-deep underline-offset-4 hover:underline">
            {tHome("moreOptions")}
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <Stat wide icon={<Sparkles size={15} className="text-amber-500" />} label={tHome("earnedToday")} value={formatVND(earnedOnDay({ focuses, history }, today))} />
            <Stat icon={<Clock size={15} className="text-rose" />} label={tHome("focusHours")} value={`${(minutesToday / 60).toFixed(1)}h`} />
            <Stat icon={<Flame size={15} className="text-orange-500" />} label={tHome("streak")} value={String(streak)} />
          </div>
        </div>
      </section>

      <div role="tablist" className="inline-flex gap-1 p-1 rounded-full bg-blush">
        {(["active", "done"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${tab === k ? "bg-surface text-rose-deep shadow-sm" : "text-ink-soft"}`}
          >
            {k === "active" ? t("tabActive") : t("tabDone")} ({k === "active" ? active.length : finished.length})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl glass p-8 text-center">
          <p className="text-base text-ink-soft max-w-[46ch] mx-auto">{tab === "active" ? t("empty") : t("emptyDone")}</p>
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
            <div id="focus-delete-title" className="font-display text-lg font-semibold">{t("confirmDeleteTitle")}</div>
            <p className="text-base text-ink-soft">{t("confirmDeleteBody", { title: pendingDelete.title })}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setPendingDelete(null)} className="btn-secondary px-5 py-2.5 rounded-full text-base">{t("cancel")}</button>
              <button
                onClick={() => {
                  deleteFocus(pendingDelete.id);
                  setPendingDelete(null);
                }}
                className="bg-error text-white px-5 py-2.5 rounded-full text-base font-semibold"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      <FocusDialog key={dialogKey} open={open} onOpenChange={setOpen} focus={editing} initialTitle={draftTitle} />
    </div>
  );
}
