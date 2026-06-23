import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, MessageCircle, CheckCircle, Package } from 'lucide-react';
import { useSEO } from '../lib/useSEO';
import { useStore } from '../context/StoreContext';
import ProductListingGrid from '../components/home/ProductListingGrid';

const PRODUCTS_INCLUDE = [
  'Solar Road Studs & Cat Eyes', 'Reflective Delineator Posts', 'Road Marking Tapes',
  'Speed Bumps & Speed Humps', 'Flexible Bollards', 'Water-Filled Road Barriers',
  'Concrete Barrier Reflectors', 'Temporary Traffic Lights', 'LED Warning Beacons',
  'Trench Covers', 'Traffic Cylinder Cones', 'Anti-Glare Screens',
];

const ROAD_SAFETY_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Road Safety Products Supplier UAE',
  serviceType: 'Road Safety & Traffic Management Solutions Supply',
  description: 'Specialized supplier of road safety products in UAE. Solar road studs, delineators, barriers, and speed bumps for infrastructure projects. B2B wholesale supply from Ajman Free Zone.',
  provider: {
    '@type': 'Organization',
    '@id': 'https://www.alzaydaninternational.com/#organization',
    name: 'Al Zaydan International FZE',
    url: 'https://www.alzaydaninternational.com',
  },
  areaServed: [
    { '@type': 'Country', name: 'United Arab Emirates' },
    { '@type': 'Country', name: 'Saudi Arabia' },
    { '@type': 'Country', name: 'Oman' },
    { '@type': 'Country', name: 'Qatar' },
  ],
  url: 'https://www.alzaydaninternational.com/road-safety-products-uae',
};

export default function RoadSafetyPage() {
  const { products, settings } = useStore();

  const defaultNumber = settings?.orderWhatsAppNumber
    || settings?.phoneNumber?.replace(/\D/g, '')
    || '';
  const waNumber = settings?.whatsappRouting?.rfq || defaultNumber;
  const waUrl = waNumber
    ? `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I am interested in road safety products. Please assist.')}`
    : '#';

  useSEO({
    title: 'Road Safety Products UAE | Wholesale B2B Supplier — Al Zaydan',
    description: 'Wholesale road safety products in UAE and GCC. Al Zaydan International supplies road markers, guardrails, safety signs and traffic control equipment.',
    ogImage: 'https://www.alzaydaninternational.com/images/og-banner.jpg',
    schema: ROAD_SAFETY_SCHEMA,
  });

  const relatedProducts = products.filter(p =>
    ['Road Studs', 'Barriers', 'Safety Gear', 'Lighting & Beacons', 'Traffic Safety'].includes(p.category)
  );

  return (
    <div className="bg-white">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1584844308364-a690e03eaff1?auto=format&fit=crop&q=70&w=1600&fm=webp"
            alt="Road Safety Products UAE Supplier"
            className="w-full h-full object-cover"
            width="1600"
            height="500"
            fetchpriority="high"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32">
          <div className="flex items-center gap-2 text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-4">
            <AlertTriangle className="w-4 h-4" />
            <span>Infrastructure & Highway Safety · UAE</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5 max-w-2xl">
            Road Safety Products Supplier UAE
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-xl mb-8">
            Specialized B2B supply of highway and infrastructure safety solutions. From solar road studs and delineators to speed management systems, Al Zaydan International delivers certified road safety products across the GCC.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/rfq" className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-7 py-3.5 rounded-full transition-colors text-sm">
              Request a Bulk Quote <ArrowRight className="w-4 h-4" />
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
          <span className="text-slate-900 font-semibold">Road Safety Products UAE</span>
        </div>
      </nav>

      {/* ── Project Types ─────────────────────────────────────────────────── */}
      <section className="py-10 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Supporting Infrastructure Projects</h3>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {['Highway Construction', 'Municipal Roads', 'Parking Facilities', 'Industrial Zones', 'Temporary Work Zones'].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <CheckCircle className="w-5 h-5 text-amber-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products Include ────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-6 bg-amber-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-amber-600 text-[11px] font-bold uppercase tracking-widest mb-4">Infrastructure Solutions</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">Highway & Road Safety Inventory</h2>
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
            <h3 className="text-xl font-extrabold mb-4">Project Procurement Support</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Executing a roadwork or infrastructure project? Send us your BOQ (Bill of Quantities) and specifications. We provide complete sourcing, competitive pricing, and logistics coordination.
            </p>
            <div className="space-y-3">
              <Link to="/rfq" className="flex items-center justify-center gap-2 w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3.5 rounded-xl transition-colors text-sm">
                <Package className="w-4 h-4" /> Submit BOQ Online
              </Link>
              <a href={waUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
                <MessageCircle className="w-4 h-4" /> WhatsApp Project Team
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
              <h2 className="text-2xl font-extrabold text-slate-900">Road Infrastructure Products</h2>
            </div>
            <ProductListingGrid customProducts={relatedProducts} columns={6} />
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Reliable Supply for Highway & Infrastructure Safety</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            From temporary work zones to permanent highway installations, Al Zaydan International is your procurement partner in the UAE and wider GCC.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/rfq" className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-8 py-4 rounded-full transition-colors">
              Request a Project Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="inline-flex items-center border border-white/30 hover:border-white/60 text-white font-bold px-8 py-4 rounded-full transition-colors">
              Contact Sales Team
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
