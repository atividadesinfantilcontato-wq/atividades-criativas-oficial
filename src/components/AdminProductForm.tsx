import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit3, Copy, Trash2, Eye, EyeOff, Save, Check, X,
  FolderOpen, Search, Filter, AlertCircle, ArrowLeft, ArrowRight, Layers,
  FileText, Image as ImageIcon, DollarSign, Video, Settings, Play, ChevronRight, HelpCircle,
  ChevronLeft, Download, BookOpen, Heart, Info, Globe, Sparkles, Upload, RefreshCw, Cloud
} from 'lucide-react';
import { Product, sanitizeProduct, SiteConfig } from '../types';
import { INITIAL_CATEGORIES } from '../data';
import { compressImage, ensureSafeProductPayload } from '../utils/imageCompressor';
import ProductImage from './ProductImage';
import { doc, setDoc, getDoc, collection, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, app, resolvedFirebaseConfig } from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';

interface AdminProductFormProps {
  products: Product[];
  onUpdateProducts: (updatedProducts: Product[]) => void;
  initialProductId?: string | null;
  initialMode?: 'list' | 'edit' | 'new';
  onBackToOverview?: () => void;
  onPreviewProduct?: (productId: string) => void;
  onViewOnSite?: (productId: string) => void;
  // If navigating from Materiais Gratuitos sidebar option, we pre-filter the list
  initialFilterType?: string;
  siteConfig?: SiteConfig;
  onUpdateSiteConfig?: (updatedConfig: SiteConfig) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function AdminProductForm({
  products,
  onUpdateProducts,
  initialProductId = null,
  initialMode = 'list',
  onBackToOverview,
  onPreviewProduct,
  onViewOnSite,
  initialFilterType = 'all',
  siteConfig,
  onUpdateSiteConfig
}: AdminProductFormProps) {
  
  // Navigation mode
  const [mode, setMode] = useState<'list' | 'form'>(initialMode === 'list' ? 'list' : 'form');
  const [editingProductId, setEditingProductId] = useState<string | null>(initialProductId);

  // Exclusão Segura states
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState<boolean>(false);

  // Filters
  const [filterType, setFilterType] = useState<string>(initialFilterType);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Featured Product Editor States
  const [featuredSearchQuery, setFeaturedSearchQuery] = useState('');
  const [featuredFilterActiveOnly, setFeaturedFilterActiveOnly] = useState(true);
  const [isSavingFeatured, setIsSavingFeatured] = useState(false);
  const [featuredSaveSuccess, setFeaturedSaveSuccess] = useState(false);
  const [featuredProductError, setFeaturedProductError] = useState<string | null>(null);
  
  // Form step state: 1 to 6
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showRealPreview, setShowRealPreview] = useState<boolean>(false);
  const [savedProduct, setSavedProduct] = useState<Product | null>(null);

  // Product Fields state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [badge, setBadge] = useState('');
  const [productType, setProductType] = useState<'pago' | 'gratuito'>('pago');
  const [isActive, setIsActive] = useState(true);
  
  // Images
  const [imageUrl, setImageUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [imageInputFile, setImageInputFile] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [originalGalleryUrls, setOriginalGalleryUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');

  // --- Nossos novos estados de suporte a salvamento resiliente ---
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgressPercent, setSaveProgressPercent] = useState(0);
  const [diagnosticsText, setDiagnosticsText] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [persistentError, setPersistentError] = useState<string | null>(null);
  const [lastSaveAsActive, setLastSaveAsActive] = useState<boolean>(true);

  // Imagens (separadas por estados como pedido no item 6)
  const [newMainImageFile, setNewMainImageFile] = useState<File | null>(null);
  const [savedMainImageUrl, setSavedMainImageUrl] = useState('');
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [galleryFileMap, setGalleryFileMap] = useState<Map<string, File>>(new Map());

  // Free PDF Storage States
  const [freePdfUrl, setFreePdfUrl] = useState<string>('');
  const [freePdfStoragePath, setFreePdfStoragePath] = useState<string>('');
  const [freePdfFileName, setFreePdfFileName] = useState<string>('');
  const [freePdfSize, setFreePdfSize] = useState<number>(0);
  const [freePdfUpdatedAt, setFreePdfUpdatedAt] = useState<string>('');
  const [requireEmailBeforeDownload, setRequireEmailBeforeDownload] = useState<boolean>(false);
  const [showOnHome, setShowOnHome] = useState<boolean>(false);
  const [currentGeneratedId, setCurrentGeneratedId] = useState<string>('');

  // PDF interactive upload states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploading, setPdfUploading] = useState<boolean>(false);
  const [pdfUploadProgress, setPdfUploadProgress] = useState<number>(0);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);
  const [pdfUploadSuccess, setPdfUploadSuccess] = useState<string | null>(null);

  // Task de Upload Ativa para cancelamento
  const activeUploadTaskRef = useRef<any>(null);
  const isSaveCancelledRef = useRef<boolean>(false);

  const [showDiagnosticsPanel, setShowDiagnosticsPanel] = useState(false);
  const [diagnosticsDetails, setDiagnosticsDetails] = useState<{
    code?: string;
    originalMessage?: string;
    stage?: string;
    filename?: string;
    filetype?: string;
    filesize?: string;
    storagePath?: string;
    uid?: string;
    email?: string;
    isAdmin?: boolean;
    storageProvider?: string;
    databaseId?: string;
    collectionDoc?: string;
    logText?: string;
  } | null>(null);

  const [adminCheckResult, setAdminCheckResult] = useState<{
    status: 'checking' | 'valid' | 'no_user' | 'no_doc' | 'invalid_fields' | 'error';
    email?: string;
    uid?: string;
    role?: string;
    active?: boolean;
    errorMsg?: string;
  }>({ status: 'checking' });

  const [isTestingUpload, setIsTestingUpload] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  // Cloudflare R2 upload test states
  const [isTestingR2, setIsTestingR2] = useState<boolean>(false);
  const [r2TestResult, setR2TestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  // Specs and descriptions
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [activityInfo, setActivityInfo] = useState('');
  const [whatYouWillReceive, setWhatYouWillReceive] = useState('');
  const [objectives, setObjectives] = useState('');
  const [howToUse, setHowToUse] = useState('');
  const [materialsNeeded, setMaterialsNeeded] = useState('');
  const [howToPrint, setHowToPrint] = useState('');

  const [ageRange, setAgeRange] = useState('');
  const [pages, setPages] = useState(10);
  const [format, setFormat] = useState('PDF pronto para imprimir');
  const [printSize, setPrintSize] = useState('A4');

  // Sales
  const [price, setPrice] = useState(0);
  const [promoPrice, setPromoPrice] = useState(0);
  const [hotmartUrl, setHotmartUrl] = useState('');
  const [buttonText, setButtonText] = useState('Garantir Meu Material');

  // Video
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Badges flags
  const [isHighlight, setIsHighlight] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isPromo, setIsPromo] = useState(false);
  const [isKit, setIsKit] = useState(false);
  const [order, setOrder] = useState(0);
  
  // Alerts and toasting
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000);
  };

  // Sync parameters from parent redirects
  useEffect(() => {
    if (initialProductId) {
      handleEditProduct(initialProductId);
    } else if (initialMode === 'new') {
      handleCreateNew();
    }
  }, [initialProductId, initialMode]);

  // Handle pre-filter overrides (such as free materials clicked)
  useEffect(() => {
    setFilterType(initialFilterType);
  }, [initialFilterType]);

  // Generate a friendly slug from product name on-the-fly
  useEffect(() => {
    if (mode === 'form' && !editingProductId) {
      const generated = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(generated);
    }
  }, [name, mode, editingProductId]);

  useEffect(() => {
    let active = true;
    const checkAdmin = async (currentUser?: User | null) => {
      const user = currentUser !== undefined ? currentUser : auth.currentUser;
      if (!user) {
        const isLocalLoggedIn = localStorage.getItem('atividades_oficial_logged_in') === 'true';
        if (active) {
          if (isLocalLoggedIn) {
            setAdminCheckResult({
              status: 'valid',
              email: 'atividadesinfantilcontato@gmail.com',
              uid: 'PahVnk6qMXQLbyz5Rnx4TJXK44r2',
              role: 'admin',
              active: true
            });
          } else {
            setAdminCheckResult({ status: 'no_user' });
          }
        }
        return;
      }
      try {
        if (active) setAdminCheckResult({ status: 'checking', email: user.email || '', uid: user.uid });
        const docRef = doc(db, 'admins', user.uid);
        let snap = await getDoc(docRef);
        
        let hasValidDoc = false;
        let role = '';
        let docActive = false;

        if (snap.exists()) {
          const data = snap.data();
          if (data && data.role === 'admin' && data.active === true) {
            hasValidDoc = true;
            role = data.role;
            docActive = data.active;
          }
        }

        // Auto-provision if superadmin email is logged in but missing valid firestore doc
        if (!hasValidDoc && user.email === 'atividadesinfantilcontato@gmail.com') {
          try {
            const now = new Date().toISOString();
            await setDoc(docRef, {
              role: 'admin',
              active: true,
              email: user.email,
              createdAt: now,
              updatedAt: now
            });
            hasValidDoc = true;
            role = 'admin';
            docActive = true;
            snap = await getDoc(docRef);
          } catch (writeErr) {
            console.error("Failed to automatically provision admin doc:", writeErr);
          }
        }

        if (!active) return;

        if (hasValidDoc) {
          setAdminCheckResult({
            status: 'valid',
            email: user.email || '',
            uid: user.uid,
            role: role,
            active: docActive
          });
        } else if (snap.exists()) {
          const data = snap.data();
          setAdminCheckResult({
            status: 'invalid_fields',
            email: user.email || '',
            uid: user.uid,
            role: data?.role,
            active: data?.active
          });
        } else {
          setAdminCheckResult({
            status: 'no_doc',
            email: user.email || '',
            uid: user.uid
          });
        }
      } catch (err: any) {
        if (active) {
          setAdminCheckResult({
            status: 'error',
            email: user.email || '',
            uid: user.uid,
            errorMsg: err.message || String(err)
          });
        }
      }
    };

    checkAdmin();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      checkAdmin(user);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [mode]);

  const handleTestUpload = async () => {
    showToast('error', 'Os uploads de arquivos são processados exclusivamente pelo Cloudflare R2.');
    return;
  };

  const handleTestR2Upload = async () => {
    const user = auth.currentUser;
    if (!user) {
      showToast('error', 'Nenhum usuário logado. Entre novamente no painel.');
      return;
    }

    setIsTestingR2(true);
    setR2TestResult(null);

    try {
      // 1. Check admin status in Firestore
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminSnap = await getDoc(adminDocRef);
      let isAdminValid = false;
      if (adminSnap.exists()) {
        const data = adminSnap.data();
        if (data && data.role === 'admin' && data.active === true) {
          isAdminValid = true;
        }
      }

      if (!isAdminValid && user.email === 'atividadesinfantilcontato@gmail.com') {
        isAdminValid = true; // Primary owner bootstrap
      }

      if (!isAdminValid) {
        throw new Error("Acesso negado. Apenas administradores cadastrados podem realizar este teste.");
      }

            // 2. Check if R2 is configured on the backend
      const statusRes = await fetch("/api/r2-status").catch(() => null);
      if (!statusRes) {
        throw new Error("Endpoint /api/r2-upload não encontrado.");
      }
      
      const statusData = await statusRes.json().catch(() => ({}));
      if (!statusData.configured) {
        const missingText = statusData.missing && statusData.missing.length > 0 
          ? `falta ${statusData.missing.join(", ")}` 
          : "variáveis de ambiente necessárias ausentes";
        const finalMsg = `R2 não configurado: ${missingText}.`;
        setR2TestResult({
          success: false,
          message: finalMsg,
          details: { status: "unconfigured", missing: statusData.missing }
        });
        showToast('error', finalMsg);
        setIsTestingR2(false);
        return;
      }

      // 3. Create tiny 1x1 transparent PNG blob for R2 upload test
      const testBlob = new Blob([
        new Uint8Array([
          137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 120, 94, 99, 96, 96, 96, 0, 0, 0, 5, 0, 1, 165, 246, 69, 123, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
        ])
      ], { type: 'image/png' });
      const timestamp = Date.now();
      const testFile = new File([testBlob], `test_r2_${timestamp}.png`, { type: 'image/png' });

      // 4. Get Firebase ID token
      const idToken = await user.getIdToken();

      // 5. Send POST to /api/r2-upload
      const formData = new FormData();
      formData.append("file", testFile);

      const uploadRes = await fetch("/api/r2-upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`
        },
        body: formData
      });

      if (uploadRes.status === 404) {
        throw new Error("Endpoint /api/r2-upload não encontrado.");
      }

      const uploadContentType = uploadRes.headers.get("content-type") || "";
      let resData: any = {};
      if (uploadContentType.includes("application/json")) {
        resData = await uploadRes.json();
      } else {
        const textData = await uploadRes.text();
        throw new Error(`Servidor de upload retornou resposta não-JSON (${uploadRes.status}): ${textData.substring(0, 100)}`);
      }

      if (!uploadRes.ok) {
        throw new Error(resData.error || `Servidor retornou status ${uploadRes.status}`);
      }

      // 6. Save log to Firestore at debug_uploads_r2/{id}
      const logColRef = collection(db, 'debug_uploads_r2');
      const logDocRef = doc(logColRef);
      await setDoc(logDocRef, {
        url: resData.url,
        key: resData.key,
        size: resData.size,
        contentType: resData.contentType,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
        status: "success"
      });

      setR2TestResult({
        success: true,
        message: "R2 conectado e upload funcionando.",
        details: resData
      });
      showToast('success', 'R2 conectado e upload funcionando.');
    } catch (err: any) {
      console.error("[Test R2 Upload] Failure:", err);
      const errMsg = err.message || String(err);
      
      let finalMessage = `Upload R2 falhou: ${errMsg}`;
      if (errMsg.includes("not found") || errMsg.includes("não encontrado") || errMsg.includes("404")) {
        finalMessage = "Endpoint /api/r2-upload não encontrado.";
      } else if (errMsg.includes("R2 não configurado")) {
        finalMessage = "R2 não configurado.";
      }

      setR2TestResult({
        success: false,
        message: finalMessage,
        details: { error: errMsg }
      });
      showToast('error', finalMessage);
    } finally {
      setIsTestingR2(false);
    }
  };

  const handleEditProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    setEditingProductId(id);
    setName(prod.name || '');
    setSlug(prod.slug || prod.id || '');
    setCategory(prod.category || INITIAL_CATEGORIES[0]?.name || 'Alfabetização');
    setBadge(prod.badge || prod.tag || '');
    setProductType(prod.productType || (prod.price === 0 ? 'gratuito' : 'pago'));
    setIsActive(prod.isActive !== false);
    
    const prodImageUrl = prod.imageUrl || prod.mainImageUrl || '';
    setImageUrl(prodImageUrl);
    setMainImagePreview(prodImageUrl);
    setNewMainImageFile(null);
    setSavedMainImageUrl(prodImageUrl.startsWith('http') ? prodImageUrl : '');
    
    const prodGallery = prod.galleryUrls || prod.galleryImages || (prodImageUrl ? [prodImageUrl] : []);
    setGalleryUrls(prodGallery);
    setGalleryFileMap(new Map());
    
    setOriginalImageUrl(prodImageUrl);
    setOriginalGalleryUrls(prodGallery);

    setShortDescription(prod.shortDescription || '');
    setDescription(prod.description || '');
    setActivityInfo(prod.activityInfo || prod.description || '');
    setWhatYouWillReceive((prod.whatYouWillReceive || []).join('\n'));
    setObjectives((prod.objectives || []).join('\n'));
    setHowToUse((prod.howToUse || []).join('\n'));
    setMaterialsNeeded((prod.materialsNeeded || []).join('\n'));
    setHowToPrint(prod.howToPrint || '');

    setAgeRange(prod.ageRange || '2 a 6 anos');
    setPages(prod.pages || 10);
    setFormat(prod.format || 'PDF pronto para imprimir');
    setPrintSize(prod.printSize || 'A4');

    setPrice(prod.price || 0);
    setPromoPrice(prod.promoPrice || 0);
    setHotmartUrl(prod.hotmartUrl || 'https://pay.hotmart.com/');
    setButtonText(prod.buttonText || 'Garantir Meu Material');

    setYoutubeUrl(prod.youtubeUrl || '');

    setIsHighlight(prod.isHighlight || prod.tag === 'RECOMENDADO');
    setIsNew(prod.isNew || prod.tag === 'NOVIDADE');
    setIsBestSeller(prod.isBestSeller || prod.tag === 'MAIS VENDIDO');
    setIsPromo(prod.isPromo || false);
    setIsKit(prod.isKit || false);
    setOrder(prod.order || 0);

    setFreePdfUrl(prod.freePdfUrl || '');
    setFreePdfStoragePath(prod.freePdfStoragePath || '');
    setFreePdfFileName(prod.freePdfFileName || '');
    setFreePdfSize(prod.freePdfSize || 0);
    setFreePdfUpdatedAt(prod.freePdfUpdatedAt || '');
    setRequireEmailBeforeDownload(prod.requireEmailBeforeDownload || false);
    setShowOnHome(prod.showOnHome || false);
    setCurrentGeneratedId(id);

    setPdfFile(null);
    setPdfUploading(false);
    setPdfUploadProgress(0);
    setPdfUploadError(null);
    setPdfUploadSuccess(null);

    setMode('form');
    setCurrentStep(1);
    setAlertMessage(null);
  };

  const handleCreateNew = () => {
    setEditingProductId(null);
    setName('');
    setSlug('');
    setCategory(INITIAL_CATEGORIES[0]?.name || 'Alfabetização');
    setBadge('');
    setProductType('pago');
    setIsActive(true);
    setImageUrl('');
    setMainImagePreview('');
    setNewMainImageFile(null);
    setSavedMainImageUrl('');
    setGalleryUrls([]);
    setGalleryFileMap(new Map());
    setOriginalImageUrl('');
    setOriginalGalleryUrls([]);
    setShortDescription('');
    setDescription('');
    setWhatYouWillReceive('PDF completo pronto para aplicação\nAtividades lúdicas coloridas');
    setObjectives('Estimular a cognição infantil\nTrabalhar habilidades motoras e traços');
    setHowToUse('Imprima os arquivos em alta qualidade\nSiga as orientações anexadas ao material');
    setMaterialsNeeded('Lápis e papel de desenho\nTesoura infantil sem ponta');
    setHowToPrint('Impressão comum colorida tamanho A4');
    setAgeRange('2 a 6 anos');
    setPages(24);
    setFormat('PDF pronto para imprimir');
    setPrintSize('A4');
    setPrice(19.90);
    setPromoPrice(9.90);
    setHotmartUrl('https://pay.hotmart.com/');
    setButtonText('Garantir Meu Material');
    setYoutubeUrl('');
    setIsHighlight(false);
    setIsNew(true);
    setIsBestSeller(false);
    setIsPromo(false);
    setIsKit(false);
    setOrder(0);

    setFreePdfUrl('');
    setFreePdfStoragePath('');
    setFreePdfFileName('');
    setFreePdfSize(0);
    setFreePdfUpdatedAt('');
    setRequireEmailBeforeDownload(false);
    setShowOnHome(false);
    setCurrentGeneratedId(`material-${Date.now()}`);

    setPdfFile(null);
    setPdfUploading(false);
    setPdfUploadProgress(0);
    setPdfUploadError(null);
    setPdfUploadSuccess(null);

    setMode('form');
    setCurrentStep(1);
    setAlertMessage(null);
  };

  const handleDuplicate = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    const duplicatedPayload: Product = {
      ...prod,
      id: `copy-${Date.now()}`,
      name: `${prod.name} (Cópia)`,
      slug: `${prod.slug}-copia`,
      isActive: false
    };

    onUpdateProducts([duplicatedPayload, ...products]);
    showToast('success', 'Produto duplicado como Rascunho com sucesso!');
  };

  const handleDelete = (id: string) => {
    setDeletingProductId(id);
    setShowDeleteModal(true);
  };

  const handleToggleActive = (id: string) => {
    const newList = products.map(p => {
      if (p.id === id) {
        const nextStatus = p.isActive === false ? true : false;
        showToast('success', `Status de ${p.name} alterado para ${nextStatus ? 'ATIVO' : 'INATIVO'}!`);
        return { ...p, isActive: nextStatus };
      }
      return p;
    });
    onUpdateProducts(newList);
  };

  // Auxiliar para aplicar limite de tempo (timeout) em Promises
  async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
    let timeoutId: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`TIMEOUT: ${errorMessage}`));
      }, timeoutMs);
    });
    try {
      const result = await Promise.race([promise, timeoutPromise]);
      return result;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfUploadError(null);
    setPdfUploadSuccess(null);

    // Validate type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfUploadError('Arquivo inválido. Envie apenas PDF.');
      setPdfFile(null);
      return;
    }

    // Validate size (30MB)
    const maxSize = 30 * 1024 * 1024;
    if (file.size > maxSize) {
      setPdfUploadError('Arquivo muito grande. O limite máximo é de 30 MB.');
      setPdfFile(null);
      return;
    }

    setPdfFile(file);
    // Automatically trigger upload once selected for a smooth user experience
    startPdfUpload(file);
  };

  const startPdfUpload = async (fileToUpload: File) => {
    if (!fileToUpload) return;

    const user = auth.currentUser;
    if (!user) {
      setPdfUploadError('Autenticação expirada. Por favor, faça login novamente.');
      return;
    }

    setPdfUploading(true);
    setPdfUploadProgress(30);
    setPdfUploadError(null);
    setPdfUploadSuccess(null);

    const materialId = editingProductId || currentGeneratedId || `material-${Date.now()}`;

    try {
      setPdfUploadProgress(60);
      const r2Result = await uploadToR2(fileToUpload, `products/${materialId}/free-pdf`);
      setPdfUploadProgress(100);

      setFreePdfUrl(r2Result.url);
      setFreePdfStoragePath(r2Result.key);
      setFreePdfFileName(fileToUpload.name);
      setFreePdfSize(fileToUpload.size);
      setFreePdfUpdatedAt(new Date().toISOString());
      setPdfUploadSuccess('PDF enviado com sucesso!');
      setPdfFile(null);
    } catch (error: any) {
      console.error('PDF upload error:', error);
      let errMsg = 'Erro durante o upload.';
      if (error.message) {
        if (error.message.includes("R2 não configurado")) {
          errMsg = "R2 não configurado para upload de produtos.";
        } else {
          errMsg = `Erro: ${error.message}`;
        }
      }
      setPdfUploadError(errMsg);
    } finally {
      setPdfUploading(false);
    }
  };

  const handlePdfRemove = async () => {
    setPdfUploadError(null);
    setPdfUploadSuccess(null);

    setFreePdfUrl('');
    setFreePdfStoragePath('');
    setFreePdfFileName('');
    setFreePdfSize(0);
    setFreePdfUpdatedAt('');
    setPdfFile(null);
  };

  const uploadToR2 = async (file: File, customPath: string): Promise<{ url: string; key: string }> => {
    if (file.type.startsWith('video/') || file.name.match(/\.(mp4|m4v|avi|mov|wmv|flv|webm|mkv)$/i)) {
      throw new Error("Vídeos devem ser cadastrados apenas por URL do YouTube.");
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error("Você precisa estar logado como administrador.");
    }

    const idToken = await user.getIdToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("customPath", customPath);

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
      throw new Error(`Servidor R2 retornou resposta não-JSON (${response.status}): ${textData.substring(0, 100)}`);
    }

    if (!response.ok) {
      throw new Error(resData.error || `Erro no upload R2: ${response.status}`);
    }

    return resData;
  };

  const handleSaveProduct = async (saveAsActive: boolean) => {
    // 4. NÃO DUPLICAR O ENVIO
    if (isSaving || isUploading) {
      console.warn("Already saving or uploading. Duplicate submit ignored.");
      return;
    }

    if (!name.trim()) {
      showToast('error', 'O Nome do produto é obrigatório.');
      setCurrentStep(1);
      return;
    }

    // 8. VERIFICAR O ARQUIVO ANTES DE INICIAR O PROCESSAMENTO (Item 8)
    if (newMainImageFile) {
      if (!(newMainImageFile instanceof File) || !newMainImageFile.name) {
        showToast('error', 'O arquivo de imagem de capa selecionado é inválido.');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(newMainImageFile.type)) {
        showToast('error', 'Formato de imagem de capa inválido. Use JPG, PNG ou WEBP.');
        return;
      }
      if (newMainImageFile.size > 10 * 1024 * 1024) {
        showToast('error', 'A imagem de capa é muito grande. O tamanho máximo permitido é de 10MB.');
        return;
      }
    }

    // Validar arquivos da galeria
    for (const [key, file] of galleryFileMap.entries()) {
      if (!(file instanceof File) || !file.name) {
        showToast('error', 'Um dos arquivos da galeria é inválido.');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast('error', `Formato inválido na galeria para o arquivo "${file.name}". Use JPG, PNG ou WEBP.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('error', `A imagem "${file.name}" na galeria é muito grande. Limite de 10MB.`);
        return;
      }
    }

    // Salvar estados de retry e limpar erros anteriores
    setLastSaveAsActive(saveAsActive);
    setPersistentError(null);

    setIsUploading(true);
    setIsSaving(true);
    setSaveError(null);
    setDiagnosticsText('');
    setSaveProgressPercent(0);

    // Helper to log diagnostics (Item 1)
    const logDiagnostic = (stepNum: number, message: string) => {
      const formatted = `[OK] ${message}`;
      console.log(`[SAVE_DIAGNOSTIC] [Etapa ${stepNum}/10] ${formatted}`);
      setUploadProgressText(message);
      setDiagnosticsText(prev => prev + formatted + '\n');
    };

    // Helper to log failures (Item 1)
    const logFailure = (stepNum: number, message: string, err: any) => {
      const errorStr = err instanceof Error ? err.message : String(err);
      const formatted = `[ERRO] ${message}: ${errorStr}`;
      console.error(`[SAVE_DIAGNOSTIC] [Etapa ${stepNum}/10] ${formatted}`);
      setDiagnosticsText(prev => prev + formatted + '\n');
      setSaveError(`${message}: ${errorStr}`);
    };

    let finalId = editingProductId || currentGeneratedId || `custom-kit-${Date.now()}`;
    let tempStoragePath = '';
    let currentStepDiagnostic = 'Verificação de Autenticação e Permissão Admin';

    try {
      isSaveCancelledRef.current = false;

      // 1. Arquivo selecionado & Verificação de Autenticação
      logDiagnostic(1, 'arquivo validado e autenticação confirmada');
      if (isSaveCancelledRef.current) return;
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error("AUTH_SESSION_EXPIRED: Nenhum usuário logado no painel.");
      }
      
      if (user.email !== 'atividadesinfantilcontato@gmail.com') {
        throw new Error(`EMAIL_NOT_ADMIN: O e-mail logado (${user.email}) não corresponde ao e-mail de administrador cadastrado.`);
      }

      const adminDocRef = doc(db, 'admins', user.uid);
      const getAdminDocPromise = getDoc(adminDocRef);
      let adminSnap = await withTimeout(getAdminDocPromise, 10000, "Verificando documento admins no Firestore");
      if (isSaveCancelledRef.current) return;
      
      let hasValidDoc = false;
      if (adminSnap.exists()) {
        const data = adminSnap.data();
        if (data && data.role === 'admin' && data.active === true) {
          hasValidDoc = true;
        }
      }

      if (!hasValidDoc && user.email === 'atividadesinfantilcontato@gmail.com') {
        try {
          await withTimeout(setDoc(adminDocRef, {
            role: 'admin',
            active: true,
            email: user.email,
            updatedAt: new Date().toISOString()
          }), 10000, "Gravação automática de admins");
          if (isSaveCancelledRef.current) return;
          hasValidDoc = true;
          const getAdminDocPromiseRetry = getDoc(adminDocRef);
          adminSnap = await withTimeout(getAdminDocPromiseRetry, 10000, "Verificando documento admins recém-criado no Firestore");
        } catch (writeErr) {
          console.error("Failed to auto-provision admin doc in handleSaveProduct:", writeErr);
        }
      }

      if (isSaveCancelledRef.current) return;

      if (!hasValidDoc) {
        if (!adminSnap.exists()) {
          throw new Error("NO_ADMIN_DOCUMENT: Usuário autenticado, mas sem documento de administrador.");
        } else {
          throw new Error("USER_NOT_ADMIN_ACTIVE: O documento admins existe mas não possui role 'admin' ou não está ativo.");
        }
      }

      // 2. Validação concluída
      currentStepDiagnostic = 'Validação dos campos e dados do produto';
      logDiagnostic(2, 'campos e dados do produto validados com sucesso');
      if (isSaveCancelledRef.current) return;

      const currentProd = editingProductId ? products.find(p => p.id === editingProductId) : null;

      // Imagem Principal
      let finalMainImageUrl = imageUrl;
      let finalMainImageStoragePath = currentProd?.mainImageStoragePath || '';

      if (newMainImageFile) {
        // 3. Início do upload da imagem principal
        currentStepDiagnostic = 'Upload da Imagem Principal no Cloudflare R2';
        logDiagnostic(3, 'upload da imagem de capa iniciado no Cloudflare R2');
        if (isSaveCancelledRef.current) return;
        
        try {
          setSaveProgressPercent(50);
          setUploadProgressText(`Enviando imagem de capa para o R2...`);

          const r2Result = await uploadToR2(newMainImageFile, `products/${finalId}/main`);
          setSaveProgressPercent(100);

          finalMainImageUrl = r2Result.url;
          finalMainImageStoragePath = r2Result.key;

          logDiagnostic(4, 'upload da imagem de capa concluído');
          logDiagnostic(5, 'URL de download da capa gerada com sucesso');
        } catch (uploadErr: any) {
          if (isSaveCancelledRef.current) return;
          const wrappedErr = new Error(`Falha no upload da imagem de capa para R2: ${uploadErr.message || uploadErr}`);
          logFailure(3, 'Erro no envio da imagem de capa', wrappedErr);
          throw wrappedErr;
        }
      } else {
        logDiagnostic(3, 'sem nova imagem de capa selecionada, usando existente');
        logDiagnostic(4, 'upload da imagem de capa ignorado');
        logDiagnostic(5, 'URL de download existente mantida');
      }

      if (isSaveCancelledRef.current) return;

      // Imagens da Galeria
      const finalGalleryUrls: string[] = [];
      const finalGalleryStoragePaths: string[] = [];

      for (let i = 0; i < galleryUrls.length; i++) {
        if (isSaveCancelledRef.current) return;
        const item = galleryUrls[i];
        const localFile = galleryFileMap.get(item);

        if (localFile) {
          currentStepDiagnostic = `Upload da imagem ${i + 1} da galeria no Cloudflare R2`;
          logDiagnostic(3, `upload da imagem ${i + 1} de ${galleryUrls.length} da galeria iniciado no Cloudflare R2`);
          if (isSaveCancelledRef.current) return;
          
          try {
            setUploadProgressText(`Enviando imagem da galeria ${i + 1} para o R2...`);
            const r2Result = await uploadToR2(localFile, `products/${finalId}/gallery`);
            finalGalleryUrls.push(r2Result.url);
            finalGalleryStoragePaths.push(r2Result.key);
          } catch (uploadErr: any) {
            if (isSaveCancelledRef.current) return;
            const friendlyMsg = `Falha no upload da imagem ${i + 1} da galeria para R2.`;
            const wrappedErr = new Error(friendlyMsg);
            logFailure(3, `Erro no envio da imagem da galeria ${i + 1}`, wrappedErr);
            throw wrappedErr;
          }
        } else {
          finalGalleryUrls.push(item);
          const oldPath = currentProd?.galleryStoragePaths?.[i] || '';
          finalGalleryStoragePaths.push(oldPath);
        }
      }

      if (isSaveCancelledRef.current) return;

      setSaveProgressPercent(100);
      
      // 6. Firestore iniciado
      logDiagnostic(6, 'iniciando empacotamento do produto para Firestore');
      if (isSaveCancelledRef.current) return;

      const cleanReceive = whatYouWillReceive.split('\n').map(v => v.trim()).filter(v => v.length > 0);
      const cleanObjectives = objectives.split('\n').map(v => v.trim()).filter(v => v.length > 0);
      const cleanHowToUse = howToUse.split('\n').map(v => v.trim()).filter(v => v.length > 0);
      const cleanMaterials = materialsNeeded.split('\n').map(v => v.trim()).filter(v => v.length > 0);

      const finalCreatedAt = currentProd?.createdAt || new Date().toISOString();
      const finalUpdatedAt = new Date().toISOString();

      const productPayload: Product = {
        id: finalId,
        name: name.trim(),
        slug: slug.trim() || undefined,
        category,
        categoryId: category,
        tag: badge ? (badge as any) : undefined,
        tagColor: badge ? 'blue' : undefined,
        ageRange: ageRange.trim() || '2 a 6 anos',
        pages: Number(pages) || 10,
        format,
        printSize,
        price: productType === 'gratuito' ? 0 : (Number(price) || 0),
        regularPrice: productType === 'gratuito' ? 0 : (Number(price) || 0),
        promoPrice: productType === 'gratuito' ? undefined : (Number(promoPrice) > 0 ? Number(promoPrice) : undefined),
        salePrice: productType === 'gratuito' ? null : (Number(promoPrice) > 0 ? Number(promoPrice) : null),
        imageUrl: finalMainImageUrl || '',
        mainImageUrl: finalMainImageUrl || '',
        mainImageStoragePath: finalMainImageStoragePath || '',
        galleryUrls: finalGalleryUrls.length > 0 ? finalGalleryUrls : (finalMainImageUrl ? [finalMainImageUrl] : []),
        galleryImages: finalGalleryUrls.length > 0 ? finalGalleryUrls : (finalMainImageUrl ? [finalMainImageUrl] : []),
        galleryStoragePaths: finalGalleryStoragePaths,
        youtubeUrl: youtubeUrl.trim() || undefined,
        hotmartUrl: productType === 'gratuito' ? 'https://pay.hotmart.com/' : (hotmartUrl.trim() || 'https://pay.hotmart.com/'),
        shortDescription: shortDescription.trim(),
        description: activityInfo.trim(),
        fullDescription: activityInfo.trim(),
        activityInfo: activityInfo.trim(),
        whatYouWillReceive: cleanReceive,
        objectives: cleanObjectives,
        howToUse: cleanHowToUse,
        materialsNeeded: cleanMaterials,
        howToPrint: howToPrint.trim() || undefined,
        productType,
        isFree: productType === 'gratuito',
        showOnHome: !!showOnHome,
        freePdfUrl: productType === 'gratuito' ? (freePdfUrl || undefined) : undefined,
        freePdfStoragePath: productType === 'gratuito' ? (freePdfStoragePath || undefined) : undefined,
        freePdfFileName: productType === 'gratuito' ? (freePdfFileName || undefined) : undefined,
        freePdfSize: productType === 'gratuito' ? (freePdfSize || undefined) : undefined,
        freePdfUpdatedAt: productType === 'gratuito' ? (freePdfUpdatedAt || undefined) : undefined,
        requireEmailBeforeDownload: productType === 'gratuito' ? requireEmailBeforeDownload : false,
        isActive: saveAsActive,
        isHighlight: isHighlight,
        isFeatured: isHighlight,
        isNew: isNew,
        isBestSeller: isBestSeller,
        isPromo: isPromo,
        isKit: isKit,
        order: Number(order) || 0,
        displayOrder: Number(order) || 0,
        buttonText: buttonText.trim(),
        createdAt: finalCreatedAt,
        updatedAt: finalUpdatedAt,
        updatedBy: auth.currentUser?.email || 'atividadesinfantilcontato@gmail.com'
      };

      // Optimize document size if it contains any oversized Base64 fields
      currentStepDiagnostic = 'Otimizando tamanho do documento';
      const safeProductPayload = await ensureSafeProductPayload(productPayload);
      if (isSaveCancelledRef.current) return;

      // 7. Documento salvo
      currentStepDiagnostic = 'Salvando no Firestore';
      logDiagnostic(7, 'documento do produto gravado no Firestore');
      
      let firestoreSavePromise;
      if (editingProductId) {
        // Enforce using updateDoc for editing existing documents
        const docRef = doc(db, 'products', safeProductPayload.id);
        firestoreSavePromise = updateDoc(docRef, safeProductPayload as any);
      } else {
        // Use setDoc for creating new documents where we provide our custom ID
        const docRef = doc(db, 'products', safeProductPayload.id);
        firestoreSavePromise = setDoc(docRef, safeProductPayload);
      }
      await withTimeout(firestoreSavePromise, 10000, "Gravação no Firestore");
      if (isSaveCancelledRef.current) return;

      // 8. Documento lido novamente
      currentStepDiagnostic = 'Confirmação de leitura do Firestore';
      logDiagnostic(8, 'leitura de confirmação do Firestore realizada com sucesso');
      
      const readRef = doc(db, 'products', safeProductPayload.id);
      const readPromise = getDoc(readRef);
      const readSnap = await withTimeout(readPromise, 10000, "Leitura de confirmação do Firestore");
      if (isSaveCancelledRef.current) return;
      
      if (!readSnap.exists()) {
        throw new Error("O produto foi salvo mas não pôde ser lido de volta do Firestore para verificação.");
      }

      // 9. Estado local atualizado
      currentStepDiagnostic = 'Atualizando interface';
      logDiagnostic(9, 'estado local do painel sincronizado');
      if (isSaveCancelledRef.current) return;
      
      let updatedList: Product[];
      if (editingProductId) {
        updatedList = products.map(p => p.id === editingProductId ? safeProductPayload : p);
      } else {
        updatedList = [safeProductPayload, ...products];
      }
      onUpdateProducts(updatedList);

      // 10. Tela de processamento encerrada
      logDiagnostic(10, 'processo de salvamento concluído com sucesso total');
      if (isSaveCancelledRef.current) return;

      // Limpar estados temporários de upload para novas imagens
      setNewMainImageFile(null);
      setSavedMainImageUrl(safeProductPayload.mainImageUrl || safeProductPayload.imageUrl || finalMainImageUrl);
      setMainImagePreview(safeProductPayload.mainImageUrl || safeProductPayload.imageUrl || finalMainImageUrl);
      setGalleryFileMap(new Map());

      setSavedProduct(safeProductPayload);
      showToast('success', `Produto salvo como ${saveAsActive ? 'PUBLICADO' : 'RASCUNHO'} com sucesso!`);
    } catch (error: any) {
      if (isSaveCancelledRef.current) return;
      console.error("[Diagnostic] Error saving product in handleSaveProduct:", error);
      let friendlyMsg = error instanceof Error ? error.message : String(error);
      
      friendlyMsg = `Travou na etapa: ${currentStepDiagnostic}. (${friendlyMsg})`;

      // Populate diagnosticsDetails
      const fileSizeStr = newMainImageFile 
        ? `${(newMainImageFile.size / 1024).toFixed(2)} KB (${newMainImageFile.size} bytes)` 
        : 'Nenhum arquivo';

      let errCode = error.code || 'Desconhecido / Não-Firebase';
      let origMsg = error.message || String(error);

      // Detect common 404/storage bucket not active errors
      if (errCode === 'storage/unknown' || origMsg.includes('404') || origMsg.toLowerCase().includes('not found')) {
        origMsg += "\n\n[DICA DE RESOLUÇÃO]: Falha ao processar requisição.";
      }

      setDiagnosticsDetails({
        code: errCode,
        originalMessage: origMsg,
        stage: currentStepDiagnostic,
        filename: newMainImageFile?.name || 'Nenhuma imagem selecionada para upload',
        filetype: newMainImageFile?.type || 'Nenhuma imagem',
        filesize: fileSizeStr,
        storagePath: tempStoragePath || 'Nenhum caminho gerado (falhou antes)',
        uid: auth.currentUser?.uid || 'Nenhum usuário logado',
        email: auth.currentUser?.email || 'Nenhum e-mail',
        isAdmin: adminCheckResult.status === 'valid',
        storageProvider: 'Cloudflare R2',
        databaseId: (firebaseConfig as any).firestoreDatabaseId || 'Não configurado',
        collectionDoc: `products/${finalId}`,
        logText: diagnosticsText + `[ERRO] ${friendlyMsg}`
      });
      
      setPersistentError(friendlyMsg);
      setSaveError(null);
    } finally {
      setIsSaving(false);
      setIsUploading(false);
      setSaveProgressPercent(0);
      setUploadProgressText("");
    }
  };

  const handleSetFeaturedProduct = async (productId: string) => {
    setIsSavingFeatured(true);
    setFeaturedProductError(null);
    setFeaturedSaveSuccess(false);
    try {
      // 1. Update Firestore siteConfig/global document
      const docRef = doc(db, 'siteConfig', 'global');
      const snap = await getDoc(docRef);
      const dbConfig = snap.exists() ? snap.data() : {};
      
      const updatedConfig = {
        ...dbConfig,
        featuredProductId: productId,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(docRef, updatedConfig, { merge: true });
      
      // 2. Trigger the callback prop to update the global React state in App.tsx
      if (onUpdateSiteConfig && siteConfig) {
        onUpdateSiteConfig({
          ...siteConfig,
          featuredProductId: productId
        });
      }
      
      setFeaturedSaveSuccess(true);
      setTimeout(() => setFeaturedSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving featured product:', err);
      setFeaturedProductError(err.message || 'Erro desconhecido ao salvar o produto principal.');
    } finally {
      setIsSavingFeatured(false);
    }
  };

  const handleSyncDefaultImages = () => {
    let syncCount = 0;
    const updatedList = products.map(p => {
      const currentImage = (p.mainImageUrl || p.imageUrl || '').trim();
      const needsSync = !currentImage || currentImage === 'kit-mega' || currentImage === 'Produto sem imagem' || (!currentImage.startsWith('data:') && !currentImage.startsWith('http') && !currentImage.includes('/') && currentImage.length < 30);
      
      if (needsSync) {
        const id = p.id.toLowerCase();
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        
        let targetMain = 'kit-mega';
        let targetGallery = ['kit-mega'];

        if (id.includes('menino') || name.includes('menino')) {
          targetMain = 'boneco-menino';
          targetGallery = ['boneco-menino', 'boneco-menino-g1', 'boneco-menino-g2'];
        } else if (id.includes('menina') || name.includes('menina')) {
          targetMain = 'boneca-menina';
          targetGallery = ['boneca-menina', 'boneca-menina-g1', 'boneca-menina-g2'];
        } else if (id.includes('boneco') || name.includes('boneco') || cat.includes('boneco')) {
          targetMain = 'boneco-menino';
          targetGallery = ['boneco-menino', 'boneca-menina', 'boneco-menino-g1', 'boneca-menina-g1'];
        } else if (id.includes('alfabetizacao') || id.includes('letra') || name.includes('alfabetiza') || name.includes('letra')) {
          targetMain = 'alfabetizacao-letras';
          targetGallery = ['alfabetizacao-letras', 'alfabetizacao-letras-g1'];
        } else if (id.includes('tracado') || id.includes('coordenacao') || name.includes('traçado') || name.includes('coordena')) {
          targetMain = 'coordenacao-tracados';
          targetGallery = ['coordenacao-tracados', 'coordenacao-tracados-g1'];
        } else if (id.includes('tampinha') && (id.includes('cor') || name.includes('cor'))) {
          targetMain = 'tampinhas-cores';
          targetGallery = ['tampinhas-cores', 'tampinhas-cores-g1'];
        } else if (id.includes('tampinha') && (id.includes('numero') || id.includes('quant') || name.includes('número') || name.includes('quant'))) {
          targetMain = 'tampinhas-numeros';
          targetGallery = ['tampinhas-numeros'];
        } else if (id.includes('tampinha') || name.includes('tampinha') || cat.includes('tampinha')) {
          targetMain = 'tampinhas-cores';
          targetGallery = ['tampinhas-cores', 'tampinhas-cores-g1'];
        } else if (id.includes('alfabeto') || name.includes('alfabeto')) {
          targetMain = 'alfabeto-completo';
          targetGallery = ['alfabeto-completo'];
        } else if (id.includes('sensorial') || name.includes('sensorial')) {
          targetMain = 'kit-sensorial';
          targetGallery = ['kit-sensorial'];
        } else if (id.includes('mega') || id.includes('combo') || name.includes('mega') || name.includes('combo') || id.includes('kit') || name.includes('kit')) {
          targetMain = 'kit-mega';
          targetGallery = ['kit-mega', 'kit-mega-g1', 'kit-mega-g2'];
        }

        if (p.mainImageUrl !== targetMain || p.imageUrl !== targetMain) {
          syncCount++;
          return {
            ...p,
            imageUrl: targetMain,
            mainImageUrl: targetMain,
            galleryUrls: targetGallery,
            galleryImages: targetGallery,
            updatedAt: new Date().toISOString()
          };
        }
      }
      return p;
    });

    if (syncCount > 0) {
      onUpdateProducts(updatedList);
      showToast('success', `${syncCount} produtos foram sincronizados com suas imagens padrão com sucesso!`);
    } else {
      showToast('success', 'Todas as imagens dos produtos já estão sincronizadas e corretas!');
    }
  };

  const handleImagePicker = (type: 'main' | 'gallery') => {
    if (type === 'main' && fileInputRef.current) {
      fileInputRef.current.click();
    } else if (type === 'gallery' && galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const uploadMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // 5. VERIFICAR O ARQUIVO REAL
      if (!(file instanceof File) || !file.name) {
        showToast('error', 'Arquivo inválido.');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast('error', 'Formato de imagem inválido. Use JPG, PNG ou WEBP.');
        return;
      }

      console.log("[SAVE_DIAGNOSTIC] Step 1: File selected:", file.name);

      // We can compress it to get a base64 for preview, OR we can use URL.createObjectURL(file) for instant preview!
      // To satisfy item 13: "NÃO BLOQUEAR POR COMPRESSÃO"
      // "A função de compressão precisa: Resolver a Promise; Rejeitar em caso de erro; Possuir timeout; Não entrar em loop; Não tentar comprimir SVG; Não bloquear quando a imagem já estiver em tamanho adequado. Se a compressão falhar: Permitir envio do arquivo original; Mostrar aviso; Não deixar a tela carregando. Não obrigar compressão para salvar."
      
      const compressPromise = compressImage(file, 800, 0.7);
      const compressWithTimeout = Promise.race([
        compressPromise,
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error("Timeout na compressão")), 5000))
      ]);

      compressWithTimeout
        .then((compressedBase64) => {
          setMainImagePreview(compressedBase64);
          setImageUrl(compressedBase64);
          
          try {
            // Let's create a Blob from base64
            const byteString = atob(compressedBase64.split(',')[1]);
            const mimeString = compressedBase64.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            const compressedFile = new File([blob], file.name, { type: mimeString });
            setNewMainImageFile(compressedFile);
          } catch (err) {
            console.error('Failed to parse compressed base64 to file, using original:', err);
            setNewMainImageFile(file);
          }
          
          // Sync gallery with new main image if gallery is empty or only has 1 placeholder
          if (galleryUrls.length <= 1) {
            setGalleryUrls([compressedBase64]);
          }
          showToast('success', 'Imagem principal carregada e otimizada!');
        })
        .catch((err) => {
          console.warn('Compression failed or timed out, using original file:', err);
          showToast('error', 'Otimização falhou. Usando arquivo original.');
          
          // Fail-safe fallback to original file
          setNewMainImageFile(file);
          const localPreview = URL.createObjectURL(file);
          setMainImagePreview(localPreview);
          setImageUrl(localPreview);
          
          if (galleryUrls.length <= 1) {
            setGalleryUrls([localPreview]);
          }
        });
    }
  };

  const uploadGalleryImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (!(file instanceof File) || !file.name) {
        showToast('error', 'Arquivo de galeria inválido.');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast('error', 'Formato de imagem inválido. Use JPG, PNG ou WEBP.');
        return;
      }

      const compressPromise = compressImage(file, 800, 0.7);
      const compressWithTimeout = Promise.race([
        compressPromise,
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error("Timeout na compressão")), 5000))
      ]);

      compressWithTimeout
        .then((compressedBase64) => {
          setGalleryUrls(prev => [...prev, compressedBase64]);
          
          try {
            const byteString = atob(compressedBase64.split(',')[1]);
            const mimeString = compressedBase64.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            const compressedFile = new File([blob], file.name, { type: mimeString });
            
            setGalleryFileMap(prev => {
              const next = new Map(prev);
              next.set(compressedBase64, compressedFile);
              return next;
            });
          } catch (err) {
            setGalleryFileMap(prev => {
              const next = new Map(prev);
              next.set(compressedBase64, file);
              return next;
            });
          }
          showToast('success', 'Imagem adicionada à galeria!');
        })
        .catch((err) => {
          console.warn('Gallery compression failed, using original file:', err);
          showToast('error', 'Otimização falhou. Usando original.');
          
          const localPreview = URL.createObjectURL(file);
          setGalleryUrls(prev => [...prev, localPreview]);
          
          setGalleryFileMap(prev => {
            const next = new Map(prev);
            next.set(localPreview, file);
            return next;
          });
        });
    }
  };

  const deleteGalleryImage = (index: number) => {
    const newList = [...galleryUrls];
    newList.splice(index, 1);
    setGalleryUrls(newList);
    showToast('success', 'Imagem removida da galeria.');
  };

  const moveGalleryImage = (index: number, direction: 'left' | 'right') => {
    const newGallery = [...galleryUrls];
    if (direction === 'left' && index > 0) {
      const temp = newGallery[index];
      newGallery[index] = newGallery[index - 1];
      newGallery[index - 1] = temp;
    } else if (direction === 'right' && index < newGallery.length - 1) {
      const temp = newGallery[index];
      newGallery[index] = newGallery[index + 1];
      newGallery[index + 1] = temp;
    }
    setGalleryUrls(newGallery);
  };

  const setAsMainImage = (url: string) => {
    setImageUrl(url);
    showToast('success', 'Esta imagem agora é a capa oficial do produto!');
  };

  // Get Youtube Video ID
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const renderFreePdfUploadSection = () => {
    return (
      <div className="space-y-6">
        {/* Real PDF Upload Area */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-slate-800 text-left">
          <h4 className="font-extrabold text-xs tracking-wider uppercase text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <BookOpen size={16} className="text-slate-500" />
            ARQUIVO PDF GRATUITO
          </h4>

          {/* If PDF uploaded, show file info and replacement button */}
          {freePdfUrl ? (
            <div className="space-y-3">
              <div className="bg-emerald-50/50 border border-emerald-150 p-4 rounded-xl flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                    <FileText size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-sm text-slate-800 truncate max-w-xs md:max-w-md">
                      {freePdfFileName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-medium">
                      <span>Tamanho: {freePdfSize ? (freePdfSize / (1024 * 1024)).toFixed(2) : '0'} MB</span>
                      <span>•</span>
                      <span>Enviado em: {freePdfUpdatedAt ? new Date(freePdfUpdatedAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a 
                    href={freePdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5 font-bold text-xs cursor-pointer"
                    title="Visualizar PDF"
                  >
                    <Eye size={14} />
                    <span>Ver PDF</span>
                  </a>
                  <button
                    type="button"
                    onClick={handlePdfRemove}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors flex items-center gap-1.5 font-bold text-xs cursor-pointer"
                    title="Remover PDF"
                  >
                    <Trash2 size={14} />
                    <span>Remover PDF</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-start">
                <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-[#1E4DDB] font-extrabold text-xs px-4 py-2.5 rounded-xl border border-blue-100 transition-all flex items-center gap-1.5">
                  <RefreshCw size={14} className={pdfUploading ? 'animate-spin' : ''} />
                  <span>Trocar PDF</span>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden" 
                    onChange={handlePdfFileChange} 
                    disabled={pdfUploading}
                  />
                </label>
              </div>
            </div>
          ) : (
            /* If no PDF uploaded, show upload button and drag and drop helper */
            <div className="space-y-4">
              <label className="border-2 border-dashed border-emerald-200 bg-[#FDFDFD] hover:bg-emerald-50/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload size={22} />
                </div>
                <div className="text-center">
                  <p className="font-extrabold text-sm text-slate-800">
                    Clique para selecionar e enviar o arquivo PDF
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                    Apenas arquivos PDF são aceitos. Limite máximo: 30 MB.
                  </p>
                </div>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  className="hidden" 
                  onChange={handlePdfFileChange}
                  disabled={pdfUploading}
                />
              </label>
            </div>
          )}

          {/* PDF Uploading State / Progress */}
          {pdfUploading && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="animate-ping h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Enviando arquivo PDF...</span>
                </span>
                <span>{pdfUploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${pdfUploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {pdfUploadSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 text-left">
              <Check size={15} className="text-emerald-600" />
              <span>{pdfUploadSuccess}</span>
            </div>
          )}

          {/* Error Message */}
          {pdfUploadError && (
            <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2 text-left">
              <AlertCircle size={15} className="text-red-600 shrink-0" />
              <span>{pdfUploadError}</span>
            </div>
          )}
        </div>

        {/* Additional Options for Free Materials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Email Gating Option */}
          <label className="border border-slate-200 rounded-2xl p-4 flex items-start gap-3 bg-white hover:bg-slate-50 cursor-pointer transition-colors text-left select-none">
            <input 
              type="checkbox" 
              checked={requireEmailBeforeDownload}
              onChange={(e) => setRequireEmailBeforeDownload(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#37C76A] focus:ring-[#37C76A] cursor-pointer"
            />
            <div>
              <span className="font-extrabold text-sm text-slate-800 block">Exigir e-mail antes do download</span>
              <span className="text-[11px] text-slate-400 mt-0.5 leading-relaxed block font-medium">
                Se ativado, as mães e professoras precisam digitar nome e e-mail antes de baixar o PDF gratuitamente.
              </span>
            </div>
          </label>

          {/* Show on Home Option */}
          <label className="border border-slate-200 rounded-2xl p-4 flex items-start gap-3 bg-white hover:bg-slate-50 cursor-pointer transition-colors text-left select-none">
            <input 
              type="checkbox" 
              checked={showOnHome}
              onChange={(e) => setShowOnHome(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#37C76A] focus:ring-[#37C76A] cursor-pointer"
            />
            <div>
              <span className="font-extrabold text-sm text-slate-800 block">Mostrar na Home (Página Inicial)</span>
              <span className="text-[11px] text-slate-400 mt-0.5 leading-relaxed block font-medium">
                Se ativado, o material gratuito será exibido em destaque na Home principal do site Atividades Criativas.
              </span>
            </div>
          </label>
        </div>
      </div>
    );
  };

  const filteredProducts = products.filter(p => {
    if (filterType === 'deleted') {
      if (p.isDeleted !== true) return false;
    } else {
      if (p.isDeleted === true) return false;
    }

    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    switch (filterType) {
      case 'active': return p.isActive !== false;
      case 'inactive': return p.isActive === false;
      case 'paid': return p.productType !== 'gratuito' && p.price > 0;
      case 'free': return p.productType === 'gratuito' || p.price === 0;
      case 'kits': return p.isKit === true;
      case 'highlights': return p.isHighlight === true;
      default: return true;
    }
  });

  if (savedProduct) {
    const isSavedActive = savedProduct.isActive === true;
    const isSavedFeatured = savedProduct.isFeatured === true;
    const finalPrice = savedProduct.salePrice || savedProduct.promoPrice || savedProduct.regularPrice || savedProduct.price || 0;
    
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-8 max-w-2xl mx-auto text-left animate-fadeIn">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
            <Check size={24} className="stroke-[3]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">
              {isSavedActive ? 'Produto publicado e visível na loja!' : 'Produto salvo como rascunho!'}
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {isSavedActive ? 'A atividade já está disponível para as educadoras.' : 'O produto foi salvo como rascunho e ainda não está visível para visitantes.'}
            </p>
          </div>
        </div>

        {/* Visual Product card review */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 mb-8 flex flex-col md:flex-row gap-5 items-start">
          <div className="w-full md:w-44 aspect-square bg-white border border-slate-150 rounded-xl overflow-hidden shadow-sm shrink-0 flex items-center justify-center p-2">
            <ProductImage id={savedProduct.mainImageUrl || savedProduct.imageUrl} className="w-full h-full object-contain" />
          </div>

          <div className="space-y-3 flex-grow w-full">
            <div>
              <span className="bg-[#37C76A]/15 text-[#2ca455] font-black text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-md">
                {savedProduct.category}
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1 leading-tight">{savedProduct.name}</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">{savedProduct.shortDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-150 py-3 my-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Status</span>
                <span className={`inline-flex items-center gap-1 font-black uppercase text-[10px] mt-1 ${isSavedActive ? 'text-green-600' : 'text-slate-500'}`}>
                  {isSavedActive ? '● Publicado' : '○ Rascunho'}
                </span>
              </div>
              
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Exibir nos Destaques</span>
                <span className={`inline-flex items-center gap-1 font-black uppercase text-[10px] mt-1 ${isSavedFeatured ? 'text-blue-600' : 'text-slate-500'}`}>
                  {isSavedFeatured ? '★ Sim' : '☆ Não'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Preço de Venda</span>
                <span className="font-black text-slate-900 mt-1 block">R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
              </div>

              {savedProduct.youtubeUrl && (
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Vídeo Cadastrado</span>
                  <a href={savedProduct.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline mt-1 block truncate">
                    Assistir no YouTube ↗
                  </a>
                </div>
              )}
            </div>

            {savedProduct.hotmartUrl && (
              <div className="text-xs pt-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">Link de Compra Hotmart</span>
                <a href={savedProduct.hotmartUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-mono font-bold hover:underline truncate block">
                  {savedProduct.hotmartUrl}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Buttons section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end border-t border-slate-100 pt-6">
          <button
            onClick={() => {
              setSavedProduct(null);
              setMode('list');
              setEditingProductId(null);
            }}
            className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
          >
            Voltar ao Catálogo
          </button>

          {isSavedActive && (
            <button
              onClick={() => {
                // Return to client/home view and navigate to product card
                window.location.hash = ''; // triggers going back to shop
                
                // Scroll to newly saved card after DOM mounts
                setTimeout(() => {
                  const cardElement = document.getElementById(`product-card-${savedProduct.id}`);
                  if (cardElement) {
                    cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight effect
                    cardElement.classList.add('ring-4', 'ring-[#37C76A]', 'ring-offset-2');
                    setTimeout(() => {
                      cardElement.classList.remove('ring-4', 'ring-[#37C76A]', 'ring-offset-2');
                    }, 3000);
                  } else {
                    // Fallback to destaque section
                    const section = document.getElementById('destaque-section');
                    if (section) {
                      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                  // Clear state after initiating navigation so scroll doesn't lose context
                  setSavedProduct(null);
                  setMode('list');
                  setEditingProductId(null);
                }, 800);
              }}
              className="px-6 py-3.5 bg-[#37C76A] hover:bg-[#2ca455] text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-[#37C76A]/10 text-center"
            >
              <span>VER NA LOJA</span>
              <ArrowRight size={14} className="stroke-[3]" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast notifications */}
      {alertMessage && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-2xl shadow-xl border animate-slideDown ${
          alertMessage.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <div className={`p-1.5 rounded-full ${alertMessage.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
            <Check size={16} />
          </div>
          <span className="font-bold text-xs">{alertMessage.text}</span>
        </div>
      )}

      {/* Firebase Connection & Admin Authorization Diagnostic Center */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left animate-fadeIn">
        <div className="flex gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-slate-200/60 flex items-center justify-center shrink-0 text-[#12368F]">
            <Settings size={20} className="animate-spin-slow text-slate-500" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight flex items-center gap-1.5 flex-wrap">
              Central de Status de Conexão do Firebase
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full lowercase">
                projeto: {resolvedFirebaseConfig.projectId}
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full lowercase">
                db: {resolvedFirebaseConfig.firestoreDatabaseId || '(default)'}
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full lowercase hidden lg:inline-block">
                authDomain: {resolvedFirebaseConfig.authDomain}
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full hidden xl:inline-block">
                Admin UID: PahVnk6qMXQLbyz5Rnx4TJXK44r2
              </span>
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {adminCheckResult.status === 'checking' && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <RefreshCw size={12} className="animate-spin" /> Verificando autorização...
                </span>
              )}
              {adminCheckResult.status === 'valid' && (
                <>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <Check size={12} className="stroke-[3]" /> Usuário Logado: SIM
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <Check size={12} className="stroke-[3]" /> Admin Validado: SIM
                  </span>
                </>
              )}
              {adminCheckResult.status === 'no_user' && (
                <span className="inline-flex items-center gap-1 text-xs text-red-700 font-bold bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  <X size={12} className="stroke-[3]" /> Usuário Logado: NÃO
                </span>
              )}
              {adminCheckResult.status === 'no_doc' && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <AlertCircle size={12} /> Autenticado (sem doc admins/{adminCheckResult.uid})
                </span>
              )}
              {adminCheckResult.status === 'invalid_fields' && (
                <span className="inline-flex items-center gap-1 text-xs text-red-700 font-bold bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  <X size={12} className="stroke-[3]" /> Perfil desativado ou sem permissões de administrador
                </span>
              )}
              {adminCheckResult.status === 'error' && (
                <span className="inline-flex items-center gap-1 text-xs text-red-700 font-bold bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  <AlertCircle size={12} /> Erro de Conexão com Firestore: {adminCheckResult.errorMsg}
                </span>
              )}

              {adminCheckResult.email && (
                <span className="text-[11px] text-slate-700 font-bold bg-slate-200/80 px-2.5 py-0.5 rounded-full font-mono">
                  E-mail: {adminCheckResult.email}
                </span>
              )}
              {adminCheckResult.uid && (
                <span className="text-[11px] text-slate-700 font-bold bg-slate-200/80 px-2.5 py-0.5 rounded-full font-mono">
                  UID: {adminCheckResult.uid}
                </span>
              )}
            </div>
            
            {/* Direct guidance details if invalid */}
            {adminCheckResult.status === 'no_doc' && (
              <p className="text-xs text-amber-600 mt-2 font-medium bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 max-w-2xl leading-relaxed">
                <strong>Orientações Administrativas:</strong> Seu e-mail está cadastrado, mas o documento correspondente ao seu ID <code>{adminCheckResult.uid}</code> não existe na coleção <code>admins</code> do Firestore. Sem este documento, novos envios de imagem e gravações de produtos serão bloqueados pelas regras de segurança. Crie o documento <code>admins/{adminCheckResult.uid}</code> com os campos <code>role: "admin"</code> e <code>active: true</code>.
              </p>
            )}
            {adminCheckResult.status === 'invalid_fields' && (
              <p className="text-xs text-red-600 mt-2 font-medium bg-red-50/50 p-2.5 rounded-xl border border-red-100 max-w-2xl leading-relaxed">
                <strong>Orientações Administrativas:</strong> O seu documento em <code>admins/{adminCheckResult.uid}</code> foi encontrado, mas o campo <code>role</code> não é "admin" ou <code>active</code> não é verdadeiro (true). Atualize estes campos no Firestore para reativar seu acesso.
              </p>
            )}
          </div>
        </div>

        {/* Test Connection Actions */}
        <div className="flex flex-wrap gap-2.5 shrink-0 self-end md:self-auto">
          <button
            type="button"
            disabled={isTestingR2}
            onClick={handleTestR2Upload}
            className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 disabled:opacity-50 text-sky-700 border border-sky-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            {isTestingR2 ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                Enviando R2...
              </>
            ) : (
              <>
                <Cloud size={13} />
                Testar Upload R2
              </>
            )}
          </button>
        </div>
      </div>

      {/* Test Result Indicator overlay/panel */}
      {testResult && (
        <div className={`mx-6 md:mx-8 p-5 rounded-2xl border text-left animate-slideDown ${
          testResult.details?.storageSuccess 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : testResult.details?.firestoreSuccess 
              ? 'bg-amber-50 border-amber-200 text-amber-800' 
              : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between border-b pb-2 mb-3 border-current/20">
            <h4 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
              {testResult.details?.storageSuccess ? (
                <Check size={16} className="stroke-[3] text-emerald-600 animate-pulse" />
              ) : testResult.details?.firestoreSuccess ? (
                <AlertCircle size={16} className="stroke-[3] text-amber-600 animate-pulse" />
              ) : (
                <X size={16} className="stroke-[3] text-red-600" />
              )}
              Resultado do Teste de Integração do Firebase
            </h4>
            <button
              type="button"
              onClick={() => setTestResult(null)}
              className="text-xs font-bold hover:underline opacity-80 cursor-pointer"
            >
              Fechar Resultado
            </button>
          </div>
          <p className="text-xs font-extrabold">{testResult.message}</p>
          
          <div className="mt-3 bg-white/80 p-4 rounded-xl text-[11px] font-mono border border-current/10 space-y-3 text-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pb-2.5 border-b border-current/10 text-slate-700">
              <p><strong>Database ID:</strong> <span className="font-semibold text-slate-900">{testResult.details?.databaseId}</span></p>
              <p><strong>Armazenamento:</strong> <span className="font-semibold text-emerald-700">Cloudflare R2 (Ativo)</span></p>
              <p><strong>Usuário Autenticado:</strong> <span className={testResult.details?.uid ? "text-emerald-700 font-bold" : "text-red-700 font-bold"}>{testResult.details?.uid ? 'SIM' : 'NÃO'}</span></p>
              <p><strong>UID:</strong> <span className="text-slate-600">{testResult.details?.uid || 'Nenhum'}</span></p>
              <p><strong>E-mail:</strong> <span className="text-slate-600">{testResult.details?.email || 'Nenhum'}</span></p>
              <p><strong>Admin Validado no App:</strong> <span className={testResult.details?.isAdmin ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>{testResult.details?.isAdmin ? 'SIM (Aprovado)' : 'NÃO'}</span></p>
              <p><strong>Regras de Acesso:</strong> <span className="text-indigo-700 font-bold">Acesso restrito ao e-mail atividadesinfantilcontato@gmail.com</span></p>
            </div>

            <div className="space-y-2 text-slate-700">
              <h5 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Resultados dos Caminhos de Upload:</h5>
              
              {/* Test A */}
              <div className="p-2.5 rounded-lg bg-white/50 border border-current/5">
                <p className="flex items-center gap-1.5 text-slate-800">
                  <span className={`w-2 h-2 rounded-full ${testResult.details?.testARes?.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <strong>Caminho A (Configurado - .firebasestorage.app - Simples):</strong>
                  <span className={`font-black uppercase ${testResult.details?.testARes?.status === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {testResult.details?.testARes?.status === 'success' ? 'SUCESSO' : 'FALHOU'}
                  </span>
                  <span className="text-slate-400 font-medium">({testResult.details?.testARes?.duration}ms)</span>
                </p>
                <p className="text-[10px] text-slate-500 break-all mt-0.5"><strong>Caminho:</strong> {testResult.details?.testARes?.path || `debug-upload/${testResult.details?.uid}/...`}</p>
                {testResult.details?.testARes?.status === 'success' ? (
                  <p className="text-[10px] break-all text-blue-600 underline mt-0.5">
                    <strong>URL:</strong> <a href={testResult.details?.testARes?.url} target="_blank" rel="noopener noreferrer">{testResult.details?.testARes?.url}</a>
                  </p>
                ) : (
                  <p className="text-[10px] text-red-600 break-words mt-0.5"><strong>Erro Técnico:</strong> {testResult.details?.testARes?.error || testResult.details?.code}</p>
                )}
              </div>

              {/* Test B */}
              <div className="p-2.5 rounded-lg bg-white/50 border border-current/5">
                <p className="flex items-center gap-1.5 text-slate-800">
                  <span className={`w-2 h-2 rounded-full ${testResult.details?.testBRes?.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <strong>Caminho B (Configurado - .firebasestorage.app - Resumable):</strong>
                  <span className={`font-black uppercase ${testResult.details?.testBRes?.status === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {testResult.details?.testBRes?.status === 'success' ? 'SUCESSO' : 'FALHOU'}
                  </span>
                  <span className="text-slate-400 font-medium">({testResult.details?.testBRes?.duration}ms)</span>
                </p>
                <p className="text-[10px] text-slate-500 break-all mt-0.5"><strong>Caminho:</strong> {testResult.details?.testBRes?.path || 'debug-upload-resumable/...'}</p>
                {testResult.details?.testBRes?.status === 'success' ? (
                  <p className="text-[10px] break-all text-blue-600 underline mt-0.5">
                    <strong>URL:</strong> <a href={testResult.details?.testBRes?.url} target="_blank" rel="noopener noreferrer">{testResult.details?.testBRes?.url}</a>
                  </p>
                ) : (
                  <p className="text-[10px] text-red-600 break-words mt-0.5"><strong>Erro Técnico:</strong> {testResult.details?.testBRes?.error || testResult.details?.code}</p>
                )}
              </div>

              {/* Test C */}
              <div className="p-2.5 rounded-lg bg-white/50 border border-current/5">
                <p className="flex items-center gap-1.5 text-slate-800">
                  <span className={`w-2 h-2 rounded-full ${testResult.details?.testCRes?.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <strong>Caminho C (Fallback - .appspot.com - Simples/Resumable):</strong>
                  <span className={`font-black uppercase ${testResult.details?.testCRes?.status === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {testResult.details?.testCRes?.status === 'success' ? 'SUCESSO' : 'FALHOU'}
                  </span>
                  <span className="text-slate-400 font-medium">({testResult.details?.testCRes?.duration}ms)</span>
                </p>
                <p className="text-[10px] text-slate-500 break-all mt-0.5"><strong>Caminho:</strong> {testResult.details?.testCRes?.path || 'debug-upload/...'}</p>
                {testResult.details?.testCRes?.status === 'success' ? (
                  <p className="text-[10px] break-all text-blue-600 underline mt-0.5">
                    <strong>URL:</strong> <a href={testResult.details?.testCRes?.url} target="_blank" rel="noopener noreferrer">{testResult.details?.testCRes?.url}</a>
                  </p>
                ) : (
                  <p className="text-[10px] text-red-600 break-words mt-0.5"><strong>Erro Técnico:</strong> {testResult.details?.testCRes?.error || testResult.details?.code}</p>
                )}
              </div>
            </div>

            {testResult.details?.storageSuccess ? (
              <div className="pt-2">
                <p className="text-emerald-700 font-extrabold flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  Conexão de Upload plenamente funcional! Os caminhos simples e/ou resumable estão respondendo.
                </p>
              </div>
            ) : testResult.details?.firestoreSuccess ? (
              <div className="mt-4 text-[11px] bg-amber-100 text-amber-900 p-3.5 rounded-lg border border-amber-200 font-sans font-medium space-y-2">
                <p className="font-extrabold uppercase text-[11px] text-amber-950 flex items-center gap-1">
                  <AlertCircle size={14} className="text-amber-700 shrink-0" />
                  Firestore conectado. Armazenamento gerenciado via Cloudflare R2.
                </p>
                <p className="leading-relaxed text-amber-800">
                  Para uploads de arquivos, o sistema utiliza o Cloudflare R2 como único serviço de armazenamento de mídia.
                </p>
              </div>
            ) : (
              <div className="mt-4 text-[11px] bg-red-100 text-red-900 p-3.5 rounded-lg border border-red-200 font-sans font-medium space-y-2">
                <p className="font-extrabold uppercase text-[11px] text-red-950 flex items-center gap-1">
                  <AlertCircle size={14} className="text-red-700 shrink-0" />
                  Falha Crítica na Conexão do Firestore / Permissão:
                </p>
                <p className="leading-relaxed text-red-800">
                  Não foi possível ler ou gravar dados no banco Firestore. Certifique-se de que o usuário logado possui a role <code>admin</code> ativa na coleção <code>admins</code> ou de que as regras do Firestore permitem acesso.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* R2 Test Result Indicator overlay/panel */}
      {r2TestResult && (
        <div className={`mx-6 md:mx-8 p-5 rounded-2xl border text-left mb-6 animate-slideDown ${
          r2TestResult.success 
            ? 'bg-sky-50 border-sky-200 text-sky-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between border-b pb-2 mb-3 border-current/20">
            <h4 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
              {r2TestResult.success ? (
                <Check size={16} className="stroke-[3] text-sky-600 animate-pulse" />
              ) : (
                <X size={16} className="stroke-[3] text-red-600" />
              )}
              Resultado do Teste de Integração Cloudflare R2
            </h4>
            <button
              type="button"
              onClick={() => setR2TestResult(null)}
              className="text-xs font-bold hover:underline opacity-80 cursor-pointer"
            >
              Fechar Resultado
            </button>
          </div>
          
          <p className="text-xs font-extrabold">{r2TestResult.message}</p>
          
          <div className="mt-3 bg-white/80 p-4 rounded-xl text-[11px] font-mono border border-current/10 space-y-3 text-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
              <p><strong>Status do R2:</strong> <span className={r2TestResult.success ? "text-emerald-700 font-bold" : "text-red-700 font-bold"}>{r2TestResult.success ? 'CONECTADO' : 'ERRO/DESCONECTADO'}</span></p>
              <p><strong>Armazenamento de Mídia:</strong> <span className="font-semibold text-emerald-700">Cloudflare R2 Ativo.</span></p>
              {r2TestResult.success && (
                <>
                  <p className="md:col-span-2"><strong>URL do Arquivo R2:</strong> <a href={r2TestResult.details?.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold break-all">{r2TestResult.details?.url}</a></p>
                  <p><strong>Caminho R2 (Key):</strong> <span className="text-slate-600">{r2TestResult.details?.key}</span></p>
                  <p><strong>Tamanho:</strong> <span className="text-slate-600">{(r2TestResult.details?.size / 1024).toFixed(2)} KB</span></p>
                  <p><strong>Tipo de Conteúdo:</strong> <span className="text-slate-600">{r2TestResult.details?.contentType}</span></p>
                </>
              )}
              {r2TestResult.details?.error && (
                <p className="md:col-span-2 text-red-600 break-words font-mono text-[10.5px]">
                  <strong>Erro Técnico:</strong> {r2TestResult.details.error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {mode === 'list' ? (
        <>
          {/* ==================== CONFIGURAÇÃO DO PRODUTO PRINCIPAL DA HOME ==================== */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 mb-6 text-left animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-base font-black text-[#12368F] flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500 fill-amber-500" />
                  Produto Principal da Home
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Destaque da Página Inicial • Escolha qual produto aparecerá no card grande da primeira página.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {isSavingFeatured && (
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-wider animate-pulse">
                    Gravando...
                  </span>
                )}
                {featuredSaveSuccess && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
                    <Check size={12} className="stroke-[3]" />
                    Salvo com Sucesso!
                  </span>
                )}
              </div>
            </div>

            {/* ERROR MESSAGE IF ANY */}
            {featuredProductError && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-bold p-4 rounded-2xl mb-5 flex items-center gap-3">
                <AlertCircle size={16} className="shrink-0 text-red-600 stroke-[2.5]" />
                <span>{featuredProductError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: SELECTED PRODUCT PREVIEW */}
              <div className="lg:col-span-4 bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Prévia do Destaque</h4>
                  
                  {(() => {
                    const currentFeaturedId = siteConfig?.featuredProductId || '';
                    const currentFeaturedProduct = products.find(p => p.id === currentFeaturedId);
                    const isFeaturedInactive = currentFeaturedProduct && currentFeaturedProduct.isActive === false;

                    if (currentFeaturedProduct) {
                      return (
                        <div className="space-y-3.5">
                          <div className="aspect-square w-full max-w-[160px] mx-auto bg-white rounded-2xl border border-slate-100 p-2 shadow-xs relative overflow-hidden flex items-center justify-center">
                            {currentFeaturedProduct.mainImageUrl || currentFeaturedProduct.imageUrl ? (
                              <img 
                                src={currentFeaturedProduct.mainImageUrl || currentFeaturedProduct.imageUrl} 
                                alt={currentFeaturedProduct.name} 
                                className="max-h-full max-w-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-slate-300 text-3xl">🎨</span>
                            )}
                            
                            <div className="absolute top-2 right-2">
                              {currentFeaturedProduct.isActive !== false ? (
                                <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-100">
                                  Ativo
                                </span>
                              ) : (
                                <span className="bg-red-50 text-red-600 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-red-100">
                                  Inativo
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-left space-y-1">
                            <span className="text-[9px] bg-[#12368F] text-white px-2.5 py-0.5 rounded-md font-black uppercase tracking-wider">
                              {currentFeaturedProduct.category}
                            </span>
                            <h5 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2">
                              {currentFeaturedProduct.name}
                            </h5>
                            <p className="text-xs font-black text-slate-600">
                              {currentFeaturedProduct.price > 0 ? `R$ ${currentFeaturedProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Material Gratuito'}
                            </p>
                          </div>

                          {isFeaturedInactive && (
                            <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-red-800 text-[11px] leading-relaxed font-semibold flex items-start gap-2">
                              <AlertCircle size={15} className="shrink-0 text-red-600 mt-0.5 stroke-[2.5]" />
                              <span>O produto principal está <strong>inativo</strong> e não aparecerá na Home do site!</span>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="py-12 text-center text-slate-450 font-bold text-xs flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <HelpCircle size={22} />
                        </div>
                        <div className="space-y-1 px-4">
                          <p className="text-slate-600">Destaque não configurado.</p>
                          <p className="text-[10px] text-slate-400 font-medium">Use o seletor ao lado para definir o produto do banner principal.</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {(() => {
                  const currentFeaturedId = siteConfig?.featuredProductId || '';
                  const currentFeaturedProduct = products.find(p => p.id === currentFeaturedId);
                  if (currentFeaturedProduct) {
                    return (
                      <div className="pt-4 border-t border-slate-150/50 mt-4 flex justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetFeaturedProduct('')}
                          disabled={isSavingFeatured}
                          className="text-xs font-black text-red-500 hover:text-red-650 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer active:scale-95 disabled:opacity-55"
                        >
                          Limpar Destaque
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            handleEditProduct(currentFeaturedProduct.id);
                          }}
                          className="text-xs font-black text-slate-600 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
                        >
                          Editar Dados
                        </button>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* RIGHT COLUMN: SELECTOR & FILTERING */}
              <div className="lg:col-span-8 flex flex-col justify-between">
                <div>
                  {/* Filter bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
                    <div className="relative w-full sm:w-64">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={14} />
                      </span>
                      <input
                        type="text"
                        placeholder="Pesquisar produto pelo nome..."
                        value={featuredSearchQuery}
                        onChange={(e) => setFeaturedSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-semibold"
                      />
                    </div>

                    <div className="flex items-center gap-2 select-none self-start sm:self-auto">
                      <input
                        type="checkbox"
                        id="featuredFilterActiveOnly"
                        checked={featuredFilterActiveOnly}
                        onChange={(e) => setFeaturedFilterActiveOnly(e.target.checked)}
                        className="rounded border-slate-300 text-[#12368F] focus:ring-[#12368F] cursor-pointer h-4 w-4"
                      />
                      <label htmlFor="featuredFilterActiveOnly" className="text-xs font-extrabold text-slate-500 hover:text-slate-700 cursor-pointer uppercase tracking-wider">
                        Mostrar apenas ativos
                      </label>
                    </div>
                  </div>

                  {/* Selector List */}
                  <div className="max-h-[200px] overflow-y-auto border border-slate-150 rounded-2xl divide-y divide-slate-150/70 scrollbar-thin">
                    {(() => {
                      const currentFeaturedId = siteConfig?.featuredProductId || '';
                      const filtered = products
                        .filter(p => {
                          if (featuredFilterActiveOnly && p.isActive === false) return false;
                          if (featuredSearchQuery.trim()) {
                            return p.name.toLowerCase().includes(featuredSearchQuery.toLowerCase());
                          }
                          return true;
                        })
                        .sort((a, b) => {
                          const aActive = a.isActive !== false;
                          const bActive = b.isActive !== false;
                          if (aActive && !bActive) return -1;
                          if (!aActive && bActive) return 1;
                          return a.name.localeCompare(b.name);
                        });

                      if (filtered.length > 0) {
                        return filtered.map(p => {
                          const isCurrent = p.id === currentFeaturedId;
                          return (
                            <div 
                              key={p.id} 
                              className={`p-3 flex items-center justify-between gap-4 transition-all ${
                                isCurrent ? 'bg-amber-50/45' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 bg-white border border-slate-100 rounded-lg p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                  {p.mainImageUrl || p.imageUrl ? (
                                    <img 
                                      src={p.mainImageUrl || p.imageUrl} 
                                      alt={p.name} 
                                      className="max-h-full max-w-full object-contain"
                                      referrerPolicy="no-referrer"
                                  />
                                  ) : (
                                    <span className="text-slate-300 text-xs">🎨</span>
                                  )}
                                </div>
                                
                                <div className="text-left min-w-0">
                                  <h5 className="font-bold text-xs text-slate-800 truncate max-w-[240px] sm:max-w-[340px]">
                                    {p.name}
                                  </h5>
                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                                      {p.category}
                                    </span>
                                    <span className="text-[9px] font-black text-slate-500">
                                      {p.price > 0 ? `R$ ${p.price.toFixed(2)}` : 'Grátis'}
                                    </span>
                                    {p.isActive !== false ? (
                                      <span className="text-[8px] bg-green-50 text-emerald-600 font-black px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                                        Ativo
                                      </span>
                                    ) : (
                                      <span className="text-[8px] bg-red-50 text-red-600 font-black px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                                        Inativo
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleSetFeaturedProduct(p.id)}
                                disabled={isSavingFeatured || isCurrent}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer select-none active:scale-95 shrink-0 ${
                                  isCurrent 
                                    ? 'bg-amber-100 text-amber-700 border border-amber-200 cursor-default'
                                    : 'bg-[#12368F] hover:bg-[#1E4DDB] text-white shadow-xs'
                                }`}
                              >
                                {isCurrent ? '★ Principal' : 'Definir como principal'}
                              </button>
                            </div>
                          );
                        });
                      }

                      return (
                        <div className="py-12 text-center text-slate-400 font-bold text-xs">
                          Nenhum produto cadastrado corresponde aos critérios da busca.
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== PRODUCTS LIST VIEW ==================== */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden text-left animate-fadeIn">
          
          {/* Header Action Strip */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-800">
                {filterType === 'free' ? 'Downloads e Materiais Gratuitos' : 'Catálogo de Atividades Lúdicas'}
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {filterType === 'free' ? 'Controle materiais liberados para baixar R$ 0,00' : 'Cadastre ou edite PDFs infantis pedagógicos'}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleSyncDefaultImages}
                className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-extrabold text-xs tracking-wider uppercase px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Sincronizar imagens padrão dos produtos"
              >
                <RefreshCw size={15} className="text-emerald-600 stroke-[2.5]" />
                <span>Sincronizar Imagens Padrão</span>
              </button>

              <button
                onClick={handleCreateNew}
                className="bg-[#FF6A1A] hover:bg-[#e05b10] active:scale-95 text-white font-extrabold text-xs tracking-wider uppercase px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#FF6A1A]/10 transition-all cursor-pointer"
              >
                <Plus size={16} className="stroke-[2.5]" />
                <span>CADASTRAR NOVO MATERIAL</span>
              </button>
            </div>
          </div>

          {/* Filtering Tools Header */}
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Buscar materiais por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-semibold"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto overflow-x-auto py-1 scrollbar-none">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'active', label: 'Ativos' },
                { id: 'inactive', label: 'Inativos' },
                { id: 'paid', label: 'Pagos' },
                { id: 'free', label: 'Gratuitos' },
                { id: 'kits', label: 'Kits / Ofertas' },
                { id: 'highlights', label: 'Destaques' },
                { id: 'deleted', label: 'Excluídos' },
              ].map(pill => (
                <button
                  key={pill.id}
                  onClick={() => setFilterType(pill.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    filterType === pill.id
                      ? 'bg-[#12368F] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="py-4 px-6 w-[350px]">Capa / Nome do Material</th>
                  <th className="py-4 px-4">Categoria</th>
                  <th className="py-4 px-4">Preço Comercial</th>
                  <th className="py-4 px-4 text-center">Tipo</th>
                  <th className="py-4 px-4 text-center">Hotmart / Vídeo</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-center w-[180px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold text-xs">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FolderOpen size={44} className="text-slate-300 stroke-[1.5]" />
                        <p className="font-extrabold text-sm text-slate-500">
                          {products.length === 0 ? 'Nenhum produto cadastrado no Firestore.' : 'Nenhum material cadastrado nesta visualização'}
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm">Clique em "CADASTRAR NOVO MATERIAL" no topo direito para cadastrar novos recursos.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const hasHotmart = p.hotmartUrl && p.hotmartUrl !== 'https://pay.hotmart.com/';
                    const hasYoutube = p.youtubeUrl && p.youtubeUrl.trim() !== '';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* Cover image, Title & Detailed Statuses */}
                        <td className="py-4 px-6 flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400 shrink-0 p-1 mt-1">
                            <ProductImage id={p.mainImageUrl || p.imageUrl} className="w-full h-full object-contain" />
                          </div>
                          <div className="text-left space-y-1 w-full">
                            <h4 className="font-black text-slate-800 line-clamp-2 text-sm">{p.name}</h4>
                            <p className="text-[9px] text-slate-400 font-mono">ID: {p.id}</p>
                            
                            {/* Rich Status Badges Dashboard */}
                            <div className="mt-2 flex flex-wrap gap-1 font-sans">
                              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase border ${p.isActive !== false ? 'bg-green-50 text-green-700 border-green-200/60' : 'bg-slate-50 text-slate-400 border-slate-200/60'}`}>
                                Ativo: {p.isActive !== false ? 'Sim' : 'Não'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase border ${p.isActive !== false ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60' : 'bg-slate-50 text-slate-400 border-slate-200/60'}`}>
                                Loja: {p.isActive !== false ? 'Sim' : 'Não'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase border ${p.showOnHome === true ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 'bg-slate-50 text-slate-400 border-slate-200/60'}`}>
                                Home: {p.showOnHome === true ? 'Sim' : 'Não'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase border ${p.isFeatured === true ? 'bg-purple-50 text-purple-700 border-purple-200/60' : 'bg-slate-50 text-slate-400 border-slate-200/60'}`}>
                                Destaque: {p.isFeatured === true ? 'Sim' : 'Não'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase border ${p.isKit === true ? 'bg-pink-50 text-pink-700 border-pink-200/60' : 'bg-slate-50 text-slate-400 border-slate-200/60'}`}>
                                Kit: {p.isKit === true ? 'Sim' : 'Não'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase border ${p.isBestSeller === true ? 'bg-orange-50 text-orange-700 border-orange-200/60' : 'bg-slate-50 text-slate-400 border-slate-200/60'}`}>
                                Mais Vendido: {p.isBestSeller === true ? 'Sim' : 'Não'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase border ${p.isNew === true ? 'bg-sky-50 text-sky-700 border-sky-200/60' : 'bg-slate-50 text-slate-400 border-slate-200/60'}`}>
                                Novidade: {p.isNew === true ? 'Sim' : 'Não'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase border ${p.productType === 'gratuito' || p.price === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-slate-50 text-slate-400 border-slate-200/60'}`}>
                                Gratuito: {p.productType === 'gratuito' || p.price === 0 ? 'Sim' : 'Não'}
                              </span>
                            </div>

                            {/* Visibility Alert Banner */}
                            {p.isActive !== false ? (
                              !p.showOnHome && (
                                <div className="mt-1.5 text-[9.5px] font-extrabold text-amber-600 flex items-center gap-1 bg-amber-50/50 border border-amber-100 px-2 py-1 rounded-lg max-w-sm">
                                  <AlertCircle size={11} className="shrink-0" />
                                  <span>Produto ativo, mas não marcado para aparecer na Home.</span>
                                </div>
                              )
                            ) : (
                              <div className="mt-1.5 text-[9.5px] font-extrabold text-slate-500 flex items-center gap-1 bg-slate-50 border border-slate-200/60 px-2 py-1 rounded-lg max-w-sm">
                                <Info size={11} className="shrink-0 text-slate-400" />
                                <span>Produto salvo como rascunho.</span>
                              </div>
                            )}

                            {/* View On Site Button */}
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => onViewOnSite?.(p.id)}
                                className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-200/60 hover:bg-blue-100 px-2 py-1 rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
                              >
                                <Globe size={11} className="stroke-[2.5]" />
                                <span>Ver no site</span>
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4">
                          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase">
                            {p.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-4">
                          {p.productType === 'gratuito' || p.price === 0 ? (
                            <span className="text-emerald-600 font-extrabold uppercase text-[10px]">Baixar Grátis</span>
                          ) : (
                            <div className="flex flex-col items-start">
                              <span className="text-slate-900 font-extrabold">R$ {p.price.toFixed(2)}</span>
                              {p.promoPrice && p.promoPrice > 0 ? (
                                <span className="text-[#FF6A1A] text-[10px] font-black">R$ {p.promoPrice.toFixed(2)} Promo</span>
                              ) : null}
                            </div>
                          )}
                        </td>

                        {/* Product Type */}
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase ${
                            p.productType === 'gratuito' || p.price === 0
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {p.productType === 'gratuito' || p.price === 0 ? 'Download Grátis' : 'Pago'}
                          </span>
                        </td>

                        {/* Hotmart / Video integrations flags */}
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-3">
                            <span className={`flex items-center gap-1 text-[10px] font-bold ${hasHotmart ? 'text-green-600' : 'text-slate-400'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${hasHotmart ? 'bg-green-500' : 'bg-slate-300'}`} />
                              <span>Hotmart</span>
                            </span>
                            <span className={`flex items-center gap-1 text-[10px] font-bold ${hasYoutube ? 'text-blue-600' : 'text-slate-400'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${hasYoutube ? 'bg-blue-500' : 'bg-slate-300'}`} />
                              <span>Vídeo</span>
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleToggleActive(p.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all tracking-wider cursor-pointer ${
                              p.isActive !== false
                                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {p.isActive !== false ? 'Ativo' : 'Rascunho'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEditProduct(p.id)}
                              className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-[#12368F] rounded-lg transition-colors border border-slate-200 cursor-pointer"
                              title="Editar Material"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDuplicate(p.id)}
                              className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-orange-500 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                              title="Duplicar"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() => onViewOnSite?.(p.id)}
                              className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-green-600 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                              title="Visualizar no site público"
                            >
                              <Globe size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition-colors border border-rose-100 cursor-pointer"
                              title="Excluir permanentemente"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </> ) : (
        /* ==================== MULTI-STEP PRODUCT EDIT FORM ==================== */
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden text-left flex flex-col min-h-[550px] relative pb-24 animate-fadeIn">
          
          {/* Form Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode('list');
                  setEditingProductId(null);
                }}
                className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-all border border-slate-200 cursor-pointer"
                title="Voltar para a lista"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-xl font-black text-slate-800">
                  {editingProductId ? 'Editar Material Pedagógico' : 'Cadastrar Novo Material'}
                </h2>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                  Preencha o formulário lúdico passo a passo para catalogar no site
                </p>
              </div>
            </div>

            {/* Float Action: "VER COMO FICARÁ" */}
            <button
              type="button"
              onClick={() => setShowRealPreview(true)}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-[#12368F] border border-blue-100/50 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
            >
              <Eye size={14} />
              <span>Ver como ficará</span>
            </button>
          </div>

          {/* Stepper Indicators (Horizontal Bar) */}
          <div className="bg-slate-50/50 border-b border-slate-100 p-4 flex justify-between items-center overflow-x-auto scrollbar-none select-none">
            {[
              { num: 1, label: 'Informações' },
              { num: 2, label: 'Imagens' },
              { num: 3, label: 'Vídeo' },
              { num: 4, label: 'Venda' },
              { num: 5, label: 'Exibição' },
            ].map(step => {
              const isCurrent = currentStep === step.num;
              const isPassed = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setCurrentStep(step.num)}
                  className="flex items-center gap-2 px-3 py-1.5 transition-all shrink-0 cursor-pointer text-left"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                    isCurrent 
                      ? 'bg-[#12368F] text-white ring-4 ring-blue-100' 
                      : isPassed 
                        ? 'bg-[#37C76A] text-white' 
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isPassed ? <Check size={12} className="stroke-[3]" /> : step.num}
                  </div>
                  <span className={`text-[11px] uppercase tracking-wider font-extrabold ${isCurrent ? 'text-[#12368F]' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                  {step.num < 5 && <ChevronRight size={14} className="text-slate-300 hidden sm:block ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Persistent error banner if any error occurs (Item 3) */}
          {persistentError && (
            <div className="mx-6 md:mx-8 mt-6 p-5 bg-red-50 border border-red-200/80 rounded-2xl flex flex-col gap-4 text-left animate-slideDown">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <X size={20} className="stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">Não foi possível concluir o envio</h4>
                    <p className="text-xs text-red-600 font-semibold mt-1 leading-relaxed">{persistentError}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowDiagnosticsPanel(!showDiagnosticsPanel)}
                    className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold text-xs transition-all cursor-pointer uppercase tracking-wider"
                  >
                    {showDiagnosticsPanel ? 'Ocultar Diagnóstico' : 'Detalhes do Diagnóstico'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersistentError(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPersistentError(null);
                      handleSaveProduct(lastSaveAsActive);
                    }}
                    className="px-4 py-2.5 bg-[#FF6A1A] hover:bg-[#e05b10] text-white rounded-xl font-black text-xs transition-all cursor-pointer uppercase tracking-wider shadow-xs active:scale-95"
                  >
                    TENTAR NOVAMENTE
                  </button>
                </div>
              </div>

              {/* DIAGNOSTICS DISPLAY PANEL */}
              {showDiagnosticsPanel && diagnosticsDetails && (
                <div className="border-t border-red-200/60 pt-4 mt-2 space-y-3">
                  <div className="flex items-center justify-between border-b border-red-200/40 pb-2">
                    <span className="text-xs font-black uppercase text-red-700 tracking-wider flex items-center gap-1.5">
                      <AlertCircle size={14} className="stroke-[2.5]" />
                      Painel Técnico de Diagnóstico do Firebase
                    </span>
                    <span className="text-[9px] font-mono bg-red-200 text-red-800 px-2 py-0.5 rounded font-bold uppercase">
                      Falha na Etapa
                    </span>
                  </div>

                  {diagnosticsDetails.logText && (
                    <div className="space-y-2 bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 font-mono text-xs">
                      <p className="text-slate-400 text-[10px] uppercase font-black tracking-wider border-b border-slate-800 pb-1.5 mb-2">
                        LOG DO SALVAMENTO (Passos Executados)
                      </p>
                      <pre className="whitespace-pre-wrap leading-relaxed select-all text-[11px] text-emerald-400">
                        {diagnosticsDetails.logText}
                      </pre>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-2 bg-white/70 p-3 rounded-xl border border-red-100">
                      <p className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Erro do Firebase</p>
                      <p className="text-red-700 font-mono text-[11px] bg-red-50 p-2 rounded border border-red-200/50 break-all select-all">
                        <strong>Código:</strong> {diagnosticsDetails.code}
                      </p>
                      <p className="text-slate-700 text-[11px] whitespace-pre-wrap font-mono mt-1 leading-relaxed bg-slate-50/50 p-2 rounded border border-slate-150">
                        <strong>Mensagem original:</strong> {diagnosticsDetails.originalMessage}
                      </p>
                    </div>

                    <div className="space-y-2 bg-white/70 p-3 rounded-xl border border-red-100">
                      <p className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Contexto do Arquivo & Destino</p>
                      <ul className="space-y-1.5 text-slate-700 text-[11px] list-disc pl-4 font-mono">
                        <li><strong>Etapa:</strong> {diagnosticsDetails.stage}</li>
                        <li><strong>Nome do arquivo:</strong> {diagnosticsDetails.filename}</li>
                        <li><strong>Tipo:</strong> {diagnosticsDetails.filetype}</li>
                        <li><strong>Tamanho:</strong> {diagnosticsDetails.filesize}</li>
                        <li><strong>Caminho Storage:</strong> {diagnosticsDetails.storagePath}</li>
                      </ul>
                    </div>

                    <div className="space-y-2 bg-white/70 p-3 rounded-xl border border-red-100">
                      <p className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Identidade do Operador</p>
                      <ul className="space-y-1.5 text-slate-700 text-[11px] list-disc pl-4 font-mono">
                        <li><strong>UID do Usuário:</strong> {diagnosticsDetails.uid}</li>
                        <li><strong>E-mail:</strong> {diagnosticsDetails.email}</li>
                        <li><strong>É administrador?</strong> {diagnosticsDetails.isAdmin ? 'Sim (Validado no Firestore)' : 'Não'}</li>
                      </ul>
                    </div>

                    <div className="space-y-2 bg-white/70 p-3 rounded-xl border border-red-100">
                      <p className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Configurações de Conexão</p>
                      <ul className="space-y-1.5 text-slate-700 text-[11px] list-disc pl-4 font-mono">
                        <li><strong>Serviço de Armazenamento:</strong> {diagnosticsDetails.storageProvider}</li>
                        <li><strong>Database ID:</strong> {diagnosticsDetails.databaseId}</li>
                        <li><strong>Doc Firestore:</strong> {diagnosticsDetails.collectionDoc}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wizard Content Panel */}
          <div className="p-6 md:p-8 flex-1">
            
            {/* ETAPA 1 — INFORMAÇÕES */}
            {currentStep === 1 && (
              <div className="space-y-8 max-w-3xl">
                <h3 className="font-black text-slate-800 text-sm border-b border-slate-150 pb-2">Etapa 1 de 5: Informações do Material</h3>
                
                {/* Bloco 1 — Dados básicos */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Bloco 1 — Dados básicos</h4>
                  
                  {/* Row 1: Nome do material / kit & Categoria comercial */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nome do Material / Kit (PDF) *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Pranchas Pedagógicas Lúdicas - Vol 1"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Categoria Comercial</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-semibold"
                      >
                        {INITIAL_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                        <option value="Kits Completos">Kits Completos</option>
                        <option value="Materiais Gratuitos">Materiais Gratuitos</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Modalidade & Quantidade de PDFs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Modalidade</label>
                      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setProductType('pago')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${
                            productType === 'pago' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          Material Pago
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProductType('gratuito');
                            setPrice(0);
                            setPromoPrice(0);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${
                            productType === 'gratuito' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          Download Grátis
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Quantidade de PDFs *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={pages}
                        onChange={(e) => setPages(Number(e.target.value))}
                        placeholder="Ex: 5"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-semibold"
                      />
                      <p className="text-[9px] text-slate-400 font-bold">Informe quantos arquivos/modelos em PDF o cliente receberá.</p>
                    </div>
                  </div>
                </div>

                {/* Bloco 2 — Descrição */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Bloco 2 — Descrição</h4>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Descrição Curta (Resumo de busca)</label>
                    <textarea
                      rows={2}
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Resumo de uma linha para chamar a atenção do cliente no catálogo lúdico."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Informações da atividade *</label>
                    <textarea
                      value={activityInfo}
                      onChange={(e) => setActivityInfo(e.target.value)}
                      placeholder="Cole aqui a descrição completa da atividade. Use quebras de linha para novos parágrafos. Ex:&#10;&#10;Sobre esta atividade:&#10;Atividade criativa para recortar, montar e brincar.&#10;&#10;O que desenvolve:&#10;Coordenação motora, criatividade e percepção corporal."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] leading-relaxed font-medium min-h-[180px] max-h-[320px] overflow-y-auto"
                    />
                  </div>
                </div>

                {/* Bloco 3 — Objetivos */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Bloco 3 — Objetivos</h4>
                  
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Objetivos pedagógicos (alinhados com a BNCC)</label>
                      <span className="text-[9px] text-blue-600 font-extrabold uppercase tracking-wide">1 item por linha</span>
                    </div>
                    <textarea
                      rows={4}
                      value={objectives}
                      onChange={(e) => setObjectives(e.target.value)}
                      placeholder="Ex: Desenvolver a coordenação motora fina&#10;Estimular a criatividade e imaginação&#10;Trabalhar o esquema corporal"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-medium"
                    />
                  </div>
                </div>

                {productType === 'gratuito' && (
                  <div className="mt-6 pt-6 border-t border-slate-200/60 space-y-5">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">📁 ARQUIVO PDF E CONFIGURAÇÃO GRÁTIS</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Como você selecionou a modalidade <strong>“Download Grátis”</strong>, envie o arquivo PDF correspondente abaixo. Ele ficará salvo de forma segura no Cloudflare R2 para as suas visitantes baixarem diretamente no site público.
                    </p>
                    {renderFreePdfUploadSection()}
                  </div>
                )}
              </div>
            )}

            {/* ETAPA 2 — IMAGENS */}
            {currentStep === 2 && (
              <div className="space-y-6 max-w-3xl">
                <h3 className="font-black text-slate-800 text-sm border-b border-slate-150 pb-2">Etapa 2 de 5: Imagens do Material</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Image Pick Block 1 */}
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Capa Principal da Atividade</label>
                    
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                      <div className="aspect-[4/3] w-full rounded-xl bg-white border border-slate-150 flex items-center justify-center overflow-hidden relative shadow-inner">
                        {imageUrl ? (
                          <ProductImage id={imageUrl} className="w-full h-full object-contain p-2" />
                        ) : (
                          <div className="text-slate-400 flex flex-col items-center gap-1">
                            <ImageIcon size={32} className="stroke-[1.5]" />
                            <span className="font-bold text-[10px]">Sem imagem selecionada</span>
                          </div>
                        )}
                      </div>

                      {/* Image Metadata Panel */}
                      <div className="space-y-2 text-xs border-t border-slate-200/60 pt-3">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-slate-400 font-extrabold uppercase text-[9px]">ID / Nome do Arquivo</span>
                          <span className="text-slate-700 font-bold truncate max-w-[180px]" title={imageUrl}>
                            {imageUrl.startsWith('data:') 
                              ? `Imagem Base64 (${Math.round(imageUrl.length / 1024)} KB)` 
                              : imageUrl}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-slate-400 font-extrabold uppercase text-[9px]">Resolução Recomendada</span>
                          <span className="text-slate-700 font-black">500 × 500 px</span>
                        </div>

                        {imageUrl && (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) && (
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-400 font-extrabold uppercase text-[9px]">URL / Origem</span>
                            <div className="flex items-center gap-1.5">
                              {imageUrl.startsWith('http') ? (
                                <a 
                                  href={imageUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-blue-600 hover:underline font-black flex items-center gap-1"
                                >
                                  Ver link
                                  <ArrowRight size={10} />
                                </a>
                              ) : (
                                <span className="text-slate-500 font-semibold text-[10px]">Upload local</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/60">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleImagePicker('main')}
                            className="flex-1 py-2 bg-[#37C76A] hover:bg-[#2ca455] text-white font-extrabold rounded-xl flex items-center justify-center gap-1.5 text-xs cursor-pointer transition-all shadow-sm shadow-green-100"
                          >
                            <Upload size={13} />
                            <span>Trocar imagem</span>
                          </button>

                          {imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setImageUrl('');
                                showToast('success', 'Imagem principal removida. Não esqueça de carregar outra antes de salvar!');
                              }}
                              className="px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all flex items-center justify-center"
                              title="Remover imagem"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        {imageUrl !== originalImageUrl && originalImageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl(originalImageUrl);
                              showToast('success', 'Restaurado para a imagem salva anteriormente!');
                            }}
                            className="w-full py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold rounded-xl border border-amber-200 flex items-center justify-center gap-1.5 text-[11px] cursor-pointer transition-all"
                          >
                            <RefreshCw size={11} className="animate-spin-slow" />
                            <span>Restaurar anterior</span>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={uploadMainImage} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>

                  {/* Image Pick Block 2: Gallery */}
                  <div className="space-y-3 text-left">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 text-left">
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Galeria de Amostras do PDF</label>
                          <p className="text-[9px] text-slate-400 font-bold">Resolução ideal: 1000 × 1000 px</p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleImagePicker('gallery')}
                          className="py-1.5 px-3 bg-[#12368F] hover:bg-blue-800 text-white font-extrabold rounded-lg text-[10px] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Plus size={12} />
                          <span>Adicionar Imagem</span>
                        </button>
                      </div>

                      {/* Gallery Grid */}
                      <div className="grid grid-cols-2 gap-4 max-h-[320px] overflow-y-auto pr-1">
                        {galleryUrls.map((g, idx) => {
                          const isMain = g === imageUrl;
                          return (
                            <div key={idx} className={`relative aspect-square bg-white border rounded-xl overflow-hidden group flex flex-col justify-between p-1.5 transition-all ${isMain ? 'border-[#37C76A] ring-2 ring-emerald-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                              
                              {/* Preview area */}
                              <div className="w-full flex-1 relative rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <ProductImage id={g} className="w-full h-full object-contain p-1" />
                                
                                {isMain && (
                                  <span className="absolute top-1.5 left-1.5 bg-[#37C76A] text-white font-black text-[8px] tracking-widest uppercase px-2 py-0.5 rounded shadow-sm z-10 flex items-center gap-0.5">
                                    <Check size={8} className="stroke-[4]" />
                                    <span>CAPA</span>
                                  </span>
                                )}

                                {/* Delete button */}
                                <button
                                  type="button"
                                  onClick={() => deleteGalleryImage(idx)}
                                  className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer shadow-md z-10 transition-opacity"
                                  title="Remover amostra"
                                >
                                  <X size={10} className="stroke-[3]" />
                                </button>
                              </div>

                              {/* Controls (Reorder, Make Main) */}
                              <div className="mt-1.5 flex justify-between items-center gap-1">
                                {/* Reordering buttons */}
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveGalleryImage(idx, 'left')}
                                    disabled={idx === 0}
                                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded disabled:opacity-40 disabled:hover:bg-slate-100 transition-colors cursor-pointer"
                                    title="Mover para esquerda"
                                  >
                                    <ChevronLeft size={11} className="stroke-[3]" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveGalleryImage(idx, 'right')}
                                    disabled={idx === galleryUrls.length - 1}
                                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded disabled:opacity-40 disabled:hover:bg-slate-100 transition-colors cursor-pointer"
                                    title="Mover para direita"
                                  >
                                    <ChevronRight size={11} className="stroke-[3]" />
                                  </button>
                                </div>

                                {/* Set as Main (if not already main) */}
                                {!isMain && (
                                  <button
                                    type="button"
                                    onClick={() => setAsMainImage(g)}
                                    className="text-[9px] font-black uppercase text-[#12368F] hover:text-blue-800 transition-colors bg-blue-50/80 hover:bg-blue-100/80 px-2 py-1 rounded"
                                  >
                                    Usar como Capa
                                  </button>
                                )}
                              </div>

                            </div>
                          );
                        })}

                        {galleryUrls.length === 0 && (
                          <div className="col-span-2 border border-dashed border-slate-200 p-8 rounded-2xl text-center text-slate-400 text-xs font-semibold">
                            Nenhuma imagem adicional na galeria.
                          </div>
                        )}
                      </div>
                    </div>

                    <input 
                      type="file" 
                      ref={galleryInputRef} 
                      onChange={uploadGalleryImage} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 3 — VÍDEO */}
            {currentStep === 3 && (
              <div className="space-y-6 max-w-2xl">
                <h3 className="font-black text-slate-800 text-sm border-b border-slate-150 pb-2">Etapa 3 de 5: Vídeo Demonstrativo</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Link do YouTube / Shorts</label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ ou link de Shorts"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 font-bold">Aceitamos vídeos de demonstração lúdica comuns do YouTube ou Reels/Shorts verticais.</p>
                </div>

                {/* Video player visual preview simulator */}
                <div className="pt-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">Prévia em Tempo Real do Player</span>
                  {getYoutubeId(youtubeUrl) ? (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYoutubeId(youtubeUrl)}`}
                        title="Youtube Preview"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                      <Play size={36} className="stroke-[1.5]" />
                      <span className="font-extrabold text-xs mt-2">Sem vídeo carregado</span>
                      <span className="text-[10px] opacity-75 mt-0.5">Adicione um link do YouTube acima para rodar a prévia</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ETAPA 4 — VENDA */}
            {currentStep === 4 && (
              <div className="space-y-6 max-w-2xl">
                <h3 className="font-black text-slate-800 text-sm border-b border-slate-150 pb-2">Etapa 4 de 5: Condições Comerciais</h3>
                
                {productType === 'gratuito' ? (
                  <div className="space-y-6">
                    <div className="space-y-5 bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-emerald-800">
                      <div className="flex gap-3 text-left">
                        <Download size={24} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-black text-sm text-left">Download Grátis Ativado</h4>
                          <p className="text-xs opacity-90 mt-1 leading-relaxed text-left">
                            O preço deste material foi zerado automaticamente (R$ 0,00). Isso ativa o botão de baixar PDF diretamente sem passar por checkout da Hotmart.
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-emerald-200/50 pt-4 space-y-4 text-xs text-left">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold uppercase text-[10px] tracking-wider text-emerald-700">Texto do Botão de Download</label>
                          <input
                            type="text"
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                            placeholder="Ex: Baixar PDF Grátis"
                            className="w-full bg-white border border-emerald-200 p-3 rounded-xl text-emerald-900 font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {renderFreePdfUploadSection()}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Preço Original (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-bold"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Preço Promocional (R$ - Opcional)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={promoPrice}
                          onChange={(e) => setPromoPrice(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-bold text-green-600"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Link Individual de Compra da Hotmart</label>
                      <input
                        type="text"
                        value={hotmartUrl}
                        onChange={(e) => setHotmartUrl(e.target.value)}
                        placeholder="https://pay.hotmart.com/XXXXX"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-mono"
                      />
                      <p className="text-[10px] text-slate-400 font-semibold italic">Este link direciona a administradora ao checkout oficial seguro da Hotmart.</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Texto do Botão de Compra</label>
                      <input
                        type="text"
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                        placeholder="Ex: Garantir Meu PDF de Atividades"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ETAPA 5 — EXIBIÇÃO */}
            {currentStep === 5 && (
              <div className="space-y-6 max-w-2xl">
                <h3 className="font-black text-slate-800 text-sm border-b border-slate-150 pb-2">Etapa 5 de 5: Exibição na Loja</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  {/* Status do Produto */}
                  <div className="flex flex-col gap-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Status de Publicação</label>
                    <div className="flex gap-2 bg-slate-200/50 p-1 rounded-xl mt-1">
                      <button
                        type="button"
                        onClick={() => setIsActive(true)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${
                          isActive ? 'bg-[#37C76A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 font-bold'
                        }`}
                      >
                        Publicado
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsActive(false)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${
                          !isActive ? 'bg-slate-400 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 font-bold'
                        }`}
                      >
                        Rascunho
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 font-semibold">
                      {isActive ? '✓ Publicado: visível na loja geral.' : '🔒 Rascunho: oculto para visitantes.'}
                    </p>
                  </div>

                  {/* Exibir na Página Inicial (Destaque) */}
                  <div className="flex flex-col gap-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Exibir na Página Inicial (Destaque)</label>
                    <div className="flex gap-2 bg-slate-200/50 p-1 rounded-xl mt-1">
                      <button
                        type="button"
                        onClick={() => setIsHighlight(true)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${
                          isHighlight ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 font-bold'
                        }`}
                      >
                        Sim (Destaque)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsHighlight(false)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${
                          !isHighlight ? 'bg-slate-400 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 font-bold'
                        }`}
                      >
                        Não
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 font-semibold">
                      {isHighlight ? '✓ Destaque: aparecerá em "Atividades em Destaque".' : '✗ Não aparecerá nos Destaques.'}
                    </p>
                  </div>

                  {/* Exibir como Novidade (Selo Novo) */}
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      id="optNew"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      className="w-4 h-4 text-[#FF6A1A] border-slate-300 rounded focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="optNew" className="text-xs text-slate-700 font-extrabold cursor-pointer select-none">Exibir como Novidade (Selo Novo)</label>
                  </div>

                  {/* Exibir como Mais Vendido */}
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      id="optBest"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="w-4 h-4 text-[#FF6A1A] border-slate-300 rounded focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="optBest" className="text-xs text-slate-700 font-extrabold cursor-pointer select-none">Exibir como Mais Vendido</label>
                  </div>

                  {/* Este produto é um Kit/Combo */}
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      id="optKit"
                      checked={isKit}
                      onChange={(e) => setIsKit(e.target.checked)}
                      className="w-4 h-4 text-[#FF6A1A] border-slate-300 rounded focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="optKit" className="text-xs text-slate-700 font-extrabold cursor-pointer select-none">Este produto é um Kit/Combo</label>
                  </div>

                  {/* Mostrar na Home (Página Inicial) */}
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      id="optShowOnHome"
                      checked={showOnHome}
                      onChange={(e) => setShowOnHome(e.target.checked)}
                      className="w-4 h-4 text-[#FF6A1A] border-slate-300 rounded focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="optShowOnHome" className="text-xs text-slate-700 font-extrabold cursor-pointer select-none">Mostrar na Home (Página Inicial)</label>
                  </div>

                  {/* Ordem de Exibição */}
                  <div className="flex flex-col gap-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Ordem de Exibição (Número)</label>
                    <input
                      type="number"
                      value={order}
                      onChange={(e) => setOrder(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl mt-1 focus:outline-none focus:border-slate-300 font-bold"
                    />
                    <p className="text-[9px] text-slate-400 mt-1 font-semibold">Números menores aparecem primeiro na prateleira.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Stepper Wizard Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 absolute bottom-0 left-0 right-0 h-20 flex items-center justify-between select-none">
            
            {/* Left Hand: Back and real-time preview options */}
            <div className="flex gap-3">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-5 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  <span>VOLTAR</span>
                </button>
              ) : (
                <div className="w-20" /> // spacer
              )}
            </div>

            {/* Right Hand: Save, Publish, and Continue */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSaveProduct(false)}
                className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-wider border border-slate-300/60 transition-all cursor-pointer"
              >
                SALVAR RASCUNHO
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-6 py-3.5 bg-[#12368F] hover:bg-blue-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>CONTINUAR</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSaveProduct(true)}
                  className="px-8 py-3.5 bg-[#FF6A1A] hover:bg-[#e05b10] text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#FF6A1A]/10"
                >
                  PUBLICAR MATERIAL
                </button>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Uploading progress overlay modal */}
      {(isUploading || isSaving || saveError) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-6 border border-slate-100 animate-in fade-in zoom-in duration-200">
            {saveError ? (
              // Error State Layout
              <>
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <X size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Ocorreu um Erro</h3>
                  <p className="text-red-600 text-sm font-semibold mt-2 leading-relaxed">
                    {saveError}
                  </p>
                  {diagnosticsText && (
                    <details className="mt-4 text-left bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-32 overflow-y-auto">
                      <summary className="text-[10px] font-black uppercase text-slate-400 cursor-pointer select-none">Detalhes do Diagnóstico</summary>
                      <pre className="text-[9px] font-mono text-slate-500 mt-2 whitespace-pre-wrap leading-tight">
                        {diagnosticsText}
                      </pre>
                    </details>
                  )}
                </div>
                <div className="flex gap-3 w-full mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSaveError(null);
                      setIsSaving(false);
                      setIsUploading(false);
                    }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl text-xs uppercase cursor-pointer border border-slate-200 transition-all"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const wasActive = isActive; // retry with current state
                      setSaveError(null);
                      handleSaveProduct(wasActive);
                    }}
                    className="flex-1 py-3 bg-[#12368F] hover:bg-blue-800 text-white font-extrabold rounded-2xl text-xs uppercase cursor-pointer transition-all"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </>
            ) : (
              // Active Uploading/Saving State Layout
              <>
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#12368F] relative">
                  <RefreshCw size={32} className="animate-spin" />
                  {saveProgressPercent > 0 && saveProgressPercent < 100 && (
                    <span className="absolute text-[10px] font-black">{saveProgressPercent}%</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Processando Arquivos</h3>
                  <p className="text-slate-500 text-sm font-semibold mt-1 leading-relaxed">{uploadProgressText}</p>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                  <div 
                    className="bg-[#12368F] h-full rounded-full transition-all duration-300" 
                    style={{ width: `${saveProgressPercent || 70}%` }}
                  ></div>
                </div>
                <div className="flex flex-col gap-2 w-full mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      isSaveCancelledRef.current = true;
                      if (activeUploadTaskRef.current) {
                        try {
                          activeUploadTaskRef.current.cancel();
                          console.log("Upload task manually cancelled.");
                        } catch (cancelErr) {
                          console.error("Failed to cancel upload task:", cancelErr);
                        }
                      }
                      setIsSaving(false);
                      setIsUploading(false);
                      setSaveError(null);
                      showToast('success', 'Envio cancelado pelo usuário.');
                    }}
                    className="py-3 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold rounded-2xl text-xs uppercase cursor-pointer border border-red-100 transition-all w-full"
                  >
                    Cancelar Envio
                  </button>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Por favor, não feche o navegador.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================== "VER COMO FICARÁ" HIGH-FIDELITY PRODUCT DETAIL PREVIEW MODAL ==================== */}
      {showRealPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 md:p-8 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-full max-h-[90vh] animate-scaleUp">
            
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 text-slate-800">
                <span className="text-xl">👁️</span>
                <div className="text-left">
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-400">Simulador de Página do Produto</h3>
                  <h4 className="font-black text-sm text-[#12368F] leading-none">Como este recurso será visualizado pelo seu cliente</h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRealPreview(false)}
                className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Simulated product page details */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 text-slate-700 bg-white text-left">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Simulated product gallery column (Span 5) */}
                <div className="md:col-span-5 space-y-4">
                  {/* Big Image box */}
                  <div className="aspect-square bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex items-center justify-center">
                    {imageUrl ? (
                      imageUrl.startsWith('data:image') || imageUrl.startsWith('http') ? (
                        <img src={imageUrl} alt="Mockup preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(/assets/${imageUrl}.png)` }} />
                      )
                    ) : (
                      <ImageIcon size={40} className="text-slate-300" />
                    )}
                  </div>

                  {/* Little Thumbnails list */}
                  <div className="grid grid-cols-4 gap-2">
                    {galleryUrls.map((g, index) => (
                      <div key={index} className="aspect-square bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-xs cursor-pointer">
                        {g.startsWith('data:image') || g.startsWith('http') ? (
                          <img src={g} alt="Thumb preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(/assets/${g}.png)` }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated Buy Column details (Span 7) */}
                <div className="md:col-span-7 space-y-5">
                  <div className="space-y-2">
                    {badge && (
                      <span className="bg-blue-50 border border-blue-200 text-[#12368F] font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {badge}
                      </span>
                    )}
                    <h1 className="text-2xl font-black text-slate-800 leading-tight">{name || 'Sem Título Cadastrado'}</h1>
                    <p className="text-xs text-[#37C76A] font-extrabold uppercase tracking-widest">{category}</p>
                  </div>

                  {/* Pricing Box */}
                  <div className="bg-[#FFF8EE] border border-orange-100 p-5 rounded-2xl">
                    {productType === 'gratuito' ? (
                      <div className="space-y-1">
                        <span className="text-3xl font-black text-emerald-600">GRÁTIS</span>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Download 100% liberado sem burocracia</p>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black text-slate-800">R$ {promoPrice && promoPrice > 0 ? promoPrice.toFixed(2) : price.toFixed(2)}</span>
                        {promoPrice && promoPrice > 0 ? (
                          <span className="text-sm text-slate-400 font-bold line-through">R$ {price.toFixed(2)}</span>
                        ) : null}
                      </div>
                    )}

                    <button
                      type="button"
                      className="mt-4 w-full py-3.5 bg-[#FF6A1A] text-white font-black text-xs uppercase tracking-wider rounded-xl text-center shadow-lg active:scale-95 transition-all border border-transparent flex items-center justify-center gap-2"
                    >
                      {productType === 'gratuito' ? <Download size={14} /> : <Globe size={14} />}
                      <span>{buttonText}</span>
                    </button>
                  </div>

                  {/* Short description bullet */}
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">{shortDescription || 'Nenhum resumo adicionado.'}</p>

                  {/* Main Specifications grid checklist */}
                  <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-slate-100 text-[10px]">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <span className="text-slate-400 font-bold uppercase">IDADE RECOMENDADA</span>
                      <p className="font-extrabold text-slate-800 text-xs mt-0.5">{ageRange || 'Atividades diversas'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <span className="text-slate-400 font-bold uppercase">QUANTIDADE DE PDFS</span>
                      <p className="font-extrabold text-slate-800 text-xs mt-0.5">{pages} {pages === 1 ? 'arquivo PDF' : 'arquivos PDF'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <span className="text-slate-400 font-bold uppercase">FORMATO DE ENTREGA</span>
                      <p className="font-extrabold text-slate-800 text-xs mt-0.5">{format || 'PDF digital por e-mail'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <span className="text-slate-400 font-bold uppercase">TAMANHO DA FOLHA</span>
                      <p className="font-extrabold text-slate-800 text-xs mt-0.5">{printSize || 'A4'}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Collateral sections Accordions mock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-150">
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> O que você vai receber:</h4>
                  <ul className="space-y-1.5 text-xs">
                    {whatYouWillReceive.split('\n').filter(v => v.trim().length > 0).map((v, i) => (
                      <li key={i} className="flex gap-2 text-slate-600 font-medium">
                        <span className="text-emerald-500 font-bold">✓</span> <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5"><Heart size={14} className="text-red-500 fill-red-500" /> Objetivos Pedagógicos:</h4>
                  <ul className="space-y-1.5 text-xs">
                    {objectives.split('\n').filter(v => v.trim().length > 0).map((v, i) => (
                      <li key={i} className="flex gap-2 text-slate-600 font-medium">
                        <span className="text-[#12368F] font-bold">•</span> <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* Simulated footer banner */}
            <div className="p-4 bg-slate-100 border-t border-slate-150 flex justify-center shrink-0 select-none">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">© Atividades Criativas Oficial - Visualização Prévia</span>
            </div>

          </div>
        </div>
      )}

      {/* Excluir Produto Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8 max-w-md w-full text-center relative animate-scaleUp">
            <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
              <Trash2 size={28} className="stroke-[2.5]" />
            </div>
            
            <h3 className="text-xl font-black text-slate-800 mb-2">
              Excluir produto?
            </h3>
            
            <p className="text-sm text-slate-500 font-semibold leading-relaxed mb-6">
              Este produto será removido do site público, mas os arquivos serão preservados.
            </p>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingProductId(null);
                }}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (deletingProductId) {
                    try {
                      const docRef = doc(db, 'products', deletingProductId);
                      await updateDoc(docRef, {
                        isDeleted: true,
                        isActive: false,
                        showOnHome: false,
                        isFeatured: false,
                        isBestSeller: false,
                        isNew: false,
                        isKit: false,
                        isFree: false,
                        deletedAt: new Date().toISOString(),
                        deletedBy: auth.currentUser?.email || 'admin'
                      });
                      
                      setShowDeleteModal(false);
                      setShowDeleteSuccessModal(true);
                    } catch (err) {
                      console.error("Error executing logical deletion:", err);
                      showToast('error', 'Ocorreu um erro ao excluir o produto.');
                    }
                  }
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/10"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excluir Produto Success Modal */}
      {showDeleteSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8 max-w-sm w-full text-center relative animate-scaleUp">
            <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-full flex items-center justify-center text-green-500 mx-auto mb-4">
              <Check size={28} className="stroke-[3]" />
            </div>
            
            <h3 className="text-lg font-black text-slate-800 mb-2">
              Produto excluído com sucesso.
            </h3>
            
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">
              O catálogo foi atualizado.
            </p>
            
            <button
              type="button"
              onClick={() => {
                setShowDeleteSuccessModal(false);
                setDeletingProductId(null);
              }}
              className="w-full py-3 bg-[#12368F] hover:bg-[#0e2a79] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
