import React, { useState, useEffect } from 'react';
import { HiveTelemetry, Language } from '../../types';
import { translations } from '../../translations';
import { Activity, Thermometer, Droplets, Scale, Radio, Sun, Box, Sparkles, RefreshCw } from 'lucide-react';

interface ActiveHiveTelemetryProps {
  telemetry: HiveTelemetry;
  currentLang: Language;
  onRefreshTelemetry?: () => void;
}

export const ActiveHiveTelemetry: React.FC<ActiveHiveTelemetryProps> = ({
  telemetry,
  currentLang,
  onRefreshTelemetry,
}) => {
  const t = translations[currentLang];
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-amber-900/15 shadow-sm">
      {/* Header of Telemetry Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-amber-900/10">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <span className={`w-2 h-2 rounded-full bg-emerald-500 ${pulse ? 'opacity-100 scale-110' : 'opacity-60 scale-90'} transition-all`} />
              Hive {telemetry.hiveId}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {telemetry.locationName}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1.5 flex items-center gap-2">
            {t.activeHiveTitle}
            <span className="text-xs sm:text-sm font-medium text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
              {telemetry.zone}
            </span>
          </h2>
        </div>

        {/* Live sync & Solar battery status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-slate-200">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.solarStatus}</span>
          </div>
          {onRefreshTelemetry && (
            <button
              id="refresh-telemetry-btn"
              onClick={onRefreshTelemetry}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-800 hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-200 cursor-pointer"
              title={t.pollLatestPacket}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 6 Live Telemetry Cards:
          1. Health Score (92/100)
          2. Internal Temp (34.2°C)
          3. Core Humidity (62%)
          4. Gross Weight (41.8 kg)
          5. Resonance (245 Hz)
          6. Total Active Beehive Crates (12 Active Crates / Hives Connected)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4 mt-5">
        {/* 1. Health Score */}
        <div className="bg-[#FAF8F5] border border-amber-200/80 rounded-xl p-4 flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.healthScore}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {telemetry.healthScore}
              </span>
              <span className="text-sm font-bold text-slate-500">/100</span>
            </div>
            {/* Visual health bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${telemetry.healthScore}%` }}
              />
            </div>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="truncate">{t.optimalRange} • {telemetry.queenStatus}</span>
          </div>
        </div>

        {/* 2. Internal Temp */}
        <div className="bg-[#FAF8F5] border border-amber-200/80 rounded-xl p-4 flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.internalTemp}
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {telemetry.internalTemp.toFixed(1)}
              </span>
              <span className="text-base font-bold text-amber-800">°C</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden relative">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: '68%' }}
              />
            </div>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-amber-800 truncate">
            {t.broodTarget}
          </div>
        </div>

        {/* 3. Core Humidity */}
        <div className="bg-[#FAF8F5] border border-amber-200/80 rounded-xl p-4 flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.coreHumidity}
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {telemetry.coreHumidity}
              </span>
              <span className="text-base font-bold text-blue-800">%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${telemetry.coreHumidity}%` }}
              />
            </div>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-blue-700 truncate">
            {t.preventFermentation}
          </div>
        </div>

        {/* 4. Gross Weight */}
        <div className="bg-[#FAF8F5] border border-amber-200/80 rounded-xl p-4 flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.grossWeight}
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {telemetry.grossWeight.toFixed(1)}
              </span>
              <span className="text-base font-bold text-orange-800">kg</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: '74%' }}
              />
            </div>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-orange-700 truncate">
            {t.nectarGain}
          </div>
        </div>

        {/* 5. Resonance */}
        <div className="bg-[#FAF8F5] border border-amber-200/80 rounded-xl p-4 flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.resonance}
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {telemetry.resonance}
              </span>
              <span className="text-base font-bold text-purple-800">Hz</span>
            </div>
            {/* Visual acoustic waveform */}
            <div className="flex items-center gap-0.5 h-2 mt-2">
              <span className="w-1 bg-purple-400 rounded-full h-1 animate-pulse" />
              <span className="w-1 bg-purple-600 rounded-full h-2" />
              <span className="w-1 bg-purple-500 rounded-full h-1.5" />
              <span className="w-1 bg-purple-700 rounded-full h-2 animate-pulse" />
              <span className="w-1 bg-purple-500 rounded-full h-1" />
              <span className="w-1 bg-purple-600 rounded-full h-1.8" />
              <span className="w-1 bg-purple-400 rounded-full h-1" />
            </div>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-purple-700 truncate">
            {t.calmBees} • {t.noSwarmThreat}
          </div>
        </div>

        {/* 6. Total Active Beehive Crates (Requirement 2) */}
        <div className="bg-[#FAF8F5] border border-amber-300 rounded-xl p-4 flex flex-col justify-between hover:shadow-xs transition-shadow relative overflow-hidden">
          <div className="absolute -right-2 -bottom-2 w-14 h-14 bg-amber-200/30 rounded-full pointer-events-none" />
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              {t.activeBeehiveCrates}
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-amber-950 tracking-tight">
                {telemetry.activeCratesCount || 12}
              </span>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                {currentLang === 'hi' ? 'बक्से' : 'Crates'}
              </span>
            </div>
            {/* Visual active progress */}
            <div className="w-full h-2 bg-amber-100 rounded-full mt-2 overflow-hidden border border-amber-200">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-amber-900 truncate">
            {t.activeCratesCountLabel}
          </div>
        </div>
      </div>
    </div>
  );
};
