import type {
  CompletionLog,
  CountdownTime,
  Habit,
  HabitCategory,
  LeaderboardPeriod,
  ScoreSummary,
  UserId
} from '../types.ts';
import {
  formatDateKazakh,
  getEndOfWeek,
  getStartOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getTodayDateString,
  parseISODate,
  formatDateToISO
} from './dateUtils.ts';

/**
 * Calculates countdown until challenge deadline
 */
export function calculateCountdown(endDateIso: string, currentTimeMs = Date.now()): CountdownTime {
  const targetMs = new Date(endDateIso).getTime();
  const diffMs = targetMs - currentTimeMs;

  if (isNaN(diffMs) || diffMs <= 0) {
    return {
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isCompleted: true,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    isCompleted: false,
  };
}

/**
 * Filter completions by date range
 */
export function filterCompletionsByRange(
  completions: CompletionLog[],
  startDate: string,
  endDate: string
): CompletionLog[] {
  return completions.filter(c => c.date >= startDate && c.date <= endDate);
}

/**
 * Compute ScoreSummary for a single period
 */
export function calculatePeriodScores(
  completions: CompletionLog[],
  period: LeaderboardPeriod,
  targetDate = getTodayDateString()
): ScoreSummary {
  let filtered: CompletionLog[] = [];
  let periodLabel = '';

  if (period === 'daily') {
    filtered = completions.filter(c => c.date === targetDate);
    periodLabel = `Бүгін, ${formatDateKazakh(targetDate, false)}`;
  } else if (period === 'weekly') {
    const startWeek = getStartOfWeek(targetDate);
    const endWeek = getEndOfWeek(targetDate);
    filtered = filterCompletionsByRange(completions, startWeek, endWeek);
    periodLabel = `Осы апта (${formatDateKazakh(startWeek, false)} – ${formatDateKazakh(endWeek, false)})`;
  } else if (period === 'monthly') {
    const startMonth = getStartOfMonth(targetDate);
    const endMonth = getEndOfMonth(targetDate);
    filtered = filterCompletionsByRange(completions, startMonth, endMonth);
    const [year, month] = targetDate.split('-');
    const sampleDate = `${year}-${month}-15`;
    periodLabel = `${formatDateKazakh(sampleDate).split(' ').slice(1).join(' ')} айы`;
  } else {
    // overall
    filtered = completions;
    periodLabel = 'Жалпы жарыс есебі';
  }

  let user1Score = 0;
  let user2Score = 0;
  let user1TasksCount = 0;
  let user2TasksCount = 0;

  for (const item of filtered) {
    if (item.userId === 'user1') {
      user1Score += item.pointsAwarded;
      user1TasksCount += 1;
    } else if (item.userId === 'user2') {
      user2Score += item.pointsAwarded;
      user2TasksCount += 1;
    }
  }

  let winnerId: UserId | 'tie' = 'tie';
  if (user1Score > user2Score) {
    winnerId = 'user1';
  } else if (user2Score > user1Score) {
    winnerId = 'user2';
  }

  const difference = Math.abs(user1Score - user2Score);

  return {
    period,
    periodLabel,
    user1Score,
    user2Score,
    winnerId,
    difference,
    user1TasksCount,
    user2TasksCount,
  };
}

/**
 * Calculates score summaries for all four periods
 */
export function calculateAllSummaries(
  completions: CompletionLog[],
  targetDate = getTodayDateString()
): Record<LeaderboardPeriod, ScoreSummary> {
  return {
    daily: calculatePeriodScores(completions, 'daily', targetDate),
    weekly: calculatePeriodScores(completions, 'weekly', targetDate),
    monthly: calculatePeriodScores(completions, 'monthly', targetDate),
    overall: calculatePeriodScores(completions, 'overall', targetDate),
  };
}

/**
 * Check if a specific habit has been completed by user on given date
 */
export function isHabitCompleted(
  completions: CompletionLog[],
  habitId: string,
  userId: UserId,
  dateStr = getTodayDateString()
): boolean {
  return completions.some(
    c => c.habitId === habitId && c.userId === userId && c.date === dateStr
  );
}

/**
 * Calculate user total score across all time
 */
export function getUserTotalScore(completions: CompletionLog[], userId: UserId): number {
  return completions
    .filter(c => c.userId === userId)
    .reduce((sum, c) => sum + c.pointsAwarded, 0);
}

/**
 * Calculate consecutive day streak for a user
 */
export function getUserStreak(
  completions: CompletionLog[],
  userId: UserId,
  targetDate = getTodayDateString()
): number {
  const userCompletions = completions.filter(c => c.userId === userId);
  const activeDates = new Set(userCompletions.map(c => c.date));

  let streak = 0;
  const current = parseISODate(targetDate);

  // If user completed today, streak starts from today, otherwise from yesterday
  const todayStr = formatDateToISO(current);
  let checkDate = new Date(current);

  if (!activeDates.has(todayStr)) {
    // Check if yesterday had completion
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = formatDateToISO(checkDate);
    if (!activeDates.has(yesterdayStr)) {
      return 0;
    }
  }

  while (true) {
    const dateStr = formatDateToISO(checkDate);
    if (activeDates.has(dateStr)) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate user breakdown by habit category
 */
export function getUserCategoryBreakdown(
  completions: CompletionLog[],
  habits: Habit[],
  userId: UserId
): Record<HabitCategory, { count: number; points: number }> {
  const habitMap = new Map<string, Habit>();
  habits.forEach(h => habitMap.set(h.id, h));

  const initial: Record<HabitCategory, { count: number; points: number }> = {
    health: { count: 0, points: 0 },
    learning: { count: 0, points: 0 },
    romance: { count: 0, points: 0 },
    lifestyle: { count: 0, points: 0 },
  };

  const userItems = completions.filter(c => c.userId === userId);
  for (const item of userItems) {
    const habit = habitMap.get(item.habitId);
    const category = habit ? habit.category : 'lifestyle';
    initial[category].count += 1;
    initial[category].points += item.pointsAwarded;
  }

  return initial;
}
