"use client";

import * as React from "react";

export type Theme = "light" | "dark";
export type Palette = "pink" | "stone" | "sage" | "clay" | "slate" | "lavender";

export const PALETTES: Palette[] = ["pink", "stone", "sage", "clay", "slate", "lavender"];

/** Palettes saved by the earlier, more saturated design map onto their
 *  closest neutral so nobody's stored choice turns into a broken attribute. */
export const LEGACY_PALETTES: Record<string, Palette> = {
  rose: "pink",
  cherryCola: "pink",
  lime: "sage",
  mango: "clay",
  island: "slate",
  indigo: "lavender",
};

/** Single source of truth for each palette's preview swatch, so the
 *  onboarding flow and Settings page render identical swatches instead
 *  of keeping their own copies in sync by hand. */
export const PALETTE_META: Record<Palette, { from: string; to: string }> = {
  pink: { from: "#ff7fb5", to: "#f54f93" },
  stone: { from: "#6f7a86", to: "#38424c" },
  sage: { from: "#4ade80", to: "#15803d" },
  clay: { from: "#a98470", to: "#6d5041" },
  slate: { from: "#6a8a94", to: "#3b545d" },
  lavender: { from: "#c084fc", to: "#7c3aed" },
};

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
  palette: Palette;
  setPalette: (palette: Palette) => void;
}

const MODE_STORAGE_KEY = "theme";
const PALETTE_STORAGE_KEY = "bloom-palette";

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

// Both the light/dark mode and the color palette live on the DOM (a class
// and an attribute on <html>, set synchronously pre-hydration by the
// theme-init script) rather than in React state, so components read them
// through useSyncExternalStore - this keeps server and first-client-paint
// snapshots aligned (via getServerSnapshot) with no hydration mismatch, and
// needs no setState-in-effect to stay in sync after that.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getModeSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getModeServerSnapshot(): Theme {
  return "light";
}

function getPaletteSnapshot(): Palette {
  const attr = document.documentElement.getAttribute("data-theme");
  return (PALETTES as string[]).includes(attr ?? "") ? (attr as Palette) : "pink";
}

function getPaletteServerSnapshot(): Palette {
  return "pink";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(subscribe, getModeSnapshot, getModeServerSnapshot);
  const palette = React.useSyncExternalStore(subscribe, getPaletteSnapshot, getPaletteServerSnapshot);

  const setTheme = React.useCallback((next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      window.localStorage.setItem(MODE_STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable (private browsing, etc). Theme still
      // applies for the current session, it just won't persist.
    }
    listeners.forEach((listener) => listener());
  }, []);

  const setPalette = React.useCallback((next: Palette) => {
    if (next === "pink") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", next);
    }
    try {
      window.localStorage.setItem(PALETTE_STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable (private browsing, etc).
    }
    listeners.forEach((listener) => listener());
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme: theme, setTheme, palette, setPalette }),
    [theme, setTheme, palette, setPalette]
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
