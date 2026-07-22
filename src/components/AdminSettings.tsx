import React, { useState } from 'react';
import { 
  Phone, Share2, Shield, Mail, Award, BookOpen, Lock, Check, ChevronLeft, Save, AlertCircle, Sparkles, User, Image, Users, Globe
} from 'lucide-react';
import { SiteConfig, Product } from '../types';
import AdminLogoConfig from './AdminLogoConfig';
import ImageFieldEditor from './ImageFieldEditor';
import AdminImagesSettings from './AdminImagesSettings';

interface AdminSettingsProps {
  siteConfig: SiteConfig;
  onUpdateSiteConfig: (config: SiteConfig) => void;
  onSuccess: (message: string) => void;
  initialSubsection?: SettingsSubsection;
  onSubsectionChange?: (sub: SettingsSubsection) => void;
  products?: Product[];
}

type SettingsSubsection = 'cards' | 'contacts' | 'socials' | 'hotmart' | 'newsletter' | 'brand' | 'policies' | 'security' | 'logo_identity' | 'author' | 'site_images' | 'activity_group' | 'seo_google';

export default function AdminSettings({
  siteConfig,
  onUpdateSiteConfig,
  onSuccess,
  initialSubsection = 'cards',
  onSubsectionChange,
  products = []
}: AdminSettingsProps) {
  const [activeSubsection, setActiveSubsectionState] = useState<SettingsSubsection>(initialSubsection);
  const [config, setConfig] = useState<SiteConfig>({ ...siteConfig });

  const setActiveSubsection = (sub: SettingsSubsection) => {
    setActiveSubsectionState(sub);
    if (onSubsectionChange) {
      onSubsectionChange(sub);
    }
  };

  // Sync state if siteConfig changes externally (only when not editing inside a subsection)
  React.useEffect(() => {
    if (activeSubsection === 'cards') {
      setConfig({ ...siteConfig });
    }
  }, [siteConfig, activeSubsection]);

  // Sync with prop changes (for instance from VisualEditor shortcut)
  React.useEffect(() => {
    if (initialSubsection) {
      setActiveSubsectionState(initialSubsection);
    }
  }, [initialSubsection]);

  // Password / Admin Access States (Local storage synchronized)
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('atividades_oficial_admin_email') || 'atividades@admin.com');
  const [adminPass, setAdminPass] = useState(() => localStorage.getItem('atividades_oficial_admin_password') || 'admin123');
  const [showPass, setShowPass] = useState(false);

  const handleChange = (key: keyof SiteConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety preservation: prevent accidental loss of authorPhotoUrl or authorPhotoStoragePath
    const finalConfig = { ...config };
    if (!finalConfig.authorPhotoUrl && siteConfig.authorPhotoUrl) {
      finalConfig.authorPhotoUrl = siteConfig.authorPhotoUrl;
      finalConfig.authorPhotoStoragePath = siteConfig.authorPhotoStoragePath || '';
    }
    
    onUpdateSiteConfig(finalConfig);
    onSuccess('Configurações atualizadas com sucesso!');
    setActiveSubsection('cards');
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('atividades_oficial_admin_email', adminEmail);
    localStorage.setItem('atividades_oficial_admin_password', adminPass);
    onSuccess('Credenciais de acesso atualizadas com sucesso!');
    setActiveSubsection('cards');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-fadeIn">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Configurações Gerais</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Ajuste os canais de contato, links externos e políticas da loja</p>
        </div>
        
        {activeSubsection !== 'cards' && (
          <button
            type="button"
            onClick={() => setActiveSubsection('cards')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <ChevronLeft size={14} />
            <span>Voltar</span>
          </button>
        )}
      </div>

      {activeSubsection === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
          
          {/* Card 1: Contatos */}
          <button
            type="button"
            onClick={() => setActiveSubsection('contacts')}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs hover:shadow-lg hover:border-[#1E4DDB]/20 text-left transition-all cursor-pointer flex flex-col justify-between group min-h-[160px]"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-blue-50 text-[#12368F] rounded-xl w-fit group-hover:bg-[#12368F] group-hover:text-white transition-all">
                <Phone size={18} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Contatos</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                WhatsApp de atendimento, e-mail de suporte e horário comercial.
              </p>
            </div>
          </button>

          {/* Card 2: Redes sociais */}
          <button
            type="button"
            onClick={() => setActiveSubsection('socials')}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs hover:shadow-lg hover:border-[#1E4DDB]/20 text-left transition-all cursor-pointer flex flex-col justify-between group min-h-[160px]"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl w-fit group-hover:bg-sky-600 group-hover:text-white transition-all">
                <Share2 size={18} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Redes sociais</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Links do Instagram, Facebook, Pinterest e YouTube.
              </p>
            </div>
          </button>

          {/* Card 3: Hotmart */}
          <button
            type="button"
            onClick={() => setActiveSubsection('hotmart')}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs hover:shadow-lg hover:border-[#1E4DDB]/20 text-left transition-all cursor-pointer flex flex-col justify-between group min-h-[160px]"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl w-fit group-hover:bg-orange-600 group-hover:text-white transition-all">
                <Shield size={18} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Hotmart</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Configurar garantia de reembolso, selos e blocos de segurança.
              </p>
            </div>
          </button>

          {/* Card 4: Newsletter */}
          <button
            type="button"
            onClick={() => setActiveSubsection('newsletter')}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs hover:shadow-lg hover:border-[#1E4DDB]/20 text-left transition-all cursor-pointer flex flex-col justify-between group min-h-[160px]"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl w-fit group-hover:bg-rose-600 group-hover:text-white transition-all">
                <Mail size={18} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Newsletter</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Textos do formulário de captura e inscrição de e-mails.
              </p>
            </div>
          </button>

          {/* Card 5: Informações da marca */}
          <button
            type="button"
            onClick={() => setActiveSubsection('brand')}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs hover:shadow-lg hover:border-[#1E4DDB]/20 text-left transition-all cursor-pointer flex flex-col justify-between group min-h-[160px]"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-xl w-fit group-hover:bg-yellow-600 group-hover:text-white transition-all">
                <Award size={18} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Informações da marca</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                PromoText do topo do site, slogan e informações gerais.
              </p>
            </div>
          </button>

          {/* Card 6: Políticas e termos */}
          <button
            type="button"
            onClick={() => setActiveSubsection('policies')}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs hover:shadow-lg hover:border-[#1E4DDB]/20 text-left transition-all cursor-pointer flex flex-col justify-between group min-h-[160px]"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl w-fit group-hover:bg-teal-600 group-hover:text-white transition-all">
                <BookOpen size={18} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Política e termos</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Isenção legal do rodapé, política de privacidade e termos de uso.
              </p>
            </div>
          </button>

          {/* Card 7: Configurações gerais */}
          <button
            type="button"
            onClick={() => setActiveSubsection('security')}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs hover:shadow-lg hover:border-[#1E4DDB]/20 text-left transition-all cursor-pointer flex flex-col justify-between group min-h-[160px]"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl w-fit group-hover:bg-purple-600 group-hover:text-white transition-all">
                <Lock size={18} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Configurações gerais</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Alterar e-mail de acesso e senha de segurança do painel.
              </p>
            </div>
          </button>

          {/* Card 8: Logo e identidade */}
          <button
            type="button"
            onClick={() => setActiveSubsection('logo_identity')}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs hover:shadow-lg hover:border-[#1E4DDB]/20 text-left transition-all cursor-pointer flex flex-col justify-between group min-h-[160px]"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Sparkles size={18} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Logo e identidade</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Alterar a logo do site, favicon, ajustar dimensões e margens responsivas.
              </p>
            </div>
          </button>

          {/* Card 9: Seção da Autora */}
          <button
            type="button"
            onClick={() => setActiveSubsection('author')}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs hover:shadow-lg hover:border-[#37C76A]/20 text-left transition-all cursor-pointer flex flex-col justify-between group min-h-[160px]"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-emerald-50 text-[#37C76A] rounded-xl w-fit group-hover:bg-[#37C76A] group-hover:text-white transition-all">
                <User size={18} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Seção da Autora</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Personalizar a apresentação da autora: foto, biografia, frase e botão.
              </p>
            </div>
          </button>

          {/* Card 10: Imagens do Site */}
          <button
            type="button"
            onClick={() => setActiveSubsection('site_images')}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs hover:shadow-lg hover:border-[#37C76A]/20 text-left transition-all cursor-pointer flex flex-col justify-between group min-h-[160px]"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Image size={18} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Imagens do Site</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Central de imagens: logo, banner principal, kits, fotos e rodapé.
              </p>
            </div>
          </button>

          {/* Card 11: Grupo de Atividades */}
          <button
            type="button"
            onClick={() => setActiveSubsection('activity_group')}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs hover:shadow-lg hover:border-[#37C76A]/20 text-left transition-all cursor-pointer flex flex-col justify-between group min-h-[160px]"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-fit group-hover:bg-amber-600 group-hover:text-white transition-all">
                <Users size={18} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Grupo de Atividades</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Editar título, descrição, nota, imagem, botão e link do grupo de atividades.
              </p>
            </div>
          </button>

          {/* Card 12: SEO e Google */}
          <button
            type="button"
            onClick={() => setActiveSubsection('seo_google')}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs hover:shadow-lg hover:border-[#1E4DDB]/20 text-left transition-all cursor-pointer flex flex-col justify-between group min-h-[160px]"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl w-fit group-hover:bg-sky-600 group-hover:text-white transition-all">
                <Globe size={18} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">SEO e Google</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Cadastrar título SEO, descrição, palavras-chave e imagem de compartilhamento.
              </p>
            </div>
          </button>

        </div>
      )}

      {/* SUB-FORMS */}

      {/* 1. Contatos form */}
      {activeSubsection === 'contacts' && (
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 space-y-6">
          <h3 className="font-black text-slate-800 text-base mb-4">Canais de Contato com Clientes</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">WhatsApp Comercial</label>
              <input
                type="text"
                value={config.whatsappNumber || ''}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="Ex: +55 11 99999-9999"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">E-mail de Suporte</label>
              <input
                type="email"
                value={config.contactEmail || ''}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="suporte@atividadescriativas.com"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Horário de Atendimento Comercial</label>
              <input
                type="text"
                value={config.openingHours || ''}
                onChange={(e) => handleChange('openingHours', e.target.value)}
                placeholder="Ex: Segunda a Sexta, das 09h às 18h"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Save size={14} />
            <span>Salvar Alterações</span>
          </button>
        </form>
      )}

      {/* 2. Redes sociais form */}
      {activeSubsection === 'socials' && (
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 space-y-6">
          <h3 className="font-black text-slate-800 text-base mb-4">Mídias e Redes Sociais</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Link do Instagram</label>
              <input
                type="text"
                value={config.instagramUrl || ''}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/seu_perfil"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Link do Facebook</label>
              <input
                type="text"
                value={config.facebookUrl || ''}
                onChange={(e) => handleChange('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/seu_perfil"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Link do Pinterest</label>
              <input
                type="text"
                value={config.pinterestUrl || ''}
                onChange={(e) => handleChange('pinterestUrl', e.target.value)}
                placeholder="https://pinterest.com/seu_perfil"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Link do canal do YouTube</label>
              <input
                type="text"
                value={config.youtubeChannelUrl || ''}
                onChange={(e) => handleChange('youtubeChannelUrl', e.target.value)}
                placeholder="https://youtube.com/c/seu_canal"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Save size={14} />
            <span>Salvar Alterações</span>
          </button>
        </form>
      )}

      {/* 3. Hotmart form */}
      {activeSubsection === 'hotmart' && (
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 space-y-6">
          <h3 className="font-black text-slate-800 text-base mb-4">Garantia e Selo Hotmart</h3>
          
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <input
                type="checkbox"
                id="hotmartActive"
                checked={config.hotmartSectionIsActive !== false}
                onChange={(e) => handleChange('hotmartSectionIsActive', e.target.checked)}
                className="w-4 h-4 text-[#1E4DDB] border-slate-300 rounded focus:ring-0"
              />
              <label htmlFor="hotmartActive" className="text-xs text-slate-700 font-black cursor-pointer select-none">Ativar seção de Garantia Hotmart no site público</label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Título da Garantia</label>
              <input
                type="text"
                value={config.hotmartSectionTitle || ''}
                onChange={(e) => handleChange('hotmartSectionTitle', e.target.value)}
                placeholder="Ex: Garantia Incondicional de 7 Dias"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Descrição da Garantia / Reembolso Seguro</label>
              <textarea
                rows={4}
                value={config.hotmartSectionDescription || ''}
                onChange={(e) => handleChange('hotmartSectionDescription', e.target.value)}
                placeholder="Explique o direito do consumidor a arrependimento e a segurança de dados de compra."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB] leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Texto do Botão de Ação</label>
              <input
                type="text"
                value={config.hotmartSectionButtonText || ''}
                onChange={(e) => handleChange('hotmartSectionButtonText', e.target.value)}
                placeholder="Ex: Quero Garantir Meu Acesso Seguro"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Save size={14} />
            <span>Salvar Alterações</span>
          </button>
        </form>
      )}

      {/* 4. Newsletter form */}
      {activeSubsection === 'newsletter' && (
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 space-y-6">
          <h3 className="font-black text-slate-800 text-base mb-4">Inscrição de Newsletter</h3>
          
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <input
                type="checkbox"
                id="newsletterActive"
                checked={config.newsletterIsActive !== false}
                onChange={(e) => handleChange('newsletterIsActive', e.target.checked)}
                className="w-4 h-4 text-[#1E4DDB] border-slate-300 rounded focus:ring-0"
              />
              <label htmlFor="newsletterActive" className="text-xs text-slate-700 font-black cursor-pointer select-none">Mostrar caixa de newsletter no rodapé</label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Título da Captura</label>
              <input
                type="text"
                value={config.newsletterTitle || ''}
                onChange={(e) => handleChange('newsletterTitle', e.target.value)}
                placeholder="Ex: Receba Atividades Lúdicas Grátis Toda Semana!"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Descrição da Chamada</label>
              <textarea
                rows={3}
                value={config.newsletterDescription || ''}
                onChange={(e) => handleChange('newsletterDescription', e.target.value)}
                placeholder="Ex: Inscreva seu e-mail e tenha acesso prioritário a novidades lúdicas pedagógicas do nosso ateliê."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB] leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Texto do Botão de Inscrição</label>
              <input
                type="text"
                value={config.newsletterButtonText || ''}
                onChange={(e) => handleChange('newsletterButtonText', e.target.value)}
                placeholder="Ex: Quero Receber Grátis!"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Save size={14} />
            <span>Salvar Alterações</span>
          </button>
        </form>
      )}

      {/* 5. Brand info form */}
      {activeSubsection === 'brand' && (
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 space-y-6">
          <h3 className="font-black text-slate-800 text-base mb-4">Informações da Marca e Slogan</h3>
          
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Barra de Avisos Superior (PromoText)</label>
              <input
                type="text"
                value={config.promoText || ''}
                onChange={(e) => handleChange('promoText', e.target.value)}
                placeholder="Ex: 🎉 PROMOÇÃO EXCLUSIVA: Garanta até 60% de desconto hoje!"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Slogan do Rodapé / Manifesto Curto</label>
              <textarea
                rows={3}
                value={config.footerDescription || ''}
                onChange={(e) => handleChange('footerDescription', e.target.value)}
                placeholder="Ex: Facilitamos a rotina de mães e professores com PDFs lúdicos inovadores, 100% alinhados à BNCC."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB] leading-relaxed"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Save size={14} />
            <span>Salvar Alterações</span>
          </button>
        </form>
      )}

      {/* 6. Políticas e termos form */}
      {activeSubsection === 'policies' && (
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 space-y-6">
          <h3 className="font-black text-slate-800 text-base mb-4">Política de Privacidade e Isenção Legal</h3>
          
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Link de Política de Privacidade</label>
              <input
                type="text"
                value={config.footerPolicyLink || ''}
                onChange={(e) => handleChange('footerPolicyLink', e.target.value)}
                placeholder="https://seu_site.com/politica"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Link de Termos de Uso</label>
              <input
                type="text"
                value={config.footerTermsLink || ''}
                onChange={(e) => handleChange('footerTermsLink', e.target.value)}
                placeholder="https://seu_site.com/termos"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Nota Legal de Isenção do Rodapé</label>
              <textarea
                rows={3}
                value={config.footerLegalText || ''}
                onChange={(e) => handleChange('footerLegalText', e.target.value)}
                placeholder="Ex: Este produto não garante resultados milagrosos. Todo o aprendizado depende do engajamento lúdico da criança..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB] leading-relaxed"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Save size={14} />
            <span>Salvar Alterações</span>
          </button>
        </form>
      )}

      {/* 7. Segurança form */}
      {activeSubsection === 'security' && (
        <form onSubmit={handleSaveSecurity} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 space-y-6">
          <h3 className="font-black text-slate-800 text-base mb-4">Credenciais de Acesso ao Painel</h3>
          
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex gap-3 text-xs">
            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">Aviso Importante:</p>
              <p className="mt-1 font-semibold opacity-90">Estas credenciais são usadas localmente para acessar o painel de administração em seu navegador corrente. Mantenha-as salvas.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">E-mail Administrativo</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Senha de Segurança Master</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold uppercase"
                >
                  {showPass ? 'Ocultar' : 'Revelar'}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Check size={14} />
            <span>Atualizar Credenciais</span>
          </button>
        </form>
      )}

      {/* 8. Logo e identidade form */}
      {activeSubsection === 'logo_identity' && (
        <AdminLogoConfig 
          siteConfig={siteConfig}
          onUpdateSiteConfig={onUpdateSiteConfig}
          onSuccess={onSuccess}
          onBack={() => setActiveSubsection('cards')}
        />
      )}

      {/* 9. Seção da Autora form */}
      {activeSubsection === 'author' && (
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 space-y-6">
          <h3 className="font-black text-slate-800 text-base mb-4">Configuração da Seção da Autora</h3>
          
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <input
                type="checkbox"
                id="authorSectionEnabled"
                checked={config.authorSectionEnabled !== false}
                onChange={(e) => handleChange('authorSectionEnabled', e.target.checked)}
                className="w-4 h-4 text-[#37C76A] border-slate-300 rounded focus:ring-0"
              />
              <label htmlFor="authorSectionEnabled" className="text-xs text-slate-700 font-black cursor-pointer select-none">Habilitar Seção da Autora na Home</label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Título da Seção</label>
              <input
                type="text"
                value={config.authorSectionTitle || ''}
                onChange={(e) => handleChange('authorSectionTitle', e.target.value)}
                placeholder="Ex: Quem está por trás da Creative Activities Oficial"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#37C76A]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Nome / Saudação Principal</label>
              <input
                type="text"
                value={config.authorNameTitle || ''}
                onChange={(e) => handleChange('authorNameTitle', e.target.value)}
                placeholder="Ex: Muito prazer, eu sou a Andreia Silva!"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#37C76A]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Biografia / Apresentação (Suporta parágrafos com Enter)</label>
              <textarea
                rows={6}
                value={config.authorBioText || ''}
                onChange={(e) => handleChange('authorBioText', e.target.value)}
                placeholder="Descreva sua jornada, formações e propósitos da marca..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#37C76A] leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Frase de Destaque / Conclusão</label>
              <input
                type="text"
                value={config.authorHighlightText || ''}
                onChange={(e) => handleChange('authorHighlightText', e.target.value)}
                placeholder="Ex: Seja muito bem-vindo(a) a este espaço de criatividade e transformação!"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#37C76A]"
              />
            </div>

            <div className="flex flex-col gap-1.5 border border-slate-100 rounded-2xl p-4 bg-slate-50/30">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold mb-2">Foto da Autora (Upload para Firebase Storage)</label>
              <ImageFieldEditor
                field="authorPhotoUrl"
                label="Foto de Andreia Silva"
                recommendation="Foto quadrada ou retrato de alta qualidade. Formatos sugeridos: JPG, PNG ou WebP."
                siteConfig={config}
                onUpdate={(updated) => setConfig(updated)}
                onSuccess={onSuccess}
                storagePathPrefix="site/author"
                objectFit="cover"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Texto do Botão de Ação</label>
                <input
                  type="text"
                  value={config.authorButtonText || ''}
                  onChange={(e) => handleChange('authorButtonText', e.target.value)}
                  placeholder="Ex: Conhecer os materiais"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#37C76A]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Ação do Botão</label>
                <select
                  value={config.authorButtonAction || 'scroll'}
                  onChange={(e) => handleChange('authorButtonAction', e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#37C76A]"
                >
                  <option value="scroll">Rolar para Atividades (Home)</option>
                  <option value="shop">Ir para Loja / Topo</option>
                  <option value="hide">Ocultar Botão</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Save size={14} />
            <span>Salvar Alterações</span>
          </button>
        </form>
      )}

      {/* 10. Imagens do Site form */}
      {activeSubsection === 'site_images' && (
        <AdminImagesSettings 
          siteConfig={siteConfig}
          onUpdateSiteConfig={onUpdateSiteConfig}
          onSuccess={onSuccess}
          onBack={() => setActiveSubsection('cards')}
          products={products}
        />
      )}

      {/* 11. Grupo de Atividades form */}
      {activeSubsection === 'activity_group' && (
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 space-y-6">
          <h3 className="font-black text-slate-800 text-base mb-4">Grupo de Atividades</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              {/* Toggle Habilitar */}
              <div className="flex items-center gap-2 select-none bg-slate-50 border border-slate-150 p-4 rounded-xl">
                <input
                  type="checkbox"
                  id="activityGroupEnabled"
                  checked={config.activityGroupEnabled !== false}
                  onChange={(e) => handleChange('activityGroupEnabled', e.target.checked)}
                  className="rounded border-slate-300 text-[#12368F] focus:ring-[#12368F] cursor-pointer h-4 w-4"
                />
                <label htmlFor="activityGroupEnabled" className="text-xs font-extrabold text-slate-750 hover:text-slate-900 cursor-pointer uppercase tracking-wider">
                  Habilitar Seção de Grupo de Atividades no Site
                </label>
              </div>

              {/* Título */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Título do Card</label>
                <input
                  type="text"
                  value={config.activityGroupTitle || ''}
                  onChange={(e) => handleChange('activityGroupTitle', e.target.value)}
                  placeholder="Ex: Participe do nosso grupo de atividades"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
                />
              </div>

              {/* Descrição */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Descrição</label>
                <textarea
                  value={config.activityGroupDescription || ''}
                  onChange={(e) => handleChange('activityGroupDescription', e.target.value)}
                  rows={3}
                  placeholder="Descrição que aparece no convite..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
                />
              </div>

              {/* Note / Benefícios */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Nota / Benefícios (Linha de Apoio)</label>
                <input
                  type="text"
                  value={config.activityGroupNote || ''}
                  onChange={(e) => handleChange('activityGroupNote', e.target.value)}
                  placeholder="Ex: Receba novidades, compartilhe ideias e acompanhe conteúdos especiais."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
                />
              </div>

              {/* Texto do Botão */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Texto do Botão</label>
                <input
                  type="text"
                  value={config.activityGroupButtonText || ''}
                  onChange={(e) => handleChange('activityGroupButtonText', e.target.value)}
                  placeholder="Ex: Entrar no grupo"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
                />
              </div>

              {/* Link do Grupo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Link (URL) do Grupo</label>
                <input
                  type="text"
                  value={config.activityGroupButtonUrl || ''}
                  onChange={(e) => handleChange('activityGroupButtonUrl', e.target.value)}
                  placeholder="Ex: https://chat.whatsapp.com/..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB]"
                />
              </div>

              {/* Abrir em nova aba */}
              <div className="flex items-center gap-2 select-none pt-2">
                <input
                  type="checkbox"
                  id="activityGroupOpenInNewTab"
                  checked={config.activityGroupOpenInNewTab !== false}
                  onChange={(e) => handleChange('activityGroupOpenInNewTab', e.target.checked)}
                  className="rounded border-slate-300 text-[#12368F] focus:ring-[#12368F] cursor-pointer h-4 w-4"
                />
                <label htmlFor="activityGroupOpenInNewTab" className="text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer">
                  Abrir link em uma nova aba do navegador
                </label>
              </div>
            </div>

            {/* Coluna de Imagem */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold block">Foto / Ilustração do Grupo (R2)</label>
              <ImageFieldEditor
                field="activityGroupImageUrl"
                label="Imagem do Grupo"
                recommendation="Imagem quadrada ou paisagem (pelo menos 400x400px), PNG ou JPG."
                siteConfig={config}
                onUpdate={(updatedConfig) => setConfig(updatedConfig)}
                onSuccess={onSuccess}
                storagePathPrefix="site/activity-group"
                objectFit="cover"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[#37C76A] hover:bg-[#2ca455] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Save size={14} />
            <span>Salvar Alterações</span>
          </button>
        </form>
      )}

      {/* 13. SEO e Google Form */}
      {activeSubsection === 'seo_google' && (
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-black text-slate-800 text-base">Otimização para Busca (SEO) e Compartilhamento</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Defina as informações que o Google e redes sociais exibem ao indexar ou compartilhar o seu site.
            </p>
          </div>

          <div className="space-y-5">
            {/* Nome do Site */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Nome Oficial do Site</label>
              <input
                type="text"
                value={config.siteName || ''}
                onChange={(e) => handleChange('siteName', e.target.value)}
                placeholder="Atividades Criativas Oficial"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB] font-semibold"
              />
            </div>

            {/* Título SEO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Título SEO da Aba / Buscas (&lt;title&gt;)</label>
              <input
                type="text"
                value={config.seoTitle || ''}
                onChange={(e) => handleChange('seoTitle', e.target.value)}
                placeholder="Atividades Criativas Oficial | Materiais pedagógicos em PDF para imprimir"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB] font-semibold"
              />
              <span className="text-[10px] text-slate-400 font-medium">Recomendado: 50 a 60 caracteres para não ser cortado no Google.</span>
            </div>

            {/* Descrição SEO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Descrição SEO (Meta Description)</label>
              <textarea
                rows={3}
                value={config.seoDescription || ''}
                onChange={(e) => handleChange('seoDescription', e.target.value)}
                placeholder="Materiais pedagógicos digitais em PDF para imprimir e aplicar com crianças. Atividades criativas para alfabetização..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB] font-medium leading-relaxed"
              />
              <span className="text-[10px] text-slate-400 font-medium">Recomendado: 120 a 160 caracteres com resumo claro da loja.</span>
            </div>

            {/* Palavras-chave */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Palavras-chave (Meta Keywords - separadas por vírgula)</label>
              <textarea
                rows={2}
                value={config.seoKeywords || ''}
                onChange={(e) => handleChange('seoKeywords', e.target.value)}
                placeholder="atividades pedagógicas, atividades para imprimir, alfabetização, PDF infantil, materiais escolares"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB] font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Autor */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Autor / Marca (Meta Author)</label>
                <input
                  type="text"
                  value={config.seoAuthor || ''}
                  onChange={(e) => handleChange('seoAuthor', e.target.value)}
                  placeholder="Atividades Criativas Oficial"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB] font-semibold"
                />
              </div>

              {/* URL Canônica */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">URL Canônica Oficial</label>
                <input
                  type="url"
                  value={config.canonicalUrl || ''}
                  onChange={(e) => handleChange('canonicalUrl', e.target.value)}
                  placeholder="https://atividadescriativasoficial.com.br"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB] font-semibold"
                />
              </div>
            </div>

            {/* Imagem de Compartilhamento (Open Graph) */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold block">Imagem para Redes Sociais / WhatsApp (Cloudflare R2)</label>
              <ImageFieldEditor
                field="seoImageUrl"
                label="Imagem de Compartilhamento (OG Image)"
                recommendation="Proporção ideal: 1200x630 pixels em PNG ou WebP. Esta imagem aparece ao compartilhar o link do site no WhatsApp, Facebook ou Instagram."
                siteConfig={config}
                onUpdate={(updatedConfig) => setConfig(updatedConfig)}
                onSuccess={onSuccess}
                storagePathPrefix="site/seo"
                objectFit="cover"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[#12368F] hover:bg-[#1E4DDB] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer mt-4"
          >
            <Save size={14} />
            <span>Salvar Configurações SEO</span>
          </button>
        </form>
      )}

    </div>
  );
}
