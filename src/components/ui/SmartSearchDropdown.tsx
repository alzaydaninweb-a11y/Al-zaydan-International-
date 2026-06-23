import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, TrendingUp, Package, Tag, X, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateSlug } from '../../lib/blogService';

/* ─── Static procurement search suggestions ────────────────────────────────── */
export const POPULAR_SEARCHES = [
  'Road Safety Products',
  'Reflective Tape',
  'Industrial Adhesives',
  'Barcode Ribbon',
  'Solar Street Lighting',
  'Warehouse Labels',
  'GCC Safety Supplies',
  'Traffic Cones',
  'Safety Helmets',
  'Packaging Materials',
  'Flexographic Ink',
  'Industrial Tools',
  'Road Studs',
  'Printing Supplies',
  'Safety Gear',
];

const SUGGESTED_KEYWORDS = [
  'HDPE Pipe',
  'Cable Ties',
  'Thermal Transfer Ribbon',
  'PVC Tape',
  'Reflective Vest',
  'Hard Hat',
  'Barrier Tape',
  'Floor Marking Tape',
];

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-blue-100 text-blue-700 font-bold rounded-sm not-italic">{part}</mark>
      : part
  );
}

const RECENT_KEY = 'mh_recent_searches';
export function getRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
  catch { return []; }
}
export function saveRecentSearch(query: string) {
  try {
    const existing = getRecentSearches().filter(q => q.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(RECENT_KEY, JSON.stringify([query, ...existing].slice(0, 5)));
  } catch {}
}
export function removeRecentSearch(query: string) {
  try {
    const updated = getRecentSearches().filter(q => q !== query);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
}

/* ─── Props ────────────────────────────────────────────────────────────────── */
interface Props {
  query: string;
  products: any[];
  categories: string[];
  focusedIndex: number;
  onSelectText: (text: string) => void;
  onSelectProduct: (id: string) => void;
  onClose: () => void;
  onRecentRemove: (q: string) => void;
  recentSearches: string[];
}

/* ─── Component ────────────────────────────────────────────────────────────── */
export default function SmartSearchDropdown({
  query,
  products,
  categories,
  focusedIndex,
  onSelectText,
  onSelectProduct,
  onClose,
  onRecentRemove,
  recentSearches,
}: Props) {
  const navigate = useNavigate();
  const { categoryDetails } = useStore();
  const trimmed = query.trim().toLowerCase();

  /* ── Filtered products ── */
  const matchedProducts = trimmed.length >= 1
    ? products.filter(p =>
        p.name.toLowerCase().includes(trimmed) ||
        p.category?.toLowerCase().includes(trimmed) ||
        p.sku?.toLowerCase().includes(trimmed) ||
        p.brand?.toLowerCase().includes(trimmed)
      ).slice(0, 5)
    : [];

  /* ── Filtered categories ── */
  const matchedCategories = trimmed.length >= 1
    ? categories.filter(c => c.toLowerCase().includes(trimmed)).slice(0, 4)
    : [];

  /* ── Filtered popular / suggested ── */
  const matchedPopular = trimmed.length >= 1
    ? POPULAR_SEARCHES.filter(s => s.toLowerCase().includes(trimmed)).slice(0, 4)
    : POPULAR_SEARCHES.slice(0, 6);

  const matchedSuggested = trimmed.length >= 1
    ? SUGGESTED_KEYWORDS.filter(s => s.toLowerCase().includes(trimmed)).slice(0, 3)
    : [];

  /* ── Build flat focusable items list for keyboard nav ── */
  // Order: recent → popular (if no query) → categories → products → suggested
  let allItems: { type: 'text' | 'product' | 'recent'; value: string; id?: string }[] = [];
  if (!trimmed) {
    recentSearches.forEach(q => allItems.push({ type: 'recent', value: q }));
    matchedPopular.forEach(p => allItems.push({ type: 'text', value: p }));
  } else {
    matchedPopular.forEach(p => allItems.push({ type: 'text', value: p }));
    matchedCategories.forEach(c => allItems.push({ type: 'text', value: c }));
    matchedProducts.forEach(p => allItems.push({ type: 'product', value: p.name, id: p.id }));
    matchedSuggested.forEach(s => allItems.push({ type: 'text', value: s }));
  }

  const isEmpty = allItems.length === 0;

  const handleItemClick = (item: typeof allItems[0]) => {
    if (item.type === 'product' && item.id) {
      onSelectProduct(item.id);
    } else {
      onSelectText(item.value);
    }
  };

  return (
    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-[300] animate-in fade-in slide-in-from-top-1 duration-150">

      {isEmpty ? (
        <div className="px-4 py-8 text-center text-gray-400 text-[13px]">
          <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          No results found for "<span className="font-semibold text-gray-600">{query}</span>"
        </div>
      ) : (
        <div className="max-h-[480px] overflow-y-auto">

          {/* ── Recent Searches (empty state) ── */}
          {!trimmed && recentSearches.length > 0 && (
            <section className="border-b border-gray-100">
              <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Clock className="w-3 h-3" /> Recent Searches
                </span>
              </div>
              {recentSearches.map((q, idx) => {
                const flatIdx = idx;
                return (
                  <div
                    key={q}
                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${focusedIndex === flatIdx ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => onSelectText(q)}
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span className="text-[13px] text-gray-700">{q}</span>
                    </div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); onRecentRemove(q); }}
                      className="p-1 text-gray-300 hover:text-gray-500 rounded-md transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </section>
          )}

          {/* ── Popular Procurement Searches ── */}
          {matchedPopular.length > 0 && (
            <section className={`${!trimmed && recentSearches.length > 0 ? '' : ''} border-b border-gray-100`}>
              <div className="px-4 pt-3 pb-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <TrendingUp className="w-3 h-3" />
                  {trimmed ? 'Matching Searches' : 'Popular Procurement Searches'}
                </span>
              </div>
              {matchedPopular.map((item, idx) => {
                const offset = !trimmed ? recentSearches.length : 0;
                const flatIdx = offset + idx;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onSelectText(item)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${focusedIndex === flatIdx ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <Search className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <span className="text-[13px] text-gray-700">{highlight(item, query)}</span>
                    <ArrowRight className="w-3 h-3 text-gray-200 ml-auto shrink-0" />
                  </button>
                );
              })}
            </section>
          )}

          {/* ── Categories ── */}
          {matchedCategories.length > 0 && (
            <section className="border-b border-gray-100">
              <div className="px-4 pt-3 pb-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Tag className="w-3 h-3" /> Categories
                </span>
              </div>
              {matchedCategories.map((cat, idx) => {
                const offset = matchedPopular.length;
                const flatIdx = offset + idx;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { navigate(`/category/${categoryDetails?.[cat]?.slug || generateSlug(cat)}`); onClose(); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${focusedIndex === flatIdx ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center shrink-0">
                      <Tag className="w-3 h-3 text-blue-500" />
                    </div>
                    <span className="text-[13px] text-gray-700">{highlight(cat, query)}</span>
                    <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">Category</span>
                  </button>
                );
              })}
            </section>
          )}

          {/* ── Products ── */}
          {matchedProducts.length > 0 && (
            <section className="border-b border-gray-100">
              <div className="px-4 pt-3 pb-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Package className="w-3 h-3" /> Products
                </span>
              </div>
              {matchedProducts.map((item, idx) => {
                const offset = matchedPopular.length + matchedCategories.length;
                const flatIdx = offset + idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectProduct(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${focusedIndex === flatIdx ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0"
                    />
                    <div className="flex-grow min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900 truncate">
                        {highlight(item.name, query)}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">{item.category}</p>
                    </div>
                    {(item.price && Number(item.price) > 0) ? (
                      <span className="text-[12px] font-bold text-blue-600 shrink-0">
                        AED {item.price}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </section>
          )}

          {/* ── Suggested Keywords ── */}
          {matchedSuggested.length > 0 && (
            <section>
              <div className="px-4 pt-3 pb-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Search className="w-3 h-3" /> Suggested Keywords
                </span>
              </div>
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {matchedSuggested.map(kw => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => onSelectText(kw)}
                    className="px-3 py-1.5 text-[12px] bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-full border border-gray-200 hover:border-blue-200 transition-colors"
                  >
                    {highlight(kw, query)}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ── View all results footer ── */}
          {trimmed && (
            <div className="border-t border-gray-100 px-4 py-2.5">
              <button
                type="button"
                onClick={() => onSelectText(query)}
                className="flex items-center gap-2 text-[12.5px] text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                Search all results for "<span className="italic">{query}</span>"
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
