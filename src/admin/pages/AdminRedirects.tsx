import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { ChevronLeft, Plus, Trash2, ShieldCheck, Link2 } from 'lucide-react';

export default function AdminRedirects() {
  const { redirects, addRedirect, deleteRedirect } = useStore();

  const [oldUrl, setOldUrl] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [type, setType] = useState<'301' | '302'>('301');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Sanitize URLs (strip domains if matching alzaydanintl, format correctly)
    let sanitizedOld = oldUrl.trim();
    let sanitizedNew = newUrl.trim();

    if (!sanitizedOld) { setError('Old URL is required'); return; }
    if (!sanitizedNew) { setError('New URL is required'); return; }

    // Enforce leading slash if local paths
    if (!sanitizedOld.startsWith('/') && !sanitizedOld.startsWith('http')) {
      sanitizedOld = '/' + sanitizedOld;
    }
    if (!sanitizedNew.startsWith('/') && !sanitizedNew.startsWith('http')) {
      sanitizedNew = '/' + sanitizedNew;
    }

    if (sanitizedOld === sanitizedNew) {
      setError('Old URL and New URL cannot be identical.');
      return;
    }

    // Check duplicate
    if (redirects.some(r => r.oldUrl === sanitizedOld)) {
      setError(`A redirect rule already exists for Old URL: ${sanitizedOld}`);
      return;
    }

    setSaving(true);
    try {
      await addRedirect({
        oldUrl: sanitizedOld,
        newUrl: sanitizedNew,
        type,
        active: true
      });
      setOldUrl('');
      setNewUrl('');
      alert('Redirect rule added successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add redirect');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, old: string) => {
    if (!window.confirm(`Are you sure you want to delete the redirect rule for: ${old}?`)) return;
    try {
      await deleteRedirect(id);
      alert('Redirect rule deleted.');
    } catch (err) {
      alert('Delete failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/seo-dashboard" className="p-2 bg-white hover:bg-slate-100 rounded-lg border border-gray-200 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">URL Redirect Manager</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage 301 (Permanent) and 302 (Temporary) redirects for SEO migration.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form to Add Redirect */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-fit space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-[15px] flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              New Redirect Rule
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Redirect old legacy URLs to new SEO-optimized URL targets.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3.5 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Old URL / Path *
              </label>
              <input
                type="text"
                value={oldUrl}
                onChange={e => setOldUrl(e.target.value)}
                placeholder="e.g. /product/old-name"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all bg-slate-50/50"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Relative path starting with slash (e.g. /old-page).</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                New URL / Path *
              </label>
              <input
                type="text"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="e.g. /product/new-optimized-slug"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all bg-slate-50/50"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Target URL path or external link starting with https://.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Redirect Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs outline-none bg-white font-medium"
              >
                <option value="301">301 (Moved Permanently - Best for SEO)</option>
                <option value="302">302 (Found / Temporary)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Add Redirect Rule
            </button>
          </form>
        </div>

        {/* Right Columns: Redirect List */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Active Redirect mapping rules</h2>
              <p className="text-xs text-slate-400 mt-0.5">Rules written dynamically here will also compile to Netlify CDN config at next build.</p>
            </div>
            <span className="bg-slate-200 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded">
              {redirects.length} RULES
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="bg-slate-50/40 border-b border-gray-200 text-slate-500 uppercase tracking-widest font-bold">
                  <th className="p-4">Source (Old URL)</th>
                  <th className="p-4">Destination (New URL)</th>
                  <th className="p-4 text-center">Type</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {redirects.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 font-semibold text-slate-700 flex items-center gap-1.5 max-w-[220px] truncate">
                      <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span title={r.oldUrl}>{r.oldUrl}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-600 max-w-[220px] truncate">
                      <span title={r.newUrl}>{r.newUrl}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${r.type === '301' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(r.id, r.oldUrl)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {redirects.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              No URL redirects set up. Add your first rule in the left column.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
