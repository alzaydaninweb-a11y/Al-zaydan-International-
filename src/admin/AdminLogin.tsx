import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  ShieldCheck, Mail, Lock, Eye, EyeOff,
  Loader2, AlertCircle, ArrowLeft, MailCheck, CheckCircle2,
} from 'lucide-react';

type View = 'login' | 'forgot' | 'forgot-success';

export default function AdminLogin() {
  const { login, loginError, loginLoading, sendReset, resetError, resetLoading } = useAdminAuth();

  const [view, setView]             = useState<View>('login');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email.trim(), password);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await sendReset(resetEmail.trim());
    if (ok) setView('forgot-success');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background: #f1f5f9;
          font-family: 'Inter', sans-serif;
        }

        .lp-card {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 2.5rem 2rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04), 0 20px 40px -8px rgba(0,0,0,0.08);
          animation: fadeUp 0.35s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lp-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }
        .lp-logo-icon {
          width: 56px; height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 20px rgba(99,102,241,0.3);
          margin-bottom: 14px;
        }
        .lp-logo-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.3px;
        }
        .lp-logo-sub {
          font-size: 0.78rem;
          color: #94a3b8;
          font-weight: 500;
          margin-top: 3px;
        }

        .lp-heading {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1.5rem;
        }

        .lp-field { margin-bottom: 16px; }
        .lp-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 6px;
        }
        .lp-input-wrap { position: relative; }
        .lp-icon {
          position: absolute;
          left: 12px; top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          display: flex; align-items: center;
          pointer-events: none;
        }
        .lp-input {
          width: 100%;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 11px 14px 11px 38px;
          font-size: 0.9rem;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          color: #0f172a;
          background: #f8fafc;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .lp-input::placeholder { color: #cbd5e1; font-weight: 400; }
        .lp-input:focus {
          border-color: #6366f1;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .lp-input-pr { padding-right: 42px; }

        .lp-eye {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; padding: 2px;
          color: #94a3b8;
          display: flex; align-items: center;
          transition: color 0.15s;
        }
        .lp-eye:hover { color: #475569; }

        .lp-row-right {
          display: flex;
          justify-content: flex-end;
          margin-top: -6px;
          margin-bottom: 20px;
        }
        .lp-link {
          background: none; border: none;
          color: #6366f1; font-size: 0.78rem;
          font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif;
          padding: 0;
          transition: color 0.15s;
        }
        .lp-link:hover { color: #4f46e5; text-decoration: underline; }

        .lp-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: #fff;
          font-size: 0.92rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(99,102,241,0.32);
          transition: box-shadow 0.2s, transform 0.1s, opacity 0.2s;
        }
        .lp-btn:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(99,102,241,0.42);
          transform: translateY(-1px);
        }
        .lp-btn:active:not(:disabled) { transform: translateY(0); }
        .lp-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

        .lp-back {
          background: none; border: none;
          color: #94a3b8; font-size: 0.77rem;
          font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif;
          display: flex; align-items: center; gap: 4px;
          padding: 0; margin-bottom: 1.25rem;
          transition: color 0.15s;
        }
        .lp-back:hover { color: #475569; }

        .lp-error {
          display: flex; align-items: flex-start; gap: 8px;
          background: #fff5f5;
          border: 1.5px solid #fed7d7;
          border-radius: 10px;
          padding: 10px 14px;
          color: #c53030;
          font-size: 0.8rem;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .lp-divider {
          border: none;
          border-top: 1px solid #f1f5f9;
          margin: 1.25rem 0;
        }

        .lp-info {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 0.78rem;
          color: #64748b;
          line-height: 1.6;
          text-align: center;
          margin-bottom: 1.25rem;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      <div className="lp-page">
        <div className="lp-card">

          {/* Logo */}
          <div className="lp-logo">
            <div className="lp-logo-icon">
              <ShieldCheck size={26} color="#fff" strokeWidth={2.2} />
            </div>
            <div className="lp-logo-title">Admin Portal</div>
            <div className="lp-logo-sub">Al Zaydan International</div>
          </div>

          {/* ── LOGIN ── */}
          {view === 'login' && (
            <form onSubmit={handleLogin} noValidate>
              <p className="lp-heading">Sign in to your account</p>

              {loginError && (
                <div className="lp-error">
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  {loginError}
                </div>
              )}

              <div className="lp-field">
                <label className="lp-label">Email Address</label>
                <div className="lp-input-wrap">
                  <span className="lp-icon"><Mail size={15} /></span>
                  <input className="lp-input" type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required autoComplete="email" />
                </div>
              </div>

              <div className="lp-field">
                <label className="lp-label">Password</label>
                <div className="lp-input-wrap">
                  <span className="lp-icon"><Lock size={15} /></span>
                  <input className="lp-input lp-input-pr"
                    type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password" required autoComplete="current-password" />
                  <button className="lp-eye" type="button"
                    onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="lp-row-right">
                <button type="button" className="lp-link"
                  onClick={() => { setResetEmail(email); setView('forgot'); }}>
                  Forgot password?
                </button>
              </div>

              <button className="lp-btn" type="submit" disabled={loginLoading}>
                {loginLoading
                  ? <><Loader2 size={15} className="spin" /> Signing in…</>
                  : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {view === 'forgot' && (
            <form onSubmit={handleForgot} noValidate>
              <button className="lp-back" type="button" onClick={() => setView('login')}>
                <ArrowLeft size={13} /> Back to Sign In
              </button>

              <p className="lp-heading">Reset your password</p>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {resetError && (
                <div className="lp-error">
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  {resetError}
                </div>
              )}

              <div className="lp-field">
                <label className="lp-label">Email Address</label>
                <div className="lp-input-wrap">
                  <span className="lp-icon"><Mail size={15} /></span>
                  <input className="lp-input" type="email" value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="you@example.com" required autoFocus autoComplete="email" />
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <button className="lp-btn" type="submit" disabled={resetLoading}>
                  {resetLoading
                    ? <><Loader2 size={15} className="spin" /> Sending…</>
                    : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}

          {/* ── SUCCESS ── */}
          {view === 'forgot-success' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}>
                <MailCheck size={30} color="#16a34a" strokeWidth={1.8} />
              </div>

              <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                Check your inbox
              </p>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 4, lineHeight: 1.6 }}>
                We sent a password reset link to
              </p>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#6366f1', marginBottom: '1.25rem' }}>
                {resetEmail}
              </p>

              <div className="lp-info">
                Click the link in the email to set a new password.
                The link expires in <strong style={{ color: '#334155' }}>1 hour</strong>.
                If you don't see it, check your spam folder.
              </div>

              <button className="lp-btn" type="button"
                onClick={() => { setView('login'); setPassword(''); }}>
                <CheckCircle2 size={15} /> Back to Sign In
              </button>

              <hr className="lp-divider" />
              <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Wrong email?{' '}
                <button type="button" className="lp-link"
                  style={{ fontSize: '0.74rem' }} onClick={() => setView('forgot')}>
                  Try again
                </button>
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
