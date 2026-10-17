import React, { useState } from 'react';
import { Sparkles, Plus, Settings, Users, Heart, LogIn, LogOut, Cloud, CloudOff, Check } from 'lucide-react';
import { UserProfile, UserId, AuthUserInfo } from '../types.ts';

interface HeaderProps {
  user1: UserProfile;
  user2: UserProfile;
  activeUserId: UserId | 'both';
  onSelectUser: (userId: UserId | 'both') => void;
  activeTab: 'habits' | 'leaderboard' | 'stats' | 'rewards';
  onSelectTab: (tab: 'habits' | 'leaderboard' | 'stats' | 'rewards') => void;
  onOpenAddModal: () => void;
  onOpenSettings: () => void;
  currentUser: AuthUserInfo | null;
  onLoginGoogle: () => void;
  onLogout: () => void;
  onLinkAccountToProfile: (profileId: UserId) => void;
  isCloudSynced: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user1,
  user2,
  activeUserId,
  onSelectUser,
  activeTab,
  onSelectTab,
  onOpenAddModal,
  onOpenSettings,
  currentUser,
  onLoginGoogle,
  onLogout,
  onLinkAccountToProfile,
  isCloudSynced,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Check if current logged-in Google user is linked to user1 or user2
  const isLinkedUser1 = currentUser && user1.linkedUid === currentUser.uid;
  const isLinkedUser2 = currentUser && user2.linkedUid === currentUser.uid;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-rose-200">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 font-display flex items-center gap-1.5 whitespace-nowrap">
              Duo Challenge
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                Жұптық
              </span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
          <button
            type="button"
            onClick={() => onSelectTab('habits')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'habits'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Күнделікті чеклист
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('leaderboard')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Көшбасшылар тақтасы
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('stats')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'stats'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Статистика
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('rewards')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'rewards'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Жүлделер & Тілектер
          </button>
        </nav>

        {/* Zone 3: Actions & Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {/* User persona selector */}
          <div className="hidden sm:flex items-center bg-rose-50/80 p-1 rounded-xl border border-rose-200/60">
            <button
              type="button"
              onClick={() => onSelectUser('user1')}
              title={`${user1.name} (${user1.nickname})`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeUserId === 'user1'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{user1.avatarEmoji}</span>
              <span>{user1.name}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectUser('user2')}
              title={`${user2.name} (${user2.nickname})`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeUserId === 'user2'
                  ? 'bg-white text-rose-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-rose-900'
              }`}
            >
              <span>{user2.avatarEmoji}</span>
              <span>{user2.name}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectUser('both')}
              title="Екеуі де қатар"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                activeUserId === 'both'
                  ? 'bg-white text-purple-700 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Бірге</span>
            </button>
          </div>

          {/* Google Auth Button or User Avatar Profile Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-2xs text-xs transition-colors"
                title={currentUser.email || 'Google аккаунты'}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google Avatar'}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-[10px]">
                    {currentUser.displayName?.[0] || 'G'}
                  </div>
                )}
                <span className="hidden lg:inline text-xs font-medium text-slate-700 truncate max-w-[90px]">
                  {currentUser.displayName?.split(' ')[0] || 'Google'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Бұлтпен байланысты (Синхрондалды)" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-1 text-xs space-y-3">
                  <div className="pb-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">
                      {currentUser.displayName || 'Google қолданушысы'}
                    </p>
                    <p className="text-slate-400 text-[11px] truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                      <Cloud className="w-3 h-3" />
                      <span>Google синхрондау белсенді</span>
                    </div>
                  </div>

                  {/* Profile binding selector */}
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">
                      Бұл аккаунт кімге тиесілі?
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onLinkAccountToProfile('user1');
                          setShowUserMenu(false);
                        }}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                          isLinkedUser1
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{user1.avatarEmoji} {user1.name}</span>
                        {isLinkedUser1 && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onLinkAccountToProfile('user2');
                          setShowUserMenu(false);
                        }}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                          isLinkedUser2
                            ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{user2.avatarEmoji} {user2.name}</span>
                        {isLinkedUser2 && <Check className="w-3.5 h-3.5 text-rose-600" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold text-xs py-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Шығу</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUserMenu(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs py-1"
                    >
                      Жабу
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onLoginGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-all active:scale-95"
              title="Google аккаунтымен кіру"
            >
              {/* Google G logo SVG */}
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google-мен кіру</span>
            </button>
          )}

          {/* Quick Add Habit Trigger */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            aria-label="Тапсырма қосу"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Тапсырма</span>
          </button>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Баптаулар"
            title="Баптаулар"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
