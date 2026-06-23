import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Clock, CheckCircle2, Package, Filter, 
  Settings, Download, Search, X, ChevronRight, Phone, Mail, MapPin, Building2, Save, Trash2
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';
import { useStore } from '../../context/StoreContext';

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  Delivered: { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3 h-3" /> },
  Processing: { color: 'bg-blue-100 text-blue-700', icon: <Clock className="w-3 h-3" /> },
  Shipped: { color: 'bg-violet-100 text-violet-700', icon: <Package className="w-3 h-3" /> },
};

export default function AdminOrders() {
  const { settings, updateGeneralSettings } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [waNumber, setWaNumber] = useState(settings?.orderWhatsAppNumber || '');
  
  // Filter States
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDay, setFilterDay] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({
        ...d.data(),
        id: d.id,
        dateObj: d.data().createdAt?.toDate() || new Date()
      }));
      setOrders(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setWaNumber(settings?.orderWhatsAppNumber || '');
  }, [settings]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const d = order.dateObj;
      if (filterYear && d.getFullYear().toString() !== filterYear) return false;
      if (filterMonth && (d.getMonth() + 1).toString() !== filterMonth) return false;
      if (filterDay && d.getDate().toString() !== filterDay) return false;
      return true;
    });
  }, [orders, filterYear, filterMonth, filterDay]);

  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const revenue = filteredOrders.reduce((s, o) => s + (o.total || 0), 0);
    const delivered = filteredOrders.filter(o => o.status === 'Delivered').length;
    const processing = filteredOrders.filter(o => o.status === 'Processing').length;
    return { total, revenue, delivered, processing };
  }, [filteredOrders]);

  const downloadCSV = () => {
    const uniqueCustomers = Array.from(new Map(orders.map(o => [o.customerPhone, {
      name: o.customerName,
      phone: o.customerPhone,
      email: o.customerEmail,
      company: o.company,
      address: o.address
    }])).values());

    const headers = ['Customer Name', 'Phone', 'Email', 'Company', 'Address'];
    const rows = uniqueCustomers.map(c => [
      `"${c.name}"`, `"${c.phone}"`, `"${c.email}"`, `"${c.company}"`, `"${c.address.replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_alzaydan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearTestData = async () => {
    if (!window.confirm('Are you absolutely sure? This will permanently delete ALL orders and customer history. This action cannot be undone.')) {
      return;
    }
    
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      alert('Dashboard cleared successfully! New orders will start from 10,000.');
      setShowSettings(false);
    } catch (err) {
      console.error(err);
      alert('Failed to clear data.');
    }
  };

  const saveWaNumber = async () => {
    try {
      await updateGeneralSettings({ ...settings, orderWhatsAppNumber: waNumber });
      alert('WhatsApp Number updated successfully!');
      setShowSettings(false);
    } catch (err) {
      alert('Failed to update number.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time business overview and order tracking</p>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:text-blue-600 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Revenue', value: `AED ${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Delivered', value: stats.delivered, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Processing', value: stats.processing, icon: Clock, color: 'bg-amber-50 text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 transition-all hover:shadow-md">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500 mr-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-widest">Filters</span>
        </div>
        
        <select 
          value={filterYear} 
          onChange={(e) => setFilterYear(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
        >
          <option value="">Year (All)</option>
          {Array.from(new Set(orders.map(o => o.dateObj.getFullYear()))).sort().map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select 
          value={filterMonth} 
          onChange={(e) => setFilterMonth(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
        >
          <option value="">Month (All)</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>

        <select 
          value={filterDay} 
          onChange={(e) => setFilterDay(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
        >
          <option value="">Day (All)</option>
          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <button 
          onClick={() => { setFilterYear(''); setFilterMonth(''); setFilterDay(''); }}
          className="text-xs font-bold text-blue-600 hover:underline px-2"
        >
          Reset Filters
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Mobile</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Items</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium italic">
                    No orders found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="group hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-900 text-xs">{order.orderId || order.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                          {order.customerName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">{order.customerName}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{order.dateObj.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600 text-sm">{order.customerPhone}</td>
                    <td className="px-6 py-4">
                      <div className="max-w-[200px] truncate">
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          {order.items?.length || 0} Products
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">
                          {order.items?.map((i: any) => i.name).join(', ')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-slate-900">AED {(order.total || 0).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${STATUS_CONFIG[order.status]?.color || 'bg-slate-100 text-slate-600'}`}>
                        {STATUS_CONFIG[order.status]?.icon}
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Order {selectedOrder.orderId}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Placed on {selectedOrder.dateObj.toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {/* Customer & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Customer Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mobile</p>
                        <p className="font-bold text-slate-900">{selectedOrder.customerPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                        <p className="font-bold text-slate-900">{selectedOrder.customerEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Shipping Address</h4>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {selectedOrder.company && (
                      <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-1">
                        <Building2 className="w-4 h-4" />
                        {selectedOrder.company}
                      </div>
                    )}
                    <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                      {selectedOrder.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Order Items</h4>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-white border-b border-gray-50 last:border-0">
                      <div className="w-14 h-14 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm leading-tight">{item.name}</p>
                        <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase">QTY: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-slate-900 text-sm">AED {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="bg-slate-50 p-4 flex justify-between items-center">
                    <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">Total Payment</span>
                    <span className="text-lg font-extrabold text-slate-900">AED {(selectedOrder.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-gray-100 flex gap-3">
              {['Processing', 'Shipped', 'Delivered'].map(status => (
                <button 
                  key={status}
                  disabled={selectedOrder.status === status}
                  onClick={async () => {
                    await updateDoc(doc(db, 'orders', selectedOrder.id), { status });
                    setSelectedOrder({...selectedOrder, status});
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                    selectedOrder.status === status 
                    ? 'bg-white text-slate-300 border border-slate-100' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Dashboard Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* WhatsApp Config */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Order Notifications</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Order Receiving WhatsApp</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="+971 50 123 4567"
                          value={waNumber}
                          onChange={(e) => setWaNumber(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                      <button 
                        onClick={saveWaNumber}
                        className="bg-blue-600 text-white px-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic px-1">This number will receive the professional bill formatted messages via WhatsApp.</p>
                  </div>
                </div>
              </div>

              {/* Data Export */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Data Management</h4>
                <div className="space-y-3">
                  <button 
                    onClick={downloadCSV}
                    className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                  >
                    <Download className="w-5 h-5" />
                    Download Customer Database
                  </button>
                  
                  <button 
                    onClick={clearTestData}
                    className="w-full flex items-center justify-center gap-3 bg-white text-red-600 border border-red-100 py-4 rounded-2xl font-bold hover:bg-red-50 transition-all active:scale-[0.98]"
                  >
                    <Trash2 className="w-5 h-5" />
                    Clear Test Data
                  </button>
                </div>
                <p className="text-center text-[10px] text-slate-400 mt-3 font-medium px-4 leading-relaxed uppercase tracking-wider">
                  Clears all current orders and customer history. New orders will automatically restart with 10,000+ IDs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
