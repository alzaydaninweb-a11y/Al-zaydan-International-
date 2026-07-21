import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductListingGrid from '../components/home/ProductListingGrid';
import { Filter, X, ChevronDown, ChevronUp, SlidersHorizontal, RotateCcw, Check, ChevronRight } from 'lucide-react';
import { useSEO } from '../lib/useSEO';
import { generateSlug } from '../lib/blogService';
import { generateOrganizationSchema, generateBreadcrumbSchema, generateItemListSchema } from '../lib/schemaGenerator';
import { generateCategorySEO } from '../lib/seoGenerator';

// ─── Collapsible filter section ───────────────────────────────────────────────

function FilterSection({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-slate-100 pb-4 mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <span className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          {title}
          {count != null && count > 0 && (
            <span className="w-5 h-5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          : <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />}
      </button>
      {open && (
        <div className="pr-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Hierarchical Category Node Component ──────────────────────────────────────

function CategoryNode({ 
  cat, 
  depth, 
  activePath, 
  selCategory, 
  allCategories, 
  categoryDetails, 
  navigate, 
  setSelBrands,
  searchQuery
}: any) {
  const [isOpen, setIsOpen] = useState(activePath.has(cat));
  const details = categoryDetails?.[cat];
  const catSlug = details?.slug || generateSlug(cat);
  const children = allCategories.filter((c: string) => (categoryDetails?.[c]?.parentId || null) === cat);
  const hasChildren = children.length > 0;
  const isSelected = selCategory === cat;
  const inActivePath = activePath.has(cat);

  // Sync open state when activePath changes externally
  useEffect(() => {
    if (activePath.has(cat)) setIsOpen(true);
  }, [activePath, cat]);

  return (
    <div className="mt-1">
      <div className="flex items-center gap-1 group">
        <button
          onClick={() => {
            setSelBrands([]);
            navigate(`/category/${catSlug}${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`);
          }}
          className={`flex-1 flex items-center gap-2 text-[13.5px] py-1.5 transition-colors text-left
            ${isSelected ? 'font-bold text-blue-600' : inActivePath ? 'font-semibold text-slate-900' : 'font-medium text-slate-600 hover:text-slate-900'}
          `}
        >
          {depth === 0 && (
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-blue-600' : inActivePath ? 'bg-slate-400' : 'bg-transparent'}`} />
          )}
          {cat}
        </button>
        {hasChildren && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-1 hover:bg-slate-100 rounded-md text-slate-400 transition-colors"
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="ml-2 pl-3 border-l border-slate-100 mt-1 space-y-1">
          {children.map((child: string) => (
            <CategoryNode 
              key={child} 
              cat={child} 
              depth={depth + 1} 
              activePath={activePath} 
              selCategory={selCategory} 
              allCategories={allCategories} 
              categoryDetails={categoryDetails} 
              navigate={navigate} 
              setSelBrands={setSelBrands}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const { products: ALL_PRODUCTS, categories: ALL_CATEGORIES, categoryDetails } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { slug } = useParams();

  const matchedCategory = useMemo(() => {
    if (!slug) return null;
    return Object.values(categoryDetails || {}).find(c => c.slug === slug) || null;
  }, [slug, categoryDetails]);

  const matchedCategoryName = matchedCategory ? matchedCategory.name : '';
  const categoryQuery  = matchedCategoryName || (searchParams.get('category') ?? '');
  const searchQuery    = searchParams.get('q')          ?? '';

  const [selCategory, setSelCategory]   = useState(categoryQuery);
  const [selBrands, setSelBrands]       = useState<string[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => { setSelCategory(categoryQuery); }, [categoryQuery]);

  const categoryParam = searchParams.get('category');
  useEffect(() => {
    if (categoryParam) {
      const details = Object.values(categoryDetails || {}).find(c => c.name === categoryParam);
      const catSlug = details?.slug || generateSlug(categoryParam);
      navigate(`/category/${catSlug}`, { replace: true });
    }
  }, [categoryParam, categoryDetails, navigate]);

  // Recursively fetch all child categories for deep filtering
  const getAllDescendantCategories = useCallback((catName: string): string[] => {
    const descendants: string[] = [];
    const children = Object.values(categoryDetails || {}).filter(c => c.parentId === catName).map(c => c.name);
    descendants.push(...children);
    children.forEach(child => {
      descendants.push(...getAllDescendantCategories(child));
    });
    return descendants;
  }, [categoryDetails]);

  const availableBrands = useMemo(() => {
    let base = ALL_PRODUCTS;
    if (selCategory) {
      const allowedCategories = [selCategory, ...getAllDescendantCategories(selCategory)];
      base = base.filter(p => allowedCategories.includes(p.category));
    }
    return Array.from(new Set<string>(base.map(p => p.brand).filter(Boolean))).sort();
  }, [ALL_PRODUCTS, selCategory, getAllDescendantCategories]);

  const filteredProducts = useMemo(() => {
    let result = ALL_PRODUCTS;

    if (searchQuery) {
      const q = (searchQuery || '').toLowerCase();
      result = result.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q)
      );
    }
    
    if (selCategory) {
      const allowedCategories = [selCategory, ...getAllDescendantCategories(selCategory)];
      result = result.filter(p => allowedCategories.includes(p.category));
    }
    
    if (selBrands.length > 0) {
      result = result.filter(p => selBrands.includes(p.brand));
    }

    return result;
  }, [ALL_PRODUCTS, searchQuery, selCategory, selBrands, getAllDescendantCategories]);

  const activeFilterCount = (selCategory ? 1 : 0) + selBrands.length;

  const categorySlug = useMemo(() => {
    if (!selCategory) return '';
    const details = Object.values(categoryDetails || {}).find(c => c.name === selCategory);
    return details?.slug || generateSlug(selCategory);
  }, [selCategory, categoryDetails]);

  const resolvedCanonical = useMemo(() => {
    if (slug) return `https://www.alzaydaninternational.com/category/${categorySlug}`;
    return `https://www.alzaydaninternational.com/search`;
  }, [slug, categorySlug]);

  const categorySchemaArray = useMemo(() => {
    if (!filteredProducts || filteredProducts.length === 0) return undefined;
    const pageName = searchQuery ? `Search results for ${searchQuery}` : selCategory ? selCategory : 'All Products';
    const url = slug ? `/category/${categorySlug}` : '/search';
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: pageName, url },
    ];
    return [
      generateOrganizationSchema(),
      generateBreadcrumbSchema(breadcrumbs),
      generateItemListSchema(pageName, filteredProducts, url),
    ];
  }, [filteredProducts, searchQuery, selCategory, slug, categorySlug]);

  const seoData = useMemo(() => {
    if (searchQuery) {
      const title = `"${searchQuery}" | Al Zaydan International — UAE Industrial`;
      const description = `Search results for "${searchQuery}" at Al Zaydan International.`;
      return generateCategorySEO(title, 'search', { seoTitle: title, metaDescription: description });
    }
    if (selCategory) {
      return generateCategorySEO(selCategory, categorySlug || generateSlug(selCategory), matchedCategory);
    }
    return generateCategorySEO('All Products', 'search', {
      seoTitle: 'Browse All Products | Al Zaydan International UAE',
      metaDescription: 'Browse Al Zaydan\'s full product catalogue — traffic safety equipment, reflective sheeting, road marking materials, packaging supplies and more.'
    });
  }, [searchQuery, selCategory, categorySlug, matchedCategory]);

  useSEO({
    title: seoData.title,
    description: seoData.description,
    canonical: resolvedCanonical,
    ogTitle: seoData.ogTitle,
    ogDescription: seoData.ogDescription,
    ogImage: seoData.ogImage,
    twitterTitle: seoData.twitterTitle,
    twitterDescription: seoData.twitterDescription,
    twitterImage: seoData.twitterImage,
    noIndex: seoData.noIndex,
    noFollow: seoData.noFollow,
    schema: categorySchemaArray,
  });

  const clearAll = useCallback(() => {
    setSelCategory('');
    setSelBrands([]);
    navigate('/search' + (searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''));
  }, [searchQuery, navigate]);

  const toggleBrand = (brand: string) => setSelBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  // Compute active path for auto-expanding accordion
  const activePath = useMemo(() => {
    const path = new Set<string>();
    let current = selCategory;
    while (current) {
      path.add(current);
      current = categoryDetails?.[current]?.parentId || '';
    }
    return path;
  }, [selCategory, categoryDetails]);

  // ── Dropdown Control ────────────────────────────────────────────────────────
  const [activeDropdown, setActiveDropdown] = useState<'category' | 'brand' | null>(null);
  const categoryRef = React.useRef<HTMLDivElement>(null);
  const brandRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        (categoryRef.current && !categoryRef.current.contains(target)) &&
        (brandRef.current && !brandRef.current.contains(target))
      ) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Sidebar (Mobile Only) ───────────────────────────────────────────────────
  const Sidebar = () => {
    const topLevelCategories = ALL_CATEGORIES.filter(c => !(categoryDetails?.[c]?.parentId));
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span className="font-extrabold text-slate-900 text-[15px]">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-500 font-bold transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Clear All
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-0 pr-1 pb-20 md:pb-0 custom-scrollbar">

          <FilterSection title="Category" count={selCategory ? 1 : 0}>
            <div className="space-y-1 pb-2">
              <button
                onClick={() => {
                  setSelBrands([]);
                  navigate('/search' + (searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''));
                }}
                className={`w-full flex items-center gap-2 text-[13.5px] py-1.5 transition-colors text-left
                  ${!selCategory ? 'font-bold text-blue-600' : 'font-medium text-slate-600 hover:text-slate-900'}
                `}
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${!selCategory ? 'bg-blue-600' : 'bg-transparent'}`} />
                All Categories
              </button>

              {topLevelCategories.map(cat => (
                <CategoryNode 
                  key={cat} 
                  cat={cat} 
                  depth={0} 
                  activePath={activePath} 
                  selCategory={selCategory} 
                  allCategories={ALL_CATEGORIES} 
                  categoryDetails={categoryDetails} 
                  navigate={navigate} 
                  setSelBrands={setSelBrands}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          </FilterSection>

          {availableBrands.length > 0 && (
            <FilterSection title="Brand" count={selBrands.length}>
              <ul className="space-y-1.5">
                {availableBrands.map(brand => (
                  <li key={brand}>
                    <button
                      onClick={() => toggleBrand(brand)}
                      className="w-full flex items-center gap-2.5 text-[13px] text-slate-700 hover:text-slate-900 transition-colors py-1"
                    >
                      <div className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-all ${
                        selBrands.includes(brand)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {selBrands.includes(brand) && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className={selBrands.includes(brand) ? 'font-bold text-slate-900' : 'font-medium'}>
                        {brand}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </FilterSection>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0 z-10 md:hidden">
          <button
            onClick={() => setIsMobileOpen(false)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-xl transition-colors shadow-md"
          >
            Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`} Results
          </button>
        </div>
      </div>
    );
  };

  const ActivePills = () => (
    activeFilterCount > 0 ? (
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100/60">
        {selCategory && (
          <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
            Category: {selCategory}
            <button onClick={() => navigate('/search' + (searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''))} className="text-slate-400 hover:text-red-500 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}
        {selBrands.map(b => (
          <span key={b} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
            Brand: {b}
            <button onClick={() => toggleBrand(b)} className="text-slate-400 hover:text-red-500 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
    ) : null
  );

  const pageLabel = selCategory || searchQuery || 'All Products';
  const topLevelCategories = ALL_CATEGORIES.filter(c => !(categoryDetails?.[c]?.parentId));

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-200px)]">

      {/* Header / Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 shadow-sm">
        <div className="w-full">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center text-[13px] text-slate-500 font-medium">
                <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
                <span className="mx-2 text-slate-300">/</span>
                <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-sm">{pageLabel}</span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden flex items-center gap-1.5 border border-slate-300 rounded-lg px-3 py-2 text-[13px] font-bold text-slate-800 bg-white shadow-sm hover:bg-slate-50 transition-colors shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="font-extrabold text-[13px]">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Dropdowns bar (Desktop only) */}
      <div className="hidden md:block bg-white border-b border-slate-200 py-2.5 px-4 sticky top-[108px] z-20 shadow-sm">
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              
              {/* Category Dropdown */}
              <div className="relative" ref={categoryRef}>
                <button
                  onClick={() => setActiveDropdown(curr => curr === 'category' ? null : 'category')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-xs font-semibold transition-all bg-white hover:bg-slate-50 ${
                    selCategory
                      ? 'border-slate-800 text-slate-900 font-bold'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span>Category: {selCategory || 'All'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'category' && (
                  <div className="absolute left-0 mt-1.5 w-[300px] max-h-[350px] overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl z-30 p-3 animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar">
                    <div className="space-y-1 pb-1">
                      <button
                        onClick={() => {
                          setSelBrands([]);
                          setActiveDropdown(null);
                          navigate('/search' + (searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''));
                        }}
                        className={`w-full flex items-center gap-2 text-[12px] py-1 transition-colors text-left
                          ${!selCategory ? 'font-bold text-blue-600' : 'font-medium text-slate-600 hover:text-slate-900'}
                        `}
                      >
                        <div className={`w-1 h-1 rounded-full transition-colors ${!selCategory ? 'bg-blue-600' : 'bg-transparent'}`} />
                        All Categories
                      </button>

                      {topLevelCategories.map(cat => (
                        <CategoryNode 
                          key={cat} 
                          cat={cat} 
                          depth={0} 
                          activePath={activePath} 
                          selCategory={selCategory} 
                          allCategories={ALL_CATEGORIES} 
                          categoryDetails={categoryDetails} 
                          navigate={(path: string) => {
                            setActiveDropdown(null);
                            navigate(path);
                          }}
                          setSelBrands={setSelBrands}
                          searchQuery={searchQuery}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Brand Dropdown */}
              {availableBrands.length > 0 && (
                <div className="relative" ref={brandRef}>
                  <button
                    onClick={() => setActiveDropdown(curr => curr === 'brand' ? null : 'brand')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-xs font-semibold transition-all bg-white hover:bg-slate-50 ${
                      selBrands.length > 0
                        ? 'border-slate-800 text-slate-900 font-bold'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span>Brand {selBrands.length > 0 ? `(${selBrands.length})` : ': All'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeDropdown === 'brand' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeDropdown === 'brand' && (
                    <div className="absolute left-0 mt-1.5 w-[240px] max-h-[250px] overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl z-30 p-3 animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar">
                      <ul className="space-y-1.5">
                        {availableBrands.map(brand => (
                          <li key={brand}>
                            <button
                              onClick={() => toggleBrand(brand)}
                              className="w-full flex items-center gap-2 text-[12px] text-slate-700 hover:text-slate-900 transition-colors py-0.5"
                            >
                              <div className={`w-3.5 h-3.5 shrink-0 rounded border flex items-center justify-center transition-all ${
                                selBrands.includes(brand)
                                  ? 'bg-slate-900 border-slate-900'
                                  : 'border-slate-300 bg-white'
                              }`}>
                                {selBrands.includes(brand) && <Check className="w-2 h-2 text-white" />}
                              </div>
                              <span className={selBrands.includes(brand) ? 'font-bold text-slate-900' : 'font-medium'}>
                                {brand}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Clear All Link */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-500 font-bold transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Clear Filters
              </button>
            )}
          </div>

          <ActivePills />
        </div>
      </div>

      <div className="w-full px-4 py-5 flex gap-6 items-start">

        {/* Mobile Filter Backdrop */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Mobile Filter Drawer */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          md:hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between p-5 pb-0">
            <span className="font-extrabold text-slate-900 text-lg">Filters</span>
            <button onClick={() => setIsMobileOpen(false)} className="p-2 -mr-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 flex-1 overflow-hidden">
            <Sidebar />
          </div>
        </div>

        {/* CSS for custom scrolls */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
          .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
        `}</style>

        {/* Product Grid Area */}
        <div className="flex-1 min-w-0">
          <div className="md:hidden mb-4">
            <ActivePills />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-xl">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Filter className="w-6 h-6 text-slate-300" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">No products found</h2>
              <p className="text-slate-400 text-sm mb-5">
                Try adjusting your filters or browsing a different category.
              </p>
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" /> Clear All Filters
              </button>
            </div>
          ) : (
            <ProductListingGrid customProducts={filteredProducts} columns={6} />
          )}
        </div>
      </div>
    </div>
  );
}

