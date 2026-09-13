import React from 'react';
import { UserRole, Language } from '../types';
import { translations } from '../translations';
import { X, CheckCircle2, Sprout, Building2, Radio, QrCode, Cpu, ShieldCheck } from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  currentLang: Language;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  currentLang,
}) => {
  if (!isOpen) return null;

  const t = translations[currentLang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-[#FAF8F5] border border-amber-900/20 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-900/10">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-amber-700">
              KVIC Honey Mission Ecosystem
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {t.roleSwitcherBtn}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles List */}
        <div className="mt-5 space-y-3.5">
          {/* Role 1 Card */}
          <button
            id="role-select-beekeeper-btn"
            onClick={() => {
              onSelectRole('beekeeper');
              onClose();
            }}
            className={`w-full text-left p-4.5 rounded-xl border-2 transition-all flex items-start gap-4 ${
              currentRole === 'beekeeper'
                ? 'bg-amber-50/80 border-amber-500 shadow-sm ring-1 ring-amber-400'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Sprout className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded bg-amber-200/80 text-amber-900">
                    Role 1
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">
                    {t.roleBeekeeperTitle}
                  </h3>
                </div>
                {currentRole === 'beekeeper' && (
                  <CheckCircle2 className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {t.roleBeekeeperDesc}
              </p>
              <div className="flex flex-wrap gap-2 mt-2.5">
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
                  <Radio className="w-3 h-3 text-emerald-600" /> Hive H-001 IoT
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
                  <QrCode className="w-3 h-3 text-amber-600" /> Crate QR Code
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
                  <Cpu className="w-3 h-3 text-indigo-600" /> Madhu-Mitra AI
                </span>
              </div>
            </div>
          </button>

          {/* Role 2 Card */}
          <button
            id="role-select-collector-btn"
            onClick={() => {
              onSelectRole('collector');
              onClose();
            }}
            className={`w-full text-left p-4.5 rounded-xl border-2 transition-all flex items-start gap-4 ${
              currentRole === 'collector'
                ? 'bg-amber-50/80 border-amber-500 shadow-sm ring-1 ring-amber-400'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded bg-slate-200 text-slate-800">
                    Role 2
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">
                    {t.roleCollectorTitle}
                  </h3>
                </div>
                {currentRole === 'collector' && (
                  <CheckCircle2 className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {t.roleCollectorDesc}
              </p>
              <div className="flex flex-wrap gap-2 mt-2.5">
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
                  Intake Ledger & DBT
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
                  AI Melissopalynology
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3 text-blue-600" /> Polygon Smart Contract
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-amber-900/10 flex justify-end">
          <button
            id="role-switcher-close-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
