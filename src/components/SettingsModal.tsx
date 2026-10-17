import React, { useState } from 'react';
import { X, Save, RotateCcw, Download, Upload, User, Heart, Calendar, Award } from 'lucide-react';
import { AppState, ChallengeConfig, UserProfile } from '../types.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onUpdateState: (newState: AppState) => void;
  onReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  appState,
  onUpdateState,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'challenge' | 'data'>('profiles');

  const [u1, setU1] = useState<UserProfile>(appState.user1);
  const [u2, setU2] = useState<UserProfile>(appState.user2);
  const [challenge, setChallenge] = useState<ChallengeConfig>(appState.challenge);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateState({
      ...appState,
      user1: u1,
      user2: u2,
      challenge: challenge,
    });
    onClose();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `duo_challenge_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.user1 && parsed.user2 && parsed.habits) {
          onUpdateState(parsed);
          alert('Деректер сәтті жүктелді!');
          onClose();
        } else {
          alert('Файл форматы дұрыс емес');
        }
      } catch (err) {
        alert('Файлды оқу мүмкін болмады');
      }
    };
    reader.readAsText(file);
  };

  const EMOJI_OPTIONS = ['🦁', '🌸', '👑', '✨', '🦊', '🐱', '🚀', '💖', '⭐', '🐻', '🐼', '🦄'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 font-display">
            Баптаулар & Профильдер
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl my-4">
          <button
            type="button"
            onClick={() => setActiveTab('profiles')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'profiles'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Екі профиль
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('challenge')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'challenge'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Жарыс & Таймер
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'data'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Деректер & Қалпына келтіру
          </button>
        </div>

        {/* Tab 1: Profiles */}
        {activeTab === 'profiles' && (
          <div className="space-y-6">
            {/* User 1 */}
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <User className="w-4 h-4" />
                <span>1-пайдаланушы (Мен)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Аты</label>
                  <input
                    type="text"
                    value={u1.name}
                    onChange={(e) => setU1({ ...u1, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Лақап аты (Nickname)</label>
                  <input
                    type="text"
                    value={u1.nickname}
                    onChange={(e) => setU1({ ...u1, nickname: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Аватар эмодзи</label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setU1({ ...u1, avatarEmoji: em })}
                      className={`text-lg p-1 rounded-md border ${u1.avatarEmoji === em ? 'bg-indigo-100 border-indigo-400' : 'bg-white border-slate-200'}`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* User 2 */}
            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>2-пайдаланушы (Қызым)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Аты</label>
                  <input
                    type="text"
                    value={u2.name}
                    onChange={(e) => setU2({ ...u2, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Лақап аты (Nickname)</label>
                  <input
                    type="text"
                    value={u2.nickname}
                    onChange={(e) => setU2({ ...u2, nickname: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Аватар эмодзи</label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setU2({ ...u2, avatarEmoji: em })}
                      className={`text-lg p-1 rounded-md border ${u2.avatarEmoji === em ? 'bg-rose-100 border-rose-400' : 'bg-white border-slate-200'}`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Challenge Settings */}
        {activeTab === 'challenge' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Жарыс тақырыбы
              </label>
              <input
                type="text"
                value={challenge.title}
                onChange={(e) => setChallenge({ ...challenge, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Жарыстың аяқталу уақыты (Таймер дедлайны)
              </label>
              <input
                type="datetime-local"
                value={challenge.endDate.slice(0, 16)}
                onChange={(e) => setChallenge({ ...challenge, endDate: new Date(e.target.value).toISOString() })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Басты жеңімпаз сыйлығы (Grand Prize)
              </label>
              <input
                type="text"
                value={challenge.grandPrize}
                onChange={(e) => setChallenge({ ...challenge, grandPrize: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Екінші орынға уәде немесе шарт (Penalty)
              </label>
              <input
                type="text"
                value={challenge.loserPenalty}
                onChange={(e) => setChallenge({ ...challenge, loserPenalty: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Data Management */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Резервтік көшірме & Экспорт</h4>
              <p className="text-xs text-slate-500">
                Деректеріңіз автоматты түрде браузердің LocalStorage жадында сақталады. Сондай-ақ файл ретінде сақтап алуға болады:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  JSON Экспорттау
                </button>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  JSON Жүктеу
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
              <h4 className="text-xs font-bold text-rose-900">Бастапқы қалпына келтіру</h4>
              <p className="text-xs text-rose-700">
                Барлық өзгерістерді тазартып, демо-деректерді қайта орнату:
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Шынымен барлық деректерді бастапқы қалпына келтіргіңіз келе ме?')) {
                    onReset();
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Қайта орнату (Reset)
              </button>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-5 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
          >
            Жабу
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Өзгерістерді сақтау
          </button>
        </div>
      </div>
    </div>
  );
};
