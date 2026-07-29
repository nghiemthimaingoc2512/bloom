"use client";

import * as React from "react";
import { useBloomStore } from "@/lib/store";
import { Nav } from "@/components/bloom/nav";
import { Onboarding } from "@/components/bloom/onboarding";
import { BetaBanner } from "@/components/bloom/beta-banner";
import { FeedbackLauncher } from "@/components/bloom/feedback-launcher";

export function BloomProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useBloomStore((s) => s.hydrate);
  const hydrated = useBloomStore((s) => s.hydrated);
  const onboardingCompleted = useBloomStore((s) => s.onboardingCompleted);

  React.useEffect(() => {
    void hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-ink/40 text-sm">
        <span className="animate-pulse">🌸</span>
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
      <main className="max-w-5xl mx-auto px-5 pb-20 pt-2">{children}</main>
      <FeedbackLauncher />
    </>
  );
}
