import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Search, Filter, Loader2 } from 'lucide-react';
import { getPublishedBlogs, BlogPost } from '../lib/blogService';
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

export default function BlogPage() {
  const [blogs, setBlogs]         = useState<BlogPost[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    getPublishedBlogs().then(data => {
      setBlogs(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  useSEO({
    title: 'Safety Guides & Industry Blog | Al Zaydan International UAE',
    description: 'Industry insights from Al Zaydan International — market trends, material prices, and updates on UAE industrial and construction sectors.',
  });

  const categories = ['All', ...Array.from(new Set(blogs.map(b => b.category)))];

  const filtered = blogs.filter(b => {
    const matchSearch   = b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'All' || b.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-slate-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <BookOpen className="w-4 h-4" /> Knowledge Centre
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Safety Guides & Insights
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Expert resources on site compliance, equipment selection, and industrial safety protocols.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-gray-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading articles…</span>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-gray-200">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-semibold">No articles found</p>
            {search && (
              <button onClick={() => setSearch('')} className="text-blue-600 text-sm font-bold">
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(blog => (
              <Link
                key={blog.id}
                to={`/blog/${blog.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all flex flex-col"
              >
                <div className="h-48 overflow-hidden bg-slate-100 relative">
                  {blog.coverImage
                    ? <img src={blog.coverImage} alt={blog.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-slate-200" /></div>
                  }
                  <div className="absolute top-4 left-4">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur bg-white/90 ${CATEGORY_COLORS[blog.category] ?? 'text-slate-700'}`}>
                      {blog.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <Clock className="w-3 h-3" /> {blog.readTime} min read
                    <span className="text-slate-200">·</span>
                    {new Date(blog.publishedAt).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-grow mb-4">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center text-blue-600 font-bold text-[13px] mt-auto">
                    Read More <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
