"use client";

import { BarChart3, BookOpen, Flower2, Gift, Info, ListChecks, Settings, Sun } from "lucide-react";
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
    { href: "/", label: t("home"), icon: Sun },
    { href: "/board", label: t("board"), icon: ListChecks },
    { href: "/store", label: t("store"), icon: Gift },
    { href: "/analytics", label: t("analytics"), icon: BarChart3 },
    { href: "/memory", label: t("memory"), icon: BookOpen },
  ];

  const initial = displayName.trim().charAt(0).toUpperCase() || "B";

  return (
    <>
      <header className="max-w-5xl mx-auto px-5 pt-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-2xl bg-rose text-white dark:text-night">
              <Flower2 size={20} />
            </span>
            <div className="hidden sm:block font-display text-xl font-medium tracking-tight leading-none">Bloom</div>
          </Link>
          <div className="flex items-center gap-1.5">
            <Link
              href="/store"
              aria-label={`${t("balance")}: ${formatVND(balance)}`}
              title={t("balance")}
              className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-full border border-petal bg-surface text-xs sm:text-sm font-medium font-mono hover:border-rose transition-colors"
            >
              <Gift size={14} className="text-ink-soft" />
              {formatVND(balance)}
            </Link>
            <LanguageToggle />
            <ThemeToggle />
            <Link
              href="/about"
              aria-label={t("about")}
              className="hidden sm:grid place-items-center w-9 h-9 rounded-full text-ink-soft hover:text-rose-deep hover:bg-blush transition-all"
            >
              <Info size={16} />
            </Link>
            <Link
              href="/settings"
              aria-label={t("settings")}
              className="grid place-items-center w-9 h-9 rounded-full text-ink-soft hover:text-rose-deep hover:bg-blush transition-all"
            >
              <Settings size={16} />
            </Link>
            <Link
              href="/profile"
              aria-label={t("profile")}
              className="grid place-items-center w-9 h-9 rounded-full bg-rose text-white dark:text-night text-xs font-semibold"
            >
              {initial}
            </Link>
          </div>
        </div>

        <nav aria-label="Bloom" className="hidden md:flex gap-1 mb-2">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  active ? "bg-rose text-white dark:text-night" : "text-ink-soft hover:text-ink hover:bg-blush"
                )}
              >
                <tab.icon size={15} />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* On phones every section stays one tap away in a bottom bar, instead
          of a horizontal strip that hides the last two tabs offscreen. */}
      <nav
        aria-label="Bloom"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-5 border-t border-petal bg-surface px-1 pt-1 pb-[max(4px,env(safe-area-inset-bottom))]"
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium leading-tight transition-colors",
                active ? "text-rose-deep bg-blush" : "text-ink-soft"
              )}
            >
              <tab.icon size={18} />
              <span className="truncate max-w-full px-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
