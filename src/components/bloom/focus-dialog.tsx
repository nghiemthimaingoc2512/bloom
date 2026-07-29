"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { useBloomStore } from "@/lib/store";
import { minutesToReward, pickRandom, uid } from "@/lib/utils";
import type { Category, ChecklistStep, Focus, Priority } from "@/lib/types";

interface DraftStep {
  id: string;
  title: string;
  estimatedMinutes: number;
  reward: number;
}

function newDraftStep(): DraftStep {
  const estimatedMinutes = 30;
  return { id: uid(), title: "", estimatedMinutes, reward: minutesToReward(estimatedMinutes) };
}

export function FocusDialog({
  open,
  onOpenChange,
  focus,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  focus?: Focus | null;
}) {
  const t = useTranslations("board");
  const tCat = useTranslations("categories");
  const tPri = useTranslations("priorities");
  const addFocus = useBloomStore((s) => s.addFocus);
  const updateFocus = useBloomStore((s) => s.updateFocus);
  const showToast = useBloomStore((s) => s.showToast);
  const encourageNew = t.raw("encourageNew") as string[];

  const [title, setTitle] = React.useState(focus?.title ?? "");
  const [purpose, setPurpose] = React.useState(focus?.purpose ?? "");
  const [category, setCategory] = React.useState<Category>(focus?.category ?? "create");
  const [priority, setPriority] = React.useState<Priority>(focus?.priority ?? "medium");
  const [startDate, setStartDate] = React.useState(focus?.startDate ?? "");
  const [deadline, setDeadline] = React.useState(focus?.deadline ?? "");
  const [estimatedDuration, setEstimatedDuration] = React.useState(focus?.estimatedDuration ?? "");
  const [stakeholders, setStakeholders] = React.useState(focus?.stakeholders ?? "");
  const [expectedOutput, setExpectedOutput] = React.useState(focus?.expectedOutput ?? "");
  const [notes, setNotes] = React.useState(focus?.notes ?? "");
  const [steps, setSteps] = React.useState<DraftStep[]>(
    () =>
      focus?.checklist.map((c) => ({
        id: c.id,
        title: c.title,
        estimatedMinutes: c.estimatedMinutes,
        reward: c.reward,
      })) ?? [newDraftStep()]
  );

  function reset() {
    setTitle("");
    setPurpose("");
    setCategory("create");
    setPriority("medium");
    setStartDate("");
    setDeadline("");
    setEstimatedDuration("");
    setStakeholders("");
    setExpectedOutput("");
    setNotes("");
    setSteps([newDraftStep()]);
  }

  function updateStep(id: string, patch: Partial<DraftStep>) {
    setSteps((s) => s.map((st) => (st.id === id ? { ...st, ...patch } : st)));
  }

  function removeStep(id: string) {
    setSteps((s) => s.filter((st) => st.id !== id));
  }

  function submit() {
    if (!title.trim()) return;

    // Editing a task must preserve each step's completion state unless the
    // user explicitly changes it elsewhere (the checklist buttons on the
    // card) - this form never exposes a "done" toggle, so matching by id
    // against the task's current checklist is how that's guaranteed. Steps
    // that are new (no matching id) start incomplete, same as on create.
    const originalDoneById = new Map((focus?.checklist ?? []).map((c) => [c.id, c.done]));
    const checklist: ChecklistStep[] = steps
      .filter((s) => s.title.trim())
      .map((s) => ({
        id: s.id,
        title: s.title,
        estimatedMinutes: s.estimatedMinutes,
        reward: s.reward,
        done: originalDoneById.get(s.id) ?? false,
      }));

    const payload = {
      title,
      purpose,
      category,
      priority,
      startDate: startDate || null,
      deadline: deadline || null,
      estimatedDuration,
      stakeholders,
      expectedOutput,
      notes,
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
        <DialogTitle className="text-lg font-display font-medium mb-5">
          {focus ? t("editFocus") : t("newFocus")}
        </DialogTitle>
        <div className="space-y-4">
          <div>
            <Label>{t("titleField")}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>{t("purpose")} · {t("purposeHint")}</Label>
            <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("category")}</Label>
              <Select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {(["create", "grow", "enjoy", "consume"] as Category[]).map((k) => (
                  <option key={k} value={k}>
                    {tCat(`${k}.label`)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>{t("priority")}</Label>
              <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option value="high">{tPri("high")}</option>
                <option value="medium">{tPri("medium")}</option>
                <option value="low">{tPri("low")}</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("startDate")}</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>{t("deadline")}</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("estimatedDuration")}</Label>
              <Input placeholder="e.g. 2h" value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} />
            </div>
            <div>
              <Label>{t("stakeholders")}</Label>
              <Input value={stakeholders} onChange={(e) => setStakeholders(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>{t("expectedOutput")}</Label>
            <Input value={expectedOutput} onChange={(e) => setExpectedOutput(e.target.value)} />
          </div>
          <div>
            <Label>{t("notes")}</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div>
            <Label>{t("steps")}</Label>
            <div className="flex gap-2 items-center text-[10px] uppercase tracking-wide text-ink-soft px-1 mb-1">
              <span className="flex-1">{t("titleField")}</span>
              <span className="w-16 text-center">{t("minutes")}</span>
              <span className="w-24 text-center">{t("reward")}</span>
              <span className="w-[15px]" />
            </div>
            <div className="space-y-2">
              {steps.map((s) => (
                <div key={s.id} className="flex gap-2 items-center">
                  <Input
                    placeholder={t("titleField")}
                    value={s.title}
                    onChange={(e) => updateStep(s.id, { title: e.target.value })}
                    className="flex-1 min-w-0"
                  />
                  <Input
                    type="number"
                    value={s.estimatedMinutes}
                    onChange={(e) => updateStep(s.id, { estimatedMinutes: Number(e.target.value) })}
                    className="w-16"
                    title={t("estimatedDuration")}
                  />
                  <Input
                    type="number"
                    value={s.reward}
                    onChange={(e) => updateStep(s.id, { reward: Number(e.target.value) })}
                    className="w-24"
                    title={t("reward")}
                  />
                  <button onClick={() => removeStep(s.id)} aria-label={t("cancel")}>
                    <Trash2 size={15} className="text-stone-300 hover:text-rose" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSteps((s) => [...s, newDraftStep()])}
              className="text-xs text-rose mt-2 flex items-center gap-1"
            >
              <Plus size={13} /> {t("addStep")}
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => onOpenChange(false)} className="btn-secondary px-4 py-2.5 rounded-full text-sm font-medium">
            {t("cancel")}
          </button>
          <button onClick={submit} className="btn-primary px-5 py-2.5 rounded-full text-sm font-medium">
            {focus ? t("save") : t("create")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
