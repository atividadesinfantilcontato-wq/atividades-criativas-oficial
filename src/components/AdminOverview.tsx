import React from 'react';
import { 
  PenTool, PackagePlus, Settings, Globe
} from 'lucide-react';

interface AdminOverviewProps {
  products: any[];
  reviews: any[];
  onNavigateToSection: (section: string) => void;
  onViewSite: () => void;
}

export default function AdminOverview({
  products,
  reviews,
  onNavigateToSection,
  onViewSite
}: AdminOverviewProps) {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 text-center animate-fadeIn">
      {/* Friendly, Welcoming Title */}
      <h1 className="text-3xl md:text-4xl font-black text-[#12368F] tracking-tight mb-2">
        Olá! O que você deseja fazer?
      </h1>
      <p className="text-sm text-slate-500 font-semibold mb-12">
        Seja bem-vinda ao Painel de Administração Oficial da Atividades Criativas. Escolha uma das opções abaixo para começar.
      </p>

      {/* Three Main Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-16">
        
        {/* Card 1: Editar o Site */}
        <div className="bg-white rounded-[28px] border border-slate-200/60 p-6 shadow-xs hover:shadow-xl hover:border-[#1E4DDB]/20 transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#12368F] flex items-center justify-center border border-blue-100/50 group-hover:bg-[#12368F] group-hover:text-white transition-colors">
              <PenTool size={22} />
            </div>
            <h2 className="text-xl font-black text-slate-800">Editar o site</h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Altere textos, imagens, banners, comentários, contatos e outras partes da página.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToSection('visual_edit')}
            className="mt-8 w-full py-3.5 bg-slate-50 hover:bg-[#12368F] hover:text-white text-[#12368F] border border-slate-200/80 hover:border-transparent rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            ABRIR EDITOR VISUAL
          </button>
        </div>

        {/* Card 2: Gerenciar Produtos */}
        <div className="bg-white rounded-[28px] border border-slate-200/60 p-6 shadow-xs hover:shadow-xl hover:border-[#1E4DDB]/20 transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6A1A] flex items-center justify-center border border-orange-100/50 group-hover:bg-[#FF6A1A] group-hover:text-white transition-colors">
              <PackagePlus size={22} />
            </div>
            <h2 className="text-xl font-black text-slate-800">Gerenciar produtos</h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Cadastre, edite, organize, publique ou exclua seus materiais.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToSection('products')}
            className="mt-8 w-full py-3.5 bg-[#FF6A1A] hover:bg-[#e05b10] text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#FF6A1A]/10 active:scale-95 border border-transparent"
          >
            VER PRODUTOS
          </button>
        </div>

        {/* Card 3: Configurações */}
        <div className="bg-white rounded-[28px] border border-slate-200/60 p-6 shadow-xs hover:shadow-xl hover:border-[#1E4DDB]/20 transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/50 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Settings size={22} />
            </div>
            <h2 className="text-xl font-black text-slate-800">Configurações</h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Edite contatos, redes sociais, Hotmart, newsletter e informações gerais.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToSection('settings')}
            className="mt-8 w-full py-3.5 bg-slate-50 hover:bg-purple-600 hover:text-white text-purple-600 border border-slate-200/80 hover:border-transparent rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            ABRIR CONFIGURAÇÕES
          </button>
        </div>

      </div>

      {/* Standalone Button: VISUALIZAR LOJA */}
      <div className="flex flex-col items-center justify-center gap-4 border-t border-slate-200/60 pt-10">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Como seus clientes enxergam a loja?</p>
        <button
          type="button"
          onClick={onViewSite}
          className="flex items-center gap-2 px-8 py-4 bg-[#37C76A] hover:bg-[#2ca455] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-[#37C76A]/20 active:scale-95 transition-all cursor-pointer border border-transparent"
        >
          <Globe size={16} />
          <span>VISUALIZAR LOJA</span>
        </button>
      </div>
    </div>
  );
}
