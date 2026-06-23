import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, Tag, BookOpen, Loader2, ArrowRight, ShoppingBag, Youtube, Star } from 'lucide-react';
import { getBlogBySlug, getPublishedBlogs, BlogPost, generateSlug } from '../lib/blogService';
import { useStore, Product } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useSEO } from '../lib/useSEO';

const CATEGORY_COLORS: Record<string, string> = {
  'Compliance':   'bg-red-100 text-red-700',
  'Buying Guide': 'bg-blue-100 text-blue-700',
  'Maintenance':  'bg-green-100 text-green-700',
  'Safety Tips':  'bg-amber-100 text-amber-700',
  'Industry News':'bg-purple-100 text-purple-700',
  'Product Review':'bg-cyan-100 text-cyan-700',
  'How-To Guide': 'bg-orange-100 text-orange-700',
};

function getYoutubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^&?]+)/);
  return match ? match[1] : null;
}

export default function BlogPostPage() {
  const { slug }     = useParams<{ slug: string }>();
  const navigate     = useNavigate();
  const { products } = useStore();
  const { addToCart } = useCart();
  
  const [blog, setBlog]           = useState<BlogPost | null>(null);
  const [related, setRelated]     = useState<BlogPost[]>([]);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);
  const [addedQueue, setAddedQueue] = useState<string[]>([]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    
    setAddedQueue(prev => [...prev, product.id]);
    setTimeout(() => {
      setAddedQueue(prev => prev.filter(id => id !== product.id));
    }, 1500);
  };

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getBlogBySlug(slug).then(async (found) => {
      if (!found || !found.published) { setNotFound(true); setLoading(false); return; }
      setBlog(found);

      // SEO meta tags (title + description set via useSEO below; OG tags updated here)
      const setOG = (prop: string, val: string) => {
        let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
        if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
        el.setAttribute('content', val);
      };
      setOG('og:title',       found.metaTitle || found.title);
      setOG('og:description', found.metaDescription || found.excerpt);
      setOG('og:image',       found.coverImage);
      setOG('og:type',        'article');
      setOG('og:url',         `https://www.alzaydaninternational.com/blog/${found.slug}`);

      // Related posts (same category, excluding current)
      const all = await getPublishedBlogs();
      setRelated(all.filter(b => b.id !== found.id && b.category === found.category).slice(0, 3));
      setLoading(false);
    });
  }, [slug]);

  // Dynamic canonical + title/description — updates whenever blog state changes
  useSEO({
    title:       blog ? (blog.metaTitle || `${blog.title} | Al Zaydan International`) : 'Loading… | Al Zaydan International',
    description: blog ? (blog.metaDescription || blog.excerpt) : '',
    ogImage:     blog?.coverImage,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading article…</span>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-slate-300" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800">Article Not Found</h2>
        <p className="text-slate-500">This article may have been removed or is not yet published.</p>
        <Link to="/blog" className="mt-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  const ytId = blog.youtubeVideoUrl ? getYoutubeId(blog.youtubeVideoUrl) : null;
  const relatedProducts = products.filter(p => blog.relatedProductIds?.includes(p.id));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Cover Image */}
      {blog.coverImage && (
        <div className="w-full h-64 md:h-96 overflow-hidden bg-slate-900">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover opacity-90"
            fetchPriority="high"
            loading="eager"
          />
        </div>
      )}

      {/* Main Content & Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col lg:flex-row gap-10">
        
        {/* ── LEFT COLUMN: ARTICLE ── */}
        <div className="flex-1 min-w-0">
          
          {/* Back */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Articles
          </Link>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${CATEGORY_COLORS[blog.category] ?? 'bg-slate-100 text-slate-700'}`}>
              {blog.category}
            </span>
            <span className="flex items-center gap-1 text-slate-400 text-xs">
              <Clock className="w-3 h-3" /> {blog.readTime} min read
            </span>
            {blog.publishedAt && (
              <span className="flex items-center gap-1 text-slate-400 text-xs">
                <Calendar className="w-3 h-3" />
                {new Date(blog.publishedAt).toLocaleDateString('en-AE', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            )}
            <span className="flex items-center gap-1 text-slate-400 text-xs">
              <User className="w-3 h-3" /> {blog.author}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-lg text-slate-600 leading-relaxed border-l-4 border-blue-500 pl-4 mb-8 italic">
              {blog.excerpt}
            </p>
          )}

          {/* HTML CONTENT */}
          <article
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: blog.htmlContent }}
          />

          {/* Tags */}
          {blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-200">
              <Tag className="w-4 h-4 text-slate-400 mt-0.5" />
              {blog.tags.map(tag => (
                <span key={tag} className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Card */}
          <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-extrabold text-lg">
                {blog.author.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-bold text-slate-900">{blog.author}</p>
              <p className="text-sm text-slate-500">Al Zaydan International FZE — Safety & Industrial Equipment Specialists</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: SIDEBAR ── */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 space-y-8">
          
          {/* YouTube Embed */}
          {ytId && (
            <div className={`w-full rounded-2xl overflow-hidden shadow-sm ${blog.youtubeVideoUrl.includes('/shorts/') ? 'aspect-[9/16] max-w-[300px] mx-auto' : 'aspect-video'}`}>
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1`}
                title="YouTube video player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Sidebar Image Ad */}
          {blog.adImageUrl && (
            <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-gray-200">
              {blog.adImageLink ? (
                <a href={blog.adImageLink} className="block relative w-full">
                  <img src={blog.adImageUrl} alt="Promotional Advertisement" className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </a>
              ) : (
                <img src={blog.adImageUrl} alt="Promotional Advertisement" className="w-full object-cover" />
              )}
            </div>
          )}

          {/* Related Products / Cross-Sell */}
          {relatedProducts.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-600" /> Recommended Equipment
                </h3>
              </div>
              <div className="p-4 flex flex-col gap-4">
                {relatedProducts.map(product => (
                  <Link 
                    key={product.id} 
                    to={`/product/${product.slug || generateSlug(product.name)}`} 
                    className="w-full bg-white rounded-3xl flex flex-col snap-start cursor-pointer relative group p-2 hover:shadow-lg transition-all border border-gray-200 overflow-hidden"
                  >
                    
                    {/* Top Image Block */}
                    <div className="bg-slate-50 rounded-2xl w-full h-[180px] flex items-center justify-center relative shrink-0 overflow-hidden">
                      <img 
                        src={product.image || product.images?.[0]} 
                        alt={product.name} 
                        loading="lazy"
                        className="relative z-10 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-20">
                          Save {product.discount}%
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col px-3 pt-4 pb-2 flex-grow">
                      <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-tight mb-2">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-1 mb-3">
                         <div className="flex text-amber-400">
                           <Star className="w-3.5 h-3.5 fill-current"/>
                           <Star className="w-3.5 h-3.5 fill-current"/>
                           <Star className="w-3.5 h-3.5 fill-current"/>
                           <Star className="w-3.5 h-3.5 fill-current"/>
                           <Star className="w-3.5 h-3.5 text-gray-200 fill-current"/>
                         </div>
                         <span className="text-[12px] text-gray-500 font-medium ml-1">({product.reviews})</span>
                      </div>
                      
                      <p className="text-[12px] text-slate-600 mb-4 line-clamp-2 leading-snug">
                         Professional-grade industrial {product.category.toLowerCase()} perfect for safe and secure environments.
                      </p>

                      <div className="mt-auto pt-2">
                        {/* Add to Cart Button */}
                        <button 
                          onClick={(e) => handleAddToCart(e, product)}
                          className={`w-full font-bold py-3 rounded-full text-[13px] tracking-wide transition-all border ${addedQueue.includes(product.id) ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-md' : 'bg-transparent text-slate-900 border-gray-300 group-hover:bg-slate-50'}`}
                        >
                          {addedQueue.includes(product.id) ? 'Item Added' : `Add to Cart - AED ${product.price.toFixed(0)}`}
                        </button>
                      </div>
                    </div>

                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Need Help Banner */}
          <div className="bg-slate-900 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
             <h3 className="text-white font-bold text-lg mb-2 relative">Need Expert Advice?</h3>
             <p className="text-slate-400 text-sm mb-6 relative">
               Our safety specialists are ready to help you choose the right equipment.
             </p>
             <Link to="/contact" className="inline-block w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors relative">
               Contact Sales
             </Link>
          </div>

        </div>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <div className="bg-white border-t border-gray-200 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(rel => (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.slug}`}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="h-40 overflow-hidden bg-slate-100">
                    {rel.coverImage
                      ? <img src={rel.coverImage} alt={rel.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-slate-200" /></div>
                    }
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {rel.readTime} min
                    </p>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 text-sm">
                      {rel.title}
                    </h3>
                    <div className="flex items-center text-blue-600 text-xs font-bold mt-3">
                      Read More <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Blog content base styles injected inline */}
      <style>{`
        .blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4 {
          font-weight: 800; color: #0f172a; margin: 1.5em 0 0.5em; line-height: 1.25;
        }
        .blog-content h1 { font-size: 2rem; }
        .blog-content h2 { font-size: 1.5rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
        .blog-content h3 { font-size: 1.25rem; }
        .blog-content p  { color: #334155; line-height: 1.8; margin: 1em 0; }
        .blog-content ul, .blog-content ol { padding-left: 1.5rem; margin: 1em 0; color: #334155; line-height: 1.8; }
        .blog-content li { margin: 0.4em 0; }
        .blog-content a  { color: #2563eb; text-decoration: underline; }
        .blog-content a:hover { color: #1d4ed8; }
        .blog-content blockquote { border-left: 4px solid #3b82f6; padding: 0.75rem 1.25rem; margin: 1.5rem 0; background: #eff6ff; border-radius: 0 12px 12px 0; color: #1e40af; font-style: italic; }
        .blog-content img { max-width: 100%; border-radius: 12px; margin: 1.5rem 0; }
        .blog-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
        .blog-content th { background: #0f172a; color: #fff; padding: 10px 14px; text-align: left; font-size: 0.85rem; }
        .blog-content td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 0.9rem; }
        .blog-content tr:nth-child(even) td { background: #f8fafc; }
        .blog-content code { background: #1e293b; color: #7dd3fc; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-family: monospace; }
        .blog-content pre { background: #0f172a; color: #e2e8f0; padding: 1.25rem; border-radius: 12px; overflow-x: auto; margin: 1.5rem 0; }
        .blog-content pre code { background: none; color: inherit; padding: 0; }
        .blog-content hr { border: none; border-top: 2px solid #e2e8f0; margin: 2rem 0; }
        .blog-content strong { font-weight: 800; color: #0f172a; }
      `}</style>
    </div>
  );
}
