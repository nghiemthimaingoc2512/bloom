"use client";

import * as React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useBloomStore } from "@/lib/store";

type StepKey = "add" | "tick" | "balance" | "dashboard" | "journal";

const TARGET: Record<StepKey, string> = {
  add: "quick-add",
  tick: "step",
  balance: "balance",
  dashboard: "nav-dashboard",
  journal: "nav-journal",
};
const ORDER: StepKey[] = ["add", "tick", "balance", "dashboard", "journal"];
const LATER_STEPS: StepKey[] = ["balance", "dashboard", "journal"];
const CARD_WIDTH = 340;
const GAP = 14;
const ARROW = 44;

/** Both navs carry the same marker; only the one on screen has a box. */
function findVisible(tour: string): HTMLElement | null {
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${tour}"]`);
  for (const node of nodes) {
    const r = node.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return node;
  }
  return null;
}

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** First-run walkthrough. The first two steps wait for the real action (add a
 *  task, tick it), so the person learns by doing; the rest point at the
 *  controls they will need next. The page stays clickable throughout. */
export function Tutorial() {
  const t = useTranslations("tutorial");
  const pathname = usePathname();
  const focuses = useBloomStore((s) => s.focuses);
  const finishTutorial = useBloomStore((s) => s.finishTutorial);
  const [laterIndex, setLaterIndex] = React.useState(0);
  const [box, setBox] = React.useState<Box | null>(null);
  const [hidden, setHidden] = React.useState(false);
  const [cardHeight, setCardHeight] = React.useState(230);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const hasTask = focuses.length > 0;
  const hasTicked = focuses.some((f) => f.checklist.some((c) => c.done));
  const step: StepKey = !hasTask ? "add" : !hasTicked ? "tick" : LATER_STEPS[laterIndex];

  React.useEffect(() => {
    const measure = () => {
      // Step aside while a dialog is open so it can be used normally.
      setHidden(Boolean(document.querySelector('[role="dialog"]')));
      if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
      const el = findVisible(TARGET[step]);
      if (!el) {
        setBox(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setBox((prev) =>
        prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height
          ? prev
          : { top: r.top, left: r.left, width: r.width, height: r.height }
      );
    };
    findVisible(TARGET[step])?.scrollIntoView({ block: "center", behavior: "smooth" });
    measure();
    const timer = window.setInterval(measure, 120);
    window.addEventListener("scroll", measure, { passive: true, capture: true });
    window.addEventListener("resize", measure);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("scroll", measure, { capture: true });
      window.removeEventListener("resize", measure);
    };
  }, [step, pathname]);

  if (hidden) return null;

  const needsToday = (step === "add" || step === "tick") && pathname !== "/";
  const manual = step !== "add" && step !== "tick";
  const isLast = step === "journal";

  function next() {
    if (isLast) finishTutorial();
    else setLaterIndex((i) => i + 1);
  }

  const viewportWidth = typeof window === "undefined" ? 1024 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 768 : window.innerHeight;
  const cardWidth = Math.min(CARD_WIDTH, viewportWidth - 24);
  const below = box ? box.top + box.height / 2 < viewportHeight / 2 : true;
  const centerX = box ? box.left + box.width / 2 : viewportWidth / 2;
  const cardLeft = Math.max(12, Math.min(viewportWidth - cardWidth - 12, centerX - cardWidth / 2));

  // Whatever the target's position, the card always stays fully on screen.
  const wantedTop = box
    ? below
      ? box.top + box.height + GAP + ARROW
      : box.top - GAP - ARROW - cardHeight
    : viewportHeight - cardHeight - 96;
  const cardStyle: React.CSSProperties = {
    left: cardLeft,
    top: Math.max(12, Math.min(viewportHeight - cardHeight - 12, wantedTop)),
    width: cardWidth,
  };

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none" role="status" aria-live="polite">
      {box && !needsToday && (
        <>
          <div
            className="absolute rounded-2xl ring-4 ring-rose"
            style={{
              top: box.top - 8,
              left: box.left - 8,
              width: box.width + 16,
              height: box.height + 16,
              boxShadow: "0 0 0 9999px rgba(40, 10, 25, 0.5)",
            }}
          />
          <span
            className="absolute grid place-items-center rounded-full gradient-primary text-white shadow-lg animate-bounce"
            style={{
              width: ARROW,
              height: ARROW,
              left: Math.max(8, Math.min(viewportWidth - ARROW - 8, centerX - ARROW / 2)),
              top: below ? box.top + box.height + 10 : box.top - ARROW - 10,
            }}
          >
            {below ? <ArrowUp size={24} /> : <ArrowDown size={24} />}
          </span>
        </>
      )}

      <div ref={cardRef} className="absolute pointer-events-auto rounded-2xl bg-surface border-2 border-rose p-5 shadow-2xl space-y-2" style={cardStyle}>
        <div className="text-sm font-semibold text-rose-deep">
          {t("progress", { current: ORDER.indexOf(step) + 1, total: ORDER.length })}
        </div>
        <div className="font-display text-xl font-semibold leading-snug">{t(`${step}Title`)}</div>
        <p className="text-base text-ink-soft">{t(`${step}Body`)}</p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <button onClick={finishTutorial} className="text-sm font-semibold text-ink-soft hover:text-ink px-1 py-2">
            {t("skip")}
          </button>
          {needsToday ? (
            <Link href="/" className="btn-primary px-5 py-2.5 rounded-full text-base">
              {t("backToToday")}
            </Link>
          ) : manual ? (
            <button onClick={next} className="btn-primary px-5 py-2.5 rounded-full text-base">
              {isLast ? t("done") : t("next")}
            </button>
          ) : (
            <span className="text-sm font-semibold text-rose-deep">{t("tryIt")}</span>
          )}
        </div>
      </div>
    </div>
  );
}
