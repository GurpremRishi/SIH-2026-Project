import React, { useState, useEffect } from 'react';
import { MasterJarBatch, IntakeLedgerEntry, Language } from '../../types';
import { translations } from '../../translations';
import { generateQrDataUrl, generateCryptoHash } from '../../utils/qrHelper';
import { QrCode, Cpu, ShieldCheck, Sparkles, ExternalLink, Printer, Check, Copy, Layers, CheckCircle2, Search, AlertOctagon } from 'lucide-react';

interface MasterJarMintingSuiteProps {
  currentLang: Language;
  intakeBatches: IntakeLedgerEntry[];
  masterBatches: MasterJarBatch[];
  certificates: LabCertificate[];
  onAddMasterBatch: (batch: MasterJarBatch) => void;
  onOpenConsumerView: (batch: MasterJarBatch) => void;
  collectionCentreGps?: string;
  collectionCentreAddress?: string;
  targetApprovedBatchId?: string;
}

export const MasterJarMintingSuite: React.FC<MasterJarMintingSuiteProps> = ({
  currentLang,
  intakeBatches,
  masterBatches,
  certificates,
  onAddMasterBatch,
  onOpenConsumerView,
  collectionCentreGps = '27.2152° N, 77.4920° E',
  collectionCentreAddress = 'KVIC Regional Quality Hub #08, Main Mandi Road, Bharatpur, Rajasthan - 321001',
  targetApprovedBatchId,
}) => {
  const t = translations[currentLang];

  const [selectedIntakeId, setSelectedIntakeId] = useState<string>(
    targetApprovedBatchId || (intakeBatches.length > 0 ? intakeBatches[0].id : 'INTK-2026-0491')
  );
  const [netWeightGrams, setNetWeightGrams] = useState<number>(500);
  const [batchTitle, setBatchTitle] = useState<string>('Mustard Blossom Monofloral Raw Honey (500g)');
  const [isMinting, setIsMinting] = useState(false);
  const [activeJarBatch, setActiveJarBatch] = useState<MasterJarBatch | null>(
    masterBatches.length > 0 ? masterBatches[0] : null
  );

  // Auto-sync approved batch selection from microscope analyzer
  useEffect(() => {
    if (targetApprovedBatchId) {
      setSelectedIntakeId(targetApprovedBatchId);
    }
  }, [targetApprovedBatchId]);

  // Selected intake batch lookup
  const currentSelectedBatch = intakeBatches.find((b) => b.id === selectedIntakeId) || intakeBatches[0];
  const isReportAttached = certificates.length > 0;

  // Generate QR code for active batch on load and whenever collectionCentreAddress or collectionCentreGps changes
  useEffect(() => {
    // Generate preview payload for selected intake batch
    const activeGps = collectionCentreGps || '27.2152° N, 77.4920° E';
    const activeAddress = collectionCentreAddress || 'KVIC Regional Quality Hub #08, Main Mandi Road, Bharatpur, Rajasthan - 321001';

    const payload = JSON.stringify({
        jarId: 'PREVIEW-' + currentSelectedBatch.id,
        title: batchTitle,
        purityScore: currentSelectedBatch.linkedPurityScore,
        ipfsCert: certificates.length > 0 ? certificates[0].ipfsHash : 'Pending...',
    });
    
    generateQrDataUrl(payload).then((url) => {
        // Update a preview QR state
        setPreviewQrUrl(url);
    });

  }, [collectionCentreGps, collectionCentreAddress, selectedIntakeId, certificates]);

  const [previewQrUrl, setPreviewQrUrl] = useState<string | null>(null);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMinting(true);

    const linkedIntake = intakeBatches.find((b) => b.id === selectedIntakeId) || intakeBatches[0];
    const jarId = `KVIC-JAR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const txHash = `0x${generateCryptoHash(jarId + Date.now()).replace('0x', '')}984189c2`;
    const blockNumber = 59281000 + Math.floor(Math.random() * 500);
    const latestCert = certificates.length > 0 ? certificates[certificates.length - 1] : null;
    const ipfsCert = latestCert ? latestCert.ipfsHash : 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco';
    const purity = linkedIntake?.linkedPurityScore || 96.4;
    const gps = '27.1751° N, 78.0421° E';
    const centreGps = collectionCentreGps || '27.2152° N, 77.4920° E';
    const centreAddress = collectionCentreAddress || 'KVIC Regional Quality Hub #08, Main Mandi Road, Bharatpur, Rajasthan - 321001';

    const payloadObj = {
      standard: 'KVIC-ERC721',
      jarId,
      title: batchTitle,
      netWeightGrams,
      purityScore: purity,
      ipfsCertLink: ipfsCert,
      polygonTxHash: txHash,
      mintTimestamp: new Date().toISOString(),
    };

    const qrUrl = await generateQrDataUrl(JSON.stringify(payloadObj));

    const newBatch: MasterJarBatch = {
      jarBatchId: jarId,
      batchTitle,
      netWeightGrams,
      beekeeperId: linkedIntake?.beekeeperId || 'BK-KVIC-RJ-8842',
      beekeeperName: linkedIntake?.beekeeperName || 'Rameshwar Singh Meena',
      beekeeperGps: gps,
      collectionCentreGps: centreGps,
      collectionCentreAddress: centreAddress,
      collectionCentreName: 'KVIC Regional Honey Collection & Quality Centre',
      floralSource: linkedIntake?.nectarSource || 'Mustard (Brassica juncea)',
      aiPurityScore: purity,
      ipfsCertLink: ipfsCert,
      polygonTxHash: txHash,
      blockNumber,
      mintTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      jarQrDataUrl: qrUrl,
      intakeBatchId: selectedIntakeId,
      status: 'Minted on Polygon',
    };

    setActiveJarBatch(newBatch);
    onAddMasterBatch(newBatch);
    setIsMinting(false);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-amber-900/15 shadow-sm mt-6">
      {/* Title */}
      <div className="pb-4 border-b border-amber-900/10">
        <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Stage 4: Blockchain Bottling & Consumer Verification</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
          {t.masterJarTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t.masterJarDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left: Minting Form */}
        <form onSubmit={handleMint} className="lg:col-span-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {t.linkedBatch}
              </label>
              {currentSelectedBatch?.pollenAnalysisStatus === 'Passed' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Purity Verified (Grade A)
                </span>
              ) : currentSelectedBatch?.pollenAnalysisStatus === 'Rejected' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded-full">
                  Quarantined (Adulterated)
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-500">
                  Pending Palynology
                </span>
              )}
            </div>

            <select
              id="minting-intake-batch-select"
              value={selectedIntakeId}
              onChange={(e) => setSelectedIntakeId(e.target.value)}
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 bg-[#FAF8F5] text-slate-900 cursor-pointer shadow-2xs"
            >
              {intakeBatches.map((b) => {
                const isVerified = b.pollenAnalysisStatus === 'Passed';
                const isRejected = b.pollenAnalysisStatus === 'Rejected';
                const statusTag = isVerified
                  ? ' • Purity Verified (Grade A)'
                  : isRejected
                  ? ' • Flagged / Adulterated'
                  : ' • Pending Palynology';
                return (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.nectarSource} ({b.netWeight} kg • Purity: {b.linkedPurityScore || 96.4}%){statusTag}
                  </option>
                );
              })}
            </select>

            {/* Batch Status Notice */}
            {currentSelectedBatch?.pollenAnalysisStatus === 'Passed' && (
              <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-900">
                    Batch #{currentSelectedBatch.id} is certified Grade A pure ({currentSelectedBatch.linkedPurityScore || 96.4}%). Ready for Master Jar minting.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Retail Bottle Size (Net Weight)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { grams: 250, label: '250g Glass Jar' },
                { grams: 500, label: '500g Table Jar' },
                { grams: 1000, label: '1 kg Family Jar' },
              ].map((item) => (
                <button
                  key={item.grams}
                  type="button"
                  onClick={() => {
                    setNetWeightGrams(item.grams);
                    setBatchTitle(`Mustard Blossom Monofloral Raw Honey (${item.grams}g)`);
                  }}
                  className={`p-2.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                    netWeightGrams === item.grams
                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-amber-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cryptographic Parameters baked into QR */}
          <div className="bg-[#FAF8F5] border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Immutable Cryptographic Payloads Baked in:
            </span>
            <div className="flex justify-between font-mono text-[11px] text-slate-700">
              <span>Beekeeper Apiary GPS:</span>
              <span className="font-bold text-slate-900">27.1751° N, 78.0421° E</span>
            </div>
            <div className="flex justify-between font-mono text-[11px] text-slate-700">
              <span>Collection Centre GPS:</span>
              <span className="font-bold text-amber-900">{collectionCentreGps}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-700">
              <span className="font-mono">Collection Centre Address:</span>
              <span className="font-semibold text-slate-900 text-right truncate max-w-[220px]" title={collectionCentreAddress}>
                {collectionCentreAddress}
              </span>
            </div>
            <div className="flex justify-between font-mono text-[11px] text-slate-700">
              <span>AI Pollen Purity Match:</span>
              <span className="font-bold text-emerald-700">
                {currentSelectedBatch?.linkedPurityScore || 96.4}% (Authentic Grade A)
              </span>
            </div>
            <div className="flex justify-between font-mono text-[11px] text-slate-700">
              <span>IPFS Lab Certificate:</span>
              <span className="font-bold text-amber-700 truncate max-w-[180px]">
                ipfs://QmXoypizjW3...
              </span>
            </div>
            <div className="flex justify-between font-mono text-[11px] text-slate-700">
              <span>Target Network:</span>
              <span className="font-bold text-indigo-700">Polygon POS Mainnet</span>
            </div>
          </div>

          {/* Mint Blockchain Button */}
          <div className="space-y-2">
            {!isReportAttached && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                <AlertOctagon className="w-4 h-4" />
                ⚠️ Action Required: Upload NABL Lab Certificate in Stage 3 to unlock Blockchain Minting.
              </div>
            )}
            {isReportAttached && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                ✅ Lab Certificate Verified & Anchored
              </div>
            )}
            <button
              id="mint-master-jar-blockchain-btn"
              type="submit"
              disabled={isMinting || !isReportAttached}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-amber-200" />
              <span>{isMinting ? t.minting : t.mintBlockchainBtn}</span>
            </button>
          </div>
        </form>

        {/* Right: Master Consumer Jar Label Sticker Preview */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {t.retailQrTitle}
              </h3>
              {activeJarBatch && (
                <button
                  id="inspect-consumer-provenance-modal-btn"
                  onClick={() => onOpenConsumerView(activeJarBatch)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg transition-colors border border-amber-300 cursor-pointer shadow-2xs"
                >
                  <Search className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t.inspectProvenanceBtn}</span>
                </button>
              )}
            </div>

            {activeJarBatch ? (
              <div className="bg-[#FAF8F5] border-2 border-amber-500/80 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                {/* Honey Jar Brand Header */}
                <div className="flex items-center justify-between pb-3 border-b border-amber-900/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                      🍯
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        HiveNexa Monofloral Mustard Honey
                      </h4>
                      <p className="text-[10px] text-amber-800 font-bold uppercase">
                        KVIC Honey Mission • Net Wt: {activeJarBatch.netWeightGrams}g
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    POLYGON ANCHORED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-4 items-center">
                  {/* Dynamic Master QR with phone camera scanner frame */}
                  <div className="sm:col-span-5 flex flex-col items-center">
                    <div
                      id="master-jar-qr-clickable-card"
                      onClick={() => onOpenConsumerView(activeJarBatch)}
                      className="relative bg-white p-3 rounded-2xl border-2 border-slate-900 shadow-md cursor-pointer hover:border-amber-500 hover:shadow-lg transition-all group overflow-hidden"
                      title="Click to open Consumer Web Passport (Camera QR Scan View)"
                    >
                      {/* Corner camera target brackets */}
                      <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-500 transition-all group-hover:scale-110" />
                      <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-500 transition-all group-hover:scale-110" />
                      <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber-500 transition-all group-hover:scale-110" />
                      <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-500 transition-all group-hover:scale-110" />

                      {activeJarBatch.jarQrDataUrl ? (
                        <img
                          src={activeJarBatch.jarQrDataUrl}
                          alt="Master Consumer Jar QR"
                          className="w-36 h-36 object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-36 h-36 bg-slate-100 animate-pulse rounded" />
                      )}

                      {/* Hover Overlay Hint */}
                      <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center text-white rounded-xl">
                        <Search className="w-6 h-6 text-amber-400 mb-1 animate-bounce" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                          Scan / Click
                        </span>
                        <span className="text-[9px] text-slate-200">
                          Open Web Passport
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenConsumerView(activeJarBatch)}
                      className="mt-2 text-[10px] font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      <span>Click to Test Camera View</span>
                    </button>
                  </div>

                  {/* Metadata fields baked in */}
                  <div className="sm:col-span-7 space-y-2 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">
                        Master Jar ID & Floral Zone
                      </span>
                      <p className="font-bold text-slate-900 font-mono">
                        {activeJarBatch.jarBatchId}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        {activeJarBatch.floralSource}
                      </p>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">
                        Collection Centre Geotag & Hub
                      </span>
                      <p className="text-[11px] font-semibold text-slate-900 truncate" title={collectionCentreAddress || activeJarBatch.collectionCentreAddress}>
                        {collectionCentreAddress || activeJarBatch.collectionCentreAddress}
                      </p>
                      <p className="font-mono text-[10px] text-amber-800 font-bold">
                        GPS: {collectionCentreGps || activeJarBatch.collectionCentreGps}
                      </p>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">
                        Polygon Blockchain Tx Hash
                      </span>
                      <p className="font-mono text-[11px] font-bold text-indigo-700 truncate">
                        {activeJarBatch.polygonTxHash}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Block #{activeJarBatch.blockNumber} • Confirmed
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">
                          AI Purity Match
                        </span>
                        <p className="font-extrabold text-emerald-700 text-sm">
                          {activeJarBatch.aiPurityScore}%
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">
                          Origin Apiary
                        </span>
                        <p className="font-bold text-slate-900 text-xs truncate">
                          Kumher, Bharatpur
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-amber-900/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>HIVE: {activeJarBatch.jarBatchId} • POLYGON: {activeJarBatch.polygonTxHash.slice(0, 10)}... • IPFS: {activeJarBatch.ipfsCertLink.slice(0, 15)}...</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#FAF8F5] border-2 border-amber-500/80 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-amber-900/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                      🍯
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Preview: Monofloral Mustard Honey
                      </h4>
                      <p className="text-[10px] text-amber-800 font-bold uppercase">
                        Batch Preview • {currentSelectedBatch.nectarSource}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-4 items-center">
                   <div className="sm:col-span-5 flex flex-col items-center">
                    <div className="relative bg-white p-3 rounded-2xl border-2 border-slate-900 shadow-md">
                        {previewQrUrl ? (
                            <img src={previewQrUrl} alt="Preview QR" className="w-36 h-36" />
                        ) : (
                            <div className="w-36 h-36 bg-slate-100 animate-pulse rounded" />
                        )}
                    </div>
                   </div>
                   <div className="sm:col-span-7 space-y-2 text-xs">
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Batch ID</span>
                          <p className="font-bold text-slate-900 font-mono">PREVIEW-{currentSelectedBatch.id}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Polygon Status</span>
                            <p className="font-bold text-indigo-700 text-xs">Pending Mint</p>
                        </div>
                   </div>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-900/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>HIVE: PREVIEW-{currentSelectedBatch.id} • POLYGON: PENDING... • IPFS: {certificates.length > 0 ? certificates[0].ipfsHash.slice(0, 15) : 'PENDING'}...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
