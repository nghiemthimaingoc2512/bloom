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
export type RewardIcon =
  | "coffee"
  | "movie"
  | "travel"
  | "book"
  | "spa"
  | "dinner"
  | "music"
  | "shopping"
  | "heart"
  | "gift";

export interface ChecklistStep {
  id: string;
  title: string;
  estimatedMinutes: number;
  reward: number;
  done: boolean;
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
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  icon: RewardIcon;
  createdAt: string;
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

export interface DayRecord {
  date: string; // YYYY-MM-DD
  focusMinutes: number;
  balanceDelta: number;
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
  rewards: Reward[];
  redemptions: Redemption[];
  garden: GardenFlower[];
  memory: MemoryEntry[];
  savedQuotes: SavedQuote[];
  history: DayRecord[];
  reflectedToday: boolean;
}
