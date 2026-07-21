import React from 'react';
import { Sparkles, ArrowRight, Package } from 'lucide-react';
import { Product } from '../types';
import { isDemoEnvironment } from '../data/demoProducts';
import ProductImage from './ProductImage';

interface KitCardProps {
  kitProduct: Product;
  onSelectProduct: (productId: string) => void;
  kitImageUrl?: string;
}

export default function KitCard({ kitProduct, onSelectProduct, kitImageUrl }: KitCardProps) {
  // Strict data consistency check: ensure all fields rendered belong to this specific product ID
  const isConsistent = React.useMemo(() => {
    if (!kitProduct || !kitProduct.id) {
      console.error("[VALIDATION ERROR] KitProduct is missing an ID or undefined.", kitProduct);
      return false;
    }
    const priceVal = kitProduct.price;
    if (typeof priceVal !== 'number' || isNaN(priceVal) || priceVal < 0) {
      console.error(`[VALIDATION ERROR] KitProduct ${kitProduct.id} has invalid price:`, priceVal);
      return false;
    }
    return true;
  }, [kitProduct]);

  if (!isConsistent) {
    return null;
  }

  const { id, name, shortDescription, pages, price, promoPrice, imageUrl } = kitProduct;

  const hasDiscount = promoPrice !== undefined && promoPrice < price;

  return (
    <div 
      id="kit-highlight-card"
      onClick={() => onSelectProduct(id)}
      className="bg-gradient-to-br from-[#273EEA] to-[#6046E8] text-white rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full group cursor-pointer hover:shadow-[0_30px_60px_-15px_rgba(96,70,232,0.4)] hover:-translate-y-1.5 transition-all duration-300 select-none"
    >
      {/* Absolute Sparkles / Glowing element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 filter blur-2xl rounded-full"></div>
      
      {/* Tag: KIT */}
      <div className="absolute top-4 right-4 bg-[#FFD22E] text-[#0E2A79] font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-md shadow-md flex items-center gap-1 border border-[#F59E0B]">
        <Package size={10} />
        <span>SUPER KIT</span>
      </div>

      <div>
        {/* Banner/Image area for the Kit */}
        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 mb-6 bg-white/15 relative p-2 flex items-center justify-center">
          <ProductImage id={kitImageUrl || imageUrl} className="aspect-auto w-full h-full rounded-xl" fit="contain" />
          {(kitProduct as any).isDemo && isDemoEnvironment() && (
            <div className="absolute top-3 right-3 z-10 bg-slate-900/80 backdrop-blur-sm text-slate-100 font-extrabold text-[8px] tracking-widest uppercase px-2 py-0.5 rounded shadow-sm">
              DEMONSTRAÇÃO
            </div>
          )}
        </div>

        {/* Info */}
        <span className="text-[#FFD22E] font-extrabold text-[10px] tracking-widest uppercase block mb-1">
          RECURSO COMPLETO MULTIDISCIPLINAR
        </span>
        
        <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight mb-2 group-hover:text-[#FFD22E] transition-colors">
          {name}
        </h3>
        
        <p className="text-white/90 text-xs font-medium leading-relaxed mb-6">
          {shortDescription}
        </p>

        {/* Benefits pills with yellow, orange, and pink accents */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="bg-[#FFD22E]/10 text-[#FFD22E] font-extrabold text-[10px] tracking-wide px-3 py-1 rounded-full uppercase border border-[#FFD22E]/20">
            ★ {pages} Páginas
          </span>
          <span className="bg-[#37C76A]/15 text-green-200 font-extrabold text-[10px] tracking-wide px-3 py-1 rounded-full uppercase border border-[#37C76A]/20">
            ✓ 10 Seções BNCC
          </span>
          <span className="bg-[#EC4899]/15 text-pink-200 font-extrabold text-[10px] tracking-wide px-3 py-1 rounded-full uppercase border border-[#EC4899]/20">
            + Bônus Grátis
          </span>
        </div>
      </div>

      {/* Pricing and Button */}
      <div className="border-t border-white/10 pt-4 mt-auto">
        <div className="flex items-baseline gap-2 mb-4">
          {hasDiscount ? (
            <>
              <span className="text-xs text-white/70 line-through font-bold">
                De R$ {price.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-xl font-black text-[#FFD22E]">
                Por R$ {promoPrice!.toFixed(2).replace('.', ',')}
              </span>
            </>
          ) : (
            <span className="text-xl font-black text-white">
              R$ {price.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>

        {/* VER KIT COMPLETO Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSelectProduct(id);
          }}
          className="w-full bg-[#37C76A] hover:bg-[#2ca455] active:scale-95 transition-all text-white font-black text-xs md:text-sm tracking-widest uppercase py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#37C76A]/20"
        >
          <span>VER KIT COMPLETO</span>
          <ArrowRight size={14} className="stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
