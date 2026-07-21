import React from 'react';
import { BookOpen, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ProductImageProps {
  id: string;
  className?: string;
  isAdminMode?: boolean;
  onAddImage?: () => void;
  fit?: 'contain' | 'cover';
}

export default function ProductImage({ 
  id, 
  className = "w-full h-full", 
  isAdminMode = false, 
  onAddImage,
  fit = 'contain'
}: ProductImageProps) {
  
  // Strict verification of valid image url/format
  const isValidImageUrl = id && (
    id.startsWith('data:image/') || 
    id.startsWith('blob:') || 
    id.startsWith('http://') || 
    id.startsWith('https://') || 
    id.startsWith('/') || 
    id.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) ||
    id.length > 50
  );

  return (
    <div 
      id={`prod-img-${id ? id.slice(0, 20) : 'empty'}`} 
      className={`overflow-hidden select-none bg-slate-50 relative rounded-xl border border-slate-100/50 flex items-center justify-center ${className.includes('aspect-') ? '' : 'aspect-square'} ${className}`}
    >
      {isValidImageUrl ? (
        <img 
          src={id} 
          alt="Material Pedagógico" 
          className={`w-full h-full transition-transform duration-300 hover:scale-101 ${fit === 'cover' ? 'object-cover' : 'object-contain'}`} 
          referrerPolicy="no-referrer" 
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#F8FAFC] p-4 text-center gap-2">
          <div className="p-3 bg-slate-100 text-slate-400 rounded-2xl">
            <BookOpen size={24} className="stroke-[1.5]" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Produto sem imagem cadastrada</p>
          {isAdminMode && onAddImage && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddImage();
              }}
              className="mt-1 inline-flex items-center px-2.5 py-1 bg-[#37C76A] hover:bg-[#2ca455] text-[9px] font-black uppercase rounded-lg text-white focus:outline-none focus:ring-0 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              Adicionar Imagem
            </button>
          )}
        </div>
      )}
    </div>
  );
}
