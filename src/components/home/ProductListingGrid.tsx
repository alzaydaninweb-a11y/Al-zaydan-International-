import React from 'react';
import { useStore } from '../../context/StoreContext';
import type { Product } from '../../context/StoreContext';
import ProductCard from '../ui/ProductCard';

/* ─── Grid wrapper ──────────────────────────────────────────────────────────── */
export default function ProductListingGrid({
  limit,
  customProducts,
  columns = 6,
  featuredOnly = false,
  category,
}: {
  limit?: number;
  customProducts?: Product[];
  columns?: 3 | 4 | 6;
  featuredOnly?: boolean;
  category?: string;
}) {
  const { products } = useStore();

  let displayProducts: Product[];
  if (customProducts) {
    displayProducts = customProducts;
  } else {
    let filtered = products;
    if (featuredOnly) filtered = filtered.filter(p => p.featured);
    if (category && category !== 'All Products') {
      filtered = filtered.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }
    displayProducts = limit ? filtered.slice(0, limit) : filtered;
  }

  const gridClass =
    columns === 6
      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4'
      : columns === 3
      ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4'
      : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4';

  return (
    <div className={gridClass}>
      {displayProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product as any}
        />
      ))}
    </div>
  );
}
