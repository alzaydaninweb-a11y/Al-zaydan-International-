import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star, ShoppingCart, Check, List } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../context/StoreContext';
import { generateSlug } from '../../lib/blogService';

/* ── Sliding image card ──────────────────────────────────────────────────── */
function RecommendedCard({
  product,
  isAdded,
  onAddToCart,
}: {
  product: Product;
  isAdded: boolean;
  onAddToCart: (e: React.MouseEvent, product: Product) => void;
}) {
  const allImages: string[] = [product.image];
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach(img => {
      if (img && img !== product.image) allImages.push(img);
    });
  }
  const hasMultiple = allImages.length > 1;

  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hasMultiple || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % allImages.length);
    }, 2500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [hasMultiple, paused, allImages.length]);

  // Button label logic
  const isNoPriceProduct = product.priceType === 'hidden' || product.price === 0;
  const buttonLabel = isAdded
    ? <><Check className="w-3.5 h-3.5 stroke-[3]" /> Added</>
    : isNoPriceProduct
      ? <><List className="w-3.5 h-3.5" /> Add to List</>
      : <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>;

  return (
    <Link
      to={`/product/${product.slug || generateSlug(product.name)}`}
      className="min-w-[260px] w-full lg:min-w-0 bg-white rounded-3xl flex flex-col snap-start cursor-pointer relative group p-2 hover:shadow-lg transition-all border border-gray-200 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Image */}
      <div className="bg-slate-50 rounded-2xl w-full h-[180px] relative shrink-0 overflow-hidden">
        {hasMultiple ? (
          <>
            {allImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={product.name}
                loading="lazy"
                className={`absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-opacity duration-700 ease-in-out ${
                  idx === activeIdx ? 'opacity-100' : 'opacity-0'
                }`}
                onError={e => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/400x400/f1f5f9/94a3b8?text=${encodeURIComponent(product.name.split(' ')[0])}`;
                }}
              />
            ))}
            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {allImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`block rounded-full transition-all duration-300 ${
                    idx === activeIdx ? 'w-3 h-1.5 bg-slate-700 shadow' : 'w-1.5 h-1.5 bg-slate-400/60'
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            onError={e => {
              (e.target as HTMLImageElement).src = `https://placehold.co/400x400/f1f5f9/94a3b8?text=${encodeURIComponent(product.name.split(' ')[0])}`;
            }}
          />
        )}

        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-20">
            Save {product.discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col px-3 pt-4 pb-2 flex-grow">
        <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-tight mb-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-amber-400">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-3.5 h-3.5 fill-current ${s <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}`} />
            ))}
          </div>
          <span className="text-[12px] text-gray-500 font-medium ml-1">({product.reviews})</span>
        </div>

        <p className="text-[12px] text-slate-600 mb-4 line-clamp-2 leading-snug">
          Professional-grade industrial {product.category?.toLowerCase()} perfect for safe and secure environments.
        </p>

        <div className="mt-auto pt-2">
          <button
            onClick={e => onAddToCart(e, product)}
            className={`w-full font-bold py-3 rounded-full text-[13px] tracking-wide transition-all border flex items-center justify-center gap-1.5 ${
              isAdded
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-md'
                : 'bg-transparent text-slate-900 border-gray-300 group-hover:bg-slate-50'
            }`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ── Section wrapper ─────────────────────────────────────────────────────── */
export default function RecommendedProducts() {
  const { products } = useStore();
  const recommended = products.slice(4, 9);
  const { addToCart } = useCart();
  const [addedQueue, setAddedQueue] = useState<string[]>([]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedQueue(prev => [...prev, product.id]);
    setTimeout(() => {
      setAddedQueue(prev => prev.filter(id => id !== product.id));
    }, 1500);
  };

  return (
    <section className="py-16 bg-slate-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Recommended For You</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xl">Items based on your recent activity.</p>
          </div>
          <Link to="/search" className="text-blue-600 hover:text-blue-700 text-[13px] font-bold flex items-center transition-colors">
            View History <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="flex overflow-x-auto pb-4 lg:grid lg:grid-cols-5 snap-x snap-mandatory no-scrollbar gap-4">
          {recommended.map(product => (
            <RecommendedCard
              key={product.id}
              product={product}
              isAdded={addedQueue.includes(product.id)}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
