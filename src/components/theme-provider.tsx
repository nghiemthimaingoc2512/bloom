"use client";

import * as React from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "theme";

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

// Theme lives on the DOM (a class on <html>, set synchronously pre-hydration
// by the theme-init script) rather than in React state, so components read
// it through useSyncExternalStore - this keeps server and first-client-paint
// snapshots aligned (via getServerSnapshot) with no hydration mismatch, and
// needs no setState-in-effect to stay in sync after that.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = React.useCallback((next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable (private browsing, etc). Theme still
      // applies for the current session, it just won't persist.
    }
    listeners.forEach((listener) => listener());
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme: theme, setTheme }),
    [theme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
