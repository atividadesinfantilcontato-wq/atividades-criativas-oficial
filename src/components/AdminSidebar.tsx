import React from 'react';
import { 
  LayoutDashboard, Sliders, Megaphone, HeartHandshake, Grid, PackagePlus, 
  FolderHeart, BookOpen, MessageSquare, Info, CreditCard, Mail, 
  Share2, Layout, Settings, Globe, LogOut, PenTool
} from 'lucide-react';

export type AdminSection = 
  | 'overview' 
  | 'products' 
  | 'new_product' 
  | 'free_materials' 
  | 'comments' 
  | 'settings'
  | 'visual_edit';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  onLogout: () => void;
  onViewSite: () => void;
  isMobileOpen: boolean;
  onToggleMobile: () => void;
}

export default function AdminSidebar({
  activeSection,
  onSelectSection,
  onLogout,
  onViewSite,
  isMobileOpen,
  onToggleMobile
}: AdminSidebarProps) {
  
  const menuItems = [
    { id: 'overview', label: 'Início', icon: LayoutDashboard },
    { id: 'visual_edit', label: 'Editar site', icon: PenTool },
    { id: 'products', label: 'Produtos', icon: PackagePlus },
    { id: 'free_materials', label: 'Materiais gratuitos', icon: BookOpen },
    { id: 'comments', label: 'Comentários', icon: MessageSquare },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ] as const;

  // w-64 is 256px, which is exactly in the 240px-270px ideal width range
  // We make it relative on desktop to sit next to main content instead of overlapping
  const sidebarClasses = `
    fixed md:relative inset-y-0 left-0 z-50 w-64 bg-[#12368F] text-white flex flex-col justify-between h-full shrink-0
    transition-transform duration-300 transform border-r border-[#1E4DDB]/20
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  `;

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onToggleMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden backdrop-blur-xs"
        />
      )}

      <aside className={sidebarClasses}>
        {/* Sidebar Header with Logo */}
        <div className="p-6 border-b border-[#1E4DDB]/30 flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/10 rounded-full p-1.5 border border-white/25 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-6 h-6">
                <path d="M 50 65 C 20 40 10 10 45 15 C 50 20 50 20 50 65" fill="#37C76A" />
                <path d="M 50 65 C 80 40 90 10 55 15 C 50 20 50 20 50 65" fill="#FFD22E" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-xs uppercase tracking-wider leading-none text-white">
                Atividades Criativas
              </span>
              <span className="text-[9px] text-[#FFD22E] font-black tracking-widest leading-none mt-1">
                OFICIAL ADMIN
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Options - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isSelected = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectSection(item.id);
                  if (isMobileOpen) onToggleMobile();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#1E4DDB] to-[#12368F] text-[#FFD22E] border-l-4 border-[#FF6A1A] pl-3.5'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <IconComponent size={16} className={isSelected ? 'text-[#FFD22E]' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="h-4 border-t border-[#1E4DDB]/20 my-2" />

          {/* Visualizar Loja Button */}
          <button
            type="button"
            onClick={() => {
              onViewSite();
              if (isMobileOpen) onToggleMobile();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all text-left cursor-pointer"
          >
            <Globe size={16} className="text-slate-400" />
            <span>Visualizar loja</span>
          </button>

          {/* Sair Button */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Deseja realmente sair da sua conta administrativa?')) {
                onLogout();
                onViewSite();
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all text-left cursor-pointer"
          >
            <LogOut size={16} className="text-red-400" />
            <span>Sair</span>
          </button>
        </nav>

        {/* Sidebar Footer Operations - Mobile only */}
        <div className="p-4 border-t border-[#1E4DDB]/30 space-y-2 md:hidden">
          <p className="text-[10px] text-slate-400 text-center font-bold">Painel de Administração</p>
        </div>
      </aside>
    </>
  );
}
