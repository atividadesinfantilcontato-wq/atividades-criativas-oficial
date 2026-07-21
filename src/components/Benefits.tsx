import React from 'react';
import { ShieldCheck, FileText, Award, Heart } from 'lucide-react';

export default function Benefits() {
  return (
    <section id="benefits-section" className="bg-[#FFFFFF] py-10 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pagamento Seguro */}
          <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="p-3 bg-[#DCE7FF] text-[#1E4DDB] rounded-full shrink-0">
              <ShieldCheck size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0E2A79] text-base">Pagamento seguro</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Ambiente 100% seguro e confiável. Pagamento e entrega realizados pela Hotmart.
              </p>
            </div>
          </div>

          {/* Produto Digital */}
          <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="p-3 bg-[#37C76A]/10 text-[#37C76A] rounded-full shrink-0">
              <FileText size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0E2A79] text-base">Produto digital</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Materiais digitais prontos em formato PDF de alta qualidade para você imprimir quando quiser.
              </p>
            </div>
          </div>

          {/* Qualidade Premium */}
          <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="p-3 bg-[#7B61FF]/10 text-[#7B61FF] rounded-full shrink-0">
              <Award size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0E2A79] text-base">Qualidade premium</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Materiais estruturados e revisados por educadores e especialistas em desenvolvimento infantil.
              </p>
            </div>
          </div>

          {/* Feito com Carinho */}
          <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="p-3 bg-[#37C76A]/10 text-[#37C76A] rounded-full shrink-0">
              <Heart size={24} className="stroke-[2.5] fill-[#37C76A]/10" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0E2A79] text-base">Feito com carinho</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Atividades pensadas com amor e dinamismo para tornar o aprendizado leve, divertido e significativo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
