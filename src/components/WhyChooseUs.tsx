import React from 'react';
import { motion } from 'motion/react';
import { Palette, Compass, Activity, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

interface WhyChooseUsProps {
  title?: string;
  subtitle?: string;
  description?: string;
  creativity?: number;
  learning?: number;
  practicality?: number;
  products?: Product[];
}

export default function WhyChooseUs({
  title = 'nossas atividades',
  subtitle = 'POR QUE ESCOLHER',
  description = 'Nossos materiais foram criados por especialistas em educação infantil para tornar o aprendizado mais leve, divertido e significativo. Cada detalhe é pensado para poupar o tempo do professor e encantar o aluno.',
  creativity = 90,
  learning = 95,
  practicality = 88,
  products = []
}: WhyChooseUsProps) {

  const isValidImageUrl = (url: string | undefined | null) => {
    if (!url) return false;
    return (
      url.startsWith('data:image/') || 
      url.startsWith('blob:') || 
      url.startsWith('http://') || 
      url.startsWith('https://') || 
      url.startsWith('/') || 
      url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) ||
      url.length > 50
    );
  };

  const realProductsWithImages = (products || [])
    .filter(p => p.isActive !== false)
    .filter(p => isValidImageUrl(p.mainImageUrl || p.imageUrl));

  const prod1 = realProductsWithImages[0];
  const prod2 = realProductsWithImages[1];

  return (
    <section id="why-choose-us-section" className="bg-[#FFFFFF] py-16 border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Visual Composite of Materials */}
          <div className="relative aspect-square max-w-[450px] mx-auto w-full flex items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm overflow-hidden select-none">
            {/* Background glowing circle */}
            <div className="absolute w-60 h-60 bg-emerald-100 rounded-full filter blur-3xl opacity-65 -z-10 animate-pulse"></div>

            {/* Collage of real activities */}
            <div className="relative w-full h-full flex items-center justify-center">
              
              {/* 1. First Product Card */}
              {prod1 && !prod2 && (
                <div className="absolute w-[200px] aspect-[4/5] bg-pink-50 rounded-2xl border-2 border-pink-100 shadow-xl rotate-[-4deg] p-3 flex flex-col justify-between">
                  <div className="w-full h-[72%] bg-white rounded-xl border border-pink-50 overflow-hidden flex items-center justify-center p-1.5">
                    <img 
                      src={prod1.mainImageUrl || prod1.imageUrl} 
                      alt={prod1.name} 
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-black text-pink-700 block line-clamp-1">{prod1.name}</span>
                    <span className="text-[9px] text-pink-400 font-extrabold uppercase mt-0.5 block">{prod1.category || 'Atividade'}</span>
                  </div>
                </div>
              )}

              {prod1 && prod2 && (
                <div className="absolute w-[180px] aspect-[4/5] bg-pink-50 rounded-2xl border-2 border-pink-100 shadow-xl rotate-[-8deg] left-2 top-4 p-2.5 flex flex-col justify-between">
                  <div className="w-full h-[70%] bg-white rounded-xl border border-pink-50 overflow-hidden flex items-center justify-center p-1">
                    <img 
                      src={prod1.mainImageUrl || prod1.imageUrl} 
                      alt={prod1.name} 
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-black text-pink-700 block line-clamp-1">{prod1.name}</span>
                    <span className="text-[8px] text-pink-400 font-extrabold uppercase mt-0.5 block">{prod1.category || 'Atividade'}</span>
                  </div>
                </div>
              )}

              {/* 2. Second Product Card */}
              {prod1 && prod2 && (
                <div className="absolute w-[170px] aspect-[4/5] bg-blue-50 rounded-2xl border-2 border-blue-100 shadow-xl rotate-[10deg] right-2 bottom-8 p-2.5 flex flex-col justify-between">
                  <div className="w-full h-[70%] bg-white rounded-xl border border-blue-50 overflow-hidden flex items-center justify-center p-1">
                    <img 
                      src={prod2.mainImageUrl || prod2.imageUrl} 
                      alt={prod2.name} 
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-black text-blue-700 block line-clamp-1">{prod2.name}</span>
                    <span className="text-[8px] text-blue-400 font-extrabold uppercase mt-0.5 block">{prod2.category || 'Atividade'}</span>
                  </div>
                </div>
              )}

              {/* 3. Empty State Beautiful Collage replacement */}
              {realProductsWithImages.length === 0 && (
                <div className="text-center p-6 max-w-sm space-y-4">
                  <div className="w-20 h-20 bg-[#37C76A]/10 text-[#37C76A] rounded-full mx-auto flex items-center justify-center text-4xl">
                    ✨
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-lg text-[#0E2A79]">Materiais Exclusivos</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Atividades lúdicas e interativas criadas para potencializar o desenvolvimento das crianças.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 text-2xl pt-2">
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎨</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>📚</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.5s' }}>✏️</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.7s' }}>🧩</span>
                  </div>
                </div>
              )}

              {/* Decorative crayon floating in top right */}
              <div className="absolute right-10 top-12 animate-bounce duration-3000">
                <span className="text-3xl">✏️</span>
              </div>
              
              {/* Decorative toy block in bottom left */}
              <div className="absolute left-10 bottom-10 animate-pulse">
                <span className="text-4xl">🧸</span>
              </div>
            </div>
          </div>

          {/* Right Column: Why Choose Us Content */}
          <div className="flex flex-col items-start gap-6">
            <div className="flex flex-col">
              <span className="text-[#37C76A] font-extrabold text-xs tracking-widest uppercase bg-[#37C76A]/10 px-3 py-1 rounded-full self-start">
                {subtitle}
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#0E2A79] mt-3 leading-tight text-left">
                {title}
              </h2>
            </div>

            <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed text-left">
              {description}
            </p>

            {/* Progress Bar Indicators */}
            <div className="w-full flex flex-col gap-6 mt-2">
              {/* Criatividade */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 font-black text-slate-900">
                    <div className="p-1 bg-[#7B61FF]/10 text-[#7B61FF] rounded">
                      <Palette size={16} />
                    </div>
                    <span>Criatividade</span>
                  </div>
                  <span className="font-extrabold text-[#7B61FF]">{creativity}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${creativity}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-[#7B61FF] rounded-full"
                  />
                </div>
              </div>

              {/* Aprendizagem */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 font-black text-slate-900">
                    <div className="p-1 bg-[#37C76A]/10 text-[#37C76A] rounded">
                      <Compass size={16} />
                    </div>
                    <span>Aprendizagem</span>
                  </div>
                  <span className="font-extrabold text-[#37C76A]">{learning}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${learning}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                    className="h-full bg-[#37C76A] rounded-full"
                  />
                </div>
              </div>

              {/* Praticidade */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 font-black text-slate-900">
                    <div className="p-1 bg-[#37C76A]/10 text-[#37C76A] rounded">
                      <Activity size={16} />
                    </div>
                    <span>Praticidade</span>
                  </div>
                  <span className="font-extrabold text-[#37C76A]">{practicality}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${practicality}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className="h-full bg-[#37C76A] rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Quick checkmarks bottom */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 w-full text-slate-700 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#37C76A] shrink-0" />
                <span>BNCC Alinhado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#37C76A] shrink-0" />
                <span>PDF de Alta Resolução</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#37C76A] shrink-0" />
                <span>Vídeos Demonstrativos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#37C76A] shrink-0" />
                <span>Acesso Vitalício</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
