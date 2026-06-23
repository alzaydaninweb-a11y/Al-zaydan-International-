import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  ShieldAlert, CheckCircle2, AlertTriangle, HelpCircle,
  TrendingUp, BarChart3, Globe, Package, Tag, FileText, Layers, RefreshCw, Wand2, Loader2, Play, Square
} from 'lucide-react';
import { generateProductSEO } from '../../lib/seoGenerator';

export default function AdminSEODashboard() {
  const { products, categories, categoryDetails, redirects, pagesSeo, imagesSeo, updateProduct } = useStore();

  // 1. Calculations for Widgets
  const totalProducts = products.length;
  const productsMissingSeo = useMemo(() => {
    return products.filter(p => !p.seoTitle || !p.metaDescription).length;
  }, [products]);

  const productsMissingImages = useMemo(() => {
    return products.filter(p => !p.image).length;
  }, [products]);

  const productsMissingAltText = useMemo(() => {
    return products.filter(p => {
      const primaryAlt = imagesSeo[p.image]?.altText;
      return !primaryAlt || primaryAlt.trim().length === 0;
    }).length;
  }, [products, imagesSeo]);

  const productsMissingContent = useMemo(() => {
    return products.filter(p => !p.contentGenerated);
  }, [products]);

  const [isBulkGenerating, setIsBulkGenerating] = React.useState(false);
  const [bulkGenProgress, setBulkGenProgress] = React.useState(0);
  const [bulkGenCurrent, setBulkGenCurrent] = React.useState('');
  const stopBulkGenRef = React.useRef(false);

  const startBulkGeneration = async () => {
    if (productsMissingContent.length === 0) return;
    setIsBulkGenerating(true);
    setBulkGenProgress(0);
    stopBulkGenRef.current = false;

    const fnBase = window.location.port === '3000' ? 'http://localhost:8888' : '';

    for (let i = 0; i < productsMissingContent.length; i++) {
      if (stopBulkGenRef.current) break;
      const p = productsMissingContent[i];
      setBulkGenCurrent(p.name);

      try {
        const res = await fetch(`${fnBase}/.netlify/functions/generate-product-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: p.name,
            brand: p.brand,
            category: p.category,
            description: p.description
          })
        });

        if (res.ok) {
          const data = await res.json();
          await updateProduct(p.id, {
            description: data.description || p.description,
            features: data.features || p.features || [],
            benefits: data.benefits || p.benefits || [],
            applications: data.applications || p.applications || [],
            specifications: data.specifications && data.specifications.length > 0 ? data.specifications : p.specifications || [],
            faqs: data.faqs || p.faqs || [],
            primaryKeyword: data.primaryKeyword || p.primaryKeyword || '',
            secondaryKeywords: data.secondaryKeywords || p.secondaryKeywords || [],
            semanticEntities: data.semanticEntities || p.semanticEntities || [],
            contentGenerated: true
          });
        }
      } catch (err) {
        console.error(`Failed to generate for ${p.name}:`, err);
      }
      setBulkGenProgress(Math.round(((i + 1) / productsMissingContent.length) * 100));
    }
    
    setIsBulkGenerating(false);
    setBulkGenCurrent('');
  };

  const stopBulkGeneration = () => {
    stopBulkGenRef.current = true;
    setIsBulkGenerating(false);
    setBulkGenCurrent('');
  };

  const totalRedirects = redirects.length;
  const totalCategories = categories.length;
  const staticPagesCount = 5; // Home, About, Contact, RFQ, Services

  // 2. Health Audits
  const alerts = useMemo(() => {
    const list: { id: string; type: 'error' | 'warning' | 'info'; title: string; desc: string; link?: string }[] = [];

    // Check Duplicate Slugs
    const slugMap: Record<string, string[]> = {};
    products.forEach(p => {
      const s = p.slug || '';
      if (s) {
        if (!slugMap[s]) slugMap[s] = [];
        slugMap[s].push(p.name);
      }
    });
    Object.entries(slugMap).forEach(([slug, names]) => {
      if (names.length > 1) {
        list.push({
          id: `dup-slug-${slug}`,
          type: 'error',
          title: `Duplicate URL Slug: /product/${slug}`,
          desc: `Used by multiple products: ${names.join(', ')}. Slugs must be unique.`,
          link: '/admin/products',
        });
      }
    });

    // Check Categories Slugs
    const catSlugMap: Record<string, string[]> = {};
    Object.entries(categoryDetails || {}).forEach(([catName, details]) => {
      const s = details.slug || '';
      if (s) {
        if (!catSlugMap[s]) catSlugMap[s] = [];
        catSlugMap[s].push(catName);
      }
    });
    Object.entries(catSlugMap).forEach(([slug, names]) => {
      if (names.length > 1) {
        list.push({
          id: `dup-cat-slug-${slug}`,
          type: 'error',
          title: `Duplicate Category Slug: /category/${slug}`,
          desc: `Used by categories: ${names.join(', ')}.`,
          link: '/admin/categories',
        });
      }
    });

    // Check Products using generateProductSEO
    const generatedTitleMap: Record<string, string[]> = {};
    const generatedDescMap: Record<string, string[]> = {};
    const generatedCanonicalMap: Record<string, string[]> = {};

    products.forEach(p => {
      const generated = generateProductSEO(p);

      // Track titles
      if (!generatedTitleMap[generated.title]) generatedTitleMap[generated.title] = [];
      generatedTitleMap[generated.title].push(p.name);

      // Track descriptions
      if (!generatedDescMap[generated.description]) generatedDescMap[generated.description] = [];
      generatedDescMap[generated.description].push(p.name);

      // Track canonicals
      if (!generatedCanonicalMap[generated.canonical]) generatedCanonicalMap[generated.canonical] = [];
      generatedCanonicalMap[generated.canonical].push(p.name);

      if (!p.seoTitle) {
        list.push({
          id: `missing-title-${p.id}`,
          type: 'info',
          title: `Using Generated SEO Title: ${p.name}`,
          desc: `Google snippet will fallback to: "${generated.title}"`,
          link: `/admin/products/edit/${p.id}`,
        });
      }
      if (!p.metaDescription) {
        list.push({
          id: `missing-desc-${p.id}`,
          type: 'info',
          title: `Using Generated Meta Description: ${p.name}`,
          desc: `Google snippet will fallback to: "${generated.description.slice(0, 50)}..."`,
          link: `/admin/products/edit/${p.id}`,
        });
      }
      if (p.slug && p.slug.length > 50) {
        list.push({
          id: `long-url-${p.id}`,
          type: 'warning',
          title: `Long URL Slug: /product/${p.slug}`,
          desc: 'URL slug is longer than 50 characters. Consider shortening it.',
          link: `/admin/products/edit/${p.id}`,
        });
      }
      if (p.canonicalUrl && !p.canonicalUrl.startsWith('https://')) {
        list.push({
          id: `broken-canonical-${p.id}`,
          type: 'error',
          title: `Invalid Canonical URL: ${p.name}`,
          desc: `Canonical URL must start with 'https://' (currently: '${p.canonicalUrl}')`,
          link: `/admin/products/edit/${p.id}`,
        });
      }
    });

    // Add alerts for duplicates
    Object.entries(generatedTitleMap).forEach(([title, names]) => {
      if (names.length > 1) {
        list.push({
          id: `dup-title-${title.substring(0, 10)}`,
          type: 'error',
          title: `Duplicate SEO Title Detected`,
          desc: `The title "${title}" is shared by ${names.length} products (e.g. ${names.slice(0, 2).join(', ')}).`,
        });
      }
    });

    Object.entries(generatedDescMap).forEach(([desc, names]) => {
      if (names.length > 1) {
        list.push({
          id: `dup-desc-${desc.substring(0, 10)}`,
          type: 'warning',
          title: `Duplicate Meta Description Detected`,
          desc: `Shared by ${names.length} products. Add custom descriptions to improve CTR.`,
        });
      }
    });

    Object.entries(generatedCanonicalMap).forEach(([canonical, names]) => {
      if (names.length > 1) {
        list.push({
          id: `dup-canonical-${canonical.substring(0, 10)}`,
          type: 'error',
          title: `Canonical Conflict Detected`,
          desc: `The URL "${canonical}" is set as canonical for ${names.length} different products.`,
        });
      }
    });

    // Check static pages SEO settings
    const pages = ['home', 'about', 'contact', 'rfq', 'services'];
    pages.forEach(pg => {
      const pData = pagesSeo[pg];
      if (!pData || !pData.seoTitle) {
        list.push({
          id: `missing-page-title-${pg}`,
          type: 'error',
          title: `Missing Page SEO Config: ${pg.toUpperCase()}`,
          desc: `Configure Title and Meta description overrides for the /${pg} static page.`,
          link: '/admin/settings',
        });
      }
    });

    return list;
  }, [products, categoryDetails, pagesSeo]);

  const errorCount = alerts.filter(a => a.type === 'error').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;
  const infoCount = alerts.filter(a => a.type === 'info').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600 animate-pulse" />
            SEO Health Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Monitor and audit search ranking optimizations, redirects, and meta tags in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/seo-bulk"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            Bulk SEO Editor
          </Link>
          <Link
            to="/admin/redirects"
            className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            Manage Redirects
          </Link>
        </div>
      </div>

      {/* Audit Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-red-700">{errorCount}</div>
            <div className="text-xs text-red-500 font-semibold uppercase tracking-wider">Critical SEO Errors</div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-700">{warningCount}</div>
            <div className="text-xs text-amber-500 font-semibold uppercase tracking-wider">SEO Warnings</div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700">
              {alerts.length === 0 ? '100%' : `${Math.max(0, Math.round(100 - (alerts.length / totalProducts) * 100))}%`}
            </div>
            <div className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">Overall SEO Health Score</div>
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Products</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-1">{totalProducts}</h3>
            <span className="text-[10px] text-slate-400 font-medium">Indexed items</span>
          </div>
          <Package className="w-8 h-8 text-slate-300" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Missing SEO Meta</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-1">{productsMissingSeo}</h3>
            <span className="text-[10px] text-red-500 font-semibold">Requires description</span>
          </div>
          <FileText className="w-8 h-8 text-slate-300" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No Alt Image Text</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-1">{productsMissingAltText}</h3>
            <span className="text-[10px] text-amber-500 font-semibold">Accessibility gap</span>
          </div>
          <Layers className="w-8 h-8 text-slate-300" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Active Redirects</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-1">{totalRedirects}</h3>
            <span className="text-[10px] text-blue-600 font-semibold">301/302 mappings</span>
          </div>
          <RefreshCw className="w-8 h-8 text-slate-300 animate-spin-slow" />
        </div>

      </div>

      {/* Bulk AI Content Generator */}
      {productsMissingContent.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl shadow-lg border border-indigo-700/50 p-5 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-indigo-200" />
              </div>
              <h2 className="text-base font-extrabold tracking-tight">AI Semantic Engine</h2>
            </div>
            <p className="text-sm text-indigo-200 leading-relaxed max-w-xl">
              There are <strong className="text-white bg-indigo-500/40 px-1.5 py-0.5 rounded">{productsMissingContent.length} products</strong> missing deep semantic content. 
              The AI Engine can automatically generate robust overviews, FAQs, features, and specifications for all of them using Gemini.
            </p>
            
            {isBulkGenerating && (
              <div className="mt-4 bg-indigo-950/50 rounded-lg p-3 border border-indigo-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-indigo-300 animate-spin" />
                    <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">
                      Processing: <span className="text-white normal-case tracking-normal truncate inline-block max-w-[200px] align-bottom">{bulkGenCurrent}</span>
                    </span>
                  </div>
                  <span className="text-xs font-black text-indigo-300">{bulkGenProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-indigo-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 transition-all duration-300 shadow-[0_0_10px_rgba(96,165,250,0.5)]" style={{ width: `${bulkGenProgress}%` }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 shrink-0">
            {isBulkGenerating ? (
              <button
                onClick={stopBulkGeneration}
                className="px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" /> Stop Generator
              </button>
            ) : (
              <button
                onClick={startBulkGeneration}
                className="px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 group"
              >
                <Play className="w-3.5 h-3.5 fill-indigo-600 group-hover:scale-110 transition-transform" /> 
                Start Bulk Generation
              </button>
            )}
          </div>
        </div>
      )}

      {/* Health Auditor Log */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">SEO Health Auditor alerts</h2>
            <p className="text-xs text-slate-400 mt-0.5">Automated checks evaluating metadata, slug patterns, and compliance.</p>
          </div>
          <span className="bg-slate-200 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded">
            {alerts.length} ALERTS ACTIVE
          </span>
        </div>

        {alerts.length > 0 ? (
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    {alert.type === 'error' && <ShieldAlert className="w-4.5 h-4.5 text-red-500" />}
                    {alert.type === 'warning' && <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />}
                    {alert.type === 'info' && <HelpCircle className="w-4.5 h-4.5 text-blue-500" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{alert.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{alert.desc}</p>
                  </div>
                </div>
                {alert.link && (
                  <Link
                    to={alert.link}
                    className="px-2.5 py-1 bg-white border border-gray-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-[10px] font-bold rounded-lg transition-colors shrink-0 shadow-sm"
                  >
                    Fix Issue
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 font-medium text-xs">
            🎉 Great job! No SEO alerts, duplicate slugs, or missing descriptions found.
          </div>
        )}
      </div>

    </div>
  );
}
