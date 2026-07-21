import React, { useState } from 'react';
import { X, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { loginWithGoogle, logoutUser } from '../firebase';

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
  isFullScreen = false,
  siteConfig
}: AdminLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoggingInGoogle(true);
    setError('');
    try {
      const user = await loginWithGoogle();
      const targetEmail = 'atividadesinfantilcontato@gmail.com';
      if (user && user.email && user.email.trim().toLowerCase() === targetEmail) {
        onLoginSuccess();
      } else {
        await logoutUser();
        setError('Este e-mail do Google não tem permissões administrativas de acesso.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao autenticar com o Google. Certifique-se de preencher a permissão do popup.');
    } finally {
      setIsLoggingInGoogle(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Query custom email/password from local storage overrides
    const targetEmail = localStorage.getItem('atividades_oficial_admin_email') || 'atividadesinfantilcontato@gmail.com';
    const targetPassword = localStorage.getItem('atividades_oficial_admin_pass') || 'admin123@';

    if (email.trim().toLowerCase() === targetEmail.trim().toLowerCase() && password === targetPassword) {
      onLoginSuccess();
      setEmail('');
      setPassword('');
    } else {
      setError('E-mail ou senha incorretos. Por favor, verifique seus dados.');
    }
  };

  const loginCard = (
    <div className="bg-white rounded-3xl max-w-sm w-full p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col gap-5 relative z-10 animate-scaleUp text-left">
      {/* Centered centerpiece logo inside AdminLoginModal card if custom logo exists */}
      {siteConfig?.logoUrl && (
        <div className="flex justify-center items-center py-2 border-b border-slate-100">
          <img 
            src={siteConfig.logoUrl} 
            alt={siteConfig.logoAlt || 'Atividades Criativas'} 
            className="max-h-[55px] object-contain" 
          />
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-slate-900">
          <div className="p-2.5 bg-[#FF7A00]/10 text-[#FF7A00] rounded-xl">
            <Lock size={18} />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-[#0E2A79]">Acesso Restrito</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Login do Administrador</p>
          </div>
        </div>
        {!isFullScreen && (
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-150 text-slate-400 hover:text-slate-600 transition-colors rounded-full"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Info label */}
      <p className="text-xs text-slate-500 font-bold leading-relaxed">
        Entre com as suas credenciais para gerenciar e editar as atividades do site.
      </p>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-xl text-xs font-semibold animate-shake">
          <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Google Login Button */}
      <button
        type="button"
        disabled={isLoggingInGoogle}
        onClick={handleGoogleLogin}
        className="w-full bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs tracking-wider uppercase py-3 rounded-2xl flex items-center justify-center gap-2.5 shadow-md border border-slate-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.05,3.1v2.58h3.32c1.94,-1.78 3.05,-4.41 3.05,-7.48C21.7,11.97 21.57,11.48 21.35,11.1z" fill="#4285F4" />
          <path d="M12,20.6c2.43,0 4.47,-0.81 5.96,-2.19l-2.58,-2c-0.72,0.48 -1.64,0.77 -2.58,0.77 -2.37,0 -4.38,-1.6 -5.1,-3.75H4.28v2.66C5.77,18.99 8.68,20.6 12,20.6z" fill="#34A853" />
          <path d="M6.9,13.43c-0.18,-0.54 -0.29,-1.11 -0.29,-1.7c0,-0.59 0.11,-1.16 0.29,-1.7V7.37H4.28C3.65,8.63 3.3,10.05 3.3,11.5c0,1.45 0.35,2.87 0.98,4.13L6.9,13.43z" fill="#FBBC05" />
          <path d="M12,5.53c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.47,2.81 14.43,2 12,2 8.68,2 5.77,3.61 4.28,6.27l2.62,2.66C7.62,7.13 9.63,5.53 12,5.53z" fill="#EA4335" />
        </svg>
        <span>{isLoggingInGoogle ? 'Conectando...' : 'Entrar com o Google'}</span>
      </button>

      {/* Separator */}
      <div className="flex items-center my-1 select-none">
        <div className="flex-1 border-t border-slate-200"></div>
        <span className="px-3 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">ou</span>
        <div className="flex-1 border-t border-slate-200"></div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            E-mail do Administrador
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail size={15} />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="atividadesinfantilcontato@gmail.com"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00] font-semibold"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Senha de Acesso
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock size={15} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00] font-semibold"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-[#0E2A79] hover:bg-[#1E4DDB] active:scale-95 transition-all text-white font-extrabold text-xs tracking-wider uppercase py-3.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-[#0E2A79]/10 mt-2 cursor-pointer"
        >
          <Lock size={14} />
          <span>Acessar Painel</span>
        </button>
      </form>

      {/* Back button for full screen mode */}
      {isFullScreen && (
        <button
          type="button"
          onClick={() => {
            window.location.hash = ''; // reset hash
            onClose();
          }}
          className="text-[#0E2A79] hover:text-[#FF7A00] text-xs font-black uppercase flex items-center justify-center gap-1.5 mt-2 transition-all cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Voltar para a Loja</span>
        </button>
      )}
    </div>
  );

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-radial from-slate-100 to-slate-50 opacity-40" />
        {loginCard}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      ></div>
      {loginCard}
    </div>
  );
}
