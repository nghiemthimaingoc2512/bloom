import { create } from "zustand";
import type {
  BloomState,
  Category,
  DayRecord,
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
import {
  completedMinutesTotal,
  computeBalance,
  lifetimeEarnedTotal,
  lifetimeMinutesTotal,
  minutesOnDay,
  stepsDoneOnDay,
  todaysFocuses,
} from "./reward-engine";
import { defaultHourlyValueSettings } from "./hourly-value";
import { daysBetween, emptyCategoryMinutes, minutesToReward, todayKey, uid } from "./utils";

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
    reflectedOn: null,
    lastRolloverDate: null,
    feedback: [],
    betaBannerDismissed: false,
  };
}

/** Backfills checklist steps saved before `reward` / `doneAt` existed on
 *  them, so loading old persisted data can never produce a NaN balance. */
function normalizeFocus(focus: Focus, hourlyValue: number): Focus {
  return {
    ...focus,
    checklist: focus.checklist.map((c) => ({
      ...c,
      reward: typeof c.reward === "number" ? c.reward : minutesToReward(c.estimatedMinutes, hourlyValue),
      doneAt: c.doneAt ?? null,
    })),
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

/** The lifetime counters are a plain function of the ledger, so they can
 *  never drift from the balance no matter how a step is toggled. */
function withLifetime<T extends BloomState>(state: T): T {
  return {
    ...state,
    lifetimeBalanceEarned: lifetimeEarnedTotal(state),
    lifetimeFocusMinutes: lifetimeMinutesTotal(state),
  };
}

function ledgerEntry(partial: Pick<DayRecord, "balanceDelta" | "kind"> & Partial<DayRecord>): DayRecord {
  return {
    date: todayKey(),
    focusMinutes: 0,
    categoryMinutes: emptyCategoryMinutes(),
    completionRatio: 0,
    ...partial,
  };
}

/** A penalty never takes the balance below zero. */
function cappedPenalty(state: BloomState, amount: number): number {
  return Math.min(Math.round(amount), Math.max(0, computeBalance(state)));
}

export interface RolloverEvent {
  kind: "quiet" | "late";
  amount: number;
  label?: string;
}

/** Day-change bookkeeping: a lost streak and overdue tasks are charged once,
 *  the first time the app opens on a new day. */
function rollover(state: BloomState): { state: BloomState; events: RolloverEvent[] } {
  const today = todayKey();
  if (state.lastRolloverDate === today || !state.onboardingCompleted) {
    return { state: { ...state, lastRolloverDate: state.lastRolloverDate ?? today }, events: [] };
  }
  const hourly = state.hourlyValue.hourlyValue;
  const events: RolloverEvent[] = [];
  let next: BloomState = { ...state, lastRolloverDate: today };

  const gap = state.lastActiveDate ? daysBetween(state.lastActiveDate, today) : 0;
  if (gap >= 2) {
    let lost = 0;
    if (state.streak > 0) {
      lost = cappedPenalty(next, hourly / 2);
      next = {
        ...next,
        streak: 0,
        history: lost > 0 ? [ledgerEntry({ kind: "streakLost", balanceDelta: -lost }), ...next.history] : next.history,
      };
    }
    // Two flowers wilt for each quiet stretch; a long one lets wilted flowers fade.
    let toWilt = 2;
    const garden = [...next.garden];
    for (let i = garden.length - 1; i >= 0 && toWilt > 0; i--) {
      if (garden[i].stage === "bloom") {
        garden[i] = { ...garden[i], stage: "wilt" };
        toWilt--;
      }
    }
    next = {
      ...next,
      garden: gap >= 5 ? garden.map((f) => (f.stage === "wilt" ? { ...f, stage: "fade" } : f)) : garden,
    };
    events.push({ kind: "quiet", amount: lost });
  }

  for (const focus of next.focuses) {
    const open = focus.checklist.some((c) => !c.done);
    if (!focus.deadline || !open || focus.latePenaltyAt || daysBetween(focus.deadline, today) <= 3) continue;
    const amount = cappedPenalty(next, hourly * 3);
    next = {
      ...next,
      focuses: next.focuses.map((f) => (f.id === focus.id ? { ...f, latePenaltyAt: today } : f)),
      history:
        amount > 0
          ? [ledgerEntry({ kind: "late", balanceDelta: -amount, label: focus.title }), ...next.history]
          : next.history,
    };
    events.push({ kind: "late", amount, label: focus.title });
  }

  return { state: withLifetime(next), events };
}

export interface RewardEvent {
  amount: number;
  category: Category;
  /** True when this tick completed the whole task. */
  finishedTask: boolean;
  /** Set when a step was un-ticked instead; `amount` is what was taken back. */
  undone?: boolean;
}

export interface OnboardingPayload {
  displayName: string;
  hourlyValue: HourlyValueSettings;
  growthAreas: GrowthArea[];
}

interface StreakSnapshot {
  date: string;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

interface BloomStore extends BloomState {
  hydrated: boolean;
  lastReward: RewardEvent | null;
  toast: string | null;
  rolloverEvents: RolloverEvent[];
  /** What streak looked like before today's first step, so un-ticking the
   *  only step of the day gives the day back cleanly. Persisted. */
  streakSnapshot?: StreakSnapshot | null;
  hydrate: () => Promise<void>;
  completeOnboarding: (payload: OnboardingPayload) => void;
  updateProfile: (patch: Partial<Pick<BloomState, "displayName" | "growthAreas">>) => void;
  setHourlyValue: (settings: HourlyValueSettings) => void;
  addFocus: (focus: Omit<Focus, "id" | "createdAt">) => void;
  updateFocus: (id: string, patch: Partial<Omit<Focus, "id" | "createdAt">>) => void;
  deleteFocus: (id: string) => void;
  toggleStep: (focusId: string, stepId: string) => void;
  submitReflection: (quote: string, mood: string) => { perfect: boolean; planted: number; bonus: number };
  redeem: (reward: Pick<Reward, "id" | "name" | "cost">) => boolean;
  addReward: (reward: Omit<Reward, "id" | "createdAt">) => void;
  updateReward: (id: string, patch: Partial<Omit<Reward, "id" | "createdAt">>) => void;
  deleteReward: (id: string) => void;
  toggleSavedQuote: (text: string) => void;
  toggleMemoryLiked: (id: string) => void;
  toggleMemoryFavorited: (id: string) => void;
  clearLastReward: () => void;
  clearRolloverEvents: () => void;
  showToast: (message: string) => void;
  submitFeedback: (entry: Omit<FeedbackEntry, "id" | "submittedAt">) => void;
  dismissBetaBanner: () => void;
  resetAll: () => Promise<void>;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
/** Only durable state is written; UI-only fields (toast, last reward,
 *  day-change notices, hydrated) would otherwise come back on reload. */
const TRANSIENT_KEYS = ["toast", "lastReward", "rolloverEvents", "hydrated"] as const;
function persist(state: BloomState) {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  const durable = { ...state } as Record<string, unknown>;
  for (const key of TRANSIENT_KEYS) delete durable[key];
  saveTimer = setTimeout(() => {
    void bloomRepository.save(durable as unknown as BloomState);
  }, 250);
}

export const useBloomStore = create<BloomStore>((set, get) => ({
  ...defaultState(),
  hydrated: false,
  lastReward: null,
  toast: null,
  rolloverEvents: [],
  streakSnapshot: null,

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
    // default for it instead of `undefined`.
    const savedClean = { ...(saved ?? {}) } as Record<string, unknown>;
    for (const key of TRANSIENT_KEYS) delete savedClean[key];
    const merged = { ...defaultState(), ...savedClean } as BloomState & { streakSnapshot?: StreakSnapshot | null };
    const hourlyValue = merged.hourlyValue.hourlyValue;
    const normalized: BloomState = {
      ...merged,
      focuses: merged.focuses.map((f) => normalizeFocus(f, hourlyValue)),
      memory: merged.memory.map(normalizeMemoryEntry),
      reflectedOn: merged.reflectedOn ?? (merged.reflectedToday ? merged.lastActiveDate : null),
    };
    const { state, events } = rollover(withLifetime(normalized));
    const today = todayKey();
    const next = { ...state, reflectedToday: state.reflectedOn === today };
    persist(next);
    set({ ...next, streakSnapshot: merged.streakSnapshot ?? null, rolloverEvents: events, hydrated: true });
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
        lastRolloverDate: todayKey(),
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
      // Only steps that are still open follow the new rate; what was
      // already earned stays exactly as it was.
      const focuses = s.focuses.map((f) => ({
        ...f,
        checklist: f.checklist.map((c) =>
          c.done ? c : { ...c, reward: f.category === "consume" ? 0 : minutesToReward(c.estimatedMinutes, settings.hourlyValue) }
        ),
      }));
      const next = { ...s, hourlyValue: settings, focuses };
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
      const next = withLifetime({ ...s, focuses });
      persist(next);
      return next;
    });
  },

  deleteFocus: (id) => {
    set((s) => {
      const focus = s.focuses.find((f) => f.id === id);
      if (!focus) return s;
      // What the task already earned stays in the balance as an archived
      // ledger line, so deleting finished work never costs anything.
      const earned = focus.checklist.reduce((a, c) => a + (c.done ? c.reward : 0), 0);
      const minutes = focus.checklist.reduce((a, c) => a + (c.done ? c.estimatedMinutes : 0), 0);
      const history =
        earned > 0 || minutes > 0
          ? [ledgerEntry({ kind: "archived", balanceDelta: earned, focusMinutes: minutes, label: focus.title }), ...s.history]
          : s.history;
      const next = withLifetime({ ...s, focuses: s.focuses.filter((f) => f.id !== id), history });
      persist(next);
      return next;
    });
  },

  toggleStep: (focusId, stepId) => {
    set((s) => {
      const today = todayKey();
      const hourly = s.hourlyValue.hourlyValue;
      let reward: RewardEvent | null = null;
      const focuses = s.focuses.map((f) => {
        if (f.id !== focusId) return f;
        const checklist = f.checklist.map((c) => {
          if (c.id !== stepId) return c;
          if (c.done) {
            reward = { amount: c.reward, category: f.category, finishedTask: false, undone: true };
            return { ...c, done: false, doneAt: null };
          }
          const amount = f.category === "consume" ? 0 : c.reward;
          reward = { amount, category: f.category, finishedTask: false };
          return { ...c, done: true, doneAt: today, reward: amount };
        });
        if (reward && !reward.undone) reward.finishedTask = checklist.every((c) => c.done);
        return { ...f, checklist };
      });
      if (!reward) return s;
      const event = reward as RewardEvent;

      let { streak, longestStreak, lastActiveDate, history, garden } = s;
      let streakSnapshot = s.streakSnapshot ?? null;

      if (!event.undone) {
        if (lastActiveDate !== today) {
          streakSnapshot = { date: today, streak, longestStreak, lastActiveDate };
          streak = lastActiveDate && daysBetween(lastActiveDate, today) === 1 ? streak + 1 : 1;
          longestStreak = Math.max(longestStreak, streak);
          lastActiveDate = today;
          if (streak >= 2) {
            history = [ledgerEntry({ kind: "streak", balanceDelta: Math.round(hourly), label: String(streak) }), ...history];
          }
        }
        // A finished step revives the first flower that is not blooming.
        const idx = garden.findIndex((f) => f.stage !== "bloom");
        if (idx !== -1) {
          garden = [...garden];
          garden[idx] = { ...garden[idx], stage: "bloom" };
        }
      } else if (stepsDoneOnDay(focuses, today) === 0 && streakSnapshot?.date === today) {
        // The only step of the day was taken back: give the day back too.
        streak = streakSnapshot.streak;
        longestStreak = streakSnapshot.longestStreak;
        lastActiveDate = streakSnapshot.lastActiveDate;
        history = history.filter((h) => !(h.kind === "streak" && h.date === today));
        streakSnapshot = null;
      }

      const next = withLifetime({
        ...s,
        focuses,
        garden,
        streak,
        longestStreak,
        lastActiveDate,
        history,
        streakSnapshot,
        lastReward: event,
      });
      persist(next);
      return next;
    });
  },

  submitReflection: (quote, mood) => {
    const s = get();
    const today = todayKey();
    if (s.reflectedOn === today || minutesOnDay(s, today) === 0) {
      return { perfect: false, planted: 0, bonus: 0 };
    }
    const todays = todaysFocuses(s.focuses, today);
    const total = todays.length;
    const completed = todays.filter((f) => f.checklist.every((c) => c.done)).length;
    const ratio = total ? completed / total : 0;
    const perfect = total > 0 && ratio >= 1;
    const planted = perfect ? 5 : ratio >= 2 / 3 ? 3 : 1;
    const bonus = perfect ? Math.round(s.hourlyValue.hourlyValue) : 0;

    const kinds: FlowerKind[] = ["tulip", "sakura"];
    const freshFlowers: GardenFlower[] = Array.from({ length: planted }).map((_, i) => ({
      id: uid(),
      stage: "bloom",
      kind: kinds[i % 2],
      plantedAt: today,
    }));

    set((state) => {
      const memory = [
        {
          id: uid(),
          date: today,
          quote: quote.trim(),
          mood,
          completedTasks: completed,
          bloomLevel: (perfect ? "bloom" : "wilt") as "bloom" | "wilt",
          liked: false,
          favorited: false,
        },
        ...state.memory,
      ];
      const history = [
        ledgerEntry({
          kind: "reflection",
          balanceDelta: bonus,
          focusMinutes: completedMinutesTotal(todaysFocuses(state.focuses, today)),
          completionRatio: ratio,
        }),
        ...state.history,
      ];
      const next = withLifetime({
        ...state,
        memory,
        history,
        garden: [...state.garden, ...freshFlowers],
        reflectedToday: true,
        reflectedOn: today,
      });
      persist(next);
      return next;
    });

    return { perfect, planted, bonus };
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
  clearRolloverEvents: () => set({ rolloverEvents: [] }),

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

  resetAll: async () => {
    if (saveTimer) clearTimeout(saveTimer);
    await bloomRepository.clear();
    set({ ...defaultState(), hydrated: true, lastReward: null, toast: null, rolloverEvents: [], streakSnapshot: null });
  },
}));

/** Bloom Balance, derived fresh from the store on every read - see
 *  reward-engine.ts for the formula. */
export function useBloomBalance(): number {
  return useBloomStore(computeBalance);
}
