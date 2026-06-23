import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore, CategoryDetails } from '../../context/StoreContext';
import { ChevronLeft, Save, Search, Loader2 } from 'lucide-react';
import { generateSlug } from '../../lib/blogService';

export default function AdminSEOBulk() {
  const { categories, categoryDetails, updateCategoriesBulk } = useStore();
  
  // Local changes tracker: Record<categoryName, Partial<CategoryDetails>>
  const [changes, setChanges] = useState<Record<string, Partial<CategoryDetails>>>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    return categories.filter(c =>
      c.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  // Handle local cell edit
  const handleEdit = (catName: string, field: keyof CategoryDetails, value: any) => {
    const original = categoryDetails[catName] || {
      name: catName,
      slug: generateSlug(catName),
      seoTitle: '',
      metaDescription: '',
      noIndex: false
    };

    setChanges(prev => {
      const catChanges = { ...prev[catName], [field]: value };
      
      // If the changes equal the original category parameters, remove from changes dictionary
      const isOriginal = (original as any)[field] === value;
      if (isOriginal) {
        delete catChanges[field];
      }

      if (Object.keys(catChanges).length === 0) {
        const next = { ...prev };
        delete next[catName];
        return next;
      }

      return { ...prev, [catName]: catChanges };
    });
  };

  // Auto-generate slugs bulk helper
  const handleAutoGenerateSlugs = () => {
    const newChanges = { ...changes };
    categories.forEach(catName => {
      const details = categoryDetails[catName] || {};
      const currentSlug = newChanges[catName]?.slug ?? details.slug;
      if (!currentSlug) {
        if (!newChanges[catName]) newChanges[catName] = {};
        newChanges[catName].slug = generateSlug(catName);
      }
    });
    setChanges(newChanges);
  };

  // Submit bulk batch saves to Firestore
  const handleSave = async () => {
    const changeList = Object.entries(changes).map(([name, data]) => ({ name, data }));
    if (changeList.length === 0) return;

    setSaving(true);
    try {
      await updateCategoriesBulk(changeList);
      setChanges({});
      alert(`Successfully saved ${changeList.length} categories!`);
    } catch (err) {
      console.error(err);
      alert('Save failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = Object.keys(changes).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/seo-dashboard" className="p-2 bg-white hover:bg-slate-100 rounded-lg border border-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Bulk SEO Spreadsheet Editor</h1>
            <p className="text-slate-500 text-sm mt-0.5">Edit multiple categories' titles, descriptions, slugs, and robots indexes at once.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 animate-pulse">
              {pendingCount} unsaved category changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || pendingCount === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Toolbar / Search Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search categories by name..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleAutoGenerateSlugs}
            className="px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 text-slate-700 rounded-lg text-[11px] font-bold transition-all shadow-sm"
          >
            Auto-generate Slugs
          </button>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="bg-slate-50/70 border-b border-gray-200 text-slate-500 uppercase tracking-widest font-bold select-none">
                <th className="p-4 w-[250px]">Category Name</th>
                <th className="p-4 w-[180px]">Slug (/category/...)</th>
                <th className="p-4 w-[220px]">SEO Title</th>
                <th className="p-4 w-[350px]">Meta Description</th>
                <th className="p-4 w-[100px] text-center">Index Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map(catName => {
                const isDirty = changes[catName] !== undefined;
                const catChanges = changes[catName] || {};
                const details = categoryDetails[catName] || {};
                
                const slugVal = catChanges.slug !== undefined ? catChanges.slug : (details.slug || '');
                const titleVal = catChanges.seoTitle !== undefined ? catChanges.seoTitle : (details.seoTitle || '');
                const descVal = catChanges.metaDescription !== undefined ? catChanges.metaDescription : (details.metaDescription || '');
                const noIndexVal = catChanges.noIndex !== undefined ? catChanges.noIndex : (details.noIndex || false);

                return (
                  <tr key={catName} className={`hover:bg-slate-50/30 transition-colors ${isDirty ? 'bg-amber-50/10' : ''}`}>
                    
                    {/* Name */}
                    <td className="p-4 font-semibold text-slate-800">
                      <div className="max-w-[230px] truncate" title={catName}>
                        {catName}
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="p-4">
                      <input
                        type="text"
                        value={slugVal}
                        onChange={e => handleEdit(catName, 'slug', e.target.value)}
                        placeholder="auto-slug-url"
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded focus:border-blue-500 focus:bg-white outline-none bg-slate-50/50"
                      />
                    </td>

                    {/* SEO Title */}
                    <td className="p-4">
                      <input
                        type="text"
                        value={titleVal}
                        onChange={e => handleEdit(catName, 'seoTitle', e.target.value)}
                        placeholder={catName + ' Equipment UAE'}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded focus:border-blue-500 focus:bg-white outline-none bg-slate-50/50"
                      />
                      <div className="text-[9px] text-right text-slate-400 mt-0.5">
                        {titleVal.length}/60 chars
                      </div>
                    </td>

                    {/* Meta Description */}
                    <td className="p-4">
                      <textarea
                        rows={1}
                        value={descVal}
                        onChange={e => handleEdit(catName, 'metaDescription', e.target.value)}
                        placeholder={`Buy ${catName} supplies in UAE...`}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded focus:border-blue-500 focus:bg-white outline-none bg-slate-50/50 resize-y min-h-[34px]"
                      />
                      <div className="text-[9px] text-right text-slate-400 mt-0.5">
                        {descVal.length}/160 chars
                      </div>
                    </td>

                    {/* Indexing status checkbox */}
                    <td className="p-4 text-center">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!noIndexVal}
                          onChange={e => handleEdit(catName, 'noIndex', !e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                        <span className={`text-[10px] font-bold ${!noIndexVal ? 'text-green-600' : 'text-red-500'}`}>
                          {!noIndexVal ? 'INDEX' : 'NOINDEX'}
                        </span>
                      </label>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredCategories.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">
            No categories found matching your search filters.
          </div>
        )}
      </div>

    </div>
  );
}
