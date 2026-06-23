import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection, doc, onSnapshot, addDoc, updateDoc,
  deleteDoc, setDoc, writeBatch, getDocs, getDoc,
  query, where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import INITIAL_STATE from '../data/initialState.json';
import { getPublishedBlogs, generateSlug } from '../lib/blogService';

// ─── Types ────────────────────────────────────────────────────────────────────


export type FAQ = { question: string; answer: string; };

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  category: string;
  inStock: boolean;
  description?: string;
  features?: string[];
  benefits?: string[];
  applications?: string[];
  faqs?: FAQ[];
  specifications?: { key: string; value: string }[];
  contentGenerated?: boolean;
  featured?: boolean;
  topSelling?: boolean;
  priceType?: 'fixed' | 'range' | 'hidden';
  priceMin?: number;
  priceMax?: number;
  moq?: string;
  leadTime?: string;
  shippingRegion?: string;
  trustBadges?: string[];
  badge?: string;
  slug?: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  semanticEntities?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
};

export type CategoryDetails = {
  name: string;
  slug: string;
  parentId?: string | null;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  ogImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
};

export type Redirect = {
  id: string;
  oldUrl: string;
  newUrl: string;
  type: '301' | '302';
  active: boolean;
};

export type PageSeoSettings = {
  seoTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  schemaSelection?: string;
};

export type ImageSEO = {
  imageUrl: string;
  altText: string;
  title: string;
  caption?: string;
  description?: string;
};

export type Video = {
  id: string;
  title: string;
  youtubeUrl: string;
  description?: string;
  productId?: string;
  order?: number;
  active?: boolean;
};

export type DMEmployee = {
  id: string;
  username: string;
  password: string;
  name: string;
  createdAt: string;
};

export type GeneralSettings = {
  phoneNumber?: string;
  email?: string;
  phones?: { label: string; value: string }[];
  emails?: { label: string; value: string }[];
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  whatsappUrl?: string;
  orderWhatsAppNumber?: string;
  googleMapsUrl?: string;
  googleMapsEmbedUrl?: string;
  xUrl?: string;
  homepageHeroBgVideo?: string;
  homepageHeroBgMainImage?: string;
  homepageHeroSecondaryImage?: string;
  // SEO & Tracking
  trackingScripts?: { id: string; name: string; code: string }[];
  // Trusted Brands
  trustedBrands?: { id: string; name: string; logoUrl?: string }[];
  // Hero Slides
  heroSlides?: { id: string; imageUrl: string; title1?: string; title2?: string; title3?: string; sub?: string; cta1Label?: string; cta1To?: string; cta2Label?: string; cta2To?: string; }[];
  // WhatsApp Call Routing
  whatsappRouting?: Record<string, string>;
  callRouting?: Record<string, string>;
  // Expert Contact Profile
  expertProfile?: {
    active: boolean;
    name: string;
    role: string;
    photoUrl: string;
    whatsapp: string;
    phone: string;
    email: string;
  };
  // Marketing Campaign Popup
  marketingCampaign?: {
    active: boolean;
    desktopImageUrl: string;
    mobileImageUrl: string;
    buttonText: string;
    buttonLink: string;
  };
};

// ─── Module-level store (singleton, lives outside React) ──────────────────────
// This survives React StrictMode's double-mount/unmount cycle.

type StoreState = {
  products: Product[];
  categories: string[];
  categoryImages: Record<string, string>;
  categoryDetails: Record<string, CategoryDetails>;
  videos: Video[];
  dmEmployees: DMEmployee[];
  videoSectionVisible: boolean;
  loading: boolean;
  firestoreError: string | null;
  settings: GeneralSettings;
  redirects: Redirect[];
  pagesSeo: Record<string, PageSeoSettings>;
  imagesSeo: Record<string, ImageSEO>;
};

type Subscriber = (state: StoreState) => void;

const CACHE_KEY          = 'az_products_cache_v2';
const CACHE_SETTINGS_KEY = 'az_settings_cache_v1';
const CACHE_CATS_KEY     = 'az_categories_cache_v1';
const CACHE_REDIRECTS_KEY = 'az_redirects_cache_v1';
const CACHE_PAGES_SEO_KEY = 'az_pages_seo_cache_v1';
const CACHE_IMAGES_SEO_KEY = 'az_images_seo_cache_v1';

// ── Products cache ─────────────────────────────────────────────────────────────
function loadCachedProducts(): Product[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return INITIAL_STATE.products as Product[];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(p => p && p.id && p.name)) return INITIAL_STATE.products as Product[];
    return parsed as Product[];
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return INITIAL_STATE.products as Product[];
  }
}
function saveProductsCache(products: Product[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(products)); } catch { /* quota */ }
}

// ── Settings cache ─────────────────────────────────────────────────────────────
function loadCachedSettings(): GeneralSettings {
  try {
    const raw = localStorage.getItem(CACHE_SETTINGS_KEY);
    if (!raw) return INITIAL_STATE.settings as GeneralSettings;
    return JSON.parse(raw) as GeneralSettings;
  } catch {
    localStorage.removeItem(CACHE_SETTINGS_KEY);
    return INITIAL_STATE.settings as GeneralSettings;
  }
}
function saveSettingsCache(s: GeneralSettings) {
  try { localStorage.setItem(CACHE_SETTINGS_KEY, JSON.stringify(s)); } catch { /* quota */ }
}

// ── Categories cache ───────────────────────────────────────────────────────────
function loadCachedCategories(): { list: string[]; images: Record<string, string>; details: Record<string, CategoryDetails> } {
  try {
    const raw = localStorage.getItem(CACHE_CATS_KEY);
    if (!raw) return { list: INITIAL_STATE.categories.list, images: (INITIAL_STATE.categories as any).images || {}, details: {} };
    const parsed = JSON.parse(raw);
    return {
      list: parsed.list || [],
      images: parsed.images || {},
      details: parsed.details || {},
    };
  } catch {
    localStorage.removeItem(CACHE_CATS_KEY);
    return { list: INITIAL_STATE.categories.list, images: (INITIAL_STATE.categories as any).images || {}, details: {} };
  }
}
function saveCategoriesCache(list: string[], images: Record<string, string>, details: Record<string, CategoryDetails>) {
  try { localStorage.setItem(CACHE_CATS_KEY, JSON.stringify({ list, images, details })); } catch { /* quota */ }
}

// ── New SEO caches ──────────────────────────────────────────────────────────────
function loadCachedRedirects(): Redirect[] {
  try {
    const raw = localStorage.getItem(CACHE_REDIRECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function loadCachedPagesSeo(): Record<string, PageSeoSettings> {
  try {
    const raw = localStorage.getItem(CACHE_PAGES_SEO_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function loadCachedImagesSeo(): Record<string, ImageSEO> {
  try {
    const raw = localStorage.getItem(CACHE_IMAGES_SEO_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

// Clear old cache keys from previous versions
const OLD_KEYS = ['az_products_cache', 'az_industries_cache'];
OLD_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch {} });

// Seed state from ALL caches — zero waiting, instant first paint
const cachedProducts   = loadCachedProducts();
const cachedSettings   = loadCachedSettings();
const cachedCategories = loadCachedCategories();

let state: StoreState = {
  products:            cachedProducts,
  categories:          cachedCategories.list,
  categoryImages:      cachedCategories.images,
  categoryDetails:     cachedCategories.details,
  videos:              [],
  dmEmployees:         [],
  videoSectionVisible: true,
  loading:             false, // With hardcoded initial state, we never need a blocking loading screen
  firestoreError:      null,
  settings:            cachedSettings,
  redirects:           loadCachedRedirects(),
  pagesSeo:            loadCachedPagesSeo(),
  imagesSeo:           loadCachedImagesSeo(),
};

const subscribers = new Set<Subscriber>();

function notify() {
  subscribers.forEach(fn => fn({ ...state }));
}

function setState(patch: Partial<StoreState>) {
  state = { ...state, ...patch };
  notify();
}

// ── Firestore listeners — started ONCE at module level ────────────────────────
let listenersStarted = false;

function startListeners() {
  if (listenersStarted) return;
  listenersStarted = true;

  // Pre-warm the blog cache in the background
  getPublishedBlogs().catch(console.error);

  // Products
  onSnapshot(
    collection(db, 'products'),
    (snap) => {
      const products = snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
      saveProductsCache(products); // persist for next page load
      setState({
        products,
        loading: false,
        firestoreError: null,
      });
    },
    (err) => {
      console.error('[Store] products:', err.code, err.message);
      let msg = `Firestore error: ${err.code}`;
      if (err.code === 'permission-denied') {
        msg =
          'Permission denied reading products. ' +
          'In Firebase Console → Firestore → Rules, set: allow read: if true;';
      } else if (err.code === 'unavailable') {
        msg = 'Firebase is unreachable. Check your internet connection.';
      }
      setState({ loading: false, firestoreError: msg });
    }
  );

  // Categories
  onSnapshot(
    doc(db, 'settings', 'categories'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const list   = data.list as string[] || [];
        const images = data.images as Record<string, string> || {};
        const rawDetails = data.details as Record<string, Partial<CategoryDetails>> || {};
        
        // Ensure every category in the list has populated details with fallbacks
        const details: Record<string, CategoryDetails> = {};
        list.forEach(name => {
          const raw = rawDetails[name] || {};
          details[name] = {
            ...raw,
            name,
            slug: raw.slug || generateSlug(name),
            seoTitle: raw.seoTitle || `${name} Equipment & Supplies | Al Zaydan International UAE`,
            metaDescription: raw.metaDescription || `Buy high quality ${name} products online at wholesale prices from Al Zaydan International UAE. Request a quote today.`,
          };
        });

        saveCategoriesCache(list, images, details);   // ← cache it
        setState({ categories: list, categoryImages: images, categoryDetails: details });
      }
    },
    (err) => console.error('[Store] categories:', err.code)
  );

  // Videos
  onSnapshot(
    collection(db, 'videos'),
    (snap) => {
      setState({
        videos: snap.docs
          .map(d => ({ ...d.data(), id: d.id } as Video))
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
      });
    },
    (err) => console.error('[Store] videos:', err.code)
  );

  // Video section visibility
  onSnapshot(
    doc(db, 'settings', 'videoSection'),
    (snap) => {
      if (snap.exists()) {
        setState({ videoSectionVisible: snap.data().visible !== false });
      }
    },
    (err) => console.error('[Store] videoSection:', err.code)
  );

  // DM Employees
  onSnapshot(
    collection(db, 'dm_employees'),
    (snap) => {
      setState({
        dmEmployees: snap.docs.map(d => ({ ...d.data(), id: d.id } as DMEmployee))
      });
    },
    (err) => console.error('[Store] dmEmployees:', err.code)
  );

  // General Settings
  onSnapshot(
    doc(db, 'settings', 'general'),
    (snap) => {
      if (snap.exists()) {
        const s = snap.data() as GeneralSettings;
        saveSettingsCache(s);   // ← cache it
        setState({ settings: s });
      }
    },
    (err) => console.error('[Store] generalSettings:', err.code)
  );

  // Redirects
  onSnapshot(
    collection(db, 'redirects'),
    (snap) => {
      const redirects = snap.docs.map(d => ({ ...d.data(), id: d.id } as Redirect));
      try { localStorage.setItem(CACHE_REDIRECTS_KEY, JSON.stringify(redirects)); } catch {}
      setState({ redirects });
    },
    (err) => console.error('[Store] redirects listener error:', err)
  );

  // Pages SEO Settings
  onSnapshot(
    doc(db, 'settings', 'pagesSeo'),
    (snap) => {
      if (snap.exists()) {
        const pagesSeo = snap.data() as Record<string, PageSeoSettings>;
        try { localStorage.setItem(CACHE_PAGES_SEO_KEY, JSON.stringify(pagesSeo)); } catch {}
        setState({ pagesSeo });
      }
    },
    (err) => console.error('[Store] pagesSeo listener error:', err)
  );

  // Images SEO Metadata
  onSnapshot(
    collection(db, 'images_seo'),
    (snap) => {
      const mapping: Record<string, ImageSEO> = {};
      snap.docs.forEach(d => {
        const data = d.data() as ImageSEO;
        if (data.imageUrl) {
          mapping[data.imageUrl] = data;
        }
      });
      try { localStorage.setItem(CACHE_IMAGES_SEO_KEY, JSON.stringify(mapping)); } catch {}
      setState({ imagesSeo: mapping });
    },
    (err) => console.error('[Store] imagesSeo listener error:', err)
  );
}

// Start listeners immediately when this module is imported
startListeners();

// ─── Context ──────────────────────────────────────────────────────────────────

interface StoreContextType extends StoreState {
  addProduct: (p: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (name: string, parentId?: string | null) => Promise<void>;
  updateCategory: (oldName: string, newName: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
  updateCategoryImage: (name: string, imageUrl: string) => Promise<void>;
  updateCategoryDetails: (name: string, details: Partial<CategoryDetails>) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
  toggleTopSelling: (id: string) => Promise<void>;
  addVideo: (data: Omit<Video, 'id'>) => Promise<void>;
  updateVideo: (id: string, data: Partial<Omit<Video, 'id'>>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  setVideoSectionVisible: (visible: boolean) => Promise<void>;
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => Promise<void>;
  addDMEmployee: (data: Omit<DMEmployee, 'id'>) => Promise<void>;
  updateDMEmployee: (id: string, data: Partial<Omit<DMEmployee, 'id'>>) => Promise<void>;
  deleteDMEmployee: (id: string) => Promise<void>;
  regenerateSitemap: () => Promise<void>;
  updateProductsBulk: (payloads: { id: string, data: Partial<Product> }[]) => Promise<void>;
  updateCategoriesBulk: (payloads: { name: string, data: Partial<CategoryDetails> }[]) => Promise<void>;
  addRedirect: (r: Omit<Redirect, 'id'>) => Promise<void>;
  updateRedirect: (id: string, data: Partial<Redirect>) => Promise<void>;
  deleteRedirect: (id: string) => Promise<void>;
  updatePageSeo: (pageKey: string, data: Partial<PageSeoSettings>) => Promise<void>;
  updateImageSeo: (imageUrl: string, data: Omit<ImageSEO, 'imageUrl'>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [snap, setSnap] = useState<StoreState>(state);

  useEffect(() => {
    // Subscribe to module-level store updates
    const sub: Subscriber = (s) => setSnap(s);
    subscribers.add(sub);
    // Sync immediately in case state already updated before this mount
    setSnap({ ...state });
    return () => {
      subscribers.delete(sub);
    };
  }, []);

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  const addProduct = async (data: Omit<Product, 'id'>) => {
    await addDoc(collection(db, 'products'), data);
    updateSitemapMetadata(db);
  };
 
  const updateProduct = async (id: string, data: Partial<Product>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _drop, ...payload } = data as Product;
    await updateDoc(doc(db, 'products', id), payload as Record<string, unknown>);
    updateSitemapMetadata(db);
  };
 
  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
    updateSitemapMetadata(db);
  };

  const toggleFeatured = async (id: string) => {
    const p = state.products.find(x => x.id === id);
    if (p) await updateDoc(doc(db, 'products', id), { featured: !p.featured });
  };

  const toggleTopSelling = async (id: string) => {
    const p = state.products.find(x => x.id === id);
    if (p) await updateDoc(doc(db, 'products', id), { topSelling: !p.topSelling });
  };

  const saveCategoryList = async (
    list: string[],
    images: Record<string, string> = state.categoryImages,
    details: Record<string, CategoryDetails> = state.categoryDetails
  ) => {
    await setDoc(doc(db, 'settings', 'categories'), { list, images, details });
    updateSitemapMetadata(db);
  };

  const addCategory = async (name: string, parentId?: string | null) => {
    const newDetails = { ...state.categoryDetails };
    newDetails[name] = {
      name,
      slug: generateSlug(name),
      parentId: parentId || null,
      seoTitle: `${name} Equipment & Supplies | Al Zaydan International UAE`,
      metaDescription: `Buy high quality ${name} products online at wholesale prices from Al Zaydan International UAE.`
    };
    await saveCategoryList([...state.categories, name], state.categoryImages, newDetails);
  };

  const updateCategory = async (oldName: string, newName: string) => {
    const newImages = { ...state.categoryImages };
    if (newImages[oldName]) {
      newImages[newName] = newImages[oldName];
      delete newImages[oldName];
    }

    const newDetails = { ...state.categoryDetails };
    if (newDetails[oldName]) {
      newDetails[newName] = {
        ...newDetails[oldName],
        name: newName,
        slug: newDetails[oldName].slug || generateSlug(newName),
      };
      delete newDetails[oldName];
    } else {
      newDetails[newName] = {
        name: newName,
        slug: generateSlug(newName),
        seoTitle: `${newName} Equipment & Supplies | Al Zaydan International UAE`,
        metaDescription: `Buy high quality ${newName} products online at wholesale prices from Al Zaydan International UAE.`
      };
    }

    // Cascade parentId rename for all child categories
    Object.values(newDetails).forEach(cat => {
      if (cat.parentId === oldName) {
        cat.parentId = newName;
      }
    });

    await saveCategoryList(state.categories.map(c => (c === oldName ? newName : c)), newImages, newDetails);
    const affected = state.products.filter(p => p.category === oldName);
    if (affected.length > 0) {
      const batch = writeBatch(db);
      affected.forEach(p => batch.update(doc(db, 'products', p.id), { category: newName }));
      await batch.commit();
    }
  };

  const deleteCategory = async (name: string) => {
    const newImages = { ...state.categoryImages };
    delete newImages[name];
    const newDetails = { ...state.categoryDetails };
    delete newDetails[name];
    await saveCategoryList(state.categories.filter(c => c !== name), newImages, newDetails);
  };

  const updateCategoryImage = async (name: string, imageUrl: string) => {
    const newImages = { ...state.categoryImages, [name]: imageUrl };
    await saveCategoryList(state.categories, newImages, state.categoryDetails);
  };

  const updateCategoryDetails = async (name: string, detailsPatch: Partial<CategoryDetails>) => {
    const newDetails = { ...state.categoryDetails };
    const current = newDetails[name] || {
      name,
      slug: generateSlug(name),
      seoTitle: `${name} Equipment & Supplies | Al Zaydan International UAE`,
      metaDescription: `Buy high quality ${name} products online at wholesale prices from Al Zaydan International UAE.`
    };
    newDetails[name] = {
      ...current,
      ...detailsPatch,
      name,
    };
    await saveCategoryList(state.categories, state.categoryImages, newDetails);
  };


  const addVideo = async (data: Omit<Video, 'id'>) => {
    await addDoc(collection(db, 'videos'), {
      ...data,
      order: state.videos.length + 1,
      active: data.active ?? true,
    });
  };

  const updateVideo = async (id: string, data: Partial<Omit<Video, 'id'>>) => {
    await updateDoc(doc(db, 'videos', id), data as Record<string, unknown>);
  };

  const deleteVideo = async (id: string) => {
    await deleteDoc(doc(db, 'videos', id));
  };

  const setVideoSectionVisible = async (visible: boolean) => {
    await setDoc(doc(db, 'settings', 'videoSection'), { visible });
  };

  const updateGeneralSettings = async (data: Partial<GeneralSettings>) => {
    await setDoc(doc(db, 'settings', 'general'), data, { merge: true });
  };

  const addDMEmployee = async (data: Omit<DMEmployee, 'id'>) => {
    await addDoc(collection(db, 'dm_employees'), {
      ...data,
      createdAt: new Date().toISOString(),
    });
  };

  const updateDMEmployee = async (id: string, data: Partial<Omit<DMEmployee, 'id'>>) => {
    await updateDoc(doc(db, 'dm_employees', id), data as Record<string, unknown>);
  };

  const deleteDMEmployee = async (id: string) => {
    await deleteDoc(doc(db, 'dm_employees', id));
  };

  const regenerateSitemap = async () => {
    await updateSitemapMetadata(db);
  };

  const updateProductsBulk = async (payloads: { id: string, data: Partial<Product> }[]) => {
    const batch = writeBatch(db);
    payloads.forEach(payload => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _drop, ...cleanData } = payload.data as any;
      batch.update(doc(db, 'products', payload.id), cleanData);
    });
    await batch.commit();
    updateSitemapMetadata(db);
  };

  const updateCategoriesBulk = async (payloads: { name: string, data: Partial<CategoryDetails> }[]) => {
    const newDetails = { ...state.categoryDetails };
    payloads.forEach(p => {
      const current = newDetails[p.name] || {
        name: p.name,
        slug: generateSlug(p.name),
        seoTitle: `${p.name} Equipment & Supplies | Al Zaydan International UAE`,
        metaDescription: `Buy high quality ${p.name} products online at wholesale prices from Al Zaydan International UAE.`
      };
      newDetails[p.name] = {
        ...current,
        ...p.data,
        name: p.name,
      };
    });
    await saveCategoryList(state.categories, state.categoryImages, newDetails);
  };

  const addRedirect = async (data: Omit<Redirect, 'id'>) => {
    await addDoc(collection(db, 'redirects'), data);
  };

  const updateRedirect = async (id: string, data: Partial<Redirect>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _drop, ...payload } = data as any;
    await updateDoc(doc(db, 'redirects', id), payload);
  };

  const deleteRedirect = async (id: string) => {
    await deleteDoc(doc(db, 'redirects', id));
  };

  const updatePageSeo = async (pageKey: string, data: Partial<PageSeoSettings>) => {
    const newPagesSeo = { ...state.pagesSeo };
    const current = newPagesSeo[pageKey] || { seoTitle: '', metaDescription: '' };
    newPagesSeo[pageKey] = {
      ...current,
      ...data
    };
    await setDoc(doc(db, 'settings', 'pagesSeo'), newPagesSeo);
  };

  const updateImageSeo = async (imageUrl: string, data: Omit<ImageSEO, 'imageUrl'>) => {
    const sanitizedId = btoa(imageUrl).replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');
    await setDoc(doc(db, 'images_seo', sanitizedId), {
      imageUrl,
      ...data
    });
  };

  return (
    <StoreContext.Provider
      value={{
        ...snap,
        addProduct, updateProduct, deleteProduct,
        addCategory, updateCategory, deleteCategory, updateCategoryImage,
        updateCategoryDetails,
        toggleFeatured, toggleTopSelling,
        addVideo, updateVideo, deleteVideo,
        setVideoSectionVisible,
        updateGeneralSettings,
        addDMEmployee, updateDMEmployee, deleteDMEmployee,
        regenerateSitemap,
        updateProductsBulk,
        updateCategoriesBulk,
        addRedirect, updateRedirect, deleteRedirect,
        updatePageSeo,
        updateImageSeo,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export async function updateSitemapMetadata(dbInstance: any) {
  try {
    const [productsSnap, categoriesDoc, blogsSnap] = await Promise.all([
      getDocs(collection(dbInstance, 'products')),
      getDoc(doc(dbInstance, 'settings', 'categories')),
      getDocs(query(collection(dbInstance, 'blogs'), where('published', '==', true)))
    ]);

    const totalProducts = productsSnap.size;
    const categoriesList = categoriesDoc.exists() ? (categoriesDoc.data()?.list || []) : [];
    const totalCategories = categoriesList.length;
    const totalBlogs = blogsSnap.size;
    const totalPages = 13;

    await setDoc(doc(dbInstance, 'settings', 'sitemap'), {
      totalProducts,
      totalCategories,
      totalBlogs,
      totalPages,
      lastGeneratedTime: new Date().toISOString(),
      status: 'Active'
    });
  } catch (err) {
    console.error('[Store] Failed to update sitemap metadata:', err);
  }
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}


