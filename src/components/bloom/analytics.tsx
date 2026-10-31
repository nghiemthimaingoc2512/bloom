"use client";

import * as React from "react";
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
import { Clock, Flame, Share2, Sparkles, TrendingUp } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useLocale, useTranslations } from "next-intl";
import { useBloomStore } from "@/lib/store";
import { formatVND, shiftDay, todayKey } from "@/lib/utils";
import { CATEGORY_CHART_COLOR } from "@/lib/category-meta";
import { categoryMinutesTotal, minutesOnDay } from "@/lib/reward-engine";
import { ShareCardDialog } from "./share-card-dialog";
import type { ShareCardContent } from "@/lib/share-card";
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
  const tShare = useTranslations("share");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const [shareOpen, setShareOpen] = React.useState(false);
  const [shareContent, setShareContent] = React.useState<ShareCardContent | null>(null);

  const { streak, longestStreak, focuses, history } = useBloomStore(
    useShallow((s) => ({
      streak: s.streak,
      longestStreak: s.longestStreak,
      focuses: s.focuses,
      history: s.history,
    }))
  );
  const categoryMinutes = categoryMinutesTotal(focuses);

  const total = focuses.length;
  const completed = focuses.filter((f) => f.checklist.every((c) => c.done)).length;
  const ratio = total ? completed / total : 0;
  const today = todayKey();
  const weekKeys = Array.from({ length: 7 }).map((_, i) => shiftDay(today, i - 6));
  const weekData = weekKeys.map((key) => {
    const [y, m, d] = key.split("-").map(Number);
    const minutes = minutesOnDay({ focuses, history }, key);
    return { day: new Date(y, m - 1, d).toLocaleDateString(locale, { weekday: "short" }), hours: Number((minutes / 60).toFixed(1)) };
  });
  const weekSet = new Set(weekKeys);
  const weekEarned =
    focuses.reduce(
      (sum, f) => sum + f.checklist.filter((c) => c.done && c.doneAt && weekSet.has(c.doneAt)).reduce((a, c) => a + c.reward, 0),
      0
    ) + history.filter((h) => weekSet.has(h.date) && h.balanceDelta > 0).reduce((a, h) => a + h.balanceDelta, 0);
  const weekLost = -history.filter((h) => weekSet.has(h.date) && h.balanceDelta < 0).reduce((a, h) => a + h.balanceDelta, 0);
  const weekHours = weekData.reduce((s, d) => s + d.hours, 0);

  const pieData = (Object.entries(categoryMinutes) as [Category, number][])
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ key, value, name: tCat(`${key}.label`) }));

  const strongest = pieData.length > 0 ? [...pieData].sort((a, b) => b.value - a.value)[0].key : undefined;

  const bestDay = weekData.reduce((best, d) => (d.hours > best.hours ? d : best), weekData[0]);
  const longestSessionMinutes = Math.max(
    0,
    ...focuses.flatMap((f) => f.checklist.filter((c) => c.done).map((c) => c.estimatedMinutes))
  );

  function shareWeekly() {
    setShareContent({
      eyebrow: tShare("weeklyEyebrow"),
      emoji: "📈",
      headline: tShare("weeklyHeadline"),
      stats: [
        { label: t("focusHours"), value: `${weekHours.toFixed(1)}h` },
        { label: t("balanceEarned"), value: formatVND(weekEarned) },
        ...(strongest ? [{ label: tShare("topCategoryLabel"), value: tCat(`${strongest}.label`) }] : []),
        { label: tShare("bestDayLabel"), value: bestDay.day },
        { label: tShare("longestSessionLabel"), value: `${longestSessionMinutes}m` },
      ],
    });
    setShareOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xl font-display font-medium">{t("title")}</div>
          <div className="text-sm text-ink-soft mt-0.5">
            {t("suggestionLabel")} - {t("suggestion")}
          </div>
        </div>
        <button
          onClick={shareWeekly}
          className="btn-secondary flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium"
        >
          <Share2 size={13} /> {tShare("shareWeekly")}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card icon={<Clock size={16} className="text-rose" />} label={t("focusHours")} value={`${weekHours.toFixed(1)}h`} />
        <Card icon={<Sparkles size={16} className="text-amber-400" />} label={t("balanceEarned")} value={formatVND(weekEarned)} />
        <Card icon={<Sparkles size={16} className="text-stone-400" />} label={t("balanceLost")} value={formatVND(weekLost)} />
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
              <Bar dataKey="hours" radius={[8, 8, 8, 8]} fill="var(--color-rose)" label={{ position: "top", fontSize: 11, fill: dark ? "#e7e5e4" : "#57534e" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl glass p-5">
          <div className="text-sm font-medium mb-3">{t("timeByCategory")}</div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={pieData.length > 1 ? 3 : 0}>
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

      <ShareCardDialog open={shareOpen} onOpenChange={setShareOpen} content={shareContent} />
    </div>
  );
}
