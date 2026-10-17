import React, { useState } from 'react';
import {
  Check,
  Plus,
  Flame,
  Dumbbell,
  Droplets,
  BookOpen,
  GraduationCap,
  Heart,
  Sparkles,
  Moon,
  CheckSquare,
  Zap,
  Coffee,
  Apple,
  Smile,
  Star,
  Calendar,
  Trash2,
  Edit2,
  Users,
} from 'lucide-react';
import { CompletionLog, Habit, HabitCategory, UserId, UserProfile } from '../types.ts';
import { isHabitCompleted } from '../utils/scoring.ts';
import { formatDateKazakh, getTodayDateString } from '../utils/dateUtils.ts';
import { triggerTaskConfetti } from '../utils/effects.ts';

interface HabitListProps {
  habits: Habit[];
  completions: CompletionLog[];
  user1: UserProfile;
  user2: UserProfile;
  activeUserId: UserId | 'both';
  onToggleCompletion: (habitId: string, userId: UserId, dateStr: string) => void;
  onOpenAddModal: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  completions,
  user1,
  user2,
  activeUserId,
  onToggleCompletion,
  onOpenAddModal,
  onEditHabit,
  onDeleteHabit,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [categoryFilter, setCategoryFilter] = useState<HabitCategory | 'all'>('all');

  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  const categories: { key: HabitCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'Барлығы' },
    { key: 'health', label: 'Денсаулық' },
    { key: 'learning', label: 'Даму & Оқу' },
    { key: 'romance', label: 'Махаббат' },
    { key: 'lifestyle', label: 'Өмір салты' },
  ];

  // Filter habits
  const filteredHabits = habits.filter(h => {
    if (categoryFilter !== 'all' && h.category !== categoryFilter) return false;
    if (activeUserId !== 'both') {
      if (h.targetUser !== 'both' && h.targetUser !== activeUserId) return false;
    }
    return true;
  });

  // Calculate today's completed count for active user(s)
  const user1DoneCount = habits.filter(h => isHabitCompleted(completions, h.id, 'user1', selectedDate)).length;
  const user2DoneCount = habits.filter(h => isHabitCompleted(completions, h.id, 'user2', selectedDate)).length;

  const renderIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5' };
    switch (iconName) {
      case 'Dumbbell': return <Dumbbell {...props} />;
      case 'Droplets': return <Droplets {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      case 'GraduationCap': return <GraduationCap {...props} />;
      case 'Heart': return <Heart {...props} />;
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Moon': return <Moon {...props} />;
      case 'CheckSquare': return <CheckSquare {...props} />;
      case 'Coffee': return <Coffee {...props} />;
      case 'Apple': return <Apple {...props} />;
      case 'Smile': return <Smile {...props} />;
      case 'Star': return <Star {...props} />;
      default: return <Zap {...props} />;
    }
  };

  const getCategoryColor = (category: HabitCategory) => {
    switch (category) {
      case 'health': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'learning': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'romance': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'lifestyle': return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const handleToggle = (e: React.MouseEvent, habitId: string, userId: UserId) => {
    const wasCompleted = isHabitCompleted(completions, habitId, userId, selectedDate);
    if (!wasCompleted) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      triggerTaskConfetti(x, y);
    }
    onToggleCompletion(habitId, userId, selectedDate);
  };

  return (
    <div className="space-y-5">
      {/* Date Bar & Overview */}
      <div className="bg-white rounded-2xl border border-rose-100/80 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {isToday ? 'Бүгінгі тапсырмалар' : formatDateKazakh(selectedDate)}
              </h2>
              {isToday && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                  Бүгін
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Тапсырманы орындап, бірден жарыс ұпайын қосыңыз
            </p>
          </div>
        </div>

        {/* Date Selector and Quick Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isToday
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Бүгін
          </button>
          <input
            type="date"
            aria-label="Күнді таңдау"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />

          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Жаңа әдет қосу</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setCategoryFilter(cat.key)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              categoryFilter === cat.key
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-200'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Completion summary badges */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200/70 shadow-2xs">
          <span>{user1.avatarEmoji}</span>
          <span className="font-semibold text-slate-900">{user1.name}:</span>
          <span className="font-mono tabular-nums font-bold text-indigo-600">
            {user1DoneCount}/{habits.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200/70 shadow-2xs">
          <span>{user2.avatarEmoji}</span>
          <span className="font-semibold text-slate-900">{user2.name}:</span>
          <span className="font-mono tabular-nums font-bold text-rose-600">
            {user2DoneCount}/{habits.length}
          </span>
        </div>
      </div>

      {/* Habit Cards List */}
      {filteredHabits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-xl">
            ✨
          </div>
          <h3 className="text-base font-semibold text-slate-900">Бұл санатта тапсырма жоқ</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Өзіңізге немесе сүйіктіңізге жаңа күнделікті мақсат немесе әдет қосыңыз!
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Тапсырма қосу
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((habit) => {
            const isU1Done = isHabitCompleted(completions, habit.id, 'user1', selectedDate);
            const isU2Done = isHabitCompleted(completions, habit.id, 'user2', selectedDate);

            return (
              <div
                key={habit.id}
                className="group bg-white rounded-2xl border border-slate-200/80 hover:border-rose-200 p-4 transition-all shadow-2xs hover:shadow-sm"
              >
                <div className="flex items-start sm:items-center justify-between gap-4">
                  {/* Left: Icon & Title */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${getCategoryColor(
                        habit.category
                      )}`}
                    >
                      {renderIcon(habit.icon)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          {habit.title}
                        </h4>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                          <span className="font-mono tabular-nums">+{habit.points}</span> ұпай
                        </span>
                      </div>
                      {habit.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Completion Controls & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* If Active User is User 1 */}
                    {(activeUserId === 'user1' || activeUserId === 'both') && (
                      <button
                        type="button"
                        onClick={(e) => handleToggle(e, habit.id, 'user1')}
                        title={`${user1.name} үшін белгілеу`}
                        aria-label={`${user1.name}: ${habit.title} орындалды ма?`}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                          isU1Done
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-200'
                            : 'bg-indigo-50/60 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                        }`}
                      >
                        <span className="text-sm">{user1.avatarEmoji}</span>
                        {isU1Done ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <span className="hidden sm:inline">Орындау</span>
                        )}
                      </button>
                    )}

                    {/* If Active User is User 2 */}
                    {(activeUserId === 'user2' || activeUserId === 'both') && (
                      <button
                        type="button"
                        onClick={(e) => handleToggle(e, habit.id, 'user2')}
                        title={`${user2.name} үшін белгілеу`}
                        aria-label={`${user2.name}: ${habit.title} орындалды ма?`}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                          isU2Done
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-200'
                            : 'bg-rose-50/60 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <span className="text-sm">{user2.avatarEmoji}</span>
                        {isU2Done ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <span className="hidden sm:inline">Орындау</span>
                        )}
                      </button>
                    )}

                    {/* Edit / Delete triggers */}
                    <div className="hidden sm:flex items-center gap-1 text-slate-400 group-hover:text-slate-600">
                      <button
                        type="button"
                        onClick={() => onEditHabit(habit)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        title="Тапсырманы өңдеу"
                        aria-label="Өңдеу"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteHabit(habit.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Тапсырманы өшіру"
                        aria-label="Өшіру"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
