import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import {
  MapPin,
  X,
  Check,
  Navigation,
  Building2,
  Sparkles,
  ShieldCheck,
  Receipt,
  QrCode,
  Globe,
  RefreshCw,
} from 'lucide-react';

interface CollectionAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGps: string;
  currentAddress: string;
  onSave: (newGps: string, newAddress: string) => void;
  currentLang: Language;
  onDetectDeviceGps?: () => Promise<{ coords: string; addressSuggestion?: string }>;
}

export const CollectionAddressModal: React.FC<CollectionAddressModalProps> = ({
  isOpen,
  onClose,
  currentGps,
  currentAddress,
  onSave,
  currentLang,
  onDetectDeviceGps,
}) => {
  const [gpsInput, setGpsInput] = useState(currentGps);
  const [addressInput, setAddressInput] = useState(currentAddress);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionNotice, setDetectionNotice] = useState<string | null>(null);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setGpsInput(currentGps);
      setAddressInput(currentAddress);
      setDetectionNotice(null);
    }
  }, [isOpen, currentGps, currentAddress]);

  // Keyboard shortcut: Escape to close
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

  if (!isOpen) return null;

  const handleTriggerDetect = async () => {
    setIsDetecting(true);
    setDetectionNotice(null);
    if (onDetectDeviceGps) {
      try {
        const result = await onDetectDeviceGps();
        setGpsInput(result.coords);
        if (result.addressSuggestion && !addressInput.trim()) {
          setAddressInput(result.addressSuggestion);
        }
        setDetectionNotice('Live device GPS coordinates detected successfully.');
      } catch (err) {
        console.warn('GPS detection error:', err);
        setDetectionNotice('Coordinates locked to default Quality Hub.');
      } finally {
        setIsDetecting(false);
      }
    } else if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const latFormatted = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
          const lngFormatted = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
          const coords = `${latFormatted}, ${lngFormatted}`;
          setGpsInput(coords);
          setDetectionNotice(`Live GPS Locked (${coords})`);
          setIsDetecting(false);
        },
        () => {
          setDetectionNotice('Location access not granted. Maintained current coordinates.');
          setIsDetecting(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsDetecting(false);
    }
  };

  const handleApplyPreset = (presetAddress: string, presetGps: string) => {
    setAddressInput(presetAddress);
    setGpsInput(presetGps);
    setDetectionNotice('Applied standard regional depot preset.');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) return;
    onSave(gpsInput.trim() || currentGps, addressInput.trim());
    onClose();
  };

  // Derive city and state preview for stamp
  const extractCityState = (addr: string) => {
    const parts = addr.split(',').map((p) => p.trim());
    if (parts.length >= 2) {
      return `${parts[parts.length - 2]}, ${parts[parts.length - 1].replace(/-\s*\d+/, '').trim()}`;
    }
    return addr;
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        id="collection-centre-address-modal"
        className="relative bg-white rounded-3xl max-w-xl w-full border border-amber-900/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>
                  {currentLang === 'hi'
                    ? 'संग्रहण केंद्र स्थान एवं पता पुष्टिकरण'
                    : 'Confirm Collection Centre Location & Address'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                {currentLang === 'hi'
                  ? 'भौतिक पते को संपादित करें — यह रसीद, मास्टर क्यूआर और पासपोर्ट पर लागू होगा'
                  : 'Edit or confirm physical facility address to bind globally across all modules'}
              </p>
            </div>
          </div>

          <button
            id="close-address-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Section 1: GPS Coordinates */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {currentLang === 'hi' ? 'कलेक्शन सेंटर जीपीएस निर्देशांक' : 'Collection Centre GPS Coordinates'}
                </span>
              </label>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                Auto-Geotag Active
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="collection-centre-gps-input"
                type="text"
                value={gpsInput}
                onChange={(e) => setGpsInput(e.target.value)}
                placeholder="e.g. 27.2152° N, 77.4920° E"
                className="flex-1 text-xs font-bold font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none bg-[#FAF8F5] text-slate-900"
                required
              />
              <button
                type="button"
                onClick={handleTriggerDetect}
                disabled={isDetecting}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                title="Re-read current live GPS coordinates"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isDetecting ? 'animate-spin' : ''}`} />
                <span>{isDetecting ? 'Detecting...' : 'Live GPS'}</span>
              </button>
            </div>
            {detectionNotice && (
              <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>{detectionNotice}</span>
              </p>
            )}
          </div>

          {/* Section 2: Physical Facility Address */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {currentLang === 'hi' ? 'भौतिक केंद्र का पूरा पता (Manual Address Input)' : 'Physical Facility Address (Manual Address Input)'}
                </span>
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">
                Editable text field
              </span>
            </div>

            <textarea
              id="collection-centre-address-input"
              rows={3}
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter exact physical address (e.g., KVIC Quality Hub, Plot 14, Sector 3, Jaipur, Rajasthan - 302001)"
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none bg-[#FAF8F5] text-slate-900 leading-relaxed"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              {currentLang === 'hi'
                ? 'यह सटीक पता रसीद की आधिकारिक मुहर, मास्टर जार क्यूआर और उपभोक्ता पासपोर्ट में तुरंत दिखाई देगा।'
                : 'This exact address will immediately replace static defaults across receipts, Master QR payload, and Consumer Passport.'}
            </p>
          </div>

          {/* Quick Preset Chips for Easy Operator Testing */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
              Quick Regional Quality Hub Presets (Click to Auto-Fill):
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    'KVIC Quality Hub, Plot 14, Sector 3, Jaipur, Rajasthan - 302001',
                    '26.9124° N, 75.7873° E'
                  )
                }
                className="text-[11px] font-semibold text-slate-700 hover:text-amber-950 bg-slate-100 hover:bg-amber-100/70 border border-slate-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer text-left"
              >
                📍 <strong>Jaipur Hub</strong> (Plot 14, Sector 3)
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    'KVIC Regional Quality Hub #08, Main Mandi Road, Bharatpur, Rajasthan - 321001',
                    '27.2152° N, 77.4920° E'
                  )
                }
                className="text-[11px] font-semibold text-slate-700 hover:text-amber-950 bg-slate-100 hover:bg-amber-100/70 border border-slate-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer text-left"
              >
                📍 <strong>Bharatpur Hub #08</strong> (Default)
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    'KVIC Honey Procurement Center, Mandi Yard, Kota, Rajasthan - 324005',
                    '25.1814° N, 75.8398° E'
                  )
                }
                className="text-[11px] font-semibold text-slate-700 hover:text-amber-950 bg-slate-100 hover:bg-amber-100/70 border border-slate-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer text-left"
              >
                📍 <strong>Kota Mandi Hub</strong> (Yard #4)
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    'KVIC Western Quality Depot, RIICO Industrial Area, Jodhpur, Rajasthan - 342001',
                    '26.2389° N, 73.0243° E'
                  )
                }
                className="text-[11px] font-semibold text-slate-700 hover:text-amber-950 bg-slate-100 hover:bg-amber-100/70 border border-slate-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer text-left"
              >
                📍 <strong>Jodhpur Depot</strong> (RIICO Zone)
              </button>
            </div>
          </div>

          {/* Real-time propagation guarantee banner */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-950 space-y-1.5">
            <span className="font-extrabold flex items-center gap-1.5 text-amber-900 uppercase text-[10px] tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Instant Global Synchronization Checklist</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="flex items-start gap-1 text-slate-800">
                <Receipt className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>1. Receipt Stamp:</strong> Official seal reflects updated city & depot
                </span>
              </div>
              <div className="flex items-start gap-1 text-slate-800">
                <QrCode className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>2. Master QR:</strong> Encodes this address into cryptographic payload
                </span>
              </div>
              <div className="flex items-start gap-1 text-slate-800">
                <Globe className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>3. Passport:</strong> Step 2 journey timeline updates live
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              id="cancel-address-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              {currentLang === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>

            <button
              id="confirm-save-address-btn"
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <Check className="w-4 h-4 text-slate-950" />
              <span>
                {currentLang === 'hi' ? 'सहेजें और विश्व स्तर पर लागू करें' : 'Confirm & Save Address (Apply Globally)'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
