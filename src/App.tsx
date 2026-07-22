import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, DEMO_REVIEWS, INITIAL_SITE_CONFIG } from './data';
import { DEMO_PRODUCTS } from './data/demoProducts';
import { Product, CartItem, Review, SiteConfig, sanitizeProduct } from './types';
import { onAuthStateChanged } from 'firebase/auth';
import { compressImage, ensureSafeProductPayload } from './utils/imageCompressor';
import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, logoutUser, validateAdminUser, OperationType } from './firebase';

// Import all sections and components
import PromoBar from './components/PromoBar';
import Header from './components/Header';
import Banner from './components/Banner';
import Benefits from './components/Benefits';
import Categories from './components/Categories';
import DestaqueSection from './components/DestaqueSection';
import WhyChooseUs from './components/WhyChooseUs';
import MostLovedSection from './components/MostLovedSection';
import ReviewsSection from './components/ReviewsSection';
import TipsAndContent from './components/TipsAndContent';
import HotmartTrustSection from './components/HotmartTrustSection';
import Newsletter from './components/Newsletter';
import ActivityGroup from './components/ActivityGroup';
import Footer from './components/Footer';
import ProductPage from './components/ProductPage';
import CartDrawer from './components/CartDrawer';
import AdminPanel from './components/AdminPanel';
import AdminLoginModal from './components/AdminLoginModal';
import { Shield, ArrowRight } from 'lucide-react';
import ProductImage from './components/ProductImage';

export default function App() {
  // Store dynamic real products, reviews, and site configuration
  const [realProducts, setRealProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>(DEMO_REVIEWS);
  const [rawSiteConfig, setRawSiteConfig] = useState<SiteConfig>(INITIAL_SITE_CONFIG);
  const [heroConfig, setHeroConfig] = useState<any>(null);

  const combinedSiteConfig = useMemo(() => {
    if (!heroConfig) return rawSiteConfig;
    return {
      ...rawSiteConfig,
      heroBackgroundImage: heroConfig.backgroundImageUrl || '',
      heroBackgroundImageStoragePath: heroConfig.backgroundImageStoragePath || '',
      heroCardImage: heroConfig.customProductImageUrl || '',
      heroCardImageStoragePath: heroConfig.customProductImageStoragePath || '',
      featuredProductId: heroConfig.featuredProductId || '',
      bannerImageMode: heroConfig.imageSource === 'custom' ? 'custom' : 'linked',
      bannerImageSource: heroConfig.imageSource || 'product',
      bannerTitlePrefix: heroConfig.titlePrefix || '',
      bannerTitleHighlight: heroConfig.title || '',
      bannerDescription: heroConfig.subtitle || '',
      updatedAt: heroConfig.updatedAt || rawSiteConfig.updatedAt || '',
      updatedBy: heroConfig.updatedBy || rawSiteConfig.updatedBy || '',
    };
  }, [rawSiteConfig, heroConfig]);

  const siteConfig = combinedSiteConfig;

  // Sync products from Firestore in real-time
  useEffect(() => {
    const path = 'products';
    const unsubscribe = onSnapshot(collection(db, path), async (snapshot) => {
      if (snapshot.empty) {
        setRealProducts([]);
      } else {
        const prodList: Product[] = [];
        snapshot.forEach((doc) => {
          const raw = doc.data();
          const p = { ...raw, id: raw.id || doc.id };
          prodList.push(sanitizeProduct(p));
        });
        
        // Sort by displayOrder, then by createdAt newer first
        prodList.sort((a, b) => {
          const orderA = a.displayOrder !== undefined ? a.displayOrder : (a.order !== undefined ? a.order : 0);
          const orderB = b.displayOrder !== undefined ? b.displayOrder : (b.order !== undefined ? b.order : 0);
          if (orderA !== orderB) return orderA - orderB;
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        setRealProducts(prodList);
      }
    }, (error) => {
      console.warn('Firestore read error for products (using empty real list, will fall back to demo):', error);
      setRealProducts([]);
    });

    return () => unsubscribe();
  }, []);

  // Combined products list for public-facing store: real products prioritized. Demo products only visible if NO real products exist/are active.
  const products = useMemo(() => {
    const activeReal = realProducts.filter(p => p.isActive === true && p.isDeleted !== true);
    
    if (activeReal.length > 0) {
      // Only show real products. Absolutely no demo products when real ones are published.
      return activeReal.map(p => ({
        ...p,
        isDemo: false
      }));
    }
    
    // Fallback to demo products only when no real products are published
    return DEMO_PRODUCTS.map(demo => ({
      ...demo,
      isDemo: true
    }));
  }, [realProducts]);

  // Sync reviews from Firestore in real-time
  useEffect(() => {
    const path = 'reviews';
    const unsubscribe = onSnapshot(collection(db, path), async (snapshot) => {
      if (snapshot.empty) {
        if (auth.currentUser?.email === 'atividadesinfantilcontato@gmail.com') {
          try {
            for (const rev of DEMO_REVIEWS) {
              await setDoc(doc(db, path, rev.id), rev);
            }
          } catch (error) {
            console.error('Error seeding reviews:', error);
          }
        }
        setReviews(DEMO_REVIEWS);
      } else {
        const revList: Review[] = [];
        snapshot.forEach((doc) => {
          revList.push(doc.data() as Review);
        });
        setReviews(revList);
      }
    }, (error) => {
      console.warn('Firestore read error for reviews (using local fallback):', error);
      setReviews(DEMO_REVIEWS);
    });

    return () => unsubscribe();
  }, []);

  // Sync site configuration from Firestore in real-time
  useEffect(() => {
    const path = 'siteConfig';
    const docRef = doc(db, path, 'global');
    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      if (!snapshot.exists()) {
        if (auth.currentUser?.email === 'atividadesinfantilcontato@gmail.com') {
          try {
            await setDoc(docRef, INITIAL_SITE_CONFIG);
          } catch (error) {
            console.error('Error seeding siteConfig:', error);
          }
        }
        setRawSiteConfig(INITIAL_SITE_CONFIG);
      } else {
        setRawSiteConfig({ ...INITIAL_SITE_CONFIG, ...snapshot.data() as SiteConfig });
      }
    }, (error) => {
      console.warn('Firestore read error for siteConfig (using local fallback):', error);
      setRawSiteConfig(INITIAL_SITE_CONFIG);
    });

    return () => unsubscribe();
  }, []);

  // Sync hero banner configuration from Firestore in real-time
  useEffect(() => {
    const docRef = doc(db, 'siteSections', 'hero');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setHeroConfig(snapshot.data());
      } else {
        // Fallback or seed if doesn't exist
        const defaultHero = {
          backgroundImageUrl: '',
          backgroundImageStoragePath: '',
          customProductImageUrl: '',
          customProductImageStoragePath: '',
          featuredProductId: 'demo-kit-educacao-infantil',
          imageSource: 'product',
          title: 'imprimir e aplicar!',
          titlePrefix: 'Atividades em PDF prontas para ',
          subtitle: 'Garanta kits exclusivos para acelerar o aprendizado e a alfabetização do seu pequeno de forma lúdica, prática e 100% livre de telas!',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        };
        setHeroConfig(defaultHero);
      }
    }, (error) => {
      console.warn('Firestore read error for siteSections/hero:', error);
    });

    return () => unsubscribe();
  }, []);

  // Sync authentication state from Firebase in real-time
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminCheck = await validateAdminUser(user);
        if (adminCheck.isAdmin) {
          setIsLoggedIn(true);
          localStorage.setItem('atividades_oficial_logged_in', 'true');
        } else {
          setIsLoggedIn(false);
          localStorage.removeItem('atividades_oficial_logged_in');
        }
      } else {
        const cachedLoggedIn = localStorage.getItem('atividades_oficial_logged_in') === 'true';
        setIsLoggedIn(cachedLoggedIn);
      }
    });
    return () => unsubscribe();
  }, []);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const cached = localStorage.getItem('atividades_oficial_cart');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Error loading cached cart:', e);
    }
    return [];
  });
  
  // Navigation & Filtering States
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Drawers & Panel States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('atividades_oficial_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  // Client preview mode (Active when viewing the site while logged as admin)
  const [isClientPreviewActive, setIsClientPreviewActive] = useState(false);

  // Simple routing hook
  const [currentRoute, setCurrentRoute] = useState<'shop' | 'admin'>(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path.startsWith('/admin') || hash === '#admin') return 'admin';
    return 'shop';
  });

  // Dynamic Browser Tab Title and SEO Meta Tags Synchronization Effect
  useEffect(() => {
    const defaultSiteName = siteConfig.siteName || 'Atividades Criativas Oficial';
    const siteSeoTitle = siteConfig.seoTitle || `${defaultSiteName} | Materiais pedagógicos em PDF para imprimir`;

    const currentProduct = activeProductId ? products.find(p => p.id === activeProductId) : null;
    const displayTitle = currentProduct 
      ? `${currentProduct.name} | ${defaultSiteName}`
      : siteSeoTitle;

    // Set page title (tab name)
    document.title = displayTitle;

    // Helper to safely set meta tags
    const setMetaTag = (nameOrProperty: string, value: string | undefined, isProperty = false) => {
      if (!value) return;
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${nameOrProperty}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, nameOrProperty);
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    };

    // Helper for canonical link
    const setCanonicalLink = (url: string | undefined) => {
      if (!url) return;
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    };

    const description = currentProduct
      ? (currentProduct.shortDescription || currentProduct.description || siteConfig.seoDescription)
      : siteConfig.seoDescription;

    const keywords = siteConfig.seoKeywords;
    const imageUrl = currentProduct
      ? (currentProduct.mainImageUrl || siteConfig.seoImageUrl)
      : siteConfig.seoImageUrl;
    const author = siteConfig.seoAuthor || defaultSiteName;
    const canonicalUrl = siteConfig.canonicalUrl || 'https://atividadescriativasoficial.com.br';

    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('author', author);

    // Open Graph Tags
    setMetaTag('og:title', displayTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', imageUrl, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:site_name', defaultSiteName, true);

    // Twitter Card Tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', displayTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', imageUrl);

    setCanonicalLink(canonicalUrl);

    // Dynamic favicon update if defined
    if (siteConfig.faviconUrl) {
      let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.setAttribute('rel', 'icon');
        document.head.appendChild(faviconLink);
      }
      faviconLink.setAttribute('href', siteConfig.faviconUrl);
    }
  }, [siteConfig, activeProductId, products]);

  // Bidirectional routing & URL Synchronization Effect
  useEffect(() => {
    const syncFromUrl = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      if (path.startsWith('/admin') || hash === '#admin') {
        setCurrentRoute('admin');
        setActiveProductId(null);
        return;
      }
      
      setCurrentRoute('shop');
      
      // Check for /produto/:slug
      const productMatch = path.match(/^\/produto\/([^/]+)/);
      if (productMatch) {
        const slugOrId = productMatch[1];
        if (products.length > 0) {
          const found = products.find(p => p.slug === slugOrId || p.id === slugOrId);
          if (found) {
            setActiveProductId(found.id);
          } else {
            setActiveProductId('not-found-' + slugOrId);
          }
        }
      } else {
        setActiveProductId(null);
      }
    };

    syncFromUrl();

    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('hashchange', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('hashchange', syncFromUrl);
    };
  }, [products]);

  // Synchronize activeProductId back to URL
  useEffect(() => {
    if (currentRoute === 'admin') return;

    const path = window.location.pathname;
    if (activeProductId) {
      if (activeProductId.startsWith('not-found-')) return;
      const prod = products.find(p => p.id === activeProductId);
      if (prod) {
        const targetPath = `/produto/${prod.slug || prod.id}`;
        if (path !== targetPath) {
          window.history.pushState(null, '', targetPath);
        }
      }
    } else {
      if (path !== '/' && !path.startsWith('/admin') && window.location.hash !== '#admin') {
        window.history.pushState(null, '', '/');
      }
    }
  }, [activeProductId, products, currentRoute]);

  // Listen for admin login key shortcuts (Ctrl+Shift+A or Alt+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isAltA = e.altKey && e.key.toLowerCase() === 'a';
      const isCtrlShiftA = e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a';
      
      if (isAltA || isCtrlShiftA) {
        e.preventDefault();
        window.location.hash = 'admin';
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Update localStorage when cart changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('atividades_oficial_cart', JSON.stringify(newCart));
  };

  // Update products list on Firestore
  const handleUpdateProducts = async (updated: Product[]) => {
    // Optimistically update local state first with sanitized products
    const sanitizedUpdated = updated.map(sanitizeProduct);
    setRealProducts(sanitizedUpdated);
    try {
      const currentIds = sanitizedUpdated.map(p => p.id);
      const deletedProducts = realProducts.filter(p => !currentIds.includes(p.id));
      for (const p of deletedProducts) {
        await deleteDoc(doc(db, 'products', p.id));
      }

      // Pre-compress all base64 images in products to fit within Firestore's 1MB limit
      const compressedProducts = await Promise.all(sanitizedUpdated.map(async (p) => {
        return await ensureSafeProductPayload(p);
      }));

      // Also sync back to local state so we have the compressed smaller versions in memory
      setRealProducts(compressedProducts);

      for (const p of compressedProducts) {
        await setDoc(doc(db, 'products', p.id), p);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  };

  // Update reviews list on Firestore
  const handleUpdateReviews = async (updated: Review[]) => {
    setReviews(updated);
    try {
      const currentIds = updated.map(r => r.id);
      const deletedReviews = reviews.filter(r => !currentIds.includes(r.id));
      for (const r of deletedReviews) {
        await deleteDoc(doc(db, 'reviews', r.id));
      }
      for (const r of updated) {
        await setDoc(doc(db, 'reviews', r.id), r);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reviews');
    }
  };

  // Update site configuration on Firestore
  const handleUpdateSiteConfig = async (updated: SiteConfig) => {
    setRawSiteConfig(updated);
    try {
      let bannerMainImageUrl = updated.bannerMainImageUrl;
      if (bannerMainImageUrl && bannerMainImageUrl.startsWith('data:image/')) {
        try {
          bannerMainImageUrl = await compressImage(bannerMainImageUrl, 1000, 0.7);
        } catch (e) {
          console.error('Failed to compress banner image:', e);
        }
      }

      let heroBackgroundImage = updated.heroBackgroundImage;
      if (heroBackgroundImage && heroBackgroundImage.startsWith('data:image/')) {
        try {
          heroBackgroundImage = await compressImage(heroBackgroundImage, 1200, 0.75);
        } catch (e) {
          console.error('Failed to compress hero background image:', e);
        }
      }

      let heroCardImage = updated.heroCardImage;
      if (heroCardImage && heroCardImage.startsWith('data:image/')) {
        try {
          heroCardImage = await compressImage(heroCardImage, 800, 0.75);
        } catch (e) {
          console.error('Failed to compress hero card image:', e);
        }
      }

      // Fetch the latest document from Firestore first to safely merge and prevent accidental loss of fields
      const docRef = doc(db, 'siteConfig', 'global');
      const snap = await getDoc(docRef);
      const dbConfig = snap.exists() ? snap.data() : {};

      // Safely preserve existing photo fields if they exist in Firestore but are missing or empty in the update payload
      const finalAuthorPhotoUrl = updated.authorPhotoUrl !== undefined ? updated.authorPhotoUrl : (dbConfig.authorPhotoUrl || '');
      const finalAuthorPhotoStoragePath = updated.authorPhotoStoragePath !== undefined ? updated.authorPhotoStoragePath : (dbConfig.authorPhotoStoragePath || '');

      const finalActivityGroupImageUrl = updated.activityGroupImageUrl !== undefined ? updated.activityGroupImageUrl : (dbConfig.activityGroupImageUrl || '');
      const finalActivityGroupImageStoragePath = updated.activityGroupImageStoragePath !== undefined ? updated.activityGroupImageStoragePath : (dbConfig.activityGroupImageStoragePath || '');

      const finalConfig = {
        ...dbConfig,
        ...updated,
        bannerMainImageUrl,
        heroBackgroundImage,
        heroCardImage,
        authorPhotoUrl: finalAuthorPhotoUrl,
        authorPhotoStoragePath: finalAuthorPhotoStoragePath,
        activityGroupImageUrl: finalActivityGroupImageUrl,
        activityGroupImageStoragePath: finalActivityGroupImageStoragePath
      };

      setRawSiteConfig(finalConfig);
      
      // Save global configurations
      await setDoc(docRef, finalConfig);

      // Save hero banner configurations to siteSections/hero
      const heroPayload = {
        backgroundImageUrl: finalConfig.heroBackgroundImage || '',
        backgroundImageStoragePath: finalConfig.heroBackgroundImageStoragePath || '',
        customProductImageUrl: finalConfig.heroCardImage || '',
        customProductImageStoragePath: finalConfig.heroCardImageStoragePath || '',
        featuredProductId: finalConfig.featuredProductId || '',
        imageSource: finalConfig.bannerImageMode === 'custom' ? 'custom' : 'product',
        title: finalConfig.bannerTitleHighlight || '',
        titlePrefix: finalConfig.bannerTitlePrefix || '',
        subtitle: finalConfig.bannerDescription || '',
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.email || 'atividadesinfantilcontato@gmail.com'
      };
      
      await setDoc(doc(db, 'siteSections', 'hero'), heroPayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'siteConfig/global');
    }
  };

  // Add item to cart (interest list)
  const handleAddToCart = (product: Product) => {
    const exists = cart.find(item => item.product.id === product.id);
    if (!exists) {
      const newCart = [...cart, { product, addedAt: new Date().toISOString() }];
      saveCart(newCart);
    }
  };

  // Remove item from cart
  const handleRemoveFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    saveCart(newCart);
  };

  // Trigger search from header
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveProductId(null); // Go back to homepage to see filtered results
    
    // Smooth scroll to highlights section
    setTimeout(() => {
      const element = document.getElementById('destaque-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Select category
  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(prev => prev === categoryName ? null : categoryName);
    setActiveProductId(null); // Go back to homepage to see filtered results
    
    // Smooth scroll to highlights section
    setTimeout(() => {
      const element = document.getElementById('destaque-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Navigate to specified section
  const handleNavigateToSection = (sectionId: string) => {
    setActiveProductId(null);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Active product details object
  const activeProduct = products.find(p => p.id === activeProductId);
  
  // Highlighting/Vertical Kit (Educação Infantil)
  const kitProduct = useMemo(() => {
    // Prioritize active real product that is a kit
    const realKit = products.find(p => p.isActive === true && p.isKit === true && !(p as any).isDemo);
    if (realKit) return realKit;

    // Fallback to demo kit
    const demoKit = products.find(p => p.isActive === true && p.id === 'demo-kit-educacao-infantil');
    if (demoKit) return demoKit;

    // Any other kit
    const generalKit = products.find(p => p.isActive === true && p.isKit === true);
    if (generalKit) return generalKit;

    // Any active product
    return products.find(p => p.isActive === true);
  }, [products]);

  // Featured product in the banner
  const featuredProduct = useMemo(() => {
    if (siteConfig.featuredProductId) {
      const found = products.find(p => p.id === siteConfig.featuredProductId);
      if (found && found.isActive !== false) return found;
    }
    return null;
  }, [products, siteConfig.featuredProductId]);

  // Related products (same category as active, or general excluding active)
  const relatedProducts = activeProduct 
    ? products.filter(p => p.category === activeProduct.category && p.id !== activeProduct.id)
    : [];

  // Dynamic homepage section list ordering & visibility handlers
  const activeSectionOrder = useMemo(() => {
    let order = [
      'banner',
      'benefits',
      'destaque_activities',
      'why_choose',
      'best_sellers',
      'new_arrivals',
      'holidays',
      'most_loved',
      'comments',
      'tips_content',
      'hotmart',
      'newsletter'
    ];
    if (siteConfig.sectionOrder && siteConfig.sectionOrder.length > 0) {
      order = [...siteConfig.sectionOrder];
    }
    if (!order.includes('activity_group')) {
      const idx = order.indexOf('newsletter');
      if (idx !== -1) {
        order.splice(idx + 1, 0, 'activity_group');
      } else {
        order.push('activity_group');
      }
    }
    return order;
  }, [siteConfig.sectionOrder]);

  const renderFreeMaterialsHomeSection = () => {
    const freeHomeProducts = realProducts.filter(p => p.isActive && (p.isFree || p.productType === 'gratuito') && p.showOnHome && p.isDeleted !== true);
    if (freeHomeProducts.length === 0) return null;

    return (
      <div className="py-16 bg-gradient-to-b from-[#FFFDF9] to-[#FFF8EE] border-y border-[#FFEAD1]" id="free-materials-home">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] md:text-xs tracking-widest px-4 py-1.5 rounded-full uppercase border border-emerald-200">
            Acesso Grátis 🎁
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-4 tracking-tight">
            Materiais Gratuitos para Baixar
          </h2>
          <p className="text-slate-500 font-bold text-xs md:text-sm mt-2.5 max-w-lg mx-auto leading-relaxed">
            Amostras exclusivas em PDF de alta qualidade prontas para você baixar e aplicar hoje mesmo!
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-10">
            {freeHomeProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => setActiveProductId(product.id)}
                className="bg-white border border-slate-100 rounded-3xl p-3 md:p-4 flex flex-col justify-between hover:shadow-xl hover:border-slate-200 transition-all cursor-pointer group text-left shadow-sm"
              >
                <div className="relative aspect-square rounded-2xl bg-slate-50 overflow-hidden border border-slate-100/50 flex items-center justify-center">
                  <ProductImage id={product.mainImageUrl || product.imageUrl} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-emerald-500 text-white font-black text-[9px] md:text-[10px] tracking-wider uppercase px-2 py-0.5 rounded shadow-sm">
                    Grátis
                  </span>
                </div>
                <div className="mt-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="font-extrabold text-xs md:text-sm text-slate-800 line-clamp-2 mt-1 group-hover:text-[#1E4DDB] transition-colors leading-snug">
                      {product.name}
                    </h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                    <span className="text-[10px] md:text-[11px] text-slate-400 font-bold">
                      {product.pages} pág
                    </span>
                    <span className="text-xs font-black text-[#37C76A] uppercase tracking-wider flex items-center gap-1">
                      <span>Baixar</span>
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderHomeSection = (sectionId: string) => {
    // If hidden by visual editor visibility state, skip
    if (siteConfig.sectionVisibility && siteConfig.sectionVisibility[sectionId] === false) {
      return null;
    }

    switch (sectionId) {
      case 'banner':
        return (
          <div key="banner">
            <Banner 
              featuredProduct={featuredProduct}
              onSelectProduct={(id) => setActiveProductId(id)}
              onEuQuero={() => {
                if (featuredProduct) {
                  setActiveProductId(featuredProduct.id);
                } else if (kitProduct) {
                  setActiveProductId(kitProduct.id);
                } else {
                  handleNavigateToSection('destaque-section');
                }
              }}
              onVerProdutos={() => handleNavigateToSection('destaque-section')}
              bannerTitlePrefix={siteConfig.bannerTitlePrefix}
              bannerTitleHighlight={siteConfig.bannerTitleHighlight}
              bannerDescription={siteConfig.bannerDescription}
              heroBackgroundImage={siteConfig.heroBackgroundImage}
              heroCardImage={siteConfig.heroCardImage}
              bannerImageUrl={siteConfig.bannerImageUrl}
              hideHeroCardImage={siteConfig.hideHeroCardImage}
              bannerImageMode={siteConfig.bannerImageMode}
            />
          </div>
        );
      case 'benefits':
        return (
          <div key="benefits">
            <Benefits />
          </div>
        );
      case 'categories':
        return (
          <div key="categories">
            <Categories 
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              siteConfig={siteConfig}
            />
          </div>
        );
      case 'destaque_activities':
        return (
          <div key="destaque_activities">
            <DestaqueSection 
              products={products}
              kitProduct={kitProduct}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              onSelectProduct={(id) => setActiveProductId(id)}
              kitImageUrl={siteConfig.kitImageUrl}
            />
          </div>
        );
      case 'why_choose':
        return (
          <div key="why_choose">
            <WhyChooseUs 
              title={siteConfig.whyChooseUsTitle}
              subtitle={siteConfig.whyChooseUsSubtitle}
              description={siteConfig.whyChooseUsDescription}
              creativity={siteConfig.whyChooseUsCreativity}
              learning={siteConfig.whyChooseUsLearning}
              practicality={siteConfig.whyChooseUsPracticality}
              products={products}
            />
          </div>
        );
      case 'best_sellers': {
        const bestSellers = products.filter(p => p.isActive && (p.isBestSeller || p.tag === 'MAIS VENDIDO'));
        if (bestSellers.length === 0) return null;
        return (
          <div key="best_sellers">
            <MostLovedSection 
              title="Materiais Mais Vendidos"
              subtitle="RECOMENDADOS POR EDUCADORES"
              products={bestSellers}
              onSelectProduct={(id) => setActiveProductId(id)}
            />
          </div>
        );
      }
      case 'new_arrivals': {
        const newArrivals = products.filter(p => p.isActive && (p.isNew || p.tag === 'NOVIDADE'));
        if (newArrivals.length === 0) return null;
        return (
          <div key="new_arrivals">
            <MostLovedSection 
              title="Lançamentos Recentes"
              subtitle="NOVIDADES LÚDICAS"
              products={newArrivals}
              onSelectProduct={(id) => setActiveProductId(id)}
            />
          </div>
        );
      }
      case 'holidays': {
        const holidayProducts = products.filter(p => p.isActive && p.category === 'Datas Comemorativas');
        if (holidayProducts.length === 0) return null;
        return (
          <div key="holidays">
            <MostLovedSection 
              title="Especial Datas Comemorativas"
              subtitle="DATAS COMEMORATIVAS ESPECIAIS"
              products={holidayProducts}
              onSelectProduct={(id) => setActiveProductId(id)}
            />
          </div>
        );
      }
      case 'most_loved':
        return (
          <div key="most_loved">
            <MostLovedSection 
              products={products}
              onSelectProduct={(id) => setActiveProductId(id)}
            />
          </div>
        );
      case 'comments':
        return (
          <div key="comments">
            <ReviewsSection reviews={reviews} />
          </div>
        );
      case 'tips_content':
        if (siteConfig.authorSectionEnabled === false) return null;
        return (
          <div key="tips_content">
            <TipsAndContent siteConfig={siteConfig} />
          </div>
        );
      case 'hotmart':
        return (
          <div key="hotmart">
            <HotmartTrustSection 
              title={siteConfig.hotmartSectionTitle}
              description={siteConfig.hotmartSectionDescription}
            />
          </div>
        );
      case 'newsletter':
        return (
          <div key="newsletter">
            <Newsletter siteConfig={siteConfig} />
          </div>
        );
      case 'activity_group':
        return (
          <div key="activity_group">
            <ActivityGroup siteConfig={siteConfig} />
          </div>
        );
      default:
        return null;
    }
  };

  /* ==================== RENDERING LOGIC ==================== */

  // 1. If currently in admin route & NOT viewing preview as client:
  if (currentRoute === 'admin' && !isClientPreviewActive) {
    if (isLoggedIn) {
      return (
        <AdminPanel 
          isOpen={true}
          onClose={() => setIsClientPreviewActive(true)} // go to preview mode when closed
          products={realProducts}
          onUpdateProducts={handleUpdateProducts}
          siteConfig={siteConfig}
          onUpdateSiteConfig={handleUpdateSiteConfig}
          reviews={reviews}
          onUpdateReviews={handleUpdateReviews}
          onViewOnSite={(productId) => {
            setActiveProductId(productId);
            setIsClientPreviewActive(true);
          }}
          onLogout={async () => {
            try {
              await logoutUser();
            } catch (error) {
              console.error('Error logging out:', error);
            }
            setIsLoggedIn(false);
            localStorage.removeItem('atividades_oficial_logged_in');
          }}
        />
      );
    } else {
      return (
        <AdminLoginModal 
          isOpen={true}
          isFullScreen={true}
          onClose={() => {
            window.location.hash = '';
            setCurrentRoute('shop');
          }}
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            localStorage.setItem('atividades_oficial_logged_in', 'true');
          }}
          siteConfig={siteConfig}
        />
      );
    }
  }

  // 2. Otherwise render public-facing client store (normal mode or guest-preview mode):
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FDFBF7] antialiased selection:bg-[#37C76A] selection:text-white overflow-x-hidden">
      
      {/* Admin Quick Preview Bar if previewer is active */}
      {isLoggedIn && isClientPreviewActive && (
        <div className="bg-[#0E2A79] text-white py-2 px-4 flex items-center justify-between text-xs font-bold shrink-0 shadow-md">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-[#FFD22E]" />
            <span>Modo Pré-visualização de Administradora</span>
          </div>
          <button
            onClick={() => setIsClientPreviewActive(false)}
            className="bg-[#FF7A00] hover:bg-[#e06b00] text-white px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            <span>Voltar ao Painel</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* 1. Green Promotional Bar */}
      <PromoBar 
        promoText={siteConfig.promoText}
        contactEmail={siteConfig.contactEmail}
        instagramUrl={siteConfig.instagramUrl}
        facebookUrl={siteConfig.facebookUrl}
        youtubeChannelUrl={siteConfig.youtubeChannelUrl}
      />

      {/* 2. Deep Blue Header */}
      <Header 
        currentPage={activeProductId ? 'product' : 'home'}
        onNavigate={(page) => {
          if (page === 'home') {
            setActiveProductId(null);
          }
        }}
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
        onSearchChange={handleSearch}
        searchQuery={searchQuery}
        siteConfig={siteConfig}
      />

      {/* Dynamic View Route Logic */}
      {activeProductId ? (
        activeProduct ? (
          /* Dynamic Product Page Detail View */
          <ProductPage 
            product={activeProduct}
            relatedProducts={relatedProducts.length > 0 ? relatedProducts : products.filter(p => p.id !== activeProduct.id)}
            onBackToHome={() => setActiveProductId(null)}
            onSelectProduct={(id) => setActiveProductId(id)}
            onAddToCart={handleAddToCart}
            isInCart={cart.some(item => item.product.id === activeProduct.id)}
          />
        ) : (
          /* 7. PRODUTO NÃO ENCONTRADO View */
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-[#FFF8EE] font-sans">
            <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-[0_20px_50px_-12px_rgba(18,54,143,0.15)] border border-slate-100 max-w-md w-full flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 font-black text-4xl shadow-sm animate-bounce">
                !
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black text-slate-800">Produto não encontrado ou indisponível.</h2>
                <p className="text-slate-500 font-semibold text-sm leading-relaxed">
                  Desculpe, o material pedagógico que você procura não foi encontrado ou está temporariamente indisponível.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full mt-2">
                <button 
                  onClick={() => setActiveProductId(null)}
                  className="w-full bg-[#1E4DDB] hover:bg-[#12368F] active:scale-[0.98] cursor-pointer text-white font-black text-xs tracking-wider uppercase py-4 px-6 rounded-2xl shadow-lg transition-all"
                >
                  Voltar para a loja
                </button>
                <button 
                  onClick={() => {
                    setActiveProductId(null);
                    setTimeout(() => {
                      const el = document.getElementById('destaque-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 150);
                  }}
                  className="w-full bg-[#37C76A] hover:bg-[#2ca455] active:scale-[0.98] cursor-pointer text-white font-black text-xs tracking-wider uppercase py-4 px-6 rounded-2xl shadow-lg transition-all"
                >
                  Ver outros produtos
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Single Continuous Home Page view (dynamically ordered & configured) */
        <>
          {activeSectionOrder.map(sectionId => (
            <React.Fragment key={sectionId}>
              {renderHomeSection(sectionId)}
              {sectionId === 'categories' && renderFreeMaterialsHomeSection()}
            </React.Fragment>
          ))}
        </>
      )}

      {/* 14. Master Footer */}
      <Footer 
        onNavigateToSection={handleNavigateToSection} 
        onAdminTrigger={() => {
          window.location.hash = 'admin';
        }}
        contactEmail={siteConfig.contactEmail}
        instagramUrl={siteConfig.instagramUrl}
        facebookUrl={siteConfig.facebookUrl}
        youtubeChannelUrl={siteConfig.youtubeChannelUrl}
        footerLegalText={siteConfig.footerLegalText}
        siteConfig={siteConfig}
      />

      {/* Floating Demo Admin Access Badge (Only shown to authenticated admins, keeping it completely invisible for normal visitors) */}
      {isLoggedIn && !isClientPreviewActive && (
        <div className="fixed bottom-4 left-4 z-40">
          <button
            onClick={() => {
              setIsClientPreviewActive(false);
              window.location.hash = 'admin';
            }}
            className="bg-[#0e2a79] hover:bg-[#1e4ddb] text-white font-extrabold text-[9px] md:text-xs uppercase tracking-wider py-2.5 px-4 rounded-full shadow-2xl border border-white/10 flex items-center gap-1.5 active:scale-95 transition-all animate-bounce cursor-pointer"
            title="Abrir o painel de edição de atividades"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#37C76A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#37C76A]"></span>
            </span>
            <span>🛠 Editar Atividades</span>
          </button>
        </div>
      )}

      {/* Cart / Saved list slider Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onRemoveFromCart={handleRemoveFromCart}
      />

    </div>
  );
}
