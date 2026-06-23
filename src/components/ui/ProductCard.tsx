import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageCircle, FileText, ShoppingCart, Star, Package, Zap,
  BadgeCheck, Globe, Clock, Truck, Bookmark, BookmarkCheck,
  ChevronRight, Phone
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { generateSlug } from '../../lib/blogService';

/* ─── Type (unchanged — no schema change) ──────────────────────────────────── */
export interface MarketplaceProduct {
  id: string;
  name: string;
  brand?: string;
  price: number;
  mrp?: number;
  discount?: number;
  moq?: string;
  rating?: number;
  reviews?: number;
  image: string;
  category?: string;
  inStock?: boolean;
  badge?: string | null;
  trustBadges?: string[];
  leadTime?: string;
  shippingRegion?: string;
  specs?: string[];
  priceType?: 'fixed' | 'range' | 'hidden';
  priceMin?: number;
  priceMax?: number;
}

interface Props {
  product: MarketplaceProduct;
  compact?: boolean;
}

/* ─── Static badge colors (preserved) ──────────────────────────────────────── */
const BADGE_COLORS: Record<string, string> = {
  'Bestseller':   'bg-red-500 text-white',
  'Bulk Deal':    'bg-blue-600 text-white',
  'Top Rated':    'bg-amber-500 text-white',
  'New':          'bg-emerald-500 text-white',
  'Hot':          'bg-orange-500 text-white',
  'Popular':      'bg-purple-600 text-white',
  'Premium':      'bg-slate-800 text-white',
  'Certified':    'bg-teal-600 text-white',
  'Hot Deal':     'bg-red-600 text-white',
  'Heavy Duty':   'bg-slate-700 text-white',
};

const TRUST_COLORS: Record<string, string> = {
  'Verified Supplier': 'text-blue-700 bg-blue-50 border-blue-100',
  'ISO Certified':     'text-teal-700  bg-teal-50  border-teal-100',
  'Export Ready':      'text-violet-700 bg-violet-50 border-violet-100',
  'Fast Dispatch':     'text-green-700 bg-green-50 border-green-100',
  'GCC Supply':        'text-amber-700 bg-amber-50 border-amber-100',
};

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function ProductCard({ product, compact = false }: Props) {
  const { addToCart } = useCart();
  const { settings } = useStore();
  const navigate = useNavigate();

  const [added,   setAdded]   = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [imgError, setImgError] = useState(false);

  const moqDisplay = product.moq;
  const leadTimeDisplay = product.leadTime;
  const regionDisplay = product.shippingRegion;
  const trustBadgesDisplay = product.trustBadges || [];

  /* WhatsApp */
  const defaultNumber = settings?.orderWhatsAppNumber
    || settings?.phoneNumber?.replace(/\D/g, '')
    || '';
  const waNumber = settings?.whatsappRouting?.product || defaultNumber;
  const waMsg = encodeURIComponent(
    `Hi, I'm interested in: ${product.name}. Please send me pricing & MOQ details.`
  );
  const waUrl = waNumber ? `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${waMsg}` : '#';

  /* Cart */
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id, name: product.name, brand: product.brand ?? '',
      price: product.price, mrp: product.mrp ?? product.price,
      discount: product.discount ?? 0, rating: product.rating ?? 0,
      reviews: product.reviews ?? 0, image: product.image,
      category: product.category ?? '', inStock: product.inStock ?? true,
    } as any, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  /* RFQ nav */
  const handleRFQ = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/rfq?product=${encodeURIComponent(product.name)}`);
  };

  /* Save */
  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(s => !s);
  };

  /* Price renderer (preserved) */
  const renderPrice = () => {
    if (product.priceType === 'hidden')
      return <span className="text-[12px] font-bold text-blue-700">Contact for Price</span>;
    if (product.priceType === 'range' && product.priceMin != null && product.priceMax != null)
      return (
        <span className="text-[14px] font-extrabold text-slate-900">
          AED {product.priceMin.toFixed(2)}–{product.priceMax.toFixed(2)}
        </span>
      );
    return (
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="text-[15px] font-extrabold text-slate-900">
          AED {product.price.toFixed(2)}
        </span>
        {(product.mrp ?? 0) > product.price && (
          <span className="text-[11px] text-slate-400 line-through">AED {product.mrp!.toFixed(2)}</span>
        )}
        {(product.discount ?? 0) > 0 && (
          <span className="text-[10px] font-bold text-emerald-600">−{product.discount}%</span>
        )}
      </div>
    );
  };

  const fallbackImg = `https://picsum.photos/seed/${product.id}extra/400/400`;

  return (
    <Link
      to={`/product/${(product as any).slug || generateSlug(product.name)}`}
      className="group flex flex-col h-full bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg rounded-xl overflow-hidden transition-all duration-200"
    >
      {/* ── Image ── */}
      <div className={`relative overflow-hidden bg-slate-50 ${compact ? 'h-[140px]' : 'h-[160px] md:h-[178px]'}`}>
        <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1">
          {product.badge && (
            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full tracking-wide ${BADGE_COLORS[product.badge] || 'bg-slate-600 text-white'}`}>
              {product.badge}
            </span>
          )}
          {(product.discount ?? 0) > 0 && (
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
              −{product.discount}%
            </span>
          )}
        </div>



        {/* Out of stock overlay */}
        {product.inStock === false && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-full">Out of Stock</span>
          </div>
        )}

        <img
          src={imgError ? fallbackImg : product.image}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
        />
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-2.5 gap-1.5">

        {/* Brand */}
        {product.brand && (
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">{product.brand}</p>
        )}

        {/* Name */}
        <p className={`font-semibold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2 ${compact ? 'text-[12px]' : 'text-[13px]'}`}>
          {product.name}
        </p>

        {/* Specs pills */}
        {product.specs && product.specs.length > 0 && !compact && (
          <div className="flex flex-wrap gap-1">
            {product.specs.slice(0, 2).map(s => (
              <span key={s} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{s}</span>
            ))}
          </div>
        )}

        {/* Rating */}
        {product.rating != null && product.reviews != null && product.reviews > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-2.5 h-2.5 ${i < Math.round(product.rating!) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
              ))}
            </div>
            <span className="text-[10px] text-slate-500">({product.reviews.toLocaleString()})</span>
          </div>
        )}

        {/* ── Procurement Metadata Row ── */}
        {!compact && (moqDisplay || leadTimeDisplay || regionDisplay) && (
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1 border-t border-slate-100">
            {moqDisplay && (
              <div className="flex items-center gap-1">
                <Package className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                <span className="text-[10px] text-slate-600 font-medium truncate">MOQ: {moqDisplay}</span>
              </div>
            )}
            {leadTimeDisplay && (
              <div className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                <span className="text-[10px] text-slate-600 font-medium truncate">{leadTimeDisplay}</span>
              </div>
            )}
            {regionDisplay && (
              <div className="flex items-center gap-1 col-span-2">
                <Globe className="w-2.5 h-2.5 text-green-600 shrink-0" />
                <span className="text-[10px] text-slate-600 font-medium truncate">{regionDisplay}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Trust Badges ── */}
        {!compact && trustBadgesDisplay.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {trustBadgesDisplay.slice(0, 2).map(badge => (
              <span
                key={badge}
                className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${TRUST_COLORS[badge] || 'text-gray-600 bg-gray-50 border-gray-100'}`}
              >
                <BadgeCheck className="w-2.5 h-2.5 shrink-0" />
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* ── Price ── */}
        <div className="mt-auto pt-1.5 border-t border-slate-100">
          {renderPrice()}
          {product.priceType !== 'hidden' && (
            <p className="text-[10px] text-slate-400 mt-0.5">Per unit · Bulk pricing available</p>
          )}
        </div>

        {/* ── CTA Row ── */}
        <div className="flex gap-1.5 mt-1" onClick={e => e.preventDefault()}>

          {/* Primary: Add to Cart */}
          <button
            onClick={handleAdd}
            disabled={product.inStock === false}
            className={`flex-1 flex items-center justify-center gap-1 h-7 rounded-lg text-[11px] font-bold transition-all ${
              added
                ? 'bg-green-600 text-white'
                : product.inStock === false
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#0052d9] hover:bg-blue-700 text-white'
            }`}
          >
            {added ? (
              <><Zap className="w-3 h-3" /> Added!</>
            ) : (
              <><ShoppingCart className="w-3 h-3" /> {compact ? 'Add' : 'Add to Cart'}</>
            )}
          </button>

        </div>

        {/* ── Hover-reveal: Bulk inquiry link ── */}
        <div className="overflow-hidden max-h-0 group-hover:max-h-8 transition-all duration-200">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center justify-center gap-1 w-full py-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Truck className="w-2.5 h-2.5" />
            Bulk Order Inquiry
            <ChevronRight className="w-2.5 h-2.5" />
          </a>
        </div>

      </div>
    </Link>
  );
}
