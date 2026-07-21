export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  tag?: 'MAIS VENDIDO' | 'NOVIDADE' | 'MAIS PROCURADO' | 'RECOMENDADO' | 'GRÁTIS';
  tagColor?: 'yellow' | 'red' | 'green' | 'blue';
  ageRange: string;
  pages: number;
  format: string; // e.g. "PDF pronto para imprimir"
  printSize: string; // e.g. "A4"
  price: number;
  regularPrice?: number;
  promoPrice?: number;
  salePrice?: number | null;
  imageUrl: string;
  mainImageUrl?: string;
  mainImageStoragePath?: string;
  galleryUrls: string[];
  galleryImages?: string[];
  galleryStoragePaths?: string[];
  youtubeUrl?: string;
  hotmartUrl: string;
  shortDescription: string;
  description: string;
  activityInfo?: string;
  fullDescription?: string;
  whatYouWillReceive: string[];
  objectives: string[];
  howToUse: string[];
  materialsNeeded?: string[];
  howToPrint?: string;
  isKit?: boolean;
  slug?: string;
  badge?: string;
  productType?: 'pago' | 'gratuito';
  isFree?: boolean;
  showOnHome?: boolean;
  freePdfUrl?: string;
  freePdfStoragePath?: string;
  freePdfFileName?: string;
  freePdfSize?: number;
  freePdfUpdatedAt?: string;
  title?: string;
  coverImageUrl?: string;
  coverImageStoragePath?: string;
  pageCount?: number;
  requireEmailBeforeDownload?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  isHighlight?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isPromo?: boolean;
  isDemo?: boolean;
  order?: number;
  displayOrder?: number;
  buttonText?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export function sanitizeProduct(p: any): Product {
  if (!p) p = {};

  const id = String(p.id || p.uid || '').trim();
  const name = String(p.name || 'Sem nome').trim();
  const slug = String(p.slug || '').trim();
  const category = String(p.category || p.categoryId || '').trim();
  const categoryId = String(p.categoryId || p.category || '').trim();
  const shortDescription = String(p.shortDescription || '').trim();
  const description = String(p.fullDescription || p.description || '').trim();
  const fullDescription = String(p.description || p.fullDescription || '').trim();
  const activityInfo = String(p.activityInfo || '').trim();
  const productType = p.productType === 'gratuito' ? 'gratuito' : 'pago';
  
  // Prices
  const rawPrice = typeof p.price === 'number' ? p.price : Number(p.price);
  const rawRegularPrice = typeof p.regularPrice === 'number' ? p.regularPrice : Number(p.regularPrice);
  
  const regularPrice = !isNaN(rawRegularPrice) ? rawRegularPrice : (!isNaN(rawPrice) ? rawPrice : 0);
  const price = !isNaN(rawPrice) ? rawPrice : regularPrice;

  // salePrice & promoPrice
  let salePrice: number | null = null;
  if (typeof p.salePrice === 'number') {
    salePrice = p.salePrice;
  } else if (p.salePrice !== undefined && p.salePrice !== null && !isNaN(Number(p.salePrice))) {
    salePrice = Number(p.salePrice);
  } else if (typeof p.promoPrice === 'number') {
    salePrice = p.promoPrice;
  } else if (p.promoPrice !== undefined && p.promoPrice !== null && !isNaN(Number(p.promoPrice))) {
    salePrice = Number(p.promoPrice);
  }
  const promoPrice = salePrice !== null ? salePrice : undefined;

  // Specs
  const ageRange = String(p.ageRange || '2 a 6 anos').trim();
  const pages = typeof p.pages === 'number' ? p.pages : (Number(p.pages) || 0);
  const format = String(p.format || 'PDF pronto para imprimir').trim();
  const printSize = String(p.printSize || 'A4').trim();

  // Images
  const mainImageUrl = String(p.mainImageUrl || p.imageUrl || p.image || p.cover || p.coverImage || p.thumbnail || '').trim();
  const imageUrl = mainImageUrl;
  const mainImageStoragePath = String(p.mainImageStoragePath || '').trim();
  
  let galleryImages: string[] = [];
  if (Array.isArray(p.galleryImages)) {
    galleryImages = p.galleryImages.map(String);
  } else if (Array.isArray(p.galleryUrls)) {
    galleryImages = p.galleryUrls.map(String);
  }
  const galleryUrls = galleryImages;

  // Links & Videos
  const hotmartUrl = String(p.hotmartUrl || p.hotmartLink || p.hotmart || '').trim();
  const youtubeUrl = String(p.youtubeUrl || p.video || p.videoUrl || p.youtubeLink || p.mainVideo || p.demoVideo || '').trim();

  // Booleans
  const isActive = p.isActive === true || String(p.isActive) === 'true';
  const isFeatured = p.isFeatured === true || String(p.isFeatured) === 'true' || p.isHighlight === true || String(p.isHighlight) === 'true';
  const isHighlight = isFeatured;
  const isNew = p.isNew === true || String(p.isNew) === 'true';
  const isBestSeller = p.isBestSeller === true || String(p.isBestSeller) === 'true';
  const isKit = p.isKit === true || String(p.isKit) === 'true';
  const isPromo = p.isPromo === true || String(p.isPromo) === 'true';

  // Order
  const displayOrder = typeof p.displayOrder === 'number' ? p.displayOrder : (typeof p.order === 'number' ? p.order : Number(p.displayOrder || p.order) || 0);
  const order = displayOrder;

  // String lists
  const whatYouWillReceive = Array.isArray(p.whatYouWillReceive) ? p.whatYouWillReceive.map(String) : [];
  const objectives = Array.isArray(p.objectives) ? p.objectives.map(String) : [];
  const howToUse = Array.isArray(p.howToUse) ? p.howToUse.map(String) : [];
  const materialsNeeded = Array.isArray(p.materialsNeeded) ? p.materialsNeeded.map(String) : [];
  const howToPrint = String(p.howToPrint || '').trim();

  const badge = String(p.badge || p.tag || '').trim();
  const buttonText = String(p.buttonText || '').trim();

  return {
    id,
    name,
    title: p.title || p.name || 'Sem título',
    slug,
    category,
    categoryId,
    shortDescription,
    description,
    fullDescription,
    activityInfo,
    productType,
    isFree: p.isFree === true || String(p.isFree) === 'true' || productType === 'gratuito',
    showOnHome: p.showOnHome === true || String(p.showOnHome) === 'true' || p.isFeatured === true || String(p.isFeatured) === 'true',
    freePdfUrl: p.freePdfUrl ? String(p.freePdfUrl).trim() : undefined,
    freePdfStoragePath: p.freePdfStoragePath ? String(p.freePdfStoragePath).trim() : undefined,
    freePdfFileName: p.freePdfFileName ? String(p.freePdfFileName).trim() : undefined,
    freePdfSize: typeof p.freePdfSize === 'number' ? p.freePdfSize : (Number(p.freePdfSize) || undefined),
    freePdfUpdatedAt: p.freePdfUpdatedAt ? String(p.freePdfUpdatedAt).trim() : undefined,
    coverImageUrl: p.coverImageUrl || p.mainImageUrl || p.imageUrl || '',
    coverImageStoragePath: p.coverImageStoragePath || p.mainImageStoragePath || '',
    pageCount: typeof p.pageCount === 'number' ? p.pageCount : (p.pages || 0),
    requireEmailBeforeDownload: p.requireEmailBeforeDownload === true || String(p.requireEmailBeforeDownload) === 'true',
    price,
    regularPrice,
    promoPrice,
    salePrice,
    ageRange,
    pages,
    format,
    printSize,
    imageUrl,
    mainImageUrl,
    mainImageStoragePath,
    galleryUrls,
    galleryImages,
    hotmartUrl,
    youtubeUrl,
    isActive,
    isFeatured,
    isHighlight,
    isNew,
    isBestSeller,
    isKit,
    isPromo,
    isDemo: p.isDemo === true,
    order,
    displayOrder,
    whatYouWillReceive,
    objectives,
    howToUse,
    materialsNeeded,
    howToPrint,
    badge,
    buttonText,
    createdAt: p.createdAt ? String(p.createdAt) : new Date().toISOString(),
    updatedAt: p.updatedAt ? String(p.updatedAt) : new Date().toISOString(),
    updatedBy: p.updatedBy ? String(p.updatedBy) : undefined,
    isDeleted: p.isDeleted === true || String(p.isDeleted) === 'true',
    deletedAt: p.deletedAt ? String(p.deletedAt) : undefined,
    deletedBy: p.deletedBy ? String(p.deletedBy) : undefined,
  };
}

export interface Category {
  id: string;
  name: string;
  iconName: string; // We'll map this to Lucide icons
  count: number;
  color: string; // Tailwind bg color class
  textColor: string;
}

export interface Review {
  id: string;
  name: string;
  role: string; // e.g. "Professora de Educação Infantil"
  city: string; // e.g. "São Paulo - SP"
  stars: number;
  comment: string;
  productName: string;
  avatarUrl?: string;
  verified: boolean;
}

export interface CartItem {
  product: Product;
  addedAt: string;
}

export interface SiteConfig {
  promoText: string;
  contactEmail: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeChannelUrl: string;
  bannerTitlePrefix: string;
  bannerTitleHighlight: string;
  bannerDescription: string;
  whyChooseUsTitle: string;
  whyChooseUsSubtitle: string;
  whyChooseUsDescription: string;
  whyChooseUsCreativity: number;
  whyChooseUsLearning: number;
  whyChooseUsPracticality: number;
  footerLegalText: string;
  hotmartSectionTitle: string;
  hotmartSectionDescription: string;
  
  // Newly added optional fields
  bannerBadge?: string;
  bannerButtonText?: string;
  bannerSecondaryButtonText?: string;
  bannerButtonLink?: string;
  bannerSecondaryButtonLink?: string;
  bannerBgColor?: string;
  bannerMainImageUrl?: string;
  bannerIsActive?: boolean;
  heroBackgroundImage?: string;
  heroCardImage?: string;
  hideHeroCardImage?: boolean;
  featuredProductId?: string;
  bannerImageMode?: 'linked' | 'custom';
  
  hotmartSectionButtonText?: string;
  hotmartSectionButtonLink?: string;
  hotmartSectionIsActive?: boolean;
  
  newsletterTitle?: string;
  newsletterDescription?: string;
  newsletterButtonText?: string;
  newsletterButtonUrl?: string;
  newsletterIsActive?: boolean;
  
  footerPolicyLink?: string;
  footerTermsLink?: string;
  footerDescription?: string;
  pinterestUrl?: string;
  whatsappNumber?: string;
  openingHours?: string;

  // Logo and Identity configuration properties
  logoUrl?: string;
  logoStoragePath?: string;
  logoAlt?: string;
  logoDesktopWidth?: number;
  logoTabletWidth?: number;
  logoMobileWidth?: number;
  logoMaxHeight?: number;
  logoAlignment?: 'left' | 'center' | 'right';
  logoMarginTop?: number;
  logoMarginBottom?: number;
  logoMarginLeft?: number;
  logoMarginRight?: number;
  useDifferentMobileLogo?: boolean;
  mobileLogoUrl?: string;
  mobileLogoStoragePath?: string;
  faviconUrl?: string;
  faviconStoragePath?: string;
  updatedAt?: string;
  updatedBy?: string;
  heroCardImageStoragePath?: string;
  bannerImageSource?: 'product' | 'custom';
  
  // Custom Dynamic Section Visibility & Ordering Fields
  sectionOrder?: string[];
  sectionVisibility?: { [key: string]: boolean };
  categoriesList?: any[];
  tipsList?: any[];
  holidaysList?: any[];

  // Official image fields for Banner, Category, Kit, Newsletter, Footer
  bannerImageUrl?: string;
  categoryImageUrl?: string;
  kitImageUrl?: string;
  newsletterImageUrl?: string;
  footerImageUrl?: string;
  
  heroBackgroundImageUrl?: string;
  heroBackgroundImageStoragePath?: string;
  featuredKitImageUrl?: string;
  featuredKitImageStoragePath?: string;
  newsletterImageStoragePath?: string;
  footerImageStoragePath?: string;

  // Author Section Fields
  authorSectionEnabled?: boolean;
  authorSectionTitle?: string;
  authorNameTitle?: string;
  authorBioText?: string;
  authorHighlightText?: string;
  authorPhotoUrl?: string;
  authorPhotoStoragePath?: string;
  authorButtonText?: string;
  authorButtonAction?: 'scroll' | 'shop' | 'hide';

  // Activity Group Section Fields
  activityGroupEnabled?: boolean;
  activityGroupTitle?: string;
  activityGroupDescription?: string;
  activityGroupNote?: string;
  activityGroupImageUrl?: string;
  activityGroupImageStoragePath?: string;
  activityGroupButtonText?: string;
  activityGroupButtonUrl?: string;
  activityGroupOpenInNewTab?: boolean;
}

