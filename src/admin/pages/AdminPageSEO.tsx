import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { ChevronLeft, Save, FileText, Globe, CheckCircle2, AlertCircle } from 'lucide-react';

const PAGES = [
  { key: 'home', label: 'Homepage', defaultPath: '/' },
  { key: 'about', label: 'About Us', defaultPath: '/about' },
  { key: 'contact', label: 'Contact', defaultPath: '/contact' },
  { key: 'rfq', label: 'Request a Quote (RFQ)', defaultPath: '/rfq' },
  { key: 'services', label: 'Services / Solutions', defaultPath: '/solutions' },
];

export default function AdminPageSEO() {
  const { pagesSeo, updatePageSeo } = useStore();
  const [selectedPage, setSelectedPage] = useState('home');

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [canonical, setCanonical] = useState('');
  const [noIndex, setNoIndex] = useState(false);
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [schemaSelection, setSchemaSelection] = useState('None');
  const [saving, setSaving] = useState(false);

  // Load selected page's SEO parameters
  useEffect(() => {
    const config = pagesSeo[selectedPage] || {};
    setTitle(config.seoTitle || '');
    setDesc(config.metaDescription || '');
    setCanonical(config.canonicalUrl || '');
    setNoIndex(config.noIndex || false);
    setOgTitle(config.ogTitle || '');
    setOgDescription(config.ogDescription || '');
    setOgImage(config.ogImage || '');
    setSchemaSelection(config.schemaSelection || 'None');
  }, [selectedPage, pagesSeo]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updatePageSeo(selectedPage, {
        seoTitle: title.trim(),
        metaDescription: desc.trim(),
        canonicalUrl: canonical.trim(),
        noIndex,
        ogTitle: ogTitle.trim(),
        ogDescription: ogDescription.trim(),
        ogImage: ogImage.trim(),
        schemaSelection,
      });
      alert(`SEO settings for ${selectedPage.toUpperCase()} saved successfully!`);
    } catch (err) {
      alert('Save failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // Character status helper
  const getCharStatus = (length: number, idealMin: number, idealMax: number) => {
    if (length === 0) return { label: 'Empty', color: 'text-slate-400' };
    if (length < idealMin) return { label: 'Too Short', color: 'text-amber-500' };
    if (length > idealMax) return { label: 'Too Long', color: 'text-red-500' };
    return { label: 'Optimal', color: 'text-green-600' };
  };

  const titleStatus = getCharStatus(title.length, 45, 60);
  const descStatus = getCharStatus(desc.length, 120, 160);

  const activePageLabel = PAGES.find(p => p.key === selectedPage)?.label || '';
  const activePagePath = PAGES.find(p => p.key === selectedPage)?.defaultPath || '/';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/seo-dashboard" className="p-2 bg-white hover:bg-slate-100 rounded-lg border border-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Static Page SEO Manager</h1>
            <p className="text-slate-500 text-sm mt-0.5">Edit meta values and layouts for core static storefront pages.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Pages Selector List */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-fit space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Select Page</h3>
          {PAGES.map(p => (
            <button
              key={p.key}
              onClick={() => setSelectedPage(p.key)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                selectedPage === p.key
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-slate-600 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                {p.label}
              </span>
              <span className={`text-[10px] uppercase font-black ${selectedPage === p.key ? 'text-blue-100' : 'text-slate-400'}`}>
                {p.key}
              </span>
            </button>
          ))}
        </div>

        {/* Right Columns: Editor Form */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Editing SEO: {activePageLabel}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Route: <span className="font-semibold text-slate-500">{activePagePath}</span></p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Configuration
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            
            {/* Indexing Controls */}
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Search Engine Index Status</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Toggle whether Google should crawl and list this static page.</p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!noIndex}
                  onChange={e => setNoIndex(!e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className={`text-xs font-black ${!noIndex ? 'text-green-600' : 'text-red-500'}`}>
                  {!noIndex ? 'INDEX' : 'NOINDEX'}
                </span>
              </label>
            </div>

            {/* Title & Desc */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex justify-between">
                  <span>SEO Title Override</span>
                  <span className={`text-[10px] font-bold ${titleStatus.color}`}>{titleStatus.label} ({title.length}/60)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Traffic Safety Supplies Dubai UAE | Al Zaydan International"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex justify-between">
                  <span>Meta Description</span>
                  <span className={`text-[10px] font-bold ${descStatus.color}`}>{descStatus.label} ({desc.length}/160)</span>
                </label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Buy road markers, delineators, and traffic cones..."
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all bg-slate-50/50 resize-none animate-fade-in"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Canonical URL Override</span>
                  <span className="text-[10px] text-slate-400 font-normal">Leave blank for automatic canonical</span>
                </label>
                <input
                  type="url"
                  value={canonical}
                  onChange={e => setCanonical(e.target.value)}
                  placeholder={`https://www.alzaydaninternational.com${activePagePath}`}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all bg-slate-50/50"
                />
              </div>
            </div>

            {/* Google Snippet Live Preview */}
            <div className="border border-gray-200 rounded-xl p-4 bg-slate-50/20">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Google SERP Preview</span>
              <div className="space-y-1">
                <span className="text-blue-700 text-base font-semibold leading-snug truncate block hover:underline cursor-pointer">
                  {title || `${activePageLabel} | Al Zaydan International`}
                </span>
                <span className="text-green-700 text-[11px] block">
                  www.alzaydaninternational.com{activePagePath}
                </span>
                <span className="text-slate-600 text-xs leading-relaxed line-clamp-2 block">
                  {desc || 'Fill in a custom meta description to override Google\'s automatic crawler snippet text.'}
                </span>
              </div>
            </div>

            {/* Open Graph Overrides */}
            <div className="border border-gray-200/80 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-gray-100 pb-2">
                Social Media Sharing overrides (Open Graph)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">OG Title</label>
                  <input
                    type="text"
                    value={ogTitle}
                    onChange={e => setOgTitle(e.target.value)}
                    placeholder="Shared link title tag"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">OG Image URL</label>
                  <input
                    type="url"
                    value={ogImage}
                    onChange={e => setOgImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">OG Description</label>
                <textarea
                  rows={2}
                  value={ogDescription}
                  onChange={e => setOgDescription(e.target.value)}
                  placeholder="Summarize the link preview card..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 bg-slate-50/50 resize-none"
                />
              </div>
            </div>

            {/* Schema Selection */}
            <div className="border border-gray-200/80 rounded-xl p-4 space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">JSON-LD Structured Schema</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Select a schema layout to auto-inject into this page header.</p>
              </div>
              <select
                value={schemaSelection}
                onChange={e => setSchemaSelection(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs outline-none bg-white font-medium"
              >
                <option value="None">None (Default Fallbacks)</option>
                <option value="Organization">Organization Schema</option>
                <option value="LocalBusiness">LocalBusiness Schema</option>
                <option value="FAQ">FAQ Page Schema</option>
              </select>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
