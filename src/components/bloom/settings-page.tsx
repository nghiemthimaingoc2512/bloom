"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Languages, Moon, Sun } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useBloomStore } from "@/lib/store";
import { useTheme, PALETTES, type Palette } from "@/components/theme-provider";
import { computeHourlyValue } from "@/lib/hourly-value";
import { formatVND } from "@/lib/utils";
import { Input, Label } from "@/components/ui/field";
import type { GrowthArea, HourlyValueMode } from "@/lib/types";

const GROWTH_AREAS: GrowthArea[] = [
  "career",
  "study",
  "business",
  "fitness",
  "language",
  "creativity",
  "personalGrowth",
];

const PALETTE_SWATCH: Record<Palette, { emoji: string; from: string; to: string }> = {
  pink: { emoji: "🌸", from: "#ff7fb5", to: "#f54f93" },
  sage: { emoji: "🌿", from: "#83a888", to: "#5f8567" },
  lavender: { emoji: "💜", from: "#a996d9", to: "#8b7bc2" },
  midnight: { emoji: "🌙", from: "#7c8ade", to: "#5d6fc4" },
  pearl: { emoji: "🤍", from: "#bba98a", to: "#a08b6f" },
};

export function SettingsPage() {
  const t = useTranslations("settings");
  const tOnboarding = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const displayName = useBloomStore((s) => s.displayName);
  const growthAreas = useBloomStore((s) => s.growthAreas);
  const hourlyValue = useBloomStore((s) => s.hourlyValue);
  const updateProfile = useBloomStore((s) => s.updateProfile);
  const setHourlyValue = useBloomStore((s) => s.setHourlyValue);
  const showToast = useBloomStore((s) => s.showToast);
  const { resolvedTheme, setTheme, palette, setPalette } = useTheme();

  const [name, setName] = React.useState(displayName);
  const [mode, setMode] = React.useState<HourlyValueMode>(hourlyValue.mode);
  const [directValue, setDirectValue] = React.useState(String(hourlyValue.hourlyValue));
  const [monthlySalary, setMonthlySalary] = React.useState(String(hourlyValue.monthlySalary ?? ""));
  const [workingDays, setWorkingDays] = React.useState(String(hourlyValue.workingDaysPerMonth ?? 22));
  const [workingHours, setWorkingHours] = React.useState(String(hourlyValue.workingHoursPerDay ?? 8));

  const previewHourlyValue = computeHourlyValue({
    mode,
    hourlyValue: Number(directValue) || 0,
    monthlySalary: Number(monthlySalary) || 0,
    workingDaysPerMonth: Number(workingDays) || 0,
    workingHoursPerDay: Number(workingHours) || 0,
  });

  function saveProfile() {
    updateProfile({ displayName: name.trim() });
    showToast(t("saved"));
  }

  function saveHourlyValue() {
    setHourlyValue({
      mode,
      hourlyValue: previewHourlyValue,
      monthlySalary: mode === "salary" ? Number(monthlySalary) || 0 : hourlyValue.monthlySalary,
      workingDaysPerMonth: mode === "salary" ? Number(workingDays) || 0 : hourlyValue.workingDaysPerMonth,
      workingHoursPerDay: mode === "salary" ? Number(workingHours) || 0 : hourlyValue.workingHoursPerDay,
    });
    showToast(t("saved"));
  }

  function toggleGrowthArea(area: GrowthArea) {
    const next = growthAreas.includes(area) ? growthAreas.filter((a) => a !== area) : [...growthAreas, area];
    updateProfile({ growthAreas: next });
  }

  function toggleLanguage() {
    router.replace(pathname, { locale: locale === "en" ? "vi" : "en" });
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xl font-display font-medium">{t("title")}</div>
        <div className="text-sm text-ink-soft mt-0.5">{t("subtitle")}</div>
      </div>

      <section className="rounded-2xl glass p-6 space-y-3">
        <div className="font-medium text-sm">{t("profileSection")}</div>
        <div>
          <Label>{t("displayName")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button onClick={saveProfile} className="btn-primary px-5 py-2 rounded-full text-sm font-medium">
          {t("save")}
        </button>
      </section>

      <section className="rounded-2xl glass p-6 space-y-4">
        <div>
          <div className="font-medium text-sm">{t("hourlyValueSection")}</div>
          <div className="text-xs text-ink-soft mt-0.5">{t("hourlyValueHint")}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("direct")}
            className={`flex-1 py-2 rounded-full text-xs font-medium border transition-all ${
              mode === "direct" ? "gradient-primary text-white border-transparent shadow-sm" : "border-petal/60 text-ink-soft"
            }`}
          >
            {t("modeDirect")}
          </button>
          <button
            onClick={() => setMode("salary")}
            className={`flex-1 py-2 rounded-full text-xs font-medium border transition-all ${
              mode === "salary" ? "gradient-primary text-white border-transparent shadow-sm" : "border-petal/60 text-ink-soft"
            }`}
          >
            {t("modeSalary")}
          </button>
        </div>

        {mode === "direct" ? (
          <div>
            <Label>{t("computedHourlyValue")}</Label>
            <Input type="number" value={directValue} onChange={(e) => setDirectValue(e.target.value)} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>{t("monthlySalary")}</Label>
              <Input type="number" value={monthlySalary} onChange={(e) => setMonthlySalary(e.target.value)} />
            </div>
            <div>
              <Label>{t("workingDaysPerMonth")}</Label>
              <Input type="number" value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} />
            </div>
            <div>
              <Label>{t("workingHoursPerDay")}</Label>
              <Input type="number" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} />
            </div>
          </div>
        )}

        <div className="text-sm text-ink-soft">
          {t("computedHourlyValue")}: <span className="font-mono font-medium text-ink">{formatVND(previewHourlyValue)}</span>
        </div>

        <button onClick={saveHourlyValue} className="btn-primary px-5 py-2 rounded-full text-sm font-medium">
          {t("save")}
        </button>
      </section>

      <section className="rounded-2xl glass p-6 space-y-3">
        <div className="font-medium text-sm">{t("growthAreasSection")}</div>
        <div className="flex flex-wrap gap-2">
          {GROWTH_AREAS.map((area) => {
            const active = growthAreas.includes(area);
            return (
              <button
                key={area}
                onClick={() => toggleGrowthArea(area)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  active
                    ? "gradient-primary text-white border-transparent shadow-sm"
                    : "border-petal/60 hover:border-rose text-ink-soft"
                }`}
              >
                {active && <Check size={11} />}
                {tOnboarding(`growthAreas.${area}`)}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl glass p-6 space-y-4">
        <div className="font-medium text-sm">{t("appearanceSection")}</div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {PALETTES.map((p) => {
            const swatch = PALETTE_SWATCH[p];
            const active = palette === p;
            return (
              <button
                key={p}
                onClick={() => setPalette(p)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all text-left ${
                  active ? "border-rose bg-blush/40 shadow-sm" : "border-petal/60 hover:border-rose"
                }`}
              >
                <span
                  className="w-6 h-6 rounded-full shrink-0"
                  style={{ background: `linear-gradient(135deg, ${swatch.from}, ${swatch.to})` }}
                />
                <span className="text-xs font-medium flex-1">
                  {swatch.emoji} {tOnboarding(`themes.${p}`)}
                </span>
                {active && <Check size={14} className="text-rose-deep" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-petal/40">
          <span className="text-sm text-ink-soft">{t("theme")}</span>
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="btn-secondary flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium"
          >
            {resolvedTheme === "dark" ? <Moon size={13} /> : <Sun size={13} />}
            {resolvedTheme === "dark" ? t("dark") : t("light")}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-soft">{t("language")}</span>
          <button
            onClick={toggleLanguage}
            className="btn-secondary flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium"
          >
            <Languages size={13} /> {locale === "en" ? "EN" : "VI"}
          </button>
        </div>
      </section>
    </div>
  );
}
