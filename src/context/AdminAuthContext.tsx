import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
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
  const [user, setUser]               = useState<User | null>(null);
  const [loading, setLoading]         = useState(true);
  const [loginError, setLoginError]   = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [resetError, setResetError]   = useState('');
  const [resetLoading, setResetLoading] = useState(false);

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
