import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, MessageCircle, CheckCircle, Truck } from 'lucide-react';
import { useSEO } from '../lib/useSEO';
import { useStore } from '../context/StoreContext';
import ProductListingGrid from '../components/home/ProductListingGrid';

const PRODUCTS_INCLUDE = [
  'Hot Melt Adhesive', 'Carton & Box Adhesive', 'Labelling Adhesive',
  'BOPP Packaging Tape', 'Masking Tape', 'Double-Sided Tissue Tape',
  'PE Foam Tape', 'Acrylic Foam Tape', 'EVA Foam Tape',
  'Aluminum Foil Tape', 'Paper Bag Adhesive', 'EPE Foam Adhesive',
];

const PACKAGING_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Packaging Materials Supplier UAE',
  serviceType: 'Industrial Packaging Materials B2B Supply',
  description: 'Industrial packaging materials in UAE. Bulk B2B orders for GCC — hot melt adhesive, BOPP tape, foam tapes & more. Ajman Free Zone.',
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
  url: 'https://www.alzaydaninternational.com/packaging-materials-supplier-uae',
};

export default function PackagingMaterialsPage() {
  const { products, settings } = useStore();

  const defaultNumber = settings?.orderWhatsAppNumber
    || settings?.phoneNumber?.replace(/\D/g, '')
    || '';
  const waNumber = settings?.whatsappRouting?.rfq || defaultNumber;
  const waUrl = waNumber
    ? `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I am interested in bulk packaging materials. Please assist.')}`
    : '#';

  useSEO({
    title: 'Packaging Materials Supplier UAE | Bulk B2B — Al Zaydan',
    description: 'Bulk packaging materials supplier in UAE. Stretch film, strapping, tape, bubble wrap and industrial packaging solutions from Al Zaydan International, Ajman.',
    ogImage: 'https://www.alzaydaninternational.com/images/og-banner.jpg',
    schema: PACKAGING_SCHEMA,
  });

  const relatedProducts = products.filter(p =>
    p.category?.toLowerCase().includes('packag') ||
    p.category?.toLowerCase().includes('adhesive') ||
    p.category?.toLowerCase().includes('tape')
  );

  return (
    <div className="bg-white">
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img 
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=70&w=1600&fm=webp" 
            alt="Packaging Materials UAE" 
            className="w-full h-full object-cover" 
            width="1600"
            height="500"
            fetchpriority="high" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32">
          <div className="flex items-center gap-2 text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-4">
            <Package className="w-4 h-4" /><span>Packaging Materials · UAE B2B Supplier</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5 max-w-2xl">Packaging Materials Supplier UAE</h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-xl mb-8">
            Al Zaydan International FZE supplies industrial packaging materials and adhesive solutions in bulk to manufacturers, logistics companies, and B2B buyers across UAE and GCC — from Ajman Free Zone.
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

      <nav className="bg-slate-50 border-b border-slate-100 py-3 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-900">Home</Link><span>/</span>
          <Link to="/solutions" className="hover:text-slate-900">Solutions</Link><span>/</span>
          <span className="text-slate-900 font-semibold">Packaging Materials UAE</span>
        </div>
      </nav>

      <section className="py-10 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-wrap items-center justify-center gap-8">
          {['Industrial Grade', 'Bulk MOQ Available', 'UAE Free Zone', 'GCC Distribution', '24hr Quote Response'].map(item => (
            <div key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CheckCircle className="w-5 h-5 text-amber-500" />{item}
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 md:px-6 bg-amber-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-amber-600 text-[11px] font-bold uppercase tracking-widest mb-4">Product Range</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">Packaging Materials & Adhesives We Supply</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRODUCTS_INCLUDE.map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />{item}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-extrabold">Get a Bulk Packaging Quote</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">Submit your product list and quantity. Our team will source the right materials and provide competitive B2B pricing within 24 hours.</p>
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

      {relatedProducts.length > 0 && (
        <section className="py-16 px-4 md:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <div className="text-amber-500 text-[11px] font-bold uppercase tracking-widest mb-3">Browse Catalog</div>
              <h2 className="text-2xl font-extrabold text-slate-900">Available Packaging Products</h2>
            </div>
            <ProductListingGrid customProducts={relatedProducts} columns={6} />
          </div>
        </section>
      )}

      <section className="py-20 px-4 md:px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Need Packaging Materials for Your Business?</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">Bulk packaging materials for manufacturers, logistics companies, and distributors across UAE and GCC. Fast delivery from Ajman Free Zone.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/rfq" className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-8 py-4 rounded-full transition-colors">
              Request a Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/solutions#packaging" className="inline-flex items-center border border-white/30 hover:border-white/60 text-white font-bold px-8 py-4 rounded-full transition-colors">
              View Division Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
