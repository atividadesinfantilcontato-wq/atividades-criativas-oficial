import React, { useState, useEffect } from 'react';
import { 
  X, LogOut, ChevronRight, Check, Eye, Layout, Monitor, Smartphone, Tablet, AlertCircle, Sparkles, Menu
} from 'lucide-react';
import { Product, SiteConfig, Review } from '../types';
import AdminSidebar from './AdminSidebar';
import AdminOverview from './AdminOverview';
import AdminProductForm from './AdminProductForm';
import AdminSectionForms from './AdminSectionForms';
import VisualEditor from './VisualEditor';
import AdminSettings from './AdminSettings';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (updatedProducts: Product[]) => void;
  siteConfig: SiteConfig;
  onUpdateSiteConfig: (updatedConfig: SiteConfig) => void;
  reviews: Review[];
  onUpdateReviews: (updatedReviews: Review[]) => void;
  onLogout?: () => void;
  onViewOnSite?: (productId: string) => void;
}

export default function AdminPanel({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
  siteConfig,
  onUpdateSiteConfig,
  reviews,
  onUpdateReviews,
  onLogout,
  onViewOnSite
}: AdminPanelProps) {
  
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Mobile / tablet toggle between edit and view
  const [activeViewMode, setActiveViewMode] = useState<'edit' | 'preview'>('edit');
  
  // Track currently previewed product
  const [previewProductId, setPreviewProductId] = useState<string | null>(null);

  // Track settings initial sub-tab (e.g. logo_identity)
  const [settingsInitialSub, setSettingsInitialSub] = useState<'cards' | 'logo_identity'>('cards');

  // Show a momentary success toast
  const triggerSuccessToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  if (!isOpen) return null;

  // Only sections in AdminSectionForms (such as comments) are split-previewable in this panel
  const isPreviewable = ['comments'].includes(activeTab);

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F7FB] text-slate-800 flex flex-col font-sans overflow-hidden">
      
      {/* Toast alert indicator */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-2xl shadow-xl animate-slideDown">
          <div className="p-1.5 bg-emerald-100 rounded-full">
            <Check size={16} className="stroke-[3] text-emerald-600" />
          </div>
          <span className="font-extrabold text-xs">{successToast}</span>
        </div>
      )}

      {/* Top action header bar */}
      <header className="h-16 bg-white border-b border-[#E5EAF2] px-4 md:px-6 flex items-center justify-between shrink-0 relative z-10 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-600 border border-slate-200 cursor-pointer flex items-center justify-center shrink-0"
            title="Menu lateral"
          >
            <Menu size={18} />
          </button>
 
          {/* Logo or name */}
          <div className="flex items-center gap-2">
            {siteConfig?.logoUrl ? (
              <img 
                src={siteConfig.logoUrl} 
                alt={siteConfig.logoAlt || 'Atividades Criativas'} 
                className="max-h-8 object-contain" 
              />
            ) : (
              <>
                <span className="text-xl">🎨</span>
                <div className="text-left">
                  <h1 className="font-black text-sm md:text-base leading-none text-[#12368F]">Atividades Criativas</h1>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Painel Administrativo Oficial</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2">
          {/* View site as guest */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-extrabold text-[10px] sm:text-xs uppercase py-2.5 px-4 rounded-xl transition-all border border-[#E5EAF2] cursor-pointer active:scale-95"
            title="Visualizar a loja como cliente"
          >
            <Eye size={14} />
            <span className="hidden sm:inline">Visualizar Loja</span>
            <span className="sm:hidden">Ver Loja</span>
          </button>

          {/* Sair button */}
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Deseja realmente sair da sua conta administrativa?')) {
                  onLogout();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-[#E5484D] font-extrabold text-[10px] sm:text-xs uppercase py-2.5 px-4 rounded-xl transition-all border border-red-100 cursor-pointer active:scale-95"
              title="Encerrar sessão de edição"
            >
              <LogOut size={14} />
              <span>Sair</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Admin Workspace container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left fixed/collapsible Sidebar (Sits side-by-side on desktop without overlap) */}
        <AdminSidebar 
          activeSection={activeTab as any}
          onSelectSection={(section) => {
            setActiveTab(section);
            setPreviewProductId(null);
            setActiveViewMode('edit'); // reset view mode
            setSettingsInitialSub('cards'); // reset sub-settings sub-tab
          }}
          onLogout={() => {
            if (onLogout) onLogout();
          }}
          onViewSite={onClose}
          isMobileOpen={isMobileOpen}
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
        />

        {activeTab === 'visual_edit' ? (
          <VisualEditor 
            siteConfig={siteConfig}
            onUpdateSiteConfig={onUpdateSiteConfig}
            products={products}
            reviews={reviews}
            onSuccess={triggerSuccessToast}
            onNavigateToLogoSettings={() => {
              setSettingsInitialSub('logo_identity');
              setActiveTab('settings');
            }}
          />
        ) : (
          <>
            <main className={`flex-1 overflow-y-auto bg-[#F4F7FB] p-6 md:p-8 flex flex-col gap-6 relative transition-all ${
            isPreviewable && activeViewMode === 'preview' ? 'hidden lg:flex' : 'flex'
          } ${isPreviewable ? 'w-full lg:w-[40%] lg:flex-none lg:max-w-[45%] border-r border-[#E5EAF2]' : 'w-full'}`}>
            
            {/* Mobile View Toggle Segment Indicator for previewable tabs */}
            {isPreviewable && (
              <div className="lg:hidden flex bg-slate-200/65 p-1 rounded-2xl w-full select-none shrink-0 border border-slate-300/40">
                <button
                  type="button"
                  onClick={() => setActiveViewMode('edit')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeViewMode === 'edit' ? 'bg-[#12368F] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/40'
                  }`}
                >
                  Editar Conteúdo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewMode('preview')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeViewMode === 'preview' ? 'bg-[#12368F] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/40'
                  }`}
                >
                  Visualizar Prévia
                </button>
              </div>
            )}

            {/* Current Path breadcrumb */}
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-left">
              <span>Administração</span>
              <ChevronRight size={12} />
              <span className="text-[#12368F]">
                {activeTab === 'overview' && 'Início'}
                {activeTab === 'visual_edit' && 'Editar site'}
                {activeTab === 'products' && 'Produtos'}
                {activeTab === 'free_materials' && 'Materiais Gratuitos'}
                {activeTab === 'comments' && 'Comentários e Depoimentos'}
                {activeTab === 'settings' && 'Configurações'}
              </span>
            </div>

            {/* DYNAMIC RENDERING PANELS */}
            {activeTab === 'overview' && (
              <AdminOverview 
                products={products}
                reviews={reviews}
                onNavigateToSection={(section) => setActiveTab(section)}
                onViewSite={onClose}
              />
            )}

            {activeTab === 'settings' && (
              <AdminSettings 
                siteConfig={siteConfig}
                onUpdateSiteConfig={onUpdateSiteConfig}
                onSuccess={triggerSuccessToast}
                initialSubsection={settingsInitialSub}
                onSubsectionChange={(sub) => setSettingsInitialSub(sub as any)}
                products={products}
              />
            )}

          {(activeTab === 'products' || activeTab === 'new_product' || activeTab === 'free_materials') && (
            <AdminProductForm 
              products={products}
              onUpdateProducts={onUpdateProducts}
              initialProductId={previewProductId}
              initialMode={activeTab === 'new_product' ? 'new' : 'list'}
              onBackToOverview={() => setActiveTab('overview')}
              onPreviewProduct={(productId) => {
                // Redirect user to product list with specific item preview
                setPreviewProductId(productId);
                setActiveTab('products');
              }}
              onViewOnSite={onViewOnSite}
              initialFilterType={activeTab === 'free_materials' ? 'free' : 'all'}
              siteConfig={siteConfig}
              onUpdateSiteConfig={onUpdateSiteConfig}
            />
          )}

          {activeTab === 'comments' && (
            <AdminSectionForms 
              section="comments"
              siteConfig={siteConfig}
              onUpdateSiteConfig={onUpdateSiteConfig}
              reviews={reviews}
              onUpdateReviews={onUpdateReviews}
              onSuccess={triggerSuccessToast}
              onNavigateToSection={(section) => {
                setActiveTab(section);
                setPreviewProductId(null);
                setActiveViewMode('edit');
              }}
              onClose={onClose}
            />
          )}

        </main>

        {/* Real-time 60% widescreen split preview or full screen on active tablet/mobile toggle */}
        {isPreviewable && (
          <aside className={`${
            activeViewMode === 'preview' ? 'flex w-full' : 'hidden lg:flex'
          } lg:w-[60%] lg:flex-1 bg-slate-100/60 border-l border-[#E5EAF2] flex-col shrink-0 animate-fadeIn text-left`}>
            
            <div className="p-4 bg-white border-b border-[#E5EAF2] flex items-center justify-between">
              <h3 className="text-xs font-black text-[#12368F] uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={14} className="text-[#FF6A1A]" />
                Visualização em Tempo Real (60%)
              </h3>
              
              {/* Device indicators */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                <button 
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded text-slate-500 hover:text-[#12368F] cursor-pointer ${previewDevice === 'desktop' ? 'bg-white text-[#12368F] shadow-xs font-bold' : ''}`}
                  title="Tela de Computador"
                >
                  <Monitor size={12} />
                </button>
                <button 
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-1.5 rounded text-slate-500 hover:text-[#12368F] cursor-pointer ${previewDevice === 'tablet' ? 'bg-white text-[#12368F] shadow-xs font-bold' : ''}`}
                  title="Tela de Tablet"
                >
                  <Tablet size={12} />
                </button>
                <button 
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded text-slate-500 hover:text-[#12368F] cursor-pointer ${previewDevice === 'mobile' ? 'bg-white text-[#12368F] shadow-xs font-bold' : ''}`}
                  title="Tela de Celular"
                >
                  <Smartphone size={12} />
                </button>
              </div>
            </div>

            {/* Simulated interactive frame viewport */}
            <div className="flex-1 p-5 lg:p-8 bg-slate-200/45 overflow-y-auto flex items-center justify-center">
              <div className={`bg-white rounded-3xl shadow-xl border border-[#E5EAF2] overflow-hidden transition-all ${
                previewDevice === 'mobile' ? 'w-64 aspect-[9/16]' : previewDevice === 'tablet' ? 'w-96 aspect-[3/4]' : 'w-full max-w-2xl h-full max-h-[500px]'
              }`}>
                {/* Banner preview element inside frame */}
                {activeTab === 'banner' && (
                  <div className={`p-8 text-white h-full flex flex-col justify-center relative overflow-hidden ${
                    siteConfig.bannerBgColor === 'gradient-purple-pink' ? 'bg-gradient-to-r from-purple-600 to-pink-500' : 
                    siteConfig.bannerBgColor === 'gradient-indigo-violet' ? 'bg-gradient-to-r from-[#12368F] to-violet-600' : 'bg-gradient-to-r from-[#12368F] to-[#20A957]'
                  }`}>
                    {/* Background decoration */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                    <span className="text-[9px] bg-white/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider self-start mb-3 border border-white/10">{siteConfig.bannerBadge || 'PDF'}</span>
                    <h2 className="text-base sm:text-lg font-black leading-tight text-left">
                      {siteConfig.bannerTitlePrefix} <span className="text-[#FFD22E]">{siteConfig.bannerTitleHighlight}</span>
                    </h2>
                    <p className="text-[11px] opacity-80 mt-3 line-clamp-4 text-left font-medium leading-relaxed max-w-md">{siteConfig.bannerDescription}</p>
                    <button type="button" className="mt-5 bg-[#FF6A1A] text-white py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider w-fit border border-orange-500 shadow-md">
                      {siteConfig.bannerButtonText || 'Ver Atividades'}
                    </button>
                  </div>
                )}

                {/* Newsletter preview */}
                {activeTab === 'newsletter' && (
                  <div className="p-8 bg-[#12368F] text-white h-full flex flex-col justify-center text-center space-y-4">
                    <span className="text-2xl mx-auto">📧</span>
                    <h3 className="font-black text-sm">{siteConfig.newsletterTitle || 'Quer atividades grátis toda semana?'}</h3>
                    <p className="text-[10px] opacity-75 leading-relaxed max-w-xs mx-auto font-medium">{siteConfig.newsletterDescription || 'Inscreva-se e receba em primeira mão!'}</p>
                    <div className="space-y-2.5 max-w-xs mx-auto w-full">
                      <input type="text" disabled placeholder="Seu e-mail lúdico..." className="w-full bg-white/10 text-[10px] p-2.5 rounded-xl border border-white/15" />
                      <button type="button" className="w-full bg-[#FF6A1A] text-white text-[10px] font-black uppercase py-2.5 rounded-xl">Inscrever-se</button>
                    </div>
                  </div>
                )}

                {/* Reviews list default state */}
                {activeTab === 'comments' && (
                  <div className="p-6 space-y-4 h-full overflow-y-auto bg-slate-50/50">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-[#E5EAF2] pb-1.5 text-left">Depoimentos Recentes</h4>
                    <div className="space-y-3">
                      {reviews.slice(0, 3).map(rev => (
                        <div key={rev.id} className="bg-white p-4 rounded-2xl border border-[#E5EAF2] space-y-2 text-left shadow-2xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#FF6A1A]/10 text-[#FF6A1A] font-black text-[10px] flex items-center justify-center border border-orange-100">{rev.name.substring(0,2).toUpperCase()}</div>
                            <div className="leading-none">
                              <h5 className="font-extrabold text-[10px] text-slate-800">{rev.name}</h5>
                              <span className="text-[8px] text-slate-400 font-bold">{rev.role}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-600 italic">"{rev.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hotmart guarantee preview */}
                {activeTab === 'hotmart' && (
                  <div className="p-6 bg-slate-50 text-slate-850 h-full flex flex-col justify-center text-left space-y-4 overflow-y-auto">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex gap-3 text-[11px] text-[#20A957]">
                      <span className="text-lg">🛡️</span>
                      <div>
                        <h4 className="font-extrabold uppercase tracking-wider text-emerald-800 leading-none">Compra 100% Segura</h4>
                        <p className="opacity-80 mt-1 leading-normal font-medium">Seu pagamento será processado de forma totalmente segura pela Hotmart.</p>
                      </div>
                    </div>
                    <h3 className="font-black text-[#12368F] text-sm leading-tight">{siteConfig.hotmartSectionTitle || 'Garantia Incondicional'}</h3>
                    <p className="text-[11px] text-[#667085] leading-normal">{siteConfig.hotmartSectionDescription || 'Você tem até 7 dias para testar todo o material. Se não gostar, devolvemos todo o seu dinheiro!'}</p>
                    
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-[10px] text-slate-600 font-semibold">
                        <span className="text-[#20A957] font-bold">✓</span> <span>Acesso imediato ao PDF completo</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-600 font-semibold">
                        <span className="text-[#20A957] font-bold">✓</span> <span>Suporte prioritário via WhatsApp</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-600 font-semibold">
                        <span className="text-[#20A957] font-bold">✓</span> <span>Garantia de atualização vitalícia</span>
                      </div>
                    </div>

                    <button type="button" className="w-full bg-[#FF6A1A] text-white text-[10px] font-black uppercase py-3 rounded-xl shadow-md mt-4 border border-orange-500">
                      {siteConfig.hotmartSectionButtonText || 'Quero Garantir Meu PDF'}
                    </button>
                  </div>
                )}

              </div>
            </div>
          </aside>
        )}
          </>
        )}

      </div>

    </div>
  );
}
