import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { PROMO_BANNERS, TRUST_BADGES } from '../../data/catalogData';

export default function PromoBannerStrip() {
  return (
    <div className="bg-white border-b border-slate-200">
      {/* Trust badges — single line ticker */}
      <div className="bg-slate-50 border-b border-slate-200 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 py-2 flex items-center gap-6 overflow-x-auto scrollbar-hide">
          {[...TRUST_BADGES, ...TRUST_BADGES].map((badge, i) => (
            <div key={i} className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
              <span className="text-[14px]">{badge.icon}</span>
              <span className="text-[11px] font-semibold text-slate-700">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Promo banners */}
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PROMO_BANNERS.map(banner => (
            <Link
              key={banner.id}
              to="/contact"
              className="flex items-center gap-4 rounded-xl px-4 py-3 group transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: banner.color }}
            >
              <span className="text-3xl shrink-0">{banner.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-[14px] leading-tight">{banner.title}</p>
                <p className="text-white/70 text-[11px] mt-0.5 leading-tight">{banner.subtitle}</p>
              </div>
              <div
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap"
                style={{ backgroundColor: banner.accentColor, color: banner.color }}
              >
                {banner.cta} <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
