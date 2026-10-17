import React, { useState } from 'react';
import { Gift, Award, CheckCircle2, Check, Plus, Sparkles, Heart, Crown, Coffee, Film, UtensilsCrossed, Compass } from 'lucide-react';
import { MilestoneReward, UserProfile } from '../types.ts';
import { triggerTaskConfetti } from '../utils/effects.ts';

interface PrizesAndWishesProps {
  rewards: MilestoneReward[];
  user1: UserProfile;
  user2: UserProfile;
  user1Score: number;
  user2Score: number;
  grandPrize: string;
  loserPenalty: string;
  onClaimReward: (rewardId: string, userKey: 'claimedByUser1' | 'claimedByUser2') => void;
  onAddCustomReward: (title: string, points: number) => void;
}

export const PrizesAndWishes: React.FC<PrizesAndWishesProps> = ({
  rewards,
  user1,
  user2,
  user1Score,
  user2Score,
  grandPrize,
  loserPenalty,
  onClaimReward,
  onAddCustomReward,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newPoints, setNewPoints] = useState(300);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddCustomReward(newTitle.trim(), Number(newPoints));
    setNewTitle('');
    setShowAddForm(false);
  };

  const renderRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee className="w-5 h-5 text-amber-600" />;
      case 'Film': return <Film className="w-5 h-5 text-purple-600" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-5 h-5 text-rose-600" />;
      case 'Compass': return <Compass className="w-5 h-5 text-indigo-600" />;
      case 'Crown': return <Crown className="w-5 h-5 text-amber-500" />;
      default: return <Gift className="w-5 h-5 text-pink-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Grand Challenge Bet Card */}
      <div className="bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-200">
              <Crown className="w-4 h-4 fill-amber-300" />
              Жарыстың Басты Жүлдесі & Уәдесі
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display">{grandPrize}</h3>
            {loserPenalty && (
              <p className="text-xs text-rose-100 bg-black/15 px-3 py-1.5 rounded-lg inline-block">
                Екінші орынға уәде: {loserPenalty}
              </p>
            )}
          </div>
          <div className="text-right shrink-0 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
            <span className="text-xs text-rose-100 block">Қазіргі көшбасшы:</span>
            <span className="text-base font-bold">
              {user1Score > user2Score ? `${user1.name} 👑` : user2Score > user1Score ? `${user2.name} 👑` : 'Тең нәтиже 🤝'}
            </span>
          </div>
        </div>
      </div>

      {/* Milestone Points Progression */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Ұпай деңгейлері мен романтикалық сыйлықтар
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ұпай жинаған сайын жаңа марапаттар мен тосынсыйларды ашыңыз
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Тілек қосу</span>
          </button>
        </div>

        {/* Add custom reward form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Жаңа романтикалық сыйлық / уәде</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Мысалы: Романтикалық массаж немесе пикник"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Қажетті ұпай"
                  value={newPoints}
                  min={50}
                  step={50}
                  onChange={(e) => setNewPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Бас тарту
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Сақтау
              </button>
            </div>
          </form>
        )}

        {/* Rewards list */}
        <div className="space-y-3">
          {rewards.map((reward) => {
            const u1Eligible = user1Score >= reward.pointsRequired;
            const u2Eligible = user2Score >= reward.pointsRequired;

            return (
              <div
                key={reward.id}
                className="p-4 rounded-xl border border-slate-200/70 bg-white hover:border-rose-200 transition-all shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      {renderRewardIcon(reward.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{reward.title}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          <span className="font-mono tabular-nums">{reward.pointsRequired}</span> ұпай
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {reward.pointsRequired} ұпай жинаған қатысушы сыйлықты талап ете алады
                      </p>
                    </div>
                  </div>

                  {/* Claim buttons for both users */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {/* User 1 Claim Button */}
                    <button
                      type="button"
                      disabled={!u1Eligible || reward.claimedByUser1}
                      onClick={() => {
                        triggerTaskConfetti();
                        onClaimReward(reward.id, 'claimedByUser1');
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        reward.claimedByUser1
                          ? 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200/60'
                          : u1Eligible
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                          : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      <span>{user1.avatarEmoji}</span>
                      {reward.claimedByUser1 ? (
                        <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> Алынды</span>
                      ) : u1Eligible ? (
                        <span>Алу</span>
                      ) : (
                        <span>{user1Score}/{reward.pointsRequired}</span>
                      )}
                    </button>

                    {/* User 2 Claim Button */}
                    <button
                      type="button"
                      disabled={!u2Eligible || reward.claimedByUser2}
                      onClick={() => {
                        triggerTaskConfetti();
                        onClaimReward(reward.id, 'claimedByUser2');
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        reward.claimedByUser2
                          ? 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200/60'
                          : u2Eligible
                          ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
                          : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      <span>{user2.avatarEmoji}</span>
                      {reward.claimedByUser2 ? (
                        <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> Алынды</span>
                      ) : u2Eligible ? (
                        <span>Алу</span>
                      ) : (
                        <span>{user2Score}/{reward.pointsRequired}</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Micro progress line */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-1">
                  <div>
                    <div className="flex justify-between mb-0.5">
                      <span>{user1.name} прогресі</span>
                      <span className="font-mono">{Math.min(100, Math.round((user1Score / reward.pointsRequired) * 100))}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, (user1Score / reward.pointsRequired) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-0.5">
                      <span>{user2.name} прогресі</span>
                      <span className="font-mono">{Math.min(100, Math.round((user2Score / reward.pointsRequired) * 100))}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${Math.min(100, (user2Score / reward.pointsRequired) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
