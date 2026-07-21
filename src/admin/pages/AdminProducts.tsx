import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { PlusCircle, Search, Pencil, Trash2, Star, Loader2, AlertCircle, X, Download } from 'lucide-react';

export default function AdminProducts() {
  const { products, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const exportToExcelXML = () => {
    // 1. Group products by category
    const productsByCategory: Record<string, typeof products> = {};
    products.forEach(p => {
      const cat = p.category ? p.category.trim() : 'Uncategorized';
      if (!productsByCategory[cat]) {
        productsByCategory[cat] = [];
      }
      productsByCategory[cat].push(p);
    });

    // 2. Sort categories alphabetically (Uncategorized at the end)
    const sortedCategories = Object.keys(productsByCategory).sort((a, b) => {
      if (a === 'Uncategorized') return 1;
      if (b === 'Uncategorized') return -1;
      return a.localeCompare(b);
    });

    // 3. XML Helper functions
    const escapeXML = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const seenSheetNames = new Set<string>();
    const getUniqueSheetName = (name: string) => {
      // Excel/Sheets sheet names cannot exceed 31 chars and cannot contain: \ / ? * : [ ]
      let cleanName = name.replace(/[\\\/\?\*\:\[\]]/g, '');
      if (!cleanName) {
        cleanName = 'General';
      }
      let uniqueName = cleanName.substring(0, 31);
      let counter = 1;
      while (seenSheetNames.has(uniqueName.toLowerCase())) {
        const suffix = ` (${counter})`;
        uniqueName = cleanName.substring(0, 31 - suffix.length) + suffix;
        counter++;
      }
      seenSheetNames.add(uniqueName.toLowerCase());
      return uniqueName;
    };

    // 4. Build Excel XML
    const xmlHeader = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>Al Zaydan International</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Bottom"/>
      <Borders/>
      <Font ss:FontName="Calibri" x:CharSet="1" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="Header">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
    </Style>
  </Styles>`;

    const worksheetsXml = sortedCategories.map(cat => {
      const sheetName = getUniqueSheetName(cat);
      const catProducts = productsByCategory[cat];

      const rowsXml = catProducts.map(p => {
        const productUrl = p.slug ? `https://www.alzaydaninternational.com/product/${p.slug}` : '';
        return `      <Row>
        <Cell><Data ss:Type="String">${escapeXML(p.id)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXML(p.name)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXML(p.brand || '')}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXML(p.category)}</Data></Cell>
        <Cell><Data ss:Type="Number">${p.price}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXML(p.priceType || 'fixed')}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXML(p.inStock ? 'In Stock' : 'Out of Stock')}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXML(p.featured ? 'Yes' : 'No')}</Data></Cell>
        ${productUrl ? `<Cell ss:HRef="${escapeXML(productUrl)}"><Data ss:Type="String">View Product Page</Data></Cell>` : '<Cell><Data ss:Type="String"></Data></Cell>'}
      </Row>`;
      }).join('\n');

      return `  <Worksheet ss:Name="${escapeXML(sheetName)}">
    <Table>
      <Column ss:Width="150"/>
      <Column ss:Width="250"/>
      <Column ss:Width="100"/>
      <Column ss:Width="150"/>
      <Column ss:Width="80"/>
      <Column ss:Width="80"/>
      <Column ss:Width="100"/>
      <Column ss:Width="80"/>
      <Column ss:Width="200"/>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Product Code</Data></Cell>
        <Cell><Data ss:Type="String">Name</Data></Cell>
        <Cell><Data ss:Type="String">Brand</Data></Cell>
        <Cell><Data ss:Type="String">Category</Data></Cell>
        <Cell><Data ss:Type="String">Price (AED)</Data></Cell>
        <Cell><Data ss:Type="String">Price Type</Data></Cell>
        <Cell><Data ss:Type="String">Stock Status</Data></Cell>
        <Cell><Data ss:Type="String">Featured</Data></Cell>
        <Cell><Data ss:Type="String">Product Page Link</Data></Cell>
      </Row>
${rowsXml}
    </Table>
  </Worksheet>`;
    }).join('\n');

    const xmlFooter = `</Workbook>`;
    const fullXml = xmlHeader + '\n' + worksheetsXml + '\n' + xmlFooter;

    const blob = new Blob([fullXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `al_zaydan_products_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div className="flex items-center gap-3">
          <button
            onClick={exportToExcelXML}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-slate-700 border border-gray-300 text-sm font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4.5 h-4.5 text-slate-500" /> Export Google Sheet (.xls)
          </button>
          <Link to="/admin/products/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition-colors">
            <PlusCircle className="w-4 h-4" /> Add New Product
          </Link>
        </div>
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
