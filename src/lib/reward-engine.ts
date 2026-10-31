import type { BloomState, Category, DayRecord, Focus, Redemption } from "./types";
import { emptyCategoryMinutes } from "./utils";

/**
 * Bloom's reward engine. Bloom Balance and the analytics that depend on it
 * are never stored or incremented directly - they are always recomputed
 * from the current state of `focuses`, `history`, and `redemptions`. This
 * means completing, undoing, editing, or deleting a task (or redeeming a
 * reward) is immediately reflected everywhere, with no possibility of
 * drift or double-counting, and no special-casing needed on refresh.
 *
 * Bloom Balance = completed task rewards
 *               + bonus ledger (perfect-day / streak / achievement / challenge deltas)
 *               - redemptions
 *
 * Future bonus or penalty sources (streak day tracking, achievements,
 * challenges, community rewards) plug in by appending dated entries to the
 * bonus ledger (`history[].balanceDelta`) - never by mutating a running
 * total - keeping this formula correct without another refactor.
 */

/** Minutes logged across all completed checklist steps, across all tasks. */
export function completedMinutesTotal(focuses: Focus[]): number {
  return focuses.reduce(
    (sum, f) => sum + f.checklist.filter((c) => c.done).reduce((a, c) => a + c.estimatedMinutes, 0),
    0
  );
}

/** Bloom Balance earned from completed checklist steps. */
export function taskRewardTotal(focuses: Focus[]): number {
  return focuses.reduce((sum, f) => sum + f.checklist.reduce((a, c) => a + (c.done ? c.reward : 0), 0), 0);
}

/** Sum of the bonus/penalty ledger (one entry per day; append-only). */
export function bonusLedgerTotal(history: DayRecord[]): number {
  return history.reduce((sum, day) => sum + day.balanceDelta, 0);
}

/** Bloom Balance already spent in the Reward Store. */
export function redemptionTotal(redemptions: Redemption[]): number {
  return redemptions.reduce((sum, r) => sum + r.cost, 0);
}

/** The single source of truth for Bloom Balance. */
export function computeBalance(state: Pick<BloomState, "focuses" | "history" | "redemptions">): number {
  return taskRewardTotal(state.focuses) + bonusLedgerTotal(state.history) - redemptionTotal(state.redemptions);
}

/** Minutes of completed focus time per category, derived fresh from the
 *  current checklist state rather than accumulated incrementally. */
export function categoryMinutesTotal(focuses: Focus[]): Record<Category, number> {
  const totals = emptyCategoryMinutes();
  for (const f of focuses) {
    for (const c of f.checklist) {
      if (c.done) totals[f.category] += c.estimatedMinutes;
    }
  }
  return totals;
}

export interface CompletionStats {
  total: number;
  completed: number;
  ratio: number;
}

export function completionStats(focuses: Focus[]): CompletionStats {
  const total = focuses.length;
  const completed = focuses.filter((f) => f.checklist.every((c) => c.done)).length;
  const ratio = total ? completed / total : 0;
  return { total, completed, ratio };
}

/** Steps ticked on a given local day. */
export function stepsDoneOnDay(focuses: Focus[], day: string): number {
  return focuses.reduce((n, f) => n + f.checklist.filter((c) => c.done && c.doneAt === day).length, 0);
}

/** Focus minutes logged on a given local day, including minutes archived
 *  from tasks that were deleted afterwards. */
export function minutesOnDay(state: Pick<BloomState, "focuses" | "history">, day: string): number {
  const fromSteps = state.focuses.reduce(
    (sum, f) => sum + f.checklist.filter((c) => c.done && c.doneAt === day).reduce((a, c) => a + c.estimatedMinutes, 0),
    0
  );
  const archived = state.history
    .filter((h) => h.kind === "archived" && h.date === day)
    .reduce((a, h) => a + h.focusMinutes, 0);
  return fromSteps + archived;
}

/** The tasks that belong to "today": anything still open, plus anything
 *  finished today. Older finished tasks no longer count against the day. */
export function todaysFocuses(focuses: Focus[], day: string): Focus[] {
  return focuses.filter((f) => f.checklist.some((c) => !c.done) || f.checklist.some((c) => c.doneAt === day));
}

/** Everything ever earned (never reduced by redemptions or penalties). */
export function lifetimeEarnedTotal(state: Pick<BloomState, "focuses" | "history">): number {
  return taskRewardTotal(state.focuses) + state.history.reduce((sum, h) => sum + Math.max(0, h.balanceDelta), 0);
}

/** Every focused minute ever logged, including archived tasks. */
export function lifetimeMinutesTotal(state: Pick<BloomState, "focuses" | "history">): number {
  return (
    completedMinutesTotal(state.focuses) +
    state.history.filter((h) => h.kind === "archived").reduce((sum, h) => sum + h.focusMinutes, 0)
  );
}

/** Everything earned on a given local day, from steps and ledger bonuses. */
export function earnedOnDay(state: Pick<BloomState, "focuses" | "history">, day: string): number {
  const fromSteps = state.focuses.reduce(
    (sum, f) => sum + f.checklist.filter((c) => c.done && c.doneAt === day).reduce((a, c) => a + c.reward, 0),
    0
  );
  return fromSteps + state.history.filter((h) => h.date === day && h.balanceDelta > 0).reduce((a, h) => a + h.balanceDelta, 0);
}
