import React from 'react';
import { Sparkles } from 'lucide-react';
import { Product } from '../types';
import { isDemoEnvironment } from '../data/demoProducts';
import ProductImage from './ProductImage';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (productId: string) => void;
}

export default function ProductCard({ product, onSelectProduct }: ProductCardProps) {
  // Strict data consistency check: ensure all fields rendered belong to this specific product ID
  const isConsistent = React.useMemo(() => {
    if (!product || !product.id) {
      console.error("[VALIDATION ERROR] Product is missing an ID or undefined.", product);
      return false;
    }
    const priceVal = product.price;
    if (typeof priceVal !== 'number' || isNaN(priceVal) || priceVal < 0) {
      console.error(`[VALIDATION ERROR] Product ${product.id} has invalid price:`, priceVal);
      return false;
    }
    const activeImg = product.mainImageUrl || product.imageUrl;
    if (activeImg !== product.mainImageUrl && activeImg !== product.imageUrl) {
      console.error(`[VALIDATION ERROR] Product ${product.id} has mismatched image fields:`, { activeImg, mainImageUrl: product.mainImageUrl, imageUrl: product.imageUrl });
      return false;
    }
    return true;
  }, [product]);

  if (!isConsistent) {
    return null;
  }

  const { name, tag, tagColor, ageRange, pages, price, promoPrice, imageUrl, mainImageUrl, category } = product;

  // Set tag style classes
  const getTagStyle = () => {
    switch (tagColor) {
      case 'red':
        return 'bg-red-500 text-white';
      case 'green':
        return 'bg-emerald-500 text-white';
      case 'blue':
        return 'bg-blue-500 text-white';
      case 'yellow':
        return 'bg-[#FBBF24] text-slate-950';
      default:
        return 'bg-[#37C76A] text-white';
    }
  };

  const hasDiscount = promoPrice !== undefined && promoPrice < price;

  return (
    <div 
      id={`product-card-${product.id}`}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1.5 duration-300 flex flex-col justify-between overflow-hidden group h-full cursor-pointer select-none"
      onClick={() => onSelectProduct(product.id)}
    >
      {/* Product Image & Tag */}
      <div className="relative overflow-hidden w-full aspect-square bg-slate-50/50 p-2 flex items-center justify-center">
        {tag && (
          <div className={`absolute top-2 left-2 z-10 font-extrabold text-[8px] tracking-wider uppercase px-2 py-0.5 rounded shadow-sm flex items-center gap-1 ${getTagStyle()}`}>
            {tag === 'MAIS VENDIDO' && <Sparkles size={8} className="fill-current" />}
            <span>{tag}</span>
          </div>
        )}

        {(product as any).isDemo && isDemoEnvironment() && (
          <div className="absolute top-2 right-2 z-10 bg-slate-900/80 backdrop-blur-sm text-slate-100 font-extrabold text-[8px] tracking-widest uppercase px-2 py-0.5 rounded shadow-sm">
            DEMONSTRAÇÃO
          </div>
        )}
        
        {/* Render product image with contain fit to avoid any cropping */}
        <ProductImage id={mainImageUrl || imageUrl} className="group-hover:scale-102 transition-transform duration-500" fit="contain" />
        
        {/* Hover quick overlay */}
        <div className="absolute inset-0 bg-slate-950/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/95 text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow-md transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
            Ver Detalhes
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-grow flex flex-col justify-between gap-2.5">
        <div>
          {/* Metadata line: Category • Quantity of PDFs */}
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1 flex-wrap">
            <span>{category || 'Atividade'}</span>
            <span>•</span>
            <span>{pages} {pages === 1 ? 'PDF' : 'PDFs'}</span>
            {ageRange && (
              <>
                <span>•</span>
                <span className="text-indigo-500 font-extrabold">{ageRange}</span>
              </>
            )}
          </div>

          {/* Product Name */}
          <h3 className="text-xs md:text-sm font-extrabold text-slate-900 group-hover:text-[#37C76A] transition-colors mt-1 leading-snug line-clamp-2 min-h-[2.5rem] flex items-start pt-0.5">
            {name}
          </h3>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2 border-t border-slate-100/60 flex items-center justify-between gap-1">
          {/* Prices */}
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-[9px] font-bold text-slate-400 line-through leading-none mb-0.5">
                  De: R$ {price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-sm md:text-base font-black text-[#37C76A] leading-none">
                  Por: R$ {promoPrice!.toFixed(2).replace('.', ',')}
                </span>
              </>
            ) : (
              <span className="text-sm md:text-base font-black text-slate-900 leading-none">
                R$ {price.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>

          {/* Ver detalhes button */}
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent duplicate trigger
              onSelectProduct(product.id);
            }}
            className="bg-[#37C76A] hover:bg-[#2ca455] active:scale-95 transition-all text-white font-black text-[10px] tracking-wide uppercase px-3.5 py-2 rounded-full shadow-sm shrink-0"
          >
            Ver detalhes
          </button>
        </div>
      </div>
    </div>
  );
}
