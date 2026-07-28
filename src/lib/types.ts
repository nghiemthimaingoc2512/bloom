export type Category = "create" | "grow" | "enjoy" | "consume";
export type Priority = "high" | "medium" | "low";
export type FlowerStage = "bloom" | "wilt" | "fade";
export type FlowerKind = "tulip" | "sakura";

export interface ChecklistStep {
  id: string;
  title: string;
  estimatedMinutes: number;
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
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  focusMinutes: number;
  balanceDelta: number;
  categoryMinutes: Record<Category, number>;
  completionRatio: number;
}

export interface BloomState {
  balance: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  focuses: Focus[];
  garden: GardenFlower[];
  memory: MemoryEntry[];
  history: DayRecord[];
  reflectedToday: boolean;
  categoryMinutes: Record<Category, number>;
}
