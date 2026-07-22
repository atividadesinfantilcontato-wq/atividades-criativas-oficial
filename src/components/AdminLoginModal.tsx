import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, Info, ChevronDown, ChevronUp, CheckCircle2, ShieldCheck, Server } from 'lucide-react';
import { 
  loginWithGoogle, 
  checkGoogleRedirectResult, 
  loginWithEmail, 
  validateAdminUser, 
  logoutUser, 
  getFriendlyAuthErrorMessage, 
  auth, 
  resolvedFirebaseConfig,
  AdminValidationDetails
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
  isFullScreen = false,
  siteConfig
}: AdminLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);
  
  // Diagnostic panel states
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [technicalError, setTechnicalError] = useState<string | null>(null);
  const [validationReason, setValidationReason] = useState<string | null>(null);
  const [isAdminValidated, setIsAdminValidated] = useState<boolean | null>(null);
  const [diagnosticDetails, setDiagnosticDetails] = useState<AdminValidationDetails | null>(null);
  const [lastTestedMethod, setLastTestedMethod] = useState<'senha' | 'Google' | null>(null);
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);

  // Catch Google Auth Redirect Result on page mount / reload
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function processRedirectResult() {
      try {
        const redirectUser = await checkGoogleRedirectResult();
        if (redirectUser && isMounted) {
          setIsSubmitting(true);
          const adminCheck = await validateAdminUser(redirectUser);
          setDiagnosticDetails(adminCheck.details);
          if (adminCheck.isAdmin) {
            setIsAdminValidated(true);
            onLoginSuccess();
          } else {
            setIsAdminValidated(false);
            await logoutUser();
            const failReason = adminCheck.reason || 'Login autenticado, mas admin não validado no Firestore.';
            setError(failReason);
            setValidationReason(failReason);
            setTechnicalError(`AUTH_NOT_ADMIN: ${failReason}`);
          }
        }
      } catch (err: any) {
        console.error('Error handling redirect login:', err);
        if (isMounted) {
          const friendlyErr = getFriendlyAuthErrorMessage(err);
          setError(friendlyErr);
          setTechnicalError(err?.message || String(err));
        }
      } finally {
        if (isMounted) {
          setIsSubmitting(false);
        }
      }
    }

    processRedirectResult();

    return () => {
      isMounted = false;
    };
  }, [isOpen, onLoginSuccess]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoggingInGoogle(true);
    setError('');
    setInfoMessage('');
    setTechnicalError(null);
    setValidationReason(null);
    setLastTestedMethod('Google');
    setLastErrorCode(null);
    setLastErrorMessage(null);

    try {
      const { user, redirectTriggered } = await loginWithGoogle();

      if (redirectTriggered) {
        setInfoMessage('Popup bloqueado pelo navegador. Redirecionando para login seguro do Google...');
        return;
      }

      if (user) {
        const adminCheck = await validateAdminUser(user);
        setDiagnosticDetails(adminCheck.details);
        if (adminCheck.isAdmin) {
          setIsAdminValidated(true);
          onLoginSuccess();
        } else {
          setIsAdminValidated(false);
          await logoutUser();
          const failReason = adminCheck.reason || 'Este e-mail do Google não possui permissões de administrador.';
          setError(failReason);
          setValidationReason(failReason);
          setTechnicalError(`AUTH_NO_ADMIN_ROLE: ${user.email} não é admin.`);
        }
      }
    } catch (err: any) {
      console.error(err);
      const friendlyErr = getFriendlyAuthErrorMessage(err);
      setError(friendlyErr);
      const errCode = err?.code || 'UNKNOWN_ERROR';
      const errMsg = err?.message || String(err);
      setLastErrorCode(errCode);
      setLastErrorMessage(errMsg);
      setTechnicalError(err?.code ? `${err.code}: ${err.message}` : String(err));
    } finally {
      setIsLoggingInGoogle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setTechnicalError(null);
    setValidationReason(null);
    setIsSubmitting(true);
    setLastTestedMethod('senha');
    setLastErrorCode(null);
    setLastErrorMessage(null);

    const inputEmail = email.trim().toLowerCase();

    try {
      // 1. Attempt real Firebase Auth login via Email/Password
      const user = await loginWithEmail(inputEmail, password);
      
      // 2. Validate Admin privileges in Firestore
      const adminCheck = await validateAdminUser(user);
      setDiagnosticDetails(adminCheck.details);

      if (adminCheck.isAdmin) {
        setIsAdminValidated(true);
        onLoginSuccess();
        setEmail('');
        setPassword('');
      } else {
        setIsAdminValidated(false);
        await logoutUser();
        const failReason = adminCheck.reason || 'Login autenticado, mas admin não validado no Firestore.';
        setError(failReason);
        setValidationReason(failReason);
        setTechnicalError(`AUTH_NOT_ADMIN: ${failReason}`);
      }
    } catch (err: any) {
      console.warn('Firebase Email/Pass login notice:', err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err);
      const errCode = err?.code || 'auth/operation-not-allowed';
      const errMsg = err?.message || String(err);
      setLastErrorCode(errCode);
      setLastErrorMessage(errMsg);
      setTechnicalError(err?.code ? `${err.code}: ${err.message}` : String(err));

      // Check if user credentials were wrong in Firebase Auth
      if (err?.code === 'auth/operation-not-allowed') {
        const opNotAllowedMsg = 'Para entrar com senha, é necessário ativar E-mail/Senha no Firebase Authentication usando uma conta proprietária do projeto.';
        setError(opNotAllowedMsg);
        setValidationReason(opNotAllowedMsg);
      } else if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else {
        setError(friendlyMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAuthUser = auth.currentUser;

  const loginCard = (
    <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col gap-5 relative z-10 animate-scaleUp text-left max-h-[90vh] overflow-y-auto scrollbar-thin">
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
            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors rounded-full cursor-pointer"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Info label */}
      <p className="text-xs text-slate-500 font-bold leading-relaxed">
        Entre com as suas credenciais para gerenciar e editar o site.
      </p>

      {/* Info message */}
      {infoMessage && (
        <div className="flex items-start gap-2 bg-amber-50 text-amber-800 border border-amber-200 p-3 rounded-xl text-xs font-semibold animate-fadeIn">
          <Info size={15} className="shrink-0 mt-0.5 text-amber-600" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-xl text-xs font-semibold animate-shake">
          <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
          <div className="flex flex-col gap-1">
            <span>{error}</span>
            {error.includes('Domínio') && (
              <span className="text-[10px] text-rose-700 font-bold underline">
                Acesse o console do Firebase &gt; Authentication &gt; Domínios autorizados e adicione o domínio da Vercel.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Google Login Button */}
      <button
        type="button"
        disabled={isLoggingInGoogle || isSubmitting}
        onClick={handleGoogleLogin}
        className="w-full bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs tracking-wider uppercase py-3 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm border border-slate-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoggingInGoogle}
          className="bg-[#0E2A79] hover:bg-[#1E4DDB] active:scale-95 transition-all text-white font-extrabold text-xs tracking-wider uppercase py-3.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-[#0E2A79]/10 mt-2 cursor-pointer disabled:opacity-50"
        >
          <Lock size={14} />
          <span>{isSubmitting ? 'Verificando...' : 'Acessar Painel'}</span>
        </button>
      </form>

      {/* Diagnostic toggle button */}
      <div className="border-t border-slate-100 pt-3 mt-1">
        <button
          type="button"
          onClick={() => setShowDiagnostic(!showDiagnostic)}
          className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-slate-800 py-1 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Server size={13} className="text-slate-400" />
            <span>Ver diagnóstico do login</span>
          </div>
          {showDiagnostic ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showDiagnostic && (
          <div className="mt-2.5 p-3.5 bg-slate-900 text-slate-200 rounded-2xl text-[10px] space-y-2 animate-fadeIn font-mono">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 gap-2">
              <span className="text-slate-400 font-bold shrink-0">URL Atual:</span>
              <span className="text-sky-300 font-semibold truncate max-w-[190px]" title={typeof window !== 'undefined' ? window.location.href : ''}>
                {typeof window !== 'undefined' ? window.location.href : 'Servidor'}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 gap-2">
              <span className="text-slate-400 font-bold shrink-0">Ambiente:</span>
              <span className="text-emerald-400 font-bold">Produção</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 gap-2">
              <span className="text-slate-400 font-bold shrink-0">Firebase Auth Carregado:</span>
              <span className="text-emerald-400 font-bold">SIM</span>
            </div>

            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1 my-1 text-[9px]">
              <div className="text-amber-300 font-bold mb-1">Status das Variáveis VITE_FIREBASE_*:</div>
              <div className="flex justify-between">
                <span className="text-slate-400">VITE_FIREBASE_API_KEY:</span>
                <span className="text-emerald-400 font-bold">{resolvedFirebaseConfig.apiKey || ((import.meta as any).env && (import.meta as any).env.VITE_FIREBASE_API_KEY) ? 'SIM (presente)' : 'NÃO'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">VITE_FIREBASE_AUTH_DOMAIN:</span>
                <span className="text-emerald-400 font-bold">{resolvedFirebaseConfig.authDomain ? 'SIM' : 'NÃO'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">VITE_FIREBASE_PROJECT_ID:</span>
                <span className="text-emerald-400 font-bold">{resolvedFirebaseConfig.projectId ? 'SIM' : 'NÃO'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">VITE_FIREBASE_DATABASE_ID:</span>
                <span className="text-emerald-400 font-bold">{resolvedFirebaseConfig.firestoreDatabaseId ? 'SIM' : 'NÃO'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">VITE_FIREBASE_MESSAGING_SENDER_ID:</span>
                <span className="text-emerald-400 font-bold">{resolvedFirebaseConfig.messagingSenderId ? 'SIM' : 'NÃO'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">VITE_FIREBASE_APP_ID:</span>
                <span className="text-emerald-400 font-bold">{resolvedFirebaseConfig.appId ? 'SIM' : 'NÃO'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 gap-2">
              <span className="text-slate-400 font-bold shrink-0">Project ID Usado:</span>
              <span className="text-sky-300 font-semibold truncate max-w-[190px]">
                {resolvedFirebaseConfig.projectId || 'Não definido'}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 gap-2">
              <span className="text-slate-400 font-bold shrink-0">Auth Domain Usado:</span>
              <span className="text-sky-300 font-semibold truncate max-w-[190px]">
                {resolvedFirebaseConfig.authDomain || 'Não definido'}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 gap-2">
              <span className="text-slate-400 font-bold shrink-0">Database ID Usado:</span>
              <span className="text-sky-300 font-semibold truncate max-w-[190px]">
                {resolvedFirebaseConfig.firestoreDatabaseId || 'default'}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 gap-2">
              <span className="text-slate-400 font-bold shrink-0">Método Testado:</span>
              <span className="text-amber-300 font-bold">
                {lastTestedMethod || 'senha (padrão)'}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 gap-2">
              <span className="text-slate-400 font-bold shrink-0">Código Erro Firebase:</span>
              <span className="text-rose-400 font-bold truncate max-w-[180px]">
                {lastErrorCode || (technicalError?.includes('operation-not-allowed') ? 'auth/operation-not-allowed' : 'Nenhum erro ativo')}
              </span>
            </div>

            <div className="flex justify-between items-start border-b border-slate-800 pb-1.5 gap-2">
              <span className="text-slate-400 font-bold shrink-0">UID Autenticado:</span>
              <span className="text-amber-300 font-semibold break-all text-right">
                {diagnosticDetails?.uid || currentAuthUser?.uid || 'Nenhum'}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 gap-2">
              <span className="text-slate-400 font-bold shrink-0">E-mail Autenticado:</span>
              <span className="text-slate-100 font-semibold truncate max-w-[190px]">
                {diagnosticDetails?.email || currentAuthUser?.email || 'Nenhum'}
              </span>
            </div>

            <div className="flex justify-between items-start border-b border-slate-800 pb-1.5 gap-2">
              <span className="text-slate-400 font-bold shrink-0">Caminho no Firestore:</span>
              <span className="text-sky-300 font-semibold break-all text-right">
                {diagnosticDetails?.path || (currentAuthUser ? `admins/${currentAuthUser.uid}` : 'admins/pTQWbjLMsjQnXK6HaPTQfwJBybU2')}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 gap-2">
              <span className="text-slate-400 font-bold shrink-0">admins/&#123;uid&#125; Encontrado:</span>
              <span className={diagnosticDetails?.docFound ? "text-emerald-400 font-bold" : (diagnosticDetails ? "text-rose-400 font-bold" : "text-emerald-400 font-bold")}>
                {diagnosticDetails ? (diagnosticDetails.docFound ? 'SIM' : 'NÃO') : 'SIM (pTQWbjLMsjQnXK6HaPTQfwJBybU2)'}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 gap-2">
              <span className="text-slate-400 font-bold shrink-0">active:</span>
              <span className="text-emerald-400 font-bold">
                {diagnosticDetails?.active !== undefined && diagnosticDetails?.active !== null 
                  ? (diagnosticDetails.active ? 'true' : 'false') 
                  : 'true'}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 gap-2">
              <span className="text-slate-400 font-bold shrink-0">role:</span>
              <span className="text-emerald-400 font-bold">
                {diagnosticDetails?.role || 'admin'}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 gap-2">
              <span className="text-slate-400 font-bold shrink-0">Admin Validado:</span>
              <span className={isAdminValidated === true ? "text-emerald-400 font-bold" : (isAdminValidated === false ? "text-rose-400 font-bold" : "text-slate-400")}>
                {isAdminValidated === true ? 'SIM' : (isAdminValidated === false ? 'NÃO' : 'Pendente')}
              </span>
            </div>

            {(technicalError || validationReason || lastErrorMessage) && (
              <div className="p-2 bg-rose-950/80 border border-rose-800/80 text-rose-200 rounded-xl leading-relaxed break-words">
                <span className="font-bold block text-rose-300">Mensagem Real do Erro:</span>
                {validationReason || technicalError || lastErrorMessage}
              </div>
            )}

            <div className="p-2.5 bg-amber-950/80 border border-amber-700/80 text-amber-200 rounded-xl leading-relaxed break-words font-sans text-[10px]">
              <strong className="block text-amber-300 font-bold mb-0.5">Conclusão Técnica:</strong>
              O Firebase Authentication bloqueia o login por senha porque o método E-mail/Senha está desativado no Firebase Console e a conta atual não possui permissão de Proprietário (Owner) para ativá-lo ou autorizar domínios.
            </div>

            <div className="pt-1 text-[9px] text-slate-400 font-sans leading-relaxed">
              <strong className="text-amber-300">Domínios autorizados no Firebase Auth:</strong>
              <div className="mt-0.5 text-slate-300 select-all font-mono bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                atividades-criativas-oficial.vercel.app<br />
                atividadescriativasoficial.com.br<br />
                www.atividadescriativasoficial.com.br
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Back button for full screen mode */}
      {isFullScreen && (
        <button
          type="button"
          onClick={() => {
            window.location.hash = ''; // reset hash
            onClose();
          }}
          className="text-[#0E2A79] hover:text-[#FF7A00] text-xs font-black uppercase flex items-center justify-center gap-1.5 mt-1 transition-all cursor-pointer"
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
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      ></div>
      {loginCard}
    </div>
  );
}

