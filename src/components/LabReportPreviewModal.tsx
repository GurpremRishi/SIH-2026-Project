import React from 'react';
import { X, Printer } from 'lucide-react';
import { LabCertificate } from '../types';

interface LabReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cert: LabCertificate;
}

export const LabReportPreviewModal: React.FC<LabReportPreviewModalProps> = ({ isOpen, onClose, cert }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-slate-900">Lab Certificate Preview</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg">{cert.fileName}</h3>
            <p><strong>NABL Accreditation:</strong> {cert.accreditedLab}</p>
            <p><strong>Assay Type:</strong> {cert.testType}</p>
            <p className="font-mono text-xs"><strong>IPFS CID:</strong> {cert.ipfsHash}</p>
            <div className="border-t pt-4 mt-4">
                <p><em>[ Simulated PDF Content View ]</em></p>
                <div className="h-48 flex items-center justify-center bg-slate-200 rounded mt-2">
                    <span className="text-slate-500 font-bold">Lab Report Document Render</span>
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 hover:bg-slate-200">Close</button>
            <button onClick={() => window.print()} className="px-4 py-2 rounded-xl text-sm font-bold bg-amber-600 text-white hover:bg-amber-700 flex items-center gap-2">
                <Printer className="w-4 h-4"/> Print Certificate
            </button>
        </div>
      </div>
    </div>
  );
};
