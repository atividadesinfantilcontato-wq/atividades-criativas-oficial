import React, { useState, useEffect, useRef } from 'react';
import { 
  PenTool, Save, X, RotateCcw, Check, Image as ImageIcon, Upload, ArrowRight, ShieldCheck, Mail, HelpCircle,
  Layers, Eye, EyeOff, ArrowUp, ArrowDown, Plus, Trash2, Smartphone, Tablet, Monitor, ChevronRight,
  Sparkles, Heart, Clock, Star, MessageSquare, List, Phone, Percent, Info, Settings, FileText
} from 'lucide-react';
import { SiteConfig, Review, Product } from '../types';
import { compressImage } from '../utils/imageCompressor';
import ImageFieldEditor from './ImageFieldEditor';

// Import homepage components directly for high-fidelity rendering!
import PromoBar from './PromoBar';
import Header from './Header';
import Banner from './Banner';
import Benefits from './Benefits';
import Categories from './Categories';
import DestaqueSection from './DestaqueSection';
import WhyChooseUs from './WhyChooseUs';
import MostLovedSection from './MostLovedSection';
import ReviewsSection from './ReviewsSection';
import TipsAndContent from './TipsAndContent';
import HotmartTrustSection from './HotmartTrustSection';
import Newsletter from './Newsletter';
import ActivityGroup from './ActivityGroup';
import Footer from './Footer';

interface VisualEditorProps {
  siteConfig: SiteConfig;
  onUpdateSiteConfig: (config: SiteConfig) => void;
  products: Product[];
  reviews: Review[];
  onSuccess: (message: string) => void;
  onNavigateToLogoSettings?: () => void;
}

type EditableSection = 
  | null
  | 'promo_bar'
  | 'header'
  | 'banner'
  | 'benefits'
  | 'categories'
  | 'destaque_activities'
  | 'why_choose'
  | 'best_sellers'
  | 'new_arrivals'
  | 'holidays'
  | 'most_loved'
  | 'comments'
  | 'tips_content'
  | 'hotmart'
  | 'newsletter'
  | 'activity_group'
  | 'footer';

type EditorTab = 'content' | 'image' | 'appearance' | 'display' | 'links';

const SECTIONS_METADATA = [
  { id: 'promo_bar', name: 'Barra Superior', category: 'Cabeçalho e Rodapé' },
  { id: 'header', name: 'Cabeçalho e Logo', category: 'Cabeçalho e Rodapé' },
  { id: 'banner', name: 'Banner Principal', category: 'Destaques' },
  { id: 'benefits', name: 'Barra de Benefícios', category: 'Elementos Informativos' },
  { id: 'categories', name: 'Categorias de Produtos', category: 'Navegação' },
  { id: 'destaque_activities', name: 'Atividades em Destaque', category: 'Seções de Loja' },
  { id: 'why_choose', name: 'Por que Escolher Nosso Site', category: 'Elementos Informativos' },
  { id: 'best_sellers', name: 'Seção Mais Vendidos', category: 'Seções de Loja' },
  { id: 'new_arrivals', name: 'Seção Novidades', category: 'Seções de Loja' },
  { id: 'holidays', name: 'Seção Datas Comemorativas', category: 'Seções de Loja' },
  { id: 'most_loved', name: 'Produtos Mais Queridos', category: 'Seções de Loja' },
  { id: 'comments', name: 'Depoimentos / Comentários', category: 'Prova Social' },
  { id: 'tips_content', name: 'Seção da Autora', category: 'Elementos Informativos' },
  { id: 'hotmart', name: 'Faixa de Segurança Hotmart', category: 'Prova Social' },
  { id: 'newsletter', name: 'Seção de Anúncio / Divulgação', category: 'Cabeçalho e Rodapé' },
  { id: 'activity_group', name: 'Grupo de Atividades', category: 'Cabeçalho e Rodapé' },
  { id: 'footer', name: 'Rodapé do Site', category: 'Cabeçalho e Rodapé' },
];

export default function VisualEditor({
  siteConfig,
  onUpdateSiteConfig,
  products,
  reviews,
  onSuccess,
  onNavigateToLogoSettings
}: VisualEditorProps) {
  const [activeSection, setActiveSection] = useState<EditableSection>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('content');
  const [viewDevice, setViewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoomScale, setZoomScale] = useState<number>(100);
  
  // local configuration representing "staged/live preview" state
  const [previewConfig, setPreviewConfig] = useState<SiteConfig>({ ...siteConfig });
  const [isModified, setIsModified] = useState(false);

  // File picker references
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const mobileLogoFileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal configuration if external changes occur
  useEffect(() => {
    setPreviewConfig({ ...siteConfig });
    setIsModified(false);
  }, [siteConfig]);

  // Determine if there are unstaged changes
  const checkModified = (current: SiteConfig) => {
    const keys = Object.keys(siteConfig) as Array<keyof SiteConfig>;
    const altered = keys.some(k => JSON.stringify(current[k]) !== JSON.stringify(siteConfig[k]));
    setIsModified(altered);
  };

  const handleFieldChange = (key: keyof SiteConfig, value: any) => {
    const updated = { ...previewConfig, [key]: value };
    setPreviewConfig(updated);
    checkModified(updated);
  };

  // Safe Section Visibility Toggle Helper
  const toggleSectionVisibilityState = (sectionId: string) => {
    const currentVisibility = previewConfig.sectionVisibility || {};
    const updatedVisibility = {
      ...currentVisibility,
      [sectionId]: currentVisibility[sectionId] !== false ? false : true
    };
    handleFieldChange('sectionVisibility', updatedVisibility);
  };

  // Safe Section Move Up Helper
  const moveSectionUp = (sectionId: string) => {
    const currentOrder = previewConfig.sectionOrder && previewConfig.sectionOrder.length > 0
      ? [...previewConfig.sectionOrder]
      : SECTIONS_METADATA.map(s => s.id);
    
    const idx = currentOrder.indexOf(sectionId);
    if (idx > 0) {
      const temp = currentOrder[idx];
      currentOrder[idx] = currentOrder[idx - 1];
      currentOrder[idx - 1] = temp;
      handleFieldChange('sectionOrder', currentOrder);
      onSuccess(`Seção "${SECTIONS_METADATA.find(s => s.id === sectionId)?.name}" movida para cima!`);
    }
  };

  // Safe Section Move Down Helper
  const moveSectionDown = (sectionId: string) => {
    const currentOrder = previewConfig.sectionOrder && previewConfig.sectionOrder.length > 0
      ? [...previewConfig.sectionOrder]
      : SECTIONS_METADATA.map(s => s.id);
    
    const idx = currentOrder.indexOf(sectionId);
    if (idx >= 0 && idx < currentOrder.length - 1) {
      const temp = currentOrder[idx];
      currentOrder[idx] = currentOrder[idx + 1];
      currentOrder[idx + 1] = temp;
      handleFieldChange('sectionOrder', currentOrder);
      onSuccess(`Seção "${SECTIONS_METADATA.find(s => s.id === sectionId)?.name}" movida para baixo!`);
    }
  };

  const handleSave = () => {
    onUpdateSiteConfig(previewConfig);
    onSuccess('Configurações do site salvas e publicadas com sucesso!');
    setIsModified(false);
    setActiveSection(null);
  };

  const handleCancel = () => {
    setPreviewConfig({ ...siteConfig });
    setIsModified(false);
    setActiveSection(null);
    onSuccess('Edição cancelada. Alterações revertidas.');
  };

  // Image Upload Compress Helpers
  const processImageUpload = (file: File, maxWidth: number, field: keyof SiteConfig, message: string) => {
    compressImage(file, maxWidth, 0.75)
      .then((base64) => {
        handleFieldChange(field, base64);
        onSuccess(message);
      })
      .catch((err) => {
        console.error('Error compressing uploaded image:', err);
        onSuccess('Erro ao processar imagem.');
      });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImageUpload(
        files[0],
        isMobile ? 350 : 600,
        isMobile ? 'mobileLogoUrl' : 'logoUrl',
        isMobile ? 'Nova logo mobile carregada!' : 'Nova logo principal carregada!'
      );
    }
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImageUpload(files[0], 1920, 'heroBackgroundImage', 'Nova imagem de fundo do banner carregada!');
    }
  };

  const handleCardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImageUpload(files[0], 800, 'heroCardImage', 'Nova imagem do card do banner carregada!');
    }
  };

  // Derived Active Product Objects
  const featuredProduct = products.find(p => p.id === previewConfig.featuredProductId);
  const kitProduct = products.find(p => p.isKit && p.isActive) || products.find(p => p.isKit) || undefined;

  // Helper wrapper for interactive hover overlay blocks
  const renderInteractiveBlock = (
    sectionId: EditableSection,
    sectionName: string,
    children: React.ReactNode
  ) => {
    const isSelected = activeSection === sectionId;
    const isVisible = previewConfig.sectionVisibility?.[sectionId!] !== false;
    
    // Skip rendering in preview if explicitly hidden
    if (!isVisible && activeSection !== sectionId) {
      return (
        <div key={sectionId || 'unknown'} className="bg-slate-100 border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400 font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <EyeOff size={14} />
            Seção Oculta: {sectionName}
          </span>
          <button
            type="button"
            onClick={() => setActiveSection(sectionId)}
            className="text-xs text-[#1E4DDB] hover:underline"
          >
            Editar para Exibir
          </button>
        </div>
      );
    }

    return (
      <div 
        key={sectionId || 'unknown'}
        className={`relative border-2 transition-all ${
          isSelected 
            ? 'border-[#FF6A1A] ring-4 ring-[#FF6A1A]/10 shadow-lg' 
            : 'border-transparent hover:border-[#1E4DDB] hover:shadow-md'
        } group`}
      >
        {/* Floating administrative editing flag */}
        <div className="absolute top-3 left-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveSection(sectionId);
              setActiveTab('content');
            }}
            className="flex items-center gap-1.5 bg-[#12368F] hover:bg-[#FF6A1A] text-white px-4 py-2 rounded-full text-xs font-black shadow-xl tracking-wider uppercase transition-all cursor-pointer"
          >
            <PenTool size={12} className="stroke-[2.5]" />
            <span>Editar {sectionName}</span>
          </button>
          
          <button
            type="button"
            onClick={() => toggleSectionVisibilityState(sectionId!)}
            className="bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-full shadow-lg border border-slate-200 transition-all cursor-pointer"
            title="Ocultar Seção"
          >
            {isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
        </div>
        
        {children}
      </div>
    );
  };

  // Render Section Selector if no section is selected
  const renderLayoutOutlineList = () => {
    const currentOrder = previewConfig.sectionOrder && previewConfig.sectionOrder.length > 0
      ? previewConfig.sectionOrder
      : SECTIONS_METADATA.map(s => s.id);

    return (
      <div className="p-5 space-y-4">
        <div className="bg-[#0E2A79]/5 border border-[#0E2A79]/10 p-4 rounded-2xl">
          <h4 className="font-black text-[#0E2A79] text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers size={14} />
            Organização da Página
          </h4>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
            Ative, desative e reordene todas as seções da página inicial do site Atividades Criativas Oficial de forma visual e simples.
          </p>
        </div>

        <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin">
          {currentOrder.map((sectionId, idx) => {
            const meta = SECTIONS_METADATA.find(s => s.id === sectionId);
            if (!meta) return null;
            const isVisible = previewConfig.sectionVisibility?.[sectionId] !== false;

            return (
              <div 
                key={sectionId} 
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  activeSection === sectionId 
                    ? 'border-[#FF6A1A] bg-orange-50/50 shadow-sm' 
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="text-[10px] font-black text-slate-300 w-4">{idx + 1}</span>
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="font-extrabold text-slate-700 text-xs truncate">{meta.name}</span>
                    <span className="text-[9px] text-slate-400 font-medium">{meta.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveSectionUp(sectionId)}
                    disabled={idx === 0}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                    title="Mover para cima"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSectionDown(sectionId)}
                    disabled={idx === currentOrder.length - 1}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                    title="Mover para baixo"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSectionVisibilityState(sectionId)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      isVisible 
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                        : 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                    }`}
                    title={isVisible ? "Ocultar" : "Mostrar"}
                  >
                    {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection(sectionId as any);
                      setActiveTab('content');
                    }}
                    className="p-1.5 bg-[#12368F]/5 hover:bg-[#12368F]/15 rounded-lg text-[#12368F] font-black uppercase text-[9px] px-2.5 transition-all cursor-pointer"
                  >
                    Editar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render appropriate tab buttons inside sidebar
  const renderTabButtons = () => {
    const tabs: { id: EditorTab; label: string }[] = [
      { id: 'content', label: 'Conteúdo' },
      { id: 'image', label: 'Imagem / Mídia' },
      { id: 'appearance', label: 'Aparência' },
      { id: 'display', label: 'Exibição' },
      { id: 'links', label: 'Links' },
    ];

    return (
      <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-none select-none">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[70px] py-3 text-[10px] uppercase font-black tracking-wider transition-all border-b-2 text-center shrink-0 cursor-pointer ${
              activeTab === tab.id 
                ? 'border-[#FF6A1A] text-[#FF6A1A] bg-orange-50/10' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  };

  // Generate ordered list of home sections
  const homepageOrder = previewConfig.sectionOrder && previewConfig.sectionOrder.length > 0
    ? previewConfig.sectionOrder
    : SECTIONS_METADATA.map(s => s.id);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100 text-left relative font-sans">
      
      {/* Top Interactive Auditing Control Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 select-none relative z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A1A] animate-pulse"></span>
            <span className="font-black text-[#0E2A79] text-xs uppercase tracking-widest">Editor Visual Premium</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200"></div>

          {/* Responsive Device Simulator toggles */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
            <button
              type="button"
              onClick={() => setViewDevice('desktop')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewDevice === 'desktop' ? 'bg-white text-[#12368F] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Prévia Desktop"
            >
              <Monitor size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewDevice('tablet')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewDevice === 'tablet' ? 'bg-white text-[#12368F] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Prévia Tablet"
            >
              <Tablet size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewDevice('mobile')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewDevice === 'mobile' ? 'bg-white text-[#12368F] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Prévia Mobile"
            >
              <Smartphone size={14} />
            </button>
          </div>

          {/* Zoom scaling factor */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl">
            <span>Zoom:</span>
            <select
              value={zoomScale}
              onChange={(e) => setZoomScale(Number(e.target.value))}
              className="bg-transparent border-none focus:ring-0 font-black text-slate-700 cursor-pointer text-xs"
            >
              <option value="100">100%</option>
              <option value="90">90%</option>
              <option value="80">80%</option>
              <option value="75">75%</option>
              <option value="50">50%</option>
            </select>
          </div>
        </div>

        {/* Global Save and Revert handles */}
        <div className="flex items-center gap-3">
          {isModified && (
            <div className="hidden sm:flex items-center gap-1.5 text-[#FF6A1A] bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full animate-pulse text-[10px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A1A]"></span>
              <span>Alterações pendentes</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleCancel}
            disabled={!isModified && !activeSection}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-600 font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:pointer-events-none"
          >
            Reverter
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={!isModified}
            className="px-5 py-2.5 bg-[#37C76A] hover:bg-[#2ca455] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#37C76A]/10"
          >
            <Save size={13} />
            <span>Publicar Site</span>
          </button>
        </div>
      </div>

      {/* Main workspace floor */}
      <div className="flex-1 flex overflow-hidden h-full">
        
        {/* Central viewport containing scrollable real-time preview of the website */}
        <div className="flex-1 bg-slate-100 overflow-auto p-4 md:p-8 flex items-start justify-center h-full scrollbar-thin">
          
          <div 
            className="transition-all duration-300 relative"
            style={{
              width: viewDevice === 'mobile' ? '375px' : viewDevice === 'tablet' ? '768px' : '100%',
              transform: `scale(${zoomScale / 100})`,
              transformOrigin: 'top center',
              maxHeight: zoomScale !== 100 ? '140%' : '100%',
              marginBottom: zoomScale !== 100 ? '-300px' : '0px'
            }}
          >
            {/* Simulation frame borders for tablet/mobile */}
            {viewDevice !== 'desktop' && (
              <div className="absolute -inset-x-4 -top-8 -bottom-4 border-[14px] border-slate-900 bg-slate-950 rounded-[44px] shadow-2xl pointer-events-none z-20">
                <div className="w-32 h-4.5 bg-slate-900 mx-auto rounded-b-2xl absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span className="w-8 h-1 bg-slate-800 rounded-full"></span>
                </div>
              </div>
            )}

            <div 
              className={`bg-white shadow-xl overflow-y-auto overflow-x-hidden ${
                viewDevice === 'desktop' 
                  ? 'w-full h-full' 
                  : 'w-full h-[85vh] rounded-[30px] relative z-10 scrollbar-none'
              }`}
            >
              <div className="pb-32">
                
                {/* Dynamically sequence and render homepage sections based on sectionOrder and visibility */}
                {homepageOrder.map(sectionId => {
                  switch (sectionId) {
                    case 'promo_bar':
                      return renderInteractiveBlock('promo_bar', 'Barra Superior', (
                        <PromoBar 
                          promoText={previewConfig.promoText}
                          contactEmail={previewConfig.contactEmail}
                          instagramUrl={previewConfig.instagramUrl}
                          facebookUrl={previewConfig.facebookUrl}
                          youtubeChannelUrl={previewConfig.youtubeChannelUrl}
                        />
                      ));

                    case 'header':
                      return renderInteractiveBlock('header', 'Cabeçalho e Logo', (
                        <Header 
                          currentPage="home"
                          cartCount={0}
                          searchQuery=""
                          onNavigate={() => {}}
                          onOpenCart={() => {}}
                          onSearchChange={() => {}}
                          siteConfig={previewConfig}
                        />
                      ));

                    case 'banner':
                      return renderInteractiveBlock('banner', 'Banner Principal', (
                        <Banner 
                          onVerProdutos={() => {}}
                          onEuQuero={() => {}}
                          bannerTitlePrefix={previewConfig.bannerTitlePrefix}
                          bannerTitleHighlight={previewConfig.bannerTitleHighlight}
                          bannerDescription={previewConfig.bannerDescription}
                          heroBackgroundImage={previewConfig.heroBackgroundImage}
                          heroCardImage={previewConfig.heroCardImage}
                          hideHeroCardImage={previewConfig.hideHeroCardImage}
                          featuredProduct={featuredProduct}
                          bannerImageMode={previewConfig.bannerImageMode}
                        />
                      ));

                    case 'benefits':
                      return renderInteractiveBlock('benefits', 'Benefícios', (
                        <Benefits />
                      ));

                    case 'categories':
                      return renderInteractiveBlock('categories', 'Categorias', (
                        <Categories 
                          selectedCategory={null}
                          onSelectCategory={() => {}}
                        />
                      ));

                    case 'destaque_activities':
                      return renderInteractiveBlock('destaque_activities', 'Atividades em Destaque', (
                        <DestaqueSection 
                          products={products}
                          kitProduct={kitProduct}
                          selectedCategory={null}
                          searchQuery=""
                          onSelectProduct={() => {}}
                        />
                      ));

                    case 'why_choose':
                      return renderInteractiveBlock('why_choose', 'Por que Escolher', (
                        <WhyChooseUs 
                          title={previewConfig.whyChooseUsTitle}
                          subtitle={previewConfig.whyChooseUsSubtitle}
                          description={previewConfig.whyChooseUsDescription}
                          creativity={previewConfig.whyChooseUsCreativity}
                          learning={previewConfig.whyChooseUsLearning}
                          practicality={previewConfig.whyChooseUsPracticality}
                        />
                      ));

                    case 'best_sellers':
                      const bestSellers = products.filter(p => p.isActive && (p.isBestSeller || p.tag === 'MAIS VENDIDO'));
                      return renderInteractiveBlock('best_sellers', 'Seção Mais Vendidos', (
                        <MostLovedSection 
                          title="Materiais Mais Vendidos"
                          subtitle="RECOMENDADOS POR EDUCADORES"
                          products={bestSellers.length > 0 ? bestSellers : products.slice(0, 3)}
                          onSelectProduct={() => {}}
                        />
                      ));

                    case 'new_arrivals':
                      const newArrivals = products.filter(p => p.isActive && (p.isNew || p.tag === 'NOVIDADE'));
                      return renderInteractiveBlock('new_arrivals', 'Seção Novidades', (
                        <MostLovedSection 
                          title="Lançamentos Recentes"
                          subtitle="NOVIDADES LÚDICAS"
                          products={newArrivals.length > 0 ? newArrivals : products.slice(2, 5)}
                          onSelectProduct={() => {}}
                        />
                      ));

                    case 'holidays':
                      return renderInteractiveBlock('holidays', 'Datas Comemorativas', (
                        <MostLovedSection 
                          title="Volta às Aulas lúdico"
                          subtitle="DATAS COMEMORATIVAS ESPECIAIS"
                          products={products.filter(p => p.category === 'Datas Comemorativas').slice(0, 4)}
                          onSelectProduct={() => {}}
                        />
                      ));

                    case 'most_loved':
                      return renderInteractiveBlock('most_loved', 'Produtos Mais Queridos', (
                        <MostLovedSection 
                          products={products}
                          onSelectProduct={() => {}}
                        />
                      ));

                    case 'comments':
                      return renderInteractiveBlock('comments', 'Comentários e Depoimentos', (
                        <ReviewsSection reviews={reviews} />
                      ));

                    case 'tips_content':
                      if (previewConfig.authorSectionEnabled === false) return null;
                      return renderInteractiveBlock('tips_content', 'Seção da Autora', (
                        <TipsAndContent siteConfig={previewConfig} />
                      ));

                    case 'hotmart':
                      return renderInteractiveBlock('hotmart', 'Garantia Hotmart', (
                        <HotmartTrustSection 
                          title={previewConfig.hotmartSectionTitle}
                          description={previewConfig.hotmartSectionDescription}
                        />
                      ));

                    case 'newsletter':
                      return renderInteractiveBlock('newsletter', 'Seção de Anúncio / Divulgação', (
                        <Newsletter 
                          title={previewConfig.newsletterTitle}
                          description={previewConfig.newsletterDescription}
                          buttonText={previewConfig.newsletterButtonText}
                          siteConfig={previewConfig}
                        />
                      ));

                    case 'activity_group':
                      return renderInteractiveBlock('activity_group', 'Grupo de Atividades', (
                        <ActivityGroup 
                          siteConfig={previewConfig}
                        />
                      ));

                    case 'footer':
                      return renderInteractiveBlock('footer', 'Rodapé do Site', (
                        <Footer 
                          onNavigateToSection={() => {}}
                          contactEmail={previewConfig.contactEmail}
                          instagramUrl={previewConfig.instagramUrl}
                          facebookUrl={previewConfig.facebookUrl}
                          youtubeChannelUrl={previewConfig.youtubeChannelUrl}
                          footerLegalText={previewConfig.footerLegalText}
                          siteConfig={previewConfig}
                        />
                      ));

                    default:
                      return null;
                  }
                })}

              </div>
            </div>
          </div>
        </div>

        {/* Right drawer slide-out editor panel (width range 380px to 460px - set precisely to 430px) */}
        <aside className="w-[430px] bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between shrink-0 h-full relative z-40 select-none">
          
          {/* Panel Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <span className="text-[9px] text-[#FF6A1A] font-black uppercase tracking-widest block mb-0.5">Painel Administrativo</span>
              <h3 className="font-black text-slate-800 text-sm">
                {activeSection ? (
                  <span className="flex items-center gap-1.5 text-slate-700 font-extrabold text-xs">
                    <PenTool size={13} className="text-[#FF6A1A]" />
                    Editando: {SECTIONS_METADATA.find(s => s.id === activeSection)?.name}
                  </span>
                ) : (
                  'Configuração Geral do Site'
                )}
              </h3>
            </div>
            
            {activeSection && (
              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer text-[10px] font-black uppercase tracking-wider px-3 flex items-center gap-1"
              >
                <X size={12} />
                Fechar
              </button>
            )}
          </div>

          {/* Render tabs ONLY when a section is active */}
          {activeSection && renderTabButtons()}

          {/* Form Content Panel Area */}
          <div className="flex-1 overflow-y-auto p-5 text-xs text-left scrollbar-thin">
            
            {!activeSection ? (
              /* IF NO ACTIVE SECTION SELECTED - SHOW GLOBAL OUTLINE & QUICK ACTIONS */
              <div className="space-y-4">
                {renderLayoutOutlineList()}
              </div>
            ) : (
              /* ACTIVE SECTION TABBED FIELDS RENDERING ENGINE */
              <div className="space-y-4">
                
                {/* ======================================= */}
                {/* TAB 1: CONTEÚDO (CONTENT EDITS) */}
                {/* ======================================= */}
                {activeTab === 'content' && (
                  <div className="space-y-4">
                    
                    {/* Promo Bar Content */}
                    {activeSection === 'promo_bar' && (
                      <div className="flex flex-col gap-1.5">
                        <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Texto de Destaque</label>
                        <input
                          type="text"
                          value={previewConfig.promoText || ''}
                          onChange={(e) => handleFieldChange('promoText', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-semibold text-slate-800"
                        />
                      </div>
                    )}

                    {/* Header Content */}
                    {activeSection === 'header' && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">E-mail de Suporte / Contato</label>
                          <input
                            type="email"
                            value={previewConfig.contactEmail || ''}
                            onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-semibold text-slate-800"
                          />
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Horário de Atendimento</label>
                          <input
                            type="text"
                            value={previewConfig.openingHours || 'Segunda a Sexta, das 8h às 18h'}
                            onChange={(e) => handleFieldChange('openingHours', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-semibold text-slate-800"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Texto Alternativo da Logo (Alt)</label>
                          <input
                            type="text"
                            value={previewConfig.logoAlt || 'Atividades Criativas Oficial'}
                            onChange={(e) => handleFieldChange('logoAlt', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-semibold text-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    {/* Banner Content */}
                    {activeSection === 'banner' && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5 bg-blue-50 border border-blue-100 p-3 rounded-xl">
                          <label className="font-black text-[#0E2A79] uppercase text-[10px] tracking-wider">Vincular a Produto Cadastrado</label>
                          <p className="text-[9px] text-slate-400 font-bold mb-1.5">Selecionar um produto altera automaticamente a foto do card e a descrição do banner.</p>
                          <select
                            value={previewConfig.featuredProductId || ''}
                            onChange={(e) => {
                              const pId = e.target.value;
                              const selected = products.find(p => p.id === pId);
                              if (selected) {
                                setPreviewConfig(prev => ({
                                  ...prev,
                                  featuredProductId: pId,
                                  bannerTitleHighlight: selected.name,
                                  bannerDescription: selected.shortDescription || selected.description || prev.bannerDescription,
                                  heroCardImage: selected.mainImageUrl || selected.imageUrl || prev.heroCardImage
                                }));
                                setIsModified(true);
                              } else {
                                handleFieldChange('featuredProductId', pId);
                              }
                            }}
                            className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-800 font-bold cursor-pointer focus:ring-1 focus:ring-[#FF6A1A]"
                          >
                            <option value="">-- Nenhum selecionado --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Selo do Banner</label>
                          <input
                            type="text"
                            value={previewConfig.bannerBadge || 'MATERIAL PEDAGÓGICO OFICIAL'}
                            onChange={(e) => handleFieldChange('bannerBadge', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-semibold text-slate-800"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Início do Título (Prefixo)</label>
                          <input
                            type="text"
                            value={previewConfig.bannerTitlePrefix || ''}
                            onChange={(e) => handleFieldChange('bannerTitlePrefix', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-semibold text-slate-800"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Título Destacado</label>
                          <input
                            type="text"
                            value={previewConfig.bannerTitleHighlight || ''}
                            onChange={(e) => handleFieldChange('bannerTitleHighlight', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-semibold text-slate-800"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Descrição Curta</label>
                          <textarea
                            rows={3}
                            value={previewConfig.bannerDescription || ''}
                            onChange={(e) => handleFieldChange('bannerDescription', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A1A] font-semibold leading-relaxed text-slate-800 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Benefits Section */}
                    {activeSection === 'benefits' && (
                      <div className="space-y-3 bg-slate-50 p-4 rounded-xl text-slate-500 leading-relaxed">
                        <p className="font-bold">A barra de benefícios exibe pilares importantes da marca Atividades Criativas:</p>
                        <ul className="list-disc list-inside space-y-1 text-[11px] font-medium pl-1">
                          <li>Download 100% imediato e pronto para imprimir;</li>
                          <li>Tamanho padrão A4 lúdico;</li>
                          <li>Compra segura via Hotmart com reembolso garantido.</li>
                        </ul>
                        <p className="text-[10px] italic pt-1 text-slate-400">Você pode gerenciar as cores e margens deste bloco nas abas de Aparência e Exibição.</p>
                      </div>
                    )}

                    {/* Why Choose Us Content */}
                    {activeSection === 'why_choose' && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Subtítulo Superior</label>
                          <input
                            type="text"
                            value={previewConfig.whyChooseUsSubtitle || ''}
                            onChange={(e) => handleFieldChange('whyChooseUsSubtitle', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Título Principal</label>
                          <input
                            type="text"
                            value={previewConfig.whyChooseUsTitle || ''}
                            onChange={(e) => handleFieldChange('whyChooseUsTitle', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Descrição Curta</label>
                          <textarea
                            rows={3}
                            value={previewConfig.whyChooseUsDescription || ''}
                            onChange={(e) => handleFieldChange('whyChooseUsDescription', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl leading-relaxed text-slate-800"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-2">
                          <div className="flex flex-col gap-1">
                            <label className="font-bold text-slate-500 text-[9px] uppercase tracking-wider">Criatividade %</label>
                            <input
                              type="number"
                              max={100}
                              value={previewConfig.whyChooseUsCreativity || 0}
                              onChange={(e) => handleFieldChange('whyChooseUsCreativity', Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-800 font-black text-center"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="font-bold text-slate-500 text-[9px] uppercase tracking-wider">Aprendizado %</label>
                            <input
                              type="number"
                              max={100}
                              value={previewConfig.whyChooseUsLearning || 0}
                              onChange={(e) => handleFieldChange('whyChooseUsLearning', Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-800 font-black text-center"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="font-bold text-slate-500 text-[9px] uppercase tracking-wider">Praticidade %</label>
                            <input
                              type="number"
                              max={100}
                              value={previewConfig.whyChooseUsPracticality || 0}
                              onChange={(e) => handleFieldChange('whyChooseUsPracticality', Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-800 font-black text-center"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hotmart Section Content */}
                    {activeSection === 'hotmart' && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Título de Garantia</label>
                          <input
                            type="text"
                            value={previewConfig.hotmartSectionTitle || 'Compra segura e garantia de devolução em até 7 dias'}
                            onChange={(e) => handleFieldChange('hotmartSectionTitle', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Notas de Segurança / Descrição</label>
                          <textarea
                            rows={3}
                            value={previewConfig.hotmartSectionDescription || ''}
                            onChange={(e) => handleFieldChange('hotmartSectionDescription', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl leading-relaxed text-slate-800 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Newsletter Content */}
                    {activeSection === 'newsletter' && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Título de Inscrição / Anúncio</label>
                          <input
                            type="text"
                            value={previewConfig.newsletterTitle || 'Cadastre-se para receber novidades de atividades'}
                            onChange={(e) => handleFieldChange('newsletterTitle', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Subtexto / Descrição</label>
                          <textarea
                            rows={2}
                            value={previewConfig.newsletterDescription || ''}
                            onChange={(e) => handleFieldChange('newsletterDescription', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Texto do Botão</label>
                          <input
                            type="text"
                            value={previewConfig.newsletterButtonText || 'Quero participar'}
                            onChange={(e) => handleFieldChange('newsletterButtonText', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 font-bold"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Link de Destino do Botão</label>
                          <input
                            type="text"
                            value={previewConfig.newsletterButtonUrl || ''}
                            onChange={(e) => handleFieldChange('newsletterButtonUrl', e.target.value)}
                            placeholder="Ex: #destaque-section"
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    {/* Activity Group Content */}
                    {activeSection === 'activity_group' && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Título da Seção</label>
                          <input
                            type="text"
                            value={previewConfig.activityGroupTitle || 'Participe do nosso grupo de atividades'}
                            onChange={(e) => handleFieldChange('activityGroupTitle', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 font-bold"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Descrição</label>
                          <textarea
                            rows={3}
                            value={previewConfig.activityGroupDescription || ''}
                            onChange={(e) => handleFieldChange('activityGroupDescription', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Nota Adicional / Subtexto</label>
                          <input
                            type="text"
                            value={previewConfig.activityGroupNote || ''}
                            onChange={(e) => handleFieldChange('activityGroupNote', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 font-medium"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Texto do Botão</label>
                          <input
                            type="text"
                            value={previewConfig.activityGroupButtonText || 'Entrar no grupo'}
                            onChange={(e) => handleFieldChange('activityGroupButtonText', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 font-extrabold"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Link de Destino (WhatsApp/Telegram)</label>
                          <input
                            type="text"
                            value={previewConfig.activityGroupButtonUrl || ''}
                            onChange={(e) => handleFieldChange('activityGroupButtonUrl', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer Content */}
                    {activeSection === 'footer' && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Manifesto de Rodapé</label>
                          <textarea
                            rows={3}
                            value={previewConfig.footerDescription || 'Atividades lúdicas digitais prontas para impressão para acelerar o aprendizado das crianças.'}
                            onChange={(e) => handleFieldChange('footerDescription', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Cláusula de Isenção Hotmart (Texto Legal)</label>
                          <textarea
                            rows={4}
                            value={previewConfig.footerLegalText || ''}
                            onChange={(e) => handleFieldChange('footerLegalText', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 leading-normal text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Fallback info for lists/unsupported sections in raw text */}
                    {!['promo_bar', 'header', 'banner', 'benefits', 'why_choose', 'hotmart', 'newsletter', 'activity_group', 'footer'].includes(activeSection) && (
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-950">
                        <span className="font-bold text-xs uppercase tracking-wider block mb-1">Seção Baseada em Banco de Dados</span>
                        <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                          Esta seção carrega informações em tempo real do banco de dados (ex: produtos cadastrados, comentários enviados pelos usuários ou categorias criadas).
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2">
                          Selecione as abas <span className="font-bold">"Exibição"</span> para reordenar ou desativar esta seção na Home, ou <span className="font-bold">"Aparência"</span> para ajustar espaçamentos.
                        </p>
                      </div>
                    )}

                  </div>
                )}

                {/* ======================================= */}
                {/* TAB 2: IMAGEM (IMAGE UPLOADS) */}
                {/* ======================================= */}
                {activeTab === 'image' && (
                  <div className="space-y-4">
                    
                    {/* Header Image Upload */}
                    {activeSection === 'header' && (
                      <div className="space-y-4">
                        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                          <label className="font-extrabold text-slate-700 uppercase text-[10px] tracking-wider block mb-1.5">1. Logo Principal (Computador)</label>
                          
                          {/* Logo Preview box */}
                          <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-center max-h-[100px] overflow-hidden mb-3">
                            {previewConfig.logoUrl ? (
                              <img src={previewConfig.logoUrl} alt="Logo principal" className="max-h-[60px] object-contain" />
                            ) : (
                              <span className="text-slate-400 font-bold text-[10px]">Sem logo carregada (Mostrando padrão)</span>
                            )}
                          </div>

                          <input
                            type="file"
                            accept="image/*"
                            ref={logoFileInputRef}
                            onChange={(e) => handleLogoUpload(e, false)}
                            className="hidden"
                          />

                          <button
                            type="button"
                            onClick={() => logoFileInputRef.current?.click()}
                            className="w-full py-2 bg-[#12368F] hover:bg-[#FF6A1A] text-white font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Upload size={12} />
                            Enviar Logo Principal
                          </button>
                        </div>

                        {/* Mobile separate logo toggle */}
                        <div className="border-t border-slate-100 pt-3">
                          <label className="flex items-center gap-2 cursor-pointer pb-2">
                            <input
                              type="checkbox"
                              checked={!!previewConfig.useDifferentMobileLogo}
                              onChange={(e) => handleFieldChange('useDifferentMobileLogo', e.target.checked)}
                              className="rounded border-slate-300 text-[#FF6A1A] focus:ring-0"
                            />
                            <span className="font-extrabold text-slate-600 text-[10px] uppercase tracking-wider">Usar logo diferente no celular</span>
                          </label>

                          {previewConfig.useDifferentMobileLogo && (
                            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl mt-1.5 animate-fadeIn">
                              <label className="font-extrabold text-slate-700 uppercase text-[10px] tracking-wider block mb-1.5">2. Logo Mobile (Celular)</label>
                              
                              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-center max-h-[100px] overflow-hidden mb-3">
                                {previewConfig.mobileLogoUrl ? (
                                  <img src={previewConfig.mobileLogoUrl} alt="Logo celular" className="max-h-[50px] object-contain" />
                                ) : (
                                  <span className="text-slate-400 font-bold text-[10px]">Sem logo mobile (Mostrando padrão)</span>
                                )}
                              </div>

                              <input
                                type="file"
                                accept="image/*"
                                ref={mobileLogoFileInputRef}
                                onChange={(e) => handleLogoUpload(e, true)}
                                className="hidden"
                              />

                              <button
                                type="button"
                                onClick={() => mobileLogoFileInputRef.current?.click()}
                                className="w-full py-2 bg-[#12368F] hover:bg-[#FF6A1A] text-white font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Upload size={12} />
                                Enviar Logo Celular
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Banner Images */}
                    {activeSection === 'banner' && (
                      <div className="space-y-4">
                        
                        {/* 1. Background image */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                          <span className="font-extrabold text-slate-700 uppercase text-[10px] block mb-2">Imagem de Fundo (Widescreen)</span>
                          
                          <div className="w-full h-24 bg-slate-200 rounded-xl overflow-hidden mb-3 relative flex items-center justify-center">
                            {previewConfig.heroBackgroundImage ? (
                              <img src={previewConfig.heroBackgroundImage} className="w-full h-full object-cover" alt="Background" />
                            ) : (
                              <span className="text-slate-400 font-bold text-[10px]">Fundo Padrão (Lúdico)</span>
                            )}
                          </div>

                          <input
                            type="file"
                            accept="image/*"
                            ref={bgFileInputRef}
                            onChange={handleBgImageUpload}
                            className="hidden"
                          />

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => bgFileInputRef.current?.click()}
                              className="flex-1 py-2 bg-[#1E4DDB] hover:bg-[#12368F] text-white font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                            >
                              <Upload size={12} />
                              Trocar Fundo
                            </button>
                            {previewConfig.heroBackgroundImage && (
                              <button
                                type="button"
                                onClick={() => handleFieldChange('heroBackgroundImage', '')}
                                className="px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all"
                              >
                                Limpar
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 2. Product card floating image */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-slate-700 uppercase text-[10px]">Imagem do Card (Destaque)</span>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!previewConfig.hideHeroCardImage}
                                onChange={(e) => handleFieldChange('hideHeroCardImage', e.target.checked)}
                                className="rounded border-slate-300 text-[#FF6A1A] focus:ring-0 cursor-pointer"
                              />
                              <span className="text-[9px] font-black uppercase text-slate-500">Ocultar card</span>
                            </label>
                          </div>

                          {!previewConfig.hideHeroCardImage && (
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Origem da Imagem do Card</label>
                              <select
                                value={previewConfig.bannerImageMode || 'linked'}
                                onChange={(e) => handleFieldChange('bannerImageMode', e.target.value as 'linked' | 'custom')}
                                className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold cursor-pointer text-slate-700 focus:ring-1 focus:ring-[#FF6A1A]"
                              >
                                <option value="linked">Usar imagem do produto selecionado</option>
                                <option value="custom">Usar imagem promocional personalizada</option>
                              </select>
                            </div>
                          )}

                          {!previewConfig.hideHeroCardImage && (
                            previewConfig.bannerImageMode === 'linked' ? (
                              <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-[10px] text-emerald-800 font-semibold space-y-1">
                                <p className="font-bold uppercase tracking-wider text-[9px] text-[#2ca455]">● Modo Produto Vinculado Ativo</p>
                                <p className="leading-relaxed text-slate-600">A imagem do card exibe automaticamente a foto oficial do material selecionado acima para evitar duplicidade e manter a consistência.</p>
                              </div>
                            ) : (
                              <>
                                <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl text-[10px] text-amber-800 font-semibold space-y-1">
                                  <p className="font-bold uppercase tracking-wider text-[9px] text-[#b45309]">● Modo Imagem Personalizada Ativo</p>
                                  <p className="leading-relaxed text-slate-600">Esta imagem promocional é usada exclusivamente no banner e não substituirá a imagem principal oficial do produto cadastrado.</p>
                                </div>

                                <div className="w-24 h-24 bg-slate-200 rounded-xl mx-auto overflow-hidden mb-3 relative flex items-center justify-center">
                                  {previewConfig.heroCardImage ? (
                                    <img src={previewConfig.heroCardImage} className="w-full h-full object-cover" alt="Card" />
                                  ) : (
                                    <span className="text-slate-400 font-bold text-[10px]">Sol Pedagógico</span>
                                  )}
                                </div>

                                <input
                                  type="file"
                                  accept="image/*"
                                  ref={cardFileInputRef}
                                  onChange={handleCardImageUpload}
                                  className="hidden"
                                />

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => cardFileInputRef.current?.click()}
                                    className="flex-1 py-2 bg-[#FF6A1A] hover:bg-[#e0560b] text-white font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                                  >
                                    <Upload size={12} />
                                    Trocar Card
                                  </button>
                                  {previewConfig.heroCardImage && (
                                    <button
                                      type="button"
                                      onClick={() => handleFieldChange('heroCardImage', '')}
                                      className="px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all"
                                    >
                                      Limpar
                                    </button>
                                  )}
                                </div>
                              </>
                            )
                          )}
                        </div>

                      </div>
                    )}

                    {/* Activity Group Image Upload */}
                    {activeSection === 'activity_group' && (
                      <div className="space-y-4">
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                          <ImageFieldEditor
                            field="activityGroupImageUrl"
                            label="Imagem do Grupo (Upload via Cloudflare R2)"
                            recommendation="600 x 600 px"
                            siteConfig={siteConfig}
                            onUpdate={onUpdateSiteConfig}
                            onSuccess={onSuccess}
                            storagePathPrefix="site/activity-group"
                            objectFit="cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Fallback image tab for sections without custom media uploads */}
                    {!['header', 'banner', 'activity_group'].includes(activeSection) && (
                      <div className="bg-slate-50 p-4 rounded-xl text-slate-400 text-center flex flex-col items-center justify-center gap-2 py-8">
                        <ImageIcon size={28} className="stroke-[1.5]" />
                        <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-500">Sem upload de Mídias</span>
                        <p className="text-[10px] leading-relaxed max-w-[250px] mx-auto text-slate-400">
                          Esta seção não possui imagens estáticas diretas. Suas mídias e fotos são sincronizadas a partir dos produtos vinculados.
                        </p>
                      </div>
                    )}

                  </div>
                )}

                {/* ======================================= */}
                {/* TAB 3: APARÊNCIA (COLORS AND SIZES) */}
                {/* ======================================= */}
                {activeTab === 'appearance' && (
                  <div className="space-y-4">
                    
                    {/* Header Logo Sizing Controls */}
                    {activeSection === 'header' && (
                      <div className="space-y-4">
                        <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl space-y-3 text-left">
                          <span className="font-black text-[#FF6A1A] uppercase text-[9px] tracking-wider block mb-1">Ajuste de Tamanho da Logo</span>
                          
                          {/* Desktop width */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-600">
                              <span>Largura no Computador:</span>
                              <span className="font-black text-[#12368F]">{previewConfig.logoDesktopWidth || 220}px</span>
                            </div>
                            <input
                              type="range"
                              min={100}
                              max={400}
                              value={previewConfig.logoDesktopWidth || 220}
                              onChange={(e) => handleFieldChange('logoDesktopWidth', Number(e.target.value))}
                              className="w-full accent-[#FF6A1A] h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          {/* Mobile width */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-600">
                              <span>Largura no Celular:</span>
                              <span className="font-black text-[#12368F]">{previewConfig.logoMobileWidth || 160}px</span>
                            </div>
                            <input
                              type="range"
                              min={80}
                              max={260}
                              value={previewConfig.logoMobileWidth || 160}
                              onChange={(e) => handleFieldChange('logoMobileWidth', Number(e.target.value))}
                              className="w-full accent-[#FF6A1A] h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          {/* Max Height */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-600">
                              <span>Altura Máxima (Ambos):</span>
                              <span className="font-black text-[#12368F]">{previewConfig.logoMaxHeight || 70}px</span>
                            </div>
                            <input
                              type="range"
                              min={30}
                              max={120}
                              value={previewConfig.logoMaxHeight || 70}
                              onChange={(e) => handleFieldChange('logoMaxHeight', Number(e.target.value))}
                              className="w-full accent-[#FF6A1A] h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Margins adjustment box */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                          <span className="font-extrabold text-slate-700 uppercase text-[9px] tracking-wider block">Margens Externas da Logo (Pixels)</span>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-slate-500 font-bold">Margem Superior</span>
                              <input
                                type="number"
                                value={previewConfig.logoMarginTop ?? 0}
                                onChange={(e) => handleFieldChange('logoMarginTop', Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 p-2 rounded-xl text-center font-black"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-slate-500 font-bold">Margem Inferior</span>
                              <input
                                type="number"
                                value={previewConfig.logoMarginBottom ?? 0}
                                onChange={(e) => handleFieldChange('logoMarginBottom', Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 p-2 rounded-xl text-center font-black"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-slate-500 font-bold">Esquerda</span>
                              <input
                                type="number"
                                value={previewConfig.logoMarginLeft ?? 0}
                                onChange={(e) => handleFieldChange('logoMarginLeft', Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 p-2 rounded-xl text-center font-black"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-slate-500 font-bold">Direita</span>
                              <input
                                type="number"
                                value={previewConfig.logoMarginRight ?? 0}
                                onChange={(e) => handleFieldChange('logoMarginRight', Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 p-2 rounded-xl text-center font-black"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 pt-1">
                            <span className="text-[10px] text-slate-500 font-bold">Alinhamento</span>
                            <select
                              value={previewConfig.logoAlignment || 'left'}
                              onChange={(e) => handleFieldChange('logoAlignment', e.target.value)}
                              className="w-full bg-white border border-slate-200 p-2 rounded-xl font-bold cursor-pointer"
                            >
                              <option value="left">Alinhado à Esquerda</option>
                              <option value="center">Centralizado</option>
                              <option value="right">Alinhado à Direita</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Banner gradient options */}
                    {activeSection === 'banner' && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Cor de Fundo / Estilo de Gradiente</label>
                          <select
                            value={previewConfig.bannerBgColor || 'classic'}
                            onChange={(e) => handleFieldChange('bannerBgColor', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-slate-800"
                          >
                            <option value="classic">Azul e Turquesa Clássico (Padrão)</option>
                            <option value="purple">Violeta Lúdico e Magenta</option>
                            <option value="orange">Pôr do Sol Laranja e Amarelo</option>
                            <option value="emerald">Verde Floresta e Esmeralda</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Fallback styling info */}
                    {!['header', 'banner'].includes(activeSection) && (
                      <div className="bg-slate-50 p-4 rounded-xl text-slate-400 text-center">
                        <span className="font-bold text-[10px] uppercase text-slate-500 block mb-1">Cores Globais Sincronizadas</span>
                        <p className="text-[10px] leading-relaxed">
                          Para manter a consistência visual aprovada do Atividades Criativas Oficial, esta seção herda as paletas corporativas de azul profundo, esmeralda, e laranja solar automaticamente.
                        </p>
                      </div>
                    )}

                  </div>
                )}

                {/* ======================================= */}
                {/* TAB 4: EXIBIÇÃO (ORDER AND VISIBILITY) */}
                {/* ======================================= */}
                {activeTab === 'display' && (
                  <div className="space-y-4">
                    
                    {/* Direct Visibility Toggle for active section */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                      <span className="font-extrabold text-slate-700 uppercase text-[10px] block">Controles de Exibição</span>
                      
                      <label className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/60 cursor-pointer hover:bg-slate-50 transition-all select-none">
                        <input
                          type="checkbox"
                          checked={previewConfig.sectionVisibility?.[activeSection!] !== false}
                          onChange={() => toggleSectionVisibilityState(activeSection!)}
                          className="rounded border-slate-300 text-[#FF6A1A] focus:ring-0 cursor-pointer w-4 h-4"
                        />
                        <div className="flex flex-col text-left">
                          <span className="font-black text-slate-800 text-xs uppercase">Seção Visível</span>
                          <span className="text-[10px] text-slate-400 font-bold leading-normal">Exibir este bloco na página inicial do site</span>
                        </div>
                      </label>
                    </div>

                    {/* Layout Reordering Shortcut inside display tab */}
                    {renderLayoutOutlineList()}

                  </div>
                )}

                {/* ======================================= */}
                {/* TAB 5: LINKS (REDIRECTION TARGETS) */}
                {/* ======================================= */}
                {activeTab === 'links' && (
                  <div className="space-y-4">
                    
                    {/* Header Social Links */}
                    {['promo_bar', 'header', 'footer'].includes(activeSection!) && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                            Link do Instagram
                          </label>
                          <input
                            type="url"
                            value={previewConfig.instagramUrl || ''}
                            onChange={(e) => handleFieldChange('instagramUrl', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 text-xs font-semibold"
                            placeholder="https://instagram.com/..."
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Link do Facebook
                          </label>
                          <input
                            type="url"
                            value={previewConfig.facebookUrl || ''}
                            onChange={(e) => handleFieldChange('facebookUrl', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 text-xs font-semibold"
                            placeholder="https://facebook.com/..."
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Link do Canal YouTube
                          </label>
                          <input
                            type="url"
                            value={previewConfig.youtubeChannelUrl || ''}
                            onChange={(e) => handleFieldChange('youtubeChannelUrl', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 text-xs font-semibold"
                            placeholder="https://youtube.com/..."
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            Link do Pinterest
                          </label>
                          <input
                            type="url"
                            value={previewConfig.pinterestUrl || ''}
                            onChange={(e) => handleFieldChange('pinterestUrl', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 text-xs font-semibold"
                            placeholder="https://pinterest.com/..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer Policies */}
                    {activeSection === 'footer' && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Políticas de Privacidade (URL)</label>
                          <input
                            type="text"
                            value={previewConfig.footerPolicyLink || '/politica-de-privacidade'}
                            onChange={(e) => handleFieldChange('footerPolicyLink', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 text-xs font-semibold"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Termos de Uso (URL)</label>
                          <input
                            type="text"
                            value={previewConfig.footerTermsLink || '/termos-de-uso'}
                            onChange={(e) => handleFieldChange('footerTermsLink', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 text-xs font-semibold"
                          />
                        </div>
                      </div>
                    )}

                    {/* General redirection helpers for buttons */}
                    {activeSection === 'banner' && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">Link do Botão Principal</label>
                          <input
                            type="text"
                            value={previewConfig.bannerButtonLink || '#destaque-section'}
                            onChange={(e) => handleFieldChange('bannerButtonLink', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 text-xs font-semibold"
                          />
                        </div>
                      </div>
                    )}

                    {/* Supporting empty states for sections that don't use links */}
                    {!['promo_bar', 'header', 'footer', 'banner'].includes(activeSection!) && (
                      <div className="bg-slate-50 p-4 rounded-xl text-slate-400 text-center flex flex-col items-center justify-center gap-2 py-8">
                        <HelpCircle size={28} className="stroke-[1.5]" />
                        <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-500">Sem Redirecionamentos</span>
                        <p className="text-[10px] leading-relaxed max-w-[250px] mx-auto text-slate-400">
                          Esta seção não possui links, banners de clique externos ou links sociais estáticos customizáveis separadamente.
                        </p>
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}

          </div>

          {/* Action Footer Drawer */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-2 select-none shrink-0">
            {isModified ? (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-100 text-[#FF6A1A] rounded-xl text-[10px] font-black uppercase mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A1A] animate-ping"></span>
                <span>Alterações pendentes de salvamento!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold uppercase mb-1">
                <span>Sem alterações pendentes</span>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={!isModified && !activeSection}
                className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 text-slate-700 rounded-xl font-black text-xs uppercase tracking-wider text-center transition-all cursor-pointer active:scale-95 disabled:pointer-events-none"
              >
                Reverter
              </button>
              
              <button
                type="button"
                onClick={handleSave}
                disabled={!isModified}
                className="flex-1 py-3 bg-[#37C76A] hover:bg-[#2ca455] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-black text-xs uppercase tracking-wider text-center transition-all cursor-pointer shadow-lg shadow-[#37C76A]/10 active:scale-95 flex items-center justify-center gap-1.5 disabled:pointer-events-none"
              >
                <Save size={14} />
                <span>Salvar</span>
              </button>
            </div>
          </div>

        </aside>

      </div>

    </div>
  );
}
