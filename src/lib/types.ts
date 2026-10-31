export type Category = "create" | "grow" | "enjoy" | "consume";
export type Priority = "high" | "medium" | "low";
export type FlowerStage = "bloom" | "wilt" | "fade";
export type FlowerKind = "tulip" | "sakura";
export type HourlyValueMode = "direct" | "salary";
export type GrowthArea = "career" | "study" | "business" | "fitness" | "language" | "creativity" | "personalGrowth";

export interface HourlyValueSettings {
  mode: HourlyValueMode;
  /** The resolved hourly value in VND, always present and always what
   *  reward calculations use - `monthlySalary`/`workingDaysPerMonth`/
   *  `workingHoursPerDay` are only kept so the salary form can be
   *  re-opened pre-filled; they don't feed calculations directly. */
  hourlyValue: number;
  monthlySalary?: number;
  workingDaysPerMonth?: number;
  workingHoursPerDay?: number;
}
export interface ChecklistStep {
  id: string;
  title: string;
  estimatedMinutes: number;
  reward: number;
  done: boolean;
  /** Local day (YYYY-MM-DD) the step was ticked; null while open. */
  doneAt?: string | null;
}

export interface Focus {
  id: string;
  title: string;
  purpose: string;
  startDate: string | null;
  deadline: string | null;
  estimatedDuration: string;
  priority: Priority;
  stakeholders: string;
  category: Category;
  expectedOutput: string;
  notes: string;
  checklist: ChecklistStep[];
  createdAt: string;
  /** Set once the overdue penalty has been charged, so it is never charged twice. */
  latePenaltyAt?: string | null;
}

export interface Redemption {
  id: string;
  rewardId: string;
  rewardName: string;
  cost: number;
  redeemedAt: string;
}

export interface GardenFlower {
  id: string;
  kind: FlowerKind;
  stage: FlowerStage;
  plantedAt: string;
}

export interface MemoryEntry {
  id: string;
  date: string;
  quote: string;
  mood: string;
  completedTasks: number;
  bloomLevel: FlowerStage;
  liked: boolean;
  favorited: boolean;
}

export interface SavedQuote {
  id: string;
  text: string;
  savedAt: string;
}

export interface FeedbackEntry {
  id: string;
  rating: number;
  liked: string;
  confusing: string;
  featureRequest: string;
  bug: string;
  email: string;
  submittedAt: string;
}

export type LedgerKind = "reflection" | "streak" | "streakLost" | "late" | "archived";

export interface DayRecord {
  date: string; // YYYY-MM-DD
  focusMinutes: number;
  balanceDelta: number;
  /** Why the balance moved; absent on records from before the ledger had kinds. */
  kind?: LedgerKind;
  label?: string;
  categoryMinutes: Record<Category, number>;
  completionRatio: number;
}

export interface BloomState {
  displayName: string;
  joinedAt: string | null;
  onboardingCompleted: boolean;
  growthAreas: GrowthArea[];
  hourlyValue: HourlyValueSettings;
  lifetimeBalanceEarned: number;
  lifetimeFocusMinutes: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  focuses: Focus[];
  redemptions: Redemption[];
  garden: GardenFlower[];
  memory: MemoryEntry[];
  savedQuotes: SavedQuote[];
  history: DayRecord[];
  /** Kept for old saves; the live flag is reflectedOn === todayKey(). */
  reflectedToday: boolean;
  reflectedOn: string | null;
  /** Day the app last ran its day-change checks (streak loss, overdue tasks). */
  lastRolloverDate: string | null;
  feedback: FeedbackEntry[];
  betaBannerDismissed: boolean;
  /** False only for a brand-new person who has not finished or skipped the walkthrough. */
  tutorialDone: boolean;
}
