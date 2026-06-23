import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  Package, Tag, Star, TrendingUp, ShoppingBag, PlusCircle,
  ArrowRight, Trash2, Loader2, CheckCircle2, AlertTriangle,
} from 'lucide-react';

// ─── Duplicate Cleaner ────────────────────────────────────────────────────────

function DuplicateCleaner() {
  const { products } = useStore();
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle');
  const [removed, setRemoved] = useState(0);
  const [preview, setPreview] = useState<{ products: number } | null>(null);

  const getDuplicateIds = () => {
    // Products: keep first occurrence of each name, delete the rest
    const seenProducts = new Map<string, boolean>();
    const dupProductIds: string[] = [];
    for (const p of products) {
      const key = (p.name || '').trim().toLowerCase();
      if (!key) continue; // Skip empty names
      if (seenProducts.has(key)) {
        dupProductIds.push(p.id);
      } else {
        seenProducts.set(key, true);
      }
    }

    return { dupProductIds };
  };

  const handleScan = () => {
    const { dupProductIds } = getDuplicateIds();
    setPreview({ products: dupProductIds.length });
    setStatus('idle');
  };

  const handleClean = async () => {
    setStatus('scanning');
    setRemoved(0);
    try {
      const { dupProductIds } = getDuplicateIds();
      const total = dupProductIds.length;

      if (total === 0) {
        setStatus('done');
        setRemoved(0);
        return;
      }

      // Delete in batches of 400 (Firestore batch limit is 500)
      const allDeletes = [
        ...dupProductIds.map(id => doc(db, 'products', id)),
      ];

      const BATCH_SIZE = 400;
      for (let i = 0; i < allDeletes.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        allDeletes.slice(i, i + BATCH_SIZE).forEach(ref => batch.delete(ref));
        await batch.commit();
      }

      setRemoved(total);
      setStatus('done');
      setPreview(null);
    } catch (err) {
      console.error('Cleanup error:', err);
      setStatus('error');
    }
  };

  const { dupProductIds } = getDuplicateIds();
  const totalDups = dupProductIds.length;

  if (totalDups === 0 && status !== 'done') return null;

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${
      status === 'done' ? 'bg-emerald-50 border-emerald-200' :
      status === 'error' ? 'bg-red-50 border-red-200' :
      'bg-amber-50 border-amber-200'
    }`}>
      {status === 'done' ? (
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-800 text-sm">
              {removed > 0 ? `✓ Removed ${removed} duplicate${removed !== 1 ? 's' : ''} successfully!` : '✓ No duplicates found — database is clean!'}
            </p>
            <p className="text-emerald-700 text-xs mt-0.5">Refresh the page to see the clean list.</p>
          </div>
        </div>
      ) : status === 'error' ? (
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="font-bold text-red-800 text-sm">
            Cleanup failed. Check Firestore rules — ensure authenticated users can delete documents.
          </p>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 text-sm">Duplicate data detected</p>
              <p className="text-amber-700 text-xs mt-0.5">
                {dupProductIds.length > 0 && `${dupProductIds.length} duplicate product${dupProductIds.length !== 1 ? 's' : ''}`}
                {' — click to remove them permanently.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClean}
            disabled={status === 'scanning'}
            className="shrink-0 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
          >
            {status === 'scanning'
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cleaning…</>
              : <><Trash2 className="w-3.5 h-3.5" /> Remove Duplicates</>
            }
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { products, categories } = useStore();

  const totalProducts = products.length;
  const featuredProducts = products.filter(p => p.featured).length;
  const totalCategories = categories.length;
  const inStockProducts = products.filter(p => p.inStock).length;
  const outOfStockProducts = totalProducts - inStockProducts;
  const totalBrands = new Set(products.map(p => p.brand)).size;

  const recentProducts = [...products].slice(0, 5);

  const stats = [
    { label: 'Total Products', value: totalProducts, icon: Package, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
    { label: 'Total Categories', value: totalCategories, icon: Tag, color: 'bg-violet-50 text-violet-600', border: 'border-violet-100' },
    { label: 'Featured Products', value: featuredProducts, icon: Star, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
    { label: 'Total Brands', value: totalBrands, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Welcome back, Admin. Here's what's happening.</p>
      </div>

      {/* ── Duplicate Cleaner (auto-shows if duplicates found) ── */}
      <div className="mb-5">
        <DuplicateCleaner />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`bg-white rounded-xl border ${border} p-5 shadow-sm`}>
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500 font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Products */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-slate-900">Recent Products</h2>
            <Link to="/admin/products" className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProducts.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400 text-sm font-medium">
                No products yet. <Link to="/admin/products/new" className="text-blue-600 hover:underline">Add one →</Link>
              </div>
            ) : (
              recentProducts.map(product => (
                <div key={product.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{product.name}</div>
                    <div className="text-xs text-slate-400 font-medium">{product.category} · {product.brand}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-slate-900">AED {Number(product.price || 0).toFixed(0)}</div>
                    <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${product.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions + Inventory Summary */}
        <div className="flex flex-col gap-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/admin/products/new" className="flex items-center gap-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
                <PlusCircle className="w-4 h-4" /> Add New Product
              </Link>
              <Link to="/admin/categories" className="flex items-center gap-3 w-full border border-gray-200 hover:bg-gray-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
                <Tag className="w-4 h-4" /> Manage Categories
              </Link>
              <Link to="/admin/homepage" className="flex items-center gap-3 w-full border border-gray-200 hover:bg-gray-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
                <Star className="w-4 h-4" /> Edit Featured Products
              </Link>
              <Link to="/admin/orders" className="flex items-center gap-3 w-full border border-gray-200 hover:bg-gray-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
                <ShoppingBag className="w-4 h-4" /> View Orders
              </Link>
            </div>
          </div>

          {/* Inventory Summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-bold text-slate-900 mb-4">Inventory Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">In Stock</span>
                <span className="font-bold text-emerald-700">{inStockProducts} products</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all"
                  style={{ width: totalProducts > 0 ? `${(inStockProducts / totalProducts) * 100}%` : '0%' }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Out of Stock</span>
                <span className="font-bold text-red-600">{outOfStockProducts} products</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                <span className="text-slate-600 font-medium">Categories</span>
                <span className="font-bold text-slate-900">{totalCategories}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Brands</span>
                <span className="font-bold text-slate-900">{totalBrands}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
