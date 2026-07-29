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
import { useTheme } from "@/components/theme-provider";
import { useTranslations } from "next-intl";
import { useBloomBalance, useBloomStore } from "@/lib/store";
import { formatVND, todayKey } from "@/lib/utils";
import { CATEGORY_CHART_COLOR } from "@/lib/category-meta";
import { categoryMinutesTotal } from "@/lib/reward-engine";
import type { Category } from "@/lib/types";
import { useShallow } from "zustand/react/shallow";

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl glass glass-hover p-5">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="grid place-items-center w-7 h-7 rounded-lg bg-blush/80 dark:bg-white/5">{icon}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">{label}</span>
      </div>
      <div className="text-xl font-semibold font-mono tracking-tight">{value}</div>
    </div>
  );
}

export function Analytics() {
  const t = useTranslations("analytics");
  const tCat = useTranslations("categories");
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const { streak, longestStreak, focuses, history } = useBloomStore(
    useShallow((s) => ({
      streak: s.streak,
      longestStreak: s.longestStreak,
      focuses: s.focuses,
      history: s.history,
    }))
  );
  const balance = useBloomBalance();
  const categoryMinutes = categoryMinutesTotal(focuses);

  const total = focuses.length;
  const completed = focuses.filter((f) => f.checklist.every((c) => c.done)).length;
  const ratio = total ? completed / total : 0;
  const todayMinutes = focuses.reduce(
    (sum, f) => sum + f.checklist.filter((c) => c.done).reduce((a, c) => a + c.estimatedMinutes, 0),
    0
  );

  const today = todayKey();
  const weekData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const minutes = key === today ? todayMinutes : history.find((h) => h.date === key)?.focusMinutes ?? 0;
    return { day: d.toLocaleDateString(undefined, { weekday: "short" }), hours: Number((minutes / 60).toFixed(1)) };
  });
  const weekHours = weekData.reduce((s, d) => s + d.hours, 0);

  const pieData = (Object.entries(categoryMinutes) as [Category, number][])
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ key, value, name: tCat(`${key}.label`) }));

  const strongest = pieData.length > 0 ? [...pieData].sort((a, b) => b.value - a.value)[0].key : undefined;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-display font-medium">{t("title")}</div>
        <div className="text-sm text-ink-soft mt-0.5">
          {t("suggestionLabel")} - {t("suggestion")}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              <Tooltip cursor={{ fill: "rgba(245,79,147,0.08)" }} contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} formatter={(v) => [`${v}h`, ""]} />
              <Bar dataKey="hours" radius={[8, 8, 8, 8]} fill="#f54f93" label={{ position: "top", fontSize: 11, fill: dark ? "#e7e5e4" : "#57534e" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl glass p-5">
          <div className="text-sm font-medium mb-3">{t("timeByCategory")}</div>
          {pieData.length > 0 ? (
            <>
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
            </>
          ) : (
            <div className="h-[220px] grid place-items-center text-sm text-ink-soft text-center px-6">
              {t("noCategoryData")}
            </div>
          )}
        </div>
      </div>

      {strongest && (
        <div className="rounded-2xl glass p-5">
          <div className="text-sm font-medium mb-1">{t("strongestCategory")}</div>
          <div className="text-sm text-rose-deep">
            {tCat(`${strongest}.label`)} - {tCat(`${strongest}.desc`)}
          </div>
        </div>
      )}
    </div>
  );
}
