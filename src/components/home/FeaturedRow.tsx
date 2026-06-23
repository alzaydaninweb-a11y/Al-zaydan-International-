import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';
import ProductCard, { MarketplaceProduct } from '../ui/ProductCard';
import { STATIC_PRODUCTS } from '../../data/catalogData';

import { generateSlug } from '../../lib/blogService';

const BESTSELLERS = STATIC_PRODUCTS.filter(p => p.badge === 'Bestseller' || p.badge === 'Top Rated' || p.badge === 'Hot').slice(0, 10);
const BULK_DEALS = STATIC_PRODUCTS.filter(p => p.badge === 'Bulk Deal' || (p.moq && p.moq.includes('50'))).slice(0, 6);

export default function FeaturedRow() {
  return (
    <div className="bg-slate-50 border-b border-slate-200">
      <div className="max-w-screen-2xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          {/* Bestsellers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[16px]">🏆</span>
                <h2 className="text-[15px] font-extrabold text-slate-900">Bestsellers</h2>
                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">HOT</span>
              </div>
              <Link to="/search" className="text-[12px] text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-800 transition-colors">
                See All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {BESTSELLERS.map(p => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </div>

          {/* Bulk Deals sidebar */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#132337]">
              <Tag className="w-4 h-4 text-amber-400" />
              <h3 className="text-[14px] font-bold text-white">Bulk Order Deals</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {BULK_DEALS.map(p => (
                <Link key={p.id} to={`/product/${p.slug || generateSlug(p.name)}`}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 group transition-colors">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">{p.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">MOQ: {p.moq}</p>
                    <p className="text-[12px] font-bold text-blue-700">AED {p.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100">
              <Link to="/contact"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-900 text-[12px] font-bold transition-colors">
                Request Bulk Quote <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
