import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PenSquare, Trash2, Eye, EyeOff, Plus, BookOpen,
  FileText, Globe, Clock, Search, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { getAllBlogs, deleteBlog, togglePublish, BlogPost } from '../../lib/blogService';
import { updateSitemapMetadata } from '../../context/StoreContext';
import { db } from '../../lib/firebase';

const CATEGORY_COLORS: Record<string, string> = {
  'Compliance':   'bg-red-100 text-red-700',
  'Buying Guide': 'bg-blue-100 text-blue-700',
  'Maintenance':  'bg-green-100 text-green-700',
  'Safety Tips':  'bg-amber-100 text-amber-700',
  'Industry News':'bg-purple-100 text-purple-700',
};

export default function AdminBlogs() {
  const navigate = useNavigate();
  const [blogs, setBlogs]     = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await getAllBlogs();
      setBlogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleDelete = async (blog: BlogPost) => {
    if (!confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    setDeleting(blog.id);
    await deleteBlog(blog.id);
    await updateSitemapMetadata(db);
    setBlogs(prev => prev.filter(b => b.id !== blog.id));
    setDeleting(null);
  };

  const handleToggle = async (blog: BlogPost) => {
    setToggling(blog.id);
    await togglePublish(blog);
    await updateSitemapMetadata(db);
    setBlogs(prev =>
      prev.map(b => b.id === blog.id ? { ...b, published: !b.published } : b)
    );
    setToggling(null);
  };

  const filtered = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  const published = blogs.filter(b => b.published).length;
  const drafts    = blogs.filter(b => !b.published).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" /> Blog Creator
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Create SEO-optimised blog posts. Paste AI-generated HTML content directly.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/blogs/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" /> New Blog Post
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Posts',  value: blogs.length,  icon: FileText, color: 'text-slate-600 bg-slate-100' },
          { label: 'Published',    value: published,      icon: Globe,    color: 'text-green-700 bg-green-100' },
          { label: 'Drafts',       value: drafts,         icon: EyeOff,   color: 'text-amber-700 bg-amber-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{value}</div>
              <div className="text-xs text-slate-500 font-medium">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search posts by title or category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
        />
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading posts…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-500 font-semibold">
              {search ? 'No posts match your search' : 'No blog posts yet'}
            </p>
            {!search && (
              <button
                onClick={() => navigate('/admin/blogs/new')}
                className="text-blue-600 text-sm font-bold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Create your first post
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50">
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Post</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Read Time</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50 transition-colors">
                    {/* Post */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          {blog.coverImage ? (
                            <img src={blog.coverImage} alt="" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate max-w-[220px]">{blog.title}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[220px] mt-0.5">/blog/{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold ${CATEGORY_COLORS[blog.category] ?? 'bg-slate-100 text-slate-700'}`}>
                        {blog.category}
                      </span>
                    </td>
                    {/* Read Time */}
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" /> {blog.readTime} min
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggle(blog)}
                        disabled={toggling === blog.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                          blog.published
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {toggling === blog.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : blog.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />
                        }
                        {blog.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-xs text-slate-500">
                        {new Date(blog.createdAt).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <Link
                          to={`/blog/${blog.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => navigate(`/admin/blogs/edit/${blog.id}`)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PenSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(blog)}
                          disabled={deleting === blog.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          {deleting === blog.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-center mt-4">
          Showing {filtered.length} of {blogs.length} blog posts
        </p>
      )}
    </div>
  );
}
