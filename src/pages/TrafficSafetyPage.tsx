import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Phone, MessageCircle, CheckCircle, Star, Package, Truck } from 'lucide-react';
import { useSEO } from '../lib/useSEO';
import { useStore } from '../context/StoreContext';
import ProductListingGrid from '../components/home/ProductListingGrid';

const FEATURES = [
  { icon: ShieldCheck, title: 'Certified Equipment',       desc: 'DOT, ECE & international-standard certified traffic safety products.' },
  { icon: Package,     title: 'Bulk B2B Orders',           desc: 'MOQ-friendly bulk pricing for contractors, government, and enterprise buyers.' },
  { icon: Truck,       title: 'GCC-Wide Distribution',     desc: 'Fast delivery across UAE, Saudi Arabia, Qatar, Kuwait, Oman & Bahrain.' },
  { icon: Star,        title: 'UAE Free Zone Supplier',    desc: 'Established and operating from Ajman Free Zone — reliable B2B supply partner.' },
];

const PRODUCTS_INCLUDE = [
  'Traffic Cones & Delineators', 'Road Barriers & Water-Filled Barriers', 'Chevron Boards',
  'Traffic Channelisers', 'Portable Traffic Lights', 'LED Warning Signs',
  'Road Safety Drums', 'Safety Fencing & Crowd Control Barriers',
  'Speed Bumps & Humps', 'Reflective Traffic Signs', 'Temporary Road Markings',
];

const TRAFFIC_SAFETY_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Traffic Safety Equipment Supply UAE',
  serviceType: 'Traffic Safety Equipment B2B Supply',
  description: 'Wholesale B2B supply of traffic safety equipment in UAE — road cones, barriers, LED signs, chevron boards, channelisers and more. Bulk orders for GCC. Ajman Free Zone company.',
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
    { '@type': 'Country', name: 'Kuwait' },
  ],
  url: 'https://www.alzaydaninternational.com/traffic-safety-equipment-uae',
};

export default function TrafficSafetyPage() {
  const { products, settings } = useStore();

  const defaultNumber = settings?.orderWhatsAppNumber
    || settings?.phoneNumber?.replace(/\D/g, '')
    || '';
  const waNumber = settings?.whatsappRouting?.rfq || defaultNumber;
  const waUrl = waNumber
    ? `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I am interested in traffic safety equipment. Please assist.')}`
    : '#';

  useSEO({
    title: 'Traffic Safety Equipment Supplier UAE | Al Zaydan International',
    description: 'Leading supplier of traffic safety equipment in UAE. Cones, barriers, reflective signs, road delineators and more — wholesale B2B pricing from Ajman.',
    ogImage: 'https://www.alzaydaninternational.com/images/og-banner.jpg',
    schema: TRAFFIC_SAFETY_SCHEMA,
  });

  const relatedProducts = products.filter(p =>
    ['Traffic Safety', 'Safety Gear', 'Barriers', 'Road Studs', 'Reflectors & Signage', 'Lighting & Beacons'].includes(p.category)
  );

  return (
    <main className="bg-white">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1541888081198-a0e2dc113ea4?auto=format&fit=crop&q=70&w=1600&fm=webp"
            alt="Traffic safety cones supplier UAE - Al Zaydan International"
            className="w-full h-full object-cover"
            width="1600"
            height="500"
            fetchpriority="high"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32">
          <div className="flex items-center gap-2 text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Traffic Safety Equipment · UAE</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5 max-w-2xl">
            Traffic Safety Equipment Supplier UAE
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-xl mb-8">
            Al Zaydan International FZE supplies certified traffic safety equipment in bulk to B2B buyers across the UAE and GCC. Road cones, barriers, LED warning signs, chevron boards, and more — sourced from Ajman Free Zone.
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
      <nav aria-label="breadcrumb" className="bg-slate-50 border-b border-slate-100 py-3 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/solutions" className="hover:text-slate-900 transition-colors">Solutions</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Traffic Safety Equipment UAE</span>
        </div>
      </nav>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-amber-500 text-[11px] font-bold uppercase tracking-widest mb-3">Why Choose Us</div>
            <h2 className="text-3xl font-extrabold text-slate-900">B2B Traffic Safety Equipment Supply in UAE</h2>
            <p className="text-slate-500 text-sm mt-3 max-w-xl mx-auto">
              We supply traffic safety equipment to government projects, road contractors, events companies, and facility managers across the UAE and GCC.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-amber-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-extrabold text-slate-900 mb-2 text-[15px]">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products Include ────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-6 bg-amber-50 border-y border-amber-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-amber-600 text-[11px] font-bold uppercase tracking-widest mb-4">Product Range</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">Traffic Safety Products We Supply</h2>
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
            <h3 className="text-xl font-extrabold mb-4">Get a Bulk Quote</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Send us your product list — quantity, specifications, delivery location — and our sourcing team will respond with a competitive price within 24 hours.
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

      {/* ── Live Products from Store ─────────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="py-16 px-4 md:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <div className="text-amber-500 text-[11px] font-bold uppercase tracking-widest mb-3">Browse Our Catalog</div>
              <h2 className="text-2xl font-extrabold text-slate-900">Available Traffic Safety Products</h2>
            </div>
            <ProductListingGrid customProducts={relatedProducts} columns={6} />
            <div className="text-center mt-10">
              <Link to="/category/traffic-safety" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-full transition-colors">
                View All Traffic Safety Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Internal Links for SEO ─────────────────────────────────────────── */}
      <section className="py-12 px-4 md:px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Related Industrial Solutions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/road-safety-products-uae/" className="text-blue-600 hover:underline hover:text-blue-800">Road Safety Products UAE</Link>
            <Link to="/reflective-sheeting-uae/" className="text-blue-600 hover:underline hover:text-blue-800">Reflective Sheeting UAE</Link>
            <Link to="/packaging-materials-supplier-uae/" className="text-blue-600 hover:underline hover:text-blue-800">Packaging Materials UAE</Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Source Traffic Safety Equipment?</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Al Zaydan International FZE — your trusted UAE-based B2B supplier for certified traffic safety products. Serving Dubai, Abu Dhabi, Sharjah, Ajman and across the GCC.
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

    </main>
  );
}
