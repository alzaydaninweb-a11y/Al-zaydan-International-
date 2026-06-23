import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const QUICK_TAGS = [
  { label: 'Traffic Safety',       query: 'Traffic Safety' },
  { label: 'Adhesive Tape',        query: 'Adhesive Tape' },
  { label: 'Safety Gear',          query: 'Safety Gear' },
  { label: 'Packaging Materials',  query: 'Packaging Materials' },
  { label: 'Barcode Ribbon',       query: 'Barcode Ribbon' },
  { label: 'Solar Lighting',       query: 'Solar Lighting' },
  { label: 'Industrial Tools',     query: 'Industrial Tools' },
  { label: 'Road Studs',           query: 'Road Studs' },
  { label: 'Printing Supplies',    query: 'Printing Supplies' },
  { label: 'Safety Equipment',     query: 'Safety Equipment' },
  { label: 'Reflective Tape',      query: 'Reflective Tape' },
  { label: 'GCC Safety',           query: 'GCC Safety' },
];

export default function QuickSearchPills() {
  const navigate = useNavigate();

  const handleClick = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 py-2.5">
        <div className="flex items-center gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {/* Label */}
          <div className="flex items-center gap-1.5 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
              Quick Search
            </span>
          </div>

          <div className="w-px h-4 bg-gray-200 shrink-0" />

          {/* Pills */}
          {QUICK_TAGS.map(tag => (
            <button
              key={tag.label}
              onClick={() => handleClick(tag.query)}
              className="shrink-0 px-3 py-1 text-[12px] font-medium text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-full transition-all active:scale-95"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
