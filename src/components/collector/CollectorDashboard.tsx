import React, { useState } from 'react';
import {
  IntakeLedgerEntry,
  BeekeeperCrate,
  MelissopalynologyResult,
  LabCertificate,
  MasterJarBatch,
  Language,
} from '../../types';
import { translations } from '../../translations';
import { IntakeLedger } from './IntakeLedger';
import { MicroscopeAnalyzer } from './MicroscopeAnalyzer';
import { LabCertificateUploader } from './LabCertificateUploader';
import { MasterJarMintingSuite } from './MasterJarMintingSuite';
import { CollectionAddressModal } from './CollectionAddressModal';
import { Building2, Shield, Sparkles, CheckCircle2, ArrowRight, Navigation, MapPin, Radio, AlertOctagon, X, Edit3, Lock } from 'lucide-react';

interface CollectorDashboardProps {
  currentLang: Language;
  intakeRecords: IntakeLedgerEntry[];
  onAddIntakeRecord: (record: IntakeLedgerEntry) => void;
  availableCrates: BeekeeperCrate[];
  certificates: LabCertificate[];
  onAddCertificate: (cert: LabCertificate) => void;
  masterBatches: MasterJarBatch[];
  onAddMasterBatch: (batch: MasterJarBatch) => void;
  onOpenConsumerView: (batch: MasterJarBatch) => void;
  onUpdateBatchStatus: (batchId: string, status: 'Passed' | 'Rejected', purity?: number) => void;
  collectionCentreGps?: string;
  collectionCentreAddress?: string;
  onUpdateCollectionCentre?: (newGps: string, newAddress: string) => void;
}

export const CollectorDashboard: React.FC<CollectorDashboardProps> = ({
  currentLang,
  intakeRecords,
  onAddIntakeRecord,
  availableCrates,
  certificates,
  onAddCertificate,
  masterBatches,
  onAddMasterBatch,
  onOpenConsumerView,
  onUpdateBatchStatus,
  collectionCentreGps = '27.2152° N, 77.4920° E',
  collectionCentreAddress = 'KVIC Regional Quality Hub #08, Main Mandi Road, Bharatpur, Rajasthan - 321001',
  onUpdateCollectionCentre,
}) => {
  const t = translations[currentLang];
  const [activeAnalysisTarget, setActiveAnalysisTarget] = useState<string>('sample1');
  const [activeTargetBatchId, setActiveTargetBatchId] = useState<string>(
    intakeRecords.length > 0 ? intakeRecords[0].id : ''
  );
  const [notification, setNotification] = useState<string | null>(null);

  // Collection Centre GPS & Modal Prompt State
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [pendingGps, setPendingGps] = useState<string>(collectionCentreGps);
  const [gpsSourceLabel, setGpsSourceLabel] = useState<string>('Verified Quality Hub');

  // Batch Approval State & Floating Badge
  const [approvedBadge, setApprovedBadge] = useState<{
    batchId: string;
    status: 'Passed' | 'Rejected';
    purity: number;
  } | null>(null);
  const [targetApprovedBatchId, setTargetApprovedBatchId] = useState<string | undefined>(undefined);
  
  // Centralized Unlocked Stage State
  const [unlockedStage, setUnlockedStage] = useState<number>(1);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAutoDetectGps = () => {
    setIsDetectingGps(true);
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const latFormatted = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
          const lngFormatted = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
          const coords = `${latFormatted}, ${lngFormatted}`;
          setIsDetectingGps(false);
          setPendingGps(coords);
          // Immediately trigger in-app prompt modal pre-filled with auto-detected location
          setIsAddressModalOpen(true);
        },
        (err) => {
          console.warn('Device geolocation unavailable or denied, opening confirmation modal with current coords:', err);
          setIsDetectingGps(false);
          setPendingGps(collectionCentreGps);
          setIsAddressModalOpen(true);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsDetectingGps(false);
      setPendingGps(collectionCentreGps);
      setIsAddressModalOpen(true);
    }
  };

  const handleSaveCollectionAddress = (newGps: string, newAddress: string) => {
    if (onUpdateCollectionCentre) {
      onUpdateCollectionCentre(newGps, newAddress);
    }
    setPendingGps(newGps);
    setGpsSourceLabel('Custom Address Confirmed');
    showNotification(`Collection Centre Address Saved & Applied Globally: ${newAddress}`);
  };

  const handleApproveBatch = (result: MelissopalynologyResult) => {
    const targetId = activeTargetBatchId || (intakeRecords.length > 0 ? intakeRecords[0].id : 'INTK-2026-0491');
    setApprovedBadge({
      batchId: targetId,
      status: 'Passed',
      purity: result.purityScore,
    });
    setTargetApprovedBatchId(targetId);
    showNotification(`Batch #${targetId} Approved for Minting! (Purity ${result.purityScore}%)`);
    onUpdateBatchStatus(targetId, 'Passed', result.purityScore);
    
    if (unlockedStage < 3) setUnlockedStage(3);
  };

  const handleRejectBatch = (result: MelissopalynologyResult) => {
    const targetId = activeTargetBatchId || (intakeRecords.length > 0 ? intakeRecords[0].id : 'INTK-2026-0491');
    setApprovedBadge({
      batchId: targetId,
      status: 'Rejected',
      purity: result.purityScore,
    });
    setTargetApprovedBatchId(targetId);
    showNotification(`Batch #${targetId} Quarantined: Adulteration Risk Flagged`);
    onUpdateBatchStatus(targetId, 'Rejected', result.purityScore);
  };

  const handleSelectForAnalysis = (record: IntakeLedgerEntry) => {
    // When user clicks Send to Microscope from intake row
    setActiveTargetBatchId(record.id);
    setActiveAnalysisTarget('sample1');
    showNotification(`Loaded ${record.crateBatchId} for microscopic examination.`);
    const el = document.getElementById('microscope-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddIntakeRecord = (record: IntakeLedgerEntry) => {
      onAddIntakeRecord(record);
      if (unlockedStage < 2) setUnlockedStage(2);
  };

  const handleAddCertificate = (cert: LabCertificate) => {
      onAddCertificate(cert);
      if (unlockedStage < 4) setUnlockedStage(4);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Collection Centre Identification */}
      <div className="bg-gradient-to-r from-amber-700/10 via-amber-100/40 to-transparent border border-amber-300/60 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            <Building2 className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                {t.collectorPortal}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                <Shield className="w-3 h-3 text-emerald-600" /> NABL Accredited Node
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
              KVIC Regional Honey Collection & Quality Centre #08
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Bharatpur Division • Rajasthan State Khadi & Village Industries Board
            </p>
          </div>
        </div>

        {/* GPS Detection Bar & Quick Workflow Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Collection Centre Auto-GPS Tracking Badge & Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 bg-white border border-amber-300 rounded-xl p-2 sm:px-3 sm:py-2 shadow-2xs">
            <div className="flex items-start gap-2">
              <span className="relative flex h-2.5 w-2.5 shrink-0 mt-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="text-left leading-tight">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">
                    Centre GPS:
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 tracking-tight">
                    {collectionCentreGps}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {gpsSourceLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[11px] text-amber-900 font-semibold flex items-center gap-1 max-w-xs sm:max-w-md truncate" title={collectionCentreAddress}>
                    <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                    <span>{collectionCentreAddress}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingGps(collectionCentreGps);
                      setIsAddressModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 hover:text-black bg-amber-200/80 hover:bg-amber-300 px-1.5 py-0.5 rounded border border-amber-400 transition-colors cursor-pointer shrink-0"
                    title="Edit Collection Centre address manually"
                  >
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              id="auto-detect-collection-centre-gps-btn"
              type="button"
              onClick={handleAutoDetectGps}
              disabled={isDetectingGps}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] transition-all px-3 py-1.5 rounded-lg shadow-2xs disabled:opacity-50 cursor-pointer shrink-0"
              title="Detect real-time device coordinates and open Address Confirmation modal"
            >
              <Navigation className={`w-3.5 h-3.5 text-slate-950 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>
                {isDetectingGps
                  ? (currentLang === 'hi' ? 'खोज रहा है...' : 'Detecting...')
                  : (currentLang === 'hi' ? 'जीपीएस स्वतः पहचानें' : 'Auto-Detect Collection Centre GPS')}
              </span>
            </button>
          </div>

          {/* Quick Workflow Navigation Bar */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span className="px-2 py-1 rounded-md bg-white border border-slate-200 shadow-2xs">1. Intake</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="px-2 py-1 rounded-md bg-amber-100 border border-amber-300 text-amber-900">2. Pollen AI</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="px-2 py-1 rounded-md bg-white border border-slate-200 shadow-2xs">3. IPFS</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="px-2 py-1 rounded-md bg-white border border-slate-200 shadow-2xs">4. Mint</span>
          </div>
        </div>
      </div>

      {/* Floating Batch Approval Confirmation Badge */}
      {approvedBadge && (
        <div
          id="batch-approval-floating-badge"
          className="fixed bottom-6 right-6 z-40 max-w-md bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border-2 border-emerald-500/80 flex items-center justify-between gap-3.5 animate-in slide-in-from-bottom-5"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                approvedBadge.status === 'Passed'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              {approvedBadge.status === 'Passed' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertOctagon className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider ${
                    approvedBadge.status === 'Passed' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {approvedBadge.status === 'Passed'
                    ? 'Purity Verified (Grade A)'
                    : 'Adulteration Flagged'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {approvedBadge.purity}% Match
                </span>
              </div>
              <p className="text-sm font-extrabold text-white">
                Batch #{approvedBadge.batchId} {approvedBadge.status === 'Passed' ? 'Approved for Minting' : 'Quarantined'}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {approvedBadge.status === 'Passed'
                  ? 'Status synced to Master Jar QR Generator dropdown.'
                  : 'Adulteration flagged. Batch restricted from minting.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {approvedBadge.status === 'Passed' && (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('master-jar-minting-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors cursor-pointer"
              >
                Mint Jar ↓
              </button>
            )}
            <button
              type="button"
              onClick={() => setApprovedBadge(null)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg border border-amber-400/40 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* 1. Raw Honey Intake Ledger */}
      <IntakeLedger
        currentLang={currentLang}
        intakeRecords={intakeRecords}
        onAddIntakeRecord={handleAddIntakeRecord}
        availableCrates={availableCrates}
        onSelectForAnalysis={handleSelectForAnalysis}
        collectionCentreGps={collectionCentreGps}
        collectionCentreAddress={collectionCentreAddress}
      />

      {/* 2. AI USB Microscope Pollen Analyzer (Melissopalynology Module) */}
      <div id="microscope-section" className="relative">
        {unlockedStage < 2 && (
          <div className="absolute inset-0 z-10 bg-slate-50/80 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-lg text-xs font-bold text-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4"/> Complete Stage 1 to unlock
            </div>
          </div>
        )}
        <MicroscopeAnalyzer
          currentLang={currentLang}
          onApproveBatch={handleApproveBatch}
          onRejectBatch={handleRejectBatch}
          initialSampleKey={activeAnalysisTarget}
        />
      </div>

      {/* 3. Lab Certificate Uploader (IPFS Cryptographic Preview) */}
      <div className="relative">
        {unlockedStage < 3 && (
          <div className="absolute inset-0 z-10 bg-slate-50/80 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-lg text-xs font-bold text-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4"/> Complete Stage 2 to unlock
            </div>
          </div>
        )}
        <LabCertificateUploader
          currentLang={currentLang}
          certificates={certificates}
          onAddCertificate={handleAddCertificate}
        />
      </div>

      {/* 4. Master Jar QR Generator & Blockchain Minting Suite */}
      <div id="master-jar-minting-section" className="relative">
        {unlockedStage < 4 && (
          <div className="absolute inset-0 z-10 bg-slate-50/80 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-lg text-xs font-bold text-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4"/> Stage 4 Locked — Complete Stage 3 (Pin Lab Certificate to IPFS) to unlock Blockchain Minting & QR Generation.
            </div>
          </div>
        )}
        <MasterJarMintingSuite
          currentLang={currentLang}
          intakeBatches={intakeRecords}
          masterBatches={masterBatches}
          certificates={certificates}
          onAddMasterBatch={onAddMasterBatch}
          onOpenConsumerView={onOpenConsumerView}
          collectionCentreGps={collectionCentreGps}
          collectionCentreAddress={collectionCentreAddress}
          targetApprovedBatchId={targetApprovedBatchId}
        />
      </div>

      {/* 5. Manual / Auto-Detect Collection Centre Location & Address Modal */}
      <CollectionAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        currentGps={pendingGps || collectionCentreGps}
        currentAddress={collectionCentreAddress}
        onSave={handleSaveCollectionAddress}
        currentLang={currentLang}
      />
    </div>
  );
};
