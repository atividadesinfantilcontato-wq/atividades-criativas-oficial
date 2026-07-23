import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { 
  loginWithEmail, 
  validateAdminUser, 
  logoutUser
} from '../firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  isFullScreen?: boolean;
  siteConfig?: any;
}

export default function AdminLoginModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  isFullScreen = false
}: AdminLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const inputEmail = email.trim().toLowerCase();

    try {
      // 1. Attempt Firebase Auth login via Email/Password
      const user = await loginWithEmail(inputEmail, password);
      
      // 2. Validate Admin privileges in Firestore
      const adminCheck = await validateAdminUser(user);

      if (adminCheck.isAdmin) {
        onLoginSuccess();
        setEmail('');
        setPassword('');
      } else {
        await logoutUser();
        setError('Acesso não autorizado. Verifique os dados e tente novamente.');
      }
    } catch (err: any) {
      console.warn('Login notice:', err);
      setError('Acesso não autorizado. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginCard = (
    <div className="bg-white rounded-3xl max-w-sm w-full p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col gap-5 relative z-10 animate-scaleUp text-left select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-slate-900">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
            <Lock size={16} />
          </div>
          <h2 className="font-extrabold text-base text-[#0E2A79]">Acesso Restrito</h2>
        </div>
        {!isFullScreen && (
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors rounded-full cursor-pointer"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Generic Error message */}
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-xl text-xs font-semibold animate-shake">
          <AlertCircle size={15} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {/* Email field */}
        <div className="relative">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Acesso"
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0E2A79] font-medium"
          />
        </div>

        {/* Password field */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Chave"
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0E2A79] font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
            aria-label="Mostrar/ocultar chave"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#0E2A79] hover:bg-[#1E4DDB] active:scale-95 transition-all text-white font-extrabold text-xs tracking-wider uppercase py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md mt-2 cursor-pointer disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Verificando...' : 'Entrar'}</span>
        </button>
      </form>
    </div>
  );

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-100/50" />
        {loginCard}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      ></div>
      {loginCard}
    </div>
  );
}

