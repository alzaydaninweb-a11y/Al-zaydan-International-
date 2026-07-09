import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { useStore } from './StoreContext';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────
export type AuthView = 'login' | 'forgot';

interface AdminAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  // Login
  login: (email: string, password: string) => Promise<void>;
  loginError: string;
  loginLoading: boolean;
  // Forgot password
  sendReset: (email: string) => Promise<boolean>; // returns true on success
  resetError: string;
  resetLoading: boolean;
  // Logout
  logout: () => Promise<void>;
  // Security IP verification
  currentIp: string;
  isIpAuthorized: boolean;
  ipLoading: boolean;
}

// ─── Friendly error messages ──────────────────────────────────────────────────
function friendlyError(err: unknown): string {
  if (!(err instanceof Error)) return 'Something went wrong. Please try again.';
  const msg = err.message;
  if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found'))
    return 'Incorrect email or password. Please check and try again.';
  if (msg.includes('auth/too-many-requests'))
    return 'Too many failed attempts. Please try again later or reset your password.';
  if (msg.includes('auth/invalid-email'))
    return 'Please enter a valid email address.';
  if (msg.includes('auth/user-disabled'))
    return 'This account has been disabled. Contact support.';
  if (msg.includes('auth/network-request-failed'))
    return 'Network error. Please check your connection and try again.';
  return msg.replace('Firebase: ', '').replace(/\s*\(auth\/[^)]+\)\.?\s*/g, '').trim()
    || 'An unexpected error occurred.';
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useStore();
  const [user, setUser]               = useState<User | null>(null);
  const [loading, setLoading]         = useState(true);
  const [loginError, setLoginError]   = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [resetError, setResetError]   = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // IP state
  const [currentIp, setCurrentIp] = useState('');
  const [ipLoading, setIpLoading] = useState(true);

  const fetchClientIp = async () => {
    try {
      const res = await fetch('/api/get-ip');
      if (res.ok) {
        const data = await res.json();
        if (data && data.ip) {
          setCurrentIp(data.ip);
          return;
        }
      }
      // If endpoint is not found (e.g. running on Vite port 3000), throw to trigger fallback
      throw new Error('Local API endpoint returned non-ok status');
    } catch (err) {
      console.warn('[AdminAuth] Local IP endpoint failed, falling back to ipify:', err.message || err);
      try {
        const fallbackRes = await fetch('https://api.ipify.org?format=json');
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData && fallbackData.ip) {
            setCurrentIp(fallbackData.ip);
          }
        }
      } catch (fallbackErr) {
        console.error('[AdminAuth] Fallback IP detection failed:', fallbackErr);
      }
    } finally {
      setIpLoading(false);
    }
  };

  useEffect(() => {
    fetchClientIp();
    // Poll every 30 seconds to catch active session network changes
    const interval = setInterval(fetchClientIp, 30000);
    return () => clearInterval(interval);
  }, []);

  // Emergency rescue bypass check (?bypass=az_rescue_admin)
  const hasRescueBypass = useMemo(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('bypass') === 'az_rescue_admin') {
        localStorage.setItem('az_ip_bypass', 'true');
        return true;
      }
      return localStorage.getItem('az_ip_bypass') === 'true';
    } catch (err) {
      return false;
    }
  }, []);

  const isIpAuthorized = useMemo(() => {
    // 1. If restriction is disabled, let them in
    if (!settings?.adminIpRestrictionEnabled) return true;

    // 2. If rescue bypass is active in localStorage/URL, bypass
    if (hasRescueBypass) return true;

    const cleanClient = currentIp.replace(/^::ffff:/, '').trim();

    // 3. Localhost developer bypass
    if (cleanClient === '127.0.0.1' || cleanClient === '::1' || cleanClient === 'localhost' || !cleanClient) {
      return true;
    }

    const allowedIps = settings.adminAllowedIps || [];

    // 4. If whitelist is empty, default to open access to prevent lockout
    if (allowedIps.length === 0) return true;

    // 5. Compare with whitelisted subnets/IPs
    return allowedIps.some(allowed => {
      const cleanAllowed = allowed.replace(/^::ffff:/, '').trim();
      if (cleanAllowed.endsWith('*')) {
        const prefix = cleanAllowed.slice(0, -1);
        return cleanClient.startsWith(prefix);
      }
      return cleanClient === cleanAllowed;
    });
  }, [settings, currentIp, hasRescueBypass]);

  // Watch Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    setLoginError('');
    setLoginLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setUser(cred.user);
    } catch (err) {
      setLoginError(friendlyError(err));
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Send password reset email ─────────────────────────────────────────────
  const sendReset = async (email: string): Promise<boolean> => {
    setResetError('');
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      setResetError(friendlyError(err));
      return false;
    } finally {
      setResetLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setLoginError('');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        loginError,
        loginLoading,
        sendReset,
        resetError,
        resetLoading,
        logout,
        currentIp,
        isIpAuthorized,
        ipLoading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
