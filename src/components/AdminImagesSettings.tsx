import React, { useState } from 'react';
import { 
  Sparkles, Save, CheckCircle2, AlertCircle, ShoppingBag, Eye, HelpCircle
} from 'lucide-react';
import { SiteConfig, Product } from '../types';
import ImageFieldEditor from './ImageFieldEditor';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface AdminImagesSettingsProps {
  siteConfig: SiteConfig;
  onUpdateSiteConfig: (config: SiteConfig) => void;
  onSuccess: (message: string) => void;
  onBack: () => void;
  products: Product[];
}

export default function AdminImagesSettings({
  siteConfig,
  onUpdateSiteConfig,
  onSuccess,
  onBack,
  products
}: AdminImagesSettingsProps) {
  const [config, setConfig] = useState<SiteConfig>({ ...siteConfig });
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSaveStatus, setProductSaveStatus] = useState<'saved' | 'saving' | 'error' | 'changed'>('saved');
  const [productError, setProductError] = useState<string | null>(null);

  const handleUpdate = (updated: SiteConfig) => {
    setConfig(updated);
    onUpdateSiteConfig(updated);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setConfig(prev => ({ ...prev, featuredProductId: val }));
    setProductSaveStatus('changed');
  };

  const handleSaveProduct = async () => {
    setIsSavingProduct(true);
    setProductSaveStatus('saving');
    setProductError(null);

    try {
      const selectedId = config.featuredProductId || '';
      console.log('[Diagnostic] Saving featuredProductId to Firestore:', selectedId);
      
      const docRef = doc(db, 'siteConfig', 'global');
      await updateDoc(docRef, {
        featuredProductId: selectedId,
        updatedAt: new Date().toISOString()
      });

      // === RIGOROUS AUDIT VERIFICATION ===
      console.log('[Diagnostic] Verifying featuredProductId in Firestore...');
      const snapVerify = await getDoc(docRef);
      if (!snapVerify.exists()) {
        throw new Error('O documento de configuração global não foi encontrado.');
      }

      const verifiedData = snapVerify.data();
      if (verifiedData.featuredProductId !== selectedId) {
        throw new Error('Erro de confirmação: O valor de featuredProductId no Firestore não bate com o enviado.');
      }

      console.log('[Diagnostic] Verification successful. Synced in Firestore.');
      
      // Update global app state
      const updatedConfig = {
        ...siteConfig,
        ...verifiedData,
        featuredProductId: selectedId
      };
      
      onUpdateSiteConfig(updatedConfig);
      setProductSaveStatus('saved');
      onSuccess('Produto em destaque atualizado e verificado com sucesso!');
    } catch (error: any) {
      console.error('[Diagnostic] Error saving featured product ID:', error);
      setProductSaveStatus('error');
      setProductError(error.message || String(error));
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Find currently selected product for the preview
  const selectedProduct = products.find(p => p.id === config.featuredProductId);

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 space-y-8 animate-fadeIn text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-black text-slate-800 text-lg">Central de Imagens do Site</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Gerencie todas as mídias, banners, logos e fotos visíveis no site público</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer self-start sm:self-center"
        >
          Voltar para Painel
        </button>
      </div>

      <div className="space-y-8">
        
        {/* 1. LOGO */}
        <div className="space-y-2">
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex items-center gap-2">
            <span className="bg-indigo-500 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-sm">Banco</span>
            <code className="text-xs font-mono text-indigo-700">siteConfig/global.logoUrl</code>
          </div>
          <ImageFieldEditor
            field="logoUrl"
            label="Logo Oficial do Site"
            recommendation="PNG, WEBP ou SVG transparente. Tamanho sugerido: 220px x 70px."
            siteConfig={config}
            onUpdate={handleUpdate}
            onSuccess={onSuccess}
            storagePathPrefix="site/logo"
            objectFit="contain"
          />
        </div>

        {/* 2. BANNER PRINCIPAL (FUNDO) */}
        <div className="space-y-2">
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex items-center gap-2">
            <span className="bg-indigo-500 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-sm">Banco</span>
            <code className="text-xs font-mono text-indigo-700">siteConfig/global.heroBackgroundImageUrl</code>
          </div>
          <ImageFieldEditor
            field="heroBackgroundImageUrl"
            label="Banner Principal da Home (Imagem de Fundo)"
            recommendation="Alta resolução. Recomendado 1920px x 600px. Se deixado vazio, usará um gradiente azul."
            siteConfig={config}
            onUpdate={handleUpdate}
            onSuccess={onSuccess}
            storagePathPrefix="site/banner"
            objectFit="cover"
          />
        </div>

        {/* 3. PRODUTO EM DESTAQUE DO BANNER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Produto em Destaque do Banner</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                Recomendado: <span className="text-slate-600">Selecione um produto cadastrado para destacar no banner.</span>
              </p>
            </div>
            
            {/* Status */}
            <div className="flex items-center gap-1.5 self-start sm:self-center">
              {productSaveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 bg-green-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <CheckCircle2 size={12} className="stroke-[3]" />
                  Confirmado no Banco
                </span>
              )}
              {productSaveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                  Gravando...
                </span>
              )}
              {productSaveStatus === 'changed' && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                  <AlertCircle size={12} className="stroke-[3]" />
                  Pendente de Salvar
                </span>
              )}
              {productSaveStatus === 'error' && (
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Erro ao salvar
                </span>
              )}
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex items-center gap-2">
            <span className="bg-indigo-500 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-sm">Banco</span>
            <code className="text-xs font-mono text-indigo-700">siteConfig/global.featuredProductId</code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Escolha o produto em destaque</label>
                <select
                  value={config.featuredProductId || ''}
                  onChange={handleProductChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4DDB] font-extrabold"
                >
                  <option value="">Nenhum produto em destaque (esconde a exibição do produto no banner)</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.isKit ? '🎁 (Kit)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {productError && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                  <AlertCircle size={16} className="shrink-0 stroke-[2.5]" />
                  <span>{productError}</span>
                </div>
              )}

              {productSaveStatus === 'changed' && (
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  disabled={isSavingProduct}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#37C76A] hover:bg-[#2ca455] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Save size={14} />
                  <span>Salvar Destaque</span>
                </button>
              )}
            </div>

            <div className="md:col-span-5 flex justify-center">
              <div className="w-full max-w-[200px] aspect-square bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden shadow-xs">
                {selectedProduct ? (
                  <>
                    {selectedProduct.mainImageUrl ? (
                      <img 
                        src={selectedProduct.mainImageUrl} 
                        alt="Preview do produto em destaque" 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-slate-400 text-xs font-bold flex flex-col items-center gap-2">
                        <ShoppingBag size={24} />
                        <span>Produto sem imagem principal cadastrada</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 text-white text-[9px] font-black uppercase tracking-wider py-1 truncate px-2">
                      {selectedProduct.name}
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 text-xs font-bold flex flex-col items-center gap-2">
                    <Eye size={24} />
                    <span>Nenhum produto selecionado</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. FOTO DA AUTORA */}
        <div className="space-y-2">
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex items-center gap-2">
            <span className="bg-indigo-500 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-sm">Banco</span>
            <code className="text-xs font-mono text-indigo-700">siteConfig/global.authorPhotoUrl</code>
          </div>
          <ImageFieldEditor
            field="authorPhotoUrl"
            label="Foto da Autora"
            recommendation="Retrato ou foto quadrada de alta qualidade de Andreia Silva. Recomendado: 400px x 500px."
            siteConfig={config}
            onUpdate={handleUpdate}
            onSuccess={onSuccess}
            storagePathPrefix="site/author"
            objectFit="cover"
          />
        </div>

        {/* 5. IMAGEM DO KIT EM DESTAQUE */}
        <div className="space-y-2">
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex items-center gap-2">
            <span className="bg-indigo-500 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-sm">Banco</span>
            <code className="text-xs font-mono text-indigo-700">siteConfig/global.featuredKitImageUrl</code>
          </div>
          <ImageFieldEditor
            field="featuredKitImageUrl"
            label="Imagem do Kit em Destaque"
            recommendation="PNG ou JPG de alta qualidade apresentando os materiais do kit. Recomendado: 600px x 450px."
            siteConfig={config}
            onUpdate={handleUpdate}
            onSuccess={onSuccess}
            storagePathPrefix="site/kit"
            objectFit="cover"
          />
        </div>

        {/* 6. IMAGEM DA NEWSLETTER */}
        <div className="space-y-2">
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex items-center gap-2">
            <span className="bg-indigo-500 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-sm">Banco</span>
            <code className="text-xs font-mono text-indigo-700">siteConfig/global.newsletterImageUrl</code>
          </div>
          <ImageFieldEditor
            field="newsletterImageUrl"
            label="Imagem da Seção Newsletter"
            recommendation="Ilustração lúdica com crianças ou livros para convite de e-mail. Recomendado: 500px x 400px."
            siteConfig={config}
            onUpdate={handleUpdate}
            onSuccess={onSuccess}
            storagePathPrefix="site/newsletter"
            objectFit="contain"
          />
        </div>

        {/* 7. IMAGEM DO RODAPÉ */}
        <div className="space-y-2">
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex items-center gap-2">
            <span className="bg-indigo-500 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-sm">Banco</span>
            <code className="text-xs font-mono text-indigo-700">siteConfig/global.footerImageUrl</code>
          </div>
          <ImageFieldEditor
            field="footerImageUrl"
            label="Imagem Decorativa do Rodapé"
            recommendation="Desenho lúdico ou ilustração de rodapé. Deixe em branco se preferir o rodapé padrão."
            siteConfig={config}
            onUpdate={handleUpdate}
            onSuccess={onSuccess}
            storagePathPrefix="site/footer"
            objectFit="contain"
          />
        </div>

      </div>
    </div>
  );
}
