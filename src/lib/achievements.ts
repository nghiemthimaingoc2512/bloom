import type { BloomState } from "./types";

export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface Achievement {
  id: string;
  emoji: string;
  rarity: Rarity;
  isUnlocked: (state: AchievementState) => boolean;
}

export type AchievementState = Pick<
  BloomState,
  "focuses" | "garden" | "memory" | "redemptions" | "savedQuotes" | "streak" | "longestStreak" | "lifetimeFocusMinutes" | "lifetimeBalanceEarned"
>;

export const RARITY_ORDER: Rarity[] = ["common", "rare", "epic", "legendary"];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "firstFocus", emoji: "🎯", rarity: "common", isUnlocked: (s) => s.focuses.length >= 1 },
  { id: "firstFlower", emoji: "🌸", rarity: "common", isUnlocked: (s) => s.garden.length >= 1 },
  { id: "firstReflection", emoji: "🌱", rarity: "common", isUnlocked: (s) => s.memory.length >= 1 },
  { id: "quoteCollector", emoji: "❤️", rarity: "common", isUnlocked: (s) => s.savedQuotes.length >= 5 },
  { id: "streak7", emoji: "🔥", rarity: "rare", isUnlocked: (s) => s.longestStreak >= 7 },
  { id: "hours10", emoji: "⏱️", rarity: "rare", isUnlocked: (s) => s.lifetimeFocusMinutes >= 600 },
  { id: "flowers10", emoji: "🌷", rarity: "rare", isUnlocked: (s) => s.garden.length >= 10 },
  { id: "memoryKeeper", emoji: "⭐", rarity: "rare", isUnlocked: (s) => s.memory.filter((m) => m.favorited).length >= 3 },
  { id: "balance1m", emoji: "💰", rarity: "rare", isUnlocked: (s) => s.lifetimeBalanceEarned >= 1_000_000 },
  { id: "streak30", emoji: "🔥", rarity: "epic", isUnlocked: (s) => s.longestStreak >= 30 },
  { id: "hours100", emoji: "🏔️", rarity: "epic", isUnlocked: (s) => s.lifetimeFocusMinutes >= 6_000 },
  { id: "balance10m", emoji: "💎", rarity: "legendary", isUnlocked: (s) => s.lifetimeBalanceEarned >= 10_000_000 },
];

export interface EvaluatedAchievement extends Achievement {
  unlocked: boolean;
}

export function evaluateAchievements(state: AchievementState): EvaluatedAchievement[] {
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: a.isUnlocked(state) }));
}
