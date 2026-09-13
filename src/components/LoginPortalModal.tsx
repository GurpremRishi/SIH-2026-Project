import React, { useState } from 'react';
import { UserRole, Language } from '../types';
import { X, Smartphone, Mail, Building2, User, Loader2, ArrowLeft } from 'lucide-react';

interface LoginPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onLogin: (role: UserRole, username: string) => void;
  currentLang: Language;
}

export const LoginPortalModal: React.FC<LoginPortalModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  onLogin,
  currentLang,
}) => {
  const [step, setStep] = useState<'initial' | 'otp' | 'loading'>('initial');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handleOtpSubmit = () => {
      if (otp === '123456') {
        setStep('loading');
        setTimeout(() => {
          onLogin(currentRole, currentRole === 'beekeeper' ? 'Beekeeper' : 'Operator #08');
          onClose();
          setStep('initial');
        }, 1500);
      } else {
          alert('Invalid OTP');
      }
  };

  const handleGmailLogin = () => {
    setStep('loading');
    setTimeout(() => {
      onLogin(currentRole, currentRole === 'beekeeper' ? 'Beekeeper' : 'Operator #08');
      onClose();
      setStep('initial');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Login Portal</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X className="w-5 h-5 text-slate-500"/></button>
        </div>
        
        {step !== 'initial' && step !== 'loading' && (
            <button onClick={() => setStep('initial')} className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-4 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4"/> Back to Portal Selection
            </button>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => onSelectRole('beekeeper')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${currentRole === 'beekeeper' ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}
          >
            <User className="w-8 h-8 text-amber-600"/>
            <span className="font-bold text-sm">Beekeeper</span>
          </button>
          <button 
            onClick={() => onSelectRole('collector')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${currentRole === 'collector' ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}
          >
            <Building2 className="w-8 h-8 text-amber-600"/>
            <span className="font-bold text-sm">Collector Operator</span>
          </button>
        </div>

        {step === 'initial' && (
            <div className="space-y-3">
            <button onClick={() => setStep('otp')} className="w-full py-3 rounded-xl border border-slate-300 font-bold flex items-center justify-center gap-2 hover:bg-slate-50">
                <Smartphone className="w-4 h-4"/> Login with Mobile OTP
            </button>
            <button onClick={handleGmailLogin} className="w-full py-3 rounded-xl border border-slate-300 font-bold flex items-center justify-center gap-2 hover:bg-slate-50">
                <Mail className="w-4 h-4"/> Login with Gmail
            </button>
            </div>
        )}

        {step === 'otp' && (
            <div className="space-y-3">
                <input type="text" placeholder="Enter Phone Number" className="w-full p-3 rounded-xl border" onChange={(e) => setPhone(e.target.value)} />
                <button onClick={() => alert('OTP sent: 123456')} className="w-full py-2 bg-amber-100 rounded-lg text-xs font-bold text-amber-900">Send OTP</button>
                <input type="text" placeholder="Enter OTP" className="w-full p-3 rounded-xl border" onChange={(e) => setOtp(e.target.value)} />
                <button onClick={handleOtpSubmit} className="w-full py-3 rounded-xl bg-amber-600 text-white font-bold">Verify & Login</button>
            </div>
        )}

        {step === 'loading' && (
            <div className="flex flex-col items-center py-10">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
                <span className="font-bold">Authenticating...</span>
            </div>
        )}
      </div>
    </div>
  );
};
