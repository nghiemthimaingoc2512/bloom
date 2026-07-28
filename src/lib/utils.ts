import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Category } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const REWARD_PER_HOUR = 120_000;

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatVND(amount: number): string {
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString("en-US")}₫`;
}

export function minutesToReward(minutes: number): number {
  return (minutes / 60) * REWARD_PER_HOUR;
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export const CATEGORIES: Category[] = ["create", "grow", "enjoy", "consume"];

export function emptyCategoryMinutes(): Record<Category, number> {
  return { create: 0, grow: 0, enjoy: 0, consume: 0 };
}
