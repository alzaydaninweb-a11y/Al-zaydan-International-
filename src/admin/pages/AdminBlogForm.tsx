import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, Save, Eye, EyeOff, Loader2, Tag, Globe,
  Image as ImageIcon, AlignLeft, Code2, BookOpen, RefreshCw,
  Youtube, ShoppingBag,
} from 'lucide-react';
import { useStore, updateSitemapMetadata } from '../../context/StoreContext';
import { db } from '../../lib/firebase';
import {
  BlogPost, createBlog, updateBlog, getAllBlogs,
  generateSlug, estimateReadTime,
} from '../../lib/blogService';

function getYoutubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^&?]+)/);
  return match ? match[1] : null;
}

const CATEGORIES = [
  'Compliance', 'Buying Guide', 'Maintenance',
  'Safety Tips', 'Industry News', 'Product Review', 'How-To Guide',
];

type Tab = 'content' | 'preview' | 'seo';

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  htmlContent: '',
  coverImage: '',
  category: CATEGORIES[0],
  tags: '',            // comma-separated in form, stored as array
  metaTitle: '',
  metaDescription: '',
  author: 'Al Zaydan Team',
  published: false,
  youtubeVideoUrl: '',
  relatedProductIds: [] as string[],
  topBarText: '',
  topBarBgColor: '#2563EB', // default blue
  topBarTextColor: '#FFFFFF',
  topBarLink: '',
  adImageUrl: '',
  adImageLink: '',
  canonicalUrl: '',
  focusKeyword: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',
  noIndex: false,
  noFollow: false,
  schemaSelection: 'article',
};

export default function AdminBlogForm() {
  const navigate   = useNavigate();
  const { id }     = useParams<{ id: string }>();
  const isEdit     = Boolean(id);
  const { products } = useStore();

  const [form, setForm]         = useState(EMPTY_FORM);
  const [tab, setTab]           = useState<Tab>('content');
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(isEdit);
  const [error, setError]       = useState('');
  const [slugLocked, setSlugLocked] = useState(isEdit);
  const [productSearch, setProductSearch] = useState('');

  // Load blog for edit
  useEffect(() => {
    if (!isEdit) return;
    getAllBlogs().then(all => {
      const blog = all.find(b => b.id === id);
      if (!blog) { navigate('/admin/blogs'); return; }
      setForm({
        title:           blog.title,
        slug:            blog.slug,
        excerpt:         blog.excerpt,
        htmlContent:     blog.htmlContent,
        coverImage:      blog.coverImage,
        category:        blog.category,
        tags:            blog.tags.join(', '),
        metaTitle:       blog.metaTitle || '',
        metaDescription: blog.metaDescription || '',
        author:          blog.author || '',
        published:       blog.published || false,
        youtubeVideoUrl: blog.youtubeVideoUrl || '',
        relatedProductIds: blog.relatedProductIds || [],
        topBarText:      blog.topBarText || '',
        topBarBgColor:   blog.topBarBgColor || '#2563EB',
        topBarTextColor: blog.topBarTextColor || '#FFFFFF',
        topBarLink:      blog.topBarLink || '',
        adImageUrl:      blog.adImageUrl || '',
        adImageLink:     blog.adImageLink || '',
        canonicalUrl:    blog.canonicalUrl || '',
        focusKeyword:    blog.focusKeyword || '',
        ogTitle:         blog.ogTitle || '',
        ogDescription:   blog.ogDescription || '',
        ogImage:         blog.ogImage || '',
        twitterTitle:    blog.twitterTitle || '',
        twitterDescription: blog.twitterDescription || '',
        twitterImage:    blog.twitterImage || '',
        noIndex:         blog.noIndex || false,
        noFollow:        blog.noFollow || false,
        schemaSelection: blog.schemaSelection || 'article',
      });
      setLoading(false);
    });
  }, [id, isEdit, navigate]);

  const set = (field: keyof typeof EMPTY_FORM, value: string | boolean | string[]) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      // Auto-generate slug from title (if not locked)
      if (field === 'title' && !slugLocked) {
        next.slug = generateSlug(value as string);
      }
      // Auto-populate metaTitle if empty
      if (field === 'title' && !prev.metaTitle) {
        next.metaTitle = `${value} | Al Zaydan International`;
      }
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim())      { setError('Title is required'); return; }
    if (!form.slug.trim())       { setError('Slug is required'); return; }
    if (!form.htmlContent.trim()) { setError('HTML content is required'); return; }

    setSaving(true);
    setError('');
    try {
      const payload: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'> = {
        title:           form.title.trim(),
        slug:            form.slug.trim(),
        excerpt:         form.excerpt.trim(),
        htmlContent:     form.htmlContent,
        coverImage:      form.coverImage.trim(),
        category:        form.category,
        tags:            form.tags.split(',').map(t => t.trim()).filter(Boolean),
        metaTitle:       form.metaTitle.trim() || `${form.title} | Al Zaydan International`,
        metaDescription: form.metaDescription.trim(),
        author:          form.author.trim(),
        published:       form.published,
        youtubeVideoUrl: form.youtubeVideoUrl.trim(),
        relatedProductIds: form.relatedProductIds,
        topBarText:      form.topBarText.trim(),
        topBarBgColor:   form.topBarBgColor,
        topBarTextColor: form.topBarTextColor,
        topBarLink:      form.topBarLink.trim(),
        adImageUrl:      form.adImageUrl.trim(),
        adImageLink:     form.adImageLink.trim(),
        readTime:        estimateReadTime(form.htmlContent),
        publishedAt:     form.published ? new Date().toISOString() : '',
        canonicalUrl:    form.canonicalUrl.trim(),
        focusKeyword:    form.focusKeyword.trim(),
        ogTitle:         form.ogTitle.trim(),
        ogDescription:   form.ogDescription.trim(),
        ogImage:         form.ogImage.trim(),
        twitterTitle:    form.twitterTitle.trim(),
        twitterDescription: form.twitterDescription.trim(),
        twitterImage:    form.twitterImage.trim(),
        noIndex:         form.noIndex,
        noFollow:        form.noFollow,
        schemaSelection: form.schemaSelection,
      };
      if (isEdit && id) {
        await updateBlog(id, payload);
      } else {
        await createBlog(payload);
      }
      await updateSitemapMetadata(db);
      navigate('/admin/blogs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading post…
      </div>
    );
  }

  const readTime = form.htmlContent ? estimateReadTime(form.htmlContent) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/blogs" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isEdit ? 'Edit Blog Post' : 'New Blog Post'}
          </h1>
          <p className="text-slate-500 text-sm">
            Paste AI-generated HTML content below · Estimated read time: {readTime} min
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="flex flex-col xl:flex-row gap-6">

          {/* ── Left: Main Content ─────────────────────────────────────────── */}
          <div className="flex-1 space-y-5">

            {/* Title */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Blog Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g. OSHA Fall Protection Standards 2024"
                className="w-full text-xl font-bold text-slate-900 border-0 outline-none placeholder:text-slate-300 bg-transparent"
              />
              {/* Slug */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-slate-400 font-mono shrink-0">/blog/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => { set('slug', e.target.value); setSlugLocked(true); }}
                  placeholder="auto-generated-slug"
                  className="flex-1 text-xs font-mono text-blue-600 border-0 outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => { set('slug', generateSlug(form.title)); setSlugLocked(false); }}
                  className="shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded"
                  title="Regenerate slug"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5" /> Excerpt
                <span className="text-slate-400 font-normal normal-case">— short description shown in blog cards</span>
              </label>
              <textarea
                value={form.excerpt}
                onChange={e => set('excerpt', e.target.value)}
                rows={3}
                placeholder="A brief summary of what this article covers…"
                className="w-full text-sm text-slate-700 border-0 outline-none bg-transparent resize-none placeholder:text-slate-300"
              />
            </div>

            {/* HTML Content Editor */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                {([
                  { key: 'content', icon: Code2,     label: 'HTML Content' },
                  { key: 'preview', icon: Eye,        label: 'Preview'     },
                  { key: 'seo',     icon: Globe,      label: 'SEO Check'   },
                ] as { key: Tab; icon: React.ElementType; label: string }[]).map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-colors ${
                      tab === key
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/40'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>

              {/* Content Tab */}
              {tab === 'content' && (
                <div className="p-5">
                  <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    Paste your AI-generated HTML here. Include all inline styles for best results.
                  </p>
                  <textarea
                    value={form.htmlContent}
                    onChange={e => set('htmlContent', e.target.value)}
                    rows={24}
                    placeholder={`<!-- Paste your AI-generated HTML blog content here -->\n<article>\n  <h2>Introduction</h2>\n  <p>Your content goes here...</p>\n</article>`}
                    className="w-full font-mono text-xs text-slate-700 bg-slate-950 text-green-400 p-4 rounded-xl resize-y outline-none focus:ring-2 focus:ring-blue-500/30"
                    style={{ minHeight: 420 }}
                    spellCheck={false}
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                    <span>{form.htmlContent.length.toLocaleString()} characters</span>
                    <span>~{readTime} min read</span>
                  </div>
                </div>
              )}

              {/* Preview Tab */}
              {tab === 'preview' && (
                <div className="p-5">
                  {form.htmlContent ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs">
                        <Eye className="w-4 h-4 shrink-0" />
                        This preview renders your HTML exactly as it will appear on the live blog page.
                      </div>
                      <div
                        className="prose prose-slate max-w-none border border-gray-200 rounded-xl p-6 bg-white"
                        dangerouslySetInnerHTML={{ __html: form.htmlContent }}
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                      <Code2 className="w-8 h-8" />
                      <p className="text-sm">No HTML content yet. Switch to the Content tab and paste your HTML.</p>
                    </div>
                  )}
                </div>
              )}

              {/* SEO Check Tab */}
              {tab === 'seo' && (
                <div className="p-5 space-y-5">
                  {/* Previews and checklist */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Google SERP Preview */}
                    <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Google Search Preview</p>
                      <div className="space-y-1">
                        <p className="text-blue-700 text-lg font-medium leading-tight truncate">
                          {form.metaTitle || form.title || 'Blog Post Title'}
                        </p>
                        <p className="text-green-700 text-xs font-mono">
                          alzaydan.com/blog/{form.slug || 'blog-post-slug'}
                        </p>
                        <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                          {form.metaDescription || form.excerpt || 'Add a meta description to control what Google shows here.'}
                        </p>
                      </div>
                    </div>
                    {/* SEO Checklist */}
                    <div className="space-y-2 border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">SEO Checklist</p>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                        {[
                          { ok: form.metaTitle.length > 0 && form.metaTitle.length <= 60,        label: `Meta title (${form.metaTitle.length}/60)` },
                          { ok: form.metaDescription.length >= 120 && form.metaDescription.length <= 160, label: `Meta desc (${form.metaDescription.length}/160)` },
                          { ok: Boolean(form.coverImage),    label: 'Cover image set' },
                          { ok: form.tags.split(',').filter(Boolean).length >= 3, label: '3+ tags set' },
                          { ok: form.htmlContent.length > 500, label: 'Length > 500' },
                          { ok: !form.slug.includes(' '),    label: 'Slug valid' },
                        ].map(({ ok, label }) => (
                          <div key={label} className={`flex items-center gap-2 text-xs px-2.5 py-1 rounded-lg ${ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                            <span>{ok ? '✅' : '❌'}</span> {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Core Crawl & Metadata Form */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-slate-800">Advanced SEO & Structured Data</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Focus Keyword</label>
                        <input
                          type="text"
                          value={form.focusKeyword}
                          onChange={e => set('focusKeyword', e.target.value)}
                          placeholder="e.g. road safety standard"
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 outline-none transition-all bg-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Canonical URL</label>
                        <input
                          type="text"
                          value={form.canonicalUrl}
                          onChange={e => set('canonicalUrl', e.target.value)}
                          placeholder="e.g. https://..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 outline-none transition-all bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Schema Structured Data</label>
                        <select
                          value={form.schemaSelection}
                          onChange={e => set('schemaSelection', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 outline-none transition-all bg-white font-medium"
                        >
                          <option value="none">None</option>
                          <option value="article">Article (Default)</option>
                          <option value="faq">FAQ Schema</option>
                          <option value="breadcrumb">Breadcrumb List</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Search Bots Indexing</label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={form.noIndex}
                            onChange={e => set('noIndex', e.target.checked)}
                            className="rounded text-red-600 focus:ring-red-500 border-gray-300 w-4 h-4 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-slate-700">noindex (Do not index)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={form.noFollow}
                            onChange={e => set('noFollow', e.target.checked)}
                            className="rounded text-red-600 focus:ring-red-500 border-gray-300 w-4 h-4 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-slate-700">nofollow (Do not follow links)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Social Graph Tags */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800">Social Media Graph Cards (Facebook & Twitter)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 border-b pb-1 mb-2">Open Graph (Facebook/LinkedIn)</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">OG Title</label>
                            <input
                              type="text"
                              value={form.ogTitle}
                              onChange={e => set('ogTitle', e.target.value)}
                              placeholder="Fallback: Meta Title"
                              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 outline-none bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">OG Description</label>
                            <input
                              type="text"
                              value={form.ogDescription}
                              onChange={e => set('ogDescription', e.target.value)}
                              placeholder="Fallback: Meta Description"
                              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 outline-none bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">OG Image URL</label>
                            <input
                              type="text"
                              value={form.ogImage}
                              onChange={e => set('ogImage', e.target.value)}
                              placeholder="Fallback: Cover Image"
                              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 outline-none bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-700 border-b pb-1 mb-2">Twitter Card Override</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Twitter Title</label>
                            <input
                              type="text"
                              value={form.twitterTitle}
                              onChange={e => set('twitterTitle', e.target.value)}
                              placeholder="Fallback: Meta Title"
                              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 outline-none bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Twitter Description</label>
                            <input
                              type="text"
                              value={form.twitterDescription}
                              onChange={e => set('twitterDescription', e.target.value)}
                              placeholder="Fallback: Meta Description"
                              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 outline-none bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Twitter Image URL</label>
                            <input
                              type="text"
                              value={form.twitterImage}
                              onChange={e => set('twitterImage', e.target.value)}
                              placeholder="Fallback: Cover Image"
                              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 outline-none bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Sidebar ─────────────────────────────────────────────── */}
          <div className="xl:w-80 space-y-4">

            {/* Publish */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-slate-800 text-sm">Status</span>
                <button
                  type="button"
                  onClick={() => set('published', !form.published)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.published ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.published ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className={`flex items-center gap-2 text-sm font-semibold ${form.published ? 'text-green-700' : 'text-slate-500'}`}>
                {form.published ? <><Eye className="w-4 h-4" /> Published — visible on site</> : <><EyeOff className="w-4 h-4" /> Draft — not visible</>}
              </div>
            </div>

            {/* Cover Image */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Cover Image URL
              </label>
              <input
                type="url"
                value={form.coverImage}
                onChange={e => set('coverImage', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
              {form.coverImage && (
                <div className="mt-3 h-36 rounded-xl overflow-hidden bg-slate-100">
                  <img src={form.coverImage} alt="cover" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Category & Author */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Author</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={e => set('author', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Tags (comma-separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={e => set('tags', e.target.value)}
                placeholder="safety, PPE, OSHA, construction"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
              {form.tags && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {form.tags.split(',').filter(t => t.trim()).map(tag => (
                    <span key={tag} className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Ads & Cross-Sell */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" /> Ads & Cross-Sell
              </p>
              
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                  <Youtube className="w-3.5 h-3.5" /> YouTube Video URL
                </label>
                <input
                  type="url"
                  value={form.youtubeVideoUrl}
                  onChange={e => set('youtubeVideoUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or /shorts/"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
                {form.youtubeVideoUrl && getYoutubeId(form.youtubeVideoUrl) && (
                  <div className={`mt-2 rounded-xl overflow-hidden bg-black ${form.youtubeVideoUrl.includes('/shorts/') ? 'aspect-[9/16] w-full max-w-[240px] mx-auto' : 'aspect-video w-full'}`}>
                    <iframe
                      src={`https://www.youtube.com/embed/${getYoutubeId(form.youtubeVideoUrl)}?autoplay=1&mute=1`}
                      title="Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                )}
              </div>

              {/* Custom Image Ad */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold text-slate-700 mb-2">Sidebar Image Ad</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={form.adImageUrl}
                      onChange={e => set('adImageUrl', e.target.value)}
                      placeholder="e.g. https://images.../promo.jpg"
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Click Link Target</label>
                    <input
                      type="text"
                      value={form.adImageLink}
                      onChange={e => set('adImageLink', e.target.value)}
                      placeholder="/product/abc-123 or https://..."
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  {form.adImageUrl && (
                    <div className="h-24 rounded-lg overflow-hidden bg-slate-100 border border-gray-200">
                      <img src={form.adImageUrl} className="w-full h-full object-cover" alt="Ad Preview" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Select Featured Products</span>
                  <span className="text-slate-400">{form.relatedProductIds.length} selected</span>
                </label>
                
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-t-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 border-b-0"
                />

                <div className="border border-gray-200 rounded-b-xl overflow-y-auto max-h-60 p-2 space-y-1 bg-slate-50/50">
                  {products
                    .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.brand?.toLowerCase().includes(productSearch.toLowerCase()))
                    .map(p => (
                    <label key={p.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={form.relatedProductIds.includes(p.id)}
                        onChange={(e) => {
                          const newIds = e.target.checked
                            ? [...form.relatedProductIds, p.id]
                            : form.relatedProductIds.filter(id => id !== p.id);
                          set('relatedProductIds', newIds);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-medium text-slate-700 truncate flex-1">{p.name}</span>
                    </label>
                  ))}
                  {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                    <p className="text-xs text-slate-400 p-2 text-center py-4">No products found</p>
                  )}
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> SEO Settings
              </p>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  Meta Title <span className={form.metaTitle.length > 60 ? 'text-red-500' : 'text-slate-400'}>({form.metaTitle.length}/60)</span>
                </label>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={e => set('metaTitle', e.target.value)}
                  placeholder={`${form.title || 'Blog title'} | Al Zaydan`}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  Meta Description <span className={form.metaDescription.length > 160 ? 'text-red-500' : 'text-slate-400'}>({form.metaDescription.length}/160)</span>
                </label>
                <textarea
                  value={form.metaDescription}
                  onChange={e => set('metaDescription', e.target.value)}
                  rows={3}
                  placeholder="Concise summary for Google search results (120-160 chars)…"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-white transition-all ${
                saving ? 'bg-blue-500 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" />{isEdit ? 'Update Post' : 'Publish Post'}</>
              }
            </button>
            <Link
              to="/admin/blogs"
              className="block text-center text-sm text-slate-500 hover:text-slate-700 py-2"
            >
              Cancel
            </Link>

          </div>
        </div>
      </form>
    </div>
  );
}
