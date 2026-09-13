import React, { useState, useEffect } from 'react';
import { MasterJarBatch, Language, LabCertificate } from '../types';
import { translations } from '../translations';
import { LabReportPreviewModal } from './LabReportPreviewModal';
import {
  X,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  Smartphone,
  Sparkles,
  Award,
  Layers,
  FlaskConical,
  Building2,
  Calendar,
  Scale,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ConsumerProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: MasterJarBatch | null;
  labCertificates: LabCertificate[];
  currentLang: Language;
  collectionCentreAddress?: string;
  collectionCentreGps?: string;
}

export const ConsumerProvenanceModal: React.FC<ConsumerProvenanceModalProps> = ({
  isOpen,
  onClose,
  batch,
  labCertificates,
  currentLang,
  collectionCentreAddress,
  collectionCentreGps,
}) => {
  const t = translations[currentLang];
  const [copiedTx, setCopiedTx] = useState(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'expanded'>('mobile');
  const [expandedStage, setExpandedStage] = useState<number | null>(3); // Default open Stage 3 for testing
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  
  const relevantCert = labCertificates.find(c => c.ipfsHash === batch?.ipfsCertLink);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !batch) return null;

  const copyTx = () => {
    navigator.clipboard.writeText(batch.polygonTxHash);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const toggleStage = (stageIdx: number) => {
    setExpandedStage(expandedStage === stageIdx ? null : stageIdx);
  };

  const hubAddress =
    collectionCentreAddress ||
    batch.collectionCentreAddress ||
    'KVIC Regional Quality Hub #08, Main Mandi Road, Bharatpur, Rajasthan - 321001';
  const hubGps =
    collectionCentreGps ||
    batch.collectionCentreGps ||
    '27.2152° N, 77.4920° E';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className={`relative bg-white rounded-3xl w-full border border-amber-900/20 shadow-2xl overflow-hidden flex flex-col my-auto transition-all duration-300 ${
          viewMode === 'mobile'
            ? 'max-w-md border-4 border-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]'
            : 'max-w-3xl'
        }`}
        style={{ maxHeight: '94vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top App Header / Simulated Phone Status Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <button
              id="consumer-modal-back-btn"
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>
                {currentLang === 'hi' ? 'डैशबोर्ड पर वापस' : 'Back to Collection Dashboard'}
              </span>
            </button>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
              <Sparkles className="w-3 h-3" /> Live Passport
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle View Mode: Smartphone frame vs Expanded */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'mobile' ? 'expanded' : 'mobile')}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-slate-700"
              title="Toggle between Smartphone Camera View and Expanded Desktop View"
            >
              <Smartphone className="w-3 h-3 text-amber-400" />
              <span>{viewMode === 'mobile' ? 'Expand View' : 'Phone View'}</span>
            </button>

            <button
              id="consumer-modal-close-x-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Passport Content */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
          {/* Top Banner: Celebratory Consumer Headline */}
          <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white p-5 sm:p-6 relative overflow-hidden">
            {/* Background honeycomb watermark */}
            <div className="absolute -right-8 -bottom-8 opacity-10 text-9xl pointer-events-none select-none">
              🍯
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3 border border-white/30 text-amber-100 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>KVIC Honey Mission • National Provenance Registry</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                🎉 Hurray! Your Honey is 100% Pure & Authentic!
              </h2>

              <p className="text-xs sm:text-sm text-amber-100 font-medium mt-1.5 leading-relaxed">
                Scanned via camera QR code. Sourced directly from registered rural beekeepers in Rajasthan, verified by laboratory AI melissopalynology and anchored permanently on Polygon blockchain.
              </p>

              {/* Product Badge Pill */}
              <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-200 block">
                    Product & Batch ID
                  </span>
                  <span className="font-extrabold text-white">
                    {batch.batchTitle} • <span className="font-mono">{batch.jarBatchId}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-amber-200 block">
                    Net Weight & Grade
                  </span>
                  <span className="font-bold text-emerald-300 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-400/30">
                    {batch.netWeightGrams}g • Grade A
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Verified Metrics Strip */}
          <div className="p-4 sm:p-5 bg-amber-50/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-700" />
                <span>Lab-Verified Quality Parameters</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                NABL ACCREDITED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Metric 1: AI Pollen Match */}
              <div className="bg-white border border-amber-200/80 rounded-2xl p-3 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  AI Pollen Match
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                    {batch.aiPurityScore}%
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">Match</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Brassica juncea exine morphology verified.
                </p>
              </div>

              {/* Metric 2: Monofloral Mustard */}
              <div className="bg-white border border-amber-200/80 rounded-2xl p-3 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Nectar Origin
                </span>
                <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5 truncate">
                  Monofloral Mustard
                </p>
                <p className="text-[11px] text-slate-600 mt-1 truncate">
                  Kumher Apiary, Bharatpur (RJ)
                </p>
              </div>

              {/* Metric 3: Zero C4 Syrup */}
              <div className="bg-white border border-amber-200/80 rounded-2xl p-3 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  C4 Sugar / Invert Syrup
                </span>
                <div className="flex items-center gap-1 text-emerald-700 font-extrabold text-sm sm:text-base mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero C4 Syrup</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Delta 13C Isotope Analyzed: Clean.
                </p>
              </div>

              {/* Metric 4: Moisture Content */}
              <div className="bg-white border border-amber-200/80 rounded-2xl p-3 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Moisture Content
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                    18.2%
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">&lt; 20% limit</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Meets KVIC Honey standard.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Farm-to-Shelf Journey Map */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>Interactive Farm-to-Shelf Journey Map</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click any stage to expand full cryptographic telemetry & physical records.
                </p>
              </div>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-amber-400 before:to-indigo-500">
              {/* Stage 1: Beekeeper Origin */}
              <div className="relative">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  1
                </div>
                <div
                  onClick={() => toggleStage(1)}
                  className="bg-[#FAF8F5] hover:bg-amber-50/50 border border-slate-200 rounded-2xl p-3.5 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Stage 1 • Rural Apiary Origin
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">
                        Beekeeper: {batch.beekeeperName}
                      </h4>
                      <p className="text-xs text-slate-600">
                        Aadhaar ID: <span className="font-mono font-bold text-slate-800">{batch.beekeeperId}</span> • Kumher Apiary, Bharatpur
                      </p>
                    </div>
                    {expandedStage === 1 ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-600">
                    <span className="flex items-center gap-1 text-red-700 font-bold">
                      <MapPin className="w-3 h-3 text-red-500" /> GPS: {batch.beekeeperGps}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>Hive Box: H-001 (IoT Verified)</span>
                  </div>

                  {expandedStage === 1 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700 space-y-1.5 bg-white p-2.5 rounded-xl">
                      <p>
                        <strong>Harvest Timestamp:</strong> 2026-09-12 at 08:30 IST
                      </p>
                      <p>
                        <strong>Flora Zone:</strong> Monofloral Mustard fields (Kumher, Bharatpur, RJ).
                      </p>
                      <p>
                        <strong>IoT Telemetry:</strong> Hive temperature stabilized at 34.8°C with optical bee gate sensors active during comb extraction.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stage 2: Collection Hub Quality Intake */}
              <div className="relative">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  2
                </div>
                <div
                  onClick={() => toggleStage(2)}
                  className="bg-[#FAF8F5] hover:bg-amber-50/50 border border-slate-200 rounded-2xl p-3.5 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                        Stage 2 • Quality Intake Hub
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">
                        KVIC Regional Quality Hub #08
                      </h4>
                      <p className="text-xs text-slate-600">
                        {hubAddress}
                      </p>
                    </div>
                    {expandedStage === 2 ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-600">
                    <span className="flex items-center gap-1 text-amber-800 font-bold">
                      <MapPin className="w-3 h-3 text-amber-600" /> Hub GPS: {hubGps}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-emerald-700 font-bold">DBT Payout: Settled (₹8,750)</span>
                  </div>

                  {expandedStage === 2 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700 space-y-1.5 bg-white p-2.5 rounded-xl">
                      <p>
                        <strong>Physical Centre Location:</strong> {hubAddress}
                      </p>
                      <p>
                        <strong>Geotag Coordinates:</strong> {hubGps}
                      </p>
                      <p>
                        <strong>Intake Weight:</strong> Gross 28.5 kg, Tare 3.5 kg, Net Honey 25.0 kg.
                      </p>
                      <p>
                        <strong>Quality Grade:</strong> Grade A Raw Mustard Honey (Refractometer Moisture: 18.2%).
                      </p>
                      <p>
                        <strong>Direct Benefit Transfer:</strong> Direct payment remitted to Rameshwar Singh Meena's Aadhaar-linked account at ₹350/kg.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stage 3: AI Microscope Slide Analysis */}
              <div className="relative">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  3
                </div>
                <div
                  onClick={() => toggleStage(3)}
                  className="bg-[#FAF8F5] hover:bg-amber-50/50 border border-slate-200 rounded-2xl p-3.5 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                        Stage 3 • AI Pollen Melissopalynology
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">
                        Microscopic Exine & Pollen Authentication
                      </h4>
                      <p className="text-xs text-slate-600">
                        AI Vision Model: Melissopalynology v3.2 • 400x Polarized Optical Inspection
                      </p>
                    </div>
                    {expandedStage === 3 ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-600">
                    <span className="text-emerald-700 font-bold">Purity: {batch.aiPurityScore}%</span>
                    <span className="text-slate-400">•</span>
                    <span>89% Brassica Pollen Count</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-emerald-700 font-bold">C4 Invert Sugar: UNDETECTED</span>
                  </div>

                  {expandedStage === 3 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700 space-y-3 bg-white p-2.5 rounded-xl">
                      {relevantCert ? (
                        <>
                            <p><strong>Attached Document:</strong> {relevantCert.fileName}</p>
                            <p><strong>Assay Type:</strong> {relevantCert.testType}</p>
                            <p><strong>NABL Accreditation:</strong> {relevantCert.accreditedLab}</p>
                            <p className="font-mono text-[10px] break-all"><strong>IPFS CID:</strong> {relevantCert.ipfsHash}</p>
                            <button 
                                onClick={() => setIsPdfModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white cursor-pointer hover:bg-amber-700 transition-colors">
                                <ExternalLink className="w-3 h-3" /> View IPFS Lab Report PDF
                            </button>
                        </>
                      ) : (
                        <p>No lab certificate found.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Lab Report Preview Modal */}
              {relevantCert && (
                <LabReportPreviewModal
                    isOpen={isPdfModalOpen}
                    onClose={() => setIsPdfModalOpen(false)}
                    cert={relevantCert}
                />
              )}

              {/* Stage 4: Polygon Blockchain Mint */}
              <div className="relative">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  4
                </div>
                <div
                  onClick={() => toggleStage(4)}
                  className="bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded">
                        Stage 4 • Polygon Blockchain Anchor
                      </span>
                      <h4 className="text-sm font-black text-indigo-950 mt-1">
                        Immutable Ledger Provenance Record
                      </h4>
                      <p className="text-xs text-indigo-800">
                        Smart Contract: KVIC-ERC721-HONEY-PROVENANCE • Block #{batch.blockNumber}
                      </p>
                    </div>
                    {expandedStage === 4 ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>

                  {/* Polygon Tx Hash Copy Strip */}
                  <div className="mt-2.5 bg-white p-2.5 rounded-xl border border-indigo-200/80">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
                      <span>Polygon POS Tx Hash</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyTx();
                        }}
                        className="text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedTx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedTx ? 'Copied!' : 'Copy Hash'}</span>
                      </button>
                    </div>
                    <p className="font-mono text-xs font-bold text-indigo-900 break-all select-all">
                      {batch.polygonTxHash}
                    </p>
                  </div>

                  {/* IPFS Certificate Link */}
                  <div className="mt-2 bg-white p-2 rounded-xl border border-indigo-200/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      IPFS Lab Certificate CID
                    </span>
                    <span className="font-mono text-[11px] font-bold text-amber-800 truncate max-w-[200px]">
                      {batch.ipfsCertLink}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Consumer Assurance Guarantee */}
          <div className="p-4 sm:p-5 bg-slate-50 text-xs text-slate-600 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
              🍯
            </div>
            <div>
              <p className="font-extrabold text-slate-900">
                Guaranteed Pure Raw Indian Honey by Khadi & Village Industries Commission
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Every jar of HiveNexa honey is fully traceable from the beekeeper's frame to your pantry. Zero ultra-filtration, zero corn syrup, zero antibiotic residues.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Web Passport</span>
          </button>

          <button
            id="consumer-modal-bottom-close-btn"
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Back to Collection Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
