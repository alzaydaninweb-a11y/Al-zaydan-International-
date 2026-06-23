import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PlusCircle, Pencil, Trash2, Check, X, Tag, Loader2, Image as ImageIcon, Upload, Folder, FolderOpen, CornerDownRight, ChevronRight, Settings, LayoutGrid } from 'lucide-react';
import { uploadToR2 } from '../../lib/cloudflareR2';
import { generateSlug } from '../../lib/blogService';

export default function AdminCategories() {
  const { categories, categoryImages, categoryDetails, products, addCategory, updateCategory, deleteCategory, updateCategoryImage, updateCategoryDetails } = useStore();
  
  // Navigation State
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Editing State
  const [editValue, setEditValue] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editSeoTitle, setEditSeoTitle] = useState('');
  const [editMetaDescription, setEditMetaDescription] = useState('');
  const [editCanonicalUrl, setEditCanonicalUrl] = useState('');
  const [editFocusKeyword, setEditFocusKeyword] = useState('');
  const [editOgImage, setEditOgImage] = useState('');
  const [editNoIndex, setEditNoIndex] = useState(false);
  const [editNoFollow, setEditNoFollow] = useState(false);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<string | null>(null);
  
  // Async State
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getProductCount = (cat: string) => products.filter(p => p.category === cat).length;
  const getSubCategoryCount = (catName: string) => categories.filter(c => categoryDetails[c]?.parentId === catName).length;

  const withBusy = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Operation failed.');
    } finally { setBusy(false); }
  };

  const handleAdd = () => {
    const name = newCategoryName.trim();
    if (!name) { setError('Category name cannot be empty.'); return; }
    if (categories.includes(name)) { setError('Category already exists.'); return; }
    withBusy(async () => {
      // Create under the active category if we are drilled down
      await addCategory(name, activeCategory || null);
      setNewCategoryName('');
      setIsCreateModalOpen(false);
      setError('');
    });
  };

  const handleSaveSettings = () => {
    if (!activeCategory) return;
    const name = editValue.trim();
    if (!name) return;
    if (name !== activeCategory && categories.includes(name)) { setError('Category name already exists.'); return; }
    
    withBusy(async () => {
      await updateCategory(activeCategory, name);
      if (editImageUrl.trim() !== (categoryImages[activeCategory] || '')) {
        await updateCategoryImage(name, editImageUrl.trim());
      }
      await updateCategoryDetails(name, {
        slug: editSlug.trim() || generateSlug(name),
        seoTitle: editSeoTitle.trim(),
        metaDescription: editMetaDescription.trim(),
        canonicalUrl: editCanonicalUrl.trim(),
        focusKeyword: editFocusKeyword.trim(),
        ogImage: editOgImage.trim(),
        noIndex: editNoIndex,
        noFollow: editNoFollow,
      });
      
      if (name !== activeCategory) {
        setActiveCategory(name);
      }
      setError('');
      alert('Settings saved successfully!');
    });
  };

  const handleDelete = (cat: string) => {
    if (getSubCategoryCount(cat) > 0) {
      setError('Cannot delete a category that has sub-categories.');
      return;
    }
    withBusy(async () => {
      await deleteCategory(cat);
      setConfirmDeleteCategory(null);
      if (activeCategory === cat) {
        setActiveCategory(categoryDetails[cat]?.parentId || null);
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeCategory) return;
    
    setUploadingImage(activeCategory);
    try {
      const url = await uploadToR2(file, 'categories');
      setEditImageUrl(url);
      await updateCategoryImage(activeCategory, url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Build Breadcrumbs
  const buildBreadcrumbs = () => {
    const crumbs = [];
    let current = activeCategory;
    while (current) {
      crumbs.unshift(current);
      current = categoryDetails[current]?.parentId || null;
    }
    return crumbs;
  };

  const loadSettings = (cat: string) => {
    setEditValue(cat);
    setEditImageUrl(categoryImages[cat] || '');
    const details = categoryDetails[cat] || {};
    setEditSlug(details.slug || generateSlug(cat));
    setEditSeoTitle(details.seoTitle || '');
    setEditMetaDescription(details.metaDescription || '');
    setEditCanonicalUrl(details.canonicalUrl || '');
    setEditFocusKeyword(details.focusKeyword || '');
    setEditOgImage(details.ogImage || '');
    setEditNoIndex(details.noIndex || false);
    setEditNoFollow(details.noFollow || false);
  };

  const navigateTo = (cat: string | null) => {
    setActiveCategory(cat);
    setError('');
    if (cat) loadSettings(cat);
  };

  const visibleCategories = categories.filter(c => (categoryDetails[c]?.parentId || null) === activeCategory);

  const breadcrumbs = buildBreadcrumbs();

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-slate-50">
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-2">
            <button onClick={() => navigateTo(null)} className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4" />
              All Categories
            </button>
            {breadcrumbs.map(crumb => (
              <React.Fragment key={crumb}>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <button 
                  onClick={() => navigateTo(crumb)}
                  className={`hover:text-blue-600 transition-colors ${crumb === activeCategory ? 'text-slate-900' : ''}`}
                >
                  {crumb}
                </button>
              </React.Fragment>
            ))}
          </nav>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {activeCategory ? activeCategory : 'Category Dashboard'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {activeCategory 
              ? 'Manage settings and sub-categories for this section.'
              : 'Overview of all your top-level product categories.'}
          </p>
        </div>
        
        <button 
          onClick={() => {
            setNewCategoryName('');
            setError('');
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-600/20"
        >
          <PlusCircle className="w-4 h-4" /> 
          {activeCategory ? 'Add Sub-category' : 'Create Category'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-8 flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Sub-categories List */}
        <div className={`lg:col-span-2 space-y-6 ${!activeCategory && 'lg:col-span-3'}`}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-[15px] flex items-center gap-2">
                <Folder className="w-4 h-4 text-blue-500" />
                {activeCategory ? 'Sub-categories' : 'Top Level Categories'}
              </h2>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {visibleCategories.length}
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {visibleCategories.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <FolderOpen className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-800 font-bold mb-1">No Categories Found</h3>
                  <p className="text-slate-500 text-sm max-w-sm">
                    {activeCategory 
                      ? "This category doesn't have any sub-categories yet."
                      : "You haven't created any categories yet."}
                  </p>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-6 text-blue-600 font-bold text-sm hover:underline"
                  >
                    + Create First Category
                  </button>
                </div>
              ) : (
                visibleCategories.map(cat => {
                  const prodCount = getProductCount(cat);
                  const subCount = getSubCategoryCount(cat);
                  
                  return (
                    <div 
                      key={cat} 
                      onClick={() => navigateTo(cat)}
                      className="px-6 py-4 hover:bg-blue-50/50 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                          {categoryImages[cat] ? (
                            <img src={categoryImages[cat]} alt={cat} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{cat}</h4>
                          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1"><Folder className="w-3 h-3" /> {subCount} sub-categories</span>
                            <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {prodCount} products</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-blue-100 text-slate-300 group-hover:text-blue-600 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Settings (Only visible when drilled in) */}
        {activeCategory && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-slate-800 text-[15px] flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-500" />
                  Category Settings
                </h2>
                {confirmDeleteCategory !== activeCategory && (
                  <button onClick={() => setConfirmDeleteCategory(activeCategory)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                    title="Delete Category">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {confirmDeleteCategory === activeCategory && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <h4 className="font-bold text-red-800 text-sm mb-1">Delete Category?</h4>
                  <p className="text-red-600 text-xs mb-3">This action cannot be undone.</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDelete(activeCategory)} disabled={busy} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors flex-1 text-center">
                      Yes, Delete
                    </button>
                    <button onClick={() => setConfirmDeleteCategory(null)} className="bg-white hover:bg-red-50 text-red-700 border border-red-200 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors flex-1 text-center">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />

              <div className="space-y-4">
                {/* Image Upload Area */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cover Image</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-colors"
                  >
                    {uploadingImage === activeCategory ? (
                      <div className="flex flex-col items-center text-blue-500">
                        <Loader2 className="w-6 h-6 animate-spin mb-2" />
                        <span className="text-xs font-bold">Uploading...</span>
                      </div>
                    ) : editImageUrl ? (
                      <>
                        <img src={editImageUrl} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white text-xs font-bold flex items-center gap-1"><Upload className="w-3 h-3" /> Replace Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500 transition-colors">
                        <ImageIcon className="w-6 h-6 mb-2" />
                        <span className="text-xs font-bold">Click to upload</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Category Name</label>
                  <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none bg-white font-semibold transition-all" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">URL Slug</label>
                  <input type="text" value={editSlug} onChange={e => setEditSlug(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none bg-white transition-all font-mono text-slate-600" />
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-slate-800 mb-3">SEO Controls</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">SEO Title</label>
                      <input type="text" value={editSeoTitle} onChange={e => setEditSeoTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none bg-white transition-all" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Meta Description</label>
                      <textarea rows={2} value={editMetaDescription} onChange={e => setEditMetaDescription(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none bg-white transition-all resize-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <button 
                    onClick={handleSaveSettings} 
                    disabled={busy}
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal overlay */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-500" />
                {activeCategory ? 'New Sub-category' : 'New Top-level Category'}
              </h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {activeCategory && (
                <div className="mb-5 text-sm">
                  <span className="text-slate-500">Creating inside: </span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{activeCategory}</span>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={e => { setNewCategoryName(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder="e.g. Power Drills"
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-slate-900" 
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdd} 
                  disabled={busy}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 disabled:opacity-60"
                >
                  {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
