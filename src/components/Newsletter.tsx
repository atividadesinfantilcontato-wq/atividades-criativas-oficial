import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SiteConfig } from '../types';

interface NewsletterProps {
  siteConfig?: SiteConfig;
  title?: string;
  description?: string;
  buttonText?: string;
}

export default function Newsletter({ siteConfig, title: propTitle, description: propDescription, buttonText: propButtonText }: NewsletterProps) {
  const title = propTitle || siteConfig?.newsletterTitle || 'Quer receber atividades gratuitas toda semana?';
  const buttonText = propButtonText || siteConfig?.newsletterButtonText || 'Quero Receber!';
  const description = propDescription || siteConfig?.newsletterDescription || 'Cadastre-se e receba conteúdos exclusivos, lançamentos e dicas de atividades pedagógicas diretamente no seu e-mail.';
  const imageUrl = siteConfig?.newsletterImageUrl;
  const buttonUrl = siteConfig?.newsletterButtonUrl || '#destaque-section';

  return (
    <section id="announcement-section" className="relative bg-gradient-to-br from-[#1E4DDB] via-[#4A45E6] to-[#7B61FF] text-white py-16 px-4 overflow-hidden border-b border-white/10">
      
      {/* Background vectors */}
      <div className="absolute left-[-20px] top-[10%] w-36 h-36 opacity-20 pointer-events-none select-none text-pink-300">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="100" r="80" />
          <circle cx="0" cy="100" r="65" strokeWidth="6" />
        </svg>
      </div>

      <div className="absolute right-[-20px] bottom-[10%] w-44 h-44 opacity-25 pointer-events-none select-none text-yellow-200">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="90" />
          <circle cx="100" cy="100" r="75" strokeWidth="5" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className={`grid grid-cols-1 ${imageUrl ? 'md:grid-cols-12 gap-8 md:items-center' : 'max-w-4xl mx-auto text-center flex flex-col items-center gap-6'}`}>
          
          {/* Image Column */}
          {imageUrl && (
            <div className="md:col-span-5 flex justify-center">
              <div className="relative max-w-sm w-full aspect-[4/3] bg-white/10 rounded-3xl p-3 shadow-2xl border border-white/20 overflow-hidden flex items-center justify-center">
                <img 
                  src={imageUrl} 
                  alt="Ilustração de Atividades" 
                  className="w-full h-full object-cover rounded-2xl" 
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          {/* Form Content Column */}
          <div className={`${imageUrl ? 'md:col-span-7 flex flex-col items-start text-left gap-6' : 'flex flex-col items-center gap-6'}`}>
            
            {/* Icons */}
            <div className="flex gap-4 text-3xl select-none">
              <span className="animate-bounce">📖</span>
              <span className="animate-pulse">🌈</span>
              <span className="animate-bounce">✏️</span>
            </div>

            {/* Texts */}
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                {title}
              </h2>
              <p className="text-white/90 text-xs md:text-sm font-medium leading-relaxed max-w-xl">
                {description}
              </p>
            </div>

            {/* Announcement Button */}
            <div className="w-full max-w-lg mt-2">
              <a 
                href={buttonUrl}
                target={buttonUrl.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto bg-[#37C76A] hover:bg-[#2ca455] active:scale-95 transition-all text-white font-black text-xs md:text-sm tracking-wider uppercase px-8 py-4 rounded-2xl shrink-0 items-center justify-center gap-2 shadow-xl shadow-[#37C76A]/20"
              >
                <span>{buttonText}</span>
                <ArrowRight size={16} />
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
