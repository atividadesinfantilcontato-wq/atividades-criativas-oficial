import React from 'react';
import { Star, ShieldCheck, Lock, HelpCircle } from 'lucide-react';
import { Review } from '../types';

interface ReviewsSectionProps {
  reviews: Review[];
}

export default function ReviewsSection({ reviews = [] }: ReviewsSectionProps) {
  return (
    <section id="reviews-section" className="bg-[#FDFBF7] py-16 border-b border-slate-100 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Title */}
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-[#37C76A] font-extrabold text-xs tracking-widest uppercase bg-[#37C76A]/10 px-3 py-1 rounded-full">
            AVALIAÇÕES REAIS
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-950 mt-2">
            Veja o que educadoras e famílias estão dizendo
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium max-w-2xl">
            Materiais didáticos que fazem a diferença na rotina pedagógica e estimulam o interesse genuíno das crianças.
          </p>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-2 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            ⚠ Avaliações de Demonstração (Simuladas para Homologação)
          </span>
        </div>

        {/* Grid Layout: Reviews (9 cols) + Hotmart Box (3 cols) on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Side: Reviews Cards (Grid span 9) */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div 
                key={rev.id}
                id={`review-card-${rev.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                {/* Micro Label Demo */}
                <div className="absolute top-2 right-2 text-[8px] bg-amber-50 text-amber-600 font-black px-1.5 py-0.5 rounded">
                  Demonstração
                </div>

                <div>
                  {/* Five Stars */}
                  <div className="flex items-center gap-0.5 mb-3 text-amber-400">
                    {Array.from({ length: rev.stars }).map((_, i) => (
                      <Star key={i} size={14} className="fill-current" />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-xs md:text-xs text-slate-600 font-medium italic leading-relaxed mb-6">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Profile Detail */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
                  {/* Initials Avatar */}
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-black text-xs flex items-center justify-center shrink-0 border border-blue-200 uppercase">
                    {rev.avatarUrl}
                  </div>
                  <div className="text-left">
                    <h4 className="font-extrabold text-slate-900 text-xs leading-none">
                      {rev.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      {rev.role} • {rev.city}
                    </span>
                    
                    {/* Verified Tag and Purchased Product */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {rev.verified && (
                        <span className="inline-flex items-center gap-0.5 bg-[#37C76A]/10 text-[#37C76A] font-extrabold text-[8px] px-1.5 py-0.5 rounded uppercase border border-[#37C76A]/20">
                          <ShieldCheck size={9} className="fill-[#37C76A]/10" />
                          <span>Verificado</span>
                        </span>
                      )}
                      <span className="text-[9px] text-slate-400 font-semibold line-clamp-1">
                        Adquiriu: {rev.productName}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Right Side: Hotmart Trust Widget (Grid span 3) */}
          <div className="lg:col-span-3">
            <div 
              id="hotmart-trust-card"
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between items-center text-center h-full gap-6"
            >
              {/* Hotmart flame logo drawing in SVG */}
              <div className="flex flex-col items-center gap-1">
                <svg viewBox="0 0 100 30" className="h-8 select-none" xmlns="http://www.w3.org/2000/svg">
                  {/* Flame Icon */}
                  <path d="M 12 5 C 10 10 7 12 7 15 C 7 18 9 20 12 20 C 15 20 17 18 17 15 C 17 12 14 10 12 5 Z" fill="#FF5A00" />
                  <path d="M 12 11 C 11 13 10 14 10 15 C 10 17 11 18 12 18 C 13 18 14 17 14 15 C 14 14 13 13 12 11 Z" fill="#FFFFFF" />
                  {/* Hotmart text */}
                  <text x="25" y="21" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="13" fill="#000000">hotmart</text>
                </svg>
                <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase mt-1">
                  PARCEIRO OFICIAL
                </span>
              </div>

              {/* Title & Trust Text */}
              <div className="flex flex-col gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm leading-tight">
                  Compra segura e entrega pela Hotmart
                </h3>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium leading-relaxed">
                  Os pagamentos dos produtos pagos são processados pela Hotmart. Após a aprovação do pagamento, você receberá as instruções para acessar o material no e-mail cadastrado durante a compra.
                </p>
              </div>

              {/* Action and security */}
              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={() => {
                    const element = document.getElementById('hotmart-section');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="w-full bg-[#37C76A] hover:bg-[#2ca455] active:scale-95 transition-all text-white font-extrabold text-xs tracking-wider uppercase py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-[#37C76A]/10"
                >
                  <HelpCircle size={13} />
                  <span>COMO FUNCIONA</span>
                </button>
                
                <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 font-extrabold uppercase">
                  <Lock size={10} className="text-emerald-500" />
                  <span>Conexão SSL Segura</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
