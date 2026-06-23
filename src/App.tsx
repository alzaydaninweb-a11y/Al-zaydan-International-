import React, { lazy, Suspense, Component, ReactNode, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

// ── Storefront pages — always eager (small, needed immediately) ───────────────
import Layout           from './components/Layout';
import Home             from './pages/Home';
import ProductPage      from './pages/ProductPage';
import CartPage         from './pages/CartPage';
import CheckoutPage     from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import SearchPage       from './pages/SearchPage';
import AboutPage        from './pages/AboutPage';
import SolutionsPage    from './pages/SolutionsPage';
import ContactPage      from './pages/ContactPage';
import LegalPage        from './pages/LegalPage';
import BlogPage         from './pages/BlogPage';
import BlogPostPage     from './pages/BlogPostPage';
import RFQPage          from './pages/RFQPage';
import CategoriesMobilePage from './pages/CategoriesMobilePage';
import ScrollToTop      from './components/ScrollToTop';
import TrafficSafetyPage        from './pages/TrafficSafetyPage';
import ReflectiveSheetingPage   from './pages/ReflectiveSheetingPage';
import PackagingMaterialsPage   from './pages/PackagingMaterialsPage';
import RoadSafetyPage           from './pages/RoadSafetyPage';

import { CartProvider }  from './context/CartContext';
import { StoreProvider, useStore } from './context/StoreContext';
import ScriptInjector    from './components/ScriptInjector';

// ── Admin panel — lazy loaded (large, only needed by admins) ──────────────────
const AdminApp = lazy(() => import('./admin/AdminApp'));
const DMApp    = lazy(() => import('./dm/DMApp'));

// ── Admin loading fallback ────────────────────────────────────────────────────
const AdminFallback = () => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(140deg, #0a0f1e 0%, #0f172a 40%, #1a1040 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{
      width: 40, height: 40,
      border: '3px solid rgba(99,102,241,0.2)',
      borderTopColor: '#6366f1',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Error Boundary — catches any crash and resets to homepage ─────────────────
// Prevents the blank white screen caused by unhandled render errors.
interface ErrorBoundaryState { hasError: boolean; }
class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error('[AppErrorBoundary] Caught error:', err, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    // Hard navigate to home to break any bad state
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#f8fafc', gap: 16, padding: 24
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Something went wrong
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0, textAlign: 'center' }}>
            A component crashed. Click below to go back to the homepage.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              background: '#2563eb', color: '#fff', border: 'none',
              padding: '10px 24px', borderRadius: 8, fontSize: 14,
              fontWeight: 700, cursor: 'pointer'
            }}
          >
            ← Back to Homepage
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Redirects Controller — matches router paths against active redirects ─────
function RedirectController() {
  const { redirects } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!redirects || redirects.length === 0) return;
    
    const currentPath = location.pathname.toLowerCase().replace(/\/$/, '');
    
    const matched = redirects.find(r => {
      if (!r.active) return false;
      const oldUrlClean = r.oldUrl.trim().toLowerCase().replace(/\/$/, '');
      return oldUrlClean === currentPath || 
             (oldUrlClean.startsWith('/') ? oldUrlClean : '/' + oldUrlClean) === currentPath;
    });

    if (matched) {
      console.log(`[Redirects] Routing client-side redirect: ${location.pathname} -> ${matched.newUrl}`);
      let target = matched.newUrl.trim();
      if (!target.startsWith('/') && !target.startsWith('http')) {
        target = '/' + target;
      }
      
      if (target.startsWith('http')) {
        window.location.href = target;
      } else {
        navigate(target, { replace: true });
      }
    }
  }, [location.pathname, redirects, navigate]);

  return null;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppErrorBoundary>
      <StoreProvider>
        <ScriptInjector />
        <CartProvider>
          <BrowserRouter>
            <RedirectController />
            <ScrollToTop />
            <Routes>
              {/* Admin Panel — lazy loaded, scoped Suspense, separate from storefront */}
              <Route
                path="/admin/*"
                element={
                  <AppErrorBoundary>
                    <Suspense fallback={<AdminFallback />}>
                      <AdminApp />
                    </Suspense>
                  </AppErrorBoundary>
                }
              />

              {/* DM Panel — lazy loaded */}
              <Route
                path="/dm/*"
                element={
                  <AppErrorBoundary>
                    <Suspense fallback={<AdminFallback />}>
                      <DMApp />
                    </Suspense>
                  </AppErrorBoundary>
                }
              />

              {/* Main Storefront — ALL EAGER, zero Suspense, zero blank flash */}
              <Route path="/" element={<Layout />}>
                <Route index                element={<Home />} />
                <Route path="about"         element={<AboutPage />} />
                <Route path="solutions"     element={<SolutionsPage />} />
                <Route path="contact"       element={<ContactPage />} />
                <Route path="legal"         element={<LegalPage />} />
                <Route path="search"        element={<SearchPage />} />
                <Route path="category/:slug" element={<SearchPage />} />
                <Route path="categories"    element={<CategoriesMobilePage />} />
                <Route path="product/:slug" element={<ProductPage />} />
                <Route path="cart"          element={<CartPage />} />
                <Route path="checkout"      element={<CheckoutPage />} />
                <Route path="order-success" element={<OrderSuccessPage />} />
                <Route path="blog"          element={<BlogPage />} />
                <Route path="blog/:slug"    element={<BlogPostPage />} />
                <Route path="rfq"           element={<RFQPage />} />
                {/* SEO keyword landing pages */}
                <Route path="traffic-safety-equipment-uae"   element={<TrafficSafetyPage />} />
                <Route path="road-safety-products-uae"       element={<RoadSafetyPage />} />
                <Route path="reflective-sheeting-uae"        element={<ReflectiveSheetingPage />} />
                <Route path="packaging-materials-supplier-uae" element={<PackagingMaterialsPage />} />
                <Route path="*"             element={<Home />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </StoreProvider>
    </AppErrorBoundary>
  );
}
