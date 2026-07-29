import type { BloomState, Category } from "./types";
import { categoryMinutesTotal } from "./reward-engine";
import { evaluateAchievements, RARITY_ORDER, type AchievementState } from "./achievements";

export interface WrappedStats {
  year: number;
  totalFocusHours: number;
  balanceCreated: number;
  flowersBloomed: number;
  longestStreak: number;
  favoriteCategory: Category | null;
  bestMonth: string | null;
  achievementsUnlocked: number;
  topAchievementId: string | null;
}

type WrappedState = AchievementState & Pick<BloomState, "history">;

export function computeWrapped(state: WrappedState): WrappedStats {
  const monthTotals = new Map<string, number>();
  for (const day of state.history) {
    const month = day.date.slice(0, 7);
    monthTotals.set(month, (monthTotals.get(month) ?? 0) + day.focusMinutes);
  }
  let bestMonth: string | null = null;
  let bestMonthMinutes = 0;
  for (const [month, minutes] of monthTotals) {
    if (minutes > bestMonthMinutes) {
      bestMonth = month;
      bestMonthMinutes = minutes;
    }
  }

  const categoryMinutes = categoryMinutesTotal(state.focuses);
  const categoryEntries = Object.entries(categoryMinutes) as [Category, number][];
  const favoriteCategory = categoryEntries.reduce<[Category, number] | null>(
    (best, entry) => (!best || entry[1] > best[1] ? entry : best),
    null
  );

  const unlocked = evaluateAchievements(state).filter((a) => a.unlocked);
  const topAchievement = unlocked.reduce<(typeof unlocked)[number] | null>(
    (best, a) => (!best || RARITY_ORDER.indexOf(a.rarity) > RARITY_ORDER.indexOf(best.rarity) ? a : best),
    null
  );

  return {
    year: new Date().getFullYear(),
    totalFocusHours: state.lifetimeFocusMinutes / 60,
    balanceCreated: state.lifetimeBalanceEarned,
    flowersBloomed: state.garden.length,
    longestStreak: state.longestStreak,
    favoriteCategory: favoriteCategory && favoriteCategory[1] > 0 ? favoriteCategory[0] : null,
    bestMonth,
    achievementsUnlocked: unlocked.length,
    topAchievementId: topAchievement?.id ?? null,
  };
}
