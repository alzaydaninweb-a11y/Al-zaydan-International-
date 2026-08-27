import React from 'react';
import type { Product } from '../../context/StoreContext';

interface Props {
  product: Product;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function PriceDisplay({ product, size = 'sm' }: Props) {
  const type = product.priceType ?? 'fixed';
  const isLarge = size === 'lg' || size === 'xl';

  if (type === 'hidden') {
    const WAIcon = () => (
      <svg viewBox="0 0 24 24" className={isLarge ? 'w-4 h-4' : 'w-3 h-3'} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    );
    return isLarge ? (
      <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-800 font-bold px-3.5 py-1.5 rounded-lg text-sm">
        <WAIcon />
        Price on Request
      </div>
    ) : (
      <div className="inline-flex items-center gap-1 bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30 font-bold px-2 py-0.5 rounded text-[10px]">
        <WAIcon />
        Contact for Price
      </div>
    );
  }

  if (type === 'tiered' && product.priceTiers && product.priceTiers.length > 0) {
    const displayTier = product.priceTiers.find(t => t.isCardDisplayPrice) || product.priceTiers[0];
    const lowestTier = [...product.priceTiers].sort((a, b) => a.price - b.price)[0];
    return isLarge ? (
      <div className="flex items-baseline gap-2.5 flex-wrap">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AED {displayTier.price.toFixed(2)}
        </span>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
          Volume Price Table Available
        </span>
      </div>
    ) : (
      <div className="flex items-baseline gap-1">
        <span className="text-[13px] font-black text-slate-900 tracking-tight">
          <span className="text-[9px] font-bold text-slate-400 mr-0.5">AED</span>
          {displayTier.price.toFixed(2)}
        </span>
        <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-1 py-0.2 rounded">
          Tiers
        </span>
      </div>
    );
  }

  if (type === 'range') {
    const min = product.priceMin ?? product.price;
    const max = product.priceMax ?? product.mrp;
    return isLarge ? (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AED {min.toLocaleString()} – {max.toLocaleString()}
        </span>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          Volume Price Range
        </span>
      </div>
    ) : (
      <div className="flex items-baseline gap-0.5 flex-wrap">
        <span className="text-[9px] font-bold text-slate-400">AED</span>
        <span className="text-[13px] font-black text-slate-900">{min.toLocaleString()}</span>
        <span className="text-[10px] font-bold text-slate-400 mx-0.5">–</span>
        <span className="text-[9px] font-bold text-slate-400">AED</span>
        <span className="text-[13px] font-black text-slate-900">{max.toLocaleString()}</span>
      </div>
    );
  }

  // Default: fixed price
  const priceVal = Number(product.price || 0);
  const mrpVal = Number(product.mrp || 0);
  const hasDiscount = mrpVal > priceVal;
  const discountPercent = product.discount || (hasDiscount ? Math.round(((mrpVal - priceVal) / mrpVal) * 100) : 0);

  return isLarge ? (
    <div className="flex items-baseline gap-2.5 flex-wrap">
      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        AED {priceVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>

      {hasDiscount && (
        <span className="text-sm text-slate-400 line-through font-medium">
          AED {mrpVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )}

      {discountPercent > 0 && (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs px-2 py-0.5 rounded">
          SAVE {discountPercent}%
        </span>
      )}
    </div>
  ) : (
    <div className="flex items-baseline gap-1">
      <span className="text-[13px] font-black text-slate-900 tracking-tight">
        <span className="text-[9px] font-bold text-slate-400 mr-0.5">AED</span>
        {priceVal.toLocaleString()}
      </span>
      {discountPercent > 0 && (
        <span className="text-[9px] text-slate-300 line-through font-medium">
          {mrpVal.toLocaleString()}
        </span>
      )}
    </div>
  );
}
