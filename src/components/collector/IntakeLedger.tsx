import React, { useState, useEffect } from 'react';
import { IntakeLedgerEntry, BeekeeperCrate, Language } from '../../types';
import { translations } from '../../translations';
import { IntakeReceiptModal } from './IntakeReceiptModal';
import { ClipboardList, CheckCircle, AlertTriangle, ArrowRight, QrCode, DollarSign, Scale, User, Droplet, Sparkles, Receipt } from 'lucide-react';

interface IntakeLedgerProps {
  currentLang: Language;
  intakeRecords: IntakeLedgerEntry[];
  onAddIntakeRecord: (record: IntakeLedgerEntry) => void;
  availableCrates: BeekeeperCrate[];
  onSelectForAnalysis?: (record: IntakeLedgerEntry) => void;
  collectionCentreGps?: string;
  collectionCentreAddress?: string;
}

export const IntakeLedger: React.FC<IntakeLedgerProps> = ({
  currentLang,
  intakeRecords,
  onAddIntakeRecord,
  availableCrates,
  onSelectForAnalysis,
  collectionCentreGps = '27.2152° N, 77.4920° E',
  collectionCentreAddress = 'KVIC Regional Quality Hub #08, Main Mandi Road, Bharatpur, Rajasthan - 321001',
}) => {
  const t = translations[currentLang];

  // Printable Intake Receipt Modal state
  const [selectedReceiptRecord, setSelectedReceiptRecord] = useState<IntakeLedgerEntry | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // Form states
  const [beekeeperId, setBeekeeperId] = useState('BK-KVIC-RJ-8842');
  const [beekeeperName, setBeekeeperName] = useState('Rameshwar Singh Meena');
  const [selectedCrateId, setSelectedCrateId] = useState(
    availableCrates.length > 0 ? availableCrates[0].id : 'CRATE-H001-B78'
  );
  const [grossWeight, setGrossWeight] = useState<number>(28.5);
  const [tareWeight, setTareWeight] = useState<number>(3.5);
  const [moisturePct, setMoisturePct] = useState<number>(18.2);
  const [baseRate, setBaseRate] = useState<number>(280); // ₹280 / kg base KVIC rate
  const [nectarSource, setNectarSource] = useState<string>('Mustard (Brassica juncea)');

  // Auto calculated fields
  const netWeight = Math.max(0, parseFloat((grossWeight - tareWeight).toFixed(2)));

  // KVIC Quality tier bonus: < 18.5% gets +₹15/kg bonus, 18.5-20% gets base rate, >20% penalized
  const moistureBonus = moisturePct < 18.5 ? 15 : moisturePct <= 20.0 ? 0 : -35;
  const effectiveRate = Math.max(100, baseRate + moistureBonus);
  const totalPayout = Math.round(netWeight * effectiveRate);

  // Sync crate change if user picks from dropdown
  const handleCrateSelect = (crateId: string) => {
    setSelectedCrateId(crateId);
    const found = availableCrates.find((c) => c.id === crateId);
    if (found) {
      setBeekeeperId(found.beekeeperId);
      setBeekeeperName(found.beekeeperName);
      setGrossWeight(found.harvestWeightKg);
      setTareWeight(3.5);
      setNectarSource(found.nectarSource);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (netWeight <= 0) return;

    const foundCrate = availableCrates.find((c) => c.id === selectedCrateId);

    const newRecord: IntakeLedgerEntry = {
      id: `INTK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      beekeeperId,
      beekeeperName,
      beekeeperAadhaarMasked: foundCrate?.beekeeperAadhaarMasked || 'XXXX-XXXX-4819',
      crateBatchId: selectedCrateId,
      nectarSource,
      grossWeight,
      tareWeight,
      netWeight,
      moisturePct,
      baseRatePerKg: baseRate,
      moistureBonusPenalty: moistureBonus,
      totalPayout,
      payoutStatus: 'Approved for DBT Transfer',
      intakeTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' IST',
      pollenAnalysisStatus: 'Not Analyzed',
      collectionHubStamp: collectionCentreAddress,
    };

    onAddIntakeRecord(newRecord);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-amber-900/15 shadow-sm">
      {/* Title */}
      <div className="pb-4 border-b border-amber-900/10">
        <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
          <ClipboardList className="w-4 h-4" />
          <span>Stage 1: Mandi & Collection Centre Weighment</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
          {t.intakeLedgerTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t.intakeLedgerDesc}
        </p>
      </div>

      {/* Form Grid */}
      <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Beekeeper ID */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {t.beekeeperId}
            </label>
            <div className="relative">
              <input
                id="intake-beekeeper-id-input"
                type="text"
                value={beekeeperId}
                onChange={(e) => setBeekeeperId(e.target.value)}
                className="w-full text-xs font-bold font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none bg-[#FAF8F5] text-slate-900"
                required
              />
              <User className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">{beekeeperName}</p>
          </div>

          {/* Crate QR Scan / Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {t.crateQrScan}
            </label>
            <div className="relative">
              <select
                id="intake-crate-select"
                value={selectedCrateId}
                onChange={(e) => handleCrateSelect(e.target.value)}
                className="w-full text-xs font-bold font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none bg-[#FAF8F5] text-slate-900 cursor-pointer"
              >
                {availableCrates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} ({c.harvestWeightKg}kg • {c.nectarSource})
                  </option>
                ))}
                <option value="CUSTOM-SCAN">Custom Scanned Crate QR</option>
              </select>
              <QrCode className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Source: {nectarSource}</p>
          </div>

          {/* Gross Weight */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {t.grossWeightLabel}
            </label>
            <div className="relative">
              <input
                id="intake-gross-weight"
                type="number"
                step="0.1"
                value={grossWeight}
                onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none bg-[#FAF8F5] text-slate-900"
                required
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">kg</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Scale calibrated</p>
          </div>

          {/* Tare Weight */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {t.tareWeightLabel}
            </label>
            <div className="relative">
              <input
                id="intake-tare-weight"
                type="number"
                step="0.1"
                value={tareWeight}
                onChange={(e) => setTareWeight(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none bg-[#FAF8F5] text-slate-900"
                required
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">kg</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Standard KVIC Food Crate: 3.5 kg</p>
          </div>
        </div>

        {/* Second Row: Net Weight, Moisture Content, Payout calculation, Action Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Net Weight (Auto-calculated) */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-amber-900 block">
              {t.netWeightLabel} (Gross - Tare)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-amber-950 font-mono">
                {netWeight.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-amber-800">kg</span>
            </div>
            <span className="text-[10px] text-amber-700 font-medium">Auto-derived net harvest</span>
          </div>

          {/* Moisture Content % with threshold badge */}
          <div className="bg-[#FAF8F5] border border-slate-200 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-600 block">
                {t.moistureLabel}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  moisturePct < 18.5
                    ? 'bg-emerald-100 text-emerald-800'
                    : moisturePct <= 20.0
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {moisturePct <= 20.0 ? 'KVIC Pass' : 'KVIC Fail'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input
                id="intake-moisture-pct"
                type="number"
                step="0.1"
                value={moisturePct}
                onChange={(e) => setMoisturePct(parseFloat(e.target.value) || 0)}
                className="w-20 text-base font-bold font-mono px-2 py-1 rounded-lg border border-slate-300 focus:border-amber-500 bg-white"
              />
              <span className="text-xs font-bold text-slate-500">%</span>
              <span className="text-[11px] font-semibold text-slate-600">
                {moistureBonus > 0 ? `+₹${moistureBonus} Bonus` : moistureBonus < 0 ? `-₹35 Penalty` : 'Standard'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Refractometer test (&lt;20% limit)</span>
          </div>

          {/* Auto-Calculated Payout (₹) */}
          <div className="bg-emerald-50/80 border border-emerald-300/80 rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-emerald-900 block">
              {t.payoutLabel} (₹)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-emerald-950 font-mono">
                ₹{totalPayout.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">
              Rate: ₹{effectiveRate}/kg • Direct DBT ready
            </span>
          </div>

          {/* Log Produce Intake Submit Button */}
          <div className="flex items-end">
            <button
              id="intake-submit-btn"
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-amber-400" />
              <span>{t.logIntakeBtn}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Intake Transactions History Table */}
      <div className="mt-6 pt-5 border-t border-amber-900/10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
          {t.intakeHistory} ({intakeRecords.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-[#FAF8F5] text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Batch ID</th>
                <th className="py-2.5 px-3">Beekeeper</th>
                <th className="py-2.5 px-3">Crate QR</th>
                <th className="py-2.5 px-3">Net Wt</th>
                <th className="py-2.5 px-3">Moisture</th>
                <th className="py-2.5 px-3">Payout (₹)</th>
                <th className="py-2.5 px-3">Pollen Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {intakeRecords.map((record) => (
                <tr key={record.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {record.id}
                  </td>
                  <td className="py-2.5 px-3 text-slate-800">
                    <p className="font-semibold">{record.beekeeperName}</p>
                    <p className="text-[10px] font-mono text-slate-500">{record.beekeeperId}</p>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                    {record.crateBatchId}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {record.netWeight} kg
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        record.moisturePct <= 20.0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {record.moisturePct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                    ₹{record.totalPayout.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        record.pollenAnalysisStatus === 'Passed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : record.pollenAnalysisStatus === 'Rejected'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {record.pollenAnalysisStatus}
                      {record.linkedPurityScore ? ` (${record.linkedPurityScore}%)` : ''}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <button
                        id={`generate-receipt-btn-${record.id}`}
                        type="button"
                        onClick={() => {
                          setSelectedReceiptRecord(record);
                          setIsReceiptModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 hover:text-slate-950 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md transition-all border border-slate-300 shadow-2xs cursor-pointer"
                        title="Generate official printable intake & DBT payment slip"
                      >
                        <Receipt className="w-3.5 h-3.5 text-amber-600" />
                        <span>{currentLang === 'hi' ? 'आवक रसीद' : 'Generate Intake Receipt'}</span>
                      </button>

                      {onSelectForAnalysis && (
                        <button
                          onClick={() => onSelectForAnalysis(record)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md transition-colors border border-amber-200 cursor-pointer"
                        >
                          <span>{t.sendToMicroscope}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official In-App Printable Intake Receipt Modal */}
      <IntakeReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        record={selectedReceiptRecord}
        currentLang={currentLang}
        collectionCentreGps={collectionCentreGps}
        collectionCentreAddress={collectionCentreAddress}
      />
    </div>
  );
};
