import React from 'react';
import {
  Package, Globe2, Handshake, TrendingUp,
  ShieldCheck, Truck, Users, Quote,
  Target, Eye, Heart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '../lib/useSEO';

const ABOUT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Al Zaydan International FZE',
  url: 'https://www.alzaydaninternational.com/about',
  description: 'Al Zaydan International FZE is a UAE Free Zone B2B trading, sourcing, and distribution company serving industrial, construction, and commercial buyers across the Gulf region.',
  mainEntity: {
    '@type': 'Organization',
    '@id': 'https://www.alzaydaninternational.com/#organization',
    name: 'Al Zaydan International FZE',
    alternateName: 'Al Zaydan International',
    url: 'https://www.alzaydaninternational.com',
    foundingLocation: 'Ajman Free Zone, UAE',
    telephone: '+971-55-155-1329',
    email: 'info@alzaydanintl.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ajman Free Zone, C1 Building',
      addressLocality: 'Ajman',
      addressRegion: 'Ajman',
      addressCountry: 'AE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.4111,
      longitude: 55.4353,
    },
    founder: {
      '@type': 'Person',
      name: 'Shabas Zakkariya',
      jobTitle: 'Founder & Director',
    },
    areaServed: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'],
    knowsAbout: [
      'Industrial Materials',
      'Traffic Safety Equipment',
      'B2B Sourcing',
      'Road Safety Products',
      'Packaging Materials',
      'Reflective Sheeting',
      'LED Signage Solutions',
      'Construction Supplies',
      'Adhesive Tapes',
      'PTFE Coated Materials',
    ],
    sameAs: [
      'https://www.linkedin.com/company/alzaydan-international',
    ],
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '10+', label: 'Years in Operation' },
  { value: 'UAE', label: 'Free Zone Established' },
  { value: 'B2B', label: 'Focused Business Model' },
  { value: '500+', label: 'Product Lines' },
];

const CORE_VALUES = [
  {
    icon: ShieldCheck,
    title: 'Reliability',
    desc: 'Dependable support and consistent business conduct in every transaction and customer relationship.',
  },
  {
    icon: Handshake,
    title: 'Flexibility',
    desc: 'Support across multiple sectors and product categories, adapting to the specific needs of each client.',
  },
  {
    icon: Users,
    title: 'Customer Focus',
    desc: 'Commitment to suitable and value-driven solutions that address real commercial requirements.',
  },
  {
    icon: TrendingUp,
    title: 'Practicality',
    desc: 'Solutions based on real commercial needs, not theoretical offerings — every recommendation is grounded in application reality.',
  },
  {
    icon: Eye,
    title: 'Integrity',
    desc: 'Transparent and professional business approach with honest communication at every stage of the supply process.',
  },
  {
    icon: Heart,
    title: 'Performance',
    desc: 'Building long-term relationships based on trust, value, and consistent delivery that clients can depend on.',
  },
];

const PILLARS = [
  {
    icon: Package,
    title: 'Broad Product Range',
    desc: 'From packaging raw materials and adhesive tapes to LED signage, traffic safety products, and FMCG — our portfolio covers the diverse needs of industrial and commercial buyers.',
  },
  {
    icon: Globe2,
    title: 'UAE-Based Supply Network',
    desc: 'Operating out of a UAE Free Zone, we are positioned at the heart of regional trade, enabling fast and cost-effective distribution across the Gulf and beyond.',
  },
  {
    icon: Truck,
    title: 'Efficient Distribution',
    desc: 'From single-line orders to full container loads, we manage logistics efficiently — with volume-based pricing available for businesses scaling their procurement.',
  },
  {
    icon: Users,
    title: 'Dedicated B2B Support',
    desc: 'Every client relationship is managed with a practical understanding of their needs, providing direct and responsive support without unnecessary complexity.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  useSEO({
    title: 'About Al Zaydan International | UAE B2B Supplier',
    description: 'Learn about Al Zaydan International FZE — an Ajman Free Zone company supplying industrial, safety and packaging materials across the UAE and GCC since establishment.',
    ogImage: 'https://www.alzaydaninternational.com/images/og-banner.jpg',
    schema: ABOUT_SCHEMA,
  });

  return (
    <div className="bg-white">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8ed7c80a30?auto=format&fit=crop&q=70&w=1600&fm=webp"
            alt="Warehouse"
            className="w-full h-full object-cover"
            width="1600"
            height="500"
            fetchpriority="high"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-36">
          <div className="text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-4">About Us</div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 max-w-2xl">
            Connecting the Right Products to the Right Markets
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-xl mb-8">
            Al Zaydan International FZE — UAE-based B2B trading, sourcing, and distribution built on reliability, flexibility, and practical supply solutions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/solutions" className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-6 py-3 rounded-full transition-colors text-sm">
              Our Solutions
            </Link>
            <Link to="/industries" className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-bold px-6 py-3 rounded-full transition-colors text-sm">
              Industries We Serve
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────────────────── */}
      <section className="border-b border-amber-100 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-amber-100">
            {STATS.map(({ value, label }) => (
              <div key={label} className="py-8 px-6 text-center">
                <div className="text-3xl font-extrabold text-slate-900 mb-1">{value}</div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who We Are ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="text-amber-500 text-[11px] font-bold uppercase tracking-widest mb-4">Who We Are</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-8">
              Al Zaydan International FZE
            </h2>
            <div className="space-y-5 text-slate-600 leading-relaxed text-[15px]">
              <p>
                Al Zaydan International FZE is a UAE-based trading, sourcing, and distribution company serving B2B customers across multiple industries. Established and operating out of a UAE Free Zone, we provide practical and commercially focused supply solutions that help businesses procure the right products at competitive value.
              </p>
              <p>
                Our product portfolio spans packaging raw materials, signage and display materials, reflective and traffic safety equipment, adhesive tapes, silicone sealants, LED signage solutions, industrial coated materials, printing consumables, and selected FMCG product lines. This breadth allows us to serve a wide range of sectors — from construction and logistics to retail and manufacturing — through a single, dependable supply partner.
              </p>
              <p>
                Our business is built on sourcing flexibility, dependable support, and a practical understanding of customer requirements. We work to connect the right products with the right applications, while supporting businesses with efficient procurement coordination and streamlined supply management. Whether you are a contractor, distributor, or facility manager, our goal is to remove friction from your procurement process.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Business Model', value: 'B2B Trading, Sourcing & Distribution' },
                { label: 'Coverage',       value: 'Packaging, Signage, Safety, Industrial & FMCG' },
                { label: 'Strength',       value: 'Product Matching & Procurement Coordination' },
                { label: 'Market Focus',   value: 'UAE-Based Supply Support' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
              <h3 className="text-base font-extrabold text-slate-900 mb-2">What We Do Best</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Connect the right products, suppliers, and commercial solutions for industrial, project, and wholesale requirements. Our strength lies in identifying practical supply opportunities and executing procurement with clarity and reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Chairman's Message ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-6 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <Quote className="w-12 h-12 text-amber-400 mx-auto mb-8 opacity-60" />
          <div className="text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-6">Chairman's Message</div>
          <blockquote className="space-y-5 text-slate-300 text-lg leading-relaxed mb-10">
            <p>
              "At Al Zaydan International FZE, we believe strong business growth begins with dependable sourcing, practical supply support, and long-term relationships built on trust."
            </p>
            <p className="text-slate-400 text-base">
              Our goal is to support customers with commercially relevant products, reliable coordination, and flexible sourcing solutions across multiple sectors. In today's market, businesses need more than supply alone — they need a partner who understands application, urgency, product suitability, and commercial value.
            </p>
            <p className="text-slate-400 text-base">
              Through our diversified business approach, we serve customers across packaging, signage, traffic safety, adhesive systems, industrial materials, LED solutions, printing consumables, and FMCG categories. We remain committed to building Al Zaydan International FZE as a trusted business partner for sourcing, trading, and distribution solutions in the UAE and beyond.
            </p>
          </blockquote>
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-0.5 bg-amber-400 mb-4" />
            <p className="font-extrabold text-white text-lg">Shabas Zakkariya</p>
            <p className="text-slate-400 text-sm">Founder & Director — Al Zaydan International FZE</p>
          </div>
        </div>
      </section>

      {/* ── Vision & Mission ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-amber-500 text-[11px] font-bold uppercase tracking-widest mb-3">Our Direction</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Vision, Mission & Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Vision */}
            <div className="bg-slate-900 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-slate-900" />
                </div>
                <h3 className="text-xl font-extrabold">Our Vision</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">
                To become a trusted UAE-based name in global sourcing, trading, and distribution by delivering reliable and practical supply solutions across diverse industries — establishing Al Zaydan International as a first-choice partner for B2B procurement in the region and beyond.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-amber-400 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Our Mission</h3>
              </div>
              <p className="text-slate-800 leading-relaxed">
                To support customers with commercially viable products, dependable sourcing, and efficient supply coordination while building long-term business relationships based on trust, value, and performance. We aim to be the supply partner that clients rely on — not just for products, but for market knowledge and practical solutions.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-8 text-center">Core Values</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CORE_VALUES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:border-amber-200 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 mb-2">{title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Us pillars ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-amber-500 text-[11px] font-bold uppercase tracking-widest mb-3">Our Approach</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Why Businesses Choose Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-100 p-7 hover:border-amber-200 hover:shadow-md transition-all">
                <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-extrabold text-slate-900 mb-2 text-[15px]">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Ready to Work With Us?</h2>
          <p className="text-slate-500 text-base mb-8 leading-relaxed">
            Whether you need a recurring supply arrangement or a one-time sourcing solution, our team is ready to support your requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/solutions" className="inline-flex items-center bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-8 py-4 rounded-full transition-colors">
              Explore Our Solutions
            </Link>
            <a href="mailto:info@alzaydan.com" className="inline-flex items-center border border-slate-300 hover:border-slate-500 text-slate-700 font-bold px-8 py-4 rounded-full transition-colors">
              Get in Touch
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
