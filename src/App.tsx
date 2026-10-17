import React, { useState, useEffect } from 'react';
import {
  AppState,
  AuthUserInfo,
  Habit,
  LeaderboardPeriod,
  UserId,
} from './types.ts';
import {
  loadAppState,
  saveAppState,
  resetAppState,
} from './utils/storage.ts';
import {
  calculateAllSummaries,
  getUserStreak,
  getUserTotalScore,
} from './utils/scoring.ts';
import { getTodayDateString } from './utils/dateUtils.ts';
import { Header } from './components/Header.tsx';
import { CountdownBanner } from './components/CountdownBanner.tsx';
import { LeaderboardCard } from './components/LeaderboardCard.tsx';
import { HabitList } from './components/HabitList.tsx';
import { StatsDashboard } from './components/StatsDashboard.tsx';
import { PrizesAndWishes } from './components/PrizesAndWishes.tsx';
import { HabitModal } from './components/HabitModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { CheckSquare, Trophy, BarChart3, Gift, Cloud, Users, Heart } from 'lucide-react';
import {
  auth,
  loginWithGoogle,
  logoutUser,
} from './utils/firebase.ts';
import { onAuthStateChanged } from 'firebase/auth';
import {
  DEFAULT_CHALLENGE_ID,
  ensureCloudChallenge,
  subscribeToCloudChallenge,
  subscribeToCloudHabits,
  subscribeToCloudCompletions,
  subscribeToCloudRewards,
  saveCloudHabit,
  deleteCloudHabit,
  saveCloudCompletion,
  deleteCloudCompletion,
  updateCloudReward,
  updateCloudChallengeConfig,
} from './utils/cloudSync.ts';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<'habits' | 'leaderboard' | 'stats' | 'rewards'>('habits');
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('daily');
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUserInfo | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const challengeId = appState.cloudChallengeId || DEFAULT_CHALLENGE_ID;

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userInfo: AuthUserInfo = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        setCurrentUser(userInfo);
        setIsCloudSynced(true);

        // Auto-link Google user to a profile if not yet linked
        setAppState((prev) => {
          let updated = { ...prev };
          if (!prev.user1.linkedUid && !prev.user2.linkedUid) {
            // Link to user1 (Мен) by default on first login
            updated = {
              ...updated,
              user1: {
                ...updated.user1,
                name: firebaseUser.displayName || updated.user1.name,
                linkedUid: firebaseUser.uid,
                linkedEmail: firebaseUser.email,
                linkedPhotoUrl: firebaseUser.photoURL,
              },
              activeUserId: 'user1',
            };
          } else if (prev.user1.linkedUid && prev.user1.linkedUid !== firebaseUser.uid && !prev.user2.linkedUid) {
            // If user1 is already taken, link to user2 (Қызым)
            updated = {
              ...updated,
              user2: {
                ...updated.user2,
                name: firebaseUser.displayName || updated.user2.name,
                linkedUid: firebaseUser.uid,
                linkedEmail: firebaseUser.email,
                linkedPhotoUrl: firebaseUser.photoURL,
              },
              activeUserId: 'user2',
            };
          }
          return updated;
        });

        // Initialize and subscribe to Firestore
        try {
          await ensureCloudChallenge(challengeId, appState);
        } catch (e) {
          console.debug('Cloud initialization:', e);
        }
      } else {
        setCurrentUser(null);
        setIsCloudSynced(false);
      }
    });

    return () => unsubscribe();
  }, [challengeId]);

  // Cloud Real-Time Subscriptions when authenticated
  useEffect(() => {
    if (!currentUser) return;

    const unsubChallenge = subscribeToCloudChallenge(challengeId, (cloudData) => {
      setAppState((prev) => ({
        ...prev,
        ...cloudData,
        challenge: cloudData.challenge ? { ...prev.challenge, ...cloudData.challenge } : prev.challenge,
        user1: cloudData.user1 ? { ...prev.user1, ...cloudData.user1 } : prev.user1,
        user2: cloudData.user2 ? { ...prev.user2, ...cloudData.user2 } : prev.user2,
      }));
    });

    const unsubHabits = subscribeToCloudHabits(challengeId, (habits) => {
      setAppState((prev) => ({ ...prev, habits }));
    });

    const unsubCompletions = subscribeToCloudCompletions(challengeId, (completions) => {
      setAppState((prev) => ({ ...prev, completions }));
    });

    const unsubRewards = subscribeToCloudRewards(challengeId, (rewards) => {
      setAppState((prev) => ({ ...prev, rewards }));
    });

    return () => {
      unsubChallenge();
      unsubHabits();
      unsubCompletions();
      unsubRewards();
    };
  }, [currentUser, challengeId]);

  // Sync to local storage
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  const todayStr = getTodayDateString();

  // Score Summaries for all periods
  const summaries = calculateAllSummaries(appState.completions, todayStr);
  const currentSummary = summaries[selectedPeriod];

  // User streaks and totals
  const u1Streak = getUserStreak(appState.completions, 'user1', todayStr);
  const u2Streak = getUserStreak(appState.completions, 'user2', todayStr);
  const u1Total = getUserTotalScore(appState.completions, 'user1');
  const u2Total = getUserTotalScore(appState.completions, 'user2');

  // Toggle habit completion
  const handleToggleCompletion = async (habitId: string, userId: UserId, dateStr: string) => {
    const existing = appState.completions.find(
      (c) => c.habitId === habitId && c.userId === userId && c.date === dateStr
    );

    const habit = appState.habits.find((h) => h.id === habitId);
    const points = habit ? habit.points : 10;

    if (existing) {
      // Remove locally
      setAppState((prev) => ({
        ...prev,
        completions: prev.completions.filter((c) => c.id !== existing.id),
      }));

      // Remove from Cloud
      if (currentUser) {
        try {
          await deleteCloudCompletion(challengeId, existing.id);
        } catch (e) {
          console.debug('Cloud completion delete:', e);
        }
      }
    } else {
      const newCompletion = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        habitId,
        userId,
        userUid: currentUser?.uid,
        date: dateStr,
        timestamp: Date.now(),
        pointsAwarded: points,
      };

      // Add locally
      setAppState((prev) => ({
        ...prev,
        completions: [...prev.completions, newCompletion],
      }));

      // Add to Cloud
      if (currentUser) {
        try {
          await saveCloudCompletion(challengeId, newCompletion);
        } catch (e) {
          console.debug('Cloud completion save:', e);
        }
      }
    }
  };

  // Add / Edit habit
  const handleSaveHabit = async (
    habitData: Omit<Habit, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let targetHabit: Habit;
    if (existingId) {
      targetHabit = {
        ...appState.habits.find((h) => h.id === existingId)!,
        ...habitData,
      };
      setAppState((prev) => ({
        ...prev,
        habits: prev.habits.map((h) => (h.id === existingId ? targetHabit : h)),
      }));
    } else {
      targetHabit = {
        id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ...habitData,
        createdAt: todayStr,
      };
      setAppState((prev) => ({
        ...prev,
        habits: [targetHabit, ...prev.habits],
      }));
    }

    if (currentUser) {
      try {
        await saveCloudHabit(challengeId, targetHabit);
      } catch (e) {
        console.debug('Cloud habit save:', e);
      }
    }
  };

  // Delete habit
  const handleDeleteHabit = async (habitId: string) => {
    if (confirm('Тапсырманы өшіруге сенімдісіз бе?')) {
      setAppState((prev) => ({
        ...prev,
        habits: prev.habits.filter((h) => h.id !== habitId),
      }));

      if (currentUser) {
        try {
          await deleteCloudHabit(challengeId, habitId);
        } catch (e) {
          console.debug('Cloud habit delete:', e);
        }
      }
    }
  };

  // Claim reward
  const handleClaimReward = async (
    rewardId: string,
    userKey: 'claimedByUser1' | 'claimedByUser2'
  ) => {
    setAppState((prev) => ({
      ...prev,
      rewards: prev.rewards.map((r) =>
        r.id === rewardId ? { ...r, [userKey]: true } : r
      ),
    }));

    if (currentUser) {
      try {
        await updateCloudReward(challengeId, rewardId, { [userKey]: true });
      } catch (e) {
        console.debug('Cloud reward update:', e);
      }
    }
  };

  // Add custom reward
  const handleAddCustomReward = async (title: string, pointsRequired: number) => {
    const newReward = {
      id: `rew-${Date.now()}`,
      title,
      pointsRequired,
      claimedByUser1: false,
      claimedByUser2: false,
      icon: 'Gift',
    };

    setAppState((prev) => ({
      ...prev,
      rewards: [...prev.rewards, newReward],
    }));

    if (currentUser) {
      try {
        await updateCloudReward(challengeId, newReward.id, newReward);
      } catch (e) {
        console.debug('Cloud custom reward save:', e);
      }
    }
  };

  // Reset to seed data
  const handleResetData = () => {
    const fresh = resetAppState();
    setAppState(fresh);
  };

  // Handle linking Google account to user1 or user2
  const handleLinkAccountToProfile = async (profileId: UserId) => {
    if (!currentUser) return;

    setAppState((prev) => {
      const isU1 = profileId === 'user1';
      const updated = {
        ...prev,
        user1: isU1
          ? {
              ...prev.user1,
              linkedUid: currentUser.uid,
              linkedEmail: currentUser.email,
              linkedPhotoUrl: currentUser.photoURL,
              name: currentUser.displayName || prev.user1.name,
            }
          : prev.user1.linkedUid === currentUser.uid
          ? { ...prev.user1, linkedUid: null, linkedEmail: null }
          : prev.user1,
        user2: !isU1
          ? {
              ...prev.user2,
              linkedUid: currentUser.uid,
              linkedEmail: currentUser.email,
              linkedPhotoUrl: currentUser.photoURL,
              name: currentUser.displayName || prev.user2.name,
            }
          : prev.user2.linkedUid === currentUser.uid
          ? { ...prev.user2, linkedUid: null, linkedEmail: null }
          : prev.user2,
        activeUserId: profileId,
      };

      if (currentUser) {
        updateCloudChallengeConfig(challengeId, updated.challenge, updated.user1, updated.user2);
      }

      return updated;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50/50 via-white to-purple-50/30">
      {/* Header */}
      <Header
        user1={appState.user1}
        user2={appState.user2}
        activeUserId={appState.activeUserId}
        onSelectUser={(userId) => setAppState((p) => ({ ...p, activeUserId: userId }))}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddModal={() => {
          setHabitToEdit(null);
          setIsHabitModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentUser={currentUser}
        onLoginGoogle={loginWithGoogle}
        onLogout={logoutUser}
        onLinkAccountToProfile={handleLinkAccountToProfile}
        isCloudSynced={isCloudSynced}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {/* Google Sync Notice Banner when authenticated */}
        {currentUser && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Google синхрондау белсенді:</strong> {currentUser.displayName || currentUser.email} ретінде кірдіңіз. Тапсырмалар екі телефонда бірдей жаңарады!
              </span>
            </div>
            <span className="font-semibold text-emerald-700 hidden sm:inline">Real-time ⚡</span>
          </div>
        )}

        {/* Countdown Banner */}
        <CountdownBanner
          challenge={appState.challenge}
          onEditChallenge={() => setIsSettingsOpen(true)}
        />

        {/* Tab 1: Habits & Checklist */}
        {activeTab === 'habits' && (
          <div className="space-y-6">
            <LeaderboardCard
              user1={appState.user1}
              user2={appState.user2}
              selectedPeriod={selectedPeriod}
              onSelectPeriod={setSelectedPeriod}
              summary={currentSummary}
              user1Streak={u1Streak}
              user2Streak={u2Streak}
            />

            <HabitList
              habits={appState.habits}
              completions={appState.completions}
              user1={appState.user1}
              user2={appState.user2}
              activeUserId={appState.activeUserId}
              onToggleCompletion={handleToggleCompletion}
              onOpenAddModal={() => {
                setHabitToEdit(null);
                setIsHabitModalOpen(true);
              }}
              onEditHabit={(h) => {
                setHabitToEdit(h);
                setIsHabitModalOpen(true);
              }}
              onDeleteHabit={handleDeleteHabit}
            />
          </div>
        )}

        {/* Tab 2: Full Leaderboard & Winners */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <LeaderboardCard
              user1={appState.user1}
              user2={appState.user2}
              selectedPeriod={selectedPeriod}
              onSelectPeriod={setSelectedPeriod}
              summary={currentSummary}
              user1Streak={u1Streak}
              user2Streak={u2Streak}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                    Күндік жеңімпаз (Бүгін)
                  </span>
                  <Trophy className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-xl font-bold text-slate-900 mb-1">
                  {summaries.daily.winnerId === 'user1'
                    ? `${appState.user1.name} 👑`
                    : summaries.daily.winnerId === 'user2'
                    ? `${appState.user2.name} 👑`
                    : 'Тең нәтиже 🤝'}
                </div>
                <p className="text-xs text-slate-500">
                  {appState.user1.name}: <span className="font-mono tabular-nums">{summaries.daily.user1Score}</span> ұпай vs{' '}
                  {appState.user2.name}: <span className="font-mono tabular-nums">{summaries.daily.user2Score}</span> ұпай
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                    Апталық жеңімпаз
                  </span>
                  <Trophy className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-xl font-bold text-slate-900 mb-1">
                  {summaries.weekly.winnerId === 'user1'
                    ? `${appState.user1.name} 👑`
                    : summaries.weekly.winnerId === 'user2'
                    ? `${appState.user2.name} 👑`
                    : 'Тең нәтиже 🤝'}
                </div>
                <p className="text-xs text-slate-500">
                  {appState.user1.name}: <span className="font-mono tabular-nums">{summaries.weekly.user1Score}</span> ұпай vs{' '}
                  {appState.user2.name}: <span className="font-mono tabular-nums">{summaries.weekly.user2Score}</span> ұпай
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Айлық жеңімпаз
                  </span>
                  <Trophy className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-xl font-bold text-slate-900 mb-1">
                  {summaries.monthly.winnerId === 'user1'
                    ? `${appState.user1.name} 👑`
                    : summaries.monthly.winnerId === 'user2'
                    ? `${appState.user2.name} 👑`
                    : 'Тең нәтиже 🤝'}
                </div>
                <p className="text-xs text-slate-500">
                  {appState.user1.name}: <span className="font-mono tabular-nums">{summaries.monthly.user1Score}</span> ұпай vs{' '}
                  {appState.user2.name}: <span className="font-mono tabular-nums">{summaries.monthly.user2Score}</span> ұпай
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Analytics & Stats */}
        {activeTab === 'stats' && (
          <StatsDashboard
            completions={appState.completions}
            habits={appState.habits}
            user1={appState.user1}
            user2={appState.user2}
          />
        )}

        {/* Tab 4: Rewards & Wishes */}
        {activeTab === 'rewards' && (
          <PrizesAndWishes
            rewards={appState.rewards}
            user1={appState.user1}
            user2={appState.user2}
            user1Score={u1Total}
            user2Score={u2Total}
            grandPrize={appState.challenge.grandPrize}
            loserPenalty={appState.challenge.loserPenalty}
            onClaimReward={handleClaimReward}
            onAddCustomReward={handleAddCustomReward}
          />
        )}
      </main>

      {/* Floating Bottom Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-100 shadow-lg px-2 py-2">
        <div className="grid grid-cols-4 items-center">
          <button
            type="button"
            onClick={() => setActiveTab('habits')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-semibold transition-all ${
              activeTab === 'habits'
                ? 'text-rose-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-5 h-5 mb-0.5" />
            <span>Чеклист</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-semibold transition-all ${
              activeTab === 'leaderboard'
                ? 'text-purple-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trophy className="w-5 h-5 mb-0.5" />
            <span>Жеңімпаз</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-semibold transition-all ${
              activeTab === 'stats'
                ? 'text-indigo-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span>Статистика</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rewards')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-semibold transition-all ${
              activeTab === 'rewards'
                ? 'text-amber-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Gift className="w-5 h-5 mb-0.5" />
            <span>Жүлделер</span>
          </button>
        </div>
      </div>

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setHabitToEdit(null);
        }}
        onSave={handleSaveHabit}
        habitToEdit={habitToEdit}
        user1Name={appState.user1.name}
        user2Name={appState.user2.name}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        appState={appState}
        onUpdateState={(newState) => {
          setAppState(newState);
          if (currentUser) {
            updateCloudChallengeConfig(
              challengeId,
              newState.challenge,
              newState.user1,
              newState.user2
            );
          }
        }}
        onReset={handleResetData}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-rose-100/70 bg-white/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 justify-center">
            <span>Мақсаттар Дуэлі</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-500">💕</span>
            <span>Екі адамға арналған өзара даму жарысы</span>
          </p>
          <p className="text-slate-400">
            {currentUser ? 'Firebase бұлты арқылы синхрондалған' : 'Деректер LocalStorage жадында сақталады'}
          </p>
        </div>
      </footer>
    </div>
  );
}
