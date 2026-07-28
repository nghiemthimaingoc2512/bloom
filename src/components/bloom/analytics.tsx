"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock, Flame, Sparkles, TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { formatVND } from "@/lib/utils";
import { CATEGORY_CHART_COLOR } from "@/lib/category-meta";
import type { Category } from "@/lib/types";

const WEEK_SAMPLE = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3.1 },
  { day: "Wed", hours: 1.8 },
  { day: "Thu", hours: 2.9 },
  { day: "Fri", hours: 3.4 },
  { day: "Sat", hours: 1.2 },
];

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl glass p-4">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[11px] text-ink-soft">{label}</span>
      </div>
      <div className="text-lg font-medium font-mono">{value}</div>
    </div>
  );
}

export function Analytics() {
  const t = useTranslations("analytics");
  const tCat = useTranslations("categories");
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const { balance, streak, longestStreak, focuses, categoryMinutes } = useBloomStore((s) => ({
    balance: s.balance,
    streak: s.streak,
    longestStreak: s.longestStreak,
    focuses: s.focuses,
    categoryMinutes: s.categoryMinutes,
  }));

  const total = focuses.length;
  const completed = focuses.filter((f) => f.checklist.every((c) => c.done)).length;
  const ratio = total ? completed / total : 0;
  const todayMinutes = focuses.reduce(
    (sum, f) => sum + f.checklist.filter((c) => c.done).reduce((a, c) => a + c.estimatedMinutes, 0),
    0
  );

  const weekData = [...WEEK_SAMPLE, { day: "Sun", hours: Number((todayMinutes / 60).toFixed(1)) }];
  const weekHours = weekData.reduce((s, d) => s + d.hours, 0);

  const pieData = (Object.entries(categoryMinutes) as [Category, number][])
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ key, value, name: tCat(`${key}.label`) }));

  const strongest = (Object.entries(categoryMinutes) as [Category, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "create";

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-display">{t("title")}</div>
        <div className="text-sm text-ink-soft">
          {t("suggestionLabel")} — {t("suggestion")}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card icon={<Clock size={16} className="text-rose" />} label={t("focusHours")} value={`${weekHours.toFixed(1)}h`} />
        <Card icon={<Sparkles size={16} className="text-amber-400" />} label={t("balanceEarned")} value={formatVND(balance)} />
        <Card icon={<Flame size={16} className="text-orange-400" />} label={t("streak")} value={`${streak}`} />
        <Card icon={<Flame size={16} className="text-orange-300" />} label={t("longestStreak")} value={`${longestStreak}`} />
        <Card icon={<TrendingUp size={16} className="text-green-500" />} label={t("completionRate")} value={`${Math.round(ratio * 100)}%`} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl glass p-5">
          <div className="text-sm font-medium mb-3">{t("hoursByDay")}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#3a2a30" : "#fce7f3"} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: dark ? "#a8a29e" : "#78716c" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip cursor={{ fill: "rgba(244,167,194,0.1)" }} contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} formatter={(v) => [`${v}h`, ""]} />
              <Bar dataKey="hours" radius={[8, 8, 8, 8]} fill="#fb7185" label={{ position: "top", fontSize: 11, fill: dark ? "#e7e5e4" : "#57534e" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl glass p-5">
          <div className="text-sm font-medium mb-3">{t("timeByCategory")}</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {pieData.map((d) => (
                  <Cell key={d.key} fill={CATEGORY_CHART_COLOR[d.key]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} min`, ""]} contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {pieData.map((d) => (
              <div key={d.key} className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_CHART_COLOR[d.key] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl glass p-5">
        <div className="text-sm font-medium mb-1">{t("strongestCategory")}</div>
        <div className="text-sm text-rose-deep">
          {tCat(`${strongest}.label`)} — {tCat(`${strongest}.desc`)}
        </div>
      </div>
    </div>
  );
}
