import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Star, ShieldCheck, Truck, Heart, Share2, Info, ChevronRight, ChevronDown, Check, ShoppingCart, Minus, Plus, PhoneCall, Loader2 } from 'lucide-react';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import { useCart } from '../context/CartContext';
import ProductListingGrid from '../components/home/ProductListingGrid';
import PriceDisplay from '../components/ui/PriceDisplay';
import { generateSlug } from '../lib/blogService';
import { useSEO } from '../lib/useSEO';
import { generateOrganizationSchema, generateBreadcrumbSchema, generateProductSchema, generateFaqSchema } from '../lib/schemaGenerator';
import { generateProductSEO } from '../lib/seoGenerator';
import InternalLinkingEngine from '../components/seo/InternalLinkingEngine';

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, categoryDetails, categories } = useStore();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const product = useMemo(() => {
    if (!slug || !products.length) return null;
    return products.find(p => p.slug === slug || generateSlug(p.name) === slug || p.id === slug) || products[0];
  }, [products, slug]);

  const productSlug = useMemo(() => {
    if (!product) return '';
    return product.slug || generateSlug(product.name);
  }, [product]);

  const categorySlug = useMemo(() => {
    if (!product) return '';
    const details = Object.values(categoryDetails || {}).find(c => c.name === product.category);
    return details?.slug || generateSlug(product.category);
  }, [product, categoryDetails]);

  const productSchemaArray = useMemo(() => {
    if (!product) return undefined;
    const url = `/product/${productSlug}`;
    
    // Create Breadcrumbs
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: product.category || 'Products', url: `/category/${categorySlug}` },
      { name: product.name, url },
    ];

    const schemas = [
      generateOrganizationSchema(),
      generateBreadcrumbSchema(breadcrumbs),
      generateProductSchema(product, url),
    ];

    if (product.faqs && product.faqs.length > 0) {
      const faqSchema = generateFaqSchema(product.faqs);
      if (faqSchema) schemas.push(faqSchema);
    }

    return schemas;
  }, [product, productSlug, categorySlug]);

  const seoData = useMemo(() => {
    if (!product) return null;
    return generateProductSEO(product);
  }, [product]);

  useSEO({
    title: seoData ? seoData.title : 'Loading Product...',
    description: seoData ? seoData.description : '',
    canonical: seoData ? seoData.canonical : '',
    ogTitle: seoData?.ogTitle,
    ogDescription: seoData?.ogDescription,
    ogImage: seoData?.ogImage,
    twitterTitle: seoData?.twitterTitle,
    twitterDescription: seoData?.twitterDescription,
    twitterImage: seoData?.twitterImage,
    noIndex: seoData?.noIndex,
    noFollow: seoData?.noFollow,
    schema: productSchemaArray,
  });

  const allImages = useMemo(() => {
    if (!product) return [];
    const imgs = [product.image];
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && img !== product.image) imgs.push(img);
      });
    }
    return imgs;
  }, [product]);

  const [activeImgIdx, setActiveImgIdx] = useState(0);

  // Auto-slide effect
  React.useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImgIdx(prev => (prev + 1) % allImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [allImages.length]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    // 1. Same category
    const sameCategory = products.filter(p => p.category === product.category && p.id !== product.id);
    let related = [...sameCategory];

    // 2. Others
    const others = products.filter(p => p.id !== product.id && p.category !== product.category);
    related = [...related, ...others];

    return related.slice(0, 15);
  }, [products, product]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      navigate('/checkout');
    }
  };

  if (!products.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return <Navigate to="/" replace />;
  }

  if (slug === product.id) {
    return <Navigate to={`/product/${productSlug}`} replace />;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-slate-50 py-3 px-4 md:px-6 text-[13px] md:text-sm text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 md:gap-2">
          <Link to="/" className="hover:text-amber-500 transition-colors shrink-0">Home</Link>
          <span className="text-slate-400">/</span>
          <Link to={`/category/${categorySlug}`} className="hover:text-amber-500 transition-colors shrink-0 whitespace-nowrap">{product.category}</Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 truncate font-semibold">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Left: Images */}
          <div className="flex flex-col-reverse md:flex-row gap-4 h-max relative md:sticky md:top-32 z-10">
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto snap-x md:w-20 shrink-0 no-scrollbar">
                {allImages.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImgIdx(i)}
                    className={`w-16 h-16 md:w-20 md:h-20 shrink-0 snap-start border-2 rounded-lg overflow-hidden transition-all ${i === activeImgIdx ? 'border-blue-600 shadow-md scale-95' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <img src={img} className="w-full h-full object-cover mix-blend-multiply" alt={`Thumbnail ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
            
            {/* Main Image Container */}
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl aspect-square flex items-center justify-center relative p-0 overflow-hidden group">
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-amber-400 text-black text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sm">
                  SAVE {product.discount}%
                </div>
              )}
              <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
                <button 
                  onClick={handleShare}
                  title="Copy Link"
                  className="w-10 h-10 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors relative"
                >
                  {isCopied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
                  {isCopied && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm whitespace-nowrap pointer-events-none">
                      Link copied!
                    </div>
                  )}
                </button>
              </div>

              {/* Main Image with Transition */}
              <div className="w-full h-full relative">
                {allImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-opacity duration-700 ease-in-out ${idx === activeImgIdx ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))}
              </div>

              {/* Dot Indicators */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImgIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImgIdx ? 'w-4 bg-blue-600' : 'bg-slate-300'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col lg:pl-6">
            
            {/* Header / Badges */}
            <div className="mb-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {product.brand && (
                  <span className="text-[11px] font-black text-[#0052d9] uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">{product.brand}</span>
                )}
                {product.category && (
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{product.category}</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
                {product.name}
              </h1>
              
              {product.rating != null && product.reviews != null && product.reviews > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-amber-400 text-white px-2 py-0.5 rounded text-sm font-bold">
                    {product.rating} <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-sm font-semibold text-slate-500 underline decoration-slate-300 underline-offset-2">
                    {product.reviews.toLocaleString()} Verified Reviews
                  </span>
                </div>
              )}
            </div>

            {/* Price / Quote Block */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 mb-8 shadow-sm">
              {product.priceType === 'hidden' ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                    <WhatsAppIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg mb-1">Price on Request</h3>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-md">
                      Pricing varies based on volume and specifications. Discuss via WhatsApp for a tailored B2B quote.
                    </p>
                  </div>
                </div>
              ) : (
                <PriceDisplay product={product} size="xl" />
              )}
            </div>

            {/* Key Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Availability</span>
                  <span className={`text-sm font-extrabold ${product.inStock ? 'text-emerald-600' : 'text-red-500'}`}>
                    {product.inStock ? 'In Stock & Ready' : 'Out of Stock'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200">
                  <Truck className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Shipping</span>
                  <span className="text-sm font-extrabold text-slate-900">{product.shippingRegion || 'Global Freight Options'}</span>
                </div>
              </div>

              {product.moq && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200">
                    <ShoppingCart className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Min. Order (MOQ)</span>
                    <span className="text-sm font-extrabold text-slate-900">{product.moq}</span>
                  </div>
                </div>
              )}
              
              {product.leadTime && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200">
                    <Check className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lead Time</span>
                    <span className="text-sm font-extrabold text-slate-900">{product.leadTime}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-slate-200 rounded-xl h-14 px-1.5 shadow-sm shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 transition-all text-slate-400 hover:text-blue-600"
                  >
                    <Minus className="w-4 h-4 stroke-[3]" />
                  </button>
                  <span className="w-10 text-center font-black text-slate-900 text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 transition-all text-slate-400 hover:text-blue-600"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`
                    flex-1 h-14 rounded-xl font-bold text-[11px] sm:text-[13px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2
                    ${isAdded
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                      : 'bg-[#0052d9] text-white shadow-lg shadow-blue-100 hover:bg-blue-700 hover:shadow-blue-200 active:scale-[0.98] disabled:opacity-50'
                    }
                  `}
                >
                  {isAdded ? (
                    <><Check className="w-4 h-4 stroke-[3]" /> Added to List</>
                  ) : (
                    <><ShoppingCart className="w-4 h-4" /> Add to Order List</>
                  )}
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="w-full h-14 rounded-xl font-bold text-[11px] sm:text-[13px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center bg-[#25D366] text-white shadow-lg shadow-green-100 hover:bg-[#128C7E] active:scale-[0.98] disabled:opacity-50 gap-2.5"
              >
                <WhatsAppIcon className="w-5 h-5" />
                {product.priceType === 'hidden' ? 'Discuss Quote via WhatsApp' : 'Order instantly via WhatsApp'}
              </button>
              
              <div className="flex items-center justify-center gap-6 mt-4">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure B2B Portal</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><Star className="w-4 h-4 text-amber-500" /> Commercial Quality</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mt-10 border-t border-slate-200 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Product Description</h2>
              <div className="prose max-w-none text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {product.description ? (
                  <InternalLinkingEngine 
                    text={product.description} 
                    currentCategory={product.category || ''} 
                    categories={categories} 
                  />
                ) : (
                  <p>Experience the ultimate combination of power and durability with the {product.name}. Designed for professional and industrial use, it delivers top-tier performance for all your operational needs.</p>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Specifications</h2>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                  <tbody>
                    {product.brand && (
                      <tr className="border-b border-slate-100">
                        <th className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50 w-1/3">Brand</th>
                        <td className="py-3 px-4 text-slate-900 bg-white">{product.brand}</td>
                      </tr>
                    )}
                    {product.category && (
                      <tr className="border-b border-slate-100">
                        <th className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50 w-1/3">Category</th>
                        <td className="py-3 px-4 text-slate-900 bg-white">{product.category}</td>
                      </tr>
                    )}
                    {product.specifications && product.specifications.length > 0 ? (
                      product.specifications.map((spec, idx) => (
                        <tr key={idx} className={idx === product.specifications!.length - 1 ? '' : 'border-b border-slate-100'}>
                          <th className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50 w-1/3">{spec.key}</th>
                          <td className="py-3 px-4 text-slate-900 bg-white font-medium">{spec.value}</td>
                        </tr>
                      ))
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Semantic SEO Content: Features, Benefits, Applications */}
        {(product.features?.length > 0 || product.benefits?.length > 0 || product.applications?.length > 0) && (
          <div className="mt-10 border-t border-slate-200 pt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {product.features && product.features.length > 0 && (
                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-600 fill-blue-100" /> Key Features
                  </h3>
                  <ul className="space-y-3">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {product.benefits && product.benefits.length > 0 && (
                <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 fill-emerald-100" /> Core Benefits
                  </h3>
                  <ul className="space-y-3">
                    {product.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.applications && product.applications.length > 0 && (
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-slate-600 fill-slate-200" /> Industry Applications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.applications.map((app, i) => (
                      <span key={i} className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAQs */}
        {product.faqs && product.faqs.length > 0 && (
          <div className="mt-10 border-t border-slate-200 pt-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {product.faqs.map((faq, i) => (
                <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:border-blue-300 transition-colors">
                  <button 
                    onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-slate-800 focus:outline-none"
                  >
                    <span className="pr-4">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${openFaqIdx === i ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>
                  {openFaqIdx === i && (
                    <div className="px-5 pb-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Related Products</h2>
              <Link to={`/category/${categorySlug}`} className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1 transition-colors">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductListingGrid customProducts={relatedProducts} columns={4} />
          </div>
        )}

      </div>
    </div>
  );
}
