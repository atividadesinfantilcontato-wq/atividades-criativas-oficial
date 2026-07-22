import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, X, RefreshCw, Eye, Smartphone, Tablet, Monitor, 
  AlignLeft, AlignCenter, AlignRight, CheckCircle, AlertTriangle, 
  ArrowLeft, Save, Trash2, ArrowRight
} from 'lucide-react';
import { auth } from '../firebase';
import { SiteConfig } from '../types';
import { compressImage } from '../utils/imageCompressor';

interface AdminLogoConfigProps {
  siteConfig: SiteConfig;
  onUpdateSiteConfig: (config: SiteConfig) => void;
  onSuccess: (message: string) => void;
  onBack: () => void;
}

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
type SizePreset = 'small' | 'medium' | 'large' | 'custom';

export default function AdminLogoConfig({
  siteConfig,
  onUpdateSiteConfig,
  onSuccess,
  onBack
}: AdminLogoConfigProps) {
  // Local state initialized with siteConfig values
  const [logoUrl, setLogoUrl] = useState(siteConfig.logoUrl || '');
  const [logoStoragePath, setLogoStoragePath] = useState(siteConfig.logoStoragePath || '');
  const [logoAlt, setLogoAlt] = useState(siteConfig.logoAlt || 'Atividades Criativas Oficial');
  
  const [logoDesktopWidth, setLogoDesktopWidth] = useState(siteConfig.logoDesktopWidth ?? 220);
  const [logoTabletWidth, setLogoTabletWidth] = useState(siteConfig.logoTabletWidth ?? 190);
  const [logoMobileWidth, setLogoMobileWidth] = useState(siteConfig.logoMobileWidth ?? 160);
  const [logoMaxHeight, setLogoMaxHeight] = useState(siteConfig.logoMaxHeight ?? 70);
  
  const [logoAlignment, setLogoAlignment] = useState<'left' | 'center' | 'right'>(
    (siteConfig.logoAlignment as 'left' | 'center' | 'right') || 'left'
  );
  
  const [logoMarginTop, setLogoMarginTop] = useState(siteConfig.logoMarginTop ?? 0);
  const [logoMarginBottom, setLogoMarginBottom] = useState(siteConfig.logoMarginBottom ?? 0);
  const [logoMarginLeft, setLogoMarginLeft] = useState(siteConfig.logoMarginLeft ?? 0);
  const [logoMarginRight, setLogoMarginRight] = useState(siteConfig.logoMarginRight ?? 0);
  
  const [useDifferentMobileLogo, setUseDifferentMobileLogo] = useState(siteConfig.useDifferentMobileLogo ?? false);
  const [mobileLogoUrl, setMobileLogoUrl] = useState(siteConfig.mobileLogoUrl || '');
  const [mobileLogoStoragePath, setMobileLogoStoragePath] = useState(siteConfig.mobileLogoStoragePath || '');
  
  const [faviconUrl, setFaviconUrl] = useState(siteConfig.faviconUrl || '');
  const [faviconStoragePath, setFaviconStoragePath] = useState(siteConfig.faviconStoragePath || '');

  // UI status states
  const [selectedPreset, setSelectedPreset] = useState<SizePreset>('custom');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  
  // File uploading states
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [aspectRatioWarning, setAspectRatioWarning] = useState<string | null>(null);
  const [mobileAspectRatioWarning, setMobileAspectRatioWarning] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<{ [key: string]: boolean }>({});

  // History for restoring previous state
  const [previousConfig, setPreviousConfig] = useState<Partial<SiteConfig> | null>(null);
  
  // Refs for file inputs
  const mainLogoInputRef = useRef<HTMLInputElement>(null);
  const mobileLogoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Check if any state differs from siteConfig (to display "un-saved" warning)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const isChanged = 
      logoUrl !== (siteConfig.logoUrl || '') ||
      logoStoragePath !== (siteConfig.logoStoragePath || '') ||
      logoAlt !== (siteConfig.logoAlt || 'Atividades Criativas Oficial') ||
      logoDesktopWidth !== (siteConfig.logoDesktopWidth ?? 220) ||
      logoTabletWidth !== (siteConfig.logoTabletWidth ?? 190) ||
      logoMobileWidth !== (siteConfig.logoMobileWidth ?? 160) ||
      logoMaxHeight !== (siteConfig.logoMaxHeight ?? 70) ||
      logoAlignment !== ((siteConfig.logoAlignment as 'left' | 'center' | 'right') || 'left') ||
      logoMarginTop !== (siteConfig.logoMarginTop ?? 0) ||
      logoMarginBottom !== (siteConfig.logoMarginBottom ?? 0) ||
      logoMarginLeft !== (siteConfig.logoMarginLeft ?? 0) ||
      logoMarginRight !== (siteConfig.logoMarginRight ?? 0) ||
      useDifferentMobileLogo !== (siteConfig.useDifferentMobileLogo ?? false) ||
      mobileLogoUrl !== (siteConfig.mobileLogoUrl || '') ||
      mobileLogoStoragePath !== (siteConfig.mobileLogoStoragePath || '') ||
      faviconUrl !== (siteConfig.faviconUrl || '') ||
      faviconStoragePath !== (siteConfig.faviconStoragePath || '');

    setHasUnsavedChanges(isChanged);
  }, [
    logoUrl, logoStoragePath, logoAlt, logoDesktopWidth, logoTabletWidth, 
    logoMobileWidth, logoMaxHeight, logoAlignment, logoMarginTop, 
    logoMarginBottom, logoMarginLeft, logoMarginRight, useDifferentMobileLogo, 
    mobileLogoUrl, mobileLogoStoragePath, faviconUrl, faviconStoragePath, siteConfig
  ]);

  // Keep track of previous configuration upon loading to allow full "Restaurar"
  useEffect(() => {
    setPreviousConfig({
      logoUrl: siteConfig.logoUrl || '',
      logoStoragePath: siteConfig.logoStoragePath || '',
      logoAlt: siteConfig.logoAlt || 'Atividades Criativas Oficial',
      logoDesktopWidth: siteConfig.logoDesktopWidth ?? 220,
      logoTabletWidth: siteConfig.logoTabletWidth ?? 190,
      logoMobileWidth: siteConfig.logoMobileWidth ?? 160,
      logoMaxHeight: siteConfig.logoMaxHeight ?? 70,
      logoAlignment: siteConfig.logoAlignment || 'left',
      logoMarginTop: siteConfig.logoMarginTop ?? 0,
      logoMarginBottom: siteConfig.logoMarginBottom ?? 0,
      logoMarginLeft: siteConfig.logoMarginLeft ?? 0,
      logoMarginRight: siteConfig.logoMarginRight ?? 0,
      useDifferentMobileLogo: siteConfig.useDifferentMobileLogo ?? false,
      mobileLogoUrl: siteConfig.mobileLogoUrl || '',
      mobileLogoStoragePath: siteConfig.mobileLogoStoragePath || '',
      faviconUrl: siteConfig.faviconUrl || '',
      faviconStoragePath: siteConfig.faviconStoragePath || ''
    });
  }, [siteConfig]);

  // Detect preset from sizes
  useEffect(() => {
    if (
      logoDesktopWidth === 150 && 
      logoTabletWidth === 130 && 
      logoMobileWidth === 110 && 
      logoMaxHeight === 50
    ) {
      setSelectedPreset('small');
    } else if (
      logoDesktopWidth === 220 && 
      logoTabletWidth === 190 && 
      logoMobileWidth === 160 && 
      logoMaxHeight === 70
    ) {
      setSelectedPreset('medium');
    } else if (
      logoDesktopWidth === 300 && 
      logoTabletWidth === 260 && 
      logoMobileWidth === 220 && 
      logoMaxHeight === 90
    ) {
      setSelectedPreset('large');
    } else {
      setSelectedPreset('custom');
    }
  }, [logoDesktopWidth, logoTabletWidth, logoMobileWidth, logoMaxHeight]);

  // Apply preset
  const applyPreset = (preset: SizePreset) => {
    setSelectedPreset(preset);
    if (preset === 'small') {
      setLogoDesktopWidth(150);
      setLogoTabletWidth(130);
      setLogoMobileWidth(110);
      setLogoMaxHeight(50);
    } else if (preset === 'medium') {
      setLogoDesktopWidth(220);
      setLogoTabletWidth(190);
      setLogoMobileWidth(160);
      setLogoMaxHeight(70);
    } else if (preset === 'large') {
      setLogoDesktopWidth(300);
      setLogoTabletWidth(260);
      setLogoMobileWidth(220);
      setLogoMaxHeight(90);
    }
  };

  // Helper to handle and upload selected file to R2 Storage
  const handleUploadFile = (file: File, type: 'main' | 'mobile' | 'favicon') => {
    setUploadError(null);
    if (type === 'main') setAspectRatioWarning(null);
    if (type === 'mobile') setMobileAspectRatioWarning(null);

    // 1. Validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Formato de arquivo inválido. Formatos aceitos: PNG, JPG, JPEG, WebP e SVG.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setUploadError('A imagem é muito grande. O limite máximo de tamanho de arquivo é 5 MB.');
      return;
    }

    // 2. Proportional Aspect Ratio Check for Logos (only if image)
    if (file.type !== 'image/svg+xml') {
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        if (type === 'main' || type === 'mobile') {
          if (aspect < 2.0) {
            const warnMsg = `Aviso de proporção (${img.width}x${img.height}): A imagem selecionada parece quadrada ou vertical. Uma logo horizontal (proporção sugerida de 3:1 ou mais, ex: 600x180 px) se ajusta melhor ao cabeçalho.`;
            if (type === 'main') setAspectRatioWarning(warnMsg);
            if (type === 'mobile') setMobileAspectRatioWarning(warnMsg);
          }
        }
      };
      img.src = URL.createObjectURL(file);
    }

    // 3. Simple Storage Upload Process with R2 Storage
    const storagePath = `identity/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

    setUploadProgress(prev => ({ ...prev, [type]: 20 }));

    const handleUploadProcess = async () => {
      try {
        setUploadProgress(prev => ({ ...prev, [type]: 40 }));
        
        let downloadUrl = '';
        let keyPath = '';

        // R2 Upload
        const user = auth.currentUser;
        if (!user) {
          throw new Error("Você precisa estar logado como administrador para enviar imagens.");
        }

        if (file.type.startsWith('video/') || file.name.match(/\.(mp4|m4v|avi|mov|wmv|flv|webm|mkv)$/i)) {
          throw new Error("Vídeos devem ser cadastrados apenas por URL do YouTube.");
        }

        const idToken = await user.getIdToken();
        setUploadProgress(prev => ({ ...prev, [type]: 50 }));

        const formData = new FormData();
        formData.append("file", file);
        formData.append("customPath", "site/logo");

        const response = await fetch("/api/r2-upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${idToken}`
          },
          body: formData
        });

        const contentType = response.headers.get("content-type") || "";
        let resData: any = {};
        if (contentType.includes("application/json")) {
          resData = await response.json();
        } else {
          const textData = await response.text();
          throw new Error(`R2 upload failed with status ${response.status}: ${textData.substring(0, 100)}`);
        }

        if (!response.ok) {
          throw new Error(resData.error || `R2 upload failed with status ${response.status}`);
        }

        downloadUrl = resData.url;
        keyPath = resData.key;

        setUploadProgress(prev => ({ ...prev, [type]: 100 }));

        if (type === 'main') {
          setLogoUrl(downloadUrl);
          setLogoStoragePath(keyPath);
        } else if (type === 'mobile') {
          setMobileLogoUrl(downloadUrl);
          setMobileLogoStoragePath(keyPath);
        } else if (type === 'favicon') {
          setFaviconUrl(downloadUrl);
          setFaviconStoragePath(keyPath);
        }
        onSuccess(`Imagem carregada com sucesso!`);
      } catch (error: any) {
        console.error('[Diagnostic] R2 Storage logo upload failed:', error);
        setUploadError(`Falha no upload da logo: ${error.message || String(error)}`);
      } finally {
        setTimeout(() => {
          setUploadProgress(prev => {
            const copy = { ...prev };
            delete copy[type];
            return copy;
          });
        }, 2000);
      }
    };

    handleUploadProcess();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setIsDragging(prev => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setIsDragging(prev => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e: React.DragEvent, type: 'main' | 'mobile' | 'favicon') => {
    e.preventDefault();
    setIsDragging(prev => ({ ...prev, [type]: false }));
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUploadFile(files[0], type);
    }
  };

  // Removing a logo config
  const handleRemoveLogo = (type: 'main' | 'mobile' | 'favicon') => {
    if (type === 'main') {
      setLogoUrl('');
      setLogoStoragePath('');
      setAspectRatioWarning(null);
    } else if (type === 'mobile') {
      setMobileLogoUrl('');
      setMobileLogoStoragePath('');
      setMobileAspectRatioWarning(null);
    } else if (type === 'favicon') {
      setFaviconUrl('');
      setFaviconStoragePath('');
    }
    onSuccess('Logo removida da prévia. Salve para aplicar.');
  };

  // Full restoration of previous state
  const handleRestorePrevious = () => {
    if (previousConfig) {
      setLogoUrl(previousConfig.logoUrl || '');
      setLogoStoragePath(previousConfig.logoStoragePath || '');
      setLogoAlt(previousConfig.logoAlt || 'Atividades Criativas Oficial');
      setLogoDesktopWidth(previousConfig.logoDesktopWidth ?? 220);
      setLogoTabletWidth(previousConfig.logoTabletWidth ?? 190);
      setLogoMobileWidth(previousConfig.logoMobileWidth ?? 160);
      setLogoMaxHeight(previousConfig.logoMaxHeight ?? 70);
      setLogoAlignment((previousConfig.logoAlignment as 'left' | 'center' | 'right') || 'left');
      setLogoMarginTop(previousConfig.logoMarginTop ?? 0);
      setLogoMarginBottom(previousConfig.logoMarginBottom ?? 0);
      setLogoMarginLeft(previousConfig.logoMarginLeft ?? 0);
      setLogoMarginRight(previousConfig.logoMarginRight ?? 0);
      setUseDifferentMobileLogo(previousConfig.useDifferentMobileLogo ?? false);
      setMobileLogoUrl(previousConfig.mobileLogoUrl || '');
      setMobileLogoStoragePath(previousConfig.mobileLogoStoragePath || '');
      setFaviconUrl(previousConfig.faviconUrl || '');
      setFaviconStoragePath(previousConfig.faviconStoragePath || '');
      onSuccess('Configurações anteriores restauradas com sucesso!');
    }
  };

  // Save changes centrally
  const handleSaveAll = () => {
    const updatedConfig: SiteConfig = {
      ...siteConfig,
      logoUrl,
      logoStoragePath,
      logoAlt,
      logoDesktopWidth,
      logoTabletWidth,
      logoMobileWidth,
      logoMaxHeight,
      logoAlignment,
      logoMarginTop,
      logoMarginBottom,
      logoMarginLeft,
      logoMarginRight,
      useDifferentMobileLogo,
      mobileLogoUrl,
      mobileLogoStoragePath,
      faviconUrl,
      faviconStoragePath,
      updatedAt: new Date().toISOString()
    };

    onUpdateSiteConfig(updatedConfig);
    onSuccess('Logo e identidade visual atualizadas com sucesso!');
    setHasUnsavedChanges(false);
  };

  // Format favicon link tags dynamically for preview/test
  useEffect(() => {
    if (faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [faviconUrl]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top sticky alert */}
      {hasUnsavedChanges && (
        <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 p-4 rounded-xl flex items-center justify-between shadow-xs animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-500 shrink-0" size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Alterações ainda não salvas no site principal.</span>
          </div>
          <button 
            onClick={handleSaveAll}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] uppercase rounded-lg transition-all cursor-pointer"
          >
            Salvar Agora
          </button>
        </div>
      )}

      {/* Main Grid: Upload and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls & Uploads (Grid span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Box 1: Logo Principal Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Logo do Cabeçalho e Rodapé</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">Logo oficial da Atividades Criativas</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => mainLogoInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] rounded-lg border border-slate-300 transition-all uppercase cursor-pointer"
                >
                  Selecionar Arquivo
                </button>
                <input
                  type="file"
                  ref={mainLogoInputRef}
                  onChange={(e) => e.target.files?.[0] && handleUploadFile(e.target.files[0], 'main')}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                  className="hidden"
                />
              </div>
            </div>

            {/* Drag and Drop Box */}
            <div
              onDragOver={(e) => handleDragOver(e, 'main')}
              onDragLeave={(e) => handleDragLeave(e, 'main')}
              onDrop={(e) => handleDrop(e, 'main')}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all ${
                isDragging['main']
                  ? 'border-[#1E4DDB] bg-blue-50/40 scale-[0.99]'
                  : logoUrl 
                    ? 'border-slate-200 bg-slate-50/50 hover:bg-slate-50' 
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'
              }`}
            >
              {logoUrl ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm max-w-[280px] flex items-center justify-center">
                    <img src={logoUrl} alt="Logo Carregada" className="max-h-[80px] object-contain" />
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle size={14} /> Logo Ativa
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLogo('main')}
                      className="text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} /> Remover
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center select-none py-2">
                  <div className="p-3 bg-blue-50 text-[#12368F] rounded-2xl">
                    <Upload size={22} className="stroke-[1.5]" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Arraste a sua logo horizontal aqui</p>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed max-w-[320px]">
                    PNG com fundo transparente é o mais recomendado.
                  </p>
                </div>
              )}

              {uploadProgress['main'] !== undefined && (
                <div className="w-full max-w-[200px] mt-2">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 mb-1">
                    <span>Enviando logo...</span>
                    <span>{uploadProgress['main']}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#1E4DDB] h-full transition-all duration-300" style={{ width: `${uploadProgress['main']}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Warnings and instructions */}
            {aspectRatioWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 font-bold leading-relaxed flex items-start gap-2 animate-shake">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={14} />
                <span>{aspectRatioWarning}</span>
              </div>
            )}

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[10px] text-rose-800 font-bold leading-relaxed flex items-start gap-2">
                <X className="text-rose-500 shrink-0" size={14} />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Recommendation block */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-2 text-xs">
              <span className="font-extrabold text-[#0E2A79] uppercase text-[9px] tracking-wider block">Formatos e Recomendações:</span>
              <ul className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-semibold">
                <li>• Logo Horizontal: <strong className="text-slate-700">600 × 180 px</strong></li>
                <li>• Logo HQ Ampliada: <strong className="text-slate-700">1200 × 360 px</strong></li>
                <li>• Logo Quadrada: <strong className="text-slate-700">500 × 500 px</strong></li>
                <li>• Formatos: <strong className="text-slate-700">PNG, WEBP, SVG</strong></li>
              </ul>
              <p className="text-[10px] text-slate-400 font-bold pt-1 leading-normal border-t border-slate-200/60">
                “Use preferencialmente uma logo horizontal em PNG com fundo transparente.”
              </p>
            </div>
          </div>

          {/* Box 2: Controls for size and positions */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-5">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Controle de Tamanho e Proporções</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">Ajuste o comportamento visual sem esticar ou cortar</p>
            </div>

            {/* Preset selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Opções Rápidas de Tamanho</label>
              <div className="grid grid-cols-4 gap-2">
                {(['small', 'medium', 'large', 'custom'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                      selectedPreset === preset
                        ? 'bg-[#0E2A79] text-white border-[#0E2A79]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset === 'small' && 'Pequena'}
                    {preset === 'medium' && 'Média'}
                    {preset === 'large' && 'Grande'}
                    {preset === 'custom' && 'Personalizada'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes inputs (Desktop, Tablet, Mobile, Max Height) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none">Computador (px)</label>
                <input
                  type="number"
                  value={logoDesktopWidth}
                  onChange={(e) => {
                    setLogoDesktopWidth(Math.max(10, parseInt(e.target.value) || 0));
                    setSelectedPreset('custom');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none">Tablet (px)</label>
                <input
                  type="number"
                  value={logoTabletWidth}
                  onChange={(e) => {
                    setLogoTabletWidth(Math.max(10, parseInt(e.target.value) || 0));
                    setSelectedPreset('custom');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none">Celular (px)</label>
                <input
                  type="number"
                  value={logoMobileWidth}
                  onChange={(e) => {
                    setLogoMobileWidth(Math.max(10, parseInt(e.target.value) || 0));
                    setSelectedPreset('custom');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none">Altura Máx (px)</label>
                <input
                  type="number"
                  value={logoMaxHeight}
                  onChange={(e) => {
                    setLogoMaxHeight(Math.max(10, parseInt(e.target.value) || 0));
                    setSelectedPreset('custom');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
                />
              </div>
            </div>

            {/* Position and Alignments */}
            <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Alinhamento do Logo</label>
                <div className="flex gap-2">
                  {([
                    { id: 'left', icon: AlignLeft, text: 'Esquerda' },
                    { id: 'center', icon: AlignCenter, text: 'Centro' },
                    { id: 'right', icon: AlignRight, text: 'Direita' }
                  ] as const).map((align) => {
                    const Icon = align.icon;
                    return (
                      <button
                        key={align.id}
                        type="button"
                        onClick={() => setLogoAlignment(align.id)}
                        className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-[10px] transition-all cursor-pointer ${
                          logoAlignment === align.id
                            ? 'bg-[#1E4DDB] text-white border-[#1E4DDB]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon size={13} />
                        <span>{align.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Texto Alternativo (Alt)</label>
                <input
                  type="text"
                  value={logoAlt}
                  onChange={(e) => setLogoAlt(e.target.value)}
                  placeholder="Alt da logo"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Margins adjustment panel (Top, Bottom, Left, Right) */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ajuste de Margens (Margem em pixels)</label>
              <div className="grid grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-extrabold uppercase text-slate-400 text-center">Superior</span>
                  <input
                    type="number"
                    value={logoMarginTop}
                    onChange={(e) => setLogoMarginTop(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2 rounded-xl text-center font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-extrabold uppercase text-slate-400 text-center">Inferior</span>
                  <input
                    type="number"
                    value={logoMarginBottom}
                    onChange={(e) => setLogoMarginBottom(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2 rounded-xl text-center font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-extrabold uppercase text-slate-400 text-center">Esquerda</span>
                  <input
                    type="number"
                    value={logoMarginLeft}
                    onChange={(e) => setLogoMarginLeft(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2 rounded-xl text-center font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-extrabold uppercase text-slate-400 text-center">Direita</span>
                  <input
                    type="number"
                    value={logoMarginRight}
                    onChange={(e) => setLogoMarginRight(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2 rounded-xl text-center font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Box 3: Mobile optional logo */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Logo diferente no celular</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">Configure um ícone compacto para as telas menores</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useDifferentMobileLogo}
                  onChange={(e) => setUseDifferentMobileLogo(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            {useDifferentMobileLogo && (
              <div className="space-y-4 animate-slideDown border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400">Envio da Logo Compacta</span>
                  <button
                    type="button"
                    onClick={() => mobileLogoInputRef.current?.click()}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[9px] rounded-lg border border-slate-300 transition-all uppercase cursor-pointer"
                  >
                    Selecionar Compacto
                  </button>
                  <input
                    type="file"
                    ref={mobileLogoInputRef}
                    onChange={(e) => e.target.files?.[0] && handleUploadFile(e.target.files[0], 'mobile')}
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                    className="hidden"
                  />
                </div>

                <div
                  onDragOver={(e) => handleDragOver(e, 'mobile')}
                  onDragLeave={(e) => handleDragLeave(e, 'mobile')}
                  onDrop={(e) => handleDrop(e, 'mobile')}
                  className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                    isDragging['mobile'] ? 'border-[#1E4DDB] bg-blue-50/40' : 'border-slate-200 bg-slate-50/30'
                  }`}
                >
                  {mobileLogoUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={mobileLogoUrl} alt="Logo Compacto" className="max-h-[50px] object-contain bg-white p-1 rounded border shadow-xs" />
                      <button
                        type="button"
                        onClick={() => handleRemoveLogo('mobile')}
                        className="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={12} /> Remover
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2 select-none">
                      <p className="text-[10px] font-bold text-slate-500">Arraste a logo compacta / símbolo aqui</p>
                    </div>
                  )}

                  {uploadProgress['mobile'] !== undefined && (
                    <div className="w-full max-w-[160px] mt-1">
                      <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                        <div className="bg-[#1E4DDB] h-full" style={{ width: `${uploadProgress['mobile']}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {mobileAspectRatioWarning && (
                  <p className="text-[9px] text-amber-800 bg-amber-50 p-2.5 rounded-lg font-bold border border-amber-200 leading-normal">{mobileAspectRatioWarning}</p>
                )}
              </div>
            )}
          </div>

          {/* Box 4: Favicon navigation icon */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Ícone do Navegador (Favicon)</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">Configure o ícone que aparece nas abas dos computadores</p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[10px] font-black uppercase text-slate-400">Envio do Ícone (512 × 512 px)</span>
              <button
                type="button"
                onClick={() => faviconInputRef.current?.click()}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[9px] rounded-lg border border-slate-300 transition-all uppercase cursor-pointer"
              >
                Selecionar Favicon
              </button>
              <input
                type="file"
                ref={faviconInputRef}
                onChange={(e) => e.target.files?.[0] && handleUploadFile(e.target.files[0], 'favicon')}
                accept="image/png, image/x-icon, image/jpeg, image/webp"
                className="hidden"
              />
            </div>

            <div
              onDragOver={(e) => handleDragOver(e, 'favicon')}
              onDragLeave={(e) => handleDragLeave(e, 'favicon')}
              onDrop={(e) => handleDrop(e, 'favicon')}
              className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                isDragging['favicon'] ? 'border-[#1E4DDB] bg-blue-50/40' : 'border-slate-200 bg-slate-50/30'
              }`}
            >
              {faviconUrl ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white p-1 border rounded shadow-xs flex items-center justify-center">
                    <img src={faviconUrl} alt="Favicon" className="w-8 h-8 object-contain" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-slate-700">favicon.png</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveLogo('favicon')}
                      className="text-rose-600 hover:text-rose-700 font-bold text-[10px] flex items-center gap-1 mt-0.5 cursor-pointer"
                    >
                      <Trash2 size={11} /> Remover
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 select-none">
                  <p className="text-[10px] font-bold text-slate-500">Arraste seu ícone quadrado 512x512 aqui</p>
                </div>
              )}

              {uploadProgress['favicon'] !== undefined && (
                <div className="w-full max-w-[160px] mt-1">
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div className="bg-[#1E4DDB] h-full" style={{ width: `${uploadProgress['favicon']}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveAll}
              className="flex-1 min-w-[180px] py-3.5 bg-[#37C76A] hover:bg-[#2ca455] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Save size={14} />
              <span>Salvar Alterações da Logo</span>
            </button>

            {previousConfig && (
              <button
                type="button"
                onClick={handleRestorePrevious}
                className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-300 cursor-pointer flex items-center gap-1.5"
                title="Restaurar valores antes das alterações"
              >
                <RefreshCw size={13} />
                <span>Restaurar Anterior</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Responsive Live Header Preview (Grid span 5) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4">
          <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl shadow-xl space-y-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-200">Pré-visualização Real</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Teste a logo nos diferentes formatos de tela</p>
              </div>

              {/* Devices selector */}
              <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                {([
                  { id: 'desktop', icon: Monitor, title: 'Computador' },
                  { id: 'tablet', icon: Tablet, title: 'Tablet' },
                  { id: 'mobile', icon: Smartphone, title: 'Celular' }
                ] as const).map((device) => {
                  const Icon = device.icon;
                  return (
                    <button
                      key={device.id}
                      type="button"
                      onClick={() => setPreviewDevice(device.id)}
                      className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                        previewDevice === device.id
                          ? 'bg-[#1E4DDB] text-white'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                      }`}
                      title={device.title}
                    >
                      <Icon size={14} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulated browser window viewport */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="bg-slate-800/80 px-3 py-1.5 border-b border-slate-900 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 select-none">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="bg-slate-900 rounded-md px-3 py-0.5 text-[8px] mx-auto text-slate-300 w-1/2 text-center truncate">
                  atividadescriativasoficial.com.br
                </div>
              </div>

              {/* Responsive Container Wrapper */}
              <div className="p-4 bg-slate-100 flex items-center justify-center min-h-[160px] overflow-x-auto">
                <div 
                  className="bg-[#0E2A79] border border-white/5 shadow-md text-white transition-all duration-300 rounded-lg flex flex-col w-full"
                  style={{ 
                    maxWidth: previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '420px' : '280px'
                  }}
                >
                  {/* Simulated Promo bar */}
                  <div className="bg-[#128C7E] text-[8px] py-1 text-center font-extrabold uppercase tracking-widest text-emerald-100 px-2 truncate leading-none shrink-0">
                    {siteConfig.promoText || "Materiais pedagógicos digitais para imprimir e aplicar"}
                  </div>

                  {/* Dynamic Header Body mockup */}
                  <div className="p-3 flex items-center justify-between gap-4">
                    
                    {/* Header Logo placement inside mockup */}
                    <div 
                      className="flex items-center cursor-pointer flex-1"
                      style={{
                        justifyContent: logoAlignment === 'center' ? 'center' : logoAlignment === 'right' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {logoUrl ? (
                        <img 
                          src={previewDevice === 'mobile' && useDifferentMobileLogo && mobileLogoUrl ? mobileLogoUrl : logoUrl} 
                          alt={logoAlt} 
                          className="object-contain h-auto transition-all"
                          style={{
                            width: `${
                              previewDevice === 'desktop' 
                                ? logoDesktopWidth 
                                : previewDevice === 'tablet' 
                                  ? logoTabletWidth 
                                  : logoMobileWidth
                            }px`,
                            maxHeight: `${logoMaxHeight}px`,
                            marginTop: `${logoMarginTop}px`,
                            marginBottom: `${logoMarginBottom}px`,
                            marginLeft: `${logoMarginLeft}px`,
                            marginRight: `${logoMarginRight}px`
                          }}
                        />
                      ) : (
                        /* Default fallback SVG branding */
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 bg-white/10 rounded-full p-0.5 border border-white/20 flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 100 100" className="w-5 h-5">
                              <path d="M 50 65 C 20 40 10 10 45 15 C 50 20 50 20 50 65" fill="#EF4444" opacity="0.85" />
                              <path d="M 50 65 C 80 40 90 10 55 15 C 50 20 50 20 50 65" fill="#3B82F6" opacity="0.85" />
                            </svg>
                          </div>
                          <div className="flex flex-col text-left select-none leading-none">
                            <span className="font-black text-[9px] uppercase tracking-wider">Atividades Criativas</span>
                            <span className="text-[7px] text-[#FFD22E] font-bold mt-0.5 tracking-wider">OFICIAL</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Simulated navigation and buttons for context */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {previewDevice === 'desktop' ? (
                        <div className="flex gap-2 text-[8px] font-extrabold uppercase text-slate-300">
                          <span className="hover:text-white">Loja</span>
                          <span className="hover:text-white">Kits</span>
                          <span className="text-[#FFD22E]">Novo</span>
                        </div>
                      ) : null}
                      <div className="px-2 py-1 bg-white/10 text-white rounded text-[7px] font-extrabold uppercase tracking-wider leading-none">
                        MENU
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Status indicators */}
              <div className="p-3 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                <span>Modo: <strong className="text-blue-400 uppercase">{previewDevice}</strong></span>
                <span>Proporção: <strong className="text-slate-200">Mantida h-auto</strong></span>
              </div>
            </div>

            {/* Note */}
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              * Nota: A logo também é aplicada com proporções elegantes no rodapé e telas administrativas. O menu do site e cabeçalho irão expandir e crescer de altura automaticamente se você definir tamanhos ou alturas maiores, sem estragar o alinhamento.
            </p>
          </div>

          {/* Footer Preview Mockup */}
          <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl shadow-xl space-y-4 border border-slate-800">
            <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider">Visualização no Rodapé</h3>
            <div className="bg-[#0E2A79] border border-white/5 p-4 rounded-2xl flex flex-col gap-3">
              <div className="flex flex-col gap-2 border-b border-white/10 pb-3">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={logoAlt} 
                    className="object-contain max-h-[45px] max-w-[160px] self-start" 
                  />
                ) : (
                  <div className="flex items-center gap-1.5 self-start">
                    <div className="w-5 h-5 bg-white/10 rounded-full p-0.5 flex items-center justify-center border border-white/20">
                      <svg viewBox="0 0 100 100" className="w-4 h-4">
                        <path d="M 50 65 C 20 40 10 10 45 15 C 50 20 50 20 50 65" fill="#EF4444" />
                      </svg>
                    </div>
                    <span className="font-black text-[9px] uppercase tracking-wider leading-none">Atividades Criativas</span>
                  </div>
                )}
                <p className="text-[9px] text-slate-300 font-medium">Materiais pedagógicos digitais prontos para imprimir e aplicar.</p>
              </div>
              <p className="text-[8px] text-slate-400 leading-normal">© {new Date().getFullYear()} Atividades Criativas Oficial. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
