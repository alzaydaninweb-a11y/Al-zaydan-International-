import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Flame, BarChart2, ArrowRight,
  ChevronLeft, ChevronRight, Globe, Package,
  Zap, Star, Tag
} from 'lucide-react';

/* ─── Static procurement data ───────────────────────────────────────────────── */
interface TrendingProduct {
  id: string;
  name: string;
  category: string;
  badge: string;
  badgeColor: string;
  demandBar: number; // 0–100
  query: string;
  imageUrl: string;
}

interface PopularSearch {
  id: string;
  label: string;
  badge: string;
  badgeColor: string;
  count: string;
  icon: typeof Flame;
  query: string;
}

interface GrowingCategory {
  id: string;
  name: string;
  badge: string;
  trend: string;
  icon: string;          // emoji
  query: string;
  color: string;         // Tailwind bg
  textColor: string;
}

const TRENDING_PRODUCTS: TrendingProduct[] = [
  {
    id: 'tp1', name: 'Reflective Road Tape', category: 'Traffic Safety',
    badge: 'Most Requested', badgeColor: 'bg-red-500',
    demandBar: 92,
    query: 'Reflective Road Tape',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop&q=70&fm=webp',
  },
  {
    id: 'tp2', name: 'Industrial Adhesive', category: 'Adhesives & Sealants',
    badge: 'High Demand', badgeColor: 'bg-orange-500',
    demandBar: 86,
    query: 'Industrial Adhesive',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&h=120&fit=crop&q=70&fm=webp',
  },
  {
    id: 'tp3', name: 'Barcode Ribbon', category: 'Printing Supplies',
    badge: 'Bulk Trending', badgeColor: 'bg-blue-600',
    demandBar: 81,
    query: 'Barcode Ribbon',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=120&h=120&fit=crop&q=70&fm=webp',
  },
  {
    id: 'tp4', name: 'Safety Labels', category: 'Industrial Labels',
    badge: 'Popular in GCC', badgeColor: 'bg-emerald-600',
    demandBar: 78,
    query: 'Safety Labels',
    imageUrl: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=120&h=120&fit=crop&q=70&fm=webp',
  },
  {
    id: 'tp5', name: 'Solar Warning Lights', category: 'Solar Equipment',
    badge: 'Export Ready', badgeColor: 'bg-amber-500',
    demandBar: 74,
    query: 'Solar Warning Lights',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=120&h=120&fit=crop&q=70&fm=webp',
  },
  {
    id: 'tp6', name: 'Thermal Transfer Ribbon', category: 'Printing Supplies',
    badge: 'Bulk Trending', badgeColor: 'bg-blue-600',
    demandBar: 70,
    query: 'Thermal Transfer Ribbon',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=120&h=120&fit=crop&q=70&fm=webp',
  },
  {
    id: 'tp7', name: 'PVC Adhesive Tape', category: 'Adhesive Tapes',
    badge: 'High Demand', badgeColor: 'bg-orange-500',
    demandBar: 67,
    query: 'PVC Adhesive Tape',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=120&h=120&fit=crop&q=70&fm=webp',
  },
  {
    id: 'tp8', name: 'Safety Helmets GCC', category: 'Safety Gear',
    badge: 'Popular in GCC', badgeColor: 'bg-emerald-600',
    demandBar: 64,
    query: 'Safety Helmets',
    imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=120&h=120&fit=crop&q=70&fm=webp',
  },
];

const POPULAR_SEARCHES: PopularSearch[] = [
  {
    id: 'ps1', label: 'GCC Road Safety Materials',
    badge: 'Most Requested', badgeColor: 'text-red-600 bg-red-50 border-red-100',
    count: '1.2k+ inquiries', icon: Flame, query: 'Road Safety Materials',
  },
  {
    id: 'ps2', label: 'Warehouse Packaging Supplies',
    badge: 'High Demand', badgeColor: 'text-orange-600 bg-orange-50 border-orange-100',
    count: '940+ inquiries', icon: BarChart2, query: 'Packaging Supplies',
  },
  {
    id: 'ps3', label: 'Export Quality Adhesive Tape',
    badge: 'Export Ready', badgeColor: 'text-violet-600 bg-violet-50 border-violet-100',
    count: '870+ inquiries', icon: Globe, query: 'Adhesive Tape',
  },
  {
    id: 'ps4', label: 'Industrial Maintenance Products',
    badge: 'Bulk Orders', badgeColor: 'text-blue-600 bg-blue-50 border-blue-100',
    count: '760+ inquiries', icon: Package, query: 'Industrial Maintenance',
  },
  {
    id: 'ps5', label: 'Solar Street Lighting Systems',
    badge: 'Fast Growing', badgeColor: 'text-amber-600 bg-amber-50 border-amber-100',
    count: '610+ inquiries', icon: Zap, query: 'Solar Street Lighting',
  },
  {
    id: 'ps6', label: 'Barcode & Label Printing Supplies',
    badge: 'Trending', badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    count: '580+ inquiries', icon: Tag, query: 'Barcode Ribbon',
  },
];

const GROWING_CATEGORIES: GrowingCategory[] = [
  { id: 'gc1', name: 'Traffic Safety', badge: '+38% this month',  trend: '↑ 38%', icon: '🚧', query: 'Traffic Safety',        color: 'bg-blue-50   hover:bg-blue-100',   textColor: 'text-blue-700' },
  { id: 'gc2', name: 'Packaging Materials', badge: '+29% this month', trend: '↑ 29%', icon: '📦', query: 'Packaging Materials',  color: 'bg-amber-50  hover:bg-amber-100',  textColor: 'text-amber-700' },
  { id: 'gc3', name: 'Industrial Labels',   badge: '+24% this month', trend: '↑ 24%', icon: '🏷', query: 'Industrial Labels',    color: 'bg-violet-50 hover:bg-violet-100', textColor: 'text-violet-700' },
  { id: 'gc4', name: 'Solar Equipment',     badge: '+21% this month', trend: '↑ 21%', icon: '☀️', query: 'Solar Equipment',     color: 'bg-orange-50 hover:bg-orange-100', textColor: 'text-orange-700' },
  { id: 'gc5', name: 'Safety Gear',         badge: '+18% this month', trend: '↑ 18%', icon: '⛑️', query: 'Safety Gear',         color: 'bg-emerald-50 hover:bg-emerald-100', textColor: 'text-emerald-700' },
  { id: 'gc6', name: 'Adhesive Tapes',      badge: '+16% this month', trend: '↑ 16%', icon: '📋', query: 'Adhesive Tape',       color: 'bg-rose-50   hover:bg-rose-100',   textColor: 'text-rose-700' },
  { id: 'gc7', name: 'Printing Supplies',   badge: '+14% this month', trend: '↑ 14%', icon: '🖨', query: 'Printing Supplies',   color: 'bg-teal-50   hover:bg-teal-100',   textColor: 'text-teal-700' },
  { id: 'gc8', name: 'Road Studs',          badge: '+12% this month', trend: '↑ 12%', icon: '🔆', query: 'Road Studs',          color: 'bg-slate-50  hover:bg-slate-100',  textColor: 'text-slate-700' },
];

/* ─── Sub-components ────────────────────────────────────────────────────────── */
function TrendingProductCard({ item, onClick }: { item: TrendingProduct; onClick: () => void }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 bg-white hover:bg-blue-50/50 border border-gray-200 hover:border-blue-300 rounded-xl p-3 transition-all duration-200 hover:shadow-md text-left w-full min-w-[230px] active:scale-[0.98]"
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
        {imgErr ? (
          <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
        ) : (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            width="48"
            height="48"
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Badge */}
        <div className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white mb-1 ${item.badgeColor}`}>
          <TrendingUp className="w-2 h-2" />
          {item.badge}
        </div>

        {/* Name */}
        <p className="text-[12.5px] font-semibold text-gray-900 group-hover:text-blue-700 leading-tight truncate transition-colors">
          {item.name}
        </p>
        <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.category}</p>

        {/* Demand bar */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${item.demandBar}%` }}
            />
          </div>
          <span className="text-[9px] font-bold text-gray-400">{item.demandBar}%</span>
        </div>
      </div>

      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
  );
}

function PopularSearchCard({ item, onClick }: { item: PopularSearch; onClick: () => void; }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-3 bg-white hover:bg-blue-50/40 border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all duration-200 hover:shadow-md text-left w-full active:scale-[0.98]"
    >
      <div className="w-9 h-9 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
        <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 group-hover:text-blue-700 leading-tight transition-colors">
          {item.label}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}>
            {item.badge}
          </span>
          <span className="text-[10px] text-gray-400">{item.count}</span>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
    </button>
  );
}

/* ─── Main Section ──────────────────────────────────────────────────────────── */
export default function TrendingProcurement() {
  const navigate = useNavigate();
  const trendingRef = useRef<HTMLDivElement>(null);
  const [tStart, setTStart] = useState(0);

  const scrollTrending = (dir: 'l' | 'r') => {
    if (trendingRef.current) {
      trendingRef.current.scrollBy({ left: dir === 'r' ? 270 : -270, behavior: 'smooth' });
    }
  };

  const goSearch = (q: string) => navigate(`/search?q=${encodeURIComponent(q)}`);

  return (
    <section className="py-10 bg-[#f5f7fa] border-y border-gray-200 hidden md:block">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

        {/* ── Section Header ── */}
        <div className="flex items-start justify-between mb-7 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
                Procurement Insights
              </span>
            </div>
            <h2 className="text-[20px] sm:text-[22px] font-extrabold text-gray-900 leading-tight">
              Trending Procurement
            </h2>
            <p className="text-[13px] text-gray-400 mt-1">
              Popular materials and sourcing requests from industrial buyers
            </p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="shrink-0 flex items-center gap-1.5 text-[12px] text-blue-600 hover:text-blue-800 font-semibold transition-colors mt-1"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Main Grid: 3 columns on desktop ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── COL 1: Trending Products horizontal scroll ── */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <h3 className="text-[14px] font-bold text-gray-900">Trending Products</h3>
                <span className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-full">
                  Live Demand
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollTrending('l')}
                  className="w-7 h-7 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button
                  onClick={() => scrollTrending('r')}
                  className="w-7 h-7 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Horizontal scroll container */}
            <div
              ref={trendingRef}
              onTouchStart={e => setTStart(e.touches[0].clientX)}
              onTouchEnd={e => {
                const dx = tStart - e.changedTouches[0].clientX;
                if (Math.abs(dx) > 40) scrollTrending(dx > 0 ? 'r' : 'l');
              }}
              className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {TRENDING_PRODUCTS.map(item => (
                <div key={item.id} className="w-[240px] shrink-0">
                  <TrendingProductCard item={item} onClick={() => goSearch(item.query)} />
                </div>
              ))}
            </div>

            {/* ── Popular Searches grid (below trending) ── */}
            <div className="mt-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-[14px] font-bold text-gray-900">Popular Procurement Searches</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {POPULAR_SEARCHES.map(item => (
                  <PopularSearchCard key={item.id} item={item} onClick={() => goSearch(item.query)} />
                ))}
              </div>
            </div>
          </div>

          {/* ── COL 2: Fast Growing Categories ── */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-500" />
              <h3 className="text-[14px] font-bold text-gray-900">Fast Growing Categories</h3>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex-1">
              {GROWING_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => goSearch(cat.query)}
                  className={`group w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 active:scale-[0.99] text-left ${cat.color} ${idx < GROWING_CATEGORIES.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  {/* Emoji icon */}
                  <span className="text-lg shrink-0 leading-none w-7 text-center">{cat.icon}</span>

                  {/* Name + badge */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold leading-tight truncate ${cat.textColor}`}>
                      {cat.name}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{cat.badge}</p>
                  </div>

                  {/* Trend indicator */}
                  <div className="flex items-center gap-1 shrink-0">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-[11px] font-bold text-green-600">{cat.trend}</span>
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>

            {/* Bottom CTA card */}
            <div className="mt-4 bg-gradient-to-br from-[#0052d9] to-[#1a3fa8] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span className="text-[12px] font-bold">Can't find what you need?</span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed mb-3">
                Submit a bulk procurement request and our team will source it for you.
              </p>
              <button
                onClick={() => navigate('/rfq')}
                className="flex items-center gap-1.5 w-full justify-center py-2 bg-white/15 hover:bg-white/25 text-white text-[12px] font-bold rounded-xl transition-colors active:scale-95 border border-white/20"
              >
                Submit Procurement Request
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
