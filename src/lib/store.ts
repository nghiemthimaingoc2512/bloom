import { create } from "zustand";
import type {
  BloomState,
  Category,
  Focus,
  FlowerKind,
  GardenFlower,
} from "./types";
import { bloomRepository } from "./storage";
import { emptyCategoryMinutes, minutesToReward, todayKey, uid } from "./utils";

function seedGarden(): GardenFlower[] {
  const kinds: FlowerKind[] = ["tulip", "sakura"];
  const stages: GardenFlower["stage"][] = [
    "bloom",
    "bloom",
    "bloom",
    "bloom",
    "bloom",
    "wilt",
    "bloom",
    "fade",
  ];
  return stages.map((stage, i) => ({
    id: uid(),
    stage,
    kind: kinds[i % 2],
    plantedAt: todayKey(),
  }));
}

function seedFocuses(): Focus[] {
  const now = new Date().toISOString();
  return [
    {
      id: uid(),
      title: "Ship the Bloom landing page",
      purpose: "Give people a beautiful reason to start growing.",
      startDate: null,
      deadline: null,
      estimatedDuration: "2h",
      priority: "high",
      stakeholders: "",
      category: "create",
      expectedOutput: "A live, polished landing page.",
      notes: "",
      createdAt: now,
      checklist: [
        { id: uid(), title: "Sketch the garden hero", estimatedMinutes: 45, done: true },
        { id: uid(), title: "Build the focus board UI", estimatedMinutes: 60, done: true },
        { id: uid(), title: "Polish animations", estimatedMinutes: 30, done: false },
      ],
    },
    {
      id: uid(),
      title: "Morning run + stretch",
      purpose: "A body that moves is a mind that grows.",
      startDate: null,
      deadline: null,
      estimatedDuration: "45m",
      priority: "medium",
      stakeholders: "",
      category: "grow",
      expectedOutput: "Feeling clear-headed and awake.",
      notes: "",
      createdAt: now,
      checklist: [
        { id: uid(), title: "5km run", estimatedMinutes: 30, done: true },
        { id: uid(), title: "Stretch routine", estimatedMinutes: 15, done: false },
      ],
    },
    {
      id: uid(),
      title: "Tea with an old friend",
      purpose: "Connection is part of a beautiful life.",
      startDate: null,
      deadline: null,
      estimatedDuration: "1h",
      priority: "low",
      stakeholders: "",
      category: "enjoy",
      expectedOutput: "A warm afternoon, well spent.",
      notes: "",
      createdAt: now,
      checklist: [{ id: uid(), title: "Coffee catch-up", estimatedMinutes: 60, done: false }],
    },
  ];
}

function defaultState(): BloomState {
  return {
    balance: 480_000,
    streak: 6,
    longestStreak: 11,
    lastActiveDate: todayKey(),
    focuses: seedFocuses(),
    garden: seedGarden(),
    memory: [
      { id: uid(), date: "Jul 21", quote: "Small, steady, and kind to myself.", mood: "🌤️", completedTasks: 2, bloomLevel: "bloom" },
      { id: uid(), date: "Jul 24", quote: "Every step counted today, even the tiny ones.", mood: "🌸", completedTasks: 3, bloomLevel: "bloom" },
    ],
    history: [],
    reflectedToday: false,
    categoryMinutes: { create: 75, grow: 30, enjoy: 0, consume: 20 },
  };
}

export interface RewardEvent {
  amount: number;
  category: Category;
}

interface BloomStore extends BloomState {
  hydrated: boolean;
  lastReward: RewardEvent | null;
  toast: string | null;
  hydrate: () => Promise<void>;
  addFocus: (focus: Omit<Focus, "id" | "createdAt">) => void;
  toggleStep: (focusId: string, stepId: string) => void;
  submitReflection: (quote: string, mood: string) => { perfect: boolean };
  redeem: (cost: number) => boolean;
  clearLastReward: () => void;
  showToast: (message: string) => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function persist(state: BloomState) {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void bloomRepository.save(state);
  }, 250);
}

export const useBloomStore = create<BloomStore>((set, get) => ({
  ...defaultState(),
  hydrated: false,
  lastReward: null,
  toast: null,

  showToast: (message) => {
    set({ toast: message });
    setTimeout(() => {
      if (get().toast === message) set({ toast: null });
    }, 3200);
  },

  hydrate: async () => {
    const saved = await bloomRepository.load();
    set({ ...(saved ?? defaultState()), hydrated: true });
  },

  addFocus: (focus) => {
    const newFocus: Focus = { ...focus, id: uid(), createdAt: new Date().toISOString() };
    set((s) => {
      const next = { ...s, focuses: [...s.focuses, newFocus] };
      persist(next);
      return next;
    });
  },

  toggleStep: (focusId, stepId) => {
    set((s) => {
      let reward: RewardEvent | null = null;
      let completedMinutes = 0;
      const focuses = s.focuses.map((f) => {
        if (f.id !== focusId) return f;
        const checklist = f.checklist.map((c) => {
          if (c.id !== stepId) return c;
          if (!c.done) {
            reward = { amount: minutesToReward(c.estimatedMinutes), category: f.category };
            completedMinutes = c.estimatedMinutes;
          }
          return { ...c, done: !c.done };
        });
        return { ...f, checklist };
      });

      let balance = s.balance;
      let garden = s.garden;
      let categoryMinutes = s.categoryMinutes;
      if (reward) {
        const r = reward as RewardEvent;
        balance = s.balance + r.amount;
        categoryMinutes = { ...s.categoryMinutes, [r.category]: (s.categoryMinutes[r.category] ?? 0) + completedMinutes };
        const idx = garden.findIndex((f) => f.stage !== "bloom");
        if (idx !== -1) {
          garden = [...garden];
          garden[idx] = { ...garden[idx], stage: "bloom" };
        }
      }

      const next = { ...s, focuses, balance, garden, categoryMinutes, lastReward: reward };
      persist(next);
      return next;
    });
  },

  submitReflection: (quote, mood) => {
    const s = get();
    const total = s.focuses.length;
    const completed = s.focuses.filter((f) => f.checklist.every((c) => c.done)).length;
    const ratio = total ? completed / total : 0;
    const perfect = ratio >= 1;

    const kinds: FlowerKind[] = ["tulip", "sakura"];
    const additions = perfect ? 5 : ratio >= 2 / 3 ? 3 : 0;
    const freshFlowers: GardenFlower[] = Array.from({ length: additions }).map((_, i) => ({
      id: uid(),
      stage: "bloom",
      kind: kinds[i % 2],
      plantedAt: todayKey(),
    }));

    set((state) => {
      const memory = [
        {
          id: uid(),
          date: "Today",
          quote: quote || "A quiet, honest day.",
          mood,
          completedTasks: completed,
          bloomLevel: (perfect ? "bloom" : "wilt") as "bloom" | "wilt",
        },
        ...state.memory,
      ];
      const history = [
        {
          date: todayKey(),
          focusMinutes: state.focuses.reduce(
            (sum, f) => sum + f.checklist.filter((c) => c.done).reduce((a, c) => a + c.estimatedMinutes, 0),
            0
          ),
          balanceDelta: perfect ? 120_000 : 0,
          categoryMinutes: emptyCategoryMinutes(),
          completionRatio: ratio,
        },
        ...state.history,
      ];
      const next = {
        ...state,
        memory,
        history,
        garden: [...state.garden, ...freshFlowers],
        balance: perfect ? state.balance + 120_000 : state.balance,
        reflectedToday: true,
      };
      persist(next);
      return next;
    });

    return { perfect };
  },

  redeem: (cost) => {
    const s = get();
    if (s.balance < cost) return false;
    set((state) => {
      const next = { ...state, balance: state.balance - cost };
      persist(next);
      return next;
    });
    return true;
  },

  clearLastReward: () => set({ lastReward: null }),
}));
