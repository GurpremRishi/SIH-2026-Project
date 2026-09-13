import React from 'react';
import { HiveTelemetry, BeekeeperCrate, Language } from '../../types';
import { translations } from '../../translations';
import { ActiveHiveTelemetry } from './ActiveHiveTelemetry';
import { CrateQrGenerator } from './CrateQrGenerator';
import { MadhuMitraAssistant } from './MadhuMitraAssistant';
import { Shield, Sparkles, MapPin } from 'lucide-react';

interface BeekeeperDashboardProps {
  telemetry: HiveTelemetry;
  currentLang: Language;
  savedCrates: BeekeeperCrate[];
  onAddCrate: (crate: BeekeeperCrate) => void;
  onRefreshTelemetry: () => void;
}

export const BeekeeperDashboard: React.FC<BeekeeperDashboardProps> = ({
  telemetry,
  currentLang,
  savedCrates,
  onAddCrate,
  onRefreshTelemetry,
}) => {
  const t = translations[currentLang];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Beekeeper Identification */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/50 to-transparent border border-amber-300/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            🐝
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                {t.beekeeperPortal}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                <Shield className="w-3 h-3 text-emerald-600" /> KVIC Beneficiary #8842
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
              Rameshwar Singh Meena (रामेश्वर सिंह)
            </h2>
            <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-amber-700" />
              Apiary Cluster #14 • Kumher, Bharatpur (Rajasthan Mustard Belt)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">
              Assigned Apiary Node
            </span>
            <span className="text-xs font-mono font-bold text-slate-800">
              ID: H-001 (Mustard Zone)
            </span>
          </div>
        </div>
      </div>

      {/* 1. Active Hive Telemetry Cards */}
      <ActiveHiveTelemetry
        telemetry={telemetry}
        currentLang={currentLang}
        onRefreshTelemetry={onRefreshTelemetry}
      />

      {/* 2. Beekeeper Crate QR Generator */}
      <CrateQrGenerator
        currentLang={currentLang}
        savedCrates={savedCrates}
        onAddCrate={onAddCrate}
      />

      {/* 3. Persistent AI Beekeeping Assistant (Floating Drawer) */}
      <MadhuMitraAssistant currentLang={currentLang} />
    </div>
  );
};
