"use client";

import { Flower2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

export function Nav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: t("home") },
    { href: "/board", label: t("board") },
    { href: "/analytics", label: t("analytics") },
    { href: "/store", label: t("store") },
    { href: "/memory", label: t("memory") },
  ];

  return (
    <header className="max-w-5xl mx-auto px-5 pt-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center gap-2">
          <Flower2 className="text-rose" size={26} />
          <div>
            <div className="font-display text-xl tracking-tight leading-none">Bloom</div>
            <div className="text-[11px] text-ink-soft">Grow beautifully.</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
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
                "px-4 py-2 rounded-full text-sm whitespace-nowrap transition border",
                active
                  ? "bg-rose text-white border-rose shadow-sm shadow-rose/30"
                  : "glass text-ink-soft hover:text-rose-deep"
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
