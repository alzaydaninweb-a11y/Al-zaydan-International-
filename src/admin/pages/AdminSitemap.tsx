import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import { 
  RefreshCw, 
  CheckCircle, 
  Globe, 
  ExternalLink, 
  Copy, 
  Check,
  FileText,
  Folder,
  Package,
  BookOpen
} from 'lucide-react';

interface SitemapStats {
  totalProducts?: number;
  totalCategories?: number;
  totalBlogs?: number;
  totalPages?: number;
  lastGeneratedTime?: string;
  status?: string;
}

export default function AdminSitemap() {
  const { regenerateSitemap } = useStore();
  const [sitemapData, setSitemapData] = useState<SitemapStats>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'sitemap'), (snap) => {
      if (snap.exists()) {
        setSitemapData(snap.data() as SitemapStats);
      }
    });
    return () => unsub();
  }, []);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      // Set status to Regenerating first
      await setDoc(doc(db, 'settings', 'sitemap'), { status: 'Regenerating' }, { merge: true });
      // Call context function to regenerate counts
      await regenerateSitemap();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to regenerate sitemap:', err);
      alert('Failed to regenerate sitemap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (path: string) => {
    const fullUrl = `https://www.alzaydaninternational.com${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(path);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const sitemaps = [
    { name: 'Master Sitemap Index', path: '/sitemap.xml', desc: 'Points search engines to all other sitemap segments' },
    { name: 'Products Sitemap', path: '/sitemap-products.xml', desc: 'Contains dynamic SEO-friendly product detail pages' },
    { name: 'Categories Sitemap', path: '/sitemap-categories.xml', desc: 'Lists active category landing pages' },
    { name: 'Static Pages Sitemap', path: '/sitemap-pages.xml', desc: 'Includes homepage, about, contact, solutions, and custom industry forms' },
    { name: 'Blogs Sitemap', path: '/sitemap-blogs.xml', desc: 'Lists published informational and news posts' },
  ];

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Never';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-AE', {
        timeZone: 'Asia/Dubai',
        dateStyle: 'medium',
        timeStyle: 'medium',
      }) + ' (UAE Time)';
    } catch {
      return isoString;
    }
  };

  const isRegenerating = sitemapData.status === 'Regenerating' || loading;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sitemap Manager</h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor search index status, review crawl metrics, and manage dynamic sitemap index files for Googlebot discovery.
        </p>
      </div>

      {/* Main Status Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Dynamic XML Sitemap</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isRegenerating 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isRegenerating ? 'Syncing...' : sitemapData.status || 'Active'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Last synced: <span className="font-medium text-slate-700">{formatDateTime(sitemapData.lastGeneratedTime)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {success && (
            <span className="text-emerald-600 font-semibold text-sm flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Recalculated!
            </span>
          )}
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 w-full md:w-auto hover:shadow"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Recalculating...' : 'Regenerate Sitemap'}
          </button>
        </div>
      </div>

      {/* Crawl Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Products */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{sitemapData.totalProducts ?? 0}</div>
            <div className="text-xs font-semibold text-slate-500">Products Tracked</div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{sitemapData.totalCategories ?? 0}</div>
            <div className="text-xs font-semibold text-slate-500">Categories Linked</div>
          </div>
        </div>

        {/* Blogs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{sitemapData.totalBlogs ?? 0}</div>
            <div className="text-xs font-semibold text-slate-500">Published Blogs</div>
          </div>
        </div>

        {/* Pages */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{sitemapData.totalPages ?? 13}</div>
            <div className="text-xs font-semibold text-slate-500">Core Static Pages</div>
          </div>
        </div>
      </div>

      {/* Sitemaps Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-bold text-slate-900 text-lg">Sitemaps Directory</h2>
          <p className="text-slate-500 text-xs mt-1">
            Access, test, or copy individual XML segments. Click copy to copy the absolute URL or click open to inspect in a new window.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {sitemaps.map((item) => (
            <div key={item.path} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">{item.name}</h3>
                <code className="text-xs text-slate-500 block mt-1">{item.path}</code>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => copyToClipboard(item.path)}
                  className="flex items-center justify-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  {copiedLink === item.path ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
                <a
                  href={item.path}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open XML</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational block / Best Practices */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 text-sm">💡 Search Console Submission Tips</h3>
        <ul className="text-xs text-slate-600 space-y-2 mt-3 list-disc list-inside">
          <li>
            Submit the master sitemap index: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">https://www.alzaydaninternational.com/sitemap.xml</code>
          </li>
          <li>
            Netlify functions generate sitemap segments dynamically on-the-fly and cache them for 1 hour to prevent server overload.
          </li>
          <li>
            Draft blogs, non-canonical redirects, and internal dashboard pages are automatically excluded from all sitemaps to optimize crawl budget.
          </li>
        </ul>
      </div>
    </div>
  );
}
