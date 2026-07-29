import { REWARD_PER_HOUR } from "./utils";
import type { HourlyValueSettings } from "./types";

/** Preset hourly-value choices shown during onboarding, in VND. */
export const HOURLY_VALUE_PRESETS = [30_000, 50_000, 80_000, 120_000, 200_000];

export function defaultHourlyValueSettings(): HourlyValueSettings {
  return { mode: "direct", hourlyValue: REWARD_PER_HOUR };
}

/**
 * Resolves the hourly value (in VND) from either a direct entry or a
 * monthly-salary breakdown. This is the only place that math happens -
 * everywhere else in the app just reads `hourlyValue.hourlyValue`, which is
 * always kept up to date by calling this whenever the settings change.
 */
export function computeHourlyValue(input: {
  mode: "direct" | "salary";
  hourlyValue?: number;
  monthlySalary?: number;
  workingDaysPerMonth?: number;
  workingHoursPerDay?: number;
}): number {
  if (input.mode === "salary") {
    const days = input.workingDaysPerMonth ?? 0;
    const hours = input.workingHoursPerDay ?? 0;
    const salary = input.monthlySalary ?? 0;
    const totalHours = days * hours;
    return totalHours > 0 ? Math.round(salary / totalHours) : 0;
  }
  return Math.max(0, Math.round(input.hourlyValue ?? 0));
}
