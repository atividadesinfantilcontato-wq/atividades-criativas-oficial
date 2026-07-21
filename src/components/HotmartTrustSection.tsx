import React from 'react';
import { ShieldCheck, MailOpen, Download, Lock, CheckCircle2, ArrowUpCircle } from 'lucide-react';

interface HotmartTrustSectionProps {
  title?: string;
  description?: string;
}

export default function HotmartTrustSection({
  title = 'Compra segura e entrega pela Hotmart',
  description = 'As transações são processadas com criptografia militar pela Hotmart, maior plataforma de produtos digitais da América Latina. Logo após a confirmação da compra, seu material é entregue de forma 100% automatizada.'
}: HotmartTrustSectionProps) {
  const scrollToProducts = () => {
    const element = document.getElementById('destaque-section') || document.getElementById('os-mais-queridos-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="hotmart-section" className="bg-[#DCE7FF] text-[#0E2A79] py-16 relative overflow-hidden border-b border-[#B8D1FF] scroll-mt-16">
      {/* Decorative colored circular graphics */}
      <div className="absolute top-[-50px] left-[-50px] w-48 h-48 rounded-full bg-white/30 pointer-events-none select-none"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 rounded-full bg-[#1E4DDB]/10 pointer-events-none select-none"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Hotmart Header Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 mb-12 border-b border-[#0E2A79]/10">
          <div className="text-left max-w-2xl flex flex-col items-start gap-3">
            <span className="bg-[#37C76A] text-white font-black text-[10px] tracking-widest uppercase px-3.5 py-1 rounded-full shadow-sm">
              PARCEIRO DE SEGURANÇA
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-[#0E2A79] text-left">
              {title}
            </h2>
            <p className="text-[#0E2A79]/80 text-xs md:text-sm font-medium leading-relaxed text-left">
              {description}
            </p>
          </div>

          {/* Hotmart Official Logo Card */}
          <div className="bg-white text-slate-900 rounded-2xl p-5 border border-[#B8D1FF] flex flex-col items-center gap-3 shadow-md shrink-0">
            {/* SVG Flame and lowercase word 'hotmart' */}
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 100 30" className="h-7 select-none" xmlns="http://www.w3.org/2000/svg">
                {/* Flame Icon */}
                <path d="M 12 5 C 10 10 7 12 7 15 C 7 18 9 20 12 20 C 15 20 17 18 17 15 C 17 12 14 10 12 5 Z" fill="#FF5A00" />
                <path d="M 12 11 C 11 13 10 14 10 15 C 10 17 11 18 12 18 C 13 18 14 17 14 15 C 14 14 13 13 12 11 Z" fill="#FFFFFF" />
                <text x="25" y="21" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="13" fill="#000000">hotmart</text>
              </svg>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-2 w-full justify-center">
              <Lock size={10} className="text-[#37C76A]" />
              <span>Plataforma Segura</span>
            </div>
          </div>
        </div>

        {/* 3 Step Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-12 text-left">
          
          {/* Block 1: Pagamento Seguro */}
          <div className="bg-white border border-[#B8D1FF]/50 shadow-sm rounded-3xl p-6 flex flex-col gap-4">
            <div className="p-3 bg-[#DCE7FF] text-[#1E4DDB] rounded-2xl inline-block self-start">
              <ShieldCheck size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm md:text-base text-[#0E2A79]">1. Pagamento seguro</h3>
              <p className="text-slate-600 text-xs font-medium leading-relaxed mt-2">
                Seus dados de pagamento (Pix, Cartão de Crédito ou Boleto) são totalmente criptografados e processados com segurança absoluta diretamente pela plataforma Hotmart.
              </p>
            </div>
          </div>

          {/* Block 2: Acesso Imediato */}
          <div className="bg-white border border-[#B8D1FF]/50 shadow-sm rounded-3xl p-6 flex flex-col gap-4">
            <div className="p-3 bg-[#37C76A]/10 text-[#37C76A] rounded-2xl inline-block self-start">
              <MailOpen size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm md:text-base text-[#0E2A79]">2. Acesso após aprovação</h3>
              <p className="text-slate-600 text-xs font-medium leading-relaxed mt-2">
                Assim que a compra é confirmada pela Hotmart, um link de acesso exclusivo é enviado automaticamente para o e-mail cadastrado por você.
              </p>
            </div>
          </div>

          {/* Block 3: Entrega Digital */}
          <div className="bg-white border border-[#B8D1FF]/50 shadow-sm rounded-3xl p-6 flex flex-col gap-4">
            <div className="p-3 bg-[#37C76A]/10 text-[#37C76A] rounded-2xl inline-block self-start">
              <Download size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm md:text-base text-[#0E2A79]">3. Entrega digital e impressão</h3>
              <p className="text-slate-600 text-xs font-medium leading-relaxed mt-2">
                Você faz o download do arquivo em formato PDF de alta resolução e imprime quando, onde e quantas vezes desejar (em casa ou na gráfica).
              </p>
            </div>
          </div>

        </div>

        {/* CTA Orange Button and Info Footer */}
        <div className="flex flex-col items-center gap-6 border-t border-[#0E2A79]/10 pt-8">
          <button 
            onClick={scrollToProducts}
            className="bg-[#37C76A] hover:bg-[#2ca455] active:scale-95 transition-all text-white font-black text-xs md:text-sm tracking-widest uppercase px-8 py-4 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#37C76A]/20"
          >
            <span>EU QUERO GARANTIR MINHAS ATIVIDADES</span>
            <ArrowUpCircle size={16} className="stroke-[3]" />
          </button>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-xs text-[#0E2A79]/60 font-black uppercase">
            <div className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-[#37C76A]" />
              <span>Transação Criptografada</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-[#37C76A]" />
              <span>Garantia de 7 dias Hotmart</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-[#37C76A]" />
              <span>Suporte Dedicado</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
