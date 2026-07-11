import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Grid, Search, MessageSquare, User, CheckCircle, X, ArrowRight, ClipboardList } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import StickyProcurementDock from './ui/StickyProcurementDock';
import MarketingPopup from './ui/MarketingPopup';

export default function Layout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { toastItem, clearToast, cartCount } = useCart();
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (toastItem) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastItem]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <StickyProcurementDock />

      {/* Mobile Sticky Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden flex items-center justify-around py-2 z-40">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 text-center ${currentPath === '/' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
        >
          <HomeIcon className="w-5.5 h-5.5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link
          to="/categories"
          className={`flex flex-col items-center gap-0.5 text-center ${currentPath.startsWith('/categories') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
        >
          <Grid className="w-5.5 h-5.5" />
          <span className="text-[10px] font-medium">Categories</span>
        </Link>

        <Link
          to="/search?focus=true"
          className={`flex flex-col items-center gap-0.5 text-center ${location.search.includes('focus=true') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
        >
          <Search className="w-5.5 h-5.5" />
          <span className="text-[10px] font-medium">Search</span>
        </Link>

        <Link
          to="/contact?inquiry=true"
          className={`flex flex-col items-center gap-0.5 text-center ${location.search.includes('inquiry=true') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
        >
          <MessageSquare className="w-5.5 h-5.5" />
          <span className="text-[10px] font-medium">Messages</span>
        </Link>

        <Link
          to="/contact"
          className={`flex flex-col items-center gap-0.5 text-center ${currentPath === '/contact' && !location.search ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
        >
          <User className="w-5.5 h-5.5" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>

      {/* Global Add to Cart Toast */}
      {toastItem && (
        <div className="fixed bottom-[85px] lg:bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900 shadow-2xl rounded-xl p-4 z-50 flex items-center justify-between border border-slate-700 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white text-sm font-bold whitespace-nowrap">Added to Quote</span>
              <span className="text-slate-400 text-xs truncate max-w-[130px]">{toastItem.product.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 border-l border-slate-700 pl-3 ml-2">
            <Link
              to="/cart"
              onClick={clearToast}
              className="text-blue-400 hover:text-blue-300 text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-colors"
            >
              View Quote List <ArrowRight className="w-3 h-3" />
            </Link>
            <button onClick={clearToast} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Quote list button (B2B Bouncing Shortcut) */}
      {cartCount > 0 && currentPath !== '/cart' && (
        <Link
          to="/cart"
          title="View Quote List"
          className={`fixed bottom-[95px] lg:bottom-8 right-6 z-50 p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 border hover:scale-110 active:scale-95 group ${
            bounce
              ? 'bg-emerald-600 text-white border-emerald-400 animate-bounce scale-110 shadow-emerald-500/30'
              : 'bg-[#0052d9] text-white border-blue-400 hover:bg-blue-700 shadow-blue-500/20'
          }`}
        >
          <ClipboardList className="w-6.5 h-6.5" />
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-all group-hover:scale-110">
            {cartCount}
          </span>
        </Link>
      )}

      {/* Global Marketing Popup */}
      <MarketingPopup />
    </div>
  );
}
