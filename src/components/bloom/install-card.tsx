"use client";

import * as React from "react";
import { Download, Share, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

function subscribeNoop() {
  return () => {};
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

/** Lets people put Bloom on their phone as an app, with no app store:
 *  Chrome/Edge/Android get a one-tap install prompt; iPhone shows the
 *  Share → Add to Home Screen steps Safari requires. */
export function InstallCard({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("install");
  const [prompt, setPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = React.useState(false);
  // Platform and standalone state are read from the browser once, after
  // mount, via useSyncExternalStore so the server render stays neutral.
  const ready = React.useSyncExternalStore(subscribeNoop, () => true, () => false);
  const platform = React.useSyncExternalStore(subscribeNoop, detectPlatform, () => "desktop" as Platform);
  const standalone = React.useSyncExternalStore(subscribeNoop, isStandalone, () => false);

  React.useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!ready || installed || standalone) return null;

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setPrompt(null);
  }

  const steps =
    platform === "ios"
      ? [t("iosStep1"), t("iosStep2"), t("iosStep3")]
      : platform === "android"
        ? [t("androidStep1"), t("androidStep2")]
        : [t("desktopStep1"), t("desktopStep2")];

  return (
    <section className={`rounded-2xl glass ${compact ? "p-4" : "p-6"} space-y-3`}>
      <div className="flex items-center gap-2">
        <Smartphone size={16} className="text-rose-deep" />
        <div className="font-medium text-base">{t("title")}</div>
      </div>
      <p className="text-base text-ink-soft">{t("body")}</p>
      {prompt ? (
        <button onClick={install} className="btn-primary flex items-center gap-1.5 px-5 py-2.5 rounded-full text-base font-medium">
          <Download size={15} /> {t("installButton")}
        </button>
      ) : (
        <ol className="text-base text-ink-soft space-y-1.5 list-decimal pl-5">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="w-4 shrink-0 text-ink-muted">{i + 1}.</span>
              <span className="flex items-center gap-1 flex-wrap">
                {platform === "ios" && i === 0 && <Share size={13} className="inline" />}
                {s}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
