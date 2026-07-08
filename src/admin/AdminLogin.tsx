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
          background: radial-gradient(circle at top, rgba(99, 102, 241, 0.12) 0%, transparent 50%), 
                      linear-gradient(135deg, #090d16 0%, #0f172a 100%);
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .lp-card {
          width: 100%;
          max-width: 420px;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 3rem 2.25rem;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4), 
                      0 1px 0 rgba(255, 255, 255, 0.1) inset;
          animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 10;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lp-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2.25rem;
        }
        .lp-logo-icon {
          width: 60px; height: 60px;
          border-radius: 18px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4),
                      0 0 0 1px rgba(255, 255, 255, 0.15) inset;
          margin-bottom: 16px;
        }
        .lp-logo-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.5px;
        }
        .lp-logo-sub {
          font-size: 0.8rem;
          color: #94a3b8;
          font-weight: 500;
          margin-top: 4px;
          opacity: 0.85;
        }

        .lp-heading {
          font-size: 0.95rem;
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 1.5rem;
          text-align: center;
          opacity: 0.9;
        }

        .lp-field { margin-bottom: 20px; }
        .lp-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
          padding-left: 2px;
        }
        .lp-input-wrap { position: relative; }
        .lp-icon {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          display: flex; align-items: center;
          pointer-events: none;
        }
        .lp-input {
          width: 100%;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px 14px 12px 42px;
          font-size: 0.92rem;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          color: #ffffff;
          background: rgba(15, 23, 42, 0.4);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
        }
        .lp-input::placeholder { color: #475569; font-weight: 400; }
        .lp-input:focus {
          border-color: #6366f1;
          background: rgba(15, 23, 42, 0.6);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
        }
        .lp-input-pr { padding-right: 44px; }

        .lp-eye {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; padding: 2px;
          color: #64748b;
          display: flex; align-items: center;
          transition: color 0.15s;
        }
        .lp-eye:hover { color: #94a3b8; }

        .lp-row-right {
          display: flex;
          justify-content: flex-end;
          margin-top: -8px;
          margin-bottom: 24px;
        }
        .lp-link {
          background: none; border: none;
          color: #818cf8; font-size: 0.8rem;
          font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif;
          padding: 0;
          transition: color 0.15s;
        }
        .lp-link:hover { color: #a5b4fc; text-decoration: none; }

        .lp-btn {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          color: #ffffff;
          font-size: 0.92rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3),
                      0 1px 0 rgba(255, 255, 255, 0.2) inset;
          transition: all 0.2s;
        }
        .lp-btn:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.45);
          transform: translateY(-1px);
          filter: brightness(1.05);
        }
        .lp-btn:active:not(:disabled) { transform: translateY(0); }
        .lp-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

        .lp-back {
          background: none; border: none;
          color: #64748b; font-size: 0.8rem;
          font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif;
          display: flex; align-items: center; gap: 6px;
          padding: 0; margin-bottom: 1.5rem;
          transition: color 0.15s;
        }
        .lp-back:hover { color: #94a3b8; }

        .lp-error {
          display: flex; align-items: flex-start; gap: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          padding: 12px 14px;
          color: #fca5a5;
          font-size: 0.82rem;
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .lp-divider {
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          margin: 1.5rem 0;
        }

        .lp-info {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 14px;
          font-size: 0.8rem;
          color: #94a3b8;
          line-height: 1.6;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      <div className="lp-page">
        <div className="lp-card">

          {/* Logo */}
          <div className="lp-logo">
            <div className="lp-logo-icon">
              <ShieldCheck size={28} color="#fff" strokeWidth={2.2} />
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
