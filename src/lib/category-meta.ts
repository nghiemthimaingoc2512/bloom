import { BookOpen, Cloud, Heart, Leaf, type LucideIcon } from "lucide-react";
import type { Category } from "@/lib/types";

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  create: Leaf,
  grow: BookOpen,
  enjoy: Heart,
  consume: Cloud,
};

/** Every category sits on the same quiet tint; the icon colour alone tells
 *  them apart, so the board never turns into a patchwork of pastels. */
export const CATEGORY_BG: Record<Category, string> = {
  create: "bg-blush text-rose-deep",
  grow: "bg-blush text-[#5b7559] dark:text-[#9fb79d]",
  enjoy: "bg-blush text-[#8a636d] dark:text-[#c4a0a8]",
  consume: "bg-blush text-ink-soft",
};

export const CATEGORY_CHART_COLOR: Record<Category, string> = {
  create: "#4d5863",
  grow: "#7a9478",
  enjoy: "#a8808a",
  consume: "#b5b1aa",
};
