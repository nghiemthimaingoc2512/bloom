"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const t = useTranslations("common");
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="grid place-items-center w-9 h-9 rounded-full text-ink-soft hover:text-rose-deep hover:bg-blush/60 transition-all"
      aria-label={t("toggleTheme")}
    >
      <Sun size={13} className="hidden dark:block" />
      <Moon size={13} className="block dark:hidden" />
    </button>
  );
}
