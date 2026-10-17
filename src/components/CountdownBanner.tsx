import React, { useEffect, useState } from 'react';
import { Timer, Gift, AlertCircle, Edit3, Flame } from 'lucide-react';
import { ChallengeConfig, CountdownTime } from '../types.ts';
import { calculateCountdown } from '../utils/scoring.ts';
import { formatDateKazakh } from '../utils/dateUtils.ts';

interface CountdownBannerProps {
  challenge: ChallengeConfig;
  onEditChallenge: () => void;
}

export const CountdownBanner: React.FC<CountdownBannerProps> = ({
  challenge,
  onEditChallenge,
}) => {
  const [countdown, setCountdown] = useState<CountdownTime>(() =>
    calculateCountdown(challenge.endDate)
  );

  useEffect(() => {
    // Initial compute
    setCountdown(calculateCountdown(challenge.endDate));

    const interval = setInterval(() => {
      setCountdown(calculateCountdown(challenge.endDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [challenge.endDate]);

  // Calculate percentage of challenge completed
  const startMs = new Date(challenge.startDate).getTime();
  const endMs = new Date(challenge.endDate).getTime();
  const nowMs = Date.now();
  const totalDuration = Math.max(1, endMs - startMs);
  const elapsed = Math.max(0, Math.min(totalDuration, nowMs - startMs));
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-700 text-white shadow-lg shadow-rose-900/10 p-5 sm:p-6 mb-6">
      {/* Background ambient lighting */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left Side: Challenge Info */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-rose-200">
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              Жұптық Мақсат Жарысы
            </span>
            <span className="text-rose-200 text-xs">·</span>
            <span className="text-xs text-rose-100 font-medium">
              Мәре: {formatDateKazakh(challenge.endDate.split('T')[0])}
            </span>
            <button
              type="button"
              onClick={onEditChallenge}
              className="text-white/80 hover:text-white p-1 rounded transition-colors"
              title="Жарыс мерзімін өңдеу"
              aria-label="Жарыс мерзімін өңдеу"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
            {challenge.title}
          </h1>

          {/* Reward & Penalty */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs pt-1">
            <div className="flex items-center gap-1.5 text-rose-100 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg">
              <Gift className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="font-medium truncate max-w-xs sm:max-w-sm">
                {challenge.grandPrize}
              </span>
            </div>
            {challenge.loserPenalty && (
              <div className="flex items-center gap-1.5 text-rose-200 bg-black/10 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                <span className="truncate max-w-xs">{challenge.loserPenalty}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live Countdown Timer */}
        <div className="shrink-0 bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/20">
          <div className="flex items-center gap-1 text-xs font-medium text-rose-100 mb-2">
            <Timer className="w-3.5 h-3.5" />
            <span>Жарыстың аяқталуына қалды:</span>
          </div>

          {countdown.isCompleted ? (
            <div className="text-center py-2 px-4 bg-amber-400 text-slate-900 rounded-lg font-bold text-sm">
              🏆 Жарыс аяқталды! Жеңімпаз анықталды!
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-black/20 rounded-lg px-2.5 py-1.5 min-w-[54px]">
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums leading-tight">
                  {countdown.days}
                </div>
                <div className="text-[10px] text-rose-200 uppercase font-medium">күн</div>
              </div>
              <div className="bg-black/20 rounded-lg px-2.5 py-1.5 min-w-[54px]">
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums leading-tight">
                  {String(countdown.hours).padStart(2, '0')}
                </div>
                <div className="text-[10px] text-rose-200 uppercase font-medium">сағат</div>
              </div>
              <div className="bg-black/20 rounded-lg px-2.5 py-1.5 min-w-[54px]">
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums leading-tight">
                  {String(countdown.minutes).padStart(2, '0')}
                </div>
                <div className="text-[10px] text-rose-200 uppercase font-medium">мин</div>
              </div>
              <div className="bg-black/20 rounded-lg px-2.5 py-1.5 min-w-[54px]">
                <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums leading-tight text-amber-300">
                  {String(countdown.seconds).padStart(2, '0')}
                </div>
                <div className="text-[10px] text-rose-200 uppercase font-medium">сек</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-3 border-t border-white/15">
        <div className="flex justify-between items-center text-[11px] text-rose-100 mb-1">
          <span>Жарыс барысы</span>
          <span className="font-semibold"><span className="font-mono tabular-nums">{progressPercent}%</span> орындалды</span>
        </div>
        <div className="w-full h-2 bg-black/25 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-300 to-rose-200 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
