import React, { useState, useRef } from 'react';
import { LabCertificate, Language } from '../../types';
import { translations } from '../../translations';
import { generateIpfsCid, generateCryptoHash } from '../../utils/qrHelper';
import { FileText, Upload, CheckCircle2, ShieldCheck, Copy, Check, ExternalLink, Hash, Lock } from 'lucide-react';

interface LabCertificateUploaderProps {
  currentLang: Language;
  certificates: LabCertificate[];
  onAddCertificate: (cert: LabCertificate) => void;
}

export const LabCertificateUploader: React.FC<LabCertificateUploaderProps> = ({
  currentLang,
  certificates,
  onAddCertificate,
}) => {
  const t = translations[currentLang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [testType, setTestType] = useState<'C4 Sugar / SIRA-IRMS' | 'Karl Fischer Moisture' | 'Pesticide & HMF Residue'>('C4 Sugar / SIRA-IRMS');
  const [accreditedLab, setAccreditedLab] = useState('National Bee Board & NABL Accredited Center #08');
  const [generatedIpfs, setGeneratedIpfs] = useState<string>('ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco');
  const [generatedSha256, setGeneratedSha256] = useState<string>('3b8e72f9c49012a84b5e6791d293847291a0293847b2c91a7e2839401f893e21');
  const [copiedHash, setCopiedHash] = useState(false);
  const [isHashing, setIsHashing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setIsHashing(true);

      // Simulate cryptographic CID computation
      setTimeout(() => {
        const cid = generateIpfsCid(file.name + Date.now());
        const sha = generateCryptoHash(file.name + file.size) + generateCryptoHash(file.type);
        setGeneratedIpfs(cid);
        setGeneratedSha256(sha.replace('0x', '') + 'a48e7192f582c310');
        setIsHashing(false);
      }, 600);
    }
  };

  const handleAttachReport = () => {
    const fileName = selectedFile ? selectedFile.name : `KVIC_Lab_Report_${Date.now().toString().slice(-4)}.pdf`;
    const newCert: LabCertificate = {
      id: `LAB-CERT-KVIC-${Math.floor(100 + Math.random() * 900)}`,
      title: `${testType} Authenticity Report`,
      testType,
      fileName,
      fileSizeKb: selectedFile ? Math.round(selectedFile.size / 1024) : 1240,
      ipfsHash: generatedIpfs,
      sha256Fingerprint: generatedSha256,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' IST',
      accreditedLab,
      resultStatus: 'COMPLIANT',
    };

    onAddCertificate(newCert);
    setSelectedFile(null);
  };

  const copyIpfsHash = () => {
    navigator.clipboard.writeText(generatedIpfs);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-amber-900/15 shadow-sm mt-6">
      {/* Title */}
      <div className="pb-4 border-b border-amber-900/10">
        <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
          <Lock className="w-4 h-4" />
          <span>Stage 3: Cryptographic Certificate Anchoring</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
          {t.labCertTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t.labCertDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* File Picker & Lab Meta Form */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Lab Assay Protocol
            </label>
            <select
              id="lab-assay-protocol-select"
              value={testType}
              onChange={(e) => setTestType(e.target.value as any)}
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 bg-[#FAF8F5] text-slate-900 cursor-pointer"
            >
              <option value="C4 Sugar / SIRA-IRMS">C4 Sugar Syrup Detection (SIRA / EA-IRMS &delta;13C)</option>
              <option value="Karl Fischer Moisture">Karl Fischer Volumetric Moisture Analysis (&lt;20%)</option>
              <option value="Pesticide & HMF Residue">HMF & Pesticide Multi-Residue LC-MS/MS</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Accredited Testing Facility
            </label>
            <input
              id="lab-accredited-facility-input"
              type="text"
              value={accreditedLab}
              onChange={(e) => setAccreditedLab(e.target.value)}
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 bg-[#FAF8F5] text-slate-900"
            />
          </div>

          {/* Interactive File Dropzone */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 rounded-xl p-5 text-center cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                {selectedFile ? selectedFile.name : t.choosePdfBtn}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Supports certified PDF certificates up to 25 MB
              </p>
            </div>
          </div>

          <button
            id="attach-lab-report-btn"
            type="button"
            onClick={handleAttachReport}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pin Certificate to Decentralized IPFS</span>
          </button>
        </div>

        {/* IPFS Cryptographic Hash Preview Card */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div className="bg-[#FAF8F5] border border-amber-200/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-amber-600" />
                IPFS Cryptographic Preview
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                {isHashing ? 'Computing CID...' : 'CID Calculated'}
              </span>
            </div>

            {/* Generated IPFS CID */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  {t.ipfsHashLabel}
                </span>
                <button
                  onClick={copyIpfsHash}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="font-mono text-xs font-bold text-slate-900 break-all bg-slate-50 p-2 rounded border border-slate-200">
                {generatedIpfs}
              </p>
            </div>

            {/* SHA-256 Fingerprint */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                {t.sha256Label}
              </span>
              <p className="font-mono text-[11px] text-slate-600 break-all bg-slate-50 p-2 rounded border border-slate-200">
                {generatedSha256}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.labVerified} • Ready for Polygon Smart Contract Minting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Anchored Certificates Table */}
      <div className="mt-6 pt-5 border-t border-amber-900/10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
          Anchored Cryptographic Lab Reports ({certificates.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-[#FAF8F5] text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Report ID</th>
                <th className="py-2.5 px-3">Assay Type</th>
                <th className="py-2.5 px-3">File Name</th>
                <th className="py-2.5 px-3">IPFS CID</th>
                <th className="py-2.5 px-3">Accreditation</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {cert.id}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {cert.testType}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {cert.fileName}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-amber-700 text-[11px]">
                    {cert.ipfsHash.slice(0, 20)}...
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    {cert.accreditedLab}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {cert.resultStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
