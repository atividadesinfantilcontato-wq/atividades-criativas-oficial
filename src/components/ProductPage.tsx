import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShoppingCart, 
  ExternalLink, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  CheckCircle, 
  HelpCircle,
  FileText,
  Calendar,
  Layers,
  Heart,
  Mail,
  Download,
  AlertCircle
} from 'lucide-react';
import { Product } from '../types';
import { isDemoEnvironment } from '../data/demoProducts';
import ProductImage from './ProductImage';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

function renderFormattedActivityInfo(text: string) {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="list-disc pl-5 my-3 space-y-1.5 text-slate-600">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      flushList();
      elements.push(<div key={`space-${idx}`} className="h-2" />);
      return;
    }

    const listMatch = trimmedLine.match(/^[-*•]\s*(.*)$/) || trimmedLine.match(/^\d+[\s.-]\s*(.*)$/);
    if (listMatch) {
      currentList.push(
        <li key={`li-${idx}`} className="leading-relaxed">
          {listMatch[1]}
        </li>
      );
      return;
    }

    flushList();

    if (trimmedLine.includes(':')) {
      const parts = trimmedLine.split(':');
      const titlePart = parts[0].trim();
      const contentPart = parts.slice(1).join(':').trim();
      
      if (contentPart) {
        elements.push(
          <p key={`colon-${idx}`} className="leading-relaxed">
            <strong className="text-slate-800 font-extrabold">{titlePart}:</strong> {contentPart}
          </p>
        );
      } else {
        elements.push(
          <h4 key={`sub-${idx}`} className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wide mt-4 mb-2">
            {titlePart}
          </h4>
        );
      }
      return;
    }

    const isShort = trimmedLine.length < 50;
    const noPunctuation = !/[.?!,;]$/.test(trimmedLine);
    const isKnownHeader = /^(sobre|como|o que|objetivos|informações|passo|instruções|impressão|materiais)/i.test(trimmedLine);
    
    if ((isShort && noPunctuation) || isKnownHeader) {
      elements.push(
        <h4 key={`title-${idx}`} className="text-xs md:text-sm font-black text-[#FF6A1A] uppercase tracking-wider mt-4 mb-2">
          {trimmedLine}
        </h4>
      );
      return;
    }

    elements.push(
      <p key={`para-${idx}`} className="leading-relaxed">
        {trimmedLine}
      </p>
    );
  });

  flushList();
  return <div className="space-y-3 text-slate-600 text-xs md:text-sm font-medium leading-relaxed">{elements}</div>;
}

interface ProductPageProps {
  product: Product;
  relatedProducts: Product[];
  onBackToHome: () => void;
  onSelectProduct: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  isInCart: boolean;
}

export default function ProductPage({
  product,
  relatedProducts,
  onBackToHome,
  onSelectProduct,
  onAddToCart,
  isInCart
}: ProductPageProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // States for Free PDF Download Gating
  const [subscriberName, setSubscriberName] = useState('');
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubscribeAndDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberName.trim() || !subscriberEmail.trim()) {
      setSubmitError('Por favor, preencha todos os campos.');
      return;
    }
    if (!subscriberEmail.includes('@') || !subscriberEmail.includes('.')) {
      setSubmitError('Por favor, insira um e-mail válido.');
      return;
    }

    setSubmittingEmail(true);
    setSubmitError('');

    try {
      await addDoc(collection(db, 'subscribers'), {
        name: subscriberName.trim(),
        email: subscriberEmail.trim().toLowerCase(),
        productId: product.id,
        productName: product.name,
        subscribedAt: new Date().toISOString()
      });

      setEmailSubmitted(true);
      if (product.freePdfUrl) {
        window.open(product.freePdfUrl, '_blank');
      }
    } catch (err: any) {
      console.error('Error saving subscriber:', err);
      setSubmitError('Erro ao registrar e-mail. Por favor, tente novamente.');
    } finally {
      setSubmittingEmail(false);
    }
  };

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImageIndex(0);
  }, [product.id]);

  const {
    name,
    category,
    tag,
    ageRange,
    pages,
    format,
    printSize,
    price,
    promoPrice,
    youtubeUrl,
    hotmartUrl,
    shortDescription,
    description,
    activityInfo,
    whatYouWillReceive,
    objectives,
    howToUse,
    materialsNeeded,
    howToPrint
  } = product;

  const isFree = product.productType === 'gratuito' || (product as any).isFree;

  // Construct list of unique images for the gallery, making sure the mainImageUrl is the first item and strongly deduplicating
  const galleryUrls = React.useMemo(() => {
    const urls: string[] = [];
    const main = (product.mainImageUrl || product.imageUrl || '').trim();
    if (main) {
      urls.push(main);
    }
    const rawGallery = product.galleryUrls || product.galleryImages || [];
    rawGallery.forEach((url: string) => {
      const trimmed = (url || '').trim();
      // Only include gallery images that are not equal to the main image and not already in the array
      if (trimmed && trimmed.toLowerCase() !== main.toLowerCase() && !urls.map(u => u.toLowerCase()).includes(trimmed.toLowerCase())) {
        urls.push(trimmed);
      }
    });
    return urls.filter(Boolean);
  }, [product.mainImageUrl, product.imageUrl, product.galleryUrls, product.galleryImages]);

  // Extract YouTube ID safely for iframe embedding
  const getYoutubeEmbedUrl = (url?: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? `https://www.youtube.com/embed/${id}` : null;
  };

  const embedUrl = getYoutubeEmbedUrl(youtubeUrl);
  const hasDiscount = promoPrice !== undefined && promoPrice < price;
  const currentPrice = hasDiscount ? promoPrice! : price;

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryUrls.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + galleryUrls.length) % galleryUrls.length);
  };

  const handleCartClick = () => {
    onAddToCart(product);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <main id="product-details-page" className="bg-[#FDFBF7] py-12 px-4 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Button / Breadcrumb */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-200/50 pb-4">
          <button 
            onClick={onBackToHome}
            className="flex items-center gap-2 text-slate-600 hover:text-[#37C76A] font-extrabold text-xs md:text-sm uppercase tracking-wider transition-colors"
          >
            <ArrowLeft size={16} className="stroke-[3]" />
            <span>Voltar para a Loja</span>
          </button>

          <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">
            Início / {category} / {name.split(' ')[0]}
          </span>
        </div>

        {/* Dynamic Multi-Column Details Layout (2 Columns on Desktop, 1 Column on Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          
          {/* LEFT COL: Image Gallery (Grid span 7) */}
          <div className="lg:col-span-7 flex flex-col gap-5 w-full">
            
            {/* Main large image viewport (620x580 max layout styled as a selling digital product card) */}
            <div className="w-full max-w-[620px] h-[360px] sm:h-[460px] lg:h-[580px] mx-auto relative rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm bg-white group select-none flex items-center justify-center">
              
              {/* Star / Special Category badge - made small and elegant */}
              {tag && (
                <div className="absolute top-3 left-3 z-10 bg-red-500 text-white font-extrabold text-[8px] tracking-wider uppercase px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <Sparkles size={8} className="fill-current" />
                  <span>{tag}</span>
                </div>
              )}

              {(product as any).isDemo && isDemoEnvironment() && (
                <div className="absolute top-3 right-3 z-10 bg-slate-900/80 backdrop-blur-sm text-slate-100 font-extrabold text-[8px] tracking-wider uppercase px-2 py-0.5 rounded shadow-sm">
                  DEMONSTRAÇÃO
                </div>
              )}

              {/* Render Image (custom dynamic visual drawings) with 100% contain and zero crop */}
              <div className={`w-full h-full transition-transform duration-300 ${zoomActive ? 'scale-110 cursor-zoom-out' : 'scale-100'} flex items-center justify-center p-3 sm:p-5 bg-white`}>
                <ProductImage id={galleryUrls[activeImageIndex]} className="aspect-auto w-full h-full rounded-2xl border-none bg-white shadow-none" fit="contain" />
              </div>

              {/* Navigation Arrows inside Viewport */}
              {galleryUrls.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 text-slate-950 hover:bg-[#37C76A] hover:text-white p-2 rounded-full shadow-md active:scale-90 transition-all z-10 cursor-pointer"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft size={16} className="stroke-[3]" />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 text-slate-950 hover:bg-[#37C76A] hover:text-white p-2 rounded-full shadow-md active:scale-90 transition-all z-10 cursor-pointer"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight size={16} className="stroke-[3]" />
                  </button>
                </>
              )}

              {/* Zoom trigger toggle */}
              <button 
                onClick={() => setZoomActive(!zoomActive)}
                className="absolute bottom-3 right-3 bg-white/90 text-slate-700 hover:text-[#37C76A] p-2 rounded-full shadow-sm z-10 transition-colors"
                title="Ampliar Imagem"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            {/* Gallery Miniatures / Thumbnails Grid */}
            {galleryUrls.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-2">
                {galleryUrls.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setZoomActive(false);
                    }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 bg-white transition-all p-0.5 cursor-pointer ${
                      activeImageIndex === idx 
                        ? 'border-[#37C76A] scale-105 shadow-sm' 
                        : 'border-slate-200/60 hover:border-slate-300'
                    }`}
                  >
                    <ProductImage id={img} className="aspect-auto w-full h-full rounded-lg border-none bg-white p-0.5" fit="contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COL: Product details & actions (Grid span 5) */}
          <div className="lg:col-span-5 flex flex-col items-start text-left gap-5 w-full">
            {/* Category Breadcrumb and verified badge */}
            <div className="flex items-center gap-2">
              <span className="text-[#37C76A] font-extrabold text-xs tracking-wider uppercase bg-[#37C76A]/10 px-3 py-1 rounded-full">
                {category}
              </span>
              <span className="bg-emerald-50 text-emerald-600 font-black text-[9px] tracking-widest px-2.5 py-1 rounded-full uppercase border border-emerald-100">
                100% Digital e Seguro
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight leading-tight">
              {name}
            </h1>

            {/* Short Description */}
            <p className="text-slate-600 text-xs md:text-sm font-medium leading-relaxed">
              {shortDescription}
            </p>

            {/* High-Contrast Specifications Grid Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Faixa Etária</span>
                <div className="flex items-center gap-1 font-extrabold text-slate-800 text-xs">
                  <Calendar size={13} className="text-blue-500" />
                  <span>{ageRange}</span>
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Arquivos</span>
                <div className="flex items-center gap-1 font-extrabold text-slate-800 text-xs">
                  <FileText size={13} className="text-purple-500" />
                  <span>{pages} {pages === 1 ? 'PDF' : 'PDFs'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Formato</span>
                <div className="flex items-center gap-1 font-extrabold text-slate-800 text-xs">
                  <Layers size={13} className="text-emerald-500" />
                  <span>Pronto em PDF</span>
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Impressão</span>
                <div className="flex items-center gap-1 font-extrabold text-slate-800 text-xs">
                  <CheckCircle size={13} className="text-amber-500" />
                  <span>Tamanho {printSize}</span>
                </div>
              </div>
            </div>

            {/* Price Box */}
            {!isFree ? (
              <div className="py-2 flex flex-col items-start">
                {hasDiscount ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm text-slate-400 line-through font-bold">
                        Original: R$ {price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="bg-[#37C76A]/10 text-[#37C76A] font-extrabold text-[10px] uppercase px-2 py-0.5 rounded">
                        Promoção Especial
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xs text-slate-500 font-bold">Por apenas</span>
                      <span className="text-3xl font-black text-[#37C76A]">
                        R$ {promoPrice!.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-slate-500 font-bold">Preço de tabela:</span>
                    <span className="text-3xl font-black text-slate-900">
                      R$ {price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-3 px-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-start text-left gap-1 mt-1">
                <span className="bg-[#37C76A] text-white font-black text-[9px] tracking-widest px-2.5 py-0.5 rounded uppercase">
                  Material Gratuito
                </span>
                <span className="text-slate-500 text-[11px] font-bold mt-1">Este material está disponível inteiramente grátis para download.</span>
                <span className="text-emerald-700 font-black text-xs uppercase tracking-wide">Arquivo digital em PDF.</span>
              </div>
            )}

            {/* Action Buttons: Compra Hotmart & Adicionar ao carrinho OR Free PDF actions */}
            <div className="w-full mt-2 text-left">
              {isFree ? (
                <div className="space-y-4 w-full">
                  {!product.freePdfUrl ? (
                    <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                      <AlertCircle className="text-slate-400" size={24} />
                      <span className="font-extrabold text-sm text-slate-700">PDF ainda não disponível</span>
                      <span className="text-xs text-slate-400 font-semibold">A administradora do site enviará o arquivo PDF em breve.</span>
                    </div>
                  ) : product.requireEmailBeforeDownload && !emailSubmitted ? (
                    <form onSubmit={handleSubscribeAndDownload} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-3.5 text-left">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <Mail size={16} />
                        <h4 className="font-extrabold text-xs tracking-wider uppercase">Receber Material Gratuito</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                        Preencha seu nome e e-mail abaixo para liberar o botão e baixar o PDF completo de atividades grátis instantaneamente!
                      </p>

                      <div className="space-y-2.5">
                        <input
                          type="text"
                          required
                          value={subscriberName}
                          onChange={(e) => setSubscriberName(e.target.value)}
                          placeholder="Seu nome completo"
                          className="w-full bg-white border border-slate-200 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#37C76A] font-bold text-slate-800 placeholder-slate-400"
                        />
                        <input
                          type="email"
                          required
                          value={subscriberEmail}
                          onChange={(e) => setSubscriberEmail(e.target.value)}
                          placeholder="Seu melhor e-mail"
                          className="w-full bg-white border border-slate-200 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#37C76A] font-bold text-slate-800 placeholder-slate-400"
                        />
                      </div>

                      {submitError && (
                        <div className="text-red-600 text-[11px] font-bold flex items-center gap-1.5">
                          <AlertCircle size={13} className="shrink-0" />
                          <span>{submitError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submittingEmail}
                        className="w-full bg-[#37C76A] hover:bg-[#2ca455] active:scale-95 disabled:opacity-50 transition-all text-white font-black text-sm tracking-wide uppercase py-3 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        {submittingEmail ? 'Processando...' : 'Liberar Download Grátis'}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      {emailSubmitted && (
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-800 text-xs font-bold text-center">
                          E-mail registrado com sucesso! O download foi liberado abaixo.
                        </div>
                      )}
                      <a
                        href={product.freePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#37C76A] hover:bg-[#2ca455] active:scale-95 transition-all text-white font-black text-sm tracking-wider uppercase py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-[#37C76A]/20 text-center cursor-pointer"
                      >
                        <Download size={16} className="stroke-[3]" />
                        <span>BAIXAR GRÁTIS</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full">
                  {/* Button: COMPRAR AGORA (Redirect to Hotmart URL) */}
                  <a 
                    href={(product as any).isDemo ? '#' : hotmartUrl}
                    onClick={(e) => {
                      if ((product as any).isDemo) {
                        e.preventDefault();
                        alert("Produto de demonstração. Cadastre o link real da Hotmart no painel.");
                      }
                    }}
                    target={(product as any).isDemo ? undefined : "_blank"}
                    rel={(product as any).isDemo ? undefined : "noopener noreferrer"}
                    className="flex-grow bg-[#37C76A] hover:bg-[#2ca455] active:scale-95 transition-all text-white font-black text-sm tracking-wider uppercase py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-[#37C76A]/20 text-center cursor-pointer"
                  >
                    <span>COMPRAR AGORA (HOTMART)</span>
                    <ExternalLink size={15} className="stroke-[3]" />
                  </a>

                  {/* Button: ADICIONAR À LISTA DE INTERESSE */}
                  <button 
                    onClick={handleCartClick}
                    className={`sm:w-auto px-6 py-4 rounded-2xl font-black text-xs md:text-sm uppercase tracking-wide border-2 flex items-center justify-center gap-2 active:scale-95 transition-all ${
                      isInCart 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <ShoppingCart size={15} />
                    <span>{isInCart ? 'Salvo na Lista!' : 'Salvar Escolha'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Added confirmation pop-up */}
            {addedAnimation && (
              <div className="bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 self-stretch justify-center shadow animate-scaleUp">
                <CheckCircle size={14} className="stroke-[3]" />
                <span>Produto adicionado à sua Lista de Interesse!</span>
              </div>
            )}

            {/* Trust disclaimer */}
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider self-stretch text-center border-t border-slate-100 pt-4 mt-2">
              <Sparkles size={11} className="text-[#37C76A]" />
              <span>Pagamento e entrega realizados de forma segura pela Hotmart.</span>
            </div>

          </div>

        </div>

        {/* SECTION: Veja na Prática (YouTube Video) */}
        {embedUrl ? (
          <section id="product-video-section" className="bg-[#FFFFFF] rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm mb-16 text-center max-w-4xl mx-auto">
            <span className="text-[#37C76A] font-extrabold text-xs tracking-widest uppercase bg-[#37C76A]/10 px-3 py-1 rounded-full self-center inline-block">
              VEJA NA PRÁTICA
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-950 mt-2 mb-6">
              Assista à demonstração desta atividade pedagógica
            </h2>

            {/* Video Player Wrapper (16:9 responsive size) */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-slate-900">
              <iframe
                src={embedUrl}
                title={`Demonstração de ${name}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </section>
        ) : null}

        {/* SECTION: Full Detailed Description (Sobre, O que receberá, Objetivos, Como usar, Como imprimir, etc.) */}
        <section id="product-full-details" className="bg-[#FFFFFF] rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm mb-16 text-left max-w-4xl mx-auto flex flex-col gap-8">
          
          {/* 1. Sobre esta atividade */}
          {(activityInfo || description) && (
            <div>
              <h3 className="font-extrabold text-slate-950 text-base md:text-lg border-b border-slate-100 pb-2 mb-4">
                Informações da atividade
              </h3>
              {renderFormattedActivityInfo(activityInfo || description || '')}
            </div>
          )}

          {/* 2. O que você receberá no arquivo PDF */}
          {whatYouWillReceive && whatYouWillReceive.length > 0 && (
            <div>
              <h3 className="font-extrabold text-slate-950 text-base md:text-lg border-b border-slate-100 pb-2 mb-3">
                O que você receberá no arquivo PDF
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs md:text-sm font-medium text-slate-600">
                {whatYouWillReceive.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-black shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. Objetivos pedagógicos */}
          {objectives && objectives.length > 0 && (
            <div>
              <h3 className="font-extrabold text-slate-950 text-base md:text-lg border-b border-slate-100 pb-2 mb-3">
                Objetivos pedagógicos (alinhados com a BNCC)
              </h3>
              <ul className="flex flex-col gap-2.5 text-xs md:text-sm font-medium text-slate-600">
                {objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold shrink-0">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 4. Como aplicar com a criança */}
          {howToUse && howToUse.length > 0 && (
            <div>
              <h3 className="font-extrabold text-slate-950 text-base md:text-lg border-b border-slate-100 pb-2 mb-3">
                Passo a passo: Como aplicar a atividade
              </h3>
              <ol className="flex flex-col gap-3 text-xs md:text-sm font-medium text-slate-600 list-decimal pl-4">
                {howToUse.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Materials Needed (Optional) */}
          {materialsNeeded && materialsNeeded.length > 0 && (
            <div>
              <h3 className="font-extrabold text-slate-950 text-base md:text-lg border-b border-slate-100 pb-2 mb-3">
                Materiais complementares recomendados
              </h3>
              <div className="flex flex-wrap gap-2">
                {materialsNeeded.map((mat, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 font-semibold text-xs px-3.5 py-1.5 rounded-full">
                    • {mat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Print guidelines (How to Print) */}
          {howToPrint && (
            <div className="bg-[#37C76A]/5 border border-[#37C76A]/10 p-5 rounded-2xl">
              <h4 className="font-extrabold text-[#37C76A] text-xs md:text-sm uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <HelpCircle size={15} />
                <span>Instruções de Impressão e Montagem</span>
              </h4>
              <p className="text-slate-600 text-xs md:text-sm font-medium leading-relaxed">
                {howToPrint}
              </p>
            </div>
          )}

          {/* 5. Informações do material (Cards) */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-extrabold text-slate-950 text-base md:text-lg mb-4">
              Informações do material
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Card 1: Categoria */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categoria</span>
                <span className="text-xs md:text-sm font-black text-slate-800">{category || 'Pedagógico'}</span>
              </div>
              
              {/* Card 2: Tipo de Material */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo de material</span>
                <span className="text-xs md:text-sm font-black text-slate-800">
                  {isFree ? 'Download Grátis 🎁' : 'Material Pago 🔒'}
                </span>
              </div>

              {/* Card 3: Quantidade de PDFs */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantidade de PDFs</span>
                <span className="text-xs md:text-sm font-black text-slate-800">{pages} {pages === 1 ? 'arquivo PDF' : 'arquivos PDF'}</span>
              </div>

              {/* Card 4: Formato */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formato</span>
                <span className="text-xs md:text-sm font-black text-slate-800">{format || 'PDF de alta qualidade'}</span>
              </div>

              {/* Card 5: Impressão recomendada */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Impressão recomendada</span>
                <span className="text-xs md:text-sm font-black text-slate-800">Tamanho {printSize || 'A4'} (Cores vivas)</span>
              </div>

              {/* Card 6: Entrega digital */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entrega digital</span>
                <span className="text-xs md:text-sm font-black text-slate-800">Envio imediato no e-mail</span>
              </div>
            </div>
          </div>

          {/* Digital product disclaimer */}
          <div className="border-t border-slate-100 pt-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center flex flex-col items-center gap-1">
            <span>💻 AVISO DE PRODUTO DIGITAL</span>
            <span>Nenhum material físico será enviado pelo correio. Você receberá o link para baixar o arquivo PDF instantaneamente.</span>
          </div>

        </section>

        {/* RELATED PRODUCTS */}
        <section id="related-products-section" className="border-t border-slate-200/60 pt-12">
          <div className="flex flex-col items-start gap-1 mb-8 text-left">
            <span className="text-[#37C76A] font-extrabold text-xs tracking-widest uppercase bg-[#37C76A]/10 px-3 py-1 rounded-full">
              VEJA TAMBÉM
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-950">
              Produtos Relacionados
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {relatedProducts.slice(0, 3).map((prod) => (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod.id)}
                className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between group transition-all"
              >
                <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-4 border border-slate-50">
                  <ProductImage id={prod.mainImageUrl || prod.imageUrl} className="group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div>
                  <span className="text-[#37C76A] text-[10px] font-black uppercase tracking-wider block mb-1">
                    {prod.category}
                  </span>
                  <h3 className="font-extrabold text-slate-950 text-sm leading-tight line-clamp-1 group-hover:text-[#37C76A] transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-slate-500 text-[11px] font-medium line-clamp-2 mt-1.5 leading-relaxed">
                    {prod.shortDescription}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 border-t border-slate-50 pt-3">
                  <span className="font-black text-sm text-slate-900 leading-none">
                    {prod.productType === 'gratuito' || prod.isFree ? (
                      <span className="text-[#37C76A]">Grátis 🎁</span>
                    ) : (
                      `R$ ${(prod.promoPrice || prod.price).toFixed(2).replace('.', ',')}`
                    )}
                  </span>
                  <button className="bg-[#37C76A] hover:bg-[#2ca455] text-white font-black text-[10px] uppercase px-3 py-1.5 rounded-full">
                    Ver Atividade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
