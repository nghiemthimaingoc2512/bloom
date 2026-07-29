import { create } from "zustand";
import type {
  BloomState,
  Category,
  FeedbackEntry,
  Focus,
  FlowerKind,
  GardenFlower,
  GrowthArea,
  HourlyValueSettings,
  MemoryEntry,
  Redemption,
  Reward,
} from "./types";
import { bloomRepository } from "./storage";
import { computeBalance } from "./reward-engine";
import { defaultHourlyValueSettings } from "./hourly-value";
import { emptyCategoryMinutes, minutesToReward, todayKey, uid } from "./utils";

function defaultState(): BloomState {
  return {
    displayName: "",
    joinedAt: null,
    onboardingCompleted: false,
    growthAreas: [],
    hourlyValue: defaultHourlyValueSettings(),
    lifetimeBalanceEarned: 0,
    lifetimeFocusMinutes: 0,
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    focuses: [],
    rewards: [],
    redemptions: [],
    garden: [],
    memory: [],
    savedQuotes: [],
    history: [],
    reflectedToday: false,
    feedback: [],
    betaBannerDismissed: false,
  };
}

/** Backfills checklist steps saved before `reward` existed on them, so
 *  loading old persisted data can never produce a NaN Bloom Balance. */
function normalizeFocus(focus: Focus, hourlyValue: number): Focus {
  return {
    ...focus,
    checklist: focus.checklist.map((c) =>
      typeof c.reward === "number" ? c : { ...c, reward: minutesToReward(c.estimatedMinutes, hourlyValue) }
    ),
  };
}

/** Backfills reflections saved before Like/Favorite existed on them. */
function normalizeMemoryEntry(entry: MemoryEntry): MemoryEntry {
  return {
    ...entry,
    liked: entry.liked ?? false,
    favorited: entry.favorited ?? false,
  };
}

export interface RewardEvent {
  amount: number;
  category: Category;
}

export interface OnboardingPayload {
  displayName: string;
  hourlyValue: HourlyValueSettings;
  growthAreas: GrowthArea[];
}

interface BloomStore extends BloomState {
  hydrated: boolean;
  lastReward: RewardEvent | null;
  toast: string | null;
  hydrate: () => Promise<void>;
  completeOnboarding: (payload: OnboardingPayload) => void;
  updateProfile: (patch: Partial<Pick<BloomState, "displayName" | "growthAreas">>) => void;
  setHourlyValue: (settings: HourlyValueSettings) => void;
  addFocus: (focus: Omit<Focus, "id" | "createdAt">) => void;
  updateFocus: (id: string, patch: Partial<Omit<Focus, "id" | "createdAt">>) => void;
  deleteFocus: (id: string) => void;
  toggleStep: (focusId: string, stepId: string) => void;
  submitReflection: (quote: string, mood: string) => { perfect: boolean };
  redeem: (reward: Pick<Reward, "id" | "name" | "cost">) => boolean;
  addReward: (reward: Omit<Reward, "id" | "createdAt">) => void;
  updateReward: (id: string, patch: Partial<Omit<Reward, "id" | "createdAt">>) => void;
  deleteReward: (id: string) => void;
  toggleSavedQuote: (text: string) => void;
  toggleMemoryLiked: (id: string) => void;
  toggleMemoryFavorited: (id: string) => void;
  clearLastReward: () => void;
  showToast: (message: string) => void;
  submitFeedback: (entry: Omit<FeedbackEntry, "id" | "submittedAt">) => void;
  dismissBetaBanner: () => void;
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
    // Merge over defaultState() rather than replacing it outright, so a
    // state blob saved before a new field existed still gets a valid
    // default for it instead of `undefined`, and normalize focuses saved
    // before checklist steps carried their own `reward`.
    const merged = { ...defaultState(), ...(saved ?? {}) };
    const hourlyValue = merged.hourlyValue.hourlyValue;
    set({
      ...merged,
      focuses: merged.focuses.map((f) => normalizeFocus(f, hourlyValue)),
      memory: merged.memory.map(normalizeMemoryEntry),
      hydrated: true,
    });
  },

  completeOnboarding: (payload) => {
    set((s) => {
      const next = {
        ...s,
        displayName: payload.displayName,
        hourlyValue: payload.hourlyValue,
        growthAreas: payload.growthAreas,
        joinedAt: s.joinedAt ?? new Date().toISOString(),
        onboardingCompleted: true,
      };
      persist(next);
      return next;
    });
  },

  updateProfile: (patch) => {
    set((s) => {
      const next = { ...s, ...patch };
      persist(next);
      return next;
    });
  },

  setHourlyValue: (settings) => {
    set((s) => {
      const next = { ...s, hourlyValue: settings };
      persist(next);
      return next;
    });
  },

  addFocus: (focus) => {
    const newFocus: Focus = { ...focus, id: uid(), createdAt: new Date().toISOString() };
    set((s) => {
      const next = { ...s, focuses: [...s.focuses, newFocus] };
      persist(next);
      return next;
    });
  },

  updateFocus: (id, patch) => {
    set((s) => {
      const focuses = s.focuses.map((f) => (f.id === id ? { ...f, ...patch } : f));
      const next = { ...s, focuses };
      persist(next);
      return next;
    });
  },

  deleteFocus: (id) => {
    set((s) => {
      const next = { ...s, focuses: s.focuses.filter((f) => f.id !== id) };
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
            reward = { amount: c.reward, category: f.category };
            completedMinutes = c.estimatedMinutes;
          }
          return { ...c, done: !c.done };
        });
        return { ...f, checklist };
      });

      // Bloom Balance and category minutes are derived from `focuses`
      // (see reward-engine.ts), so toggling a step here never touches
      // them directly - completing, undoing, or re-completing a step
      // always immediately reflects the correct total, with no drift.
      // `lifetimeBalanceEarned`/`lifetimeFocusMinutes` are the exception:
      // they're a permanent, append-only record (for the Profile page and
      // its Level/XP), so they only ever increase here, even though the
      // derived balance can still go back down on undo.
      let garden = s.garden;
      let lifetimeBalanceEarned = s.lifetimeBalanceEarned;
      let lifetimeFocusMinutes = s.lifetimeFocusMinutes;
      if (reward) {
        const r = reward as RewardEvent;
        lifetimeBalanceEarned += r.amount;
        lifetimeFocusMinutes += completedMinutes;
        const idx = garden.findIndex((f) => f.stage !== "bloom");
        if (idx !== -1) {
          garden = [...garden];
          garden[idx] = { ...garden[idx], stage: "bloom" };
        }
      }

      const next = { ...s, focuses, garden, lifetimeBalanceEarned, lifetimeFocusMinutes, lastReward: reward };
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
          liked: false,
          favorited: false,
        },
        ...state.memory,
      ];
      // The perfect-day bonus (and any future streak/achievement/challenge
      // bonus or penalty) is appended to the bonus ledger as a dated entry
      // rather than added to a running balance total - see
      // reward-engine.ts's bonusLedgerTotal().
      const bonus = perfect ? 120_000 : 0;
      const history = [
        {
          date: todayKey(),
          focusMinutes: state.focuses.reduce(
            (sum, f) => sum + f.checklist.filter((c) => c.done).reduce((a, c) => a + c.estimatedMinutes, 0),
            0
          ),
          balanceDelta: bonus,
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
        lifetimeBalanceEarned: state.lifetimeBalanceEarned + bonus,
        reflectedToday: true,
      };
      persist(next);
      return next;
    });

    return { perfect };
  },

  redeem: (reward) => {
    const s = get();
    const balance = computeBalance(s);
    if (balance < reward.cost) return false;
    set((state) => {
      const redemption: Redemption = {
        id: uid(),
        rewardId: reward.id,
        rewardName: reward.name,
        cost: reward.cost,
        redeemedAt: new Date().toISOString(),
      };
      const next = { ...state, redemptions: [...state.redemptions, redemption] };
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

  toggleSavedQuote: (text) => {
    set((s) => {
      const existing = s.savedQuotes.find((q) => q.text === text);
      const savedQuotes = existing
        ? s.savedQuotes.filter((q) => q.text !== text)
        : [...s.savedQuotes, { id: uid(), text, savedAt: new Date().toISOString() }];
      const next = { ...s, savedQuotes };
      persist(next);
      return next;
    });
  },

  toggleMemoryLiked: (id) => {
    set((s) => {
      const next = { ...s, memory: s.memory.map((m) => (m.id === id ? { ...m, liked: !m.liked } : m)) };
      persist(next);
      return next;
    });
  },

  toggleMemoryFavorited: (id) => {
    set((s) => {
      const next = { ...s, memory: s.memory.map((m) => (m.id === id ? { ...m, favorited: !m.favorited } : m)) };
      persist(next);
      return next;
    });
  },

  clearLastReward: () => set({ lastReward: null }),

  submitFeedback: (entry) => {
    const newEntry: FeedbackEntry = { ...entry, id: uid(), submittedAt: new Date().toISOString() };
    set((s) => {
      const next = { ...s, feedback: [...s.feedback, newEntry] };
      persist(next);
      return next;
    });
  },

  dismissBetaBanner: () => {
    set((s) => {
      const next = { ...s, betaBannerDismissed: true };
      persist(next);
      return next;
    });
  },
}));

/** Bloom Balance, derived fresh from the store on every read - see
 *  reward-engine.ts for the formula. */
export function useBloomBalance(): number {
  return useBloomStore(computeBalance);
}
