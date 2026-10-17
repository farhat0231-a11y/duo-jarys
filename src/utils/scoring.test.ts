import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCountdown,
  calculatePeriodScores,
  calculateAllSummaries,
  isHabitCompleted,
  getUserTotalScore,
  getUserStreak,
} from './scoring.ts';
import type { CompletionLog } from '../types.ts';

test('calculateCountdown handles future dates and zero states accurately', () => {
  const futureIso = '2026-10-20T12:00:00.000Z';
  const currentMs = new Date('2026-10-18T10:00:00.000Z').getTime();

  const countdown = calculateCountdown(futureIso, currentMs);
  assert.equal(countdown.isCompleted, false);
  assert.equal(countdown.days, 2);
  assert.equal(countdown.hours, 2);
  assert.equal(countdown.minutes, 0);

  // Past date
  const pastCountdown = calculateCountdown(futureIso, new Date('2026-10-25T00:00:00.000Z').getTime());
  assert.equal(pastCountdown.isCompleted, true);
  assert.equal(pastCountdown.days, 0);
  assert.equal(pastCountdown.hours, 0);
});

test('calculatePeriodScores correctly aggregates daily scores and detects winner', () => {
  const sampleLogs: CompletionLog[] = [
    { id: '1', habitId: 'h1', userId: 'user1', date: '2026-10-18', timestamp: 1, pointsAwarded: 15 },
    { id: '2', habitId: 'h2', userId: 'user1', date: '2026-10-18', timestamp: 2, pointsAwarded: 10 },
    { id: '3', habitId: 'h1', userId: 'user2', date: '2026-10-18', timestamp: 3, pointsAwarded: 15 },
    { id: '4', habitId: 'h3', userId: 'user2', date: '2026-10-18', timestamp: 4, pointsAwarded: 20 },
    // another day
    { id: '5', habitId: 'h1', userId: 'user1', date: '2026-10-17', timestamp: 5, pointsAwarded: 50 },
  ];

  const daily = calculatePeriodScores(sampleLogs, 'daily', '2026-10-18');
  assert.equal(daily.user1Score, 25);
  assert.equal(daily.user2Score, 35);
  assert.equal(daily.winnerId, 'user2');
  assert.equal(daily.difference, 10);
  assert.equal(daily.user1TasksCount, 2);
  assert.equal(daily.user2TasksCount, 2);

  // Tie test
  const tieLogs: CompletionLog[] = [
    { id: '1', habitId: 'h1', userId: 'user1', date: '2026-10-18', timestamp: 1, pointsAwarded: 20 },
    { id: '2', habitId: 'h1', userId: 'user2', date: '2026-10-18', timestamp: 2, pointsAwarded: 20 },
  ];
  const tieResult = calculatePeriodScores(tieLogs, 'daily', '2026-10-18');
  assert.equal(tieResult.winnerId, 'tie');
  assert.equal(tieResult.difference, 0);
});

test('calculateAllSummaries returns daily, weekly, monthly and overall results', () => {
  const sampleLogs: CompletionLog[] = [
    { id: '1', habitId: 'h1', userId: 'user1', date: '2026-10-18', timestamp: 1, pointsAwarded: 15 },
    { id: '2', habitId: 'h1', userId: 'user2', date: '2026-10-18', timestamp: 2, pointsAwarded: 25 },
  ];

  const all = calculateAllSummaries(sampleLogs, '2026-10-18');
  assert.ok(all.daily);
  assert.ok(all.weekly);
  assert.ok(all.monthly);
  assert.ok(all.overall);
  assert.equal(all.overall.winnerId, 'user2');
});

test('isHabitCompleted checks habit completion status', () => {
  const sampleLogs: CompletionLog[] = [
    { id: '1', habitId: 'water-habit', userId: 'user1', date: '2026-10-18', timestamp: 1, pointsAwarded: 10 },
  ];

  assert.equal(isHabitCompleted(sampleLogs, 'water-habit', 'user1', '2026-10-18'), true);
  assert.equal(isHabitCompleted(sampleLogs, 'water-habit', 'user2', '2026-10-18'), false);
  assert.equal(isHabitCompleted(sampleLogs, 'sport-habit', 'user1', '2026-10-18'), false);
  assert.equal(isHabitCompleted(sampleLogs, 'water-habit', 'user1', '2026-10-19'), false);
});

test('getUserTotalScore sums all points across all completions', () => {
  const logs: CompletionLog[] = [
    { id: '1', habitId: 'h1', userId: 'user1', date: '2026-10-15', timestamp: 1, pointsAwarded: 10 },
    { id: '2', habitId: 'h2', userId: 'user1', date: '2026-10-16', timestamp: 2, pointsAwarded: 20 },
    { id: '3', habitId: 'h1', userId: 'user2', date: '2026-10-16', timestamp: 3, pointsAwarded: 35 },
  ];

  assert.equal(getUserTotalScore(logs, 'user1'), 30);
  assert.equal(getUserTotalScore(logs, 'user2'), 35);
});

test('getUserStreak counts consecutive active days correctly', () => {
  const logs: CompletionLog[] = [
    { id: '1', habitId: 'h1', userId: 'user1', date: '2026-10-18', timestamp: 1, pointsAwarded: 10 },
    { id: '2', habitId: 'h1', userId: 'user1', date: '2026-10-17', timestamp: 2, pointsAwarded: 10 },
    { id: '3', habitId: 'h1', userId: 'user1', date: '2026-10-16', timestamp: 3, pointsAwarded: 10 },
    // Gap on 2026-10-15
    { id: '4', habitId: 'h1', userId: 'user1', date: '2026-10-14', timestamp: 4, pointsAwarded: 10 },
  ];

  assert.equal(getUserStreak(logs, 'user1', '2026-10-18'), 3);

  // If user completed yesterday but not today yet, streak is still maintained
  assert.equal(getUserStreak(logs, 'user1', '2026-10-19'), 3);

  // User with no completions
  assert.equal(getUserStreak(logs, 'user2', '2026-10-18'), 0);
});
