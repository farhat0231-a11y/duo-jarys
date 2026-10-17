import React from 'react';
import { Crown, Trophy, TrendingUp, Sparkles, Award } from 'lucide-react';
import { LeaderboardPeriod, ScoreSummary, UserProfile } from '../types.ts';
import { triggerWinnerCelebration } from '../utils/effects.ts';

interface LeaderboardCardProps {
  user1: UserProfile;
  user2: UserProfile;
  selectedPeriod: LeaderboardPeriod;
  onSelectPeriod: (period: LeaderboardPeriod) => void;
  summary: ScoreSummary;
  user1Streak: number;
  user2Streak: number;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  user1,
  user2,
  selectedPeriod,
  onSelectPeriod,
  summary,
  user1Streak,
  user2Streak,
}) => {
  const totalScore = summary.user1Score + summary.user2Score;
  const user1Percent = totalScore > 0 ? Math.round((summary.user1Score / totalScore) * 100) : 50;
  const user2Percent = totalScore > 0 ? 100 - user1Percent : 50;

  const winnerProfile =
    summary.winnerId === 'user1' ? user1 : summary.winnerId === 'user2' ? user2 : null;

  const periodTitles: Record<LeaderboardPeriod, string> = {
    daily: 'Күндік жеңімпаз',
    weekly: 'Апталық жеңімпаз',
    monthly: 'Айлық жеңімпаз',
    overall: 'Жалпы көшбасшы (Champion)',
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-5 sm:p-6 mb-6">
      {/* Top: Section Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 font-display">
              {periodTitles[selectedPeriod]}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{summary.periodLabel}</p>
        </div>

        {/* Period Selector Tabs (Buttons) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => onSelectPeriod('daily')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              selectedPeriod === 'daily'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Бүгін
          </button>
          <button
            type="button"
            onClick={() => onSelectPeriod('weekly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              selectedPeriod === 'weekly'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Апта
          </button>
          <button
            type="button"
            onClick={() => onSelectPeriod('monthly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              selectedPeriod === 'monthly'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ай
          </button>
          <button
            type="button"
            onClick={() => onSelectPeriod('overall')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              selectedPeriod === 'overall'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Жалпы
          </button>
        </div>
      </div>

      {/* Duel / VS Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
        {/* User 1 Card */}
        <div
          className={`relative p-4 rounded-xl border transition-all ${
            summary.winnerId === 'user1'
              ? 'bg-gradient-to-br from-indigo-50/80 to-blue-50/50 border-indigo-200 shadow-sm ring-1 ring-indigo-200'
              : 'bg-slate-50/60 border-slate-200'
          }`}
        >
          {summary.winnerId === 'user1' && (
            <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100/90 px-2 py-0.5 rounded-full">
              <Crown className="w-3.5 h-3.5 fill-amber-500" />
              <span>Жеңімпаз</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="text-3xl p-2 rounded-2xl bg-white shadow-sm border border-slate-100">
              {user1.avatarEmoji}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">{user1.name}</span>
                <span className="text-xs text-indigo-600 font-medium">({user1.nickname})</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{summary.user1TasksCount} тапсырма орындалды</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-600 font-medium">🔥 {user1Streak} күн үздіксіз</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xs font-medium text-slate-500">Жиналған ұпай:</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-indigo-600 font-mono tabular-nums">
                {summary.user1Score}
              </span>
              <span className="text-xs font-semibold text-slate-600">ұпай</span>
            </div>
          </div>
        </div>

        {/* User 2 Card */}
        <div
          className={`relative p-4 rounded-xl border transition-all ${
            summary.winnerId === 'user2'
              ? 'bg-gradient-to-br from-rose-50/80 to-pink-50/50 border-rose-200 shadow-sm ring-1 ring-rose-200'
              : 'bg-slate-50/60 border-slate-200'
          }`}
        >
          {summary.winnerId === 'user2' && (
            <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-100/90 px-2 py-0.5 rounded-full">
              <Crown className="w-3.5 h-3.5 fill-rose-500" />
              <span>Жеңімпаз</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="text-3xl p-2 rounded-2xl bg-white shadow-sm border border-slate-100">
              {user2.avatarEmoji}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">{user2.name}</span>
                <span className="text-xs text-rose-600 font-medium">({user2.nickname})</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{summary.user2TasksCount} тапсырма орындалды</span>
                <span aria-hidden="true">·</span>
                <span className="text-rose-600 font-medium">🔥 {user2Streak} күн үздіксіз</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xs font-medium text-slate-500">Жиналған ұпай:</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-rose-600 font-mono tabular-nums">
                {summary.user2Score}
              </span>
              <span className="text-xs font-semibold text-slate-600">ұпай</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Dynamic VS Comparison Bar */}
      <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-indigo-700">
            {user1.name}: {user1Percent}%
          </span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">VS</span>
          <span className="text-rose-700">
            {user2.name}: {user2Percent}%
          </span>
        </div>

        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${user1Percent}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
            style={{ width: `${user2Percent}%` }}
          />
        </div>
      </div>

      {/* Winner Status Banner & Cheer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {summary.winnerId === 'tie' ? (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="text-lg">🤝</span>
              <span>Ұпайлар тең түсті! Екеуіңіз де кереметсіздер, алға ұмтылыңыз!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <span className="text-lg">{winnerProfile?.avatarEmoji}</span>
              <span>
                <strong className="text-slate-900">{winnerProfile?.name}</strong>{' '}
                <span className="text-amber-600 font-semibold">
                  <span className="font-mono tabular-nums">+{summary.difference}</span> ұпай
                </span>{' '}
                басымдықпен осы кезеңде көш бастап тұр!
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => triggerWinnerCelebration()}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200/80 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Қолдау білдіру (Confetti) 🎉</span>
        </button>
      </div>
    </div>
  );
};
