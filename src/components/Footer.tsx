import React from 'react';
import { 
  Mail, 
  Clock, 
  Instagram, 
  Youtube, 
  Facebook, 
  Lock, 
  ArrowUp,
  Heart
} from 'lucide-react';

interface FooterProps {
  onNavigateToSection: (sectionId: string) => void;
  onAdminTrigger?: () => void;
  contactEmail?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeChannelUrl?: string;
  footerLegalText?: string;
  siteConfig?: any;
}

export default function Footer({ 
  onNavigateToSection, 
  onAdminTrigger,
  contactEmail = 'contato@atividadescriativasoficial.com.br',
  instagramUrl = 'https://instagram.com/atividadescriativasoficial',
  facebookUrl = 'https://facebook.com/atividadescriativasoficial',
  youtubeChannelUrl = 'https://youtube.com/atividadescriativasoficial',
  footerLegalText = 'Atividades Criativas Oficial é um site independente de materiais pedagógicos para impressão.',
  siteConfig
}: FooterProps) {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contato-section" className="bg-[#0E2A79] text-white pt-16 pb-8 relative overflow-hidden border-t border-[#1E4DDB]/30">
      {/* Curved design overlay at top boundary */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-transparent pointer-events-none select-none">
        <svg viewBox="0 0 1440 24" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 Q720,24 1440,0 L1440,24 L0,24 Z" fill="#0E2A79" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Main Footer Sitemap Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Brand Column (Grid span 4) */}
          <div className="lg:col-span-4 flex flex-col items-start gap-4 text-left">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer group select-none" 
              onClick={handleScrollTop}
              onDoubleClick={() => onAdminTrigger?.()}
              title="Dê dois cliques para acessar o painel administrativo"
            >
              {siteConfig?.logoUrl ? (
                <img 
                  src={siteConfig.logoUrl} 
                  alt={siteConfig.logoAlt || 'Atividades Criativas Oficial'} 
                  className="object-contain max-h-[50px] max-w-[200px]"
                />
              ) : (
                <>
                  <div className="w-8 h-8 bg-white/10 rounded-full p-1 border border-white/20 group-hover:bg-white/20 transition-all">
                    <svg viewBox="0 0 100 100" className="w-6 h-6">
                      <path d="M 50 65 C 20 40 10 10 45 15 C 50 20 50 20 50 65" fill="#37C76A" opacity="0.85" />
                      <path d="M 50 65 C 80 40 90 10 55 15 C 50 20 50 20 50 65" fill="#1E4DDB" opacity="0.85" />
                      <path d="M 50 65 C 20 55 15 80 45 85 C 50 82 50 82 50 65" fill="#7B61FF" opacity="0.85" />
                      <path d="M 50 65 C 80 55 85 80 55 85 C 50 82 50 82 50 65" fill="#FFD22E" opacity="0.85" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-sm uppercase tracking-wider leading-none">
                      Atividades Criativas
                    </span>
                    <span className="text-[10px] text-[#FFD22E] font-bold tracking-widest leading-none mt-0.5">
                      OFICIAL
                    </span>
                  </div>
                </>
              )}
            </div>

            <p className="text-slate-300 text-xs font-medium leading-relaxed">
              Materiais pedagógicos digitais prontos para imprimir e aplicar. Facilitamos o planejamento escolar com materiais de alfabetização, matemática, coordenação e pareamento lúdico.
            </p>

            {/* Micro badges with brand colors */}
            <div className="flex items-center gap-2 flex-wrap text-[9px] font-bold uppercase text-slate-300">
              <span className="bg-white/10 text-[#FFD22E] px-2.5 py-1 rounded-full border border-white/5">✓ PDF Prático</span>
              <span className="bg-white/10 text-[#37C76A] px-2.5 py-1 rounded-full border border-white/5">✓ Download Imediato</span>
              <span className="bg-white/10 text-green-300 px-2.5 py-1 rounded-full border border-white/5">★ Nota 5 estrelas</span>
            </div>

            {siteConfig?.footerImageUrl && (
              <div className="mt-3 w-full max-w-[240px] aspect-[16/9] bg-white/10 rounded-2xl overflow-hidden border border-white/10">
                <img 
                  src={siteConfig.footerImageUrl} 
                  alt="Ilustrativo Rodapé" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            
            {/* Hidden admin trigger below the rapid download text and badges */}
            <div className="mt-2 min-h-[20px]">
              <button
                onClick={() => onAdminTrigger?.()}
                className="opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-300 text-[10px] text-slate-400 hover:text-[#37C76A] bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded-xl cursor-pointer font-bold uppercase tracking-wider select-none"
                title="Área Administrativa"
              >
                Admin
              </button>
            </div>
          </div>

          {/* LOJA Sitemap (Grid span 2) */}
          <div className="lg:col-span-2 flex flex-col items-start gap-4 text-left">
            <h4 className="font-extrabold text-[#FFD22E] text-xs uppercase tracking-widest border-b border-white/10 pb-2 w-full">
              Loja
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-300 font-medium">
              <li>
                <button onClick={() => onNavigateToSection('destaque-section')} className="hover:text-[#FFD22E] transition-colors">
                  Todos os produtos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('kit-destaque-section')} className="hover:text-[#FFD22E] transition-colors text-left">
                  Kits Completos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('os-mais-queridos-section')} className="hover:text-[#FFD22E] transition-colors text-left">
                  Mais vendidos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('destaque-section')} className="hover:text-[#FFD22E] transition-colors text-left">
                  Novidades
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('destaque-section')} className="hover:text-[#FFD22E] transition-colors text-left">
                  Promoções
                </button>
              </li>
            </ul>
          </div>

          {/* CATEGORIAS Sitemap (Grid span 2) */}
          <div className="lg:col-span-2 flex flex-col items-start gap-4 text-left">
            <h4 className="font-extrabold text-[#FFD22E] text-xs uppercase tracking-widest border-b border-white/10 pb-2 w-full">
              Categorias
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-300 font-medium">
              <li>
                <button onClick={() => onNavigateToSection('categories-section')} className="hover:text-[#FFD22E] transition-colors text-left">
                  Alfabetização
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('categories-section')} className="hover:text-[#FFD22E] transition-colors text-left">
                  Matemática
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('categories-section')} className="hover:text-[#FFD22E] transition-colors text-left">
                  Coordenação motora
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('categories-section')} className="hover:text-[#FFD22E] transition-colors text-left">
                  Atividades com tampinhas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('categories-section')} className="hover:text-[#FFD22E] transition-colors text-left">
                  Datas comemorativas
                </button>
              </li>
            </ul>
          </div>

          {/* AJUDA Sitemap (Grid span 2) */}
          <div className="lg:col-span-2 flex flex-col items-start gap-4 text-left">
            <h4 className="font-extrabold text-[#FFD22E] text-xs uppercase tracking-widest border-b border-white/10 pb-2 w-full">
              Ajuda
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-300 font-medium">
              <li>
                <button onClick={() => onNavigateToSection('hotmart-section')} className="hover:text-[#FFD22E] transition-colors text-left">
                  Como comprar
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('hotmart-section')} className="hover:text-[#FFD22E] transition-colors text-left">
                  Como receber
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('tips-section')} className="hover:text-[#FFD22E] transition-colors text-left">
                  Guia de impressão
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('hotmart-section')} className="hover:text-[#FFD22E] transition-colors text-left">
                  Perguntas frequentes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToSection('hotmart-section')} className="hover:text-[#FFD22E] transition-colors text-left">
                  Garantia e Reembolsos
                </button>
              </li>
            </ul>
          </div>

          {/* CONTATO Sitemap (Grid span 2) */}
          <div className="lg:col-span-2 flex flex-col items-start gap-4 text-left">
            <h4 className="font-extrabold text-[#FFD22E] text-xs uppercase tracking-widest border-b border-white/10 pb-2 w-full">
              Contato
            </h4>
            <div className="flex flex-col gap-3 text-xs text-slate-300 font-medium">
              <a 
                href={`mailto:${contactEmail}`} 
                className="flex items-center gap-1.5 hover:text-[#FFD22E] transition-colors break-all text-left"
              >
                <Mail size={13} className="text-[#FFD22E]" />
                <span>{contactEmail}</span>
              </a>
              
              <div className="flex items-center gap-1.5 text-slate-400 text-left">
                <Clock size={13} className="text-[#FFD22E] shrink-0" />
                <span>Segunda a sexta, das 9h às 18h</span>
              </div>

              {/* Social links row */}
              <div className="flex items-center gap-3 mt-2 border-t border-white/10 pt-3">
                <a 
                  href={instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#FFD22E] hover:scale-110 transition-transform p-1.5 bg-white/10 rounded-full"
                  aria-label="Instagram"
                >
                  <Instagram size={14} />
                </a>
                <a 
                  href={facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#FFD22E] hover:scale-110 transition-transform p-1.5 bg-white/10 rounded-full"
                  aria-label="Facebook"
                >
                  <Facebook size={14} />
                </a>
                <a 
                  href={youtubeChannelUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#FFD22E] hover:scale-110 transition-transform p-1.5 bg-white/10 rounded-full"
                  aria-label="YouTube"
                >
                  <Youtube size={14} />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Decorative pedagogical collage and payment cards row */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Left: payment badges row */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">
              Formas de Pagamento Seguras (Hotmart)
            </span>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Credit Card brand cards placeholders */}
              <span className="bg-white/10 border border-white/5 rounded px-2.5 py-1 text-[9px] font-extrabold tracking-widest uppercase">VISA</span>
              <span className="bg-white/10 border border-white/5 rounded px-2.5 py-1 text-[9px] font-extrabold tracking-widest uppercase">MASTERCARD</span>
              <span className="bg-white/10 border border-white/5 rounded px-2.5 py-1 text-[9px] font-extrabold tracking-widest uppercase">ELO</span>
              <span className="bg-white/10 border border-white/5 rounded px-2.5 py-1 text-[9px] font-extrabold tracking-widest uppercase">AMEX</span>
              <span className="bg-white/10 border border-[#37C76A]/30 rounded px-2.5 py-1 text-[9px] font-extrabold tracking-widest uppercase text-[#37C76A]">PIX</span>
              <span className="bg-white/10 border border-[#FFD22E]/30 rounded px-2.5 py-1 text-[9px] font-extrabold tracking-widest uppercase text-[#FFD22E]">BOLETO</span>
            </div>
          </div>

          {/* Right: SSL Badge */}
          <div className="flex items-center gap-2 bg-[#37C76A]/10 text-[#37C76A] border border-[#37C76A]/20 px-4 py-2 rounded-xl text-xs font-bold uppercase">
            <Lock size={14} className="stroke-[2.5]" />
            <span>CONEXÃO SSL SEGURA</span>
          </div>
        </div>

        {/* Legal and Disclaimer bottom */}
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-bold">
          <div 
            className="text-center sm:text-left leading-relaxed cursor-pointer select-none"
            onDoubleClick={() => onAdminTrigger?.()}
            title="Dê dois cliques aqui para acessar o painel"
          >
            <p>© {new Date().getFullYear()} Atividades Criativas Oficial. Todos os direitos reservados.</p>
            <p className="mt-1">
              {footerLegalText}
            </p>
            <p className="text-[#FFD22E] mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span>Pagamentos e entrega dos produtos pagos realizados de forma 100% segura pela Hotmart.</span>
              <span>•</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdminTrigger?.();
                }}
                className="text-slate-300 hover:text-[#37C76A] underline cursor-pointer font-bold tracking-wider"
              >
                Administração
              </button>
            </p>
          </div>
          
          <button 
            onClick={handleScrollTop}
            className="p-2.5 bg-white/10 text-white hover:bg-[#37C76A] hover:text-white transition-all rounded-full shrink-0 group shadow-lg"
            aria-label="Voltar ao topo"
          >
            <ArrowUp size={14} className="group-hover:-translate-y-0.5 transition-transform stroke-[2.5]" />
          </button>
        </div>

      </div>
    </footer>
  );
}
