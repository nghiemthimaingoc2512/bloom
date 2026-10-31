"use client";

import * as React from "react";
import { useBloomStore } from "@/lib/store";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Tutorial } from "@/components/bloom/tutorial";
import { InstallButton } from "@/components/bloom/install-button";
import { Nav } from "@/components/bloom/nav";
import { Onboarding } from "@/components/bloom/onboarding";
import { BetaBanner } from "@/components/bloom/beta-banner";

const LAST_SCREEN_KEY = "bloom-last-screen";
const OPENED_KEY = "bloom-opened";
const RESTORABLE = ["/analytics", "/memory", "/profile", "/settings", "/about"];

export function BloomProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useBloomStore((s) => s.hydrate);
  const hydrated = useBloomStore((s) => s.hydrated);
  const onboardingCompleted = useBloomStore((s) => s.onboardingCompleted);
  const tutorialDone = useBloomStore((s) => s.tutorialDone);
  const pathname = usePathname();
  const router = useRouter();
  const checkedLastScreen = React.useRef(false);

  // A fresh open of Bloom returns to the screen the person last used; moving
  // around inside a session (including back to Today) is left alone.
  React.useEffect(() => {
    if (!hydrated || !onboardingCompleted) return;
    try {
      if (!checkedLastScreen.current) {
        checkedLastScreen.current = true;
        const firstOpen = !window.sessionStorage.getItem(OPENED_KEY);
        window.sessionStorage.setItem(OPENED_KEY, "1");
        const last = window.localStorage.getItem(LAST_SCREEN_KEY);
        if (firstOpen && tutorialDone && pathname === "/" && last && RESTORABLE.includes(last)) {
          router.replace(last);
          return;
        }
      }
      window.localStorage.setItem(LAST_SCREEN_KEY, pathname);
    } catch {
      // Storage may be unavailable; Bloom simply opens on Today.
    }
  }, [hydrated, onboardingCompleted, tutorialDone, pathname, router]);

  React.useEffect(() => {
    void hydrate();
    // Re-run the day-change checks whenever the tab comes back after midnight.
    const onVisible = () => {
      if (document.visibilityState === "visible") void hydrate();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-ink/40 text-sm">
        <span className="animate-pulse">Bloom</span>
      </div>
    );
  }

  // Gate the entire app shell - not just the page content - behind
  // onboarding, so there's no nav route that can bypass it.
  if (!onboardingCompleted) {
    return <Onboarding />;
  }

  return (
    <>
      <BetaBanner />
      <Nav />
      {/* Bottom padding clears the phone bottom nav. Feedback lives in Settings
          and About, not as a floating button over the content. */}
      <main className="max-w-5xl mx-auto px-5 pb-28 md:pb-16 pt-2">
        {children}
        <InstallButton />
      </main>
      {!tutorialDone && <Tutorial />}
    </>
  );
}
