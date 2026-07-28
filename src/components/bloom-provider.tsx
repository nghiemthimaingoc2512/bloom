"use client";

import * as React from "react";
import { useBloomStore } from "@/lib/store";

export function BloomProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useBloomStore((s) => s.hydrate);
  const hydrated = useBloomStore((s) => s.hydrated);

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

  return <>{children}</>;
}
