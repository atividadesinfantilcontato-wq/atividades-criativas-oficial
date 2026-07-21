import React from 'react';
import { Heart, Sparkles, User } from 'lucide-react';
import { SiteConfig } from '../types';

interface TipsAndContentProps {
  siteConfig?: SiteConfig;
}

export default function TipsAndContent({ siteConfig }: TipsAndContentProps) {
  // Read fields from siteConfig or use standard fallbacks
  const authorSectionTitle = siteConfig?.authorSectionTitle || 'Quem está por trás da Creative Activities Oficial';
  const authorNameTitle = siteConfig?.authorNameTitle || 'Muito prazer, eu sou a Andreia Silva!';
  
  const authorBioText = siteConfig?.authorBioText || 
    'Acredito na educação que transforma. Minha jornada é movida pelo desejo de fazer a diferença, unindo minhas formações em Pedagogia, Educação Física Escolar e Neuropsicopedagogia.\n\nA Creative Activities Oficial é a realização de um grande sonho: tirar os projetos do rascunho e conectar o aprendizado à arte criativa.\n\nMeu maior propósito é ser luz e deixar sementes por onde eu passar, capacitando as crianças a enxergarem o mundo muito além das paredes de uma sala de aula.';
  
  const authorHighlightText = siteConfig?.authorHighlightText || 'Seja muito bem-vindo(a) a este espaço de criatividade e transformação!';
  
  // Use authorPhotoUrl if set, otherwise empty for placeholder
  const authorPhotoUrl = siteConfig?.authorPhotoUrl || '';
  
  const authorButtonText = siteConfig?.authorButtonText || 'Conhecer os materiais';
  const authorButtonAction = siteConfig?.authorButtonAction || 'scroll';

  const handleButtonClick = () => {
    if (authorButtonAction === 'scroll') {
      const section = document.getElementById('destaque-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (authorButtonAction === 'shop') {
      const section = document.getElementById('destaque-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const paragraphs = (authorBioText || '').split('\n').filter(p => p.trim() !== '');

  return (
    <section id="tips-section" className="bg-[#FFFFFF] py-16 border-b border-slate-100 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Title */}
        <div className="flex flex-col items-center text-center mb-12 animate-fadeIn">
          <span className="text-[#37C76A] font-black text-xs tracking-widest uppercase bg-[#37C76A]/10 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#37C76A]" />
            Educação, criatividade e propósito
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-[#0E2A79] mt-3 max-w-2xl leading-tight">
            {authorSectionTitle}
          </h2>
        </div>

        {/* Outer Card Layout */}
        <div className="bg-[#FFF8EE]/40 border border-[#DCE7FF]/40 rounded-3xl p-6 md:p-10 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* COLUMN: Photo of the author (Grid span 5) */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <div className="relative group w-full max-w-[340px] lg:max-w-[420px] max-h-[520px] aspect-[13/16] lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-md border-4 border-white bg-white flex items-center justify-center transition-all duration-300 hover:shadow-lg">
                {authorPhotoUrl ? (
                  <img 
                    src={authorPhotoUrl} 
                    alt="Andreia Silva - Autora da Creative Activities" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-102"
                  />
                ) : (
                  <div className="w-full h-full min-h-[300px] bg-slate-50 flex flex-col items-center justify-center text-slate-300 gap-3 p-8 border border-dashed border-slate-200 rounded-2xl">
                    <User size={64} className="stroke-[1.5] text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Foto da autora ainda não cadastrada</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* COLUMN: Institutional Text (Grid span 7) */}
            <div className="lg:col-span-7 flex flex-col items-start text-left gap-5">
              
              <div className="w-full flex flex-col gap-4">
                <h3 className="text-2xl md:text-3xl font-black text-[#0E2A79] tracking-tight">
                  {authorNameTitle}
                </h3>
                
                <div className="flex flex-col gap-4 text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                  {paragraphs.map((p, idx) => (
                    <p key={idx}>
                      {p}
                    </p>
                  ))}
                </div>

                {/* Highlighted Welcome Quote */}
                {authorHighlightText && (
                  <div className="mt-4 p-4 bg-[#37C76A]/8 border-l-4 border-[#37C76A] rounded-r-2xl font-bold text-[#0E2A79] text-sm md:text-base flex items-start gap-2.5">
                    <Heart size={18} className="text-[#37C76A] shrink-0 mt-0.5 fill-[#37C76A]/20 animate-pulse" />
                    <p className="italic">
                      {authorHighlightText}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {authorButtonAction !== 'hide' && authorButtonText && (
                <button
                  onClick={handleButtonClick}
                  className="mt-4 bg-[#37C76A] hover:bg-[#2ca455] text-white font-extrabold text-xs md:text-sm uppercase px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>{authorButtonText}</span>
                </button>
              )}

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
