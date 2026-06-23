import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Shield, Award, Globe, Lock, Headphones, ChevronLeft,
  Database, FlaskConical, Atom, Home as HomeIcon, Settings, Cpu, Package, Scissors, Factory, Menu, AlertCircle
} from 'lucide-react';
import { useStore, Product } from '../context/StoreContext';
import { generateSlug } from '../lib/blogService';
import ProductSection from '../components/home/ProductSection';
import ProductCard from '../components/ui/ProductCard';
import QuickSearchPills from '../components/home/QuickSearchPills';

import ProcurementSupport from '../components/home/ProcurementSupport';
import { useSEO } from '../lib/useSEO';

const HOME_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [

    // ── 1. Organization + LocalBusiness ──────────────────────────────────────
    {
      '@type': ['Organization', 'LocalBusiness'],
      '@id': 'https://www.alzaydaninternational.com/#organization',
      name: 'Al Zaydan International FZE',
      alternateName: 'Al Zaydan International',
      url: 'https://www.alzaydaninternational.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.alzaydaninternational.com/android-chrome-512x512.png',
        width: 512,
        height: 512,
      },
      image: 'https://www.alzaydaninternational.com/android-chrome-512x512.png',
      description: 'UAE-based B2B industrial materials sourcing, trading, and distribution company specialising in traffic safety equipment, road safety products, packaging materials, industrial tools, and construction supplies across the GCC.',
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
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00',
        },
      ],
      priceRange: '$$',
      currenciesAccepted: 'AED, USD',
      paymentAccepted: 'Bank Transfer, Credit Card',
      areaServed: [
        { '@type': 'Country', name: 'United Arab Emirates' },
        { '@type': 'Country', name: 'Saudi Arabia' },
        { '@type': 'Country', name: 'Qatar' },
        { '@type': 'Country', name: 'Kuwait' },
        { '@type': 'Country', name: 'Bahrain' },
        { '@type': 'Country', name: 'Oman' },
      ],
      knowsAbout: [
        'Traffic Safety Equipment',
        'Road Safety Products',
        'Reflective Sheeting',
        'Packaging Materials',
        'Industrial Tools',
        'Construction Supplies',
        'B2B Industrial Sourcing',
        'LED Signage Solutions',
        'Adhesive Tapes',
        'PTFE Coated Materials',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'B2B Industrial Materials Catalog',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Traffic Safety Equipment' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Reflective Sheeting' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Packaging Materials & Adhesive Tapes' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'LED Signage Solutions' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'PTFE Coated Industrial Fabrics' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Printing Consumables' } },
        ],
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'sales',
          telephone: '+971-55-155-1329',
          email: 'info@alzaydanintl.com',
          availableLanguage: ['English', 'Arabic'],
        },
      ],
      sameAs: [
        'https://www.linkedin.com/company/alzaydan-international',
      ],
    },

    // ── 2. WebSite with Sitelinks Searchbox ──────────────────────────────────
    {
      '@type': 'WebSite',
      '@id': 'https://www.alzaydaninternational.com/#website',
      url: 'https://www.alzaydaninternational.com',
      name: 'Al Zaydan International',
      description: 'UAE B2B Industrial Materials Sourcing & Distribution',
      publisher: { '@id': 'https://www.alzaydaninternational.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.alzaydaninternational.com/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },

    // ── 3. FAQPage ────────────────────────────────────────────────────────────
    {
      '@type': 'FAQPage',
      '@id': 'https://www.alzaydaninternational.com/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Where can I buy traffic safety equipment in UAE?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Al Zaydan International FZE supplies traffic safety equipment across the UAE from our Ajman Free Zone facility. We serve B2B clients in Dubai, Abu Dhabi, Sharjah, Ajman, and across the GCC. Contact us for bulk pricing and delivery.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do you supply road safety products in bulk to GCC countries?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. We are a B2B wholesale supplier of road safety products, reflective sheeting (DOT, ECE, SOLAS certified), and industrial materials for bulk orders across UAE, Saudi Arabia, Qatar, Kuwait, Oman, and Bahrain. Request a quote via our RFQ form.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the minimum order quantity (MOQ) for industrial supplies?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Minimum order quantities vary by product category. We cater to B2B procurement at all scales. Submit a Request for Quote (RFQ) on our website and our sales team will respond with a tailored quote within 24 hours.',
          },
        },
        {
          '@type': 'Question',
          name: 'What types of reflective sheeting do you supply?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We supply Diamond Grade, High Intensity Prismatic, Type II reflective sheeting, DOT-C2 reflective tape, ECE-104 reflective tape, SOLAS reflective tape, and rear reflective marking plates — all meeting international road safety standards.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do you offer packaging materials and adhesive tape supply in UAE?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Al Zaydan International supplies a full range of industrial packaging materials including hot melt adhesive, BOPP packaging tape, double-sided tissue tape, PE foam tape, acrylic foam tape, masking tape, and aluminum foil tape for B2B customers across the UAE and GCC.',
          },
        },
      ],
    },

  ],
};



/* ─── Hero slides (fallback defaults when no admin slides set) ────────────── */
const DEFAULT_HERO_SLIDES = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1565793979411-4f4e9bdbf7f1?q=70&w=1600&auto=format&fit=crop&fm=webp',
    title1: 'Global Materials.',
    title2: 'Reliable Suppliers.',
    title3: 'Endless Opportunities.',
    sub: 'Source quality materials from verified suppliers worldwide and grow your business with confidence.',
    cta1Label: 'Start Sourcing', cta1To: '/search',
    cta2Label: 'Become a Supplier', cta2To: '/contact',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=70&w=1600&auto=format&fit=crop&fm=webp',
    title1: 'Industrial Tools.',
    title2: 'Safety Equipment.',
    title3: 'Delivered Fast.',
    sub: 'Premium safety gear and industrial tools sourced from certified suppliers across the UAE and beyond.',
    cta1Label: 'Browse Products', cta1To: '/search',
    cta2Label: 'Request Quote', cta2To: '/rfq',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=70&w=1600&auto=format&fit=crop&fm=webp',
    title1: 'Premium Packaging.',
    title2: 'Bulk Supply.',
    title3: 'Custom Solutions.',
    sub: 'Get wholesale quotes on packaging materials, adhesive tapes, and industrial supplies in bulk.',
    cta1Label: 'Start Sourcing', cta1To: '/search',
    cta2Label: 'Request Quote', cta2To: '/rfq',
  },
];

/* ─── Trust badges ─────────────────────────────────────────────────────────── */
const TRUST_ITEMS = [
  { icon: Shield, label: 'Verified Suppliers', sub: 'Strict verification for quality assurance' },
  { icon: Award, label: 'Quality Assurance', sub: 'Product quality protection you can trust' },
  { icon: Globe, label: 'Global Shipping', sub: 'Fast & reliable logistics worldwide' },
  { icon: Lock, label: 'Secure Payment', sub: 'Multiple secure payment options' },
  { icon: Headphones, label: '24/7 Support', sub: 'Dedicated support whenever you need it' },
];

/* ─── Category Helpers ─────────────────────────────────────────────────────── */
const getCategoryIcon = (name: string) => {
  const map: Record<string, React.ComponentType<any>> = {
    'Traffic Safety': Shield,
    'Safety Gear': Award,
    'Lighting & Beacons': Globe,
    'Reflectors & Signage': Lock,
    'Barriers': Headphones,
    'Industrial Tools': Settings,
    'Road Studs': Database,
    'Bulk Offers': Package,
  };
  return map[name] || Factory;
};

const getCategoryImage = (categoryName: string, products: Product[], categoryImages: Record<string, string>) => {
  if (categoryImages[categoryName]) return categoryImages[categoryName];

  // Try to find the first product in the category
  const prod = products.find(p => p.category === categoryName);
  if (prod && prod.image) return prod.image;
  
  // High-quality fallback images if no products are found in this category
  const fallbacks: Record<string, string> = {
    'Traffic Safety': 'https://images.unsplash.com/photo-1541888081198-a0e2dc113ea4?q=80&w=400&auto=format&fit=crop',
    'Safety Gear': 'https://images.unsplash.com/photo-1582136005230-05e81d7d0a2b?q=80&w=400&auto=format&fit=crop',
    'Road Studs': 'https://images.unsplash.com/photo-1584844308364-a690e03eaff1?q=80&w=400&auto=format&fit=crop',
    'Barriers': 'https://images.unsplash.com/photo-1579762593175-20226054cad0?q=80&w=400&auto=format&fit=crop',
    'Reflectors & Signage': 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?q=80&w=400&auto=format&fit=crop',
    'Lighting & Beacons': 'https://images.unsplash.com/photo-1513826308963-f6ecb473cddb?q=80&w=400&auto=format&fit=crop',
    'Industrial Tools': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=400&auto=format&fit=crop',
    'Bulk Offers': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop',
  };
  return fallbacks[categoryName] || 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=400&auto=format&fit=crop';
};

const getCategorySub = (categoryName: string, products: Product[]) => {
  const count = products.filter(p => p.category === categoryName).length;
  const countStr = `${count} product${count !== 1 ? 's' : ''}`;
  const descriptions: Record<string, string> = {
    'Traffic Safety': 'Cones, lights & signs',
    'Safety Gear': 'Helmets, vests & gear',
    'Lighting & Beacons': 'Strobes & warning bars',
    'Reflectors & Signage': 'High-vis plates & tape',
    'Barriers': 'Stanchions & fences',
    'Industrial Tools': 'Drills, wrenches & cogs',
    'Road Studs': 'Markers & cats eyes',
    'Bulk Offers': 'Wholesale packages',
  };
  return `${descriptions[categoryName] || 'Industrial supplies'} • ${countStr}`;
};

export default function Home() {
  const { products, categories, settings, categoryImages, categoryDetails } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);

  useSEO({
    title: 'Industrial Supplies, Traffic Safety & Reflective Materials Supplier UAE | Al Zaydan International',
    description: 'Leading UAE B2B supplier of industrial supplies, traffic safety equipment, reflective materials, and packaging solutions in Dubai, Ajman, and across the GCC.',
    canonical: 'https://www.alzaydaninternational.com/',
    ogImage: 'https://www.alzaydaninternational.com/images/og-banner.jpg',
    ogType: 'website',
    schema: HOME_SCHEMA,
  });

  const activeCategories = useMemo(() => {
    return categories.filter(catName => products.some(p => p.category === catName));
  }, [categories, products]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll loop
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || activeCategories.length === 0) return;


    const interval = setInterval(() => {
      if (isPaused) return;

      const card = container.firstElementChild as HTMLElement;
      if (!card) return;

      const cardWidth = card.offsetWidth + 16; // width + gap
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScrollLeft - 10) {
        // Go back to beginning smoothly
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll right by one card
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 4000); // scroll every 4 seconds

    return () => clearInterval(interval);
  }, [isPaused, activeCategories]);


  useEffect(() => {
    const slides = (settings?.heroSlides && settings.heroSlides.length > 0)
      ? settings.heroSlides
      : DEFAULT_HERO_SLIDES;
    const t = setInterval(() => {
      setActiveSlide(s => (s + 1) % slides.length);
    }, 6000);
    return () => clearInterval(t);
  }, [settings?.heroSlides]);

  const handleNextSlide = () => {
    const slides = (settings?.heroSlides && settings.heroSlides.length > 0)
      ? settings.heroSlides : DEFAULT_HERO_SLIDES;
    setActiveSlide(s => (s + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    const slides = (settings?.heroSlides && settings.heroSlides.length > 0)
      ? settings.heroSlides : DEFAULT_HERO_SLIDES;
    setActiveSlide(s => (s - 1 + slides.length) % slides.length);
  };

  const handleScrollNext = () => {
    const container = scrollRef.current;
    if (container) {
      const card = container.firstElementChild as HTMLElement;
      const cardWidth = card ? card.offsetWidth + 16 : 180;
      container.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  const handleScrollPrev = () => {
    const container = scrollRef.current;
    if (container) {
      const card = container.firstElementChild as HTMLElement;
      const cardWidth = card ? card.offsetWidth + 16 : 180;
      container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const [isFeaturedPaused, setIsFeaturedPaused] = useState(false);

  // Auto-scroll loop for featured products slider
  useEffect(() => {
    const container = featuredScrollRef.current;
    const featuredListCount = products.filter(p => p.featured).length;
    if (!container || featuredListCount === 0) return;

    const interval = setInterval(() => {
      if (isFeaturedPaused) return;

      const card = container.firstElementChild as HTMLElement;
      if (!card) return;

      const cardWidth = card.offsetWidth + 16;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScrollLeft - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isFeaturedPaused, products]);

  const handleFeaturedScrollNext = () => {
    const container = featuredScrollRef.current;
    if (container) {
      const card = container.firstElementChild as HTMLElement;
      const cardWidth = card ? card.offsetWidth + 16 : 220;
      container.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  const handleFeaturedScrollPrev = () => {
    const container = featuredScrollRef.current;
    if (container) {
      const card = container.firstElementChild as HTMLElement;
      const cardWidth = card ? card.offsetWidth + 16 : 220;
      container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-[#f5f7fa] font-sans">
      
      {/* ─── SECTION 1: HERO FULL-BLEED SLIDER ─── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex gap-6">

          {/* Categories Sidebar (Desktop only) */}
          <div className="hidden lg:block w-[240px] xl:w-[260px] border border-gray-200 rounded-lg overflow-hidden shrink-0 h-[420px] bg-white">
            <div className="flex flex-col h-full justify-between py-2">
              {activeCategories.slice(0, 9).map(catName => {
                const IconComponent = getCategoryIcon(catName);
                return (
                  <Link
                    key={catName}
                    to={`/category/${categoryDetails?.[catName]?.slug || generateSlug(catName)}`}
                    className="flex items-center justify-between px-4 py-2 text-[13px] text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-semibold"
                  >
                    <span className="flex items-center gap-3">
                      <IconComponent className="w-4 h-4 text-gray-400" />
                      <span className="truncate max-w-[150px]">{catName}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </Link>
                );
              })}
              <Link
                to="/search"
                className="flex items-center justify-between px-4 py-2.5 text-[13px] text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors font-bold border-t border-gray-100 mt-1"
              >
                <span className="flex items-center gap-3">
                  <Menu className="w-4 h-4 text-gray-400" />
                  <span>All Categories</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Hero Slider — full-bleed background image */}
          {(() => {
            // Always fall back to default slides — never show an empty hero
            const slides = (settings?.heroSlides && settings.heroSlides.length > 0)
              ? settings.heroSlides
              : DEFAULT_HERO_SLIDES;
            const slide = slides[activeSlide % slides.length];
            return (
              <div className="flex-grow relative rounded-xl overflow-hidden h-[420px]">
                {/* Background images — preloaded stack, only active one visible */}
                {slides.map((s, idx) => (
                  <img
                    key={s.id}
                    src={s.imageUrl}
                    alt={s.title1 || 'B2B Industrial Supplies Sourcing UAE'}
                    title={s.title1 || 'B2B Industrial Supplies Sourcing UAE'}
                    width="1600"
                    height="420"
                    fetchpriority={idx === 0 ? "high" : "auto"}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === activeSlide % slides.length ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))}

                {/* Dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />

                {/* Text content */}
                <div className="relative z-10 flex flex-col justify-center h-full px-8 sm:px-14 py-10 max-w-[620px]">
                  <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-white leading-tight mb-3 drop-shadow">
                    {slide.title1 && <>{slide.title1}<br /></>}
                    {slide.title2 && <>{slide.title2}<br /></>}
                    {slide.title3 && <span className="text-blue-300">{slide.title3}</span>}
                  </h2>
                  {slide.sub && (
                    <p className="text-[13.5px] sm:text-[14px] text-white/80 mb-6 max-w-[480px] leading-relaxed">
                      {slide.sub}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <Link
                      to={slide.cta1To || '/search'}
                      className="px-5 py-2.5 bg-[#0052d9] hover:bg-blue-500 text-white text-[13px] font-semibold rounded-md shadow-lg transition-all"
                    >
                      {slide.cta1Label || 'Start Sourcing'}
                    </Link>
                    <Link
                      to={slide.cta2To || '/contact'}
                      className="px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-semibold rounded-md border border-white/30 transition-all text-[13px]"
                    >
                      {slide.cta2Label || 'Become a Supplier'}
                    </Link>
                  </div>

                  {/* Slide Indicators */}
                  <div className="flex items-center gap-2 mt-8">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlide(idx)}
                        className={`h-1.5 rounded-full transition-all ${idx === activeSlide % slides.length ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                      />
                    ))}
                  </div>
                </div>

              </div>
            );
          })()}

        </div>
      </section>


      {/* ─── QUICK SEARCH PILLS ─── */}
      <QuickSearchPills />

      {/* ─── SECTION 2: TRUST BADGES BAR ─── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-4 sm:py-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-2">
            {TRUST_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-3 px-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 leading-tight">{item.label}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* ─── SECTION 3: POPULAR CATEGORIES (Auto-scrolling and manual scroll, images cover cards) ─── */}
      <section className="py-8 sm:py-12 bg-[#f8fafc]">
        <div className="max-w-[1400px] mx-auto px-6">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900">Popular Categories</h2>
            <div className="flex items-center gap-4">
              <Link
                to="/search"
                className="flex items-center gap-1 text-[13px] text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                <span>View all categories</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              
              {/* Manual scrolling button triggers (only visible on desktop) */}
              <div className="hidden lg:flex items-center gap-1.5">
                <button
                  onClick={handleScrollPrev}
                  className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={handleScrollNext}
                  className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 transition-colors"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            {activeCategories.length === 0 ? (
              <div className="flex items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl text-gray-500 text-sm">
                <AlertCircle className="w-4.5 h-4.5 text-gray-400" />
                <span>No categories available in the database. Add categories in admin panel to display them here.</span>
              </div>
            ) : (
              /* Horizontally scrollable flex container. Hidden scrollbar. Auto-scroll with pause on hover/touch. */
              <div
                ref={scrollRef}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
                className="flex overflow-x-auto gap-4 py-2 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory"
              >
                {activeCategories.map(catName => {

                  const image = getCategoryImage(catName, products, categoryImages);
                  const subText = getCategorySub(catName, products);
                  return (
                    <Link
                      key={catName}
                      to={`/category/${categoryDetails?.[catName]?.slug || generateSlug(catName)}`}
                      className="group flex flex-col focus:outline-none w-[42%] sm:w-[22%] lg:w-[11.6%] min-w-[140px] sm:min-w-[160px] flex-shrink-0 snap-start"
                    >
                      {/* Top Box: aspect-square keeps all boxes mathematically the same size, image covers entire box */}
                      <div className="w-full aspect-square bg-[#f4f6f8] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                        <img
                          src={image}
                          alt={`${catName} Products UAE | B2B Industrial Supply`}
                          title={`${catName} Products UAE | B2B Industrial Supply`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {/* Bottom Text: Borderless, simple left-aligned */}
                      <div className="mt-3 px-1">
                        <h3 className="text-[13px] font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors truncate">
                          {catName}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-1 leading-snug truncate">
                          {subText}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ─── SECTION 4: TRUSTED BY BUSINESSES (Dynamic, auto-scrolling horizontal marquee) ─── */}
      {settings?.trustedBrands && settings.trustedBrands.length > 0 && (
        <section className="bg-white border-t border-gray-200 py-8 overflow-hidden">
          <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-infinite {
            display: flex;
            width: max-content;
            animation: marquee 25s linear infinite;
          }
          .animate-marquee-infinite:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              Trusted by businesses worldwide
            </span>
            <div className="w-full overflow-hidden relative py-2">
              <div className="animate-marquee-infinite gap-16 md:gap-24 items-center">
                {(() => {
                  const list = settings.trustedBrands;
                  // Duplicate array for infinite scroll effect
                  const marqueeList = [...list, ...list];
                  return marqueeList.map((brand, idx) => (
                    <div key={`${brand.id}-${idx}`} className="flex items-center shrink-0">
                      {brand.logoUrl ? (
                        <img 
                          src={brand.logoUrl} 
                          alt={brand.name} 
                          width="120"
                          height="40"
                          loading="lazy"
                          className="h-8 sm:h-10 object-contain opacity-50 hover:opacity-100 transition-opacity select-none" 
                        />
                      ) : (
                        <span className="text-gray-400 font-extrabold text-sm sm:text-base tracking-widest hover:text-gray-600 transition-colors uppercase shrink-0 select-none cursor-default">
                          {brand.name}
                        </span>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ─── SECTION 5: FEATURED PRODUCTS (Horizontal Slider of admin selected products, no category pills/filters) ─── */}
      {(() => {
        const featuredList = products.filter(p => p.featured).map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: p.price,
          mrp: p.mrp,
          discount: p.discount,
          rating: p.rating,
          reviews: p.reviews,
          image: p.image,
          category: p.category,
          inStock: p.inStock,
          badge: 'Bestseller' as const,
          specs: p.specifications?.slice(0, 3).map(s => s.value),
          priceType: p.priceType,
          priceMin: p.priceMin,
          priceMax: p.priceMax,
        }));

        if (featuredList.length === 0) return null;

        return (
          <section className="py-8 sm:py-12 bg-white border-b border-gray-200">
            <div className="max-w-[1400px] mx-auto px-6">
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[18px] sm:text-[20px] font-extrabold text-gray-900">Featured Products</h2>
                  <p className="text-[11px] sm:text-[12px] text-gray-400 mt-0.5 font-medium">Selected top-quality recommendations for your procurement needs</p>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    to="/search"
                    className="flex items-center gap-1 text-[13px] text-blue-600 font-bold hover:text-blue-700 transition-colors"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  
                  {/* Manual controls */}
                  <div className="hidden lg:flex items-center gap-1.5">
                    <button
                      onClick={handleFeaturedScrollPrev}
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 transition-colors"
                    >
                      <ChevronLeft className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={handleFeaturedScrollNext}
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 transition-colors"
                    >
                      <ChevronRight className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Slider list */}
              <div className="relative">
                <div
                  ref={featuredScrollRef}
                  onMouseEnter={() => setIsFeaturedPaused(true)}
onMouseLeave={() => setIsFeaturedPaused(false)}
                  onTouchStart={() => setIsFeaturedPaused(true)}
                  onTouchEnd={() => setIsFeaturedPaused(false)}
                  className="flex overflow-x-auto gap-4 py-2 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory items-stretch animate-fade-in"
                >
                  {featuredList.map(product => (
                    <div key={product.id} className="w-[45%] sm:w-[30%] lg:w-[18.2%] min-w-[160px] sm:min-w-[200px] flex-shrink-0 snap-start flex flex-col">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>
        );
      })()}



      {/* ─── SECTION 7: SEARCH & FIND PRODUCTS ─── */}
      <ProductSection title="Find your products" tag="all" showFilters={true} maxProducts={24} />

      {/* ─── B2B SEO CONTENT SECTION (H1 + H2s + Q&A + Copy) ─── */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 text-gray-600 text-[13.5px] leading-relaxed">
          
          {/* Main H1 Title */}
          <div className="border-b border-gray-100 pb-6 mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Industrial Supplies, Traffic Safety Equipment &amp; Reflective Materials Supplier in UAE
            </h1>
            <p className="mt-3 text-gray-500 text-[14.5px] max-w-[950px] leading-relaxed">
              Welcome to <strong>Al Zaydan International FZE</strong>, your premier Ajman-based B2B sourcing and distribution partner. Operating as a leading <strong>uae material sourcing company</strong>, we specialize in wholesale industrial materials supply across the United Arab Emirates and the GCC. We bridge the gap between global manufacturing plants and industrial buyers, providing contractors, developers, government bodies, and manufacturing businesses with certified equipment and verified solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left/Middle Columns: Main Copy */}
            <div className="lg:col-span-2 space-y-8">
              
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                  Your Trusted Partner as a UAE Material Trading Sourcing Company
                </h2>
                <p>
                  As an established <strong>uae material trading sourcing company</strong>, we help regional procurement departments, facility managers, and developers navigate the complexities of bulk materials procurement. From our strategic hub in the Ajman Free Zone, we manage quality verification, localized compliance, and distribution. We support major infrastructure networks, factories, and commercial construction projects throughout the United Arab Emirates — including active supply lines in <span className="font-semibold text-gray-800">Abu Dhabi, Dubai, Sharjah, Ajman, Al Ain, Fujairah, Ras Al Khaimah, and Umm Al Quwain</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <h3 className="text-[15px] font-bold text-gray-900">Traffic Safety Equipment UAE</h3>
                  <p>
                    We provide a comprehensive inventory of high-durability road safety assets. We source certified <Link to="/product/traffic-cone" className="text-blue-600 hover:underline">traffic cones</Link>, heavy-duty rubber speed humps, flexible delineators, solar road studs, and barricades. All of our <Link to="/category/traffic-safety" className="text-blue-600 font-semibold hover:underline">traffic safety equipment</Link> meets strict municipal specifications for roads and work zones across the GCC.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[15px] font-bold text-gray-900">Reflective Sheeting &amp; Tape UAE</h3>
                  <p>
                    We distribute premium retroreflective films for traffic signage and vehicle conspicuity. Our catalog features microprismatic technologies including Diamond Grade sheeting, High Intensity Prismatic (HIP) sheets, and vehicle marking tapes. We stock certified vehicle conspicuity truck tapes (ECE-104), marine-approved <Link to="/product/solas-grade-reflective-tape" className="text-blue-600 hover:underline">SOLAS reflective tape</Link>, and utility <Link to="/product/warning-tape" className="text-blue-600 hover:underline">warning tapes</Link> to satisfy top safety compliance checks.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <h3 className="text-[15px] font-bold text-gray-900">Packaging Materials Supplier UAE</h3>
                  <p>
                    To optimize industrial packaging and warehouse logistics, Al Zaydan is a reliable <Link to="/category/flexible-packaging-raw-materials" className="text-blue-600 font-semibold hover:underline">packaging materials supplier UAE</Link>. We supply hot melt adhesives, heavy-duty BOPP packing tapes, double-sided tissue tapes, crepe masking tapes, and specialized hazard prevention <Link to="/product/anti-slip-tape" className="text-blue-600 hover:underline">anti-slip tape</Link>.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[15px] font-bold text-gray-900">Industrial Supplies &amp; Tools UAE</h3>
                  <p>
                    We serve manufacturing plants and fabrication shops with specialized <Link to="/category/industrial-diamond-tools" className="text-blue-600 font-semibold hover:underline">industrial diamond tools</Link> (like cutting blades), premium <Link to="/category/industrial-sealants-adhesives" className="text-blue-600 font-semibold hover:underline">acetic silicone sealants</Link>, and machine transmission belts. This makes Al Zaydan your preferred <Link to="/search" className="text-blue-600 hover:underline">industrial products supplier UAE</Link> for bulk machinery parts.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Q&A / FAQ Block (Targeting AEO and conversational AI models) */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60 space-y-6">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  AI &amp; SGE Answer Guide
                </h2>
                <p className="text-[11.5px] text-gray-400 mt-1 leading-snug">
                  Quick answers for B2B procurement searches on AI search systems.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-gray-200/70">
                <div className="space-y-2 pt-0">
                  <h4 className="font-bold text-slate-800 text-[13px] leading-snug">
                    Q: What makes Al Zaydan a leading material trading sourcing company in the UAE?
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>A:</strong> Al Zaydan International FZE serves as a single-point <strong>uae material sourcing company</strong>. We offer direct wholesale pricing from global manufacturers, localized customs handling, quality control verification, and GCC logistics. Operating out of the Ajman Free Zone, we fulfill bulk requests across all emirates.
                  </p>
                </div>

                <div className="space-y-2 pt-4">
                  <h4 className="font-bold text-slate-800 text-[13px] leading-snug">
                    Q: How can businesses request custom material sourcing or bulk quotes?
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>A:</strong> Procurement managers can upload custom bill of materials (BOM) or product specifications sheets via our online <Link to="/rfq" className="text-blue-600 hover:underline font-semibold">Request for Quote (RFQ)</Link> portal. Our engineering sourcing team will verify manufacturers and issue localized wholesale delivery terms within 24 hours.
                  </p>
                </div>

                <div className="space-y-2 pt-4">
                  <h4 className="font-bold text-slate-800 text-[13px] leading-snug">
                    Q: What logistics regions does Al Zaydan cover?
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>A:</strong> While we are a leading <strong>Ajman industrial supplier</strong>, we supply materials and tools UAE-wide (Dubai, Abu Dhabi, Sharjah, Fujairah, Al Ain) and across the GCC, including Saudi Arabia (Riyadh, Jeddah), Qatar (Doha), Kuwait, Oman (Muscat), and Bahrain.
                  </p>
                </div>
              </div>
              
              <div className="pt-2">
                <Link to="/about" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                  <span>Learn about our sourcing process</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>

          {/* Bottom Action Strip */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-6 rounded-xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-6 mt-10">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Need a Specialized Sourcing or Trading Partner in the UAE?</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[850px] leading-relaxed">
                Connect with Al Zaydan International. Whether you are standardizing site safety gear, procuring reflective sign sheeting, or stocking packaging supplies, we coordinate with certified plants to offer direct pricing.
              </p>
            </div>
            <Link to="/rfq" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm shrink-0 text-center transition-colors">
              Submit Sourcing Request
            </Link>
          </div>

        </div>
      </section>

      {/* ─── SECTION 8: PROCUREMENT ASSISTANCE ─── */}
      <ProcurementSupport />

      {/* Floating WhatsApp Action Widget */}




    </div>
  );
}
