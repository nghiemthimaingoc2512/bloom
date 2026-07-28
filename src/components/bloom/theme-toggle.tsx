"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full glass text-ink-soft hover:text-rose-deep transition"
      aria-label="Toggle theme"
    >
      <Sun size={13} className="hidden dark:block" />
      <Moon size={13} className="block dark:hidden" />
    </button>
  );
}
