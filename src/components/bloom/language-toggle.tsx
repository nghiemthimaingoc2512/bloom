"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function toggle() {
    const next = locale === "en" ? "vi" : "en";
    router.replace(pathname, { locale: next });
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full glass text-ink-soft hover:text-rose-deep transition"
      aria-label="Toggle language"
    >
      <Languages size={13} /> {locale === "en" ? "EN" : "VI"}
    </button>
  );
}
