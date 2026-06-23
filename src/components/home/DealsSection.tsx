import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TrendingUp, ArrowRight, Star, ShoppingCart, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../context/StoreContext';
import { generateSlug } from '../../lib/blogService';

// ── Auto-slide config ─────────────────────────────────────────────────────────
const SLIDE_EVERY       = 2500;  // ms between auto-slides
const PAUSE_AFTER_TOUCH = 4000;  // ms to pause after user touches

export default function DealsSection() {
  const { products } = useStore();
  const deals = products.filter(p => p.topSelling);
  const { addToCart } = useCart();

  // ── ALL hooks must be declared before any conditional return ──────────────
  const [addedQueue, setAddedQueue] = useState<string[]>([]);
  const scrollRef   = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseRef    = useRef(false);
  const indexRef    = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);

  // Hide section if no products are marked topSelling (after hooks)
  const isEmpty = deals.length === 0;

  const getCardWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !el.children[0]) return 0;
    const child = el.children[0] as HTMLElement;
    const gap = 12; // gap-3
    return child.offsetWidth + gap;
  }, []);

  const slideTo = useCallback((idx: number, behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    const w = getCardWidth();
    el.scrollTo({ left: idx * w, behavior });
    indexRef.current = idx;
    setActiveIdx(idx);
  }, [getCardWidth]);

  const slide = useCallback(() => {
    if (pauseRef.current || deals.length === 0) return;
    const next = (indexRef.current + 1) % deals.length;
    if (next === 0) {
      slideTo(0, 'instant');
    } else {
      slideTo(next);
    }
  }, [deals.length, slideTo]);

  useEffect(() => {
    intervalRef.current = setInterval(slide, SLIDE_EVERY);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [slide, deals.length]);

  const handleUserInteraction = useCallback(() => {
    pauseRef.current = true;
    setTimeout(() => { pauseRef.current = false; }, PAUSE_AFTER_TOUCH);
    // re-sync index from scroll position
    const el = scrollRef.current;
    if (el) {
      const w = getCardWidth();
      const idx = Math.round(el.scrollLeft / (w || 1));
      indexRef.current = idx;
      setActiveIdx(idx);
    }
  }, [getCardWidth]);

  // ── Add to Cart ────────────────────────────────────────────────────────────
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedQueue(prev => [...prev, product.id]);
    setTimeout(() => {
      setAddedQueue(prev => prev.filter(id => id !== product.id));
    }, 1500);
  };

  // All hooks done — safe to early-return now
  if (isEmpty) return null;

  return (
    <section className="py-12 md:py-16 bg-slate-900 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="w-9 h-9 md:w-10 md:h-10 bg-blue-600 rounded flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </span>
            Best Selling Products
          </h2>
          <Link
            to="/search"
            className="text-blue-400 hover:text-blue-300 text-xs md:text-sm font-bold flex items-center gap-1 shrink-0 ml-4 transition-colors"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ── MOBILE: auto-sliding carousel ─────────────────────────────────── */}
        <div className="lg:hidden">
          <div className="relative">

            <div
              ref={scrollRef}
              onTouchStart={handleUserInteraction}
              onMouseDown={handleUserInteraction}
              onScroll={handleUserInteraction}
              className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {deals.map((product) => {
                const isAdded = addedQueue.includes(product.id);
                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.slug || generateSlug(product.name)}`}
                    className="snap-start shrink-0 bg-white rounded-2xl flex flex-col overflow-hidden group active:scale-[0.98] transition-transform"
                    style={{ width: 'calc(50vw - 20px)', minWidth: '155px', maxWidth: '200px' }}
                  >
                    {/* Image */}
                    <div className="w-full bg-slate-100 overflow-hidden" style={{ height: '140px' }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://placehold.co/400x300/f1f5f9/94a3b8?text=${encodeURIComponent(product.name.split(' ')[0])}`;
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-grow p-3">
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-1.5">
                        <div className="flex text-amber-400">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-3 h-3 ${i <= Math.round(product.rating) ? 'fill-current' : 'text-slate-200 fill-current'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">({product.reviews})</span>
                      </div>

                      {/* Name */}
                      <h3 className="text-[12px] font-bold text-slate-900 line-clamp-2 leading-tight mb-2 flex-grow">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5 mb-2.5">
                        <span className="text-[15px] font-extrabold text-slate-900">AED {product.price.toFixed(0)}</span>
                        {product.mrp > product.price && (
                          <span className="text-[10px] text-slate-400 line-through">AED {product.mrp.toFixed(0)}</span>
                        )}
                      </div>

                      {/* Add to Cart */}
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all ${
                          isAdded
                            ? 'bg-emerald-500 text-white'
                            : 'bg-blue-600 text-white active:bg-blue-700'
                        }`}
                      >
                        {isAdded
                          ? <><Check className="w-3.5 h-3.5" /> Added</>
                          : <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
                        }
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-4">
            {deals.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { slideTo(idx); pauseRef.current = true; setTimeout(() => { pauseRef.current = false; }, PAUSE_AFTER_TOUCH); }}
                aria-label={`Go to product ${idx + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  activeIdx === idx ? 'w-4 h-1.5 bg-blue-400' : 'w-1.5 h-1.5 bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── DESKTOP: 5-column grid ─────────────────────────────────────────── */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-4">
          {deals.map((product) => {
            const isAdded = addedQueue.includes(product.id);
            return (
              <Link
                to={`/product/${product.slug || generateSlug(product.name)}`}
                key={product.id}
                className="bg-white rounded-3xl flex flex-col cursor-pointer relative group p-2 hover:shadow-xl transition-all border border-transparent hover:border-blue-400 overflow-hidden"
              >
                {/* Image */}
                <div className="bg-slate-50 rounded-2xl w-full h-[180px] flex items-center justify-center relative overflow-hidden shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/400x300/f1f5f9/94a3b8?text=${encodeURIComponent(product.name.split(' ')[0])}`;
                    }}
                  />
                </div>

                <div className="flex flex-col px-3 pt-4 pb-2 flex-grow">
                  <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-tight mb-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex text-amber-400">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(product.rating) ? 'fill-current' : 'text-gray-200 fill-current'}`} />
                      ))}
                    </div>
                    <span className="text-[12px] text-gray-500 font-medium ml-1">({product.reviews})</span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-lg font-extrabold text-slate-900">AED {product.price.toFixed(0)}</span>
                    {product.mrp > product.price && (
                      <span className="text-xs text-slate-400 line-through">AED {product.mrp.toFixed(0)}</span>
                    )}
                  </div>

                  <div className="mt-auto">
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className={`w-full font-bold py-3 rounded-full text-[13px] tracking-wide transition-all border ${
                        isAdded
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-md'
                          : 'bg-transparent text-slate-900 border-gray-300 group-hover:bg-slate-50'
                      }`}
                    >
                      {isAdded ? 'Item Added ✓' : `Add to Cart · AED ${product.price.toFixed(0)}`}
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
