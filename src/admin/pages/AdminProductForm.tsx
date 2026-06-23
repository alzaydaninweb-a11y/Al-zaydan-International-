import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import type { Product } from '../../context/StoreContext';
import { uploadToR2 } from '../../lib/cloudflareR2';
import { Upload, Link as LinkIcon, ChevronLeft, Save, ImageOff, Loader2, X, Package, Globe, ExternalLink } from 'lucide-react';
import { generateSlug } from '../../lib/blogService';
import { generateProductSEO } from '../../lib/seoGenerator';

const EMPTY_FORM = {
  name: '', brand: '', category: '', price: '', mrp: '', discount: '',
  rating: '4.5', reviews: '0', description: '', image: '',
  images: [] as string[],
  specifications: [] as { key: string; value: string }[],
  inStock: true, featured: false, topSelling: false,
  priceType: 'fixed' as 'fixed' | 'range' | 'hidden',
  priceMin: '', priceMax: '',
  moq: '', leadTime: '', shippingRegion: '', badge: '',
  trustBadges: [] as string[],
  slug: '', seoTitle: '', metaDescription: '',
  canonicalUrl: '', focusKeyword: '', ogTitle: '', ogDescription: '', ogImage: '',
  twitterTitle: '', twitterDescription: '', twitterImage: '',
  noIndex: false, noFollow: false,
  features: [] as string[], benefits: [] as string[], applications: [] as string[],
  faqs: [] as { question: string; answer: string }[], contentGenerated: false,
  primaryKeyword: '', secondaryKeywords: [] as string[], semanticEntities: [] as string[]
};

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { products, categories, categoryDetails, addProduct, updateProduct, imagesSeo, updateImageSeo } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  const brands = React.useMemo(() => {
    const bSet = new Set(products.map(p => p.brand).filter(Boolean));
    return Array.from(bSet).sort();
  }, [products]);

  const existingProduct = isEdit ? products.find(p => p.id === id) : null;

  const [activeTab, setActiveTab] = useState<'basic' | 'seo'>('basic');

  const [form, setForm] = useState<typeof EMPTY_FORM>(() => {
    if (existingProduct) {
      return {
        name: existingProduct.name,
        brand: existingProduct.brand,
        category: existingProduct.category,
        price: String(existingProduct.price),
        mrp: String(existingProduct.mrp),
        discount: String(existingProduct.discount),
        rating: String(existingProduct.rating),
        reviews: String(existingProduct.reviews),
        description: existingProduct.description || '',
        image: existingProduct.image,
        images: existingProduct.images || [],
        specifications: existingProduct.specifications || [],
        inStock: existingProduct.inStock,
        featured: existingProduct.featured || false,
        topSelling: existingProduct.topSelling || false,
        priceType: existingProduct.priceType || 'fixed',
        priceMin: String(existingProduct.priceMin ?? ''),
        priceMax: String(existingProduct.priceMax ?? ''),
        moq: existingProduct.moq || '',
        leadTime: existingProduct.leadTime || '',
        shippingRegion: existingProduct.shippingRegion || '',
        badge: existingProduct.badge || '',
        trustBadges: existingProduct.trustBadges || [],
        slug: existingProduct.slug || '',
        seoTitle: existingProduct.seoTitle || '',
        metaDescription: existingProduct.metaDescription || '',
        canonicalUrl: existingProduct.canonicalUrl || '',
        focusKeyword: existingProduct.focusKeyword || '',
        ogTitle: existingProduct.ogTitle || '',
        ogDescription: existingProduct.ogDescription || '',
        ogImage: existingProduct.ogImage || '',
        twitterTitle: existingProduct.twitterTitle || '',
        twitterDescription: existingProduct.twitterDescription || '',
        twitterImage: existingProduct.twitterImage || '',
        noIndex: existingProduct.noIndex || false,
        noFollow: existingProduct.noFollow || false,
        features: existingProduct.features || [],
        benefits: existingProduct.benefits || [],
        applications: existingProduct.applications || [],
        faqs: existingProduct.faqs || [],
        contentGenerated: existingProduct.contentGenerated || false,
        primaryKeyword: existingProduct.primaryKeyword || '',
        secondaryKeywords: existingProduct.secondaryKeywords || [],
        semanticEntities: existingProduct.semanticEntities || [],
      };
    }
    return EMPTY_FORM;
  });

  const [slugLocked, setSlugLocked] = useState(isEdit);

  const categoryChain = React.useMemo(() => {
    if (!form.category) return [];
    const chain: string[] = [];
    let current = form.category;
    while (current && categories.includes(current)) {
      chain.unshift(current);
      current = categoryDetails[current]?.parentId || '';
    }
    return chain;
  }, [form.category, categories, categoryDetails]);

  const [mediaUrls, setMediaUrls] = useState<string[]>(() => {
    if (existingProduct) {
      return [existingProduct.image, ...(existingProduct.images || [])].filter(Boolean);
    }
    return [];
  });
  const [urlInput, setUrlInput] = useState('');
  const [imgPreviewError, setImgPreviewError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localImagesSeo, setLocalImagesSeo] = useState<Record<string, { altText: string, title: string }>>({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [rawInputText, setRawInputText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [wizardError, setWizardError] = useState('');
  const [wizardSuccess, setWizardSuccess] = useState(false);
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);

  const getHighlightClass = (field: string) => {
    return highlightedFields.includes(field)
      ? 'ring-4 ring-emerald-500/30 border-emerald-500 bg-emerald-50/5'
      : '';
  };

  const handleAiParse = async () => {
    if (!rawInputText.trim()) return;
    setParsing(true);
    setWizardError('');
    setWizardSuccess(false);

    try {
      // In dev mode served from port 3000, functions run on 8888 via Netlify dev
      const fnBase = window.location.port === '3000'
        ? 'http://localhost:8888'
        : '';
      const res = await fetch(`${fnBase}/.netlify/functions/parse-product-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawInputText,
          activeCategories: categories
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to parse text.');
      }

      const data = await res.json();

      if (data && typeof data === 'object') {
        setForm(prev => {
          const next = { ...prev };
          Object.keys(data).forEach(key => {
            if (key in next && data[key] !== undefined) {
              next[key] = data[key];
            }
          });
          return next;
        });

        if (data.image || (Array.isArray(data.images) && data.images.length > 0)) {
          const urls = [data.image, ...(data.images || [])].filter(Boolean);
          setMediaUrls(urls);
        }

        const filledFields = Object.keys(data).filter(k => data[k] !== undefined && data[k] !== '');
        setHighlightedFields(filledFields);
        setWizardSuccess(true);
        setTimeout(() => {
          setHighlightedFields([]);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setWizardError(err instanceof Error ? err.message : 'An error occurred during AI parsing.');
    } finally {
      setParsing(false);
    }
  };

  // Reset loaded status when ID changes
  useEffect(() => {
    setHasLoaded(false);
  }, [id]);

  // Load existing product details once fetched from Firestore
  useEffect(() => {
    if (existingProduct && !hasLoaded) {
      setForm({
        name: existingProduct.name || '',
        brand: existingProduct.brand || '',
        category: existingProduct.category || '',
        price: String(existingProduct.price ?? ''),
        mrp: String(existingProduct.mrp ?? ''),
        discount: String(existingProduct.discount ?? ''),
        rating: String(existingProduct.rating ?? '4.5'),
        reviews: String(existingProduct.reviews ?? '0'),
        description: existingProduct.description || '',
        image: existingProduct.image || '',
        images: existingProduct.images || [],
        specifications: existingProduct.specifications || [],
        inStock: existingProduct.inStock ?? true,
        featured: existingProduct.featured || false,
        topSelling: existingProduct.topSelling || false,
        priceType: existingProduct.priceType || 'fixed',
        priceMin: String(existingProduct.priceMin ?? ''),
        priceMax: String(existingProduct.priceMax ?? ''),
        moq: existingProduct.moq || '',
        leadTime: existingProduct.leadTime || '',
        shippingRegion: existingProduct.shippingRegion || '',
        badge: existingProduct.badge || '',
        trustBadges: existingProduct.trustBadges || [],
        slug: existingProduct.slug || '',
        seoTitle: existingProduct.seoTitle || '',
        metaDescription: existingProduct.metaDescription || '',
        canonicalUrl: existingProduct.canonicalUrl || '',
        focusKeyword: existingProduct.focusKeyword || '',
        ogTitle: existingProduct.ogTitle || '',
        ogDescription: existingProduct.ogDescription || '',
        ogImage: existingProduct.ogImage || '',
        twitterTitle: existingProduct.twitterTitle || '',
        twitterDescription: existingProduct.twitterDescription || '',
        twitterImage: existingProduct.twitterImage || '',
        noIndex: existingProduct.noIndex || false,
        noFollow: existingProduct.noFollow || false,
        features: existingProduct.features || [],
        benefits: existingProduct.benefits || [],
        applications: existingProduct.applications || [],
        faqs: existingProduct.faqs || [],
        contentGenerated: existingProduct.contentGenerated || false,
        primaryKeyword: existingProduct.primaryKeyword || '',
        secondaryKeywords: existingProduct.secondaryKeywords || [],
        semanticEntities: existingProduct.semanticEntities || [],
      });
      setMediaUrls([existingProduct.image, ...(existingProduct.images || [])].filter(Boolean));
      setSlugLocked(true);
      setHasLoaded(true);
    }
  }, [existingProduct, hasLoaded]);

  const set = (key: string, value: string | boolean | string[] | { key: string; value: string }[]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // Auto-populate local images SEO state
  useEffect(() => {
    setLocalImagesSeo(prev => {
      const next = { ...prev };
      let changed = false;
      mediaUrls.forEach(url => {
        if (!(url in next)) {
          const globalSeo = imagesSeo[url];
          next[url] = {
            altText: globalSeo?.altText || '',
            title: globalSeo?.title || '',
          };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [mediaUrls, imagesSeo]);

  // Auto-generate slug from name if not locked
  useEffect(() => {
    if (!slugLocked && !isEdit) {
      setForm(prev => ({ ...prev, slug: generateSlug(form.name) }));
    }
  }, [form.name, slugLocked, isEdit]);

  // Auto-calculate discount
  useEffect(() => {
    const price = parseFloat(form.price);
    const mrp = parseFloat(form.mrp);
    if (price > 0 && mrp > 0 && mrp >= price) {
      setForm(prev => ({ ...prev, discount: String(Math.round(((mrp - price) / mrp) * 100)) }));
    }
  }, [form.price, form.mrp]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(10);

    try {
      const newUrls = [...mediaUrls];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        const url = await uploadToR2(files[i], 'products');
        newUrls.push(url);
      }
      setMediaUrls(newUrls);
    } catch (err) {
      console.error('Cloudflare R2 upload error:', err);
      alert('Upload failed: ' + (err as Error).message);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const addUrl = () => {
    if (!urlInput.trim()) return;
    setMediaUrls(prev => [...prev, urlInput.trim()]);
    setUrlInput('');
  };

  const removeImage = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const makePrimary = (index: number) => {
    if (index === 0) return;
    setMediaUrls(prev => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  };

  const addSpec = () => {
    set('specifications', [...form.specifications, { key: '', value: '' }]);
  };

  const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const next = [...form.specifications];
    next[index][field] = val;
    set('specifications', next);
  };

  const removeSpec = (index: number) => {
    set('specifications', form.specifications.filter((_, i) => i !== index));
  };

  const toggleTrustBadge = (badge: string) => {
    set('trustBadges', form.trustBadges.includes(badge)
      ? form.trustBadges.filter(b => b !== badge)
      : [...form.trustBadges, badge]
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.category) e.category = 'Please select a category';
    if (form.priceType === 'fixed') {
      if (!form.price || isNaN(Number(form.price))) e.price = 'Valid price is required';
      if (!form.mrp || isNaN(Number(form.mrp))) e.mrp = 'Valid MRP is required';
    }
    if (form.priceType === 'range') {
      if (!form.priceMin || isNaN(Number(form.priceMin))) e.priceMin = 'Valid minimum price is required';
      if (!form.priceMax || isNaN(Number(form.priceMax))) e.priceMax = 'Valid maximum price is required';
      if (Number(form.priceMin) >= Number(form.priceMax)) e.priceMax = 'Max price must be greater than min price';
    }
    if (!mediaUrls.length) e.image = 'At least one product image is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [generatingAI, setGeneratingAI] = useState(false);

  const handleGenerateAIContent = async () => {
    if (!form.name.trim() || !form.category) {
      alert('Product Name and Category are required to generate AI content.');
      return;
    }

    setGeneratingAI(true);
    setSaveError('');

    try {
      const fnBase = window.location.port === '3000' ? 'http://localhost:8888' : '';
      const res = await fetch(`${fnBase}/.netlify/functions/generate-product-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          brand: form.brand.trim(),
          category: form.category,
          description: form.description.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate AI content.');
      }

      const data = await res.json();

      setForm(prev => ({
        ...prev,
        description: data.description || prev.description,
        features: data.features || prev.features,
        benefits: data.benefits || prev.benefits,
        applications: data.applications || prev.applications,
        specifications: data.specifications && data.specifications.length > 0 ? data.specifications : prev.specifications,
        faqs: data.faqs || prev.faqs,
        primaryKeyword: data.primaryKeyword || prev.primaryKeyword,
        secondaryKeywords: data.secondaryKeywords || prev.secondaryKeywords,
        semanticEntities: data.semanticEntities || prev.semanticEntities,
        contentGenerated: true
      }));

      // Highlight the AI generated fields so the admin knows what changed
      setHighlightedFields(['description', 'features', 'benefits', 'applications', 'specifications', 'faqs']);
      setTimeout(() => setHighlightedFields([]), 3000);

    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'An error occurred during AI generation.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSaveError('');

    const productData: Omit<Product, 'id'> = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      price: form.priceType === 'fixed' ? parseFloat(form.price) : (form.priceType === 'range' ? parseFloat(form.priceMin) : 0),
      mrp: form.priceType === 'fixed' ? parseFloat(form.mrp) : (form.priceType === 'range' ? parseFloat(form.priceMax) : 0),
      discount: form.priceType === 'fixed' ? (parseInt(form.discount) || 0) : 0,
      rating: parseFloat(form.rating) || 4.5,
      reviews: parseInt(form.reviews) || 0,
      image: mediaUrls[0] || '',
      images: mediaUrls.slice(1),
      specifications: form.specifications.filter(s => s.key.trim() && s.value.trim()),
      inStock: form.inStock,
      featured: form.featured,
      topSelling: form.topSelling,
      description: form.description.trim(),
      priceType: form.priceType,
      slug: form.slug.trim() || generateSlug(form.name),
      seoTitle: form.seoTitle.trim(),
      metaDescription: form.metaDescription.trim(),
      canonicalUrl: form.canonicalUrl.trim(),
      focusKeyword: form.focusKeyword.trim(),
      ogTitle: form.ogTitle.trim(),
      ogDescription: form.ogDescription.trim(),
      ogImage: form.ogImage.trim(),
      twitterTitle: form.twitterTitle.trim(),
      twitterDescription: form.twitterDescription.trim(),
      twitterImage: form.twitterImage.trim(),
      noIndex: form.noIndex,
      noFollow: form.noFollow,
      features: form.features,
      benefits: form.benefits,
      applications: form.applications,
      faqs: form.faqs,
      contentGenerated: form.contentGenerated,
      primaryKeyword: form.primaryKeyword.trim(),
      secondaryKeywords: form.secondaryKeywords,
      semanticEntities: form.semanticEntities,
      // Only include optional fields when they have real values
      ...(form.priceType === 'range' ? {
        priceMin: parseFloat(form.priceMin),
        priceMax: parseFloat(form.priceMax),
      } : {}),
      ...(form.moq.trim() ? { moq: form.moq.trim() } : {}),
      ...(form.leadTime.trim() ? { leadTime: form.leadTime.trim() } : {}),
      ...(form.shippingRegion.trim() ? { shippingRegion: form.shippingRegion.trim() } : {}),
      ...(form.badge.trim() ? { badge: form.badge.trim() } : {}),
      ...(form.trustBadges.length > 0 ? { trustBadges: form.trustBadges } : {}),
    };

    try {
      if (isEdit && id) {
        await updateProduct(id, productData);
      } else {
        await addProduct(productData);
      }

      // Save Alt/Title values to images_seo
      await Promise.all(
        Object.entries(localImagesSeo).map(async ([url, seo]) => {
          if (seo.altText.trim() || seo.title.trim()) {
            await updateImageSeo(url, {
              altText: seo.altText.trim(),
              title: seo.title.trim(),
            });
          }
        })
      );

      navigate('/admin/products');
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
      setSaving(false);
    }
  };

  const getTitleStatus = (len: number) => {
    if (len === 0) return { text: 'Missing', color: 'text-red-500 bg-red-50 border-red-200' };
    if (len < 30) return { text: 'Too Short', color: 'text-amber-500 bg-amber-50 border-amber-200' };
    if (len <= 60) return { text: 'Optimal', color: 'text-emerald-500 bg-emerald-50 border-emerald-200' };
    return { text: 'Too Long', color: 'text-red-500 bg-red-50 border-red-200' };
  };

  const getDescStatus = (len: number) => {
    if (len === 0) return { text: 'Missing', color: 'text-red-500 bg-red-50 border-red-200' };
    if (len < 80) return { text: 'Too Short', color: 'text-amber-500 bg-amber-50 border-amber-200' };
    if (len <= 160) return { text: 'Optimal', color: 'text-emerald-500 bg-emerald-50 border-emerald-200' };
    return { text: 'Too Long', color: 'text-red-500 bg-red-50 border-red-200' };
  };

  const titleLen = form.seoTitle.length;
  const titleStatus = getTitleStatus(titleLen);
  const descLen = form.metaDescription.length;
  const descStatus = getDescStatus(descLen);

  const renderCategorySelectors = () => {
    const selectors = [];
    
    for (let i = 0; i <= categoryChain.length; i++) {
      const parentId = i === 0 ? null : categoryChain[i - 1];
      const availableOptions = categories.filter(c => (categoryDetails[c]?.parentId || null) === parentId);
      
      if (availableOptions.length === 0) break;

      const selectedValue = i < categoryChain.length ? categoryChain[i] : '';

      selectors.push(
        <div key={i} className={i > 0 ? 'mt-3' : ''}>
          {i === 0 && (
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
          )}
          <select
            value={selectedValue}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                setForm(prev => ({ ...prev, category: val }));
              } else {
                setForm(prev => ({ ...prev, category: parentId || '' }));
              }
            }}
            className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-white ${i === 0 && errors.category ? 'border-red-400 bg-red-50' : 'border-gray-300'} ${getHighlightClass('category')}`}
          >
            <option value="">{i === 0 ? 'Select Main Category...' : 'Select Sub-Category...'}</option>
            {availableOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      );
    }
    
    return selectors;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/products" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isEdit ? `Editing: ${existingProduct?.name || '...'}` : 'Fill in the details below to add a new product'}
          </p>
        </div>
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-lg mb-5">
          {saveError}
        </div>
      )}

      {/* AI Product Wizard Panel */}
      <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100/80 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowWizard(!showWizard)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/10">
              <span className="text-lg">✨</span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-[15px] flex items-center gap-2">
                AI Product Sourcing Wizard
                <span className="text-[9px] uppercase font-black tracking-widest text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Gemini AI</span>
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">Paste supplier descriptions, catalogs, or Chinese spec sheets to auto-populate fields.</p>
            </div>
          </div>
          <button
            type="button"
            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-[11px] font-bold text-slate-700 shadow-sm transition-all"
          >
            {showWizard ? 'Hide Wizard' : 'Open Wizard'}
          </button>
        </div>

        {showWizard && (
          <div className="mt-4 pt-4 border-t border-blue-100/50 space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">
                Unstructured Product & Sourcing Raw Text
              </label>
              <textarea
                value={rawInputText}
                onChange={e => setRawInputText(e.target.value)}
                placeholder="Paste your raw specifications or catalog text here. E.g. 'Model: DM1700 electronic cut reflective sheeting. MOQ: 10 rolls. Price: hidden, call for quote. Category: Reflectors. Shipping from China factory. Image URL: https://example.com/pic.jpg...'"
                rows={5}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-mono"
              />
            </div>

            {wizardError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                ⚠️ {wizardError}
              </div>
            )}

            {wizardSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                ✅ <strong>Success!</strong> Form fields successfully populated with AI structured data. Check the tabs below to verify and save.
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAiParse}
                disabled={parsing || !rawInputText.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini is parsing product data...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Generate & Auto-fill Form</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRawInputText('');
                  setWizardError('');
                  setWizardSuccess(false);
                }}
                disabled={parsing || !rawInputText}
                className="px-3 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'basic'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <Package className="w-4.5 h-4.5" />
          Basic Information
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'seo'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <Globe className="w-4.5 h-4.5" />
          SEO Controls & Media Tags
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5">
            {activeTab === 'basic' ? (
              <>
                {/* Basic Info */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h2 className="font-bold text-slate-900 mb-4 text-[15px]">Basic Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder="e.g. Solar LED Heavy Duty Traffic Light - 300mm"
                        className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'} ${getHighlightClass('name')}`}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Brand
                          <span className="text-slate-400 font-normal normal-case ml-1">(optional)</span>
                        </label>
                        <input
                          type="text"
                          list="brands-list"
                          value={form.brand}
                          onChange={e => set('brand', e.target.value)}
                          placeholder="e.g. LumiSafe"
                          className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all ${errors.brand ? 'border-red-400 bg-red-50' : 'border-gray-300'} ${getHighlightClass('brand')}`}
                        />
                        <datalist id="brands-list">
                          {brands.map(b => <option key={b} value={b} />)}
                        </datalist>
                        {errors.brand && <p className="text-red-500 text-xs mt-1 font-medium">{errors.brand}</p>}
                      </div>

                      <div>
                        {renderCategorySelectors()}
                        {errors.category && <p className="text-red-500 text-xs mt-1 font-medium">{errors.category}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h2 className="font-bold text-slate-900 mb-1 text-[15px]">Pricing</h2>
                  <p className="text-xs text-slate-400 mb-4">Choose how the price is shown to customers.</p>

                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {(['fixed', 'range', 'hidden'] as const).map(type => {
                      const info: Record<string, { icon: string; title: string; desc: string; active: string; inactive: string }> = {
                        fixed: { icon: '💰', title: 'Fixed Price', desc: 'Show exact price', active: 'border-blue-500 bg-blue-50 ring-2 ring-blue-100', inactive: 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40' },
                        range: { icon: '📊', title: 'Price Range', desc: 'Show min – max range', active: 'border-amber-500 bg-amber-50 ring-2 ring-amber-100', inactive: 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/40' },
                        hidden: { icon: '🔒', title: 'Hide Price', desc: 'Contact for price', active: 'border-slate-500 bg-slate-100 ring-2 ring-slate-200', inactive: 'border-gray-200 hover:border-slate-400 hover:bg-slate-50' },
                      };
                      const i = info[type];
                      const isActive = form.priceType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => set('priceType', type)}
                          className={`flex flex-col items-center gap-1 border-2 rounded-xl p-3 transition-all cursor-pointer text-center ${isActive ? i.active : i.inactive}`}
                        >
                          <span className="text-xl">{i.icon}</span>
                          <span className="text-[12px] font-extrabold text-slate-800">{i.title}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{i.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {form.priceType === 'fixed' && (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Sale Price (AED) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number" min="0" step="0.01" value={form.price}
                          onChange={e => set('price', e.target.value)} placeholder="0.00"
                          className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all ${errors.price ? 'border-red-400 bg-red-50' : 'border-gray-300'} ${getHighlightClass('price')}`}
                        />
                        {errors.price && <p className="text-red-500 text-xs mt-1 font-medium">{errors.price}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          MRP / Original (AED) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number" min="0" step="0.01" value={form.mrp}
                          onChange={e => set('mrp', e.target.value)} placeholder="0.00"
                          className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all ${errors.mrp ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.mrp && <p className="text-red-500 text-xs mt-1 font-medium">{errors.mrp}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Discount (%) — Auto
                        </label>
                        <input
                          type="number" min="0" max="100" value={form.discount}
                          onChange={e => set('discount', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all bg-blue-50 font-semibold text-blue-800"
                        />
                      </div>
                    </div>
                  )}

                  {form.priceType === 'range' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Minimum Price (AED) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number" min="0" step="0.01" value={form.priceMin}
                            onChange={e => set('priceMin', e.target.value)} placeholder="e.g. 10"
                            className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:border-amber-500 outline-none transition-all ${errors.priceMin ? 'border-red-400 bg-red-50' : 'border-gray-300'} ${getHighlightClass('priceMin')}`}
                          />
                          {errors.priceMin && <p className="text-red-500 text-xs mt-1 font-medium">{errors.priceMin}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Maximum Price (AED) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number" min="0" step="0.01" value={form.priceMax}
                            onChange={e => set('priceMax', e.target.value)} placeholder="e.g. 150"
                            className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:border-amber-500 outline-none transition-all ${errors.priceMax ? 'border-red-400 bg-red-50' : 'border-gray-300'} ${getHighlightClass('priceMax')}`}
                          />
                          {errors.priceMax && <p className="text-red-500 text-xs mt-1 font-medium">{errors.priceMax}</p>}
                        </div>
                      </div>
                      {form.priceMin && form.priceMax && Number(form.priceMin) < Number(form.priceMax) && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs font-semibold text-amber-800">
                          Preview on storefront: <span className="font-extrabold">AED {Number(form.priceMin).toLocaleString()} – AED {Number(form.priceMax).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {form.priceType === 'hidden' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex items-start gap-3">
                      <span className="text-2xl mt-0.5">🔒</span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Price is hidden from customers</p>
                        <p className="text-xs text-slate-500 mt-0.5">Customers will see a <span className="font-semibold">"Contact for Price"</span> button instead of a price. Ideal for custom-quoted industrial products.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h2 className="font-bold text-slate-900 mb-4 text-[15px]">Product Description</h2>
                  <textarea
                    rows={5} value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder="Describe the product in detail — features, specifications, use cases..."
                    className={`w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all resize-none ${getHighlightClass('description')}`}
                  />
                </div>

                {/* Ratings */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h2 className="font-bold text-slate-900 mb-4 text-[15px]">Ratings & Reviews</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Rating (0–5)</label>
                      <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => set('rating', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Review Count</label>
                      <input type="number" min="0" value={form.reviews} onChange={e => set('reviews', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>

                {/* Procurement Details */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h2 className="font-bold text-slate-900 mb-4 text-[15px]">Procurement Details</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        MOQ (Min. Order Qty)
                      </label>
                      <input
                        type="text"
                        value={form.moq}
                        onChange={e => set('moq', e.target.value)}
                        placeholder="e.g. 500 Pcs"
                        className={`w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all ${getHighlightClass('moq')}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Lead Time
                      </label>
                      <select
                        value={form.leadTime}
                        onChange={e => set('leadTime', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all bg-white"
                      >
                        <option value="">Auto (Default)</option>
                        <option value="3–5 Days">3–5 Days</option>
                        <option value="5–7 Days">5–7 Days</option>
                        <option value="7–10 Days">7–10 Days</option>
                        <option value="1–2 Weeks">1–2 Weeks</option>
                        <option value="2–4 Weeks">2–4 Weeks</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Shipping Region
                      </label>
                      <select
                        value={form.shippingRegion}
                        onChange={e => set('shippingRegion', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all bg-white"
                      >
                        <option value="">Auto (Default)</option>
                        <option value="Ships to GCC">Ships to GCC</option>
                        <option value="Ships to UAE">Ships to UAE</option>
                        <option value="GCC & MENA">GCC & MENA</option>
                        <option value="ME & Asia">ME & Asia</option>
                        <option value="Ships Worldwide">Ships Worldwide</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Product Badge
                      </label>
                      <select
                        value={form.badge}
                        onChange={e => set('badge', e.target.value)}
                        className={`w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all bg-white ${getHighlightClass('badge')}`}
                      >
                        <option value="">None</option>
                        <option value="Bestseller">Bestseller</option>
                        <option value="Top Rated">Top Rated</option>
                        <option value="New">New</option>
                        <option value="Hot">Hot</option>
                        <option value="Bulk Deal">Bulk Deal</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Trust Badges (Max 2)
                    </label>
                    <div className={`flex flex-wrap gap-2 rounded-lg p-1 transition-all ${getHighlightClass('trustBadges')}`}>
                      {['Verified Supplier', 'Export Ready', 'ISO Certified', 'GCC Supply', 'Fast Dispatch'].map(badge => (
                        <button
                          key={badge}
                          type="button"
                          onClick={() => toggleTrustBadge(badge)}
                          disabled={!form.trustBadges.includes(badge) && form.trustBadges.length >= 2}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${form.trustBadges.includes(badge)
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                        >
                          {badge}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-slate-900 text-[15px]">Technical Specifications</h2>
                    <button
                      type="button"
                      onClick={addSpec}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      + Add Row
                    </button>
                  </div>

                  {form.specifications.length > 0 ? (
                    <div className="space-y-3">
                      {form.specifications.map((spec, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <input
                            type="text"
                            value={spec.key}
                            onChange={e => updateSpec(idx, 'key', e.target.value)}
                            placeholder="Label (e.g. Color)"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:border-blue-500 outline-none transition-all"
                          />
                          <input
                            type="text"
                            value={spec.value}
                            onChange={e => updateSpec(idx, 'value', e.target.value)}
                            placeholder="Value (e.g. Red)"
                            className="flex-[2] border border-gray-300 rounded-lg px-3 py-2 text-xs focus:border-blue-500 outline-none transition-all font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => removeSpec(idx)}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-slate-400 text-xs italic">
                      No specifications added yet.
                    </div>
                  )}
                </div>
              </>
            ) : activeTab === 'seo' ? (
              <>
                {/* General SEO Configurations */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
                  <h2 className="font-bold text-slate-900 text-[15px] border-b pb-2 border-slate-100 flex items-center gap-2">
                    🤖 Crawlability & Schema Directives
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Focus Keyword
                      </label>
                      <input
                        type="text"
                        value={form.focusKeyword}
                        onChange={e => set('focusKeyword', e.target.value)}
                        placeholder="e.g. reflective tape wholesale uae"
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Canonical URL
                      </label>
                      <input
                        type="text"
                        value={form.canonicalUrl}
                        onChange={e => set('canonicalUrl', e.target.value)}
                        placeholder="e.g. https://www.alzaydaninternational.com/product/..."
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Robots Indexing Directives
                    </label>
                    <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={form.noIndex}
                          onChange={e => set('noIndex', e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500 border-gray-300 w-4.5 h-4.5 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-slate-800 text-xs block uppercase">noindex</span>
                          <span className="text-[10px] text-slate-500 font-medium">Do not show in search engine indices.</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={form.noFollow}
                          onChange={e => set('noFollow', e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500 border-gray-300 w-4.5 h-4.5 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-slate-800 text-xs block uppercase">nofollow</span>
                          <span className="text-[10px] text-slate-500 font-medium">Do not pass authority to page outbound links.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* SEO Meta Titles & Descriptions */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
                  <h2 className="font-bold text-slate-900 text-[15px] border-b pb-2 border-slate-100 flex items-center gap-2">
                    ✍️ Search Result Metadata
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>URL Slug Customizer</span>
                      <button
                        type="button"
                        onClick={() => {
                          setForm(prev => ({ ...prev, slug: generateSlug(form.name) }));
                          setSlugLocked(false);
                        }}
                        className="text-[10px] text-blue-600 hover:underline font-bold font-sans normal-case"
                      >
                        Reset to Auto-Generated
                      </button>
                    </label>
                    <div className="flex rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-50 transition-all overflow-hidden bg-slate-50/50">
                      <span className="bg-slate-100 text-slate-500 text-xs px-3 flex items-center font-medium border-r border-gray-300">
                        /product/
                      </span>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={e => { set('slug', e.target.value); setSlugLocked(true); }}
                        placeholder="reflective-tape"
                        className={`w-full px-3 py-2 text-sm outline-none bg-transparent ${getHighlightClass('slug')}`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        SEO Title Override
                      </label>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border leading-none ${titleStatus.color}`}>
                        {titleLen} / 60 — {titleStatus.text}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={form.seoTitle}
                      onChange={e => set('seoTitle', e.target.value)}
                      placeholder={form.name ? `${form.name} | Al Zaydan UAE` : "e.g. 3M Reflective Sheets UAE"}
                      className={`w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all ${getHighlightClass('seoTitle')}`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Meta Description
                      </label>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border leading-none ${descStatus.color}`}>
                        {descLen} / 160 — {descStatus.text}
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={form.metaDescription}
                      onChange={e => set('metaDescription', e.target.value)}
                      placeholder={form.description ? form.description.slice(0, 150) + '...' : "Describe this product for search engines..."}
                      className={`w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all resize-none ${getHighlightClass('metaDescription')}`}
                    />
                  </div>
                </div>

                {/* Social Media Sharing Cards */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
                  <h2 className="font-bold text-slate-900 text-[15px] border-b pb-2 border-slate-100 flex items-center gap-2">
                    👥 Social Graph Cards (Open Graph / Twitter)
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Open Graph Title (Facebook / LinkedIn)
                      </label>
                      <input
                        type="text"
                        value={form.ogTitle}
                        onChange={e => set('ogTitle', e.target.value)}
                        placeholder="Fallback: Page Title Tag"
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Open Graph Description
                      </label>
                      <textarea
                        rows={2}
                        value={form.ogDescription}
                        onChange={e => set('ogDescription', e.target.value)}
                        placeholder="Fallback: Meta Description Tag"
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Open Graph Image URL
                        </label>
                        <input
                          type="text"
                          value={form.ogImage}
                          onChange={e => set('ogImage', e.target.value)}
                          placeholder="Fallback: Product Primary Image"
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Twitter Image URL
                        </label>
                        <input
                          type="text"
                          value={form.twitterImage}
                          onChange={e => set('twitterImage', e.target.value)}
                          placeholder="Fallback: Product Primary Image"
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Twitter Card Title
                        </label>
                        <input
                          type="text"
                          value={form.twitterTitle}
                          onChange={e => set('twitterTitle', e.target.value)}
                          placeholder="Fallback: Page Title Tag"
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Twitter Description
                        </label>
                        <input
                          type="text"
                          value={form.twitterDescription}
                          onChange={e => set('twitterDescription', e.target.value)}
                          placeholder="Fallback: Meta Description Tag"
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image SEO Alt & Title Tags Mapping */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
                  <h2 className="font-bold text-slate-900 text-[15px] border-b pb-2 border-slate-100 flex items-center gap-2">
                    🖼️ Image Alt & Title Attributes
                  </h2>
                  <p className="text-xs text-slate-400">Specify search-engine friendly descriptions for all product images. Search bots read image alt tags to index and rank pages on Google Image Search.</p>

                  {mediaUrls.length > 0 ? (
                    <div className="space-y-4 divide-y divide-gray-100">
                      {mediaUrls.map((url, idx) => {
                        const itemSeo = localImagesSeo[url] || { altText: '', title: '' };
                        return (
                          <div key={idx} className="pt-4 first:pt-0 flex gap-4 items-start">
                            <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden shrink-0 relative shadow-sm">
                              <img src={url} className="w-full h-full object-cover" alt="" />
                              <span className="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-tl">
                                #{idx + 1}
                              </span>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  Alt Tag Text (Description)
                                </label>
                                <input
                                  type="text"
                                  value={itemSeo.altText}
                                  onChange={e => {
                                    const alt = e.target.value;
                                    setLocalImagesSeo(prev => ({
                                      ...prev,
                                      [url]: { ...prev[url], altText: alt }
                                    }));
                                  }}
                                  placeholder="e.g. Yellow reflective sheeting tape roll"
                                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 outline-none transition-all bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  Title Attribute Tag
                                </label>
                                <input
                                  type="text"
                                  value={itemSeo.title}
                                  onChange={e => {
                                    const title = e.target.value;
                                    setLocalImagesSeo(prev => ({
                                      ...prev,
                                      [url]: { ...prev[url], title }
                                    }));
                                  }}
                                  placeholder="e.g. Buy high visibility reflective sheeting UAE"
                                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 outline-none transition-all bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs italic bg-slate-50 rounded-lg border">
                      Add product media first in the basic info tab to configure image SEO tags.
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {activeTab === 'basic' ? (
              /* Product Media Gallery */
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-slate-900 text-[15px]">Product Media</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Add images. First image is primary.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>

                {/* URL Input */}
                <div className="flex gap-2 mb-6">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      placeholder="Paste image URL here..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addUrl}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all"
                  >
                    Add URL
                  </button>
                </div>

                {uploading && (
                  <div className="mb-4 bg-blue-50 rounded-lg p-3 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <div className="flex-1">
                      <div className="text-[11px] font-bold text-blue-700">Uploading images... {uploadProgress}%</div>
                      <div className="w-full h-1 bg-blue-200 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Media Grid */}
                {mediaUrls.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {mediaUrls.map((url, idx) => (
                      <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border group transition-all ${idx === 0 ? 'border-blue-600 ring-2 ring-blue-50' : 'border-slate-100 hover:border-slate-300'}`}>
                        <img src={url} className="w-full h-full object-cover" alt={`Product ${idx}`} />

                        {/* Badge for Primary */}
                        {idx === 0 && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm z-10">
                            PRIMARY
                          </div>
                        )}

                        {/* Overlays */}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => makePrimary(idx)}
                              className="bg-white text-slate-900 px-2 py-1 rounded text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="py-12 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-blue-200 transition-all"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 opacity-30" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-500">Click to upload product images</span>
                    <span className="text-[10px] mt-1 text-slate-400">or paste a URL above</span>
                  </div>
                )}
                {errors.image && <p className="text-red-500 text-xs mt-3 font-medium text-center">{errors.image}</p>}
              </div>
            ) : (
              /* Real-time Google SERP Preview */
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4 sticky top-6">
                <h3 className="font-bold text-slate-900 text-[15px] flex items-center gap-1.5">
                  🔍 Google Search Snippet Preview
                </h3>

                {(() => {
                  const generatedSeo = generateProductSEO(form as unknown as Product);
                  const displayTitle = generatedSeo.title;
                  const displayDesc = generatedSeo.description;
                  const titleLen = displayTitle.length;
                  const descLen = displayDesc.length;

                  return (
                    <>
                      <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm font-sans text-left">
                        <div className="text-xs text-slate-600 flex items-center gap-1 mb-1 truncate">
                          <span>https://www.alzaydaninternational.com</span>
                          <span>›</span>
                          <span className="text-slate-500">product</span>
                          <span>›</span>
                          <span className="text-emerald-700 font-medium truncate">
                            {form.slug || generateSlug(form.name) || 'product-slug'}
                          </span>
                        </div>
                        <h4 className="text-blue-800 text-[19px] hover:underline leading-tight font-medium cursor-pointer truncate">
                          {displayTitle}
                        </h4>
                        <p className="text-xs text-slate-600 leading-normal mt-1 break-words line-clamp-2">
                          {displayDesc}
                        </p>
                      </div>

                      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-2">
                        <h4 className="text-xs font-bold text-blue-900">SEO Health Quick Score</h4>
                        <div className="flex gap-3 text-xs text-blue-800">
                          <div className="flex-1 text-center bg-white p-2 rounded border border-blue-100 shadow-sm">
                            <span className={`block font-black text-sm ${titleLen >= 30 && titleLen <= 60 ? 'text-emerald-600' : 'text-amber-500'}`}>{titleLen}</span>
                            Title Length
                          </div>
                          <div className="flex-1 text-center bg-white p-2 rounded border border-blue-100 shadow-sm">
                            <span className={`block font-black text-sm ${descLen >= 80 && descLen <= 160 ? 'text-emerald-600' : 'text-amber-500'}`}>{descLen}</span>
                            Meta Length
                          </div>
                        </div>
                        <div className="text-[10px] text-blue-700/80 leading-relaxed font-medium">
                          * Title tag target: <span className="font-semibold">30-60 characters</span>.<br />
                          * Meta description target: <span className="font-semibold">80-160 characters</span>.
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Settings */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-bold text-slate-900 mb-4 text-[15px]">Product Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">In Stock</div>
                    <div className="text-xs text-slate-400 font-medium">Product available for purchase</div>
                  </div>
                  <button type="button" onClick={() => set('inStock', !form.inStock)}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${form.inStock ? 'bg-emerald-500' : 'bg-gray-300'} ${getHighlightClass('inStock')}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.inStock ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Top Selling Product</div>
                    <div className="text-xs text-slate-400 font-medium">Show in "Best Selling" section</div>
                  </div>
                  <button type="button" onClick={() => set('topSelling', !form.topSelling)}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${form.topSelling ? 'bg-blue-500' : 'bg-gray-300'} ${getHighlightClass('topSelling')}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.topSelling ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Featured on Homepage</div>
                    <div className="text-xs text-slate-400 font-medium">Show in "Top Products" section</div>
                  </div>
                  <button type="button" onClick={() => set('featured', !form.featured)}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${form.featured ? 'bg-amber-500' : 'bg-gray-300'} ${getHighlightClass('featured')}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={saving || uploading}
              className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm text-white ${saving
                  ? 'bg-blue-500 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-60'
                }`}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Saving changes…</span>
                </>
              ) : (
                <><Save className="w-4 h-4" />{isEdit ? 'Save Changes' : 'Add Product'}</>
              )}
            </button>

            <Link to="/admin/products"
              className="w-full border border-gray-200 hover:bg-gray-50 text-slate-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
