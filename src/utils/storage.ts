import {
  AppState,
  ChallengeConfig,
  CompletionLog,
  Habit,
  MilestoneReward,
  UserProfile,
} from '../types.ts';
import {
  formatDateToISO,
  getTodayDateString,
  getLastNDays,
} from './dateUtils.ts';

const STORAGE_KEY = 'duo_habit_challenge_state_v1';

export function getDefaultChallengeConfig(): ChallengeConfig {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 7); // Started 7 days ago

  const end = new Date(now);
  end.setDate(now.getDate() + 21); // Ends in 21 days
  end.setHours(23, 59, 59, 999);

  return {
    title: '30 күндік мақсаттар жарысы 🎯',
    startDate: formatDateToISO(start),
    endDate: end.toISOString(),
    grandPrize: 'Жеңімпаз қалаған романтикалық кешкі ас пен сыйлық таңдайды 🎁',
    loserPenalty: 'Жеңілген адам 1 апта бойы таңғы кофе немесе шай дайындайды ☕',
  };
}

export function getDefaultProfiles(): { user1: UserProfile; user2: UserProfile } {
  return {
    user1: {
      id: 'user1',
      name: 'Мен',
      role: 'me',
      nickname: 'Батырым',
      avatarEmoji: '🦁',
      themeColor: 'indigo',
      motto: 'Әр күн сайын жаңа биіктерге!',
    },
    user2: {
      id: 'user2',
      name: 'Қызым',
      role: 'partner',
      nickname: 'Жүрегім',
      avatarEmoji: '🌸',
      themeColor: 'rose',
      motto: 'Мақсатыма жетіп, сені жеңемін! 💕',
    },
  };
}

export function getDefaultHabits(): Habit[] {
  return [
    {
      id: 'habit-sport',
      title: 'Спортпен шұғылдану (30+ мин)',
      description: 'Жүгіру, зал немесе үй жаттығуы',
      points: 20,
      category: 'health',
      targetUser: 'both',
      icon: 'Dumbbell',
      createdAt: '2026-10-01',
    },
    {
      id: 'habit-water',
      title: 'Күніне 2 литр су ішу',
      description: 'Ағзаны таза сумен қамтамасыз ету',
      points: 10,
      category: 'health',
      targetUser: 'both',
      icon: 'Droplets',
      createdAt: '2026-10-01',
    },
    {
      id: 'habit-book',
      title: 'Кітап оқу (кем дегенде 20 бет)',
      description: 'Күнделікті пайдалы әдебиет',
      points: 15,
      category: 'learning',
      targetUser: 'both',
      icon: 'BookOpen',
      createdAt: '2026-10-01',
    },
    {
      id: 'habit-language',
      title: 'Шет тілі / Жаңа дағды (25 мин)',
      description: 'Ағылшын тілі немесе кәсіби сабақ',
      points: 20,
      category: 'learning',
      targetUser: 'both',
      icon: 'GraduationCap',
      createdAt: '2026-10-01',
    },
    {
      id: 'habit-romance-msg',
      title: 'Жылы сөз & Махаббат хабарламасы',
      description: 'Бір-бірімізге көңіл бөліп, қолдау білдіру',
      points: 15,
      category: 'romance',
      targetUser: 'both',
      icon: 'Heart',
      createdAt: '2026-10-01',
    },
    {
      id: 'habit-walk',
      title: 'Бірге серуендеу немесе кешкі әңгіме',
      description: 'Телефонсыз таза ауада немесе шәй үстінде сырласу',
      points: 20,
      category: 'romance',
      targetUser: 'both',
      icon: 'Sparkles',
      createdAt: '2026-10-01',
    },
    {
      id: 'habit-sleep',
      title: 'Уақытылы ұйықтау (23:30-ға дейін)',
      description: 'Дұрыс ұйқы мен ертеңгі күнгі қуат',
      points: 15,
      category: 'lifestyle',
      targetUser: 'both',
      icon: 'Moon',
      createdAt: '2026-10-01',
    },
    {
      id: 'habit-order',
      title: 'Бөлмені жинау & Күнді қорытындылау',
      description: 'Тәртіп пен ертеңгі күннің жоспары',
      points: 10,
      category: 'lifestyle',
      targetUser: 'both',
      icon: 'CheckSquare',
      createdAt: '2026-10-01',
    },
  ];
}

export function getDefaultMilestoneRewards(): MilestoneReward[] {
  return [
    {
      id: 'r-100',
      pointsRequired: 100,
      title: 'Кез келген сүйікті тәтті немесе кофе ☕🍰',
      claimedByUser1: true,
      claimedByUser2: true,
      icon: 'Coffee',
    },
    {
      id: 'r-250',
      pointsRequired: 250,
      title: 'Кинотеатрға билет немесе арнайы кино кеші 🍿',
      claimedByUser1: true,
      claimedByUser2: false,
      icon: 'Film',
    },
    {
      id: 'r-500',
      pointsRequired: 500,
      title: 'Романтикалық мейрамханада кешкі ас 🍷',
      claimedByUser1: false,
      claimedByUser2: false,
      icon: 'UtensilsCrossed',
    },
    {
      id: 'r-750',
      pointsRequired: 750,
      title: 'Қала сыртына немесе спа-ға саяхат 🚗🌿',
      claimedByUser1: false,
      claimedByUser2: false,
      icon: 'Compass',
    },
    {
      id: 'r-1000',
      pointsRequired: 1000,
      title: 'Басты жүлде: Кез келген тілек сөзсіз орындалады! ✨🎁',
      claimedByUser1: false,
      claimedByUser2: false,
      icon: 'Crown',
    },
  ];
}

/**
 * Generate realistic seed completions for demonstration so the app is instantly rich
 */
export function generateSeedCompletions(): CompletionLog[] {
  const today = getTodayDateString();
  const pastDays = getLastNDays(7, today);
  const habits = getDefaultHabits();
  const logs: CompletionLog[] = [];

  // Seed completions over last week to establish realistic competition
  pastDays.forEach((dayStr, idx) => {
    // User 1 completions
    if (idx % 2 === 0 || idx > 3) {
      logs.push({
        id: `seed-u1-${dayStr}-water`,
        habitId: habits[1].id,
        userId: 'user1',
        date: dayStr,
        timestamp: new Date(dayStr).getTime() + 10000,
        pointsAwarded: habits[1].points,
      });
      logs.push({
        id: `seed-u1-${dayStr}-sport`,
        habitId: habits[0].id,
        userId: 'user1',
        date: dayStr,
        timestamp: new Date(dayStr).getTime() + 20000,
        pointsAwarded: habits[0].points,
      });
    }

    if (idx % 3 === 0) {
      logs.push({
        id: `seed-u1-${dayStr}-book`,
        habitId: habits[2].id,
        userId: 'user1',
        date: dayStr,
        timestamp: new Date(dayStr).getTime() + 30000,
        pointsAwarded: habits[2].points,
      });
    }

    // User 2 completions
    logs.push({
      id: `seed-u2-${dayStr}-water`,
      habitId: habits[1].id,
      userId: 'user2',
      date: dayStr,
      timestamp: new Date(dayStr).getTime() + 15000,
      pointsAwarded: habits[1].points,
    });

    if (idx !== 2) {
      logs.push({
        id: `seed-u2-${dayStr}-romance`,
        habitId: habits[4].id,
        userId: 'user2',
        date: dayStr,
        timestamp: new Date(dayStr).getTime() + 25000,
        pointsAwarded: habits[4].points,
      });
      logs.push({
        id: `seed-u2-${dayStr}-lang`,
        habitId: habits[3].id,
        userId: 'user2',
        date: dayStr,
        timestamp: new Date(dayStr).getTime() + 35000,
        pointsAwarded: habits[3].points,
      });
    }
  });

  return logs;
}

export function getInitialAppState(): AppState {
  const profiles = getDefaultProfiles();
  return {
    user1: profiles.user1,
    user2: profiles.user2,
    activeUserId: 'user1',
    challenge: getDefaultChallengeConfig(),
    habits: getDefaultHabits(),
    completions: generateSeedCompletions(),
    rewards: getDefaultMilestoneRewards(),
  };
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialAppState();
      saveAppState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    // Ensure structure validity
    if (!parsed.user1 || !parsed.user2 || !parsed.habits || !Array.isArray(parsed.completions)) {
      const initial = getInitialAppState();
      saveAppState(initial);
      return initial;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load app state from localStorage:', e);
    return getInitialAppState();
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save app state to localStorage:', e);
  }
}

export function resetAppState(): AppState {
  const initial = getInitialAppState();
  saveAppState(initial);
  return initial;
}
