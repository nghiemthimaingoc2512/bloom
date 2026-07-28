"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { useBloomStore } from "@/lib/store";
import { pickRandom, uid } from "@/lib/utils";
import type { Category, Priority } from "@/lib/types";

interface DraftStep {
  id: string;
  title: string;
  estimatedMinutes: number;
}

export function NewFocusDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const t = useTranslations("board");
  const tCat = useTranslations("categories");
  const tPri = useTranslations("priorities");
  const addFocus = useBloomStore((s) => s.addFocus);
  const showToast = useBloomStore((s) => s.showToast);
  const encourageNew = t.raw("encourageNew") as string[];

  const [title, setTitle] = React.useState("");
  const [purpose, setPurpose] = React.useState("");
  const [category, setCategory] = React.useState<Category>("create");
  const [priority, setPriority] = React.useState<Priority>("medium");
  const [startDate, setStartDate] = React.useState("");
  const [deadline, setDeadline] = React.useState("");
  const [estimatedDuration, setEstimatedDuration] = React.useState("");
  const [stakeholders, setStakeholders] = React.useState("");
  const [expectedOutput, setExpectedOutput] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [steps, setSteps] = React.useState<DraftStep[]>([{ id: uid(), title: "", estimatedMinutes: 30 }]);

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
    setSteps([{ id: uid(), title: "", estimatedMinutes: 30 }]);
  }

  function updateStep(id: string, patch: Partial<DraftStep>) {
    setSteps((s) => s.map((st) => (st.id === id ? { ...st, ...patch } : st)));
  }

  function removeStep(id: string) {
    setSteps((s) => s.filter((st) => st.id !== id));
  }

  function submit() {
    if (!title.trim()) return;
    addFocus({
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
      checklist: steps
        .filter((s) => s.title.trim())
        .map((s) => ({ id: s.id, title: s.title, estimatedMinutes: s.estimatedMinutes, done: false })),
    });
    showToast(pickRandom(encourageNew));
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="font-medium mb-4">{t("newFocus")}</DialogTitle>
        <div className="space-y-3">
          <div>
            <Label>{t("title")}</Label>
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
            <div className="space-y-2">
              {steps.map((s) => (
                <div key={s.id} className="flex gap-2 items-center">
                  <Input
                    placeholder={t("title")}
                    value={s.title}
                    onChange={(e) => updateStep(s.id, { title: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={s.estimatedMinutes}
                    onChange={(e) => updateStep(s.id, { estimatedMinutes: Number(e.target.value) })}
                    className="w-20"
                  />
                  <button onClick={() => removeStep(s.id)} aria-label={t("cancel")}>
                    <Trash2 size={15} className="text-stone-300 hover:text-rose" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSteps((s) => [...s, { id: uid(), title: "", estimatedMinutes: 30 }])}
              className="text-xs text-rose mt-2 flex items-center gap-1"
            >
              <Plus size={13} /> {t("addStep")}
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-full text-sm text-ink-soft">
            {t("cancel")}
          </button>
          <button onClick={submit} className="px-5 py-2 rounded-full bg-rose text-white text-sm hover:bg-rose-deep transition">
            {t("create")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
