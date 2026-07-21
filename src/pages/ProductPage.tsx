import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Star, ShieldCheck, Truck, Heart, Share2, Info, ChevronRight, ChevronDown, Check, ShoppingCart, Minus, Plus, PhoneCall, Loader2, FileText, ClipboardList, Mail, ArrowLeft, Send } from 'lucide-react';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import { useCart } from '../context/CartContext';
import ProductListingGrid from '../components/home/ProductListingGrid';
import PriceDisplay from '../components/ui/PriceDisplay';
import { generateSlug } from '../lib/blogService';
import { useSEO } from '../lib/useSEO';
import { generateOrganizationSchema, generateBreadcrumbSchema, generateProductSchema, generateFaqSchema } from '../lib/schemaGenerator';
import { generateProductSEO } from '../lib/seoGenerator';
import InternalLinkingEngine from '../components/seo/InternalLinkingEngine';
import { sendEmail } from '../lib/emailService';

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, categoryDetails, categories, productsLoaded, settings } = useStore();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  /* ── Inline Email Inquiry State ── */
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailName, setEmailName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [emailPhone, setEmailPhone] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleSendEmailInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailName || !emailAddress || !product) return;
    setIsSubmittingEmail(true);

    const messageBody = `
B2B Product Inquiry Received

Product Details:
- Name: ${product.name}
- Product Code: ${product.id}
- Brand: ${product.brand || 'N/A'}
- Category: ${product.category}
- Price: ${product.priceType === 'hidden' ? 'Price on Request' : 'AED ' + product.price}
- MOQ: ${product.moq || 'N/A'}
- URL: ${window.location.href}

Customer Information:
- Contact Name / Company: ${emailName}
- Email Address: ${emailAddress}
- Phone Number: ${emailPhone || 'Not provided'}
`;

    const activeEmails = Array.isArray(settings?.inquiryEmails) && settings.inquiryEmails.length > 0
      ? settings.inquiryEmails.filter(Boolean)
      : [settings?.inquiryEmail || 'alzaydaninweb@gmail.com'];

    const recipientEmails = activeEmails.join(', ');

    try {
      await sendEmail({
        name: emailName,
        email: emailAddress,
        phone: emailPhone,
        title: `B2B Product Inquiry: ${product.name}`,
        message: messageBody,
        to_email: recipientEmails,
      });
      setEmailSubmitted(true);
    } catch (err) {
      console.error('Failed to send email inquiry', err);
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const product = useMemo(() => {
    if (!slug || !products.length) return null;
    const found = products.find(p => p.slug === slug || generateSlug(p.name) === slug || p.id === slug);
    if (found) return found;
    // Wait for Firestore load if it's not found in cache
    if (!productsLoaded) return null;
    return null;
  }, [products, slug, productsLoaded]);

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
      const text = `Hello Al Zaydan International, I am interested in: *${product.name}*\n` +
                   `- Quantity: ${quantity}\n` +
                   `- URL: ${window.location.href}\n\n` +
                   `Kindly share a quote.`;
      
      const targetPhone = settings?.whatsappRouting?.product || settings?.orderWhatsAppNumber || settings?.phoneNumber || '';
      const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
    }
  };

  if (!products.length || (!product && !productsLoaded)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product && productsLoaded) {
    const fallbackQuery = (slug || '').replace(/-/g, ' ').trim();
    return <Navigate to={`/search?q=${encodeURIComponent(fallbackQuery)}`} replace />;
  }

  if (slug === product.id) {
    return <Navigate to={`/product/${productSlug}`} replace />;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-slate-50 py-3 px-4 md:px-6 text-[13px] md:text-sm text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 md:gap-2 min-w-0 overflow-hidden">
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
          <div className="flex flex-col-reverse md:flex-row items-start gap-4 h-max relative md:sticky md:top-32 z-10">
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto snap-x md:w-20 shrink-0 no-scrollbar md:max-h-[500px] md:overflow-y-auto">
                {allImages.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImgIdx(i)}
                    className={`w-16 h-16 md:w-20 md:h-20 shrink-0 snap-start border-2 rounded-lg overflow-hidden transition-all bg-white ${i === activeImgIdx ? 'border-blue-600 shadow-md scale-95' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <img src={img} className="w-full h-full object-contain p-1 mix-blend-multiply" alt={`Thumbnail ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
            
            {/* Main Image Container */}
            <div className="w-full md:w-auto md:flex-1 bg-white border border-slate-200 rounded-xl aspect-square flex items-center justify-center relative p-0 overflow-hidden group">
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
                    className={`absolute inset-0 w-full h-full object-contain p-4 md:p-6 mix-blend-multiply transition-opacity duration-700 ease-in-out ${idx === activeImgIdx ? 'opacity-100' : 'opacity-0'}`}
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

            {/* Minimal & Professional B2B Pricing Section */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 mb-6">
              <div className="flex flex-col gap-3">
                <PriceDisplay product={product} size="xl" />

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 pt-3 border-t border-slate-200/80">
                  {product.moq && (
                    <span className="font-bold text-slate-800">
                      MOQ: <span className="font-extrabold text-slate-900">{product.moq}</span>
                    </span>
                  )}

                  <span className={`flex items-center gap-1 font-semibold ${product.inStock ? 'text-emerald-700' : 'text-red-600'}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>

                  <span className="text-slate-500">
                    {product.shippingRegion || 'Global Freight Options'}
                  </span>

                  {product.leadTime && (
                    <span className="text-slate-500">
                      Lead: {product.leadTime}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons & Inline Email Inquiry Form */}
            {showEmailForm ? (
              <div className="bg-white border-2 border-blue-500 rounded-2xl p-5 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <button
                    onClick={() => {
                      setShowEmailForm(false);
                      setEmailSubmitted(false);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Actions
                  </button>
                  <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Direct Email Inquiry</span>
                </div>

                {emailSubmitted ? (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-base">Inquiry Sent Successfully!</h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                      Thank you! Our procurement team will review your inquiry and email you a tailored B2B quote shortly.
                    </p>
                    <button
                      onClick={() => {
                        setShowEmailForm(false);
                        setEmailSubmitted(false);
                        setEmailName('');
                        setEmailAddress('');
                        setEmailPhone('');
                      }}
                      className="mt-2 text-xs font-extrabold text-blue-600 hover:underline"
                    >
                      Done / Close Form
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendEmailInquiry} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                        Your Name / Company *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Acme Industrial LLC"
                        value={emailName}
                        onChange={e => setEmailName(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. procurement@acme.com"
                        value={emailAddress}
                        onChange={e => setEmailAddress(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                        Contact Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +971 50 123 4567"
                        value={emailPhone}
                        onChange={e => setEmailPhone(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingEmail}
                      className="w-full h-12 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmittingEmail ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Sending Inquiry...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Send Request to Email</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Button 1: Add to Quote */}
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`
                    w-full h-13 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-md
                    ${isAdded
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                      : 'bg-[#0052d9] text-white hover:bg-blue-700 shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50'
                    }
                  `}
                >
                  {isAdded ? (
                    <><Check className="w-4 h-4 stroke-[3]" /> Added to Quote List</>
                  ) : (
                    <><FileText className="w-4 h-4" /> Add to Quote</>
                  )}
                </button>

                {/* Button 2: Inquire via WhatsApp */}
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="w-full h-13 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center bg-[#25D366] text-white shadow-md shadow-emerald-500/20 hover:bg-[#128C7E] active:scale-[0.98] disabled:opacity-50 gap-2"
                >
                  <WhatsAppIcon className="w-4.5 h-4.5" />
                  Inquire via WhatsApp
                </button>

                {/* Button 3: Inquire via Email */}
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="w-full h-13 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center bg-white text-slate-800 border-2 border-slate-300 hover:border-slate-800 hover:bg-slate-50 shadow-xs active:scale-[0.98] gap-2"
                >
                  <Mail className="w-4 h-4 text-slate-600" />
                  Inquire via Email
                </button>

                <div className="flex items-center justify-center gap-6 mt-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Supplier</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><Star className="w-4 h-4 text-amber-500" /> Commercial Quality</span>
                </div>
              </div>
            )}
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
                    {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
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
        {(Array.isArray(product.features) && product.features.length > 0 || Array.isArray(product.benefits) && product.benefits.length > 0 || Array.isArray(product.applications) && product.applications.length > 0) && (
          <div className="mt-10 border-t border-slate-200 pt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.isArray(product.features) && product.features.length > 0 && (
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
              
              {Array.isArray(product.benefits) && product.benefits.length > 0 && (
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

              {Array.isArray(product.applications) && product.applications.length > 0 && (
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
        {Array.isArray(product.faqs) && product.faqs.length > 0 && (
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
