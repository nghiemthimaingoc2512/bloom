import { create } from "zustand";
import type {
  BloomState,
  Category,
  Focus,
  FlowerKind,
  GardenFlower,
  Reward,
} from "./types";
import { bloomRepository } from "./storage";
import { emptyCategoryMinutes, minutesToReward, todayKey, uid } from "./utils";

function defaultState(): BloomState {
  return {
    balance: 0,
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    focuses: [],
    rewards: [],
    garden: [],
    memory: [],
    history: [],
    reflectedToday: false,
    categoryMinutes: emptyCategoryMinutes(),
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
  addReward: (reward: Omit<Reward, "id" | "createdAt">) => void;
  updateReward: (id: string, patch: Partial<Omit<Reward, "id" | "createdAt">>) => void;
  deleteReward: (id: string) => void;
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

  addReward: (reward) => {
    const newReward: Reward = { ...reward, id: uid(), createdAt: new Date().toISOString() };
    set((s) => {
      const next = { ...s, rewards: [...s.rewards, newReward] };
      persist(next);
      return next;
    });
  },

  updateReward: (id, patch) => {
    set((s) => {
      const next = { ...s, rewards: s.rewards.map((r) => (r.id === id ? { ...r, ...patch } : r)) };
      persist(next);
      return next;
    });
  },

  deleteReward: (id) => {
    set((s) => {
      const next = { ...s, rewards: s.rewards.filter((r) => r.id !== id) };
      persist(next);
      return next;
    });
  },

  clearLastReward: () => set({ lastReward: null }),
}));
