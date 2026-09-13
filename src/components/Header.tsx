import React from 'react';
import { UserRole, Language } from '../types';
import { translations } from '../translations';
import { ShieldCheck, Sparkles, ArrowLeftRight, Search, Cpu } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  userName: string | null;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenRoleModal: () => void;
  onOpenConsumerView: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  userName,
  currentLang,
  onLanguageChange,
  onOpenRoleModal,
  onOpenConsumerView,
}) => {
  const t = translations[currentLang];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-amber-900/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Left: Brand & Team Name */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-xs border border-amber-400/40 shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z"/>
                <path d="m12 12 8-4.5"/>
                <path d="M12 12v8"/>
                <path d="m12 12-8-4.5"/>
                <circle cx="12" cy="12" r="2.5" fill="currentColor" className="text-amber-200" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  {t.appTitle}
                </h1>
                {/* Team Name badge required by guidelines */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300/80 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  {t.teamBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                {userName ? `Logged in as ${userName}` : t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right Action Controls: Bilingual Switch, Login Portal Button */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Bilingual Switch: [ EN | HI ] */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-200/80 border border-slate-300 text-xs font-semibold">
              <button
                id="header-lang-en-btn"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  currentLang === 'en'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                id="header-lang-hi-btn"
                onClick={() => onLanguageChange('hi')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  currentLang === 'hi'
                    ? 'bg-amber-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="हिंदी में बदलें"
              >
                HI
              </button>
            </div>

            {/* Login Portal Trigger Button */}
            <button
              id="header-login-portal-btn"
              onClick={onOpenRoleModal}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg font-semibold text-xs sm:text-sm bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.98] transition-all shadow-xs border border-amber-700/20 cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
              <span>Login Portal</span>
              <span className="hidden md:inline-block px-1.5 py-0.2 rounded bg-amber-700/60 text-[10px] uppercase font-bold tracking-wider">
                {currentRole === 'beekeeper' ? 'Beekeeper' : 'Collector'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
