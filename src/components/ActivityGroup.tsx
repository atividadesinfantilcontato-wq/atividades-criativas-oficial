import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { SiteConfig } from '../types';

interface ActivityGroupProps {
  siteConfig: SiteConfig;
}

export default function ActivityGroup({ siteConfig }: ActivityGroupProps) {
  // If disabled, don't show anything
  if (siteConfig.activityGroupEnabled === false) {
    return null;
  }

  const title = siteConfig.activityGroupTitle || 'Participe do nosso grupo de atividades';
  const description = siteConfig.activityGroupDescription || 'Entre para uma comunidade de pessoas que amam atividades criativas, ideias pedagógicas e materiais para trabalhar com crianças.';
  const note = siteConfig.activityGroupNote || 'Receba novidades, compartilhe ideias e acompanhe conteúdos especiais.';
  const imageUrl = siteConfig.activityGroupImageUrl;
  const buttonText = siteConfig.activityGroupButtonText || 'Entrar no grupo';
  const buttonUrl = siteConfig.activityGroupButtonUrl;
  const openInNewTab = siteConfig.activityGroupOpenInNewTab !== false;

  const showButton = !!buttonUrl && buttonUrl.trim() !== '';

  return (
    <section id="activity-group-section" className="py-12 md:py-16 px-4 bg-[#FDFBF7] border-b border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#FFFDF8] via-[#FFFBF0] to-[#FFF9E6] border border-[#FFE8CC] rounded-[32px] p-6 md:p-12 lg:p-14 shadow-md">
          
          {imageUrl ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-12 items-center">
              
              {/* Left Column (Content) */}
              <div className="w-full md:col-span-7 lg:col-span-8 flex flex-col gap-4 text-center md:text-left order-1">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] md:text-xs font-black text-amber-600 tracking-widest uppercase bg-amber-100/50 w-fit px-3 py-1 rounded-full mx-auto md:mx-0 border border-amber-200">
                    👥 Grupo Exclusivo
                  </span>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight mt-1 max-w-xl">
                    {title}
                  </h2>
                  <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed max-w-xl">
                    {description}
                  </p>
                  {note && (
                    <p className="text-slate-400 text-[11px] font-bold leading-normal max-w-xl">
                      {note}
                    </p>
                  )}
                </div>

                {/* Button */}
                {showButton && (
                  <div className="mt-2 flex justify-center md:justify-start">
                    <a
                      href={buttonUrl}
                      target={openInNewTab ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#37C76A] hover:bg-[#2ca455] active:scale-95 text-white font-black text-xs md:text-sm tracking-wider uppercase px-8 py-4 rounded-2xl shadow-lg shadow-[#37C76A]/20 transition-all cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <span>{buttonText}</span>
                      <ArrowRight size={14} className="stroke-[2.5]" />
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column (Image) */}
              <div className="md:col-span-5 lg:col-span-4 flex justify-center w-full order-2">
                <div className="relative w-full max-w-[280px] md:max-w-none md:w-full aspect-square bg-amber-50/50 rounded-2xl overflow-hidden border border-[#FFE5C4] shadow-sm flex items-center justify-center">
                  <img 
                    src={imageUrl} 
                    alt="Grupo de Atividades" 
                    className="w-full h-full object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
              {/* Cute placeholder when there is no image */}
              <div className="w-24 h-24 rounded-full bg-amber-100 border-2 border-dashed border-amber-300 flex items-center justify-center text-amber-500 shadow-inner mb-2">
                <Users size={48} className="stroke-[1.5]" />
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="text-[10px] md:text-xs font-black text-amber-600 tracking-widest uppercase bg-amber-100/50 w-fit px-3 py-1 rounded-full mx-auto border border-amber-200">
                  👥 Grupo Exclusivo
                </span>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight mt-1">
                  {title}
                </h2>
                <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed max-w-2xl">
                  {description}
                </p>
                {note && (
                  <p className="text-slate-400 text-[11px] font-bold leading-normal">
                    {note}
                  </p>
                )}
              </div>

              {/* Button */}
              {showButton && (
                <div className="mt-2 flex justify-center">
                  <a
                    href={buttonUrl}
                    target={openInNewTab ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#37C76A] hover:bg-[#2ca455] active:scale-95 text-white font-black text-xs md:text-sm tracking-wider uppercase px-8 py-4 rounded-2xl shadow-lg shadow-[#37C76A]/20 transition-all cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <span>{buttonText}</span>
                    <ArrowRight size={14} className="stroke-[2.5]" />
                  </a>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
