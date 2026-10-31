"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { BloomLogo } from "./logo";
import { useBloomStore } from "@/lib/store";
import { useTheme, PALETTES, PALETTE_META } from "@/components/theme-provider";
import { HOURLY_VALUE_PRESETS } from "@/lib/hourly-value";
import { formatVND } from "@/lib/utils";
import type { GrowthArea } from "@/lib/types";

const GROWTH_AREAS: GrowthArea[] = [
  "career",
  "study",
  "business",
  "fitness",
  "language",
  "creativity",
  "personalGrowth",
];

export function Onboarding() {
  const t = useTranslations("onboarding");
  const completeOnboarding = useBloomStore((s) => s.completeOnboarding);
  const { palette, setPalette } = useTheme();

  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState("");
  const [preset, setPreset] = React.useState(HOURLY_VALUE_PRESETS[2]);
  const [customValue, setCustomValue] = React.useState("");
  const [useCustom, setUseCustom] = React.useState(false);
  const [growthAreas, setGrowthAreas] = React.useState<GrowthArea[]>([]);

  const resolvedHourlyValue = useCustom ? Number(customValue) || 0 : preset;
  const canContinue =
    step === 1 ? name.trim().length > 0 : step === 2 ? resolvedHourlyValue >= 1000 : true;

  function toggleGrowthArea(area: GrowthArea) {
    setGrowthAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  }

  function finish() {
    completeOnboarding({
      displayName: name.trim(),
      hourlyValue: { mode: "direct", hourlyValue: resolvedHourlyValue || HOURLY_VALUE_PRESETS[2] },
      growthAreas,
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-1.5 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <span
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? "w-8 bg-rose" : s < step ? "w-4 bg-rose/50" : "w-4 bg-petal"
              }`}
            />
          ))}
        </div>

        <div className="rounded-[32px] glass p-7 md:p-9">
          {step === 1 && (
            <div className="text-center space-y-5">
              <BloomLogo size={64} className="mx-auto drop-shadow-md" />
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight leading-tight">{t("welcomeTitle")}</h1>
                <p className="text-base text-ink-soft mt-3">{t("intro")}</p>
                <p className="text-base font-semibold mt-5">{t("step1Question")}</p>
              </div>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                className="w-full h-12 text-center rounded-2xl px-4 text-base font-medium outline-none border-2 border-petal bg-blush/40 focus:border-rose transition"
                onKeyDown={(e) => e.key === "Enter" && canContinue && setStep(2)}
              />
            </div>
          )}

          {step === 2 && (
            <div className="text-center space-y-5">
              <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">{t("step2Question")}</h1>
              <div className="grid grid-cols-2 gap-2">
                {HOURLY_VALUE_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPreset(p);
                      setUseCustom(false);
                    }}
                    className={`py-3 rounded-2xl text-base font-bold font-mono border transition-all ${
                      !useCustom && preset === p
                        ? "gradient-primary text-white shadow-md shadow-rose/25 border-transparent"
                        : "border-petal hover:border-rose text-ink"
                    }`}
                  >
                    {formatVND(p)}
                  </button>
                ))}
                <button
                  onClick={() => setUseCustom(true)}
                  className={`py-3 rounded-2xl text-base font-bold border transition-all ${
                    useCustom
                      ? "gradient-primary text-white shadow-md shadow-rose/25 border-transparent"
                      : "border-petal hover:border-rose text-ink"
                  }`}
                >
                  {t("customValue")}
                </button>
              </div>
              {useCustom && (
                <input
                  autoFocus
                  type="number"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder={t("customValuePlaceholder")}
                  min={1000}
                  step={1000}
                  inputMode="numeric"
                  className="w-full h-12 text-center rounded-2xl px-4 text-base font-medium outline-none border-2 border-petal bg-blush/40 focus:border-rose transition"
                />
              )}
              {useCustom && customValue !== "" && !(Number(customValue) >= 1000) && (
                <p className="text-sm text-error">{t("customValueError")}</p>
              )}
              <p className="text-sm text-ink-soft">{t("step2Hint")}</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-center">{t("step3Question")}</h1>
              <p className="text-sm text-ink-soft text-center -mt-3">{t("step3Hint")}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {GROWTH_AREAS.map((area) => {
                  const active = growthAreas.includes(area);
                  return (
                    <button
                      key={area}
                      onClick={() => toggleGrowthArea(area)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all flex items-center gap-1.5 ${
                        active
                          ? "gradient-primary text-white shadow-md shadow-rose/25 border-transparent"
                          : "border-petal hover:border-rose text-ink"
                      }`}
                    >
                      {active && <Check size={13} />}
                      {t(`growthAreas.${area}`)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-center">{t("step4Title")}</h1>
              <p className="text-sm text-ink-soft text-center -mt-3">{t("step4Hint")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PALETTES.map((p) => {
                  const swatch = PALETTE_META[p];
                  const active = palette === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPalette(p)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                        active ? "border-rose bg-blush" : "border-petal hover:border-rose"
                      }`}
                    >
                      <span
                        className="w-8 h-8 rounded-full shrink-0 shadow-md"
                        style={{ background: `linear-gradient(135deg, ${swatch.from}, ${swatch.to})` }}
                      />
                      <span className="text-base font-semibold flex-1">{t(`themes.${p}`)}</span>
                      {active && <Check size={16} className="text-rose-deep animate-[checkmark-pop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 mt-8">
            {step > 1 ? (
              <button onClick={() => setStep((s) => s - 1)} className="btn-secondary px-5 py-2.5 rounded-full text-base">
                {t("back")}
              </button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <button
                disabled={!canContinue}
                onClick={() => setStep((s) => s + 1)}
                className={`${step === 3 && growthAreas.length === 0 ? "btn-secondary" : "btn-primary"} px-7 py-2.5 rounded-full text-base ml-auto`}
              >
                {step === 3 && growthAreas.length === 0 ? t("skip") : t("continue")}
              </button>
            ) : (
              <button onClick={finish} className="btn-primary px-7 py-2.5 rounded-full text-base ml-auto">
                {t("getStarted")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
