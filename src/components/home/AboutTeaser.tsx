import React from 'react';
import { ArrowRight, Package, Globe2, Handshake, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATS = [
  { icon: Package,    label: 'Business Model',  value: 'B2B Trading & Distribution' },
  { icon: Globe2,     label: 'Market Focus',     value: 'UAE-Based Supply Support'   },
  { icon: Handshake,  label: 'Strength',         value: 'Product Matching & Sourcing' },
  { icon: TrendingUp, label: 'Coverage',         value: 'Safety, Industrial & FMCG'  },
];

export default function AboutTeaser() {
  return (
    <section className="py-16 px-4 md:px-6 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">

        {/* Label */}
        <div className="text-amber-500 text-[11px] font-bold uppercase tracking-widest mb-3">
          Who We Are
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
              About Al Zaydan<br />
              <span className="text-amber-500">International FZE</span>
            </h2>

            <p className="text-slate-600 text-base leading-relaxed mb-6">
              Al Zaydan International FZE is a UAE-based B2B trading, sourcing, and distribution company.
              We provide commercially focused supply solutions across packaging, signage, traffic safety,
              industrial materials, LED solutions, and selected FMCG product lines.
            </p>

            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Our business is built on sourcing flexibility, dependable support, and a practical
              understanding of customer requirements — connecting the right products with the right
              applications.
            </p>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-7 py-3.5 rounded-full transition-colors group"
            >
              Learn More About Us
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right — stat cards */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:border-amber-200 hover:bg-amber-50/30 transition-all"
              >
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-4.5 h-4.5 text-amber-600 w-[18px] h-[18px]" />
                </div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-bold text-slate-800 leading-snug">{value}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
