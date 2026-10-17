import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase.ts';
import {
  AppState,
  ChallengeConfig,
  CompletionLog,
  Habit,
  MilestoneReward,
  UserProfile,
} from '../types.ts';

export const DEFAULT_CHALLENGE_ID = 'duo-love-challenge-main';

export async function ensureCloudChallenge(
  challengeId: string,
  initialState: AppState
): Promise<void> {
  const challengeRef = doc(db, 'challenges', challengeId);
  try {
    const snap = await getDoc(challengeRef);
    if (!snap.exists()) {
      // Initialize challenge document
      await setDoc(challengeRef, {
        title: initialState.challenge.title,
        startDate: initialState.challenge.startDate,
        endDate: initialState.challenge.endDate,
        grandPrize: initialState.challenge.grandPrize,
        loserPenalty: initialState.challenge.loserPenalty,
        user1Name: initialState.user1.name,
        user2Name: initialState.user2.name,
        user1Nickname: initialState.user1.nickname,
        user2Nickname: initialState.user2.nickname,
        user1Avatar: initialState.user1.avatarEmoji,
        user2Avatar: initialState.user2.avatarEmoji,
        createdAt: new Date().toISOString(),
      });

      // Initialize default habits in cloud
      for (const h of initialState.habits) {
        await setDoc(doc(db, 'challenges', challengeId, 'habits', h.id), h);
      }

      // Initialize default rewards in cloud
      for (const r of initialState.rewards) {
        await setDoc(doc(db, 'challenges', challengeId, 'rewards', r.id), r);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `challenges/${challengeId}`);
  }
}

export function subscribeToCloudChallenge(
  challengeId: string,
  onUpdate: (data: Partial<AppState>) => void
): () => void {
  const challengeRef = doc(db, 'challenges', challengeId);
  return onSnapshot(
    challengeRef,
    (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        onUpdate({
          challenge: {
            title: d.title,
            startDate: d.startDate,
            endDate: d.endDate,
            grandPrize: d.grandPrize,
            loserPenalty: d.loserPenalty || '',
          },
          user1: {
            id: 'user1',
            role: 'me',
            themeColor: 'indigo',
            motto: d.user1Motto || 'Әр күн сайын жаңа биіктерге!',
            name: d.user1Name || 'Мен',
            nickname: d.user1Nickname || 'Батырым',
            avatarEmoji: d.user1Avatar || '🦁',
            linkedEmail: d.user1Email || null,
            linkedUid: d.user1Uid || null,
          },
          user2: {
            id: 'user2',
            role: 'partner',
            themeColor: 'rose',
            motto: d.user2Motto || 'Мақсатыма жетіп, сені жеңемін! 💕',
            name: d.user2Name || 'Қызым',
            nickname: d.user2Nickname || 'Жүрегім',
            avatarEmoji: d.user2Avatar || '🌸',
            linkedEmail: d.user2Email || null,
            linkedUid: d.user2Uid || null,
          },
        });
      }
    },
    (err) => handleFirestoreError(err, OperationType.GET, `challenges/${challengeId}`)
  );
}

export function subscribeToCloudHabits(
  challengeId: string,
  onUpdate: (habits: Habit[]) => void
): () => void {
  const habitsCol = collection(db, 'challenges', challengeId, 'habits');
  return onSnapshot(
    habitsCol,
    (snapshot) => {
      const items: Habit[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          title: data.title,
          description: data.description,
          points: data.points,
          category: data.category,
          targetUser: data.targetUser,
          icon: data.icon,
          createdAt: data.createdAt,
        });
      });
      if (items.length > 0) {
        onUpdate(items);
      }
    },
    (err) => handleFirestoreError(err, OperationType.GET, `challenges/${challengeId}/habits`)
  );
}

export function subscribeToCloudCompletions(
  challengeId: string,
  onUpdate: (completions: CompletionLog[]) => void
): () => void {
  const completionsCol = collection(db, 'challenges', challengeId, 'completions');
  return onSnapshot(
    completionsCol,
    (snapshot) => {
      const items: CompletionLog[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          habitId: d.habitId,
          userId: d.userId,
          userUid: d.userUid,
          date: d.date,
          timestamp: d.timestamp,
          pointsAwarded: d.pointsAwarded,
        });
      });
      onUpdate(items);
    },
    (err) => handleFirestoreError(err, OperationType.GET, `challenges/${challengeId}/completions`)
  );
}

export function subscribeToCloudRewards(
  challengeId: string,
  onUpdate: (rewards: MilestoneReward[]) => void
): () => void {
  const rewardsCol = collection(db, 'challenges', challengeId, 'rewards');
  return onSnapshot(
    rewardsCol,
    (snapshot) => {
      const items: MilestoneReward[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          title: d.title,
          pointsRequired: d.pointsRequired,
          claimedByUser1: d.claimedByUser1 || false,
          claimedByUser2: d.claimedByUser2 || false,
          icon: d.icon,
        });
      });
      if (items.length > 0) {
        onUpdate(items);
      }
    },
    (err) => handleFirestoreError(err, OperationType.GET, `challenges/${challengeId}/rewards`)
  );
}

export async function saveCloudHabit(challengeId: string, habit: Habit): Promise<void> {
  try {
    await setDoc(doc(db, 'challenges', challengeId, 'habits', habit.id), habit);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `challenges/${challengeId}/habits/${habit.id}`);
  }
}

export async function deleteCloudHabit(challengeId: string, habitId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'challenges', challengeId, 'habits', habitId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `challenges/${challengeId}/habits/${habitId}`);
  }
}

export async function saveCloudCompletion(
  challengeId: string,
  completion: CompletionLog
): Promise<void> {
  try {
    await setDoc(doc(db, 'challenges', challengeId, 'completions', completion.id), completion);
  } catch (err) {
    handleFirestoreError(
      err,
      OperationType.CREATE,
      `challenges/${challengeId}/completions/${completion.id}`
    );
  }
}

export async function deleteCloudCompletion(
  challengeId: string,
  completionId: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, 'challenges', challengeId, 'completions', completionId));
  } catch (err) {
    handleFirestoreError(
      err,
      OperationType.DELETE,
      `challenges/${challengeId}/completions/${completionId}`
    );
  }
}

export async function updateCloudReward(
  challengeId: string,
  rewardId: string,
  update: Partial<MilestoneReward>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'challenges', challengeId, 'rewards', rewardId), update);
  } catch (err) {
    handleFirestoreError(
      err,
      OperationType.UPDATE,
      `challenges/${challengeId}/rewards/${rewardId}`
    );
  }
}

export async function updateCloudChallengeConfig(
  challengeId: string,
  config: ChallengeConfig,
  u1: UserProfile,
  u2: UserProfile
): Promise<void> {
  try {
    await updateDoc(doc(db, 'challenges', challengeId), {
      title: config.title,
      endDate: config.endDate,
      grandPrize: config.grandPrize,
      loserPenalty: config.loserPenalty,
      user1Name: u1.name,
      user1Nickname: u1.nickname,
      user1Avatar: u1.avatarEmoji,
      user1Email: u1.linkedEmail || null,
      user1Uid: u1.linkedUid || null,
      user2Name: u2.name,
      user2Nickname: u2.nickname,
      user2Avatar: u2.avatarEmoji,
      user2Email: u2.linkedEmail || null,
      user2Uid: u2.linkedUid || null,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `challenges/${challengeId}`);
  }
}
