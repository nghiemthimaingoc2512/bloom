/**
 * A minimal Level/XP foundation for the Profile page. XP is lifetime focus
 * minutes - Bloom's core value is focused work, so leveling up should
 * track that directly rather than money earned or tasks checked off.
 *
 * This is intentionally simple for now; Phase 4 (Badges & Achievements)
 * builds its unlock conditions on top of this same `computeLevel` output
 * rather than replacing it, so leveling up already means something by the
 * time badges arrive.
 */

export interface LevelProgress {
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  totalXp: number;
}

/** XP (focus minutes) required to clear a given level - a gentle ramp so
 *  early levels come quickly and later ones take sustained effort. */
export function xpRequiredForLevel(level: number): number {
  return level * 150;
}

export function computeLevel(totalFocusMinutes: number): LevelProgress {
  let level = 1;
  let remaining = Math.max(0, Math.round(totalFocusMinutes));
  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level);
    level += 1;
  }
  return {
    level,
    currentLevelXp: remaining,
    xpForNextLevel: xpRequiredForLevel(level),
    totalXp: totalFocusMinutes,
  };
}

export type LevelTitleKey = "sprout" | "sapling" | "bloom" | "gardenKeeper" | "gardenMaster";

/** A small Duolingo-style flourish - returns a translation key, not display
 *  text, so callers resolve it through next-intl for both locales. */
export function levelTitleKey(level: number): LevelTitleKey {
  if (level < 5) return "sprout";
  if (level < 10) return "sapling";
  if (level < 20) return "bloom";
  if (level < 35) return "gardenKeeper";
  return "gardenMaster";
}
