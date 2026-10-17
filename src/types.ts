export type UserId = 'user1' | 'user2';

export type HabitCategory = 'health' | 'learning' | 'romance' | 'lifestyle';

export interface UserProfile {
  id: UserId;
  name: string;
  role: 'me' | 'partner';
  nickname: string;
  avatarEmoji: string;
  themeColor: 'rose' | 'purple' | 'indigo' | 'amber';
  motto: string;
  linkedEmail?: string | null;
  linkedUid?: string | null;
  linkedPhotoUrl?: string | null;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  points: number;
  category: HabitCategory;
  targetUser: 'both' | UserId;
  icon: string;
  createdAt: string;
}

export interface CompletionLog {
  id: string;
  habitId: string;
  userId: UserId;
  userUid?: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  pointsAwarded: number;
  note?: string;
}

export interface MilestoneReward {
  id: string;
  pointsRequired: number;
  title: string;
  claimedByUser1: boolean;
  claimedByUser2: boolean;
  icon: string;
}

export interface ChallengeConfig {
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // ISO string e.g. 2026-11-15T23:59:59
  grandPrize: string;
  loserPenalty: string;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'overall';

export interface ScoreSummary {
  period: LeaderboardPeriod;
  periodLabel: string;
  user1Score: number;
  user2Score: number;
  winnerId: UserId | 'tie';
  difference: number;
  user1TasksCount: number;
  user2TasksCount: number;
}

export interface CountdownTime {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isCompleted: boolean;
}

export interface AppState {
  user1: UserProfile;
  user2: UserProfile;
  activeUserId: UserId | 'both';
  challenge: ChallengeConfig;
  habits: Habit[];
  completions: CompletionLog[];
  rewards: MilestoneReward[];
  cloudChallengeId?: string;
}

export interface AuthUserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
