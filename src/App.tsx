/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole, Language, BeekeeperCrate, IntakeLedgerEntry, LabCertificate, MasterJarBatch, HiveTelemetry } from './types';
import { Header } from './components/Header';
import { LoginPortalModal } from './components/LoginPortalModal';
import { BeekeeperDashboard } from './components/beekeeper/BeekeeperDashboard';
import { CollectorDashboard } from './components/collector/CollectorDashboard';
import { ConsumerProvenanceModal } from './components/ConsumerProvenanceModal';
import {
  initialHiveTelemetry,
  initialBeekeeperCrates,
  initialIntakeLedger,
  initialLabCertificates,
  initialMasterJarBatches,
} from './data/initialData';

export default function App() {
  // Global application states
  const [currentRole, setCurrentRole] = useState<UserRole>('beekeeper');
  const [userName, setUserName] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Shared application data states
  const [telemetry, setTelemetry] = useState<HiveTelemetry>(initialHiveTelemetry);
  const [beekeeperCrates, setBeekeeperCrates] = useState<BeekeeperCrate[]>(initialBeekeeperCrates);
  const [intakeLedger, setIntakeLedger] = useState<IntakeLedgerEntry[]>(initialIntakeLedger);
  const [labCertificates, setLabCertificates] = useState<LabCertificate[]>(initialLabCertificates);
  const [masterBatches, setMasterBatches] = useState<MasterJarBatch[]>(initialMasterJarBatches);

  // Consumer passport modal state
  const [isConsumerModalOpen, setIsConsumerModalOpen] = useState(false);
  const [selectedJarBatch, setSelectedJarBatch] = useState<MasterJarBatch | null>(null);

  // Global collection centre geotag & address state
  const [collectionCentreGps, setCollectionCentreGps] = useState<string>('27.2152° N, 77.4920° E');
  const [collectionCentreAddress, setCollectionCentreAddress] = useState<string>(
    'KVIC Regional Quality Hub #08, Main Mandi Road, Bharatpur, Rajasthan - 321001'
  );

  // Handlers
  const handleUpdateCollectionCentre = (newGps: string, newAddress: string) => {
    setCollectionCentreGps(newGps);
    setCollectionCentreAddress(newAddress);
    // Propagate updated address into existing master batches
    setMasterBatches((prev) =>
      prev.map((batch) => ({
        ...batch,
        collectionCentreGps: newGps,
        collectionCentreAddress: newAddress,
      }))
    );
    // Keep active selected modal batch in sync
    setSelectedJarBatch((prev) =>
      prev
        ? {
            ...prev,
            collectionCentreGps: newGps,
            collectionCentreAddress: newAddress,
          }
        : null
    );
    // Also propagate into intakeLedger records
    setIntakeLedger((prev) =>
      prev.map((item) => ({
        ...item,
        collectionHubStamp: newAddress,
      }))
    );
  };

  const handleAddCrate = (newCrate: BeekeeperCrate) => {
    setBeekeeperCrates((prev) => [newCrate, ...prev]);
  };

  const handleAddIntakeRecord = (newRecord: IntakeLedgerEntry) => {
    setIntakeLedger((prev) => [newRecord, ...prev]);
  };

  const handleAddCertificate = (newCert: LabCertificate) => {
    setLabCertificates((prev) => [newCert, ...prev]);
  };

  const handleAddMasterBatch = (newBatch: MasterJarBatch) => {
    setMasterBatches((prev) => [newBatch, ...prev]);
  };

  const handleOpenConsumerView = (batch: MasterJarBatch) => {
    setSelectedJarBatch(batch);
    setIsConsumerModalOpen(true);
  };

  const handleUpdateBatchStatus = (batchId: string, status: 'Passed' | 'Rejected', purity?: number) => {
    setIntakeLedger((prev) =>
      prev.map((item) =>
        item.id === batchId
          ? {
              ...item,
              pollenAnalysisStatus: status,
              linkedPurityScore: purity || item.linkedPurityScore,
            }
          : item
      )
    );
  };

  const handleRefreshTelemetry = () => {
    // Simulate slight natural live fluctuation in hive readings
    setTelemetry((prev) => ({
      ...prev,
      internalTemp: parseFloat((34.0 + Math.random() * 0.4).toFixed(1)),
      coreHumidity: Math.round(61 + Math.random() * 2),
      resonance: Math.round(243 + Math.random() * 5),
      grossWeight: parseFloat((41.7 + Math.random() * 0.3).toFixed(1)),
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-200 selection:text-amber-900">
      {/* Top Header Bar */}
      <Header
        currentRole={currentRole}
        userName={userName}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenConsumerView={() => handleOpenConsumerView(masterBatches[0])}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentRole === 'beekeeper' ? (
          <BeekeeperDashboard
            telemetry={telemetry}
            currentLang={currentLang}
            savedCrates={beekeeperCrates}
            onAddCrate={handleAddCrate}
            onRefreshTelemetry={handleRefreshTelemetry}
          />
        ) : (
          <CollectorDashboard
            currentLang={currentLang}
            intakeRecords={intakeLedger}
            onAddIntakeRecord={handleAddIntakeRecord}
            availableCrates={beekeeperCrates}
            certificates={labCertificates}
            onAddCertificate={handleAddCertificate}
            masterBatches={masterBatches}
            onAddMasterBatch={handleAddMasterBatch}
            onOpenConsumerView={handleOpenConsumerView}
            onUpdateBatchStatus={handleUpdateBatchStatus}
            collectionCentreGps={collectionCentreGps}
            collectionCentreAddress={collectionCentreAddress}
            onUpdateCollectionCentre={handleUpdateCollectionCentre}
          />
        )}
      </main>

      {/* Footer info bar */}
      <footer className="border-t border-amber-900/10 bg-white/70 py-4 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium">
            <span className="font-bold text-amber-800">HiveNexa</span> • KVIC Honey Mission Dual-Role Platform by Team <span className="font-bold text-slate-800">Rage Coders</span>
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>IOT HIVE: H-001</span>
            <span>•</span>
            <span>POLYGON POS: 0x7f9a...89c2</span>
            <span>•</span>
            <span>IPFS: CIDv1</span>
          </div>
        </div>
      </footer>

      {/* Distinct Role Switcher Modal */}
      <LoginPortalModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        onLogin={(role, name) => { setCurrentRole(role); setUserName(name); }}
        currentLang={currentLang}
      />

      {/* Consumer Provenance Modal (Farm-to-Table Transparency) */}
      <ConsumerProvenanceModal
        isOpen={isConsumerModalOpen}
        onClose={() => setIsConsumerModalOpen(false)}
        batch={selectedJarBatch || masterBatches[0] || null}
        labCertificates={labCertificates}
        currentLang={currentLang}
        collectionCentreGps={collectionCentreGps}
        collectionCentreAddress={collectionCentreAddress}
      />
    </div>
  );
}
