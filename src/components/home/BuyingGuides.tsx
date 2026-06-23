import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPublishedBlogs, BlogPost } from '../../lib/blogService';

const CATEGORY_COLORS: Record<string, string> = {
  'Compliance':   'bg-red-100 text-red-700',
  'Buying Guide': 'bg-blue-100 text-blue-700',
  'Maintenance':  'bg-green-100 text-green-700',
  'Safety Tips':  'bg-amber-100 text-amber-700',
  'Industry News':'bg-purple-100 text-purple-700',
  'Product Review':'bg-cyan-100 text-cyan-700',
  'How-To Guide': 'bg-orange-100 text-orange-700',
};

export default function BuyingGuides() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedBlogs(3).then(blogs => {
      setItems(blogs);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="py-16 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              Safety Guides & Insights
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xl">
              Expert resources on site compliance, equipment selection, and safety protocols.
            </p>
          </div>
          <Link
            to="/blog"
            className="text-blue-600 hover:text-blue-700 text-[13px] font-bold flex items-center shrink-0"
          >
            View All Articles <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => {
            const inner = (
              <div className="bg-white border text-left border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow group flex flex-col h-full">
                <div className="h-48 overflow-hidden relative bg-slate-100">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${CATEGORY_COLORS[item.category] ?? 'bg-white/90 text-slate-800'} backdrop-blur`}>
                    {item.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed line-clamp-3">{item.excerpt}</p>
                  <div className="mt-auto inline-flex items-center text-blue-600 font-bold text-[13px] hover:text-blue-700">
                    Read More <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );

            return item.slug
              ? <Link key={idx} to={`/blog/${item.slug}`} className="block">{inner}</Link>
              : <div key={idx}>{inner}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
