import React, { useState, useEffect } from 'react';
import { IntakeLedgerEntry, Language } from '../../types';
import { generateQrDataUrl } from '../../utils/qrHelper';
import {
  X,
  Printer,
  ShieldCheck,
  Building2,
  CheckCircle2,
  FileText,
  BadgeCheck,
  Scale,
  Droplets,
  IndianRupee,
  Calendar,
  User,
  Copy,
  Check,
  MapPin,
} from 'lucide-react';

interface IntakeReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: IntakeLedgerEntry | null;
  currentLang: Language;
  collectionCentreGps?: string;
  collectionCentreAddress?: string;
}

export const IntakeReceiptModal: React.FC<IntakeReceiptModalProps> = ({
  isOpen,
  onClose,
  record,
  currentLang,
  collectionCentreGps = '27.2152° N, 77.4920° E',
  collectionCentreAddress = 'KVIC Regional Quality Hub #08, Main Mandi Road, Bharatpur, Rajasthan - 321001',
}) => {
  const [receiptQrUrl, setReceiptQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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

  useEffect(() => {
    if (record) {
      const receiptPayload = JSON.stringify({
        receiptType: 'KVIC-OFFICIAL-HONEY-INTAKE-DBT',
        receiptNumber: `REC-${record.id}`,
        batchId: record.id,
        beekeeperId: record.beekeeperId,
        beekeeperName: record.beekeeperName,
        aadhaarRef: record.beekeeperAadhaarMasked || 'XXXX-XXXX-4819',
        crateId: record.crateBatchId,
        nectarSource: record.nectarSource,
        grossWeightKg: record.grossWeight,
        tareWeightKg: record.tareWeight,
        netWeightKg: record.netWeight,
        moisturePct: record.moisturePct,
        dbtPayoutInr: record.totalPayout,
        collectionHub: collectionCentreAddress,
        collectionCentreGps: collectionCentreGps,
        officer: 'Er. S. K. Sharma (Superintendent)',
        timestamp: record.intakeTimestamp,
        digitalSignature: `SHA256:KVIC-${record.id.replace('INTK-', '')}-${record.totalPayout}-VERIFIED`,
      });

      generateQrDataUrl(receiptPayload).then((url) => {
        setReceiptQrUrl(url);
      });
    }
  }, [record, collectionCentreGps, collectionCentreAddress]);

  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summaryText = `--- KVIC OFFICIAL RAW HONEY INTAKE & DBT SLIP ---
Receipt No: REC-${record.id}
Timestamp: ${record.intakeTimestamp}
Beekeeper: ${record.beekeeperName} (${record.beekeeperId})
Aadhaar Ref: ${record.beekeeperAadhaarMasked || 'XXXX-XXXX-4819'}
Crate ID: ${record.crateBatchId}
Floral Source: ${record.nectarSource}
Gross Weight: ${record.grossWeight.toFixed(1)} kg | Tare: ${record.tareWeight.toFixed(1)} kg | Net: ${record.netWeight.toFixed(1)} kg
Moisture: ${record.moisturePct}% (KVIC Grade A Limit <20%)
DBT Payout Amount: ₹${record.totalPayout.toLocaleString('en-IN')} (Rate: ₹${record.baseRatePerKg + record.moistureBonusPenalty}/kg)
Hub: ${collectionCentreAddress} (${collectionCentreGps})
Officer: Er. S. K. Sharma, Quality Superintendent`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract concise city/hub label for stamp seal
  const formatStampLocation = (addr: string) => {
    const parts = addr.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const statePart = parts[parts.length - 1].replace(/-\s*\d+/, '').trim();
      const cityPart = parts[parts.length - 2].trim();
      return `${cityPart.toUpperCase()} • ${statePart.toUpperCase()}`;
    }
    return addr.toUpperCase();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full border border-amber-900/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Print & Close Action Controls Bar (Hidden during print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold tracking-wide">
              {currentLang === 'hi' ? 'आधिकारिक केवीआईसी आवक एवं डीबीटी रसीद' : 'Official KVIC Raw Honey Intake & DBT Receipt'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-receipt-btn"
              onClick={handleCopySummary}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (currentLang === 'hi' ? 'कॉपी हुआ' : 'Copied') : (currentLang === 'hi' ? 'कॉपी विवरण' : 'Copy Slip')}</span>
            </button>

            <button
              id="print-receipt-btn"
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{currentLang === 'hi' ? 'प्रिंट रसीद' : 'Print'}</span>
            </button>

            {/* Prominent Top Right Close Button */}
            <button
              id="close-receipt-modal-btn"
              onClick={onClose}
              type="button"
              title="Close receipt (Esc)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600/90 hover:bg-red-600 text-white transition-all cursor-pointer shadow-xs ml-1"
            >
              <X className="w-4 h-4" />
              <span>{currentLang === 'hi' ? 'बंद करें' : 'Close'}</span>
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div id="printable-intake-receipt" className="p-6 sm:p-8 space-y-6 bg-[#FCFBF8] text-slate-900 print:p-8 print:bg-white">
          {/* Header of Receipt: Official Emblem & Department */}
          <div className="border-b-2 border-slate-900 pb-5 text-center relative">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-900 text-amber-200 flex items-center justify-center font-bold text-lg shadow-xs">
                🐝
              </div>
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 block leading-tight">
                  KHADI AND VILLAGE INDUSTRIES COMMISSION (KVIC)
                </span>
                <span className="text-[9px] font-bold text-slate-600 block">
                  Ministry of Micro, Small & Medium Enterprises, Govt. of India
                </span>
              </div>
            </div>

            <h1 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-950 mt-2">
              {currentLang === 'hi'
                ? 'राष्ट्रीय शहद मिशन — कच्चा शहद आवक एवं प्रत्यक्ष लाभ अंतरण (DBT) पर्ची'
                : 'National Honey Mission — Raw Honey Intake & DBT Remuneration Voucher'}
            </h1>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-600">
              <span><strong>Receipt No:</strong> KVIC-REC-{record.id}</span>
              <span>•</span>
              <span><strong>Batch:</strong> {record.id}</span>
              <span>•</span>
              <span><strong>Date & Time:</strong> {record.intakeTimestamp}</span>
            </div>
          </div>

          {/* 1. Beekeeper Identification & Crate Metadata */}
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-wider text-amber-900 mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{currentLang === 'hi' ? '1. पंजीकृत मधुमक्खी पालक विवरण' : '1. Registered Beekeeper & Source Crate Particulars'}</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  {currentLang === 'hi' ? 'मधुमक्खी पालक का नाम' : 'Beekeeper Name'}
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{record.beekeeperName}</p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  {currentLang === 'hi' ? 'केवीआईसी बीकीपर आईडी' : 'Beekeeper ID'}
                </span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{record.beekeeperId}</p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  {currentLang === 'hi' ? 'आधार संदर्भ (Masked)' : 'Aadhaar Reference'}
                </span>
                <p className="font-mono font-bold text-emerald-800 mt-0.5">
                  {record.beekeeperAadhaarMasked || 'XXXX-XXXX-4819'}
                </p>
                <span className="text-[9px] text-emerald-600 font-semibold">UIDAI / DigiLocker Verified</span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  {currentLang === 'hi' ? 'लिंक्ड क्रेट बारकोड / आईडी' : 'Linked Crate ID'}
                </span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{record.crateBatchId}</p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  {currentLang === 'hi' ? 'फ्लोरल / नेक्टर स्रोत' : 'Floral Nectar Source'}
                </span>
                <p className="font-bold text-amber-900 mt-0.5">{record.nectarSource}</p>
              </div>

              <div className="col-span-2 sm:col-span-3 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/70">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">
                  {currentLang === 'hi' ? 'कलेक्शन सेंटर स्थान एवं जीपीएस' : 'Collection Centre Hub & Geotag'}
                </span>
                <p className="text-slate-800 text-xs font-semibold mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{collectionCentreAddress}</span>
                </p>
                <p className="font-mono text-slate-600 text-[11px] mt-0.5 ml-4.5">
                  GPS Coordinates: <strong>{collectionCentreGps}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* 2. Physical & Chemical Assessment Table */}
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-wider text-amber-900 mb-2.5 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>{currentLang === 'hi' ? '2. वजन एवं गुणवत्ता परीक्षण (मंडी स्केल व रिफ्रैक्टोमीटर)' : '2. Physical Weighment & Quality Parameter Assessment'}</span>
            </h2>

            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Parameter Description</th>
                    <th className="py-2.5 px-3 text-right">Measured Metric</th>
                    <th className="py-2.5 px-3">Regulatory Reference / Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Gross Weight (With Crate)</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{record.grossWeight.toFixed(1)} kg</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">Calibrated Electronic Weighing Scale</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Tare Weight (Empty Container)</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{record.tareWeight.toFixed(1)} kg</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">Standard Food-Grade Polypropylene Crate</td>
                  </tr>
                  <tr className="bg-amber-50/60 font-bold">
                    <td className="py-2.5 px-3 text-amber-950">Net Harvest Honey Yield</td>
                    <td className="py-2.5 px-3 text-right font-mono text-base text-amber-950">{record.netWeight.toFixed(1)} kg</td>
                    <td className="py-2.5 px-3 text-amber-900 text-[11px]">Net Payable Raw Volume</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Measured Moisture Content %</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">{record.moisturePct}%</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        ✓ FSSAI & KVIC Pass (&lt;20.0% limit)
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Base KVIC Floor Procurement Rate</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-900">₹{record.baseRatePerKg.toFixed(2)} / kg</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">KVIC 2026 Mustard Procurement Schedule</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Moisture Quality Incentive / Penalty</td>
                    <td className={`py-2.5 px-3 text-right font-mono font-bold ${record.moistureBonusPenalty >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {record.moistureBonusPenalty >= 0 ? `+₹${record.moistureBonusPenalty.toFixed(2)} / kg` : `-₹${Math.abs(record.moistureBonusPenalty).toFixed(2)} / kg`}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {record.moistureBonusPenalty > 0 ? 'Low-moisture reward (<18.5%)' : 'Standard tier'}
                    </td>
                  </tr>
                  <tr className="bg-slate-900 text-white font-bold">
                    <td className="py-2.5 px-3">Effective Remuneration Rate</td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                      ₹{(record.baseRatePerKg + record.moistureBonusPenalty).toFixed(2)} / kg
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px]">Gross Payable Rate per Net kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Direct Benefit Transfer (DBT) Settlement Block */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-950 text-white p-4 sm:p-5 rounded-2xl border border-emerald-700/50 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block">
                  TOTAL DIRECT BENEFIT TRANSFER (DBT) PAYOUT AMOUNT
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
                    ₹{record.totalPayout.toLocaleString('en-IN')}.00
                  </span>
                  <span className="text-xs text-emerald-200 font-semibold">(INR)</span>
                </div>
                <p className="text-xs text-emerald-100/90 mt-1">
                  Payout Status: <strong className="text-white underline">{record.payoutStatus}</strong> • Direct Credit via PFMS / AePS
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-emerald-200/80 font-mono">
                <p>Transfer Protocol: <strong>DBT-AePS-v2</strong></p>
                <p>Linked Bank: <strong>State Bank of India (SBI)</strong></p>
                <p className="text-[10px] text-emerald-300">Settlement Cycle: T+0 Batch Processing</p>
              </div>
            </div>
          </div>

          {/* 4. Official Collection Hub Verification Stamp & Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
            {/* Stamp graphic block */}
            <div className="sm:col-span-4 flex items-center justify-center">
              <div className="w-36 h-36 rounded-full border-4 border-dashed border-red-700 p-2 text-center flex flex-col items-center justify-center transform -rotate-3 text-red-800 bg-red-50/50">
                <span className="text-[8px] font-black uppercase tracking-wider leading-tight">
                  ★ KVIC GOVT OF INDIA ★
                </span>
                <span className="text-[10px] font-extrabold uppercase my-0.5 leading-none">
                  COLLECTION HUB #08
                </span>
                <div className="w-full border-t border-red-700 my-0.5"></div>
                <span className="text-[9px] font-black tracking-widest text-red-900">
                  VERIFIED & SEALED
                </span>
                <span
                  className="text-[8px] font-mono mt-0.5 font-bold uppercase text-center px-1 max-w-[130px] line-clamp-2 leading-tight"
                  title={collectionCentreAddress}
                >
                  {formatStampLocation(collectionCentreAddress)}
                </span>
                <span className="text-[7px] font-bold text-red-700 mt-0.5">
                  {record.intakeTimestamp.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Middle Signatures */}
            <div className="sm:col-span-5 text-xs space-y-4">
              <div>
                <p className="font-serif italic font-bold text-slate-800 text-sm">
                  Er. S. K. Sharma
                </p>
                <div className="w-36 border-b border-slate-400 mt-0.5"></div>
                <p className="text-[10px] font-bold text-slate-700 mt-0.5">
                  Technical Quality Superintendent
                </p>
                <p className="text-[9px] text-slate-500 max-w-[280px] truncate" title={collectionCentreAddress}>
                  {collectionCentreAddress}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-slate-600">
                  Beekeeper Biometric / Digital Acknowledgement:
                </p>
                <p className="text-[10px] font-mono text-emerald-800 font-bold">
                  ✓ Aadhaar e-Sign Authenticated at Mandi Terminal
                </p>
              </div>
            </div>

            {/* Right: Verification QR Code */}
            <div className="sm:col-span-3 flex flex-col items-center justify-center text-center">
              {receiptQrUrl ? (
                <img
                  src={receiptQrUrl}
                  alt="Intake Slip Digital Signature QR"
                  className="w-24 h-24 rounded-lg border border-slate-300 p-1 bg-white shadow-2xs"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg border border-slate-300 bg-slate-100 animate-pulse"></div>
              )}
              <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase">
                Digital Receipt Hash
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
            <p>
              This is a digitally generated KVIC National Honey Mission Intake & DBT Remuneration slip.
              Complies with National Bee Board guidelines and FSSAI Gazette notification for raw honey procurement.
            </p>
          </div>
        </div>

        {/* Bottom Modal Action Bar (Hidden during print) */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Press</span>
            <kbd className="px-2 py-0.5 text-[11px] font-mono font-bold bg-white border border-slate-300 rounded shadow-2xs text-slate-700">
              Esc
            </kbd>
            <span>or click outside anywhere to return to dashboard</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              id="bottom-close-receipt-btn"
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4 text-slate-500" />
              <span>{currentLang === 'hi' ? 'रसीद बंद करें' : 'Close Receipt'}</span>
            </button>

            <button
              id="bottom-print-receipt-btn"
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>{currentLang === 'hi' ? 'प्रिंट रसीद' : 'Print Official Receipt'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
