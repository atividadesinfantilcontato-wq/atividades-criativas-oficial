import React from 'react';
import { Sparkles } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface MostLovedSectionProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
  title?: string;
  subtitle?: string;
}

export default function MostLovedSection({ products, onSelectProduct, title, subtitle }: MostLovedSectionProps) {
  let lovedProducts: Product[] = [];

  if (title) {
    // If a specific section title is provided, the parent has already filtered the products.
    // Just sort non-demo first and display them directly.
    lovedProducts = [...products]
      .filter(p => p.isActive === true)
      .sort((a, b) => {
        const isDemoA = !!(a as any).isDemo;
        const isDemoB = !!(b as any).isDemo;
        if (isDemoA !== isDemoB) return isDemoA ? 1 : -1;
        return 0;
      })
      .slice(0, 4);
  } else {
    // Default "Most Loved" logic: prioritize best sellers
    const realBestSellers = products.filter(p => p.isActive === true && p.isBestSeller === true && !(p as any).isDemo);
    const demoBestSellers = products.filter(p => p.isActive === true && p.isBestSeller === true && !!(p as any).isDemo);
    const otherRealProducts = products.filter(p => p.isActive === true && !p.isKit && !(p as any).isDemo);
    const otherDemoProducts = products.filter(p => p.isActive === true && !p.isKit && !!(p as any).isDemo);

    const combinedProductsMap = new Map<string, Product>();
    
    realBestSellers.forEach(p => {
      combinedProductsMap.set(p.id, p);
    });
    
    demoBestSellers.forEach(p => {
      if (combinedProductsMap.size >= 4) return;
      combinedProductsMap.set(p.id, p);
    });
    
    otherRealProducts.forEach(p => {
      if (combinedProductsMap.size >= 4) return;
      combinedProductsMap.set(p.id, p);
    });
    
    otherDemoProducts.forEach(p => {
      if (combinedProductsMap.size >= 4) return;
      combinedProductsMap.set(p.id, p);
    });

    lovedProducts = Array.from(combinedProductsMap.values()).slice(0, 4);
  }

  // Custom tags corresponding exactly to the approved layout
  const getLovedTag = (id: string, categoryName?: string) => {
    switch (id) {
      case 'boneca-articulada-menina':
        return { text: 'MAIS VENDIDO', color: 'bg-indigo-500 text-white' };
      case 'alfabeto-ilustrado-completo':
        return { text: 'IDEAL PARA ALFABETIZAÇÃO', color: 'bg-emerald-500 text-white' };
      case 'tampinhas-cores':
        return { text: 'SUCESSO DE VENDAS', color: 'bg-blue-500 text-white' };
      case 'kit-sensorial':
        return { text: 'ESTIMULA OS SENTIDOS', color: 'bg-pink-500 text-white' };
      default:
        return { text: categoryName ? categoryName.toUpperCase() : 'MAIS VENDIDO', color: 'bg-indigo-500 text-white' };
    }
  };

  return (
    <section id="os-mais-queridos-section" className="bg-[#FFFFFF] py-16 border-b border-slate-100 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Title */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="flex items-center gap-1 text-[#37C76A] font-extrabold text-xs tracking-widest uppercase mb-1">
            <span className="text-[#FBBF24]">★</span>
            <span>{subtitle || 'OS MAIS QUERIDOS'}</span>
            <span className="text-[#FBBF24]">★</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-950">
            {title || 'Os mais queridos pelas educadoras'}
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium max-w-xl">
            {title ? 'Materiais pedagógicos com alto engajamento infantil e prontos para uso.' : 'Recursos práticos que são recorde de elogios em salas de aula de todo o país.'}
          </p>
        </div>

        {/* 4 Cards Grid Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {lovedProducts.map((prod) => (
            <div key={prod.id}>
              <ProductCard 
                product={prod} 
                onSelectProduct={onSelectProduct} 
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
