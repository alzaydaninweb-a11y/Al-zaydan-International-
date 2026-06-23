import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { PlusCircle, Search, Pencil, Trash2, Star, Loader2, AlertCircle, X } from 'lucide-react';

export default function AdminProducts() {
  const { products, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);
    try {
      await deleteProduct(id);
    } catch (e: unknown) {
      console.error('Delete failed:', e);
      const msg = e instanceof Error ? e.message : String(e);
      // Surface a friendly but informative error
      if (msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
        setDeleteError(
          'Permission denied: Firestore security rules are blocking the delete. ' +
          'Go to Firebase Console → Firestore → Rules and allow authenticated write/delete access.'
        );
      } else {
        setDeleteError(`Delete failed: ${msg}`);
      }
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
      if (!deleteError) setConfirmDeleteId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Products</h1>
          <p className="text-slate-500 text-sm mt-0.5">{products.length} total products in Firestore</p>
        </div>
        <Link to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition-colors">
          <PlusCircle className="w-4 h-4" /> Add New Product
        </Link>
      </div>

      {/* Delete Error Banner */}
      {deleteError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 mb-4 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
          <span className="flex-1">{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name or brand..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none transition-colors" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 font-medium focus:border-blue-500 outline-none transition-colors bg-white">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3.5">Product</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Category</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5">Price</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Stock</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Featured</th>
                <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    No products match your search.
                  </td>
                </tr>
              ) : (
                filtered.map(product => (
                  <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${deletingId === product.id ? 'opacity-40' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-gray-100">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate max-w-[200px]">{product.name}</div>
                          <div className="text-xs text-slate-400 font-medium">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">{product.category}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">AED {product.price.toFixed(0)}</div>
                      {product.discount > 0 && <div className="text-xs text-emerald-600 font-semibold">{product.discount}% off</div>}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${product.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      {product.featured ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                          <Star className="w-3 h-3 fill-current" /> Featured
                        </span>
                      ) : <span className="text-xs text-slate-400 font-medium">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {deletingId === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400 ml-auto" />
                      ) : confirmDeleteId === product.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-slate-500 font-medium">Delete?</span>
                          <button onClick={() => handleDelete(product.id)} className="text-xs font-bold text-red-600 hover:underline">Yes</button>
                          <button onClick={() => setConfirmDeleteId(null)} className="text-xs font-bold text-slate-500 hover:underline">No</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/admin/products/edit/${product.id}`}
                            className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button onClick={() => setConfirmDeleteId(product.id)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
