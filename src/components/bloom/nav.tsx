"use client";

import { Flower2, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useBloomStore } from "@/lib/store";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

export function Nav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const displayName = useBloomStore((s) => s.displayName);

  const tabs = [
    { href: "/", label: t("home") },
    { href: "/board", label: t("board") },
    { href: "/analytics", label: t("analytics") },
    { href: "/store", label: t("store") },
    { href: "/memory", label: t("memory") },
  ];

  const initial = displayName.trim().charAt(0).toUpperCase() || "🌸";

  return (
    <header className="max-w-5xl mx-auto px-5 pt-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid place-items-center w-10 h-10 rounded-2xl gradient-primary text-white shadow-lg shadow-rose/25">
            <Flower2 size={20} />
          </span>
          <div>
            <div className="font-display text-xl font-medium tracking-tight leading-none">Bloom</div>
            <div className="text-[11px] text-ink-soft mt-0.5">Grow beautifully</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Link
            href="/settings"
            aria-label={t("settings")}
            className="grid place-items-center w-9 h-9 rounded-full text-ink-soft hover:text-rose-deep hover:bg-blush/60 transition-all"
          >
            <Settings size={16} />
          </Link>
          <Link
            href="/profile"
            aria-label={t("profile")}
            className="grid place-items-center w-9 h-9 rounded-full gradient-primary text-white text-xs font-semibold shadow-sm shadow-rose/20"
          >
            {initial}
          </Link>
        </div>
      </div>

      <nav className="flex gap-1 mb-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                active
                  ? "gradient-primary text-white shadow-md shadow-rose/25"
                  : "text-ink-soft hover:text-rose-deep hover:bg-blush/60"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
