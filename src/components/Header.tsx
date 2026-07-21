import React, { useState } from 'react';
import { Search, ShoppingCart, Menu, X, ArrowRight } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  cartCount: number;
  onOpenCart: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  siteConfig?: any;
}

export default function Header({
  onNavigate,
  currentPage,
  cartCount,
  onOpenCart,
  onSearchChange,
  searchQuery,
  siteConfig
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const handleLinkClick = (sectionId: string, page = 'home') => {
    setMobileMenuOpen(false);
    
    if (page === 'home') {
      onNavigate('home');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } else {
      onNavigate(page);
    }
  };

  return (
    <header id="app-header" className="bg-[#0E2A79] text-white sticky top-0 z-40 shadow-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => handleLinkClick('root')} 
          className="flex items-center gap-2 cursor-pointer group"
          style={{
            justifyContent: siteConfig?.logoAlignment === 'center' ? 'center' : siteConfig?.logoAlignment === 'right' ? 'flex-end' : 'flex-start'
          }}
        >
          {siteConfig?.logoUrl ? (
            <div className="flex items-center">
              {/* Desktop/Tablet Logo */}
              <img 
                src={siteConfig.logoUrl} 
                alt={siteConfig.logoAlt || 'Atividades Criativas Oficial'} 
                className={`object-contain transition-all duration-200 ${siteConfig.useDifferentMobileLogo && siteConfig.mobileLogoUrl ? 'hidden md:block' : 'block'}`}
                style={{
                  width: '100%',
                  maxWidth: `${siteConfig.logoDesktopWidth || 220}px`,
                  maxHeight: `${siteConfig.logoMaxHeight || 70}px`,
                  marginTop: `${siteConfig.logoMarginTop ?? 0}px`,
                  marginBottom: `${siteConfig.logoMarginBottom ?? 0}px`,
                  marginLeft: `${siteConfig.logoMarginLeft ?? 0}px`,
                  marginRight: `${siteConfig.logoMarginRight ?? 0}px`
                }}
              />
              {/* Optional Mobile Custom Logo */}
              {siteConfig.useDifferentMobileLogo && siteConfig.mobileLogoUrl && (
                <img 
                  src={siteConfig.mobileLogoUrl} 
                  alt={siteConfig.logoAlt || 'Atividades Criativas Oficial'} 
                  className="object-contain md:hidden transition-all duration-200 block"
                  style={{
                    width: '100%',
                    maxWidth: `${siteConfig.logoMobileWidth || 160}px`,
                    maxHeight: `${siteConfig.logoMaxHeight || 70}px`,
                    marginTop: `${siteConfig.logoMarginTop ?? 0}px`,
                    marginBottom: `${siteConfig.logoMarginBottom ?? 0}px`,
                    marginLeft: `${siteConfig.logoMarginLeft ?? 0}px`,
                    marginRight: `${siteConfig.logoMarginRight ?? 0}px`
                  }}
                />
              )}
            </div>
          ) : (
            <>
              {/* Logo Mark: Colorful Heart/Butterfly */}
              <div className="relative w-9 h-9 flex items-center justify-center bg-white/10 rounded-full p-1 border border-white/20 group-hover:bg-white/20 transition-all">
                <svg viewBox="0 0 100 100" className="w-7 h-7">
                  {/* Overlapping heart wings */}
                  <path d="M 50 65 C 20 40 10 10 45 15 C 50 20 50 20 50 65" fill="#EF4444" opacity="0.85" />
                  <path d="M 50 65 C 80 40 90 10 55 15 C 50 20 50 20 50 65" fill="#3B82F6" opacity="0.85" />
                  <path d="M 50 65 C 20 55 15 80 45 85 C 50 82 50 82 50 65" fill="#EC4899" opacity="0.85" />
                  <path d="M 50 65 C 80 55 85 80 55 85 C 50 82 50 82 50 65" fill="#FBBF24" opacity="0.85" />
                  {/* Antennae */}
                  <path d="M 48 20 Q 42 5 35 10" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 52 20 Q 58 5 65 10" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="50" cy="40" r="5" fill="#10B981" />
                </svg>
              </div>
              <div className="flex flex-col select-none">
                <span className="font-black text-sm md:text-base tracking-wider uppercase leading-none">
                  Atividades Criativas
                </span>
                <span className="text-[10px] md:text-xs text-[#FFD22E] font-bold tracking-widest leading-none mt-0.5">
                  OFICIAL
                </span>
              </div>
            </>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-6 text-xs md:text-sm font-semibold text-slate-100">
          <button 
            onClick={() => handleLinkClick('root')} 
            className={`hover:text-[#FFD22E] transition-colors ${currentPage === 'home' ? 'text-[#FFD22E] font-bold' : ''}`}
          >
            Início
          </button>
          <button 
            onClick={() => handleLinkClick('destaque-section')} 
            className="hover:text-[#FFD22E] transition-colors"
          >
            Loja
          </button>
          <button 
            onClick={() => handleLinkClick('categories-section')} 
            className="hover:text-[#FFD22E] transition-colors"
          >
            Categorias
          </button>
          <button 
            onClick={() => handleLinkClick('kit-destaque-section')} 
            className="hover:text-[#FFD22E] transition-colors"
          >
            Kits
          </button>
          <button 
            onClick={() => handleLinkClick('destaque-section')} 
            className="hover:text-[#FFD22E] transition-colors"
          >
            Novidades
          </button>
          <button 
            onClick={() => handleLinkClick('os-mais-queridos-section')} 
            className="hover:text-[#FFD22E] transition-colors"
          >
            Mais Vendidos
          </button>
          <button 
            onClick={() => handleLinkClick('hotmart-section')} 
            className="hover:text-[#FFD22E] transition-colors"
          >
            Como Comprar
          </button>

          <button 
            onClick={() => handleLinkClick('contato-section')} 
            className="hover:text-[#FFD22E] transition-colors"
          >
            Contato
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Search bar toggle */}
          <div className="relative flex items-center">
            {showSearchInput && (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar atividades..."
                className="bg-white/10 text-white text-xs md:text-sm px-3 py-1.5 rounded-l-full focus:outline-none focus:ring-1 focus:ring-[#FFD22E] w-36 md:w-48 transition-all border border-white/10"
                autoFocus
              />
            )}
            <button
              onClick={() => {
                setShowSearchInput(!showSearchInput);
                if (showSearchInput && searchQuery) {
                  // Scroll to list of products on home page to show results
                  handleLinkClick('destaque-section');
                }
              }}
              className={`p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors ${showSearchInput ? 'rounded-l-none border-l border-white/10' : ''}`}
              aria-label="Buscar"
            >
              <Search size={16} />
            </button>
          </div>

          {/* List of Interest / Cart */}
          <button 
            onClick={onOpenCart}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors relative"
            aria-label="Lista de interesse"
          >
            <ShoppingCart size={16} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#37C76A] text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </button>



          {/* Mobile menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="xl:hidden bg-[#0E2A79] border-t border-white/10 py-4 px-6 flex flex-col gap-4 animate-fadeIn">
          <button 
            onClick={() => handleLinkClick('root')} 
            className="text-left py-2 hover:text-[#FFD22E] text-sm font-semibold border-b border-white/10"
          >
            Início
          </button>
          <button 
            onClick={() => handleLinkClick('destaque-section')} 
            className="text-left py-2 hover:text-[#FFD22E] text-sm font-semibold border-b border-white/10"
          >
            Loja
          </button>
          <button 
            onClick={() => handleLinkClick('categories-section')} 
            className="text-left py-2 hover:text-[#FFD22E] text-sm font-semibold border-b border-white/10"
          >
            Categorias
          </button>
          <button 
            onClick={() => handleLinkClick('kit-destaque-section')} 
            className="text-left py-2 hover:text-[#FFD22E] text-sm font-semibold border-b border-white/10"
          >
            Kits
          </button>
          <button 
            onClick={() => handleLinkClick('destaque-section')} 
            className="text-left py-2 hover:text-[#FFD22E] text-sm font-semibold border-b border-white/10"
          >
            Novidades
          </button>
          <button 
            onClick={() => handleLinkClick('os-mais-queridos-section')} 
            className="text-left py-2 hover:text-[#FFD22E] text-sm font-semibold border-b border-white/10"
          >
            Mais Vendidos
          </button>
          <button 
            onClick={() => handleLinkClick('hotmart-section')} 
            className="text-left py-2 hover:text-[#FFD22E] text-sm font-semibold border-b border-white/10"
          >
            Como Comprar
          </button>

          <button 
            onClick={() => handleLinkClick('contato-section')} 
            className="text-left py-2 hover:text-[#FFD22E] text-sm font-semibold"
          >
            Contato
          </button>


        </div>
      )}
    </header>
  );
}
