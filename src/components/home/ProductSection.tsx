import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, SlidersHorizontal, X } from 'lucide-react';
import ProductCard, { MarketplaceProduct } from '../ui/ProductCard';
import { useStore } from '../../context/StoreContext';
import { FILTER_OPTIONS } from '../../data/catalogData';

interface Props {
  title: string;
  sectionId?: string;
  tag?: 'featured' | 'topSelling' | 'all' | 'new';
  maxProducts?: number;
  showFilters?: boolean;
}

export default function ProductSection({ title, sectionId, tag = 'all', maxProducts = 20, showFilters = true }: Props) {
  const { products: liveProducts, categories: liveCategories } = useStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [filters, setFilters] = useState({
    moq: '',
    priceRange: '',
    certification: '',
    stockStatus: '',
  });

  // Dynamic category pills list from database categories (hiding empty categories)
  const pills = useMemo(() => {
    const activeCategories = liveCategories.filter(cat =>
      liveProducts.some(p => p.category === cat)
    );
    return ['All', ...activeCategories];
  }, [liveCategories, liveProducts]);

  // Reset activeCategory if it's no longer present in database categories
  useEffect(() => {
    if (activeCategory !== 'All' && !liveCategories.includes(activeCategory)) {
      setActiveCategory('All');
    }
  }, [liveCategories, activeCategory]);

  // Auto-shifting category effect: runs every 5 seconds, pauses when user hovers
  useEffect(() => {
    if (isHovered || pills.length <= 1) return;

    const interval = setInterval(() => {
      setActiveCategory(prev => {
        const index = pills.indexOf(prev);
        const nextIndex = (index + 1) % pills.length;
        return pills[nextIndex];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered, pills]);

  // Convert live Firestore products with proper typings (Do not merge mock data)
  const allProducts: MarketplaceProduct[] = useMemo(() => {
    return liveProducts.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      mrp: p.mrp,
      discount: p.discount,
      moq: undefined as string | undefined,
      rating: p.rating,
      reviews: p.reviews,
      image: p.image,
      category: p.category,
      inStock: p.inStock,
      badge: p.featured ? 'Bestseller' : p.topSelling ? 'Hot' : null,
      specs: p.specifications?.slice(0, 3).map(s => s.value),
      priceType: p.priceType,
      priceMin: p.priceMin,
      priceMax: p.priceMax,
    }));
  }, [liveProducts]);

  // Filter by tag ('featured' strictly shows admin featured products; 'all' shows everything)
  const tagFiltered = useMemo(() => {
    if (tag === 'featured') {
      return allProducts.filter(p => p.badge === 'Bestseller');
    }
    if (tag === 'topSelling') {
      return allProducts.filter(p => p.badge === 'Hot');
    }
    return allProducts;
  }, [allProducts, tag]);

  // Filter by category pill
  const categoryFiltered = useMemo(() => {
    if (activeCategory === 'All') return tagFiltered;
    return tagFiltered.filter(p => p.category === activeCategory);
  }, [tagFiltered, activeCategory]);

  // Apply sidebar filters
  const displayed = useMemo(() => {
    let result = categoryFiltered;
    if (filters.stockStatus === 'In Stock') result = result.filter(p => p.inStock);
    if (filters.stockStatus === 'Out of Stock') result = result.filter(p => !p.inStock);
    return result.slice(0, maxProducts);
  }, [categoryFiltered, filters, maxProducts]);

  const toggleFilter = (key: keyof typeof filters, val: string) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === val ? '' : val }));
  };

  return (
    <section 
      id={sectionId} 
      className="bg-white border-b border-slate-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div className="max-w-screen-2xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-extrabold text-slate-900">{title}</h2>
          <div className="flex items-center gap-3">
            {showFilters && (
              <button
                onClick={() => setShowFilterPanel(v => !v)}
                className={`hidden md:flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[12px] font-semibold transition-colors ${showFilterPanel ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-400'}`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>
            )}
            <Link to="/search"
              className="flex items-center gap-1 text-[12px] text-blue-600 font-semibold hover:text-blue-800 transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
          {pills.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setIsHovered(true); // temporary pause shifting when user manually interacts
              }}
              className={`shrink-0 h-7 px-3 rounded-full text-[11px] font-bold border transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          {/* Filter sidebar */}
          {showFilters && showFilterPanel && (
            <div className="hidden md:block w-[200px] shrink-0">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border-b border-slate-200">
                  <span className="text-[12px] font-bold text-slate-900">Filters</span>
                  <button onClick={() => setShowFilterPanel(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Stock Status */}
                <div className="p-3 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Stock Status</p>
                  {FILTER_OPTIONS.stockStatus.map(opt => (
                    <label key={opt} className="flex items-center gap-2 py-1 cursor-pointer group">
                      <input type="checkbox" checked={filters.stockStatus === opt}
                        onChange={() => toggleFilter('stockStatus', opt)}
                        className="rounded accent-blue-600" />
                      <span className="text-[12px] text-slate-700 group-hover:text-blue-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {/* Certification */}
                <div className="p-3 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Certification</p>
                  {FILTER_OPTIONS.certification.map(opt => (
                    <label key={opt} className="flex items-center gap-2 py-1 cursor-pointer group">
                      <input type="checkbox" checked={filters.certification === opt}
                        onChange={() => toggleFilter('certification', opt)}
                        className="rounded accent-blue-600" />
                      <span className="text-[12px] text-slate-700 group-hover:text-blue-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {/* MOQ */}
                <div className="p-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Min. Order Qty</p>
                  {FILTER_OPTIONS.moq.map(opt => (
                    <label key={opt} className="flex items-center gap-2 py-1 cursor-pointer group">
                      <input type="checkbox" checked={filters.moq === opt}
                        onChange={() => toggleFilter('moq', opt)}
                        className="rounded accent-blue-600" />
                      <span className="text-[12px] text-slate-700 group-hover:text-blue-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-slate-400 text-sm font-medium">No products found in this category.</p>
                <button onClick={() => setActiveCategory('All')} className="mt-2 text-blue-600 text-[13px] font-bold hover:underline">
                  Show all products
                </button>
              </div>
            ) : (
              <div className={`grid gap-3 ${
                showFilters && showFilterPanel
                  ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
              }`}>
                {displayed.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
