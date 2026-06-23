import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, ShoppingCart, ChevronDown, Menu, X, Globe, User, ChevronRight
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { generateSlug } from '../../lib/blogService';
import SmartSearchDropdown, {
  getRecentSearches, saveRecentSearch, removeRecentSearch
} from '../ui/SmartSearchDropdown';

const LANGUAGES = [
  { label: 'English', code: 'en' },
  { label: 'Arabic', code: 'ar' },
  { label: 'French', code: 'fr' },
  { label: 'Chinese', code: 'zh-CN' }
];

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { cartCount } = useCart();
  const { products, categories, categoryDetails } = useStore();

  const [searchQuery, setSearchQuery]       = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [language, setLanguage]             = useState('English');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown]     = useState(false);
  const [focusedIndex, setFocusedIndex]     = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const searchRef     = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const typeDropRef   = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Load recent searches from localStorage on mount ── */
  useEffect(() => { setRecentSearches(getRecentSearches()); }, []);

  /* ── Initialize Google Translate ── */
  useEffect(() => {
    if (document.getElementById('google-translate-script')) return;
    
    const gDiv = document.createElement('div');
    gDiv.id = 'google_translate_element';
    gDiv.style.position = 'absolute';
    gDiv.style.left = '-9999px';
    gDiv.style.top = '-9999px';
    gDiv.style.width = '1px';
    gDiv.style.height = '1px';
    gDiv.style.overflow = 'hidden';
    document.body.appendChild(gDiv);

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,ar,fr,zh-CN',
        layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);
  }, []);

  const handleLanguageChange = (lang: {label: string, code: string}) => {
    setLanguage(lang.label);
    
    // Find the hidden Google Translate select and trigger it
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = lang.code;
      // Google Translate requires a bubbling change event to detect it
      select.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // Fallback: set cookie and reload if the widget hasn't fully loaded
      document.cookie = `googtrans=/en/${lang.code}; path=/`;
      window.location.reload();
    }
  };

  /* ── Debounce query ── */
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setFocusedIndex(-1);
    }, 280);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [searchQuery]);

  /* ── Show dropdown when input focused or has content ── */
  useEffect(() => {
    if (searchQuery.trim().length > 0 || document.activeElement?.getAttribute('data-smartsearch') === 'true') {
      setShowDropdown(true);
    }
  }, [searchQuery]);

  /* ── Close on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        (searchRef.current && !searchRef.current.contains(e.target as Node)) &&
        (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node))
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const commitSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    setRecentSearches(getRecentSearches());
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setSearchQuery('');
    setShowDropdown(false);
    setFocusedIndex(-1);
  }, [navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    commitSearch(searchQuery);
  };

  const handleSelectProduct = useCallback((id: string) => {
    const prod = products.find(p => p.id === id);
    const prodSlug = prod ? (prod.slug || generateSlug(prod.name)) : id;
    navigate(`/product/${prodSlug}`);
    setSearchQuery('');
    setShowDropdown(false);
    setFocusedIndex(-1);
  }, [navigate, products]);

  const handleRecentRemove = useCallback((q: string) => {
    removeRecentSearch(q);
    setRecentSearches(getRecentSearches());
  }, []);

  /* ── Keyboard navigation ── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    const MAX = 20; // rough max items; SmartDropdown manages actual count
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex(i => Math.min(i + 1, MAX)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIndex(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Escape') { setShowDropdown(false); setFocusedIndex(-1); }
  };

  /* ── Active link detection ── */
  const isActive = (to: string, label: string) => {
    if (to === '/') return pathname === '/';
    if (label === 'Products') return (pathname.startsWith('/search') || pathname.startsWith('/product')) && !search.includes('category=');
    if (label === 'Categories') return search.includes('category=') || pathname.startsWith('/categories');
    if (to === '/blog') return pathname.startsWith('/blog');
    if (to === '/contact') return pathname === '/contact';
    if (to === '/about') return pathname === '/about';
    if (to === '/rfq') return pathname === '/rfq';
    return pathname.startsWith(to);
  };

  const desktopNavLinks = [
    { label: 'Home', to: '/', dropdown: false, highlight: false },
    { label: 'Products', to: '/search', dropdown: false, highlight: false },
    { label: 'Categories', to: '/categories', dropdown: true, highlight: false },
    { label: 'About Us', to: '/about', dropdown: false, highlight: false },
    { label: 'Blogs', to: '/blog', dropdown: false, highlight: false },
    { label: 'Contact', to: '/contact', dropdown: false, highlight: false },
    { label: 'RFQ / Bulk Order', to: '/rfq', dropdown: false, highlight: true },
    { label: 'Become a Supplier', to: '/contact', dropdown: false, highlight: true },
  ];

  const mobileNavLinks = [
    { label: 'Home', to: '/', highlight: false },
    { label: 'Products', to: '/search', highlight: false },
    { label: 'Categories', to: '/categories', highlight: false },
    { label: 'About', to: '/about', highlight: false },
    { label: 'Blogs', to: '/blog', highlight: false },
    { label: 'Contact', to: '/contact', highlight: false },
    { label: 'RFQ / Bulk Order', to: '/rfq', highlight: true },
    { label: 'Become a Supplier', to: '/contact', highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 font-sans">

      {/* ─── DESKTOP HEADER ─── */}
      <div className="hidden lg:block max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">

          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/android-chrome-512x512.png"
                alt="Al Zaydan International"
                className="h-8 md:h-9 w-auto object-contain shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 uppercase leading-none group-hover:text-blue-600 transition-colors">Al Zaydan</span>
                <span className="text-[9px] font-bold tracking-[0.2em] text-blue-600 uppercase mt-1">International</span>
              </div>
            </Link>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="flex h-10 border border-gray-300 rounded-md overflow-hidden hover:border-gray-400 focus-within:border-blue-500 transition-all">
              <input
                type="text"
                data-smartsearch="true"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search products, materials, SKU codes..."
                className="flex-1 px-4 text-sm text-gray-900 outline-none placeholder-gray-400"
                autoComplete="off"
              />

              {/* Clear button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
                  className="px-2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}


              {/* Blue Search Button */}
              <button type="submit" className="px-5 bg-[#0052d9] hover:bg-blue-700 text-white flex items-center justify-center transition-colors shrink-0">
                <Search className="w-4.5 h-4.5" />
              </button>
            </form>

            {/* Smart Dropdown */}
            {showDropdown && (
              <SmartSearchDropdown
                query={debouncedQuery}
                products={products}
                categories={categories}
                focusedIndex={focusedIndex}
                onSelectText={commitSearch}
                onSelectProduct={handleSelectProduct}
                onClose={() => setShowDropdown(false)}
                onRecentRemove={handleRecentRemove}
                recentSearches={recentSearches}
              />
            )}
          </div>

          {/* Right Links */}
          <div className="flex items-center gap-6 text-gray-600 shrink-0 text-[13px] font-medium">
            <Link to="/contact" className="hover:text-blue-600 transition-colors">Become a Supplier</Link>

            <div className="relative group cursor-pointer flex items-center gap-1 hover:text-blue-600 py-2">
              <span>Buyer Center</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>

            <div className="relative group cursor-pointer flex items-center gap-1.5 hover:text-blue-600 py-2">
              <Globe className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <span>{language}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              
              {/* Language Dropdown */}
              <div className="absolute top-full right-0 mt-0 w-[140px] bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 hidden group-hover:block text-gray-700">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full text-left px-4 py-2 text-[12px] hover:bg-blue-50 hover:text-blue-600 transition-colors ${language === lang.label ? 'text-blue-600 font-semibold bg-blue-50/50' : ''}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart with badge */}
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-0 right-0 bg-[#0052d9] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── DESKTOP NAV STRIP (below search row) ─── */}
      <div className="hidden lg:block border-t border-gray-100 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-6">
          <nav className="flex items-center justify-center overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {desktopNavLinks.map(item => (
              <div key={item.label} className="relative group shrink-0">
                <Link
                  to={item.to}
                  className={`flex items-center gap-1 px-4 py-2.5 text-[12.5px] font-semibold whitespace-nowrap transition-colors border-b-2 group-hover:border-blue-600 ${
                    item.highlight 
                      ? 'text-[#0052d9] hover:text-blue-700 border-transparent' 
                      : isActive(item.to, item.label)
                        ? 'text-[#0052d9] border-[#0052d9]'
                        : 'text-gray-600 hover:text-blue-600 border-transparent'
                  }`}
                >
                  {item.label}
                  {item.dropdown && <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />}
                </Link>
                {item.dropdown && (
                  <div className="absolute top-full left-0 mt-0 w-[220px] bg-white border border-gray-200 rounded-lg shadow-xl py-1.5 z-50 hidden group-hover:block">
                    {categories.slice(0, 12).map(cat => {
                      const details = Object.values(categoryDetails || {}).find(c => c.name === cat);
                      const catSlug = details?.slug || generateSlug(cat);
                      return (
                        <Link
                          key={cat}
                          to={`/category/${catSlug}`}
                          className="flex items-center justify-between px-4 py-2 text-[12.5px] text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <span>{cat}</span>
                          <ChevronRight className="w-3 h-3 text-gray-300" />
                        </Link>
                      );
                    })}
                    <Link
                      to="/categories"
                      className="flex items-center justify-between px-4 py-2 text-[12px] text-blue-600 font-bold hover:bg-blue-50 transition-colors border-t border-gray-100 mt-1"
                    >
                      <span>View All Categories</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* ─── MOBILE HEADER ─── */}
      <div className="lg:hidden max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex flex-col gap-2.5">

          {/* Row 1: Hamburger, Logo, User, Cart */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>

              <Link to="/" className="flex items-center gap-2 group">
                <img
                  src="/android-chrome-512x512.png"
                  alt="Al Zaydan International"
                  className="h-7 w-auto object-contain shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold tracking-tight text-slate-900 uppercase leading-none group-hover:text-blue-600 transition-colors">Al Zaydan</span>
                  <span className="text-[8px] font-bold tracking-[0.2em] text-blue-600 uppercase mt-0.5">International</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/contact" className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <User className="w-5.5 h-5.5" />
              </Link>
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ShoppingCart className="w-5.5 h-5.5" />
                <span className="absolute top-0.5 right-0.5 bg-[#0052d9] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>

          {/* Row 2: Search */}
          <div className="relative w-full" ref={mobileSearchRef}>
            <form onSubmit={handleSearch} className="flex h-9 border border-gray-300 rounded-md overflow-hidden">
              <input
                type="text"
                data-smartsearch="true"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search products, materials, SKU codes..."
                className="flex-1 px-3 text-sm outline-none placeholder-gray-400"
                autoComplete="off"
              />

              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
                  className="px-2 text-gray-300 hover:text-gray-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}


              <button type="submit" className="px-4 bg-[#0052d9] hover:bg-blue-700 text-white flex items-center justify-center transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile Smart Dropdown */}
            {showDropdown && (
              <SmartSearchDropdown
                query={debouncedQuery}
                products={products}
                categories={categories}
                focusedIndex={focusedIndex}
                onSelectText={commitSearch}
                onSelectProduct={handleSelectProduct}
                onClose={() => setShowDropdown(false)}
                onRecentRemove={handleRecentRemove}
                recentSearches={recentSearches}
              />
            )}
          </div>
        </div>
      </div>

      {/* ─── MOBILE NAV STRIP (below search row) ─── */}
      <div className="lg:hidden border-t border-gray-100 bg-gray-50 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <nav className="flex items-center px-2 min-w-max">
          {mobileNavLinks.map(item => (
            <Link
              key={item.label}
              to={item.to}
              className={`px-3 py-2 text-[11.5px] font-semibold whitespace-nowrap transition-colors ${
                item.highlight 
                  ? 'text-[#0052d9]' 
                  : isActive(item.to, item.label)
                    ? 'text-[#0052d9] border-b-2 border-[#0052d9]'
                    : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ─── MOBILE DRAWER ─── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-[280px] bg-white h-full flex flex-col shadow-2xl">

            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="text-gray-900 font-bold text-base">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-gray-100 rounded-md">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto py-2">
              {/* Navigation Links */}
              <div className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Navigation</div>
              <div className="px-2 space-y-0.5">
                {([
                  { label: 'Home', to: '/' },
                  { label: 'Products', to: '/search' },
                  { label: 'About Us', to: '/about' },
                  { label: 'Blogs', to: '/blog' },
                  { label: 'Contact', to: '/contact' },
                ] as { label: string; to: string }[]).map(item => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-medium hover:bg-gray-50 ${
                      isActive(item.to, item.label) ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>

              {/* Categories */}
              <div className="px-4 py-2 mt-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Categories</div>
              <div className="px-2 space-y-0.5">
                {categories.slice(0, 9).map(cat => {
                  const details = Object.values(categoryDetails || {}).find(c => c.name === cat);
                  const catSlug = details?.slug || generateSlug(cat);
                  return (
                    <Link
                      key={cat}
                      to={`/category/${catSlug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <span>{cat}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  );
                })}
                <Link
                  to="/categories"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 mt-2 px-3 py-2 rounded-md text-[13px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <span>View All Categories</span>
                </Link>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0052d9] hover:bg-blue-700 text-white font-semibold text-sm rounded-md transition-colors"
              >
                <span>Become a Supplier</span>
              </Link>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
