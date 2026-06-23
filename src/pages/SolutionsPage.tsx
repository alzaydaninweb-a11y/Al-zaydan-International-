import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Layers, ShieldCheck, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { useSEO } from '../lib/useSEO';

// ── Solutions Page Schema (Service + ItemList) ─────────────────────────────
const SOLUTIONS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Al Zaydan International Business Divisions',
  description: 'Four B2B industrial supply divisions covering packaging, signage, safety materials, and printing consumables.',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Service',
        name: 'Packaging, Adhesives & Tapes Supply UAE',
        serviceType: 'Industrial Packaging Materials Supply',
        description: 'Wholesale B2B supply of hot melt adhesive, carton adhesive, BOPP packaging tape, double-sided tissue tape, PE foam tape, acrylic foam tape, masking tape, and aluminum foil tape for industrial and commercial customers in UAE and GCC.',
        provider: { '@type': 'Organization', name: 'Al Zaydan International FZE', url: 'https://www.alzaydaninternational.com' },
        areaServed: 'AE',
        url: 'https://www.alzaydaninternational.com/solutions#packaging',
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Service',
        name: 'Signage, Display & LED Solutions Supply UAE',
        serviceType: 'Signage Materials & LED Supply',
        description: 'B2B supply of acrylic sheets, ABS engraving sheets, PVC foam board, aluminum composite panels, polycarbonate sheets, LED signage modules, LED bars, and light box lighting for sign fabricators and commercial fit-out contractors.',
        provider: { '@type': 'Organization', name: 'Al Zaydan International FZE', url: 'https://www.alzaydaninternational.com' },
        areaServed: 'AE',
        url: 'https://www.alzaydaninternational.com/solutions#signage',
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Service',
        name: 'Reflective, Safety & Industrial Materials Supply UAE',
        serviceType: 'Traffic Safety & Reflective Materials Supply',
        description: 'Wholesale supply of DOT, ECE, and SOLAS certified reflective sheeting, DOT-C2 and ECE-104 reflective tape, SOLAS tape, PTFE coated fiberglass fabric, PTFE mesh conveyor belts, and silicone coated fiberglass fabric for traffic, road safety, and industrial applications.',
        provider: { '@type': 'Organization', name: 'Al Zaydan International FZE', url: 'https://www.alzaydaninternational.com' },
        areaServed: 'AE',
        url: 'https://www.alzaydaninternational.com/solutions#safety',
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'Service',
        name: 'Printing Consumables, FMCG & Global Sourcing UAE',
        serviceType: 'Printing Consumables & B2B Procurement Support',
        description: 'B2B supply of thermal transfer ribbon, hot stamping foil, self-adhesive labels, thermal paper rolls, barcode printer consumables, barcode scanners, imported chocolates, FMCG wholesale, and global product sourcing and procurement support.',
        provider: { '@type': 'Organization', name: 'Al Zaydan International FZE', url: 'https://www.alzaydaninternational.com' },
        areaServed: 'AE',
        url: 'https://www.alzaydaninternational.com/solutions#printing',
      },
    },
  ],
};

// ─── Division Data ────────────────────────────────────────────────────────────

const DIVISIONS = [
  {
    id: 'packaging',
    icon: Package,
    color: 'bg-blue-50 text-blue-600',
    accent: 'border-blue-200',
    tag: 'Division 01',
    title: 'Packaging, Adhesives & Tapes',
    summary: 'Industrial packaging materials and adhesive solutions for manufacturing, logistics, labeling, sealing, bonding, and converting applications.',
    detail: `We supply packaging-related raw materials and adhesive solutions designed for industrial and commercial applications. Our product range supports packaging operations from raw material stage through to finished goods handling — including carton sealing, surface bonding, foam applications, and specialty tape solutions for technical industries.

Our team works with customers to identify the right adhesive and tape specification based on substrate type, application temperature, surface condition, and supply continuity requirements. Whether you are sourcing for a production line or a project-based requirement, we can match the right product to the right application.`,
    products: [
      'Hot Melt Adhesive',
      'Carton and Box Adhesive',
      'Labelling Adhesive',
      'Paper Bag Adhesive',
      'EPE Foam Adhesive',
      'Double-Sided Tissue Tape',
      'PE Foam Tape',
      'EVA Foam Tape',
      'Acrylic Foam Tape',
      'Masking Tape',
      'BOPP Packaging Tape',
      'Aluminum Foil Tape',
    ],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'signage',
    icon: Layers,
    color: 'bg-violet-50 text-violet-600',
    accent: 'border-violet-200',
    tag: 'Division 02',
    title: 'Signage, Display & LED Solutions',
    summary: 'Sheet materials, fabrication products, and LED lighting for sign makers, fabricators, advertisers, and project-based visual communication.',
    detail: `We support signage, display, and branding requirements through a practical range of sheet materials, structural fabrication products, and LED-based lighting solutions. Our supply scope covers the full material chain required by sign fabricators, visual communication companies, advertising agencies, and commercial fit-out contractors.

From structural substrate sheets like ABS and aluminum composite panels to illumination components including LED modules, drivers, and light box systems — we provide a single-source supply option that reduces procurement complexity for fabricators operating across multiple project types.`,
    products: [
      'Acrylic Sheet',
      'ABS Double Color Engraving Sheet',
      'PVC Foam Board',
      'Aluminum Composite Panel',
      'Polycarbonate Sheet',
      'PETG Sheet',
      'PP Corrugated Sheet',
      'Rigid PVC Sheet',
      'HIPS Sheet',
      'LED Signage Modules',
      'LED Bars',
      'LED Drivers',
      'Light Box Lighting Solutions',
    ],
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'safety',
    icon: ShieldCheck,
    color: 'bg-amber-50 text-amber-600',
    accent: 'border-amber-200',
    tag: 'Division 03',
    title: 'Reflective, Safety & Industrial Materials',
    summary: 'Reflective sheeting, safety tapes, PTFE-coated materials, and industrial fabrics for traffic, safety, and technical performance applications.',
    detail: `We supply reflective, safety, and industrial coated materials for traffic applications, road signage systems, industrial technical use, and broader project support. Our product range covers certified reflective sheeting grades, specialized safety tapes, and high-performance PTFE and silicone coated materials used in industrial processing and architectural applications.

These products are sourced to meet recognized international standards including DOT, ECE, and SOLAS specifications. Our team supports customers in selecting the appropriate grade, specification, and certification level based on their regulatory and application requirements — whether for road safety infrastructure, vehicle marking, or technical industrial use.`,
    products: [
      'Reflective Sheeting',
      'Diamond Grade Reflective Sheeting',
      'High Intensity Prismatic Reflective Sheeting',
      'Type II Reflective Sheeting',
      'DOT-C2 Reflective Tape',
      'ECE-104 Reflective Tape',
      'SOLAS Reflective Tape',
      'Rear Reflective Marking Plates',
      'PTFE Coated Fiberglass Fabric',
      'PTFE Mesh Conveyor Belt',
      'PTFE Adhesive Tape',
      'PTFE Seamless Belt',
      'Silicone Coated Fiberglass Fabric',
      'PTFE Architectural Membrane',
    ],
    image: 'https://images.unsplash.com/photo-1579738019623-a80d5d4d38f2?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'printing',
    icon: Printer,
    color: 'bg-emerald-50 text-emerald-600',
    accent: 'border-emerald-200',
    tag: 'Division 04',
    title: 'Printing Consumables, FMCG & Global Sourcing',
    summary: 'Barcode and labeling consumables, selected FMCG lines, and comprehensive global sourcing and procurement support for B2B customers.',
    detail: `Our fourth division combines three commercially related supply areas: printing and identification consumables for labeling operations, selected FMCG product lines including imported chocolates and confectionery for wholesale distribution, and a broader global sourcing and procurement service.

The sourcing capability is available to clients requiring products outside our standard portfolio — we help identify suitable suppliers, coordinate procurement, and support import and export processes for specific product requirements. This makes Al Zaydan International a practical single point of contact for businesses with diverse and evolving supply needs.`,
    products: [
      'Thermal Transfer Ribbon',
      'Hot Stamping Foil',
      'Hot Ink Roll',
      'Self-Adhesive Labels',
      'Thermal Paper Rolls',
      'Barcode Printer Consumables',
      'Barcode Scanners',
      'Imported Chocolates',
      'Confectionery Products',
      'Selected FMCG Supply',
      'Wholesale Distribution Support',
      'Product Sourcing & Supplier Coordination',
      'Import and Export Support',
    ],
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=800',
  },
];

// ─── Accordion Division Card ──────────────────────────────────────────────────

function DivisionCard({ div, index }: { div: typeof DIVISIONS[0]; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const Icon = div.icon;

  return (
    <div className={`rounded-2xl border bg-white overflow-hidden transition-all ${open ? div.accent : 'border-slate-100'}`}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-5 p-6 md:p-8 text-left hover:bg-slate-50 transition-colors"
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${div.color.split(' ')[0]} ${div.color.split(' ')[1]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{div.tag}</div>
          <h3 className="text-lg font-extrabold text-slate-900 leading-tight">{div.title}</h3>
          <p className="text-slate-500 text-sm mt-1 line-clamp-1">{div.summary}</p>
        </div>
        <div className="shrink-0 text-slate-400">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="px-6 md:px-8 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description */}
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-3">Overview</div>
            {div.detail.split('\n\n').map((para, i) => (
              <p key={i} className="text-slate-600 text-sm leading-relaxed mb-3">{para}</p>
            ))}
          </div>
          {/* Products */}
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-3">Products Include</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {div.products.map(p => (
                <div key={p} className="flex items-center gap-2 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SolutionsPage() {
  useSEO({
    title: 'Industrial Supply Divisions UAE | Al Zaydan International',
    // 60 chars ↑
    description: '4 B2B supply divisions: packaging & adhesives, LED signage, reflective safety materials, and printing consumables. UAE Free Zone supplier. Request a wholesale quote today.',
    // 170 chars — needs trim: let\'s cut
    canonical: 'https://www.alzaydaninternational.com/solutions',
    ogImage: 'https://www.alzaydaninternational.com/images/og-banner.jpg',
    schema: SOLUTIONS_SCHEMA,
  });

  return (
    <div className="bg-white">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=70&w=1600&fm=webp"
            alt="Industrial"
            className="w-full h-full object-cover"
            width="1600"
            height="500"
            fetchpriority="high"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32">
          <div className="text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-4">Our Solutions</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5 max-w-2xl">
            Four Business Divisions. One Reliable Supply Partner.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-xl mb-8">
            Al Zaydan International operates across four commercially focused product divisions — each designed to serve specific industrial, commercial, and project-based procurement needs.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            {DIVISIONS.map(d => (
              <a key={d.id} href={`#${d.id}`} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-semibold transition-colors">
                {d.tag}: {d.title.split(',')[0]}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Intro strip ─────────────────────────────────────────────────────── */}
      <section className="py-14 px-4 md:px-6 bg-amber-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { label: 'Business Scope',    value: 'Trading · Sourcing · Distribution · Procurement Support' },
            { label: 'Main Focus Areas',  value: 'Packaging · Signage · Safety · Adhesives · Industrial · FMCG' },
            { label: 'Customer Type',     value: 'Industrial · Commercial · Project-Based B2B' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">{label}</p>
              <p className="text-sm font-semibold text-slate-800 leading-snug">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divisions ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-amber-500 text-[11px] font-bold uppercase tracking-widest mb-3">What We Supply</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Our Business Divisions</h2>
            <p className="text-slate-500 text-sm mt-3 max-w-lg mx-auto">
              Click any division to explore products and application details.
            </p>
          </div>

          <div className="space-y-4">
            {DIVISIONS.map((div, i) => (
              <div key={div.id} id={div.id}>
                <DivisionCard div={div} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Global Sourcing callout ──────────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-4">Global Sourcing & Procurement</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Can't Find What You Need?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Beyond our standard product portfolio, Al Zaydan International provides global sourcing and procurement support for customers requiring specific products not currently in our range.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              We help identify suitable products and coordinate sourcing based on technical, commercial, and market needs — handling supplier coordination, procurement logistics, and import/export support end-to-end.
            </p>
            <ul className="grid grid-cols-2 gap-3 mb-8">
              {['Product sourcing','Supplier coordination','Procurement support','Trading assistance','Import & export support','Market-oriented product search'].map(item => (
                <li key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <a href="mailto:info@alzaydan.com" className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-7 py-3.5 rounded-full transition-colors">
              Send a Sourcing Request <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-72 lg:h-full min-h-[280px]">
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8ed7c80a30?auto=format&fit=crop&q=80&w=800"
              alt="Global Sourcing"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <p className="text-white font-extrabold text-2xl mb-2">Global Sourcing</p>
              <p className="text-slate-300 text-sm">We find it. You focus on your business.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-6 border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Ready to Discuss Your Requirements?</h2>
          <p className="text-slate-500 text-sm mb-7">
            Reach out to explore how our four divisions can support your procurement needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/industries" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-7 py-3.5 rounded-full transition-colors text-sm">
              Industries We Serve <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="mailto:info@alzaydan.com" className="inline-flex items-center border border-slate-300 hover:border-slate-500 text-slate-700 font-bold px-7 py-3.5 rounded-full transition-colors text-sm">
              Contact Us
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
