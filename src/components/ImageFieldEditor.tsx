import React, { useState, useRef } from 'react';
import { Image, Upload, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { auth, db, storage } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { SiteConfig } from '../types';
import { compressImage } from '../utils/imageCompressor';

interface ImageFieldEditorProps {
  field: keyof SiteConfig;
  label: string;
  recommendation: string;
  siteConfig: SiteConfig;
  onUpdate: (updatedConfig: SiteConfig) => void;
  onSuccess: (message: string) => void;
  storagePathPrefix: string;
  objectFit?: 'contain' | 'cover';
}

export default function ImageFieldEditor({
  field,
  label,
  recommendation,
  siteConfig,
  onUpdate,
  onSuccess,
  storagePathPrefix,
  objectFit = 'contain'
}: ImageFieldEditorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStepText, setUploadStepText] = useState('Preparando imagem...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentImageUrl = (siteConfig[field] as string) || '';
  const isSaved = !selectedFile;

  // Handle file selection and display preview instantly
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validation
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Formato inválido. Use PNG, JPG, JPEG, WebP ou SVG.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrorMessage('O arquivo é muito grande (máximo de 5 MB).');
        return;
      }

      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Auto-upload immediately to ensure a seamless experience and avoid missing/forgotten saves
      handleUploadAndSave(file, objectUrl);
    }
  };

  // Trigger file selection
  const handleTriggerSelect = () => {
    fileInputRef.current?.click();
  };

  // Reset local state
  const handleCancelSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setErrorMessage(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Timeout helper to prevent infinite loading (Item 2)
  function withTimeout<T>(promise: Promise<T>, ms: number, context: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`TIMEOUT: O processo "${context}" demorou mais que ${ms / 1000}s.`)), ms)
      )
    ]);
  }

  // Upload image to Firebase Storage and save to Firestore
  // Upload image to Firebase Storage and save to Firestore
  const handleUploadAndSave = async (fileToUpload?: File | unknown, localPreviewUrl?: string) => {
    const file = (fileToUpload instanceof File) ? fileToUpload : selectedFile;
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);
    setUploadStepText('Comprimindo imagem...');

    try {
      console.log(`[Diagnostic] Starting image replacement for ${field}`);
      console.log(`[Diagnostic] 1. File selected: ${file.name}, original size: ${Math.round(file.size / 1024)} KB`);
      console.log(`[Diagnostic] 2. Compression starting`);

      // Compress client-side to ensure lightning-fast uploads and prevent timeouts
      let uploadBlob: Blob = file;
      let localBase64DataUrl = '';
      try {
        const compressedBase64 = await compressImage(file, 800, 0.7);
        if (compressedBase64 && compressedBase64.startsWith('data:')) {
          localBase64DataUrl = compressedBase64;
          const parts = compressedBase64.split(',');
          const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
          const bstr = atob(parts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          uploadBlob = new Blob([u8arr], { type: mime });
          console.log(`[Diagnostic] Compression finished. Compressed size: ${Math.round(uploadBlob.size / 1024)} KB`);
        }
      } catch (err) {
        console.warn('[Diagnostic] Compression failed, falling back to original file', err);
        uploadBlob = file;
      }

      let downloadUrl = '';
      let storagePath = '';

      if (field === 'activityGroupImageUrl' || field === 'authorPhotoUrl' || field === 'seoImageUrl') {
        try {
          let customPath = "site/seo";
          if (field === 'authorPhotoUrl') customPath = "site/author";
          if (field === 'activityGroupImageUrl') customPath = "site/activity-group";

          setUploadStepText('Enviando para o Cloudflare R2...');
          setUploadProgress(20);

          const user = auth.currentUser;
          if (!user) {
            throw new Error("Você precisa estar logado como administrador para enviar imagens.");
          }

          // Get ID token for authorization
          const idToken = await user.getIdToken();
          setUploadProgress(40);

          // Prepare FormData
          const formData = new FormData();
          const fileToPost = new File([uploadBlob], file.name, { type: uploadBlob.type });
          formData.append("file", fileToPost);
          formData.append("customPath", customPath);

          const response = await fetch("/api/r2-upload", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${idToken}`
            },
            body: formData
          });

          if (response.status === 404) {
            throw new Error("O servidor de upload R2 não está disponível. Por favor, verifique se o R2 está configurado.");
          }

          const contentType = response.headers.get("content-type") || "";
          let resData: any = {};
          if (contentType.includes("application/json")) {
            resData = await response.json();
          } else {
            const textData = await response.text();
            throw new Error(`Servidor de upload retornou resposta inválida (${response.status}): ${textData.substring(0, 120)}`);
          }

          if (!response.ok) {
            throw new Error(resData.error || `Erro de upload: ${response.status}`);
          }

          downloadUrl = resData.url;
          storagePath = resData.key;
          setUploadProgress(100);
          console.log(`[Diagnostic] Upload completed successfully via Cloudflare R2: ${downloadUrl}`);
        } catch (uploadError: any) {
          console.warn('[Diagnostic] Cloudflare R2 upload failed, attempting Firebase Storage fallback:', uploadError);
          try {
            setUploadStepText('Enviando para o Firebase Storage...');
            setUploadProgress(50);
            const fileExt = file.name.split('.').pop() || 'jpg';
            const uniqueName = `${Date.now()}_image.${fileExt}`;
            storagePath = `${storagePathPrefix}/${uniqueName}`;
            const storageRef = ref(storage, storagePath);

            const uploadPromise = (async () => {
              const result = await uploadBytes(storageRef, uploadBlob);
              setUploadProgress(80);
              const url = await getDownloadURL(result.ref);
              setUploadProgress(100);
              return url;
            })();

            downloadUrl = await withTimeout(uploadPromise, 20000, "Envio para o Firebase");
          } catch (fbErr: any) {
            console.warn('[Diagnostic] Firebase Storage fallback also failed, using compressed Data URL:', fbErr);
            if (localBase64DataUrl) {
              downloadUrl = localBase64DataUrl;
              storagePath = `dataurl_${Date.now()}`;
              setUploadProgress(100);
            } else {
              throw new Error(`Falha no upload R2 e Firebase: ${uploadError.message || uploadError}`);
            }
          }
        }
      } else {
        try {
          setUploadStepText('Enviando para o Firebase...');
          setUploadProgress(15);

          // Generate a unique filename using timestamp
          const fileExt = file.name.split('.').pop() || 'jpg';
          const uniqueName = `${Date.now()}_image.${fileExt}`;
          storagePath = `${storagePathPrefix}/${uniqueName}`;
          const storageRef = ref(storage, storagePath);

          // We use uploadBytes (non-resumable simple upload) as requested by the user
          const uploadPromise = (async () => {
            setUploadProgress(35);
            const result = await uploadBytes(storageRef, uploadBlob);
            setUploadProgress(70);
            const url = await getDownloadURL(result.ref);
            setUploadProgress(100);
            return url;
          })();

          // Wrap with 30s timeout
          const timeoutMs = 30000;
          downloadUrl = await withTimeout(uploadPromise, timeoutMs, "Envio da foto");
          console.log(`[Diagnostic] 4. Upload completed successfully via Firebase Storage`);
        } catch (uploadError: any) {
          console.warn('[Diagnostic] Firebase Storage upload failed, using compressed Data URL fallback:', uploadError);
          if (localBase64DataUrl) {
            downloadUrl = localBase64DataUrl;
            storagePath = `dataurl_${Date.now()}`;
            setUploadProgress(100);
          } else {
            throw uploadError;
          }
        }
      }

      console.log(`[Diagnostic] 5. Real downloadURL obtained: ${downloadUrl ? (downloadUrl.startsWith('data:') ? 'Base64 data URL' : downloadUrl) : 'empty'}`);
      console.log(`[Diagnostic] 6. Starting Firestore save`);

      setUploadStepText('Salvando no site...');

      // Determine corresponding storage path field
      let storagePathField: string | null = null;
      if (field === 'authorPhotoUrl') {
        storagePathField = 'authorPhotoStoragePath';
      } else if (field === 'logoUrl') {
        storagePathField = 'logoStoragePath';
      } else if (field === 'mobileLogoUrl') {
        storagePathField = 'mobileLogoStoragePath';
      } else if (field === 'faviconUrl') {
        storagePathField = 'faviconStoragePath';
      } else if (field === 'heroBackgroundImageUrl') {
        storagePathField = 'heroBackgroundImageStoragePath';
      } else if (field === 'featuredKitImageUrl') {
        storagePathField = 'featuredKitImageStoragePath';
      } else if (field === 'newsletterImageUrl') {
        storagePathField = 'newsletterImageStoragePath';
      } else if (field === 'footerImageUrl') {
        storagePathField = 'footerImageStoragePath';
      } else if (field === 'activityGroupImageUrl') {
        storagePathField = 'activityGroupImageStoragePath';
      } else if (field === 'seoImageUrl') {
        storagePathField = 'seoImageStoragePath';
      }

      const savePromise = (async () => {
        // Read current document from Firestore first to make sure we don't overwrite other fields with stale values
        const docRef = doc(db, 'siteConfig', 'global');
        const snap = await getDoc(docRef);
        const currentDocData = snap.exists() ? snap.data() : {};

        // Merge current Firestore data, local state siteConfig, and the new fields
        const updatedConfig = {
          ...siteConfig,
          ...currentDocData,
          [field]: downloadUrl,
          ...(storagePathField ? { [storagePathField]: storagePath } : {}),
          updatedAt: new Date().toISOString()
        };

        await setDoc(docRef, updatedConfig);
        return updatedConfig;
      })();

      const firestoreTimeoutMs = 15000;
      const updatedConfig = await withTimeout(savePromise, firestoreTimeoutMs, "Salvar no Firestore");

      console.log(`[Diagnostic] 7. Saved successfully to Firestore. Starting rigorous validation.`);

      // === RIGOROUS AUDIT VERIFICATION ===
      setUploadStepText('Verificando gravação...');
      const docRefVerify = doc(db, 'siteConfig', 'global');
      const snapVerify = await getDoc(docRefVerify);
      
      if (!snapVerify.exists()) {
        throw new Error('Erro de confirmação: O documento de configuração global sumiu ou não foi encontrado.');
      }
      
      const verifiedData = snapVerify.data();
      if (!verifiedData[field] || verifiedData[field] !== downloadUrl) {
        throw new Error(`Erro de confirmação: A imagem foi enviada, mas o campo ${field} não foi confirmado no Firestore.`);
      }
      
      console.log(`[Diagnostic] 8. Verification successful: URL matches in Firestore`);

      console.log(`[Diagnostic] 9. Updating local application state`);
      onUpdate(updatedConfig);
      
      // Clean up local preview
      setSelectedFile(null);
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      } else if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      console.log(`[Diagnostic] 10. Completed image update workflow successfully`);
      onSuccess('Imagem salva e confirmada no banco de dados com sucesso!');
    } catch (error: any) {
      console.error(`[Diagnostic] Error in image update workflow:`, error);
      
      let friendlyMsg = error instanceof Error ? error.message : String(error);
      if (friendlyMsg.includes("TIMEOUT")) {
        friendlyMsg = "O envio ou salvamento demorou muito e foi cancelado. Tente novamente.";
      } else if (error?.code === 'storage/unauthorized') {
        friendlyMsg = "Sem permissão administrativa para salvar arquivos no Firebase Storage.";
      } else if (error?.code === 'storage/quota-exceeded') {
        friendlyMsg = "Quota de armazenamento do Firebase excedida.";
      } else if (error?.code === 'storage/canceled') {
        friendlyMsg = "Envio cancelado pelo usuário.";
      }
      
      setErrorMessage(`Erro ao salvar imagem: ${friendlyMsg}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Remove current image
  const handleRemoveImage = async () => {
    if (!window.confirm('Tem certeza de que deseja remover esta imagem?')) return;

    try {
      console.log(`[Diagnostic] Removing image for ${field}`);
      
      let storagePathField: string | null = null;
      if (field === 'authorPhotoUrl') {
        storagePathField = 'authorPhotoStoragePath';
      } else if (field === 'logoUrl') {
        storagePathField = 'logoStoragePath';
      } else if (field === 'mobileLogoUrl') {
        storagePathField = 'mobileLogoStoragePath';
      } else if (field === 'faviconUrl') {
        storagePathField = 'faviconStoragePath';
      } else if (field === 'activityGroupImageUrl') {
        storagePathField = 'activityGroupImageStoragePath';
      }

      const docRef = doc(db, 'siteConfig', 'global');
      const snap = await getDoc(docRef);
      const currentDocData = snap.exists() ? snap.data() : {};

      const updatedConfig = {
        ...siteConfig,
        ...currentDocData,
        [field]: '',
        ...(storagePathField ? { [storagePathField]: '' } : {}),
        updatedAt: new Date().toISOString()
      };

      await setDoc(docRef, updatedConfig);
      onUpdate(updatedConfig);
      onSuccess('Imagem removida com sucesso!');
    } catch (error: any) {
      console.error('[Diagnostic] Error removing image:', error);
      setErrorMessage(`Erro ao remover imagem: ${error.message || error}`);
    }
  };

  const imageSrcToShow = previewUrl || currentImageUrl;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Label and Recommendation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{label}</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            Recomendado: <span className="text-slate-600">{recommendation}</span>
          </p>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          {isSaved ? (
            <span className="inline-flex items-center gap-1 bg-green-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              <CheckCircle2 size={12} className="stroke-[3]" />
              Salvo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
              <AlertCircle size={12} className="stroke-[3]" />
              Não Salvo
            </span>
          )}
        </div>
      </div>

      {/* Main Image Display / Area */}
      <div className={`relative bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center group ${
        field === 'authorPhotoUrl'
          ? 'mx-auto w-full max-w-[260px] max-h-[320px] aspect-[13/16]'
          : 'w-full aspect-[16/9] sm:aspect-[2.39/1]'
      }`}>
        {imageSrcToShow ? (
          <img
            src={imageSrcToShow}
            alt={label}
            className={`w-full h-full transition-transform duration-300 ${
              field === 'authorPhotoUrl' ? 'object-cover rounded-xl' : (objectFit === 'contain' ? 'object-contain p-4' : 'object-cover')
            }`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400 font-bold text-center">
            <Image size={32} className="stroke-[1.5]" />
            <span className="text-[11px] uppercase tracking-wider">Nenhuma Imagem Selecionada</span>
          </div>
        )}

        {/* Upload progress overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white">
            <Loader2 className="w-8 h-8 text-[#FF6A1A] animate-spin stroke-[2.5]" />
            <div className="flex flex-col items-center text-center gap-1">
              <span className="font-extrabold text-xs uppercase tracking-widest">{uploadStepText}</span>
              <span className="font-mono text-sm font-bold text-emerald-400">{uploadProgress}%</span>
            </div>
            <div className="w-1/2 bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
          <AlertCircle size={16} className="shrink-0 stroke-[2.5]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Buttons Footer */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
          className="hidden"
          disabled={isUploading}
        />

        {selectedFile ? (
          <>
            <button
              type="button"
              onClick={() => handleUploadAndSave()}
              disabled={isUploading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-[#37C76A] hover:bg-[#2ca455] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md transition-colors uppercase tracking-wider"
            >
              <CheckCircle2 size={14} className="stroke-[2.5]" />
              Salvar Imagem
            </button>
            <button
              type="button"
              onClick={handleCancelSelection}
              disabled={isUploading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors uppercase tracking-wider"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleTriggerSelect}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-[#0E2A79] text-xs font-extrabold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors uppercase tracking-wider"
            >
              <Upload size={14} className="stroke-[2.5]" />
              Trocar Imagem
            </button>
            {currentImageUrl && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold p-2.5 rounded-xl transition-colors"
                title="Remover Imagem"
              >
                <Trash2 size={14} className="stroke-[2.5]" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
