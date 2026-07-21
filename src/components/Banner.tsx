import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShoppingCart, Download, Printer, Shield, Play } from 'lucide-react';
import { Product } from '../types';
import ProductImage from './ProductImage';

interface BannerProps {
  onVerProdutos: () => void;
  onEuQuero: () => void;
  bannerTitlePrefix?: string;
  bannerTitleHighlight?: string;
  bannerDescription?: string;
  heroBackgroundImage?: string;
  heroCardImage?: string;
  bannerImageUrl?: string;
  hideHeroCardImage?: boolean;
  featuredProduct?: Product;
  onSelectProduct?: (id: string) => void;
  bannerImageMode?: 'linked' | 'custom';
}

export default function Banner({ 
  onVerProdutos, 
  onEuQuero,
  bannerTitlePrefix = 'Atividades em PDF prontas para ',
  bannerTitleHighlight = 'imprimir e aplicar!',
  bannerDescription = 'Garanta kits exclusivos para acelerar o aprendizado e a alfabetização do seu pequeno de forma lúdica, prática e 100% livre de telas!',
  heroBackgroundImage = '',
  heroCardImage = '',
  bannerImageUrl = '',
  hideHeroCardImage = false,
  featuredProduct,
  onSelectProduct,
  bannerImageMode = 'linked'
}: BannerProps) {
  return (
    <section 
      id="banner-section" 
      className="relative text-white overflow-hidden pt-12 pb-24 md:pb-32 px-4"
      style={{
        background: heroBackgroundImage 
          ? `url(${heroBackgroundImage}) no-repeat center center / cover` 
          : 'linear-gradient(120deg, #123FCE 0%, #254BE5 45%, #5546E8 100%)'
      }}
    >
      {/* Curved layered backgrounds at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none z-10">
        <svg viewBox="0 0 1440 220" className="w-full h-auto translate-y-1" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Layer 1: Peach/Creme curve */}
          <path d="M0,80 C360,160 720,110 1080,150 C1260,170 1350,140 1440,110 L1440,220 L0,220 Z" fill="#FFF8EE" opacity="0.95" />
          {/* Layer 2: Light Pink curve offset */}
          <path d="M0,110 C360,180 720,140 1080,170 C1260,185 1350,160 1440,130 L1440,220 L0,220 Z" fill="#FFE5D9" opacity="0.6" />
          {/* Layer 3: Main Pure White curve */}
          <path d="M0,130 C360,195 720,160 1080,185 C1260,195 1350,175 1440,150 L1440,220 L0,220 Z" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Decorative stars and circles in background */}
      <div className="absolute top-[15%] left-[45%] opacity-15 animate-pulse">
        <svg viewBox="0 0 100 100" className="w-12 h-12 fill-white">
          <polygon points="50,0 63,35 100,50 63,65 50,100 37,65 0,50 37,35" />
        </svg>
      </div>
      <div className="absolute top-[45%] left-[2%] opacity-10">
        <svg viewBox="0 0 100 100" className="w-20 h-20 fill-white">
          <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="4" strokeDasharray="10,10" fill="none" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-12 items-center relative z-20">
        
        {/* Left Side: Copy and details */}
        <div className={hideHeroCardImage ? "xl:col-span-12 max-w-4xl mx-auto flex flex-col items-center text-center gap-6" : "xl:col-span-5 flex flex-col items-start gap-6"}>
          {/* Selo Amarelo "ATIVIDADE EM DESTAQUE" */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-1.5 bg-[#FFD22E] text-[#0E2A79] font-black text-xs px-4 py-1.5 rounded-full shadow-lg shadow-black/10 border border-[#F59E0B]"
          >
            <Sparkles size={13} className="fill-[#0E2A79]" />
            <span>ATIVIDADE EM DESTAQUE</span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl xl:text-[48px] font-black tracking-tight leading-[1.1] text-white"
          >
            {bannerTitlePrefix}{' '}
            <span className="text-[#FFD22E] block md:inline underline decoration-wavy decoration-[#37C76A] font-black">
              {bannerTitleHighlight}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/95 text-base md:text-lg font-medium leading-relaxed max-w-2xl"
          >
            {bannerDescription}
          </motion.p>

          {/* 4 Benefits with modern pill designs */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`grid grid-cols-2 gap-3 w-full sm:w-auto text-xs md:text-sm font-extrabold text-white ${hideHeroCardImage ? 'justify-center justify-items-center' : ''}`}
          >
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-full border border-white/10">
              <div className="bg-[#7B61FF] p-1.5 rounded-full">
                <Download size={13} className="text-white" />
              </div>
              <span>Produto digital</span>
            </div>
            
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-full border border-white/10">
              <div className="bg-[#EC4899] p-1.5 rounded-full">
                <Printer size={13} className="text-white" />
              </div>
              <span>Pronto para imprimir</span>
            </div>

            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-full border border-white/10">
              <div className="bg-[#37C76A] p-1.5 rounded-full">
                <Shield size={13} className="text-white" />
              </div>
              <span>Compra pela Hotmart</span>
            </div>

            {featuredProduct?.youtubeUrl && (
              <a 
                href={featuredProduct.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 active:scale-95 transition-all px-4 py-2.5 rounded-full border border-white/10 cursor-pointer text-white"
              >
                <div className="bg-[#37C76A] p-1.5 rounded-full">
                  <Play size={13} className="text-white fill-white" />
                </div>
                <span>Vídeo demonstrativo</span>
              </a>
            )}
          </motion.div>

          {/* Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mt-4"
          >
            {/* EU QUERO (Verde Vibrante) */}
            {featuredProduct && (
              <button 
                onClick={onEuQuero}
                className="flex items-center justify-center gap-3 bg-[#37C76A] hover:bg-[#2ca455] active:scale-95 transition-all text-white font-black text-sm tracking-widest uppercase px-10 py-4.5 rounded-full shadow-xl shadow-[#37C76A]/30 border-2 border-transparent"
              >
                <span>EU QUERO</span>
                <ArrowRight size={16} className="stroke-[3]" />
              </button>
            )}

            {/* VER PRODUTOS (Borda Branca/Azul clara) */}
            <button 
              onClick={onVerProdutos}
              className="flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border-2 border-[#DCE7FF]/80 font-black text-sm tracking-widest uppercase px-8 py-4 rounded-full"
            >
              <ShoppingCart size={15} />
              <span>VER PRODUTOS</span>
            </button>
          </motion.div>
        </div>

        {/* Right Side: A SINGLE Premium Customizable Product Showcase Card (Grid span 7) */}
        {!hideHeroCardImage && (
          <div className="xl:col-span-6 relative w-full select-none flex items-center justify-center pt-8 xl:pt-0">
            {/* Ambient Glows to highlight the single product */}
            <div className="absolute w-80 h-80 rounded-full bg-[#7B61FF]/25 filter blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute w-70 h-70 rounded-full bg-[#FFD22E]/15 filter blur-3xl -z-10 right-10 top-10"></div>

            {/* Simple floating/playful background letters that frame the main product */}
            <div className="absolute left-[2%] top-[10%] rotate-[-15deg] font-black text-5xl text-white/10 select-none hidden xl:block">A</div>
            <div className="absolute right-[5%] bottom-[8%] rotate-[20deg] font-black text-6xl text-[#FFD22E]/20 select-none hidden xl:block">B</div>
            <div className="absolute left-[5%] bottom-[12%] rotate-[-25deg] font-black text-4xl text-[#37C76A]/20 select-none hidden xl:block">★</div>

            {bannerImageMode === 'custom' ? (
              (bannerImageUrl || heroCardImage) ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  whileHover={{ y: -8, rotate: 1, transition: { duration: 0.3 } }}
                  className="relative w-full max-w-[340px] md:max-w-[420px] aspect-square bg-white rounded-[32px] p-2 hover:shadow-[0_30px_70px_-15px_rgba(14,42,121,0.45)] shadow-[0_25px_60px_-15px_rgba(14,42,121,0.3)] border-4 border-[#1E4DDB]/10 overflow-hidden flex items-center justify-center transition-all duration-300"
                >
                  <img src={bannerImageUrl || heroCardImage} alt="Imagem promocional personalizada" className="w-full h-full object-cover rounded-[24px]" referrerPolicy="no-referrer" />
                </motion.div>
              ) : null
            ) : featuredProduct ? (
              <motion.div 
                onClick={() => onSelectProduct && onSelectProduct(featuredProduct.id)}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                className="group cursor-pointer relative w-full xl:max-w-[460px] md:max-w-[400px] max-w-[88%] bg-white rounded-[32px] p-5 hover:shadow-[0_30px_70px_-15px_rgba(14,42,121,0.5)] shadow-[0_25px_60px_-15px_rgba(14,42,121,0.35)] border-4 border-[#1E4DDB]/10 flex flex-col gap-4 transition-all duration-300"
              >
                {/* 1. Header Area: Category Tag & Digital Badge */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="bg-[#FF6A1A] text-white font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-full shadow-sm shadow-[#FF6A1A]/20">
                    {featuredProduct.category || 'PRODUTO EM DESTAQUE'}
                  </span>
                  <span className="bg-[#37C76A]/10 text-[#37C76A] font-extrabold text-[9px] tracking-wide uppercase px-2.5 py-1 rounded-full border border-[#37C76A]/15">
                    100% DIGITAL
                  </span>
                </div>

                {/* 2. Central Product Image Window */}
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 flex items-center justify-center relative overflow-hidden aspect-square w-full">
                  {/* Dynamic Product Image with 100% fit-contain */}
                  <ProductImage 
                    id={featuredProduct.mainImageUrl || featuredProduct.imageUrl || ''} 
                    className="w-full h-full group-hover:scale-102 transition-transform duration-500" 
                    fit="contain" 
                  />
                </div>

                {/* 3. Product Title, Metadata and Price */}
                <div className="text-left flex flex-col gap-2">
                  {/* Metadata line: Age and Page Count */}
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 flex-wrap">
                    {featuredProduct.pages && (
                      <span>{featuredProduct.pages} {featuredProduct.pages === 1 ? 'PDF' : 'PDFs'}</span>
                    )}
                    {featuredProduct.ageRange && (
                      <>
                        {featuredProduct.pages && <span>•</span>}
                        <span className="text-indigo-500 font-extrabold">{featuredProduct.ageRange}</span>
                      </>
                    )}
                  </div>

                  <h3 className="font-black text-[#0E2A79] text-base md:text-lg leading-snug group-hover:text-[#1E4DDB] transition-colors line-clamp-2">
                    {featuredProduct.name}
                  </h3>
                  
                  {/* Price display formatted correctly */}
                  <div className="flex items-baseline gap-2 mt-1">
                    {featuredProduct.promoPrice ? (
                      <>
                        <span className="text-[#37C76A] font-black text-lg md:text-xl">
                          Por: R$ {typeof featuredProduct.promoPrice === 'number' ? featuredProduct.promoPrice.toFixed(2).replace('.', ',') : parseFloat(featuredProduct.promoPrice).toFixed(2).replace('.', ',')}
                        </span>
                        {featuredProduct.price && (
                          <span className="text-slate-400 line-through text-xs font-semibold">
                            De: R$ {typeof featuredProduct.price === 'number' ? featuredProduct.price.toFixed(2).replace('.', ',') : parseFloat(featuredProduct.price).toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </>
                    ) : featuredProduct.price ? (
                      <span className="text-[#37C76A] font-black text-lg md:text-xl">
                        R$ {typeof featuredProduct.price === 'number' ? featuredProduct.price.toFixed(2).replace('.', ',') : parseFloat(featuredProduct.price).toFixed(2).replace('.', ',')}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5 text-[#1E4DDB] font-extrabold text-[11px] uppercase tracking-wider">
                    <span>Ver detalhes do material</span>
                    <ArrowRight size={14} className="stroke-[2.5] transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="relative w-full max-w-[340px] md:max-w-[380px] aspect-[1/1.3] bg-white/95 backdrop-blur-md rounded-[32px] p-8 border-4 border-dashed border-[#1E4DDB]/20 flex flex-col justify-center items-center text-center gap-4 shadow-xl"
              >
                <div className="bg-[#1E4DDB]/5 p-4 rounded-full text-[#1E4DDB] animate-pulse">
                  <Sparkles size={32} />
                </div>
                <h3 className="font-extrabold text-[#0E2A79] text-base md:text-lg leading-tight uppercase tracking-wider">
                  Produto em destaque ainda não configurado
                </h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  Acesse o Painel Administrativo para selecionar qual produto deve aparecer nesta área principal.
                </p>
              </motion.div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
