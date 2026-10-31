import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Category } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const REWARD_PER_HOUR = 80_000;

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/** Local calendar day, so a step ticked late in the evening counts for
 *  the day the person actually lived, not the UTC one. */
export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function shiftDay(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return todayKey(new Date(y, m - 1, d + days));
}

/** Whole days from a to b (both YYYY-MM-DD). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/** Formats a YYYY-MM-DD key for display; anything else (e.g. the legacy
 *  literal "Today") is returned unchanged. */
export function formatDayKey(
  key: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return key;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString(locale, options);
}

export function formatVND(amount: number): string {
  const rounded = Math.round(amount) || 0;
  return `${rounded.toLocaleString("en-US")}₫`;
}

export function minutesToReward(minutes: number, hourlyValue: number = REWARD_PER_HOUR): number {
  return Math.round((minutes / 60) * hourlyValue);
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export const CATEGORIES: Category[] = ["create", "grow", "enjoy", "consume"];

export function emptyCategoryMinutes(): Record<Category, number> {
  return { create: 0, grow: 0, enjoy: 0, consume: 0 };
}
