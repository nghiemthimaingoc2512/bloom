import { BookOpen, Cloud, Heart, Leaf, type LucideIcon } from "lucide-react";
import type { Category } from "@/lib/types";

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  create: Leaf,
  grow: BookOpen,
  enjoy: Heart,
  consume: Cloud,
};

export const CATEGORY_BG: Record<Category, string> = {
  create: "bg-rose-100 text-rose-500",
  grow: "bg-pink-100 text-pink-500",
  enjoy: "bg-amber-100 text-amber-500",
  consume: "bg-stone-100 text-stone-500",
};

export const CATEGORY_CHART_COLOR: Record<Category, string> = {
  create: "#fb7185",
  grow: "#f472b6",
  enjoy: "#fbbf24",
  consume: "#a8a29e",
};
