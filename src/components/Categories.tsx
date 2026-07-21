import React from 'react';
import { 
  Activity, 
  BookOpen, 
  Binary, 
  Disc, 
  Smile, 
  Palette, 
  Compass, 
  CalendarRange, 
  Gamepad2, 
  Package 
} from 'lucide-react';
import { Category, SiteConfig } from '../types';
import { INITIAL_CATEGORIES } from '../data';

// Map icon names to Lucide icon components
const IconMap: { [key: string]: React.ComponentType<any> } = {
  Activity,
  BookOpen,
  Binary,
  Disc,
  Smile,
  Palette,
  Compass,
  CalendarRange,
  Gamepad2,
  Package
};

interface CategoriesProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  siteConfig?: SiteConfig;
}

export default function Categories({ selectedCategory, onSelectCategory, siteConfig }: CategoriesProps) {
  const imageUrl = siteConfig?.categoryImageUrl;

  return (
    <section id="categories-section" className="bg-[#FDFBF7] py-12 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Title with Optional Illustration */}
        <div className={`flex flex-col ${imageUrl ? 'md:flex-row md:items-center md:justify-between' : 'items-center text-center'} gap-6 mb-8`}>
          <div className={`flex flex-col ${imageUrl ? 'text-left items-start' : 'items-center text-center'} max-w-2xl`}>
            <span className="text-[#37C76A] font-extrabold text-xs tracking-widest uppercase bg-[#37C76A]/10 px-3 py-1 rounded-full">
              EXPLORE POR ÁREAS
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-950 mt-2">
              Categorias Pedagógicas
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium leading-relaxed">
              Clique em uma categoria para filtrar as atividades e encontrar o material perfeito para seus alunos.
            </p>
          </div>

          {imageUrl && (
            <div className="shrink-0 max-w-[200px] aspect-square rounded-2xl bg-white p-2 border border-slate-200/60 shadow-md">
              <img 
                src={imageUrl} 
                alt="Ilustrativo de Categorias" 
                className="w-full h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        {/* Categories Grid/Row */}
        {/* We can use a touch-friendly swiper-like overflow list on mobile, and standard grid on md+ screens */}
        <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-none xl:grid xl:grid-cols-10 snap-x">
          
          {/* "Ver Todas" Category Option */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`snap-center shrink-0 w-28 md:w-32 xl:w-auto flex flex-col items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer select-none text-center h-32 md:h-36 ${
              selectedCategory === null 
                ? 'bg-[#37C76A] border-[#37C76A] text-white shadow-lg shadow-[#37C76A]/10' 
                : 'bg-white border-slate-100 hover:border-slate-200 text-slate-800'
            }`}
          >
            <div className={`p-3 rounded-full ${selectedCategory === null ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <BookOpen size={20} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] md:text-xs font-extrabold tracking-tight line-clamp-1">Todas</span>
              <span className={`text-[9px] mt-0.5 font-bold uppercase ${selectedCategory === null ? 'text-green-200' : 'text-slate-400'}`}>
                Ver Tudo
              </span>
            </div>
          </button>

          {/* Render individual categories */}
          {INITIAL_CATEGORIES.map((cat) => {
            const IconComponent = IconMap[cat.iconName] || BookOpen;
            const isSelected = selectedCategory === cat.name;
            
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? null : cat.name)}
                className={`snap-center shrink-0 w-28 md:w-32 xl:w-auto flex flex-col items-center justify-between p-3 md:p-4 rounded-2xl border-2 transition-all cursor-pointer select-none text-center h-32 md:h-36 ${
                  isSelected 
                    ? 'bg-[#37C76A] border-[#37C76A] text-white shadow-lg shadow-[#37C76A]/10' 
                    : 'bg-white border-slate-100 hover:border-slate-200 text-slate-800'
                }`}
              >
                {/* Colorful circular icon container */}
                <div className={`p-3 rounded-full transition-colors ${
                  isSelected 
                    ? 'bg-white/20 text-white' 
                    : cat.color
                }`}>
                  <IconComponent size={20} className="stroke-[2.5]" />
                </div>

                {/* Text elements */}
                <div className="flex flex-col items-center w-full">
                  <span className="text-[10px] md:text-xs font-black tracking-tight leading-tight line-clamp-2 min-h-[24px] md:min-h-[28px] flex items-center justify-center">
                    {cat.name}
                  </span>
                  <span className={`text-[8px] md:text-[9px] mt-0.5 font-bold uppercase ${
                    isSelected ? 'text-green-200' : 'text-slate-400'
                  }`}>
                    {cat.count} {cat.id === 'kits' ? 'kits' : 'atividades'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
