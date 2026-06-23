import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Grid, Search, MessageSquare, User, CheckCircle, X, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import StickyProcurementDock from './ui/StickyProcurementDock';
import MarketingPopup from './ui/MarketingPopup';

export default function Layout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { toastItem, clearToast } = useCart();

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans pb-28 lg:pb-0">
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
              <span className="text-white text-sm font-bold whitespace-nowrap">Product added</span>
              <span className="text-slate-400 text-xs truncate max-w-[130px]">{toastItem.product.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 border-l border-slate-700 pl-3 ml-2">
            <Link
              to="/cart"
              onClick={clearToast}
              className="text-blue-400 hover:text-blue-300 text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-colors"
            >
              View Cart <ArrowRight className="w-3 h-3" />
            </Link>
            <button onClick={clearToast} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Global Marketing Popup */}
      <MarketingPopup />
    </div>
  );
}
