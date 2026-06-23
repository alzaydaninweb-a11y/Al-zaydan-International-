import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, MessageCircle, CheckCircle, Package } from 'lucide-react';
import { useSEO } from '../lib/useSEO';
import { useStore } from '../context/StoreContext';
import ProductListingGrid from '../components/home/ProductListingGrid';

const PRODUCTS_INCLUDE = [
  'Reflective Sheeting (Diamond Grade)', 'High Intensity Prismatic Sheeting', 'Type II Reflective Sheeting',
  'DOT-C2 Reflective Tape', 'ECE-104 Reflective Tape', 'SOLAS Reflective Tape',
  'Rear Reflective Marking Plates', 'Vehicle Conspicuity Tape', 'Road Delineator Reflectors',
  'Reflective Pavement Markers', 'Fluorescent Safety Vests', 'Reflective Warning Triangles',
];

const REFLECTIVE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Reflective Sheeting Supplier UAE',
  serviceType: 'Reflective Sheeting & Safety Materials B2B Supply',
  description: 'High-grade reflective sheeting for traffic signs, road safety & construction in UAE. DOT, ECE, SOLAS certified. B2B wholesale supply from Ajman Free Zone. GCC-wide distribution.',
  provider: {
    '@type': 'Organization',
    '@id': 'https://www.alzaydaninternational.com/#organization',
    name: 'Al Zaydan International FZE',
    url: 'https://www.alzaydaninternational.com',
  },
  areaServed: [
    { '@type': 'Country', name: 'United Arab Emirates' },
    { '@type': 'Country', name: 'Saudi Arabia' },
    { '@type': 'Country', name: 'Qatar' },
  ],
  url: 'https://www.alzaydaninternational.com/reflective-sheeting-uae',
};

export default function ReflectiveSheetingPage() {
  const { products, settings } = useStore();

  const defaultNumber = settings?.orderWhatsAppNumber
    || settings?.phoneNumber?.replace(/\D/g, '')
    || '';
  const waNumber = settings?.whatsappRouting?.rfq || defaultNumber;
  const waUrl = waNumber
    ? `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I am interested in reflective sheeting. Please assist.')}`
    : '#';

  useSEO({
    title: 'Reflective Sheeting Supplier UAE | Al Zaydan International FZE',
    description: 'Buy reflective sheeting in UAE — Type I, Type II, and high-intensity grades. Al Zaydan International supplies reflective materials for road signs and markings.',
    ogImage: 'https://www.alzaydaninternational.com/images/og-banner.jpg',
    schema: REFLECTIVE_SCHEMA,
  });

  const relatedProducts = products.filter(p =>
    ['Reflectors & Signage', 'Traffic Safety', 'Safety Gear'].includes(p.category)
  );

  return (
    <div className="bg-white">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&q=70&w=1600&fm=webp"
            alt="Reflective Sheeting UAE Supplier"
            className="w-full h-full object-cover"
            width="1600"
            height="500"
            fetchpriority="high"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32">
          <div className="flex items-center gap-2 text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-4">
            <Layers className="w-4 h-4" />
            <span>Reflective Sheeting · UAE B2B Supplier</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5 max-w-2xl">
            Reflective Sheeting Supplier in UAE
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-xl mb-8">
            Al Zaydan International FZE supplies DOT, ECE, and SOLAS certified reflective sheeting and reflective tapes to B2B customers across the UAE and GCC. Diamond Grade, High Intensity Prismatic, and Type II grades available.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/rfq" className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-7 py-3.5 rounded-full transition-colors text-sm">
              Request a Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-bold px-7 py-3.5 rounded-full transition-colors text-sm">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="bg-slate-50 border-b border-slate-100 py-3 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/solutions" className="hover:text-slate-900 transition-colors">Solutions</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Reflective Sheeting UAE</span>
        </div>
      </nav>

      {/* ── Certification Badges ─────────────────────────────────────────── */}
      <section className="py-10 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {['DOT Certified', 'ECE 104 Compliant', 'SOLAS Approved', 'GCC Distribution', 'B2B Wholesale'].map(cert => (
              <div key={cert} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <CheckCircle className="w-5 h-5 text-amber-500" />
                {cert}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products Include ────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-6 bg-amber-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-amber-600 text-[11px] font-bold uppercase tracking-widest mb-4">What We Supply</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">Reflective Materials & Sheeting Range</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRODUCTS_INCLUDE.map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-extrabold mb-4">Request Specifications & Pricing</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Tell us the grade, width, quantity and application. We'll source the right specification and provide a competitive B2B quote within 24 hours.
            </p>
            <div className="space-y-3">
              <Link to="/rfq" className="flex items-center justify-center gap-2 w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3.5 rounded-xl transition-colors text-sm">
                <Package className="w-4 h-4" /> Submit RFQ Online
              </Link>
              <a href={waUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
                <MessageCircle className="w-4 h-4" /> WhatsApp Our Team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Products ───────────────────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="py-16 px-4 md:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <div className="text-amber-500 text-[11px] font-bold uppercase tracking-widest mb-3">Browse Catalog</div>
              <h2 className="text-2xl font-extrabold text-slate-900">Available Reflective & Safety Products</h2>
            </div>
            <ProductListingGrid customProducts={relatedProducts} columns={6} />
            <div className="text-center mt-10">
              <Link to="/category/reflectors-signage" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-full transition-colors">
                View All Reflective Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Source Reflective Sheeting for Your Next Project</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Trusted by road contractors, sign fabricators, and safety companies across the UAE. Certified reflective materials in bulk — delivered from Ajman Free Zone across the GCC.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/rfq" className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-8 py-4 rounded-full transition-colors">
              Request a Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="inline-flex items-center border border-white/30 hover:border-white/60 text-white font-bold px-8 py-4 rounded-full transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
