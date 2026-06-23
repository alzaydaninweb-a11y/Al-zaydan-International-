import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Star, TrendingUp, Search, Loader2 } from 'lucide-react';

// ── Reusable product-toggle row ───────────────────────────────────────────────

function ProductRow({
  product,
  togglingId,
  isActive,
  color,
  onToggle,
}: {
  product: { id: string; name: string; brand: string; category: string; price: number; image: string };
  togglingId: string | null;
  isActive: boolean;
  color: 'blue' | 'amber';
  onToggle: (id: string) => void;
}) {
  const bg = color === 'blue' ? 'bg-blue-500' : 'bg-amber-500';
  const activeBg = color === 'blue' ? 'bg-blue-50/40' : 'bg-amber-50/40';
  const badgeClass = color === 'blue'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-amber-100 text-amber-700';
  const badgeLabel = color === 'blue' ? 'Top Selling' : 'Featured';

  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${isActive ? activeBg : 'hover:bg-gray-50'} ${togglingId === product.id ? 'opacity-60' : ''}`}>
      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-gray-100">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 truncate">{product.name}</span>
          {isActive && (
            <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${badgeClass}`}>
              {color === 'blue'
                ? <TrendingUp className="w-2.5 h-2.5" />
                : <Star className="w-2.5 h-2.5 fill-current" />}
              {badgeLabel}
            </span>
          )}
        </div>
        <div className="text-xs text-slate-400 font-medium">
          {product.category} · {product.brand} · AED {product.price}
        </div>
      </div>

      <button
        onClick={() => onToggle(product.id)}
        disabled={togglingId === product.id}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50 ${isActive ? bg : 'bg-gray-200'}`}
      >
        {togglingId === product.id ? (
          <Loader2 className="absolute inset-0 m-auto w-3.5 h-3.5 text-white animate-spin" />
        ) : (
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
        )}
      </button>
    </div>
  );
}

// ── Active products sidebar ───────────────────────────────────────────────────

function ActiveSidebar({
  label,
  icon,
  color,
  items,
  togglingId,
  onRemove,
}: {
  label: string;
  icon: React.ReactNode;
  color: 'blue' | 'amber';
  items: { id: string; name: string; price: number; image: string }[];
  togglingId: string | null;
  onRemove: (id: string) => void;
}) {
  const headerBg = color === 'blue' ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100';
  const iconColor = color === 'blue' ? 'text-blue-500' : 'text-amber-500';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
      <div className={`px-4 py-3 border-b flex items-center gap-2 ${headerBg}`}>
        <span className={iconColor}>{icon}</span>
        <h2 className="font-bold text-slate-800 text-sm">{label} ({items.length})</h2>
      </div>
      {items.length === 0 ? (
        <div className="p-4 text-center text-slate-400 text-xs font-medium py-8">
          None selected yet.<br />Toggle products from the list.
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {items.map(p => (
            <div key={p.id} className="flex items-center gap-2.5 px-3.5 py-2.5">
              <div className="w-8 h-8 rounded-md bg-slate-100 overflow-hidden shrink-0">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate">{p.name}</div>
                <div className="text-[10px] text-slate-400">AED {p.price}</div>
              </div>
              <button onClick={() => onRemove(p.id)} disabled={togglingId === p.id}
                className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors shrink-0 disabled:opacity-40">
                {togglingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : '✕'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminHomepage() {
  const { products, toggleFeatured, toggleTopSelling } = useStore();
  const [search, setSearch] = useState('');
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);
  const [togglingTopId, setTogglingTopId] = useState<string | null>(null);

  const featuredList  = products.filter(p => p.featured);
  const topSellingList = products.filter(p => p.topSelling);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleFeatured = async (id: string) => {
    setTogglingFeaturedId(id);
    try { await toggleFeatured(id); }
    catch (e) { console.error('Toggle failed:', e); }
    finally { setTogglingFeaturedId(null); }
  };

  const handleToggleTopSelling = async (id: string) => {
    setTogglingTopId(id);
    try { await toggleTopSelling(id); }
    catch (e) { console.error('Toggle failed:', e); }
    finally { setTogglingTopId(null); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Homepage Products</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Manage which products appear in each homepage section. Changes save instantly to Firebase.
        </p>
      </div>

      {/* ══ SECTION 1: Best Selling Products ══════════════════════════════ */}
      <div>
        {/* Section title */}
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Best Selling Products</h2>
            <p className="text-xs text-slate-500">Shown in the dark "Best Selling" carousel section</p>
          </div>
          <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${topSellingList.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
            {topSellingList.length} selected
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ActiveSidebar
              label="Top Selling"
              icon={<TrendingUp className="w-4 h-4" />}
              color="blue"
              items={topSellingList}
              togglingId={togglingTopId}
              onRemove={handleToggleTopSelling}
            />
          </div>

          {/* Product list */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search products..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none transition-colors" />
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map(product => (
                <ProductRow
                  key={product.id}
                  product={product}
                  togglingId={togglingTopId}
                  isActive={!!product.topSelling}
                  color="blue"
                  onToggle={handleToggleTopSelling}
                />
              ))}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">No products match your search.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ SECTION 2: Featured on Homepage ═══════════════════════════════ */}
      <div>
        {/* Section title */}
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Featured on Homepage</h2>
            <p className="text-xs text-slate-500">Shown in the "Top Products" grid section</p>
          </div>
          <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${featuredList.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
            {featuredList.length} selected
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ActiveSidebar
              label="Featured"
              icon={<Star className="w-4 h-4 fill-current" />}
              color="amber"
              items={featuredList}
              togglingId={togglingFeaturedId}
              onRemove={handleToggleFeatured}
            />
          </div>

          {/* Product list */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search products..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none transition-colors" />
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map(product => (
                <ProductRow
                  key={product.id}
                  product={product}
                  togglingId={togglingFeaturedId}
                  isActive={!!product.featured}
                  color="amber"
                  onToggle={handleToggleFeatured}
                />
              ))}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">No products match your search.</div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
