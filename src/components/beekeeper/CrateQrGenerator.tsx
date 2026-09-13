import React, { useState, useEffect } from 'react';
import { BeekeeperCrate, Language } from '../../types';
import { translations } from '../../translations';
import { generateQrDataUrl, generateCryptoHash } from '../../utils/qrHelper';
import {
  QrCode,
  MapPin,
  Calendar,
  Scale,
  Printer,
  Check,
  Copy,
  Package,
  Shield,
  Sparkles,
  Layers,
  Navigation,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  SlidersHorizontal,
  Eye,
} from 'lucide-react';

interface CrateQrGeneratorProps {
  currentLang: Language;
  onAddCrate: (newCrate: BeekeeperCrate) => void;
  savedCrates: BeekeeperCrate[];
}

export const CrateQrGenerator: React.FC<CrateQrGeneratorProps> = ({
  currentLang,
  onAddCrate,
  savedCrates,
}) => {
  const t = translations[currentLang];

  // 1. Form states - allowing flexible custom crate count up to 50 without hard reset on empty
  const [numCrates, setNumCrates] = useState<number | ''>(1);
  const [harvestWeight, setHarvestWeight] = useState<number>(27.5);
  const [nectarSource, setNectarSource] = useState<'Mustard' | 'Acacia' | 'Multifloral' | 'Eucalyptus'>('Mustard');

  // 2. Real Dynamic GPS & Reverse Geocoding states
  const [latitude, setLatitude] = useState<string>('27.1751');
  const [longitude, setLongitude] = useState<string>('78.0421');
  const [gpsCoords, setGpsCoords] = useState<string>('27.1751° N, 78.0421° E');
  const [gpsLocationName, setGpsLocationName] = useState<string>('Kumher Village, Bharatpur Apiary Cluster');
  const [isGpsLocked, setIsGpsLocked] = useState<boolean>(true);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsStatusFeedback, setGpsStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 3. Active generated sticker & batch list states
  const [generatedBatch, setGeneratedBatch] = useState<BeekeeperCrate[]>([]);
  const [activeSticker, setActiveSticker] = useState<BeekeeperCrate | null>(null);
  const [selectedBatchIndex, setSelectedBatchIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // 4. Modal states: Dedicated View Sticker Modal & Print Preview Modal
  const [isStickerModalOpen, setIsStickerModalOpen] = useState<boolean>(false);
  const [selectedModalCrate, setSelectedModalCrate] = useState<BeekeeperCrate | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printTargetCrate, setPrintTargetCrate] = useState<BeekeeperCrate | null>(null);
  const [copiedModalPayload, setCopiedModalPayload] = useState<boolean>(false);

  // Helper to format coordinates string
  const formatGpsString = (lat: number, lng: number) => {
    const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
    const lngStr = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
    return `${latStr}, ${lngStr}`;
  };

  // Dynamic Latitude change
  const handleLatitudeChange = (val: string) => {
    setLatitude(val);
    const latNum = parseFloat(val);
    const lngNum = parseFloat(longitude);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      setGpsCoords(formatGpsString(latNum, lngNum));
    }
  };

  // Dynamic Longitude change
  const handleLongitudeChange = (val: string) => {
    setLongitude(val);
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(val);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      setGpsCoords(formatGpsString(latNum, lngNum));
    }
  };

  // Real Dynamic Geolocation & Reverse Geocoding
  const handleAutoDetectGps = () => {
    setIsDetectingGps(true);
    setGpsStatusFeedback(null);

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setIsDetectingGps(false);
      setGpsStatusFeedback({
        type: 'error',
        message: currentLang === 'hi'
          ? 'आपके ब्राउज़र में जियोलोकेशन समर्थित नहीं है।'
          : 'Geolocation is not supported by your browser.',
      });
      return;
    }

    // Trigger explicit browser location permission prompt
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy);

        const latFixed = lat.toFixed(4);
        const lngFixed = lng.toFixed(4);
        const formatted = formatGpsString(lat, lng);

        // Dynamically update text fields for Latitude and Longitude
        setLatitude(latFixed);
        setLongitude(lngFixed);
        setGpsCoords(formatted);
        setIsGpsLocked(true);

        // Dynamic Reverse Geocoding using OpenStreetMap Nominatim
        let resolvedLocName = '';
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4500);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
            {
              signal: controller.signal,
              headers: { 'Accept': 'application/json' },
            }
          );
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
              const addr = data.address;
              const locality = addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || addr.town || addr.city_district || addr.city;
              const district = addr.state_district || addr.county || addr.district;
              const state = addr.state;
              const pieces = [locality, district, state].filter(Boolean);
              if (pieces.length > 0) {
                resolvedLocName = `${pieces.join(', ')} (Apiary GPS Fix)`;
              } else if (data.display_name) {
                resolvedLocName = data.display_name.split(',').slice(0, 3).join(', ').trim();
              }
            }
          }
        } catch (err) {
          console.warn('Reverse geocode error or timeout, using dynamic coordinate mapping:', err);
        }

        // Dynamic string mapping fallback based on coordinates if offline or rate limited
        if (!resolvedLocName) {
          if (lat >= 26.5 && lat <= 28.5 && lng >= 76.5 && lng <= 78.5) {
            resolvedLocName = `Bharatpur-Alwar Mustard Belt (Live Fix ±${accuracy}m)`;
          } else if (lat >= 28.0 && lat <= 29.5 && lng >= 76.5 && lng <= 78.0) {
            resolvedLocName = `Haryana-NCR Agro Zone (Live Fix ±${accuracy}m)`;
          } else if (lat >= 25.0 && lat <= 27.5 && lng >= 77.0 && lng <= 81.0) {
            resolvedLocName = `Chambal-Central India Apiary Zone (Live Fix ±${accuracy}m)`;
          } else {
            resolvedLocName = `Field Apiary Node (${latFixed}, ${lngFixed}) • Accuracy ±${accuracy}m`;
          }
        }

        setGpsLocationName(resolvedLocName);
        setGpsStatusFeedback({
          type: 'success',
          message: currentLang === 'hi'
            ? `सटीक जीपीएस प्राप्त (±${accuracy}m): ${resolvedLocName}`
            : `Live GPS fix locked (±${accuracy}m): ${resolvedLocName}`,
        });
        setIsDetectingGps(false);
      },
      (err) => {
        setIsDetectingGps(false);
        let msg = currentLang === 'hi'
          ? 'स्थान अनुमति अस्वीकृत या अनुपलब्ध। आप नीचे दिए गए बॉक्स में अक्षांश और देशांतर मैन्युअल दर्ज कर सकते हैं।'
          : 'Location permission denied or unavailable. You can enter Latitude and Longitude manually below.';
        if (err.code === err.TIMEOUT) {
          msg = currentLang === 'hi' ? 'जीपीएस अनुरोध समय समाप्त।' : 'GPS request timed out.';
        }
        setGpsStatusFeedback({ type: 'error', message: msg });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Initialize with the first saved crate if available
  useEffect(() => {
    if (!activeSticker && savedCrates.length > 0) {
      const first = savedCrates[0];
      if (!first.qrDataUrl) {
        generateQrDataUrl(first.qrPayload).then((url) => {
          setActiveSticker({ ...first, qrDataUrl: url });
        });
      } else {
        setActiveSticker(first);
      }
    }
  }, [savedCrates]);

  // Handle number of crates typing
  const handleCratesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      setNumCrates('');
      return;
    }
    const clean = raw.replace(/\D/g, '');
    if (clean === '') {
      setNumCrates('');
      return;
    }
    const num = parseInt(clean, 10);
    // Allow custom typing freely up to max 50 crates
    setNumCrates(num > 50 ? 50 : num);
  };

  const handleCratesBlur = () => {
    if (numCrates === '' || numCrates < 1) {
      setNumCrates(1);
    }
  };

  // Handle generation of N unique crate QR codes
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const effectiveCount = typeof numCrates === 'number' && numCrates > 0 ? Math.min(50, numCrates) : 1;
    const batchSeed = Math.floor(100 + Math.random() * 900);
    const beekeeperId = 'BK-KVIC-RJ-8842';
    const beekeeperName = currentLang === 'hi' ? 'रामेश्वर सिंह मीणा' : 'Rameshwar Singh Meena';
    const individualWeight = parseFloat((harvestWeight / effectiveCount).toFixed(1));
    const newCratesList: BeekeeperCrate[] = [];

    for (let i = 1; i <= effectiveCount; i++) {
      const crateNumberStr = String(i).padStart(2, '0');
      const crateId = `CRATE-H001-B${batchSeed}-${crateNumberStr}`;
      const now = new Date();
      const timestamp = `${now.toISOString().replace('T', ' ').substring(0, 16)} IST`;
      const hash = generateCryptoHash(`${crateId}-${beekeeperId}-${individualWeight}-${timestamp}-${gpsCoords}`);

      const payloadObj = {
        crateId,
        crateIndex: `${i} / ${effectiveCount}`,
        totalBatchCrates: effectiveCount,
        beekeeperId,
        beekeeperName,
        beekeeperAadhaar: 'XXXX-XXXX-4912',
        gps: gpsCoords,
        location: gpsLocationName,
        floralSource: nectarSource,
        individualCrateWeightKg: individualWeight,
        totalHarvestBatchKg: harvestWeight,
        timestamp,
        cryptoHash: hash,
        kvicMandate: 'KVIC-HONEY-MISSION-2026',
        fssaiStandard: 'FSSAI-IS-4941-CERTIFIED',
      };

      const payloadStr = JSON.stringify(payloadObj, null, 2);
      const qrUrl = await generateQrDataUrl(payloadStr);

      const crateItem: BeekeeperCrate = {
        id: crateId,
        beekeeperId,
        beekeeperName,
        beekeeperAadhaarMasked: 'XXXX-XXXX-4912',
        crateCount: 1,
        harvestWeightKg: individualWeight,
        nectarSource,
        gpsCoords,
        gpsLocationName,
        timestamp,
        qrPayload: payloadStr,
        qrDataUrl: qrUrl,
        status: 'In Apiary',
      };

      newCratesList.push(crateItem);
      onAddCrate(crateItem);
    }

    setGeneratedBatch(newCratesList);
    setSelectedBatchIndex(0);
    setActiveSticker(newCratesList[0]);
    setIsGenerating(false);
  };

  const handleSelectCrateFromBatch = (index: number) => {
    setSelectedBatchIndex(index);
    if (generatedBatch[index]) {
      setActiveSticker(generatedBatch[index]);
    }
  };

  const handleCopyPayload = () => {
    if (!activeSticker) return;
    navigator.clipboard.writeText(activeSticker.qrPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Dynamic "View Sticker" handler for any clicked row in the Recent Generated Crate Batches table
  const handleViewCrateSticker = async (crate: BeekeeperCrate) => {
    let qrUrl = crate.qrDataUrl;
    if (!qrUrl) {
      qrUrl = await generateQrDataUrl(crate.qrPayload);
    }
    const populatedCrate: BeekeeperCrate = { ...crate, qrDataUrl: qrUrl };

    // Update active sticker in the inline preview
    setActiveSticker(populatedCrate);

    // Pre-load THAT specific crate into the dedicated QR Modal/Seal
    setSelectedModalCrate(populatedCrate);
    setIsStickerModalOpen(true);
  };

  // Print handler: open dedicated Print Preview Modal and ready thermal seal
  const handleOpenPrintModal = async (crate: BeekeeperCrate) => {
    let qrUrl = crate.qrDataUrl;
    if (!qrUrl) {
      qrUrl = await generateQrDataUrl(crate.qrPayload);
    }
    const populatedCrate: BeekeeperCrate = { ...crate, qrDataUrl: qrUrl };
    setPrintTargetCrate(populatedCrate);
    setIsPrintModalOpen(true);
  };

  // Dedicated Print function executing window.print()
  const handleExecutePrint = () => {
    window.print();
  };

  // Standalone popup print fallback for thermal printer drivers
  const handleOpenPrintWindow = (crate: BeekeeperCrate) => {
    const printWin = window.open('', '_blank', 'width=450,height=600');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print Crate Label - ${crate.id}</title>
          <style>
            @page { size: auto; margin: 6mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 12px; color: #000; background: #fff; }
            .sticker { border: 2px dashed #000; padding: 14px; border-radius: 6px; max-width: 360px; margin: 0 auto; }
            .header { border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
            .kvic-badge { font-weight: 900; font-size: 15px; border: 2px solid #000; padding: 2px 6px; }
            .qr-wrap { text-align: center; margin: 10px 0; }
            .qr-img { width: 140px; height: 140px; border: 1px solid #000; padding: 4px; }
            .field { margin: 5px 0; font-size: 11px; }
            .label { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #333; }
            .value { font-weight: bold; }
            .footer { border-top: 1px solid #000; margin-top: 10px; padding-top: 6px; font-size: 9px; font-family: monospace; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="sticker">
            <div class="header">
              <span class="kvic-badge">KVIC</span>
              <div style="text-align: center;">
                <div style="font-size: 11px; font-weight: bold;">HONEY MISSION CRATE SEAL</div>
                <div style="font-size: 8px;">GOVT. OF INDIA • RAW HARVEST</div>
              </div>
              <span style="font-family: monospace; font-size: 11px; font-weight: bold;">${crate.id}</span>
            </div>
            <div class="qr-wrap">
              <img src="${crate.qrDataUrl}" class="qr-img" alt="QR" />
              <div style="font-size: 9px; font-family: monospace; font-weight: bold; margin-top: 3px;">SCAN FOR GPS PROVENANCE</div>
            </div>
            <div class="field">
              <div class="label">Beekeeper Identity</div>
              <div class="value">${crate.beekeeperName} (${crate.beekeeperId})</div>
            </div>
            <div class="field">
              <div class="label">GPS Coordinates & Location</div>
              <div class="value">${crate.gpsCoords}</div>
              <div style="font-size: 10px; color: #444;">${crate.gpsLocationName}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 6px 0;">
              <div>
                <div class="label">Net Weight</div>
                <div class="value" style="font-size: 14px;">${crate.harvestWeightKg} kg</div>
              </div>
              <div>
                <div class="label">Floral Source</div>
                <div class="value">${crate.nectarSource}</div>
              </div>
            </div>
            <div class="field">
              <div class="label">Timestamp</div>
              <div class="value" style="font-family: monospace; font-size: 10px;">${crate.timestamp}</div>
            </div>
            <div class="footer">
              <span>HASH: SHA-256 SECURED</span>
              <span>READY FOR INTAKE</span>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
        </html>
      `);
      printWin.document.close();
    } else {
      window.print();
    }
  };

  const currentCrateForPrint = printTargetCrate || activeSticker || savedCrates[0];
  const effectiveCrateCount = typeof numCrates === 'number' && numCrates > 0 ? numCrates : 1;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-amber-900/15 shadow-sm mt-6">
      {/* Title */}
      <div className="pb-4 border-b border-amber-900/10">
        <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
          <Package className="w-4 h-4" />
          <span>{currentLang === 'hi' ? 'क्रेट-स्तरीय डिजिटल ट्रैसेबिलिटी' : 'Crate-Level Traceability'}</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
          {t.crateGenTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t.crateGenDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Generator Form (Large Buttons, High Contrast) */}
        <form onSubmit={handleGenerate} className="lg:col-span-6 space-y-4">
          {/* Beekeeper Identity Card */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-amber-900 uppercase">
                {t.registeredApiaryIdentity}
              </span>
              <p className="text-xs font-bold text-slate-900">
                BK-KVIC-RJ-8842 ({currentLang === 'hi' ? 'रामेश्वर सिंह मीणा' : 'Rameshwar Singh Meena'})
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
              <Shield className="w-3.5 h-3.5" /> {t.kvicKycVerified}
            </span>
          </div>

          {/* Real Dynamic GPS Auto-Detection & Reverse Geocoding Box (Bug 2 Fix) */}
          <div className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-xl p-3.5 transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500" />
                {t.gpsCoordinates}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {isGpsLocked ? t.gpsLocked : (currentLang === 'hi' ? 'सक्रिय' : 'Live')}
                </span>
              </div>
            </div>

            {/* Auto-Detect GPS Button directly invoking browser navigator.geolocation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div>
                <p className="text-sm font-mono font-bold text-slate-900">
                  {gpsCoords}
                </p>
                <p className="text-[11px] text-slate-600 font-medium">
                  {gpsLocationName}
                </p>
              </div>
              <button
                type="button"
                id="auto-detect-gps-btn"
                onClick={handleAutoDetectGps}
                disabled={isDetectingGps}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                <span>{isDetectingGps ? t.detectingGps : t.autoDetectGpsBtn}</span>
              </button>
            </div>

            {/* Real-time GPS status feedback */}
            {gpsStatusFeedback && (
              <div
                className={`text-xs p-2 rounded-lg flex items-start gap-1.5 ${
                  gpsStatusFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {gpsStatusFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{gpsStatusFeedback.message}</span>
              </div>
            )}

            {/* Dynamic Editable Latitude & Longitude Text Fields */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                  {t.manualGpsPrompt}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">WGS-84</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    {t.latitudeLabel}
                  </label>
                  <input
                    id="input-latitude"
                    type="text"
                    value={latitude}
                    onChange={(e) => handleLatitudeChange(e.target.value)}
                    placeholder="27.1751"
                    className="w-full text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-none bg-slate-50 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    {t.longitudeLabel}
                  </label>
                  <input
                    id="input-longitude"
                    type="text"
                    value={longitude}
                    onChange={(e) => handleLongitudeChange(e.target.value)}
                    placeholder="78.0421"
                    className="w-full text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-none bg-slate-50 text-slate-900"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                  {t.villageClusterLabel}
                </label>
                <input
                  id="input-village-name"
                  type="text"
                  value={gpsLocationName}
                  onChange={(e) => setGpsLocationName(e.target.value)}
                  placeholder="Village / Apiary Cluster"
                  className="w-full text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 focus:border-amber-500 focus:outline-none bg-slate-50 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Number of Crates (Bug 1 Fix: flexible typing up to 50 crates) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {t.numCrates}
              </label>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {currentLang === 'hi' ? '1 से 50 बक्से (कस्टम टाइप करें)' : '1 - 50 Crates (Freely Type)'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="input-num-crates"
                type="number"
                min="1"
                max="50"
                value={numCrates}
                onChange={handleCratesChange}
                onBlur={handleCratesBlur}
                placeholder="1"
                className="w-full text-base font-bold px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:outline-none bg-white text-slate-900 transition-colors"
                required
              />
              <div className="flex gap-1.5 shrink-0">
                {[1, 3, 5, 10].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setNumCrates(val)}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${
                      numCrates === val
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {currentLang === 'hi'
                ? `प्रत्येक क्रेट के लिए अलग क्यूआर कोड (उदा. CRATE-...-01, -02) जनरेट होगा। अधिकतम 50 क्रेट तक कोई भी संख्या टाइप करें।`
                : `Generates ${effectiveCrateCount} individual unique QR codes (e.g., CRATE-...-01, -02). You can freely type up to 50.`}
            </p>
          </div>

          {/* Total Harvest Weight (kg) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.harvestWeight}
            </label>
            <div className="relative">
              <input
                id="input-harvest-weight"
                type="number"
                step="0.5"
                min="1"
                max="500"
                value={harvestWeight}
                onChange={(e) => setHarvestWeight(parseFloat(e.target.value) || 0)}
                className="w-full text-base font-bold px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:outline-none bg-white text-slate-900 transition-colors"
                required
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                kg
              </span>
            </div>
            {effectiveCrateCount > 1 && (
              <p className="text-[11px] font-semibold text-amber-800 mt-1">
                {currentLang === 'hi'
                  ? `औसत प्रति क्रेट: ${(harvestWeight / effectiveCrateCount).toFixed(1)} किग्रा (स्वतः विभाजित)`
                  : `Average per crate: ${(harvestWeight / effectiveCrateCount).toFixed(1)} kg each (auto-divided)`}
              </p>
            )}
          </div>

          {/* Nectar Source */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.nectarSource}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'Mustard', label: t.mustardFlower, tag: t.mustardTag },
                { id: 'Acacia', label: t.acaciaFlower, tag: t.acaciaTag },
                { id: 'Multifloral', label: t.multifloralFlower, tag: t.multifloralTag },
                { id: 'Eucalyptus', label: t.eucalyptusFlower, tag: t.eucalyptusTag },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setNectarSource(item.id as any)}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    nectarSource === item.id
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-amber-200'
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.tag}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Large High-Contrast Generate Button */}
          <button
            id="generate-crate-qr-submit-btn"
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
          >
            <QrCode className="w-5 h-5" />
            <span>
              {isGenerating
                ? t.generatingBatch
                : `${t.generateQrBtn} (${effectiveCrateCount} ${currentLang === 'hi' ? 'विशिष्ट क्यूआर' : 'Unique QRs'})`}
            </span>
          </button>
        </form>

        {/* Right Column: Physical Batch Sticker Preview */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {t.batchStickerTitle}
              </h3>
              {activeSticker && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPayload}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPayload ? t.copiedText : t.viewPayload}</span>
                  </button>
                  <button
                    id="print-crate-sticker-btn"
                    onClick={() => handleOpenPrintModal(activeSticker)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors border border-amber-300 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t.printSticker}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Batch Selector Bar if multiple crates generated */}
            {generatedBatch.length > 1 && (
              <div className="mb-3 p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">
                  {t.viewingCrateIndex} {selectedBatchIndex + 1} {t.ofWord} {generatedBatch.length}:
                </span>
                <div className="flex gap-1 overflow-x-auto max-w-[240px]">
                  {generatedBatch.map((cr, idx) => (
                    <button
                      key={cr.id}
                      type="button"
                      onClick={() => handleSelectCrateFromBatch(idx)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-colors cursor-pointer ${
                        selectedBatchIndex === idx
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      #{idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sticker Visual Card (Tamper-evident styling) */}
            {activeSticker ? (
              <div
                id="active-crate-sticker-card"
                className="bg-[#FAF8F5] border-2 border-dashed border-amber-400/80 rounded-2xl p-5 relative overflow-hidden shadow-sm"
              >
                {/* Official KVIC Watermark Header */}
                <div className="flex items-center justify-between pb-3 border-b border-amber-900/15">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-black text-sm flex items-center justify-center">
                      KVIC
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold tracking-wider text-slate-900 uppercase">
                        {currentLang === 'hi' ? 'केवीआईसी शहद मिशन क्रेट सील' : 'KVIC Honey Mission Crate Seal'}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        GOVT. OF INDIA • RAW PRODUCE LOGISTICS
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    {activeSticker.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-4 items-center">
                  {/* High-res Scannable QR Code */}
                  <div className="sm:col-span-5 flex flex-col items-center">
                    <div className="bg-white p-2.5 rounded-xl border-2 border-slate-800 shadow-xs">
                      {activeSticker.qrDataUrl ? (
                        <img
                          src={activeSticker.qrDataUrl}
                          alt="Crate QR"
                          className="w-36 h-36 object-contain"
                        />
                      ) : (
                        <div className="w-36 h-36 bg-slate-100 animate-pulse rounded" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-1 font-bold text-center">
                      {t.scanForProvenance}
                    </span>
                  </div>

                  {/* Metadata fields baked in: Beekeeper ID, GPS, Timestamp */}
                  <div className="sm:col-span-7 space-y-2 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {currentLang === 'hi' ? 'बीकीपर विवरण एवं आधार' : 'Beekeeper ID & Aadhaar'}
                      </span>
                      <p className="font-bold text-slate-900 font-mono">
                        {activeSticker.beekeeperId}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        {activeSticker.beekeeperName} ({activeSticker.beekeeperAadhaarMasked})
                      </p>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {t.gpsCoordinates}
                      </span>
                      <p className="font-bold text-slate-900 font-mono flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span>{activeSticker.gpsCoords}</span>
                      </p>
                      <p className="text-slate-500 text-[10px]">
                        {activeSticker.gpsLocationName}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {t.weight}
                        </span>
                        <p className="font-extrabold text-amber-900 text-sm">
                          {activeSticker.harvestWeightKg} kg
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {t.nectarSource}
                        </span>
                        <p className="font-bold text-slate-900 text-xs">
                          {activeSticker.nectarSource}
                        </p>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 pt-1">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{activeSticker.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Barcode graphic footer */}
                <div className="mt-4 pt-2.5 border-t border-amber-900/10 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{t.sha256Secured}</span>
                  <div className="h-4 flex items-center gap-0.5">
                    {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7].map((w, idx) => (
                      <span
                        key={idx}
                        className="h-full bg-slate-700"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                  <span>{t.statusReadyIntake}</span>
                </div>
              </div>
            ) : (
              <div className="h-64 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                <QrCode className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-xs font-semibold">
                  {currentLang === 'hi' ? 'क्रेट स्टिकर देखने हेतु जनरेट दबाएं' : 'Click Generate to preview Crate Sticker'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Crate Batches Table with Dynamic "View Sticker" (Bug 3 Fix) */}
      <div className="mt-6 pt-5 border-t border-amber-900/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            {t.savedCratesTitle} ({savedCrates.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-[#FAF8F5] text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">{t.crateId}</th>
                <th className="py-2.5 px-3">{t.nectarSource}</th>
                <th className="py-2.5 px-3">{t.weight}</th>
                <th className="py-2.5 px-3">{t.gpsTagged}</th>
                <th className="py-2.5 px-3">{t.date}</th>
                <th className="py-2.5 px-3">{t.status}</th>
                <th className="py-2.5 px-3 text-right">
                  {currentLang === 'hi' ? 'कार्य' : 'Action'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {savedCrates.map((crate) => (
                <tr key={crate.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {crate.id}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {crate.nectarSource}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-amber-900">
                    {crate.harvestWeightKg} kg
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                    {crate.gpsCoords}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {crate.timestamp}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {crate.status === 'In Apiary' && currentLang === 'hi' ? 'एपियरी में' : crate.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-2">
                    <button
                      id={`view-sticker-btn-${crate.id}`}
                      onClick={() => handleViewCrateSticker(crate)}
                      className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md transition-colors border border-amber-200"
                    >
                      <Eye className="w-3 h-3 text-amber-700" />
                      <span>{t.viewStickerBtn}</span>
                    </button>
                    <button
                      onClick={() => handleOpenPrintModal(crate)}
                      title={t.printSticker}
                      className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors border border-slate-200 cursor-pointer"
                    >
                      <Printer className="w-3 h-3 text-slate-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Dedicated Dynamic Crate QR Seal & Provenance Modal (Bug 3 Fix)  */}
      {/* ========================================================================= */}
      {isStickerModalOpen && selectedModalCrate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-amber-900/20 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-black text-base border border-white/20">
                  KVIC
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base tracking-wide">
                    {t.crateStickerModalTitle}
                  </h3>
                  <p className="text-xs text-amber-200 font-mono">
                    {selectedModalCrate.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStickerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 max-h-[80vh] overflow-y-auto space-y-4">
              {/* Sticker Card Display */}
              <div className="bg-[#FAF8F5] border-2 border-dashed border-amber-400 rounded-2xl p-4 relative">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* High-res Scannable QR */}
                  <div className="bg-white p-3 rounded-xl border-2 border-slate-900 shadow-sm shrink-0 text-center">
                    {selectedModalCrate.qrDataUrl ? (
                      <img
                        src={selectedModalCrate.qrDataUrl}
                        alt="Scannable QR Code"
                        className="w-40 h-40 object-contain mx-auto"
                      />
                    ) : (
                      <div className="w-40 h-40 bg-slate-100 animate-pulse rounded" />
                    )}
                    <p className="text-[10px] font-mono font-bold text-slate-500 mt-1">
                      {t.scanForProvenance}
                    </p>
                  </div>

                  {/* Metadata fields */}
                  <div className="space-y-2 flex-1 w-full text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        {currentLang === 'hi' ? 'क्रेट पहचान' : 'Crate Identity'}
                      </span>
                      <p className="font-mono font-black text-amber-900 text-sm">
                        {selectedModalCrate.id}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          {t.weight}
                        </span>
                        <p className="font-extrabold text-amber-950 text-base">
                          {selectedModalCrate.harvestWeightKg} kg
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          {t.nectarSource}
                        </span>
                        <p className="font-bold text-slate-800">
                          {selectedModalCrate.nectarSource}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        {t.gpsCoordinates}
                      </span>
                      <p className="font-mono font-bold text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span>{selectedModalCrate.gpsCoords}</span>
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {selectedModalCrate.gpsLocationName}
                      </p>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        {t.date} & {currentLang === 'hi' ? 'बीकीपर' : 'Beekeeper'}
                      </span>
                      <p className="font-semibold text-slate-800 text-[11px]">
                        {selectedModalCrate.beekeeperName} ({selectedModalCrate.beekeeperId})
                      </p>
                      <p className="font-mono text-slate-500 text-[10px] mt-0.5">
                        {selectedModalCrate.timestamp}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cryptographic SHA-256 string */}
                <div className="mt-3 pt-2 border-t border-amber-900/10 flex items-center justify-between text-[10px] font-mono text-slate-600">
                  <span>{t.sha256Secured}</span>
                  <span className="text-emerald-700 font-bold">{t.statusReadyIntake}</span>
                </div>
              </div>

              {/* Raw JSON Payload */}
              <div className="bg-slate-900 text-slate-200 rounded-xl p-3 text-[11px] font-mono overflow-x-auto max-h-36">
                <div className="flex items-center justify-between mb-1 text-slate-400">
                  <span className="text-[10px] font-bold uppercase">Encrypted QR Payload Data</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedModalCrate.qrPayload);
                      setCopiedModalPayload(true);
                      setTimeout(() => setCopiedModalPayload(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                  >
                    {copiedModalPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedModalPayload ? t.copiedText : 'Copy Payload'}</span>
                  </button>
                </div>
                <pre className="text-[10px] leading-relaxed">{selectedModalCrate.qrPayload}</pre>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsStickerModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {t.closeBtn}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenPrintModal(selectedModalCrate);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.printSticker}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Dedicated Thermal / Sticker Print Preview Modal (Bug 4 Fix)      */}
      {/* ========================================================================= */}
      {isPrintModalOpen && currentCrateForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">
                    {t.printThermalModalTitle}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {t.thermalReceiptFormat}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Print Preview Container (Pure Black and White Thermal Layout) */}
            <div className="p-5 bg-slate-100 flex justify-center">
              <div className="bg-white border-2 border-dashed border-black rounded-lg p-4 w-[340px] text-black font-sans shadow-md">
                <div className="border-b-2 border-black pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm border-2 border-black px-1.5 py-0.5 rounded">
                      KVIC
                    </span>
                    <div>
                      <div className="text-[10px] font-black tracking-wider uppercase">HONEY MISSION</div>
                      <div className="text-[8px] font-mono">GOVT. OF INDIA</div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-black">
                    {currentCrateForPrint.id}
                  </span>
                </div>

                <div className="text-center my-3">
                  {currentCrateForPrint.qrDataUrl ? (
                    <img
                      src={currentCrateForPrint.qrDataUrl}
                      alt="Thermal QR"
                      className="w-36 h-36 mx-auto border border-black p-1"
                    />
                  ) : (
                    <div className="w-36 h-36 mx-auto bg-slate-200" />
                  )}
                  <div className="text-[9px] font-mono font-bold mt-1">
                    SCAN FOR GPS PROVENANCE
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] border-t border-black pt-2">
                  <div className="flex justify-between">
                    <span className="font-bold uppercase text-[9px]">Beekeeper:</span>
                    <span className="font-semibold">{currentCrateForPrint.beekeeperName} ({currentCrateForPrint.beekeeperId})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase text-[9px]">Net Crate Wt:</span>
                    <span className="font-black text-sm">{currentCrateForPrint.harvestWeightKg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase text-[9px]">Flora Source:</span>
                    <span className="font-semibold">{currentCrateForPrint.nectarSource}</span>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-[9px] block">Apiary GPS:</span>
                    <span className="font-mono text-[10px] block">{currentCrateForPrint.gpsCoords}</span>
                    <span className="text-[9px] text-slate-700 block">{currentCrateForPrint.gpsLocationName}</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-700 pt-1 border-t border-dotted border-black flex justify-between">
                    <span>{currentCrateForPrint.timestamp}</span>
                    <span>READY FOR INTAKE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Print Modal Footer with Direct Print Actions */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {t.closeBtn}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  id="print-standalone-window-btn"
                  onClick={() => handleOpenPrintWindow(currentCrateForPrint)}
                  className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {currentLang === 'hi' ? 'प्रिंट विंडो खोलें' : 'Thermal Window'}
                </button>
                <button
                  type="button"
                  id="execute-print-now-btn"
                  onClick={handleExecutePrint}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.sendToPrinter}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HIDDEN IN SCREEN, VISIBLE ON PRINT: Dedicated @media print Thermal Layout  */}
      {/* ========================================================================= */}
      <div id="printable-crate-seal" className="hidden">
        {currentCrateForPrint && (
          <div style={{ fontFamily: 'monospace', color: '#000000', background: '#ffffff', padding: '10px' }}>
            <div style={{ borderBottom: '2px solid #000', paddingBottom: '6px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ border: '2px solid #000', padding: '2px 5px', fontWeight: 'bold', fontSize: '14px' }}>KVIC</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold' }}>HONEY MISSION CRATE SEAL</div>
                <div style={{ fontSize: '8px' }}>GOVT. OF INDIA • RAW HARVEST</div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{currentCrateForPrint.id}</span>
            </div>
            <div style={{ textAlign: 'center', margin: '10px 0' }}>
              {currentCrateForPrint.qrDataUrl && (
                <img
                  src={currentCrateForPrint.qrDataUrl}
                  alt="QR"
                  style={{ width: '150px', height: '150px', border: '1px solid #000', padding: '4px', margin: '0 auto', display: 'block' }}
                />
              )}
              <div style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '4px' }}>SCAN FOR GPS PROVENANCE</div>
            </div>
            <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
              <div><strong>Beekeeper:</strong> {currentCrateForPrint.beekeeperName} ({currentCrateForPrint.beekeeperId})</div>
              <div><strong>Net Crate Wt:</strong> <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{currentCrateForPrint.harvestWeightKg} kg</span></div>
              <div><strong>Floral Source:</strong> {currentCrateForPrint.nectarSource}</div>
              <div><strong>GPS:</strong> {currentCrateForPrint.gpsCoords}</div>
              <div style={{ fontSize: '9px' }}>{currentCrateForPrint.gpsLocationName}</div>
              <div style={{ fontSize: '9px', marginTop: '4px' }}><strong>Timestamp:</strong> {currentCrateForPrint.timestamp}</div>
            </div>
            <div style={{ borderTop: '1px solid #000', marginTop: '8px', paddingTop: '4px', fontSize: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>HASH: SHA-256 SECURED</span>
              <span>STATUS: READY FOR INTAKE</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
