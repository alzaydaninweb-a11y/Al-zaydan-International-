import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight, Shield, Award, Globe, Lock, Headphones, ChevronLeft,
  Database, FlaskConical, Atom, Home as HomeIcon, Settings, Cpu, Package, Scissors, Factory, Menu, AlertCircle, Search, ArrowRight, Sparkles
} from 'lucide-react';
import { useStore, Product } from '../context/StoreContext';
import { generateSlug } from '../lib/blogService';
import ProductSection from '../components/home/ProductSection';
import ProductCard from '../components/ui/ProductCard';
import SmartSearchDropdown, {
  getRecentSearches, saveRecentSearch, removeRecentSearch
} from '../components/ui/SmartSearchDropdown';

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

  // Try to find the first product in the category, skipping known hotlink-blocked domains
  const prod = products.find(p => p.category === categoryName && p.image && !p.image.includes('rosmertatech.com'));
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
    'Printing Supplies': 'https://images.unsplash.com/photo-1615840287214-7fe58a8b668f?q=80&w=400&auto=format&fit=crop',
    'Industrial Sealants & Adhesives': 'https://images.unsplash.com/photo-1595206133361-b1fe343e5e23?q=80&w=400&auto=format&fit=crop',
    'Industrial Diamond Tools': 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=400&auto=format&fit=crop',
    'Lights & Lighting': 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=400&auto=format&fit=crop',
    'Home Improvement Solutions': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop',
    'Security Packaging Solutions': 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=400&auto=format&fit=crop',
    'Flexible Packaging Raw Materials': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop',
    'Flexible packaging raw materials': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop',
    'Industrial Adhesive Tapes': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=400&auto=format&fit=crop',
    'Plastic Sheet Materials': 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=400&auto=format&fit=crop',
  };
  return fallbacks[categoryName] || 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=400&auto=format&fit=crop';
};

const getCategorySub = (categoryName: string, _products: Product[]) => {
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
  return descriptions[categoryName] || 'Industrial supplies';
};

export default function Home() {
  const navigate = useNavigate();
  const { products, categories, settings, categoryImages, categoryDetails } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Hero Search State
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [debouncedHeroQuery, setDebouncedHeroQuery] = useState('');
  const [showHeroDropdown, setShowHeroDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const heroSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHeroQuery(heroSearchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [heroSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (heroSearchRef.current && !heroSearchRef.current.contains(e.target as Node)) {
        setShowHeroDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      saveRecentSearch(heroSearchQuery.trim());
      navigate(`/search?q=${encodeURIComponent(heroSearchQuery.trim())}`);
      setShowHeroDropdown(false);
    } else {
      navigate('/search');
    }
  };

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

  const topLevelCategories = useMemo(() => {
    return categories.filter(catName => !categoryDetails?.[catName]?.parentId);
  }, [categories, categoryDetails]);

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


  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);

  const heroConfig = settings?.heroConfig;
  const featuredSlides = (heroConfig?.featuredSlides && heroConfig.featuredSlides.length > 0)
    ? heroConfig.featuredSlides
    : (heroConfig?.featuredImageUrl ? [{ id: 'single-featured', imageUrl: heroConfig.featuredImageUrl, linkUrl: heroConfig?.featuredImageLink || '', altText: 'Featured Hero' }] : null);

  useEffect(() => {
    if (!featuredSlides || featuredSlides.length <= 1) return;
    const intervalTime = (heroConfig?.slideInterval || 5) * 1000;
    const timer = setInterval(() => {
      setActiveFeaturedIndex(prev => (prev + 1) % featuredSlides.length);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [featuredSlides, heroConfig?.slideInterval]);

  const defaultFeaturedCards = [
    {
      id: 'card-1',
      label: 'Top Left Floating Card',
      customBadge: '🔥 Best Seller',
      customTitle: 'Traffic Signal Warning Lights',
      customPrice: 'Wholesale Certified',
      customImageUrl: 'https://images.unsplash.com/photo-1584844308364-a690e03eaff1?q=80&w=400&auto=format&fit=crop',
      linkUrl: '/category/traffic-safety'
    },
    {
      id: 'card-2',
      label: 'Bottom Right Floating Card',
      customBadge: '⚡ UAE In Stock',
      customTitle: 'Zydex Neutral Silicone Sealant',
      customPrice: 'Direct Factory Rate',
      customImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400&auto=format&fit=crop',
      linkUrl: '/category/industrial-adhesive-tapes'
    },
  ];

  const getResolvedCard = (cardId: string, defaultDef: typeof defaultFeaturedCards[0]) => {
    const configured = (heroConfig?.featuredCards || []).find(n => n.id === cardId) ||
                       (heroConfig?.orbitNodes || []).find(n => n.id === (cardId === 'card-1' ? 'node-1' : 'node-4'));
    if (!configured) return defaultDef;
    const prod = configured.productId ? products.find(p => p.id === configured.productId) : null;
    return {
      title: configured.customTitle || prod?.name || defaultDef.customTitle,
      imageUrl: configured.customImageUrl || prod?.image || defaultDef.customImageUrl,
      badge: (configured as any).customBadge || prod?.category || defaultDef.customBadge,
      price: (configured as any).customPrice || (prod?.price ? `AED ${prod.price}` : defaultDef.customPrice),
      linkUrl: configured.linkUrl || (prod ? `/product/${prod.slug || prod.id}` : defaultDef.linkUrl),
    };
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f7fa] font-sans">
      
      {/* ─── SECTION 1: HERO (ENLARGED + AUTO-SCROLLING CATEGORIES) ─── */}
      <section className="relative bg-[#eff1f3] border-b border-slate-200/80 z-20 py-14 sm:py-20 lg:py-24 xl:py-28 overflow-hidden">
        {/* Dynamic Background Image Layer with Configured Opacity */}
        {heroConfig?.bgImageUrl && (
          <div
            className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center transition-opacity duration-700"
            style={{
              backgroundImage: `url(${heroConfig.bgImageUrl})`,
              opacity: (heroConfig.bgOpacity ?? 15) / 100,
            }}
          />
        )}

        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">

            {/* Left Column: Typography + Floating Search Bar + Auto-scrolling Categories */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center relative z-30">
              <h1 className="text-4xl sm:text-5xl lg:text-[60px] xl:text-[68px] font-black text-[#192434] tracking-tight leading-[1.08] mb-6">
                {heroConfig?.titleLine1 !== undefined ? (
                  <>
                    {heroConfig.titleLine1} <br className="hidden sm:inline" />
                    {heroConfig.titleHighlight && (
                      <span className="text-[#0052d9]">{heroConfig.titleHighlight}</span>
                    )}
                  </>
                ) : (
                  <>
                    Materials <br className="hidden sm:inline" />
                    that help you <br className="hidden sm:inline" />
                    stay <span className="text-[#0052d9]">focus</span>
                  </>
                )}
              </h1>

              <p className="text-slate-500 text-sm sm:text-base lg:text-[17px] leading-relaxed max-w-[500px] mb-9 font-medium">
                {heroConfig?.description !== undefined ? heroConfig.description : 'Direct UAE & GCC wholesale supply of certified traffic safety equipment, reflective materials, industrial adhesive tapes, and packaging supplies.'}
              </p>

              {/* Floating Pill Search Bar with Dot Grid Decoration */}
              <div className="relative inline-block w-full max-w-[580px] z-40" ref={heroSearchRef}>
                {/* Dot Matrix Decoration */}
                <div className="absolute -left-6 -bottom-6 w-28 h-28 grid grid-cols-6 gap-2.5 opacity-25 pointer-events-none -z-0">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  ))}
                </div>

                {/* Main Pill Capsule Form */}
                <form
                  onSubmit={handleHeroSearch}
                  className="relative z-10 bg-white rounded-full p-2.5 pl-6 sm:pl-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] border border-slate-100 flex items-center justify-between gap-3 transition-shadow focus-within:shadow-[0_22px_55px_-12px_rgba(0,82,217,0.18)]"
                >
                  <div className="flex flex-col flex-1 min-w-0 pr-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 select-none">
                      Search materials or categories
                    </label>
                    <input
                      type="text"
                      data-smartsearch="true"
                      value={heroSearchQuery}
                      onChange={e => {
                        setHeroSearchQuery(e.target.value);
                        setShowHeroDropdown(true);
                      }}
                      onFocus={() => setShowHeroDropdown(true)}
                      placeholder={heroConfig?.searchPlaceholder || "e.g. Reflective tape, Safety cones..."}
                      className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-normal outline-none truncate"
                      autoComplete="off"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#0052d9] hover:bg-blue-700 active:bg-blue-800 text-white px-7 sm:px-9 py-3.5 rounded-full font-bold text-sm shadow-md shadow-blue-600/20 transition-all shrink-0 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <span>{heroConfig?.buttonText || 'Get Started'}</span>
                  </button>
                </form>

                {/* Smart Search Dropdown popup */}
                {showHeroDropdown && (
                  <SmartSearchDropdown
                    query={debouncedHeroQuery}
                    products={products}
                    categories={categories}
                    focusedIndex={-1}
                    onSelectText={(text) => {
                      setHeroSearchQuery(text);
                      saveRecentSearch(text);
                      navigate(`/search?q=${encodeURIComponent(text)}`);
                      setShowHeroDropdown(false);
                    }}
                    onSelectProduct={(p) => {
                      setShowHeroDropdown(false);
                      navigate(`/product/${p.slug || p.id}`);
                    }}
                    onClose={() => setShowHeroDropdown(false)}
                    onRecentRemove={(text) => {
                      removeRecentSearch(text);
                      setRecentSearches(getRecentSearches());
                    }}
                    recentSearches={recentSearches}
                  />
                )}
              </div>

              {/* ── Auto-scrolling Horizontal All-Categories Strip ── */}
              <div className="relative mt-8 w-full max-w-[580px] overflow-hidden group">
                <div className="flex items-center gap-2.5">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] shrink-0 flex items-center gap-1 pl-1 select-none">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    Categories:
                  </span>

                  {/* Marquee viewport with smooth edge masks */}
                  <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
                    <div className="flex items-center gap-2.5 w-max animate-marquee hover:[animation-play-state:paused] py-1">
                      {categories.concat(categories).map((catName, idx) => {
                        const details = Object.values(categoryDetails || {}).find(c => c.name === catName);
                        const catSlug = details?.slug || generateSlug(catName);
                        return (
                          <Link
                            key={`${catName}-${idx}`}
                            to={`/category/${catSlug}`}
                            className="inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-slate-200/80 shadow-2xs transition-all hover:scale-105 shrink-0 whitespace-nowrap cursor-pointer"
                          >
                            <span>{catName}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: 2 Dynamic Animated Hero Product Cards */}
            <div className="lg:col-span-6 xl:col-span-5 relative flex items-center justify-center min-h-[460px] lg:min-h-[520px]">
              
              {/* Harmonic Curved Wave Lines SVG container with local overflow control */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
                <svg 
                  className="absolute -inset-x-16 inset-y-0 w-[calc(100%+8rem)] h-full overflow-visible" 
                  viewBox="0 0 640 480" 
                  fill="none"
                >
                  <path d="M -70 130 C 150 60, 260 260, 470 140 C 560 90, 660 190, 760 130" stroke="#94a3b8" strokeWidth="2.5" strokeOpacity="0.45" strokeLinecap="round" fill="none" />
                  <path d="M -70 175 C 150 105, 260 305, 470 185 C 560 135, 660 235, 760 175" stroke="#94a3b8" strokeWidth="2.5" strokeOpacity="0.45" strokeLinecap="round" fill="none" />
                  <path d="M -70 220 C 150 150, 260 350, 470 230 C 560 180, 660 280, 760 220" stroke="#94a3b8" strokeWidth="2.5" strokeOpacity="0.45" strokeLinecap="round" fill="none" />
                  <path d="M -70 265 C 150 195, 260 395, 470 275 C 560 225, 660 325, 760 265" stroke="#94a3b8" strokeWidth="2.5" strokeOpacity="0.45" strokeLinecap="round" fill="none" />
                </svg>
              </div>

              {/* 2 Full Interactive Hero Product Cards */}
              <div className="relative z-10 w-full max-w-[560px] grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6 items-stretch">
                
                {/* Product Card 1 */}
                {(() => {
                  const card = getResolvedCard('card-1', defaultFeaturedCards[0]);
                  return (
                    <div className="relative animate-float-slow hover:[animation-play-state:paused] flex flex-col">
                      <Link
                        to={card.linkUrl}
                        className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.12)] hover:shadow-[0_24px_50px_-8px_rgba(0,82,217,0.22)] transition-all duration-300 hover:scale-[1.03] group flex flex-col justify-between flex-1 relative overflow-hidden"
                      >
                        {/* Top Badge & Category Tag */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100/80">
                            {card.badge}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Verified UAE
                          </span>
                        </div>

                        {/* Product Main Image Box */}
                        <div className="w-full aspect-[4/3.2] bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-100 flex items-center justify-center p-3 mb-4 group-hover:bg-slate-100/50 transition-colors">
                          <img
                            src={card.imageUrl}
                            alt={card.title}
                            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
                          />
                        </div>

                        {/* Product Title & Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-sm sm:text-[15px] font-extrabold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#0052d9] transition-colors mb-2">
                              {card.title}
                            </h3>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-4">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Direct Factory Supply</span>
                            </div>
                          </div>

                          {/* Price & Action Button */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none mb-0.5">Wholesale</span>
                              <span className="text-sm sm:text-base font-black text-[#0052d9]">
                                {card.price}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1 bg-slate-900 group-hover:bg-[#0052d9] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm">
                              <span>View</span>
                              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })()}

                {/* Product Card 2 */}
                {(() => {
                  const card = getResolvedCard('card-2', defaultFeaturedCards[1]);
                  return (
                    <div className="relative animate-float-delayed hover:[animation-play-state:paused] flex flex-col">
                      <Link
                        to={card.linkUrl}
                        className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.12)] hover:shadow-[0_24px_50px_-8px_rgba(0,82,217,0.22)] transition-all duration-300 hover:scale-[1.03] group flex flex-col justify-between flex-1 relative overflow-hidden"
                      >
                        {/* Top Badge & Category Tag */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/80">
                            {card.badge}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            In Stock
                          </span>
                        </div>

                        {/* Product Main Image Box */}
                        <div className="w-full aspect-[4/3.2] bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-100 flex items-center justify-center p-3 mb-4 group-hover:bg-slate-100/50 transition-colors">
                          <img
                            src={card.imageUrl}
                            alt={card.title}
                            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
                          />
                        </div>

                        {/* Product Title & Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-sm sm:text-[15px] font-extrabold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#0052d9] transition-colors mb-2">
                              {card.title}
                            </h3>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-4">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              <span>GCC Certified Standard</span>
                            </div>
                          </div>

                          {/* Price & Action Button */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none mb-0.5">Wholesale</span>
                              <span className="text-sm sm:text-base font-black text-[#0052d9]">
                                {card.price}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1 bg-slate-900 group-hover:bg-[#0052d9] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm">
                              <span>View</span>
                              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })()}

              </div>

            </div>

          </div>
        </div>
      </section>

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
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const fallbacks: Record<string, string> = {
                              'Traffic Safety': 'https://images.unsplash.com/photo-1541888081198-a0e2dc113ea4?q=80&w=400&auto=format&fit=crop',
                              'Safety Gear': 'https://images.unsplash.com/photo-1582136005230-05e81d7d0a2b?q=80&w=400&auto=format&fit=crop',
                              'Road Studs': 'https://images.unsplash.com/photo-1584844308364-a690e03eaff1?q=80&w=400&auto=format&fit=crop',
                              'Barriers': 'https://images.unsplash.com/photo-1579762593175-20226054cad0?q=80&w=400&auto=format&fit=crop',
                              'Reflectors & Signage': 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?q=80&w=400&auto=format&fit=crop',
                              'Lighting & Beacons': 'https://images.unsplash.com/photo-1513826308963-f6ecb473cddb?q=80&w=400&auto=format&fit=crop',
                              'Industrial Tools': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=400&auto=format&fit=crop',
                              'Bulk Offers': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop',
                              'Printing Supplies': 'https://images.unsplash.com/photo-1615840287214-7fe58a8b668f?q=80&w=400&auto=format&fit=crop',
                              'Industrial Sealants & Adhesives': 'https://images.unsplash.com/photo-1595206133361-b1fe343e5e23?q=80&w=400&auto=format&fit=crop',
                              'Industrial Diamond Tools': 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=400&auto=format&fit=crop',
                              'Lights & Lighting': 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=400&auto=format&fit=crop',
                              'Home Improvement Solutions': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop',
                              'Security Packaging Solutions': 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=400&auto=format&fit=crop',
                              'Flexible Packaging Raw Materials': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop',
                              'Flexible packaging raw materials': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop',
                              'Industrial Adhesive Tapes': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=400&auto=format&fit=crop',
                              'Plastic Sheet Materials': 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=400&auto=format&fit=crop',
                            };
                            target.src = fallbacks[catName] || 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=400&auto=format&fit=crop';
                          }}
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
          specs: Array.isArray(p.specifications)
            ? p.specifications.slice(0, 3).map(s => typeof s === 'string' ? s : (s?.value || s?.key || ''))
            : [],
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
