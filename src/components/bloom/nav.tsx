"use client";

import { BarChart3, BookOpen, Flower2, Info, Settings, Sun, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useBloomBalance, useBloomStore } from "@/lib/store";
import { formatVND } from "@/lib/utils";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

export function Nav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const displayName = useBloomStore((s) => s.displayName);
  const balance = useBloomBalance();

  const tabs = [
    { href: "/", label: t("home"), icon: Sun, tour: "nav-home" },
    { href: "/analytics", label: t("analytics"), icon: BarChart3, tour: "nav-dashboard" },
    { href: "/memory", label: t("memory"), icon: BookOpen, tour: "nav-journal" },
  ];

  const initial = displayName.trim().charAt(0).toUpperCase() || "B";

  return (
    <>
      <header className="max-w-5xl mx-auto px-5 pt-5">
        <div className="flex items-center justify-between gap-2 mb-5">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <span className="grid place-items-center w-11 h-11 rounded-2xl gradient-primary text-white shadow-md shadow-rose/25">
              <Flower2 size={22} />
            </span>
            <div className="hidden sm:block font-display text-2xl font-semibold tracking-tight leading-none">Bloom</div>
          </Link>
          <div className="flex items-center gap-1.5">
            <Link
              href="/analytics"
              data-tour="balance"
              aria-label={`${t("balance")}: ${formatVND(balance)}`}
              title={t("balance")}
              className="flex items-center gap-1.5 h-11 px-4 rounded-full border-2 border-petal bg-surface text-base font-bold font-mono text-rose-deep hover:border-rose transition-colors"
            >
              <Wallet size={17} />
              {formatVND(balance)}
            </Link>
            <div className="hidden sm:flex items-center gap-1.5">
              <LanguageToggle />
              <ThemeToggle />
              <Link
                href="/about"
                aria-label={t("about")}
                className="grid place-items-center w-10 h-10 rounded-full text-ink-soft hover:text-rose-deep hover:bg-blush transition-all"
              >
                <Info size={18} />
              </Link>
            </div>
            <Link
              href="/settings"
              aria-label={t("settings")}
              className="grid place-items-center w-10 h-10 rounded-full text-ink-soft hover:text-rose-deep hover:bg-blush transition-all"
            >
              <Settings size={18} />
            </Link>
            <Link
              href="/profile"
              aria-label={t("profile")}
              className="grid place-items-center w-10 h-10 rounded-full gradient-primary text-white shadow-md shadow-rose/25 text-sm font-bold"
            >
              {initial}
            </Link>
          </div>
        </div>

        <nav aria-label="Bloom" className="hidden md:flex gap-1.5 mb-3">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                data-tour={tab.tour}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-base font-semibold whitespace-nowrap transition-all",
                  active ? "gradient-primary text-white shadow-md shadow-rose/25" : "text-ink-soft hover:text-rose-deep hover:bg-blush/60"
                )}
              >
                <tab.icon size={18} />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* On phones every section stays one tap away in a bottom bar. */}
      <nav
        aria-label="Bloom"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-3 border-t border-petal bg-surface px-1 pt-1 pb-[max(4px,env(safe-area-inset-bottom))]"
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              data-tour={tab.tour}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl py-2 text-[13px] font-semibold leading-tight transition-colors",
                active ? "text-rose-deep bg-blush" : "text-ink-soft"
              )}
            >
              <tab.icon size={22} />
              <span className="truncate max-w-full px-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
