import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useSEO } from '../lib/useSEO';
import { generateSlug } from '../lib/blogService';

export default function CategoriesMobilePage() {
  const { categories, categoryImages, products, categoryDetails } = useStore();
  const navigate = useNavigate();

  useSEO({
    title: 'All Product Categories | Al Zaydan International UAE',
    description: 'Browse Al Zaydan\'s full product catalogue — traffic safety equipment, reflective sheeting, road marking materials, packaging supplies and more.',
  });

  return (
    <div className="flex-1 bg-slate-50 min-h-[calc(100vh-140px)]">
      {/* Minimal Left-Oriented Breadcrumb Header */}
      <div className="w-full bg-white border-b border-slate-200 px-4 py-2.5 shadow-2xs sticky top-0 md:top-[60px] z-10">
        <div className="w-full flex items-center text-[13px] text-slate-500 font-medium">
          <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <span className="mx-1.5 text-slate-300">/</span>
          <span className="text-slate-900 font-bold">All Categories</span>
        </div>
      </div>
      
      <div className="w-full px-4 py-6 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
          {categories.map((cat, i) => {
            // Get product count and fallback images if no uploaded image exists
            const productsInCat = products.filter(p => p.category === cat);
            let imageUrl = categoryImages[cat];
            
            if (!imageUrl) {
              const prod = productsInCat[0];
              if (prod && prod.image) imageUrl = prod.image;
              else {
                const fallbacks: Record<string, string> = {
                  'Traffic Safety': 'https://images.unsplash.com/photo-1541888081198-a0e2dc113ea4?q=80&w=400&auto=format&fit=crop',
                  'Safety Gear': 'https://images.unsplash.com/photo-1582136005230-05e81d7d0a2b?q=80&w=400&auto=format&fit=crop',
                  'Road Studs': 'https://images.unsplash.com/photo-1584844308364-a690e03eaff1?q=80&w=400&auto=format&fit=crop',
                  'Barriers': 'https://images.unsplash.com/photo-1579762593175-20226054cad0?q=80&w=400&auto=format&fit=crop',
                  'Reflectors & Signage': 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?q=80&w=400&auto=format&fit=crop',
                  'Lighting & Beacons': 'https://images.unsplash.com/photo-1513826308963-f6ecb473cddb?q=80&w=400&auto=format&fit=crop',
                  'Industrial Tools': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=400&auto=format&fit=crop',
                  'Bulk Offers': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop',
                };
                imageUrl = fallbacks[cat] || 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=400&auto=format&fit=crop';
              }
            }

            const count = productsInCat.length;
            const countStr = `${count} product${count !== 1 ? 's' : ''}`;
            
            return (
              <button
                key={i}
                onClick={() => navigate(`/category/${categoryDetails?.[cat]?.slug || generateSlug(cat)}`)}
                className="group flex flex-col focus:outline-none w-full text-left"
              >
                <div className="w-full aspect-square bg-[#f4f6f8] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                  <img
                    src={imageUrl}
                    alt={cat}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-3 px-1">
                  <h3 className="text-[14px] font-bold text-gray-900 leading-tight group-hover:text-[#0052d9] transition-colors truncate">
                    {cat}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>
        {categories.length === 0 && (
          <div className="p-12 text-center text-gray-400 text-sm font-medium">
            Loading categories...
          </div>
        )}
      </div>
    </div>
  );
}
