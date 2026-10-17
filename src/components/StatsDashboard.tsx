import React from 'react';
import { BarChart3, TrendingUp, Flame, Heart, Award, Sparkles, BookOpen, Dumbbell, Clock } from 'lucide-react';
import { CompletionLog, Habit, HabitCategory, UserProfile } from '../types.ts';
import { getLastNDays, formatDateKazakh, formatDayNameShort } from '../utils/dateUtils.ts';
import { getUserCategoryBreakdown, getUserStreak, getUserTotalScore } from '../utils/scoring.ts';

interface StatsDashboardProps {
  completions: CompletionLog[];
  habits: Habit[];
  user1: UserProfile;
  user2: UserProfile;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  completions,
  habits,
  user1,
  user2,
}) => {
  const last7Days = getLastNDays(7);

  // Calculate daily points for each of the last 7 days
  const dailyTrends = last7Days.map((dayStr) => {
    let u1 = 0;
    let u2 = 0;
    completions
      .filter((c) => c.date === dayStr)
      .forEach((c) => {
        if (c.userId === 'user1') u1 += c.pointsAwarded;
        if (c.userId === 'user2') u2 += c.pointsAwarded;
      });
    return {
      date: dayStr,
      label: formatDayNameShort(dayStr),
      u1,
      u2,
    };
  });

  const maxPoints = Math.max(1, ...dailyTrends.map((d) => Math.max(d.u1, d.u2)));

  const u1Total = getUserTotalScore(completions, 'user1');
  const u2Total = getUserTotalScore(completions, 'user2');

  const u1Streak = getUserStreak(completions, 'user1');
  const u2Streak = getUserStreak(completions, 'user2');

  const u1Categories = getUserCategoryBreakdown(completions, habits, 'user1');
  const u2Categories = getUserCategoryBreakdown(completions, habits, 'user2');

  const categories: { key: HabitCategory; label: string; icon: string }[] = [
    { key: 'health', label: 'Денсаулық & Спорт', icon: '🏃' },
    { key: 'learning', label: 'Даму & Оқу', icon: '📚' },
    { key: 'romance', label: 'Махаббат & Қамқорлық', icon: '💖' },
    { key: 'lifestyle', label: 'Өмір салты', icon: '✨' },
  ];

  return (
    <div className="space-y-6">
      {/* Top 3 KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Score */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Жалпы ұпайлар</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-xs text-indigo-600 font-medium">{user1.name}</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">{u1Total}</div>
            </div>
            <div className="text-xs font-bold text-slate-400">VS</div>
            <div className="text-right">
              <div className="text-xs text-rose-600 font-medium">{user2.name}</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">{u2Total}</div>
            </div>
          </div>
        </div>

        {/* Streaks */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Үздіксіз серия (Streak)</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-xs text-indigo-600 font-medium">{user1.name}</div>
              <div className="text-2xl font-bold text-slate-900">
                <span className="font-mono tabular-nums">{u1Streak}</span>{' '}
                <span className="text-xs font-normal text-slate-500">күн</span>
              </div>
            </div>
            <div className="text-xs font-bold text-slate-400">VS</div>
            <div className="text-right">
              <div className="text-xs text-rose-600 font-medium">{user2.name}</div>
              <div className="text-2xl font-bold text-slate-900">
                <span className="font-mono tabular-nums">{u2Streak}</span>{' '}
                <span className="text-xs font-normal text-slate-500">күн</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Tasks Done */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Орындалған тапсырмалар</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div>
              <div className="text-xs text-indigo-600 font-medium">{user1.name}</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {completions.filter((c) => c.userId === 'user1').length}
              </div>
            </div>
            <div className="text-xs font-bold text-slate-400">VS</div>
            <div className="text-right">
              <div className="text-xs text-rose-600 font-medium">{user2.name}</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {completions.filter((c) => c.userId === 'user2').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-day Trend Visual Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900 font-display">
                Соңғы 7 күндегі ұпайлар динамикасы
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Күндік жарыс нәтижелерін салыстыру</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span>{user1.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span>{user2.name}</span>
            </div>
          </div>
        </div>

        {/* Bar chart container */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-4 border-b border-slate-100">
          {dailyTrends.map((d) => {
            const h1Percent = Math.max(8, Math.round((d.u1 / maxPoints) * 100));
            const h2Percent = Math.max(8, Math.round((d.u2 / maxPoints) * 100));

            return (
              <div key={d.date} className="flex flex-col items-center h-full justify-end group">
                {/* Visual tooltip */}
                <div className="text-[10px] text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {d.u1}:{d.u2}
                </div>

                <div className="flex items-end gap-1 sm:gap-1.5 w-full justify-center h-32">
                  <div
                    title={`${user1.name}: ${d.u1} ұпай (${d.date})`}
                    style={{ height: `${d.u1 === 0 ? 4 : h1Percent}%` }}
                    className="w-3 sm:w-4 bg-indigo-500 rounded-t-md transition-all hover:bg-indigo-600"
                  />
                  <div
                    title={`${user2.name}: ${d.u2} ұпай (${d.date})`}
                    style={{ height: `${d.u2 === 0 ? 4 : h2Percent}%` }}
                    className="w-3 sm:w-4 bg-rose-500 rounded-t-md transition-all hover:bg-rose-600"
                  />
                </div>

                <span className="text-xs font-semibold text-slate-600 mt-2">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 font-display mb-4">
          Санаттар бойынша нәтижелер
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const u1Pts = u1Categories[cat.key].points;
            const u2Pts = u2Categories[cat.key].points;
            const total = u1Pts + u2Pts;
            const u1Share = total > 0 ? Math.round((u1Pts / total) * 100) : 50;

            return (
              <div key={cat.key} className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    <span className="font-mono tabular-nums">{u1Pts}</span> vs <span className="font-mono tabular-nums">{u2Pts}</span> ұпай
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${u1Share}%` }}
                  />
                  <div
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${100 - u1Share}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span className="text-indigo-600">{user1.name}: {u1Pts} ұпай</span>
                  <span className="text-rose-600">{user2.name}: {u2Pts} ұпай</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
