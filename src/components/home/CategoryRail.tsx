import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateSlug } from '../../lib/blogService';
import { MEGA_CATEGORIES } from '../../data/catalogData';

const CAT_COLORS = [
  'from-blue-600 to-blue-800',
  'from-slate-700 to-slate-900',
  'from-amber-500 to-orange-600',
  'from-emerald-600 to-teal-700',
  'from-red-600 to-rose-700',
  'from-purple-600 to-violet-700',
  'from-cyan-600 to-sky-700',
  'from-indigo-600 to-blue-700',
];

export default function CategoryRail() {
  const { categories, categoryImages, categoryDetails } = useStore();
  
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-screen-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-slate-900">Browse by Category</h2>
          <Link to="/search" className="text-[12px] text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-800 transition-colors">
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {categories.slice(0, 16).map((cat, i) => {
            const catObj = MEGA_CATEGORIES.find(c => c.label.toLowerCase() === cat.toLowerCase());
            const emoji = catObj ? catObj.icon : '📦';
            const imageUrl = categoryImages[cat];

            return (
              <Link
                key={cat}
                to={`/category/${categoryDetails?.[cat]?.slug || generateSlug(cat)}`}
                className="flex flex-col items-center bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-500 transition-all duration-200 overflow-hidden group h-full"
              >
                {imageUrl ? (
                  <div className="w-full aspect-[4/3] bg-white flex items-center justify-center p-2 border-b border-gray-100 overflow-hidden">
                    <img src={imageUrl} alt={cat} width="120" height="90" loading="lazy" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className={`w-full aspect-[4/3] flex items-center justify-center border-b border-gray-100 bg-gradient-to-br ${CAT_COLORS[i % CAT_COLORS.length]}`}>
                    <span className="text-3xl leading-none drop-shadow-md group-hover:scale-110 transition-transform duration-300">{emoji}</span>
                  </div>
                )}
                <div className="p-2.5 flex items-center justify-center w-full min-h-[46px] bg-gray-50/50">
                  <span className="text-[11px] font-bold text-gray-800 text-center leading-tight line-clamp-2">{cat}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
