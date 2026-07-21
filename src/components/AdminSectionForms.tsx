import React, { useState } from 'react';
import { 
  Save, AlertCircle, Plus, Trash2, Edit3, Check, ToggleLeft, ToggleRight, 
  MessageSquare, Star, Image, ArrowRight, UserCheck, ShieldAlert, Key, 
  Eye, RefreshCw, MailOpen, Phone, Settings, Info, CreditCard, Layers, ArrowUp, ArrowDown,
  Megaphone, HeartHandshake, Grid, PackagePlus, FolderHeart, Sparkles, Mail, Layout, Globe
} from 'lucide-react';
import { SiteConfig, Review, Category } from '../types';
import { INITIAL_CATEGORIES } from '../data';
import ImageFieldEditor from './ImageFieldEditor';

interface AdminSectionFormsProps {
  section: string;
  siteConfig: SiteConfig;
  onUpdateSiteConfig: (config: SiteConfig) => void;
  reviews: Review[];
  onUpdateReviews: (reviews: Review[]) => void;
  onSuccess: (message: string) => void;
  onNavigateToSection?: (section: string) => void;
  onClose?: () => void;
}

export default function AdminSectionForms({
  section,
  siteConfig,
  onUpdateSiteConfig,
  reviews,
  onUpdateReviews,
  onSuccess,
  onNavigateToSection,
  onClose
}: AdminSectionFormsProps) {
  
  // Local states for inputs to prevent cursor jumping
  const [config, setConfig] = useState<SiteConfig>({ ...siteConfig });
  
  // Refresh local config when prop changes
  React.useEffect(() => {
    setConfig({ ...siteConfig });
  }, [siteConfig]);

  // Homepage sections state for visual management
  const [homepageSections, setHomepageSections] = useState(() => {
    const cached = localStorage.getItem('atividades_oficial_homepage_sections');
    const defaults = [
      { id: 'banner', name: 'Banner Principal', icon: 'Megaphone', isActive: true, desc: 'Selo, Títulos, Descrição e Imagem Principal', color: 'bg-blue-100 text-[#12368F]', tab: 'banner' },
      { id: 'benefits', name: 'Benefícios', icon: 'HeartHandshake', isActive: true, desc: 'Email de Suporte, Barra Superior e Pilares', color: 'bg-emerald-100 text-emerald-600', tab: 'benefits' },
      { id: 'categories', name: 'Categorias', icon: 'Grid', isActive: true, desc: 'Gerenciar pranchas, tópicos, ícones e cores', color: 'bg-amber-100 text-amber-600', tab: 'categories' },
      { id: 'destaque', name: 'Produtos em Destaque', icon: 'PackagePlus', isActive: true, desc: 'Filtrar por mais vendidos, novos e destaques', color: 'bg-indigo-100 text-indigo-600', tab: 'products' },
      { id: 'kits', name: 'Kit em Destaque', icon: 'FolderHeart', isActive: true, desc: 'Cadastrar ofertas e combos de PDFs lúdicos', color: 'bg-purple-100 text-purple-600', tab: 'kits' },
      { id: 'why_choose', name: 'Por que escolher', icon: 'Info', isActive: true, desc: 'Configurar subtítulo do Guia de Impressão', color: 'bg-teal-100 text-teal-600', tab: 'tips_content' },
      { id: 'most_loved', name: 'Produtos mais queridos', icon: 'Sparkles', isActive: true, desc: 'Carrossel e seção secundária do catálogo', color: 'bg-yellow-150 text-yellow-700', tab: 'products' },
      { id: 'comments', name: 'Comentários', icon: 'MessageSquare', isActive: true, desc: 'Gerenciar avaliações de mães e professores', color: 'bg-cyan-100 text-cyan-600', tab: 'comments' },
      { id: 'hotmart', name: 'Hotmart', icon: 'CreditCard', isActive: true, desc: 'Customizar bloco de garantia e reembolso seguro', color: 'bg-orange-100 text-orange-600', tab: 'hotmart' },
      { id: 'newsletter', name: 'Seção de Anúncio / Divulgação', icon: 'Megaphone', isActive: true, desc: 'Editar textos do banner promocional', color: 'bg-pink-100 text-pink-600', tab: 'newsletter' },
      { id: 'activity_group', name: 'Grupo de Atividades', icon: 'Users', isActive: true, desc: 'Convidar pessoas para grupo de WhatsApp ou Telegram', color: 'bg-amber-100 text-amber-600', tab: 'activity_group' },
      { id: 'footer', name: 'Rodapé', icon: 'Layout', isActive: true, desc: 'Ajustar termos de uso, políticas e isenção', color: 'bg-slate-100 text-slate-600', tab: 'footer_edit' },
    ];
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Ensure 'activity_group' exists
        if (!parsed.some((p: any) => p.id === 'activity_group')) {
          const idx = parsed.findIndex((p: any) => p.id === 'newsletter');
          if (idx !== -1) {
            parsed.splice(idx + 1, 0, { id: 'activity_group', name: 'Grupo de Atividades', icon: 'Users', isActive: true, desc: 'Convidar pessoas para grupo de WhatsApp ou Telegram', color: 'bg-amber-100 text-amber-600', tab: 'activity_group' });
          } else {
            parsed.push({ id: 'activity_group', name: 'Grupo de Atividades', icon: 'Users', isActive: true, desc: 'Convidar pessoas para grupo de WhatsApp ou Telegram', color: 'bg-amber-100 text-amber-600', tab: 'activity_group' });
          }
          localStorage.setItem('atividades_oficial_homepage_sections', JSON.stringify(parsed));
        }
        // Also update name of 'newsletter' inside cache to show 'Seção de Anúncio / Divulgação'
        const newsletterSec = parsed.find((p: any) => p.id === 'newsletter');
        if (newsletterSec) {
          newsletterSec.name = 'Seção de Anúncio / Divulgação';
          newsletterSec.desc = 'Editar textos do banner promocional';
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing homepage sections", e);
      }
    }
    localStorage.setItem('atividades_oficial_homepage_sections', JSON.stringify(defaults));
    return defaults;
  });

  const handleReorderSection = (index: number, direction: 'up' | 'down') => {
    const newList = [...homepageSections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    
    // Swap
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    
    setHomepageSections(newList);
    localStorage.setItem('atividades_oficial_homepage_sections', JSON.stringify(newList));
    onSuccess('Ordem das seções atualizada!');
  };

  const handleToggleSectionActive = (id: string) => {
    const newList = homepageSections.map(sec => {
      if (sec.id === id) {
        return { ...sec, isActive: !sec.isActive };
      }
      return sec;
    });
    setHomepageSections(newList);
    localStorage.setItem('atividades_oficial_homepage_sections', JSON.stringify(newList));
    onSuccess('Status da seção alterado!');
  };

  const renderSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Megaphone': return <Megaphone size={16} />;
      case 'HeartHandshake': return <HeartHandshake size={16} />;
      case 'Grid': return <Grid size={16} />;
      case 'PackagePlus': return <PackagePlus size={16} />;
      case 'FolderHeart': return <FolderHeart size={16} />;
      case 'Info': return <Info size={16} />;
      case 'Sparkles': return <Sparkles size={16} />;
      case 'MessageSquare': return <MessageSquare size={16} />;
      case 'CreditCard': return <CreditCard size={16} />;
      case 'Mail': return <Mail size={16} />;
      case 'Layout': return <Layout size={16} />;
      default: return <Settings size={16} />;
    }
  };

  // Categories management state (synchronized through localStorage / state config or custom array)
  // Let's load/save categories from a local list cached on local storage
  const [categories, setCategories] = useState<Category[]>(() => {
    const cached = localStorage.getItem('atividades_oficial_categories');
    if (cached) return JSON.parse(cached);
    // fallback to INITIAL_CATEGORIES with counts and colours
    const list: Category[] = INITIAL_CATEGORIES.map(cat => ({
      id: cat.id,
      name: cat.name,
      iconName: cat.iconName || 'Heart',
      count: cat.count || 12,
      color: cat.color || 'bg-amber-500',
      textColor: cat.textColor || 'text-white'
    }));
    localStorage.setItem('atividades_oficial_categories', JSON.stringify(list));
    return list;
  });

  const saveCategories = (list: Category[]) => {
    setCategories(list);
    localStorage.setItem('atividades_oficial_categories', JSON.stringify(list));
  };

  // Review creator state
  const [isCreatingReview, setIsCreatingReview] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRole, setReviewRole] = useState('Mãe / Educadora');
  const [reviewCity, setReviewCity] = useState('');
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewProduct, setReviewProduct] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // Category creator state
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('FileText');
  const [catColor, setCatColor] = useState('bg-blue-500');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // General field change
  const handleChange = (key: keyof SiteConfig, value: any) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
  };

  // Save changes to site config
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSiteConfig(config);
    onSuccess('Configuração atualizada com sucesso!');
  };

  // REVIEWS OPERATIONS
  const handleCreateOrUpdateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      alert('Nome e comentário são obrigatórios!');
      return;
    }

    let updatedReviews: Review[];
    if (editingReviewId) {
      updatedReviews = reviews.map(r => r.id === editingReviewId ? {
        ...r,
        name: reviewName.trim(),
        role: reviewRole.trim(),
        city: reviewCity.trim(),
        stars: reviewStars,
        comment: reviewComment.trim(),
        productName: reviewProduct.trim()
      } : r);
      onSuccess('Comentário atualizado!');
    } else {
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        name: reviewName.trim(),
        role: reviewRole.trim(),
        city: reviewCity.trim(),
        stars: reviewStars,
        comment: reviewComment.trim(),
        productName: reviewProduct.trim(),
        verified: true,
        avatarUrl: reviewName.substring(0, 2).toUpperCase()
      };
      updatedReviews = [newReview, ...reviews];
      onSuccess('Novo comentário adicionado!');
    }

    onUpdateReviews(updatedReviews);
    resetReviewForm();
  };

  const handleEditReview = (rev: Review) => {
    setEditingReviewId(rev.id);
    setReviewName(rev.name);
    setReviewRole(rev.role);
    setReviewCity(rev.city || '');
    setReviewStars(rev.stars);
    setReviewComment(rev.comment);
    setReviewProduct(rev.productName);
    setIsCreatingReview(true);
  };

  const handleDeleteReview = (id: string) => {
    if (!window.confirm('Excluir este depoimento permanentemente?')) return;
    const updated = reviews.filter(r => r.id !== id);
    onUpdateReviews(updated);
    onSuccess('Depoimento removido.');
  };

  const resetReviewForm = () => {
    setIsCreatingReview(false);
    setEditingReviewId(null);
    setReviewName('');
    setReviewRole('Mãe / Educadora');
    setReviewCity('');
    setReviewStars(5);
    setReviewComment('');
    setReviewProduct('');
  };

  // CATEGORIES OPERATIONS
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    let list: Category[];
    if (editingCategoryId) {
      list = categories.map(c => c.id === editingCategoryId ? {
        ...c,
        name: catName.trim(),
        iconName: catIcon,
        color: catColor
      } : c);
      onSuccess('Categoria editada!');
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: catName.trim(),
        iconName: catIcon,
        count: 0,
        color: catColor,
        textColor: 'text-white'
      };
      list = [...categories, newCat];
      onSuccess('Categoria adicionada!');
    }
    saveCategories(list);
    setCatName('');
    setIsCreatingCategory(false);
    setEditingCategoryId(null);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCatName(cat.name);
    setCatIcon(cat.iconName);
    setCatColor(cat.color);
    setIsCreatingCategory(true);
  };

  const handleDeleteCategory = (id: string) => {
    if (!window.confirm('Excluir esta categoria?')) return;
    const list = categories.filter(c => c.id !== id);
    saveCategories(list);
    onSuccess('Categoria excluída.');
  };

  const handleReorderCategory = (index: number, direction: 'up' | 'down') => {
    const list = [...categories];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    
    // swap
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    
    saveCategories(list);
    onSuccess('Ordem alterada!');
  };

  // SETTINGS: Admin credentials updates simulated securely in LocalStorage
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('atividades_oficial_admin_email') || 'atividadesinfantilcontato@gmail.com');
  const [adminPass, setAdminPass] = useState(() => localStorage.getItem('atividades_oficial_admin_pass') || 'admin123@');
  const [showAdminPass, setShowAdminPass] = useState(false);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('atividades_oficial_admin_email', adminEmail);
    localStorage.setItem('atividades_oficial_admin_pass', adminPass);
    onSuccess('Credenciais administrativas atualizadas!');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left p-6 md:p-8">
      
      {/* 1. BANNER PRINCIPAL FORM */}
      {section === 'banner' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-800">Customizar Banner Principal</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Definir títulos e imagens do Hero da Loja</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Selo do Topo (Badge)</label>
              <input
                type="text"
                value={config.bannerBadge || ''}
                onChange={(e) => handleChange('bannerBadge', e.target.value)}
                placeholder="Ex: ⭐ RECURSOS EXCLUSIVOS EM PDF"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Fundo do Banner (Cor / Gradiente)</label>
              <select
                value={config.bannerBgColor || 'gradient-blue-emerald'}
                onChange={(e) => handleChange('bannerBgColor', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
              >
                <option value="gradient-blue-emerald">Azul Profundo a Esmeralda Lúdico</option>
                <option value="gradient-purple-pink">Roxo Magia a Rosa Infância</option>
                <option value="gradient-indigo-violet">Índigo Noite a Violeta</option>
                <option value="bg-white">Branco Minimalista</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Título Principal (Prefixo)</label>
              <input
                type="text"
                value={config.bannerTitlePrefix}
                onChange={(e) => handleChange('bannerTitlePrefix', e.target.value)}
                placeholder="Ex: Atividades em PDF prontas para "
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Palavra Destacada (Destaque Verde)</label>
              <input
                type="text"
                value={config.bannerTitleHighlight}
                onChange={(e) => handleChange('bannerTitleHighlight', e.target.value)}
                placeholder="Ex: imprimir e aplicar!"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Descrição do Banner</label>
              <textarea
                rows={3}
                value={config.bannerDescription}
                onChange={(e) => handleChange('bannerDescription', e.target.value)}
                placeholder="Descrição convincente sobre as atividades e benefícios para pais e professores..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Texto do Botão Principal</label>
              <input
                type="text"
                value={config.bannerButtonText || ''}
                onChange={(e) => handleChange('bannerButtonText', e.target.value)}
                placeholder="Ex: Ver Atividades Disponíveis"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Link do Botão Principal</label>
              <input
                type="text"
                value={config.bannerButtonLink || ''}
                onChange={(e) => handleChange('bannerButtonLink', e.target.value)}
                placeholder="Ex: #destaque-section"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Ilustração Principal do Banner (Manual)</label>
              <input
                type="text"
                value={config.bannerMainImageUrl || ''}
                onChange={(e) => handleChange('bannerMainImageUrl', e.target.value)}
                placeholder="Ex: banner_main_illustration"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2 mt-2">
              <ImageFieldEditor
                field="bannerImageUrl"
                label="Imagem do Banner Principal"
                recommendation="1920 x 900 px"
                siteConfig={siteConfig}
                onUpdate={onUpdateSiteConfig}
                onSuccess={onSuccess}
                storagePathPrefix="site/banner"
                objectFit="cover"
              />
            </div>

            <div className="flex flex-col gap-1.5 justify-center mt-4">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bannerIsActive !== false}
                  onChange={(e) => handleChange('bannerIsActive', e.target.checked)}
                  className="rounded border-slate-300 text-[#37C76A] focus:ring-[#37C76A]"
                />
                <span>Mostrar Banner Ativo na Página Inicial</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg transition-all"
          >
            Salvar Alterações
          </button>
        </form>
      )}

      {/* 2. BENEFÍCIOS FORM */}
      {section === 'benefits' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-800">Destaques & Benefícios (Barra Inicial)</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Definir os textos dos 4 pilares no cabeçalho</p>
          </div>

          <div className="space-y-6 max-w-3xl">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                Os quatro benefícios exibidos no site garantem tranquilidade ao visitante quanto à segurança da compra de produtos digitais, entrega imediata em PDF e qualidade didática. Os pilares padrões já estão pré-configurados e otimizados comercialmente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Email de Suporte Comercial</label>
                <input
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Texto de Promoção da Barra Superior</label>
                <input
                  type="text"
                  value={config.promoText}
                  onChange={(e) => handleChange('promoText', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg transition-all"
          >
            Salvar Alterações
          </button>
        </form>
      )}

      {/* 3. CATEGORIAS FORM */}
      {section === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-800">Categorias Lúdicas</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Visualizar e gerenciar pranchas e tópicos</p>
            </div>
            
            {!isCreatingCategory && (
              <button
                onClick={() => {
                  setEditingCategoryId(null);
                  setCatName('');
                  setCatIcon('FileText');
                  setIsCreatingCategory(true);
                }}
                className="bg-[#FF7A00] text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Nova Categoria</span>
              </button>
            )}
          </div>

          {!isCreatingCategory && (
            <div className="max-w-xl pb-4 border-b border-slate-100">
              <ImageFieldEditor
                field="categoryImageUrl"
                label="Imagem Ilustrativa das Categorias"
                recommendation="500 x 500 px"
                siteConfig={siteConfig}
                onUpdate={onUpdateSiteConfig}
                onSuccess={onSuccess}
                storagePathPrefix="site/category"
                objectFit="contain"
              />
            </div>
          )}

          {isCreatingCategory ? (
            <form onSubmit={handleSaveCategory} className="space-y-5 max-w-xl bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                {editingCategoryId ? 'Editar Categoria' : 'Adicionar Nova Categoria'}
              </h4>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nome da Categoria</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ex: Datas Comemorativas"
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nome do Ícone Lucide</label>
                  <input
                    type="text"
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    placeholder="Ex: Grid, BookOpen, PenTool"
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00] font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Classe de Cor (Tailwind BG)</label>
                  <input
                    type="text"
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                    placeholder="Ex: bg-amber-500"
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00] font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg text-xs font-extrabold uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF7A00] text-white rounded-lg text-xs font-extrabold uppercase"
                >
                  Salvar
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="bg-white border border-slate-150 p-4 rounded-2xl shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 text-white rounded-xl ${cat.color || 'bg-blue-500'}`}>
                      <Layers size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{cat.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{cat.count || 0} Atividades</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleReorderCategory(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:bg-slate-100 text-slate-400 disabled:opacity-30"
                      title="Mover para cima"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleReorderCategory(idx, 'down')}
                      disabled={idx === categories.length - 1}
                      className="p-1 hover:bg-slate-100 text-slate-400 disabled:opacity-30"
                      title="Mover para baixo"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => handleEditCategory(cat)}
                      className="p-1 text-[#0E2A79] hover:bg-blue-50 rounded"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. COMENTÁRIOS / REVIEWS FORM */}
      {section === 'comments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-800">Depoimentos & Avaliações</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Gerenciar comentários de mães e professores na loja</p>
            </div>

            {!isCreatingReview && (
              <button
                onClick={() => {
                  resetReviewForm();
                  setIsCreatingReview(true);
                }}
                className="bg-[#FF7A00] text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Adicionar Depoimento</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form list or Creator Left side */}
            <div className={`${isCreatingReview ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
              {isCreatingReview ? (
                <form onSubmit={handleCreateOrUpdateReview} className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-150">
                  <h4 className="text-xs font-black text-[#0E2A79] uppercase tracking-wider">
                    {editingReviewId ? 'Editar Depoimento' : 'Cadastrar Novo Depoimento'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nome do Autor</label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Ex: Mariana Silva"
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Cidade / Estado</label>
                      <input
                        type="text"
                        value={reviewCity}
                        onChange={(e) => setReviewCity(e.target.value)}
                        placeholder="Ex: São Paulo - SP"
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Cargo / Relação</label>
                      <input
                        type="text"
                        value={reviewRole}
                        onChange={(e) => setReviewRole(e.target.value)}
                        placeholder="Ex: Professora de Educação Infantil"
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Estrelas (Avaliação)</label>
                      <select
                        value={reviewStars}
                        onChange={(e) => setReviewStars(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 Estrelas)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 Estrelas)</option>
                        <option value={3}>⭐⭐⭐ (3 Estrelas)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Produto Vinculado</label>
                      <input
                        type="text"
                        value={reviewProduct}
                        onChange={(e) => setReviewProduct(e.target.value)}
                        placeholder="Ex: Boneco Articulado Menino para Imprimir"
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Depoimento Escrito</label>
                      <textarea
                        rows={3}
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Escreva a avaliação do cliente aqui..."
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={resetReviewForm}
                      className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#37C76A] text-white rounded-lg text-xs font-bold uppercase"
                    >
                      {editingReviewId ? 'Atualizar' : 'Adicionar'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map(rev => (
                    <div key={rev.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-2xs">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-[#0E2A79]">
                              {rev.avatarUrl || 'US'}
                            </div>
                            <div className="text-left leading-none">
                              <h4 className="font-extrabold text-slate-800 text-xs">{rev.name}</h4>
                              <p className="text-[9px] text-slate-400 mt-0.5">{rev.role}</p>
                            </div>
                          </div>
                          <div className="text-yellow-400 flex items-center gap-0.5">
                            {Array.from({ length: rev.stars }).map((_, i) => (
                              <Star key={i} size={11} className="fill-yellow-400" />
                            ))}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 italic line-clamp-3 text-left">"{rev.comment}"</p>
                        {rev.productName && (
                          <p className="text-[9px] text-slate-400 font-mono mt-1 text-left">Item: {rev.productName}</p>
                        )}
                      </div>

                      <div className="border-t border-slate-100 mt-3 pt-2.5 flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditReview(rev)}
                          className="text-[#0E2A79] hover:bg-blue-50 text-[10px] font-bold uppercase px-2 py-1 rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="text-rose-600 hover:bg-rose-50 text-[10px] font-bold uppercase px-2 py-1 rounded"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live review card preview Right side */}
            {isCreatingReview && (
              <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 h-fit">
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4">Prévia do Card na Loja</h4>
                
                <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100 text-left space-y-3">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {Array.from({ length: reviewStars }).map((_, i) => (
                      <Star key={i} size={14} className="fill-yellow-400" />
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    "{reviewComment || 'Seu depoimento aparecerá escrito aqui de forma lúdica...'}"
                  </p>

                  <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                    <div className="w-10 h-10 rounded-full bg-[#FF7A00]/10 text-[#FF7A00] flex items-center justify-center font-extrabold text-sm">
                      {reviewName ? reviewName.substring(0, 2).toUpperCase() : 'AC'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#0E2A79] text-xs flex items-center gap-1">
                        <span>{reviewName || 'Nome do Comprador'}</span>
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-black">✓ Verificado</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                        {reviewRole || 'Mãe e Educadora'} {reviewCity ? `• ${reviewCity}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. HOTMART BAR CONFIG FORM */}
      {section === 'hotmart' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-800">Banner de Compra Segura (Hotmart)</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Customizar o bloco de segurança e garantia de reembolso</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Título Principal da Seção</label>
              <input
                type="text"
                value={config.hotmartSectionTitle}
                onChange={(e) => handleChange('hotmartSectionTitle', e.target.value)}
                placeholder="Ex: Sua compra está totalmente segura!"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Botão de Garantia da Hotmart</label>
              <input
                type="text"
                value={config.hotmartSectionButtonText || 'Quero Garantir Meus Materiais'}
                onChange={(e) => handleChange('hotmartSectionButtonText', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Descrição da Garantia de Satisfação (7 dias)</label>
              <textarea
                rows={4}
                value={config.hotmartSectionDescription}
                onChange={(e) => handleChange('hotmartSectionDescription', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl leading-relaxed"
              />
            </div>
            
            <div className="flex flex-col gap-1.5 justify-center">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.hotmartSectionIsActive !== false}
                  onChange={(e) => handleChange('hotmartSectionIsActive', e.target.checked)}
                  className="rounded border-slate-300 text-[#37C76A]"
                />
                <span>Mostrar Bloco de Segurança Ativo na Loja</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg transition-all"
          >
            Salvar Alterações
          </button>
        </form>
      )}

      {/* 6. NEWSLETTER CONFIG FORM (SEÇÃO DE ANÚNCIO / DIVULGAÇÃO) */}
      {section === 'newsletter' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-800">Seção de Anúncio / Divulgação</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Editar textos do banner promocional</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Título do Convite / Anúncio</label>
              <input
                type="text"
                value={config.newsletterTitle || 'Quer receber atividades gratuitas toda semana?'}
                onChange={(e) => handleChange('newsletterTitle', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Texto do Botão</label>
              <input
                type="text"
                value={config.newsletterButtonText || 'Quero Receber!'}
                onChange={(e) => handleChange('newsletterButtonText', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Link de Destino do Botão</label>
              <input
                type="text"
                value={config.newsletterButtonUrl || ''}
                onChange={(e) => handleChange('newsletterButtonUrl', e.target.value)}
                placeholder="Exemplo: #destaque-section, https://wa.me/... ou qualquer URL"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Parágrafo Informativo / Descrição</label>
              <textarea
                rows={3}
                value={config.newsletterDescription || ''}
                onChange={(e) => handleChange('newsletterDescription', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2 mt-2 max-w-xl">
              <ImageFieldEditor
                field="newsletterImageUrl"
                label="Imagem Ilustrativa do Anúncio"
                recommendation="900 x 500 px"
                siteConfig={siteConfig}
                onUpdate={onUpdateSiteConfig}
                onSuccess={onSuccess}
                storagePathPrefix="site/newsletter"
                objectFit="contain"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg transition-all"
          >
            Salvar Alterações
          </button>
        </form>
      )}

      {/* 6B. GRUPO DE ATIVIDADES CONFIG FORM */}
      {section === 'activity_group' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-800">Grupo de Atividades / Comunidade</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Configurar convite para grupo de WhatsApp, Telegram ou comunidade</p>
          </div>

          {/* Toggle Enabled */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl max-w-4xl">
            <input
              type="checkbox"
              id="activityGroupEnabled"
              checked={config.activityGroupEnabled !== false}
              onChange={(e) => handleChange('activityGroupEnabled', e.target.checked)}
              className="w-4 h-4 text-[#37C76A] rounded border-slate-300 focus:ring-[#37C76A]"
            />
            <label htmlFor="activityGroupEnabled" className="text-xs font-black text-slate-700 uppercase tracking-wider cursor-pointer">
              Exibir esta seção na página inicial
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Título da Seção</label>
              <input
                type="text"
                value={config.activityGroupTitle || ''}
                onChange={(e) => handleChange('activityGroupTitle', e.target.value)}
                placeholder="Ex: Participe do nosso grupo de atividades"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Texto do Botão</label>
              <input
                type="text"
                value={config.activityGroupButtonText || ''}
                onChange={(e) => handleChange('activityGroupButtonText', e.target.value)}
                placeholder="Ex: Entrar no grupo"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Link de Destino do Botão</label>
              <input
                type="text"
                value={config.activityGroupButtonUrl || ''}
                onChange={(e) => handleChange('activityGroupButtonUrl', e.target.value)}
                placeholder="Ex: https://chat.whatsapp.com/..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Descrição da Comunidade</label>
              <textarea
                rows={3}
                value={config.activityGroupDescription || ''}
                onChange={(e) => handleChange('activityGroupDescription', e.target.value)}
                placeholder="Explique o que as pessoas vão encontrar ao entrar no grupo..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Nota / Subtexto de Apoio (Opcional)</label>
              <input
                type="text"
                value={config.activityGroupNote || ''}
                onChange={(e) => handleChange('activityGroupNote', e.target.value)}
                placeholder="Ex: Receba novidades, compartilhe ideias e acompanhe conteúdos especiais."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                id="activityGroupOpenInNewTab"
                checked={config.activityGroupOpenInNewTab !== false}
                onChange={(e) => handleChange('activityGroupOpenInNewTab', e.target.checked)}
                className="w-4 h-4 text-[#37C76A] rounded border-slate-300 focus:ring-[#37C76A]"
              />
              <label htmlFor="activityGroupOpenInNewTab" className="text-xs font-black text-slate-700 uppercase tracking-wider cursor-pointer">
                Abrir link em uma nova aba
              </label>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2 mt-2 max-w-xl">
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

          <button
            type="submit"
            className="px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg transition-all"
          >
            Salvar Alterações
          </button>
        </form>
      )}

      {/* 7. CONTATOS E REDES SOCIAIS FORM */}
      {section === 'contacts_socials' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-800">Contatos e Redes Sociais</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Controlar links sociais e dados de atendimento ao cliente</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">WhatsApp Comercial (Número com DDD)</label>
              <input
                type="text"
                value={config.whatsappNumber || ''}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="Ex: +55 11 99999-9999"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Link do Instagram</label>
              <input
                type="text"
                value={config.instagramUrl}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Link do Facebook</label>
              <input
                type="text"
                value={config.facebookUrl}
                onChange={(e) => handleChange('facebookUrl', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Link do YouTube</label>
              <input
                type="text"
                value={config.youtubeChannelUrl}
                onChange={(e) => handleChange('youtubeChannelUrl', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Link do Pinterest</label>
              <input
                type="text"
                value={config.pinterestUrl || ''}
                onChange={(e) => handleChange('pinterestUrl', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Horário de Atendimento Comercial</label>
              <input
                type="text"
                value={config.openingHours || ''}
                onChange={(e) => handleChange('openingHours', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg transition-all"
          >
            Salvar Alterações
          </button>
        </form>
      )}

      {/* 8. RODAPÉ CONFIG FORM */}
      {section === 'footer_edit' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-800">Rodapé Institucional</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Ajustar termos de uso, políticas e disclaimer da Hotmart</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Descrição da Empresa / Manifesto</label>
              <textarea
                rows={3}
                value={config.footerDescription || ''}
                onChange={(e) => handleChange('footerDescription', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Nota Legal / Isenção de Responsabilidade</label>
              <textarea
                rows={2}
                value={config.footerLegalText}
                onChange={(e) => handleChange('footerLegalText', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Link de Política de Privacidade</label>
              <input
                type="text"
                value={config.footerPolicyLink || ''}
                onChange={(e) => handleChange('footerPolicyLink', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Link de Termos de Uso</label>
              <input
                type="text"
                value={config.footerTermsLink || ''}
                onChange={(e) => handleChange('footerTermsLink', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2 mt-2 max-w-xl">
              <ImageFieldEditor
                field="footerImageUrl"
                label="Imagem Ilustrativa do Rodapé"
                recommendation="1600 x 500 px"
                siteConfig={siteConfig}
                onUpdate={onUpdateSiteConfig}
                onSuccess={onSuccess}
                storagePathPrefix="site/footer"
                objectFit="cover"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg transition-all"
          >
            Salvar Alterações
          </button>
        </form>
      )}

      {/* 9. CONFIGURAÇÕES FORM */}
      {section === 'settings' && (
        <form onSubmit={handleSaveCredentials} className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-800">Configurações Gerais (Acesso Administrativo)</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Alterar e-mail de acesso e senha master de criptografia</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex gap-3 text-xs text-amber-900 max-w-2xl">
            <ShieldAlert size={20} className="text-[#FF7A00] shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">Segurança de Dados local:</p>
              <p className="mt-1">
                Uma vez que as conexões ao Firebase foram recusadas, suas credenciais de e-mail e senha administrativa para abertura do painel ficam salvas de forma segura no <strong>LocalStorage do seu navegador</strong>. Use campos abaixo para alterá-las.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">E-mail Administrativo</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Senha de Acesso Master</label>
              <div className="relative">
                <input
                  type={showAdminPass ? 'text' : 'password'}
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 pr-10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Eye size={15} />
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#FF7A00] hover:bg-[#e06b00] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg transition-all"
          >
            Atualizar Credenciais
          </button>
        </form>
      )}

      {/* 10. KITS FORM */}
      {section === 'kits' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-800">Combinações de Kits</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Cadastrar ofertas de combos de PDFs em um único valor</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 max-w-3xl space-y-3">
            <h4 className="font-extrabold text-slate-800 text-sm">Como gerenciar Kits?</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Todos os kits são mapeados no catálogo de produtos principal. Para criar, duplicar ou gerenciar um Kit, você pode navegar até a aba <strong>Produtos</strong> e marcar a caixa de seleção <strong>“Este é um Kit Completo”</strong> ao cadastrar ou editar! Isso garante que o produto herde automaticamente todos os componentes dinâmicos do catálogo unificado.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  window.location.hash = ''; // reset hash
                  alert('Redirecionando para área de produtos. Marque o checkbox "Este é um Kit Completo".');
                }}
                className="bg-[#0E2A79] text-[#FFD22E] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
              >
                Ir para Cadastro de Produtos
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          <div className="max-w-xl">
            <ImageFieldEditor
              field="kitImageUrl"
              label="Imagem Ilustrativa Geral de Kits"
              recommendation="700 x 900 px"
              siteConfig={siteConfig}
              onUpdate={onUpdateSiteConfig}
              onSuccess={onSuccess}
              storagePathPrefix="site/kit"
              objectFit="contain"
            />
          </div>
        </div>
      )}

      {/* 11. MATERIAIS GRATUITOS FORM */}
      {section === 'free_materials' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-800">Gerenciador de Atividades Gratuitas</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Controlar amostras e recursos com download grátis liberado</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 max-w-3xl space-y-3">
            <h4 className="font-extrabold text-slate-800 text-sm">Download Grátis Liberado</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Os Materiais Gratuitos ficam dispostos no catálogo unificado de produtos do site, mas com um diferencial comercial: seu tipo é configurado como <strong>“Download Grátis” (preço R$ 0,00)</strong>. Isso ativa o botão dinâmico de baixar PDFs sem exigir dados bancários de checkout. Para cadastrar novos materiais de download grátis, basta ir na aba de <strong>Produtos</strong> e selecionar a modalidade correspondente!
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => alert('Redirecionando para área de produtos. Selecione o tipo "Download Grátis".')}
                className="bg-[#37C76A] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg"
              >
                Cadastrar Material Grátis
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. DICAS E CONTEÚDOS FORM */}
      {section === 'tips_content' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-800">Dicas Pedagógicas & Conteúdo</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Configurar subtítulo do Guia de Impressão na loja</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Título do Guia de Escolha</label>
              <input
                type="text"
                value={config.whyChooseUsTitle}
                onChange={(e) => handleChange('whyChooseUsTitle', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Subtítulo do Guia</label>
              <input
                type="text"
                value={config.whyChooseUsSubtitle}
                onChange={(e) => handleChange('whyChooseUsSubtitle', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs md:text-sm p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold">Descrição Completa</label>
              <textarea
                rows={3}
                value={config.whyChooseUsDescription}
                onChange={(e) => handleChange('whyChooseUsDescription', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl leading-relaxed"
              />
            </div>

            {/* Metrics */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nível Estimulação Criatividade (%)</label>
              <input
                type="number"
                value={config.whyChooseUsCreativity}
                onChange={(e) => handleChange('whyChooseUsCreativity', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nível Aprendizado (%)</label>
              <input
                type="number"
                value={config.whyChooseUsLearning}
                onChange={(e) => handleChange('whyChooseUsLearning', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg transition-all"
          >
            Salvar Alterações
          </button>
        </form>
      )}

      {/* 13. PÁGINA INICIAL CONFIG */}
      {section === 'page_initial' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-[#17213F]">Gerenciador da Página Inicial</h2>
            <p className="text-xs text-[#667085] font-bold uppercase tracking-wider mt-1">
              Organize, ative, reordene e edite cada bloco da loja em tempo real
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 text-xs text-blue-900 leading-relaxed">
            <Info size={18} className="text-[#12368F] shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold">Como gerenciar sua Vitrine:</span>
              <p className="mt-1">
                Utilize as setas para mover cada bloco para cima ou para baixo, alterando a ordem visual na loja. 
                Ative ou desative seções conforme suas campanhas, ou clique em <strong>Editar</strong> para ir direto ao 
                formulário específico de conteúdo daquela seção!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {homepageSections.map((sec, idx) => (
              <div 
                key={sec.id} 
                className={`bg-white border border-[#E5EAF2] p-5 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[170px] text-left relative ${
                  !sec.isActive ? 'opacity-65 bg-slate-50/50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${sec.color} shrink-0`}>
                      {renderSectionIcon(sec.icon)}
                    </div>
                    <div>
                      <h4 className="font-black text-[#17213F] text-sm leading-tight">{sec.name}</h4>
                      <p className="text-[10px] text-[#667085] font-semibold mt-0.5 uppercase tracking-wide">Ordem: {idx + 1}º Bloco</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleReorderSection(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:bg-slate-100 text-slate-400 disabled:opacity-30 rounded transition-colors cursor-pointer"
                      title="Mover para cima"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReorderSection(idx, 'down')}
                      disabled={idx === homepageSections.length - 1}
                      className="p-1 hover:bg-slate-100 text-slate-400 disabled:opacity-30 rounded transition-colors cursor-pointer"
                      title="Mover para baixo"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#667085] mt-3 mb-4 leading-relaxed">
                  {sec.desc}
                </p>

                <div className="border-t border-[#E5EAF2] pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleSectionActive(sec.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      sec.isActive 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sec.isActive ? 'bg-green-600' : 'bg-slate-400'}`} />
                    <span>{sec.isActive ? 'Ativo' : 'Inativo'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onClose?.()}
                      className="px-2 py-1.5 hover:bg-slate-50 text-[#667085] rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer"
                      title="Visualizar Site"
                    >
                      <Eye size={12} />
                      <span>Ver</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (sec.tab === 'kits') {
                          onNavigateToSection?.('kits');
                        } else {
                          onNavigateToSection?.(sec.tab);
                        }
                      }}
                      className="px-2.5 py-1.5 bg-[#12368F] text-[#FFD22E] hover:bg-[#143A92] rounded-lg text-[10px] font-extrabold uppercase transition-all flex items-center gap-1 cursor-pointer"
                      title="Editar Seção"
                    >
                      <Edit3 size={12} />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
