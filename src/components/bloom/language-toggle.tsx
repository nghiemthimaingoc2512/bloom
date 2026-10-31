"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_META: Record<string, { flag: string; label: string }> = {
  en: { flag: "🇺🇸", label: "English" },
  vi: { flag: "🇻🇳", label: "Tiếng Việt" },
  zh: { flag: "🇨🇳", label: "简体中文" },
  ko: { flag: "🇰🇷", label: "한국어" },
  ja: { flag: "🇯🇵", label: "日本語" },
};

export function LanguageToggle() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <SelectPrimitive.Root value={locale} onValueChange={handleChange}>
      <SelectPrimitive.Trigger
        aria-label={t("selectLanguage")}
        className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full text-ink-soft hover:text-rose-deep hover:bg-blush/60 transition-all outline-none data-[state=open]:bg-blush/60 data-[state=open]:text-rose-deep"
      >
        <SelectPrimitive.Value>{LOCALE_META[locale]?.flag ?? "🌐"}</SelectPrimitive.Value>
        <SelectPrimitive.Icon>
          <ChevronDown size={11} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={8}
          align="end"
          className="z-50 rounded-2xl glass p-1.5 min-w-[160px] animate-[dialog-in_0.15s_ease-out]"
        >
          <SelectPrimitive.Viewport>
            {routing.locales.map((l) => (
              <SelectPrimitive.Item
                key={l}
                value={l}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-base cursor-pointer outline-none select-none data-[highlighted]:bg-blush/60 data-[state=checked]:text-rose-deep data-[state=checked]:font-medium"
              >
                <span className="text-base leading-none">{LOCALE_META[l].flag}</span>
                <SelectPrimitive.ItemText>{LOCALE_META[l].label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="ml-auto text-rose-deep">
                  <Check size={13} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
