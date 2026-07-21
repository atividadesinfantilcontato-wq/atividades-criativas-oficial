import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowRightCircle } from 'lucide-react';
import { Product, sanitizeProduct } from '../types';
import ProductCard from './ProductCard';
import KitCard from './KitCard';

interface DestaqueSectionProps {
  products: Product[];
  kitProduct: Product | undefined;
  onSelectProduct: (productId: string) => void;
  selectedCategory: string | null;
  searchQuery: string;
  kitImageUrl?: string;
}

export default function DestaqueSection({
  products,
  kitProduct,
  onSelectProduct,
  selectedCategory,
  searchQuery,
  kitImageUrl
}: DestaqueSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Filter products: exclude the main kit from the 5-product grid, filter by category/search if any
  const filteredProducts = products
    .map(p => sanitizeProduct(p))
    .filter(p => {
      // Must be active to appear on public home
      if (p.isActive !== true) return false;

      // If no category and no search, show only featured or show-on-home products in this section
      if (!selectedCategory && !searchQuery) {
        if (p.isFeatured !== true && p.showOnHome !== true) return false;
      }

      // Exclude the vertical kit from general listing so it doesn't repeat immediately
      if (kitProduct && p.id === kitProduct.id) return false;
      
      // Category match
      const matchesCategory = selectedCategory 
        ? (p.category === selectedCategory || p.categoryId === selectedCategory) 
        : true;
      
      // Search query match
      const matchesSearch = searchQuery 
        ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
        
      return matchesCategory && matchesSearch;
    });

  // Sort: prioritize real products, then displayOrder ascending, then createdAt newer first
  let sortedProducts = [...filteredProducts].sort((a, b) => {
    const isDemoA = !!(a as any).isDemo;
    const isDemoB = !!(b as any).isDemo;
    if (isDemoA !== isDemoB) {
      return isDemoA ? 1 : -1; // non-demos first
    }

    const orderA = a.displayOrder !== undefined ? a.displayOrder : (a.order !== undefined ? a.order : 0);
    const orderB = b.displayOrder !== undefined ? b.displayOrder : (b.order !== undefined ? b.order : 0);
    if (orderA !== orderB) return orderA - orderB;
    
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  // Limit to up to 5 products only when NOT filtering or searching (normal showcase view)
  if (!selectedCategory && !searchQuery) {
    sortedProducts = sortedProducts.slice(0, 5);
  }

  // Scroll controls for the products row
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -320,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 320,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="destaque-section" className="bg-[#FDFBF7] py-16 border-b border-slate-100 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header of Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <span className="text-[#37C76A] font-extrabold text-xs tracking-widest uppercase bg-[#37C76A]/10 px-3 py-1 rounded-full">
              MATERIAIS EXCLUSIVOS
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-950 mt-2">
              Atividades em Destaque
            </h2>
            {selectedCategory && (
              <p className="text-[#2ca455] font-bold text-xs mt-1">
                Filtrado por: <span className="underline">{selectedCategory}</span>
              </p>
            )}
          </div>
          
          <button 
            onClick={() => {
              // Smooth scroll to "Os mais queridos" section
              const element = document.getElementById('os-mais-queridos-section');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-700 transition-colors border-2 border-blue-100 hover:border-blue-200 px-4 py-2 rounded-full uppercase shrink-0"
          >
            <span>Ver todos os produtos</span>
            <ArrowRightCircle size={14} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Layout: Grid 12 Columns. 9 cols for products carousel/grid, 3 cols for Kit Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column (Grid span 9) - Products Row with Carousel Controls */}
          <div className="lg:col-span-9 flex flex-col justify-between relative">
            {sortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-2 border-dashed border-slate-200 h-full text-center">
                <span className="text-3xl">🧩</span>
                <h3 className="font-extrabold text-slate-800 text-lg mt-3">Nenhuma atividade encontrada</h3>
                <p className="text-slate-500 text-xs mt-1 max-w-sm">
                  Não encontramos atividades para os termos buscados nesta categoria. Tente limpar os filtros ou faça outra busca!
                </p>
              </div>
            ) : (
              <>
                {/* Carousel container with horizontal scroll */}
                <div className="relative group/nav">
                  {/* Left Arrow Button */}
                  <button 
                    onClick={handleScrollLeft}
                    className="absolute left-[-15px] top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-slate-50 text-slate-950 p-2.5 rounded-full border border-slate-100 shadow-md hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/nav:opacity-100 hover:shadow-lg focus:opacity-100"
                    aria-label="Anterior"
                  >
                    <ArrowLeft size={16} className="stroke-[3]" />
                  </button>

                  {/* Right Arrow Button */}
                  <button 
                    onClick={handleScrollRight}
                    className="absolute right-[-15px] top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-slate-50 text-slate-950 p-2.5 rounded-full border border-slate-100 shadow-md hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/nav:opacity-100 hover:shadow-lg focus:opacity-100"
                    aria-label="Próximo"
                  >
                    <ArrowRight size={16} className="stroke-[3]" />
                  </button>

                  <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-5 pb-6 pt-1 px-1 scroll-smooth snap-x scrollbar-none"
                  >
                    {sortedProducts.map((prod) => (
                      <div 
                        key={prod.id} 
                        className="snap-start shrink-0 w-[240px] md:w-[280px]"
                      >
                        <ProductCard product={prod} onSelectProduct={onSelectProduct} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Micro instructions / indicator */}
                <div className="flex justify-between items-center text-slate-400 text-[10px] font-bold px-1 mt-2">
                  <span>Mostrando {sortedProducts.length} materiais pedagógicos</span>
                  <span className="animate-pulse hidden md:inline">Arrastar para o lado para ver mais ➔</span>
                </div>
              </>
            )}
          </div>

          {/* Right Column (Grid span 3) - Vertical Kit Highlight */}
          {kitProduct && (
            <div id="kit-destaque-section" className="lg:col-span-3">
              <KitCard kitProduct={kitProduct} onSelectProduct={onSelectProduct} kitImageUrl={kitImageUrl} />
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
