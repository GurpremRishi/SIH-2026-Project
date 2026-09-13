export type UserRole = 'beekeeper' | 'collector';

export type Language = 'en' | 'hi';

export interface HiveTelemetry {
  hiveId: string;
  locationName: string;
  zone: string;
  healthScore: number;
  internalTemp: number; // °C
  coreHumidity: number; // %
  grossWeight: number; // kg
  resonance: number; // Hz
  activeCratesCount: number; // Total Active Beehive Crates
  queenStatus: string;
  batteryPct: number;
  solarInputWatts: number;
  lastUpdated: string;
}

export interface BeekeeperCrate {
  id: string;
  beekeeperId: string;
  beekeeperName: string;
  beekeeperAadhaarMasked: string;
  crateCount: number;
  harvestWeightKg: number;
  nectarSource: 'Mustard' | 'Acacia' | 'Multifloral' | 'Eucalyptus';
  gpsCoords: string;
  gpsLocationName: string;
  timestamp: string;
  qrPayload: string;
  qrDataUrl?: string;
  status: 'In Apiary' | 'In Transit' | 'Received at Centre';
}

export interface IntakeLedgerEntry {
  id: string;
  beekeeperId: string;
  beekeeperName: string;
  beekeeperAadhaarMasked?: string;
  crateBatchId: string;
  nectarSource: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  moisturePct: number;
  baseRatePerKg: number;
  moistureBonusPenalty: number;
  totalPayout: number;
  payoutStatus: 'Pending Verification' | 'Approved for DBT Transfer' | 'Settled';
  intakeTimestamp: string;
  pollenAnalysisStatus: 'Not Analyzed' | 'Passed' | 'Rejected';
  linkedPurityScore?: number;
  collectionHubStamp?: string;
}

export interface PollenBoundingBox {
  label: string;
  x: number; // %
  y: number; // %
  width: number; // %
  height: number; // %
  confidence: number;
  isAnomalous?: boolean;
}

export interface MelissopalynologyResult {
  sampleId: string;
  sampleName: string;
  status: 'PASSED' | 'REJECTED';
  grade: string;
  purityScore: number;
  dominantPollen: string;
  pollenDensity: string;
  speciesBreakdown: Array<{ name: string; percentage: number }>;
  c4SugarRisk: string;
  pollenCount: number;
  morphologyNotes: string;
  boundingBoxes: PollenBoundingBox[];
  imageUrl?: string;
  analyzedAt: string;
}

export interface LabCertificate {
  id: string;
  title: string;
  testType: 'C4 Sugar / SIRA-IRMS' | 'Karl Fischer Moisture' | 'Pesticide & HMF Residue';
  fileName: string;
  fileSizeKb: number;
  ipfsHash: string;
  sha256Fingerprint: string;
  uploadedAt: string;
  accreditedLab: string;
  resultStatus: 'COMPLIANT' | 'FAIL';
}

export interface MasterJarBatch {
  jarBatchId: string;
  batchTitle: string;
  netWeightGrams: number;
  beekeeperId: string;
  beekeeperName: string;
  beekeeperGps: string;
  collectionCentreGps?: string;
  collectionCentreName?: string;
  collectionCentreAddress?: string;
  floralSource: string;
  aiPurityScore: number;
  ipfsCertLink: string;
  polygonTxHash: string;
  blockNumber: number;
  mintTimestamp: string;
  jarQrDataUrl?: string;
  intakeBatchId: string;
  status: 'Minted on Polygon' | 'Ready for Dispatch';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: 'gemini' | 'domain-engine';
}
