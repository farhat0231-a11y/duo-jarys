import React, { useState, useEffect } from 'react';
import { X, Check, Dumbbell, Droplets, BookOpen, GraduationCap, Heart, Sparkles, Moon, CheckSquare, Coffee, Apple, Smile, Star } from 'lucide-react';
import { Habit, HabitCategory, UserId } from '../types.ts';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt'>, existingId?: string) => void;
  habitToEdit?: Habit | null;
  user1Name: string;
  user2Name: string;
}

const AVAILABLE_ICONS = [
  'Dumbbell', 'Droplets', 'BookOpen', 'GraduationCap',
  'Heart', 'Sparkles', 'Moon', 'CheckSquare',
  'Coffee', 'Apple', 'Smile', 'Star'
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  habitToEdit,
  user1Name,
  user2Name,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(15);
  const [category, setCategory] = useState<HabitCategory>('health');
  const [targetUser, setTargetUser] = useState<'both' | UserId>('both');
  const [icon, setIcon] = useState('Dumbbell');

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setDescription(habitToEdit.description || '');
      setPoints(habitToEdit.points);
      setCategory(habitToEdit.category);
      setTargetUser(habitToEdit.targetUser);
      setIcon(habitToEdit.icon);
    } else {
      setTitle('');
      setDescription('');
      setPoints(15);
      setCategory('health');
      setTargetUser('both');
      setIcon('Dumbbell');
    }
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        points: Number(points),
        category,
        targetUser,
        icon,
      },
      habitToEdit ? habitToEdit.id : undefined
    );
    onClose();
  };

  const POINT_OPTIONS = [5, 10, 15, 20, 25, 30, 50];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 font-display">
            {habitToEdit ? 'Тапсырманы өңдеу' : 'Жаңа әдет немесе тапсырма қосу'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Тапсырма немесе әдет атауы *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Мысалы: Таңғы жаттығу немесе 20 бет кітап"
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Қосымша түсініктеме (міндетті емес)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Толық сипаттама немесе ережесі"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Points */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Тапсырма ұпайы (+балл)
            </label>
            <div className="flex flex-wrap gap-2">
              {POINT_OPTIONS.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setPoints(pt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                    points === pt
                      ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  +{pt}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Санаты
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'health', label: 'Денсаулық & Спорт' },
                { key: 'learning', label: 'Даму & Оқу' },
                { key: 'romance', label: 'Махаббат & Қамқорлық' },
                { key: 'lifestyle', label: 'Өмір салты' },
              ].map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key as HabitCategory)}
                  className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                    category === c.key
                      ? 'bg-rose-50 border-rose-400 text-rose-800 font-bold ring-1 ring-rose-200'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target user */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Кімге арналған?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetUser('both')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  targetUser === 'both'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Екеумізге де
              </button>
              <button
                type="button"
                onClick={() => setTargetUser('user1')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  targetUser === 'user1'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {user1Name} үшін
              </button>
              <button
                type="button"
                onClick={() => setTargetUser('user2')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  targetUser === 'user2'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {user2Name} үшін
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Бас тарту
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all"
            >
              {habitToEdit ? 'Өзгерісті сақтау' : 'Тапсырманы қосу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
