"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { useBloomStore } from "@/lib/store";
import { formatVND, minutesToReward, pickRandom, uid } from "@/lib/utils";
import type { Category, ChecklistStep, Focus, Priority } from "@/lib/types";

interface DraftStep {
  id: string;
  title: string;
  estimatedMinutes: string;
  /** Carried over for steps that are already done, so editing a task
   *  never changes what was earned. */
  locked?: { reward: number; doneAt: string | null };
}

function newDraftStep(): DraftStep {
  return { id: uid(), title: "", estimatedMinutes: "30" };
}

const MIN_MINUTES = 1;
const MAX_MINUTES = 600;

export function FocusDialog({
  open,
  onOpenChange,
  focus,
  initialTitle,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  focus?: Focus | null;
  initialTitle?: string;
}) {
  const t = useTranslations("board");
  const tCat = useTranslations("categories");
  const tPri = useTranslations("priorities");
  const addFocus = useBloomStore((s) => s.addFocus);
  const updateFocus = useBloomStore((s) => s.updateFocus);
  const showToast = useBloomStore((s) => s.showToast);
  const hourlyValue = useBloomStore((s) => s.hourlyValue.hourlyValue);
  const encourageNew = t.raw("encourageNew") as string[];

  const [title, setTitle] = React.useState(focus?.title ?? initialTitle ?? "");
  const [purpose, setPurpose] = React.useState(focus?.purpose ?? "");
  const [category, setCategory] = React.useState<Category>(focus?.category ?? "create");
  const [priority, setPriority] = React.useState<Priority>(focus?.priority ?? "medium");
  const [startDate, setStartDate] = React.useState(focus?.startDate ?? "");
  const [deadline, setDeadline] = React.useState(focus?.deadline ?? "");
  const [stakeholders, setStakeholders] = React.useState(focus?.stakeholders ?? "");
  const [expectedOutput, setExpectedOutput] = React.useState(focus?.expectedOutput ?? "");
  const [notes, setNotes] = React.useState(focus?.notes ?? "");
  const [steps, setSteps] = React.useState<DraftStep[]>(
    () =>
      focus?.checklist.map((c) => ({
        id: c.id,
        title: c.title,
        estimatedMinutes: String(c.estimatedMinutes),
        locked: c.done ? { reward: c.reward, doneAt: c.doneAt ?? null } : undefined,
      })) ?? [newDraftStep()]
  );
  const [errors, setErrors] = React.useState<{ title?: boolean; dates?: boolean; steps?: Record<string, boolean> }>({});
  const [showMore, setShowMore] = React.useState(
    Boolean(focus && (focus.purpose || focus.startDate || focus.deadline || focus.stakeholders || focus.expectedOutput || focus.notes))
  );

  function reset() {
    setTitle("");
    setPurpose("");
    setCategory("create");
    setPriority("medium");
    setStartDate("");
    setDeadline("");
    setStakeholders("");
    setExpectedOutput("");
    setNotes("");
    setSteps([newDraftStep()]);
    setErrors({});
  }

  function updateStep(id: string, patch: Partial<DraftStep>) {
    setSteps((s) => s.map((st) => (st.id === id ? { ...st, ...patch } : st)));
  }

  function removeStep(id: string) {
    setSteps((s) => {
      const rest = s.filter((st) => st.id !== id);
      return rest.length ? rest : [newDraftStep()];
    });
  }

  function rewardFor(minutes: number) {
    return category === "consume" ? 0 : minutesToReward(minutes, hourlyValue);
  }

  function submit() {
    const nextErrors: typeof errors = {};
    if (!title.trim()) nextErrors.title = true;
    if (startDate && deadline && deadline < startDate) nextErrors.dates = true;

    const kept = steps.filter((s) => s.title.trim() || s.locked);
    const stepErrors: Record<string, boolean> = {};
    for (const s of kept) {
      const m = Number(s.estimatedMinutes);
      if (!s.locked && !(m >= MIN_MINUTES && m <= MAX_MINUTES)) stepErrors[s.id] = true;
    }
    if (Object.keys(stepErrors).length) nextErrors.steps = stepErrors;
    if (nextErrors.dates) setShowMore(true);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    // A task with no named steps becomes a single step, so it can still be
    // ticked off and still earns its time.
    const source = kept.length
      ? kept
      : [{ ...newDraftStep(), title: title.trim(), estimatedMinutes: Number(steps[0]?.estimatedMinutes) >= 1 ? steps[0].estimatedMinutes : "30" }];

    const checklist: ChecklistStep[] = source.map((s) => {
      const minutes = Math.round(Number(s.estimatedMinutes));
      return {
        id: s.id,
        title: s.title.trim(),
        estimatedMinutes: minutes,
        reward: s.locked ? s.locked.reward : rewardFor(minutes),
        done: Boolean(s.locked),
        doneAt: s.locked?.doneAt ?? null,
      };
    });

    const payload = {
      title: title.trim(),
      purpose: purpose.trim(),
      category,
      priority,
      startDate: startDate || null,
      deadline: deadline || null,
      estimatedDuration: "",
      stakeholders: stakeholders.trim(),
      expectedOutput: expectedOutput.trim(),
      notes: notes.trim(),
      checklist,
    };

    if (focus) {
      updateFocus(focus.id, payload);
    } else {
      addFocus(payload);
      showToast(pickRandom(encourageNew));
      reset();
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-xl font-display font-semibold mb-5">
          {focus ? t("editFocus") : t("newFocus")}
        </DialogTitle>
        <div className="space-y-4">
          <div>
            <Label htmlFor="focus-title">{t("titleField")}</Label>
            <Input
              id="focus-title"
              autoFocus
              value={title}
              placeholder={t("titlePlaceholder")}
              aria-invalid={errors.title || undefined}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((er) => ({ ...er, title: false }));
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className={errors.title ? "border-error" : undefined}
            />
            {errors.title && <p className="text-sm text-error mt-1">{t("titleRequired")}</p>}
          </div>

          <div>
            <Label htmlFor="focus-category">{t("category")}</Label>
            <Select id="focus-category" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {(["create", "grow", "enjoy", "consume"] as Category[]).map((k) => (
                <option key={k} value={k}>
                  {tCat(`${k}.label`)} · {tCat(`${k}.desc`)}
                </option>
              ))}
            </Select>
            {category === "consume" && <p className="text-sm text-ink-soft mt-1">{t("consumeHint")}</p>}
          </div>

          <div>
            <Label>{t("steps")}</Label>
            <p className="text-sm text-ink-soft mb-2">{t("stepsHint", { amount: formatVND(hourlyValue) })}</p>
            <div className="space-y-2">
              {steps.map((s, i) => {
                const minutes = Number(s.estimatedMinutes) || 0;
                const invalid = errors.steps?.[s.id];
                return (
                  <div key={s.id}>
                    <div className="flex gap-2 items-center">
                      <Input
                        aria-label={`${t("stepField")} ${i + 1}`}
                        placeholder={t("stepField")}
                        value={s.title}
                        onChange={(e) => updateStep(s.id, { title: e.target.value })}
                        className="flex-1 min-w-0"
                      />
                      <Input
                        type="number"
                        min={MIN_MINUTES}
                        max={MAX_MINUTES}
                        inputMode="numeric"
                        aria-label={t("minutes")}
                        aria-invalid={invalid || undefined}
                        value={s.estimatedMinutes}
                        disabled={Boolean(s.locked)}
                        onChange={(e) => {
                          updateStep(s.id, { estimatedMinutes: e.target.value });
                          if (invalid) setErrors((er) => ({ ...er, steps: { ...er.steps, [s.id]: false } }));
                        }}
                        className={`w-20 ${invalid ? "border-error" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeStep(s.id)}
                        aria-label={t("removeStep")}
                        className="grid place-items-center w-9 h-9 rounded-lg text-ink-muted hover:text-error hover:bg-blush transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className={`text-[13px] mt-1 px-1 ${invalid ? "text-error" : "text-ink-soft"}`}>
                      {invalid
                        ? t("minutesError", { min: MIN_MINUTES, max: MAX_MINUTES })
                        : `${minutes} ${t("minutes")} · ${s.locked ? `${t("doneStep")} · ${formatVND(s.locked.reward)}` : rewardFor(minutes) ? formatVND(rewardFor(minutes)) : t("noReward")}`}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setSteps((s) => [...s, newDraftStep()])}
              className="text-sm font-medium text-rose-deep mt-2 flex items-center gap-1 min-h-8"
            >
              <Plus size={13} /> {t("addStep")}
            </button>
            {steps.length === 1 && !steps[0].title.trim() && !steps[0].locked && (
              <p className="text-sm text-ink-soft mt-1">{t("singleStepHint")}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            aria-expanded={showMore}
            className="text-sm font-medium text-rose-deep min-h-8"
          >
            {showMore ? t("lessDetails") : t("moreDetails")}
          </button>

          {showMore && (
            <div className="space-y-4 pt-1">
              <div>
                <Label htmlFor="focus-purpose">{t("purposeHint")}</Label>
                <Input id="focus-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="focus-priority">{t("priority")}</Label>
                <Select id="focus-priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                  <option value="high">{tPri("high")}</option>
                  <option value="medium">{tPri("medium")}</option>
                  <option value="low">{tPri("low")}</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="focus-start">{t("startDate")}</Label>
                  <Input id="focus-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="focus-deadline">{t("deadline")}</Label>
                  <Input
                    id="focus-deadline"
                    type="date"
                    value={deadline}
                    aria-invalid={errors.dates || undefined}
                    onChange={(e) => {
                      setDeadline(e.target.value);
                      if (errors.dates) setErrors((er) => ({ ...er, dates: false }));
                    }}
                  />
                </div>
              </div>
              {errors.dates && <p className="text-sm text-error -mt-2">{t("dateError")}</p>}
              <div>
                <Label htmlFor="focus-output">{t("expectedOutput")}</Label>
                <Input id="focus-output" value={expectedOutput} onChange={(e) => setExpectedOutput(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="focus-people">{t("stakeholders")}</Label>
                <Input id="focus-people" value={stakeholders} onChange={(e) => setStakeholders(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="focus-notes">{t("notes")}</Label>
                <Textarea id="focus-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => onOpenChange(false)} className="btn-secondary px-4 py-2.5 rounded-full text-base font-medium">
            {t("cancel")}
          </button>
          <button onClick={submit} className="btn-primary px-5 py-2.5 rounded-full text-base font-medium">
            {focus ? t("save") : t("create")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
