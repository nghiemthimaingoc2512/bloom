"use client";

import * as React from "react";
import { ArrowDown, Check, Copy, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BloomLogo } from "./logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    /** Captured by the inline script in the layout, since the browser can fire
     *  this before React has mounted. */
    __bloomInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

type Platform = "iphone" | "ipad" | "android" | "inApp" | "desktop";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  // Apps like Facebook or Zalo open links in their own browser, which cannot install anything.
  if (/FBAN|FBAV|FB_IAB|Instagram|Zalo|Line\/|MicroMessenger|TikTok|BytedanceWebview/i.test(ua)) return "inApp";
  if (/iPhone|iPod/.test(ua)) return "iphone";
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ipad";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function subscribe(onChange: () => void) {
  window.addEventListener("bloom-install-ready", onChange);
  window.addEventListener("appinstalled", onChange);
  return () => {
    window.removeEventListener("bloom-install-ready", onChange);
    window.removeEventListener("appinstalled", onChange);
  };
}

/** Sits at the bottom of every tab. Where the browser allows it this installs
 *  in one tap. Safari on iPhone has no such API, so there the button opens the
 *  exact steps, with an arrow towards the button to press. */
export function InstallButton() {
  const t = useTranslations("install");
  const standalone = React.useSyncExternalStore(subscribe, isStandalone, () => true);
  const platform = React.useSyncExternalStore(subscribe, detectPlatform, () => "desktop" as Platform);
  const [installed, setInstalled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  if (standalone || installed) return null;

  async function handleClick() {
    const event = window.__bloomInstallPrompt;
    if (!event) {
      setOpen(true);
      return;
    }
    await event.prompt();
    const choice = await event.userChoice;
    window.__bloomInstallPrompt = null;
    if (choice.outcome === "accepted") setInstalled(true);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked in in-app browsers; the address stays visible to copy by hand.
    }
  }

  const steps =
    platform === "iphone" || platform === "ipad"
      ? [t("iosStep1"), t("iosStep2"), t("iosStep3")]
      : platform === "android"
        ? [t("androidStep1"), t("androidStep2")]
        : platform === "desktop"
          ? [t("desktopStep1"), t("desktopStep2")]
          : [];

  return (
    <div className="mt-8 flex flex-col items-center gap-1.5">
      <button onClick={handleClick} className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-base">
        <Download size={18} /> {t("installButton")}
      </button>
      <p className="text-sm text-ink-soft text-center">{t("installHint")}</p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <div className="flex items-center gap-3 mb-4 pr-8">
            <BloomLogo size={44} className="shrink-0" />
            <DialogTitle className="text-xl font-display font-semibold leading-snug">
              {platform === "inApp" ? t("inAppTitle") : t("dialogTitle")}
            </DialogTitle>
          </div>

          {platform === "inApp" ? (
            <div className="space-y-3">
              <p className="text-base text-ink-soft">{t("inAppBody")}</p>
              <button onClick={copyLink} className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-base">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t("copied") : t("copyLink")}
              </button>
            </div>
          ) : (
            <ol className="space-y-3">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 items-start text-base">
                  <span className="grid place-items-center w-7 h-7 rounded-full gradient-primary text-white text-sm font-bold shrink-0">{i + 1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          )}

          {platform === "iphone" && (
            <div className="flex items-center justify-end gap-2 mt-5 text-sm font-semibold text-rose-deep">
              {t("iosArrow")}
              <ArrowDown size={22} className="animate-bounce" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
