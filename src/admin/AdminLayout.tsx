import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  LayoutDashboard, Package, Tag, Home, ShoppingBag,
  LogOut, Menu, X, ChevronRight, Bell, Building2, Youtube, BookOpen, Settings, HeadphonesIcon, Megaphone,
  Globe, BarChart3, RefreshCw
} from 'lucide-react';

const NAV = [
  { to: '/admin/orders',    icon: LayoutDashboard,  label: 'Dashboard' },
  { to: '/admin/products',  icon: Package,         label: 'Products'  },
  { to: '/admin/categories',icon: Tag,             label: 'Categories'},
  { to: '/admin/homepage',  icon: Home,             label: 'Homepage'  },
  { to: '/admin/videos',    icon: Youtube,          label: 'Videos'    },
  { to: '/admin/blogs',     icon: BookOpen,         label: 'Blog Creator'},
  { to: '/admin/seo-dashboard', icon: BarChart3,    label: 'SEO Dashboard'},
  { to: '/admin/seo-bulk',  icon: Tag,             label: 'Bulk SEO Editor'},
  { to: '/admin/redirects', icon: RefreshCw,       label: 'Redirects Manager'},
  { to: '/admin/page-seo',  icon: Globe,            label: 'Page SEO Manager'},
  { to: '/admin/settings',  icon: Settings,         label: 'Settings'  },
  { to: '/admin/marketing', icon: Megaphone,        label: 'Marketing' },
  { to: '/admin/expert',    icon: HeadphonesIcon,   label: 'Expert Profile' },
  { to: '/admin/support',   icon: HeadphonesIcon,   label: 'Customer Support'},
  { to: '/admin/sitemap',   icon: Globe,            label: 'Sitemap Manager'},
];

export default function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-slate-800 shrink-0">
        <img
          src="/android-chrome-512x512.png"
          alt="Al Zaydan International"
          className="h-7 w-auto object-contain brightness-0 invert shrink-0"
        />
        <div>
          <div className="text-white font-bold text-sm leading-tight">Al Zaydan</div>
          <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-3 mt-1">Main Menu</p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-semibold text-slate-400 hover:bg-red-600/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-56 shrink-0 border-r border-slate-800">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="w-56 flex flex-col shadow-2xl">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <a href="/" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                View Store <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-slate-800 leading-tight">Admin</div>
                <div className="text-[10px] text-slate-400 font-medium">Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
