import {
  Coffee,
  Clapperboard,
  Plane,
  BookOpen,
  Sparkles,
  UtensilsCrossed,
  Music2,
  ShoppingBag,
  Heart,
  Gift,
  type LucideIcon,
} from "lucide-react";
import type { RewardIcon } from "@/lib/types";

export const REWARD_ICON: Record<RewardIcon, LucideIcon> = {
  coffee: Coffee,
  movie: Clapperboard,
  travel: Plane,
  book: BookOpen,
  spa: Sparkles,
  dinner: UtensilsCrossed,
  music: Music2,
  shopping: ShoppingBag,
  heart: Heart,
  gift: Gift,
};

export const REWARD_ICON_KEYS: RewardIcon[] = [
  "gift",
  "coffee",
  "movie",
  "travel",
  "book",
  "spa",
  "dinner",
  "music",
  "shopping",
  "heart",
];

export interface RewardTemplate {
  key: string;
  icon: RewardIcon;
  cost: number;
}

export const REWARD_TEMPLATES: RewardTemplate[] = [
  { key: "coffee", icon: "coffee", cost: 100_000 },
  { key: "movie", icon: "movie", cost: 300_000 },
  { key: "trip", icon: "travel", cost: 2_000_000 },
  { key: "book", icon: "book", cost: 250_000 },
  { key: "spa", icon: "spa", cost: 800_000 },
  { key: "dinner", icon: "dinner", cost: 500_000 },
];
