import React from 'react';
import { X, Trash2, ExternalLink, Lock, ShoppingCart, Sparkles } from 'lucide-react';
import { CartItem } from '../types';
import ProductImage from './ProductImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveFromCart: (productId: string) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onRemoveFromCart
}: CartDrawerProps) {
  if (!isOpen) return null;

  // Calculate estimated total investment
  const totalEstimated = cartItems.reduce((acc, item) => {
    const price = item.product.promoPrice || item.product.price;
    return acc + price;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-fadeIn">
      {/* Dark semi-transparent background overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Sliding drawer card panel */}
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-100 animate-slideLeft">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#0E2A79]/10 flex items-center justify-between bg-[#0E2A79] text-white">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-[#FFD22E]" />
              <h2 className="font-extrabold text-base md:text-lg">Atividades Salvas</h2>
              {cartItems.length > 0 && (
                <span className="bg-[#37C76A] text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </div>
            
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            {/* Context/Explanation box */}
            <div className="bg-[#DCE7FF] border border-[#B8D1FF]/50 p-4 rounded-2xl text-left">
              <p className="text-[#0E2A79] text-[11px] md:text-xs font-semibold leading-relaxed">
                💡 <strong>Como funciona a compra?</strong> Esta é sua lista de escolhas. Como os pagamentos e downloads são gerenciados de forma individual pela Hotmart, clique em <strong>Comprar na Hotmart</strong> em cada item desejado para ser direcionado ao checkout oficial correspondente!
              </p>
            </div>

            {cartItems.length === 0 ? (
              // Empty State
              <div className="flex-grow flex flex-col items-center justify-center text-center py-16 gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0E2A79] text-sm md:text-base">Sua lista está vazia</h3>
                  <p className="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed">
                    Navegue por nossas categorias pedagógicas e adicione as atividades preferidas aqui para planejar suas aulas!
                  </p>
                </div>
                
                <button 
                  onClick={onClose}
                  className="bg-[#37C76A] hover:bg-[#2ca455] transition-colors text-white font-black text-xs uppercase px-6 py-3 rounded-xl mt-2"
                >
                  Procurar Atividades
                </button>
              </div>
            ) : (
              // Saved products list
              <div className="flex flex-col gap-4">
                {cartItems.map((item) => {
                  const prod = item.product;
                  const displayPrice = prod.promoPrice || prod.price;

                  return (
                    <div 
                      key={prod.id}
                      className="flex gap-4 p-4 rounded-2xl border border-[#DCE7FF]/40 bg-[#FFF8EE]/30 relative group text-left"
                    >
                      {/* Product Miniature */}
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-white border border-[#DCE7FF]/30 rounded-xl overflow-hidden shrink-0">
                        <ProductImage id={prod.mainImageUrl || prod.imageUrl} />
                      </div>

                      {/* Info & Buy links */}
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <span className="text-[#37C76A] text-[9px] font-black uppercase tracking-wider block">
                            {prod.category}
                          </span>
                          <h4 className="font-extrabold text-[#0E2A79] text-xs md:text-sm line-clamp-1 leading-tight group-hover:text-[#37C76A] transition-colors">
                            {prod.name}
                          </h4>
                          <span className="text-slate-500 text-[10px] font-semibold mt-0.5 block">
                            {prod.pages} {prod.pages === 1 ? 'PDF' : 'PDFs'} • R$ {displayPrice.toFixed(2).replace('.', ',')}
                          </span>
                        </div>

                        {/* Direct purchase link (Hotmart URL) */}
                        <a 
                          href={prod.isDemo ? '#' : prod.hotmartUrl}
                          onClick={(e) => {
                            if (prod.isDemo) {
                              e.preventDefault();
                              alert("Produto de demonstração. Cadastre o link real da Hotmart no painel.");
                            }
                          }}
                          target={prod.isDemo ? undefined : "_blank"}
                          rel={prod.isDemo ? undefined : "noopener noreferrer"}
                          className="mt-2.5 bg-[#37C76A] hover:bg-[#2ca455] text-white font-black text-[10px] tracking-wider uppercase py-2 px-3 rounded-lg flex items-center justify-center gap-1 w-full text-center shadow-sm cursor-pointer"
                        >
                          <span>Comprar na Hotmart</span>
                          <ExternalLink size={10} className="stroke-[2.5]" />
                        </a>
                      </div>

                      {/* Remove from list button */}
                      <button
                        onClick={() => onRemoveFromCart(prod.id)}
                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-all"
                        title="Remover da lista"
                        aria-label="Remover"
                      >
                        <Trash2 size={13} />
                      </button>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer of Drawer */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col gap-4 text-left">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 font-extrabold text-xs uppercase">Soma estimada:</span>
                <span className="text-xl md:text-2xl font-black text-slate-950">
                  R$ {totalEstimated.toFixed(2).replace('.', ',')}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-extrabold uppercase bg-white px-3 py-2 rounded-xl border border-slate-100 justify-center">
                <Lock size={10} className="text-emerald-500" />
                <span>Ambiente Seguro • Processado pela Hotmart</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
