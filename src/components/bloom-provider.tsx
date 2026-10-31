"use client";

import * as React from "react";
import { useBloomStore } from "@/lib/store";
import { Nav } from "@/components/bloom/nav";
import { Onboarding } from "@/components/bloom/onboarding";
import { BetaBanner } from "@/components/bloom/beta-banner";

export function BloomProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useBloomStore((s) => s.hydrate);
  const hydrated = useBloomStore((s) => s.hydrated);
  const onboardingCompleted = useBloomStore((s) => s.onboardingCompleted);

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
      <main className="max-w-5xl mx-auto px-5 pb-28 md:pb-20 pt-2">{children}</main>
    </>
  );
}
