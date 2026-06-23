import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText, PhoneCall, Upload, ChevronUp, ChevronDown,
  X, Zap, Clock, CheckCircle2, Send, Loader2, Package, Mail
} from 'lucide-react';
import WhatsAppIcon from '../icons/WhatsAppIcon';
import { useStore } from '../../context/StoreContext';
import { uploadToR2 } from '../../lib/cloudflareR2';
import { sendEmail } from '../../lib/emailService';

/* ─── Availability helper (deterministic "online hours") ───────────────────── */
function isTeamOnline(): boolean {
  const h = new Date().getHours();
  const d = new Date().getDay();          // 0 = Sun, 6 = Sat
  return d >= 0 && d <= 5 && h >= 8 && h < 20; // Mon–Sat 8am–8pm
}

/* ─── Mini Quick-RFQ popup ─────────────────────────────────────────────────── */
interface MiniRFQProps {
  onClose: () => void;
  waNumber: string;
  isMobile?: boolean;
}

function MiniRFQPopup({ onClose, waNumber, isMobile = false }: MiniRFQProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [contactPhone, setContactPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [submitting, setSubmitting] = useState<'email' | 'whatsapp' | false>(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isMobile) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, isMobile]);

  const handleSubmit = async (type: 'email' | 'whatsapp') => {
    if (!contactPhone || !email || !company || !imageFile) return;
    setSubmitting(type);

    let imageUrl = '';
    try {
      imageUrl = await uploadToR2(imageFile, 'rfq_uploads');
    } catch (err) {
      console.error('Upload failed', err);
    }

    if (type === 'email') {
      // ── 1. Auto-send email via EmailJS ───────────────
      await sendEmail({
        name:    company,
        email:   email,
        phone:   contactPhone,
        title:   'Equipment List Upload — Quick RFQ',
        message: `Quick RFQ submitted via Upload Equipment List popup.\n\nCompany: ${company}\nPhone: ${contactPhone}\nEmail: ${email}\nAttached File: ${imageUrl || 'Not uploaded'}`,
      });
    } else {
      // ── 2. Open WhatsApp ──────────────────────────────
      const msg =
        `*Equipment / Material List Upload*\n\n` +
        (imageUrl ? `*Attached File:* ${imageUrl}\n\n` : '') +
        `*Contact Info:*\n` +
        `Company: ${company}\n` +
        `Phone: ${contactPhone}\n` +
        `Email: ${email}`;

      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    setSubmitting(false);
    onClose();
  };

  const containerClasses = isMobile
    ? "bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden"
    : "absolute bottom-full right-0 mb-3 w-[320px] bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200";

  return (
    <div ref={isMobile ? undefined : ref} className={containerClasses}>
      <div className="flex items-center justify-between px-4 py-3 bg-[#0052d9] text-white">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-yellow-300" />
          <span className="text-[13px] font-bold">Upload Equipment List</span>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4">
        <form onSubmit={e => e.preventDefault()} className="space-y-3">
          <p className="text-[11px] text-gray-400 leading-snug">
            Upload your materials list and choose how you want to receive your quote.
          </p>

          <div>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-dashed border-gray-300 hover:border-blue-500 rounded-xl px-3 py-3 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-blue-50/50"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={e => e.target.files && setImageFile(e.target.files[0])} 
              />
              <Upload className={`w-5 h-5 mb-1 ${imageFile ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className={`text-[11px] font-bold text-center ${imageFile ? 'text-blue-600' : 'text-gray-500'}`}>
                {imageFile ? imageFile.name : 'Click to upload your list'}
              </span>
            </div>
          </div>

          <div>
            <input
              value={company} onChange={e => setCompany(e.target.value)} required placeholder="Company Name *"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[12px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                value={contactPhone} onChange={e => setContactPhone(e.target.value)} required placeholder="Phone *"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[12px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email *"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[12px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="pt-1 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleSubmit('email')}
              disabled={!!submitting || !imageFile || !company || !contactPhone || !email}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-[12px] font-bold rounded-xl transition-all"
            >
              {submitting === 'email' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Mail className="w-4 h-4" /> Submit via Email</>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('whatsapp')}
              disabled={!!submitting || !imageFile || !company || !contactPhone || !email}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-[12px] font-bold rounded-xl transition-all"
            >
              {submitting === 'whatsapp' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><WhatsAppIcon className="w-4 h-4" /> Submit via WhatsApp</>
              )}
            </button>
          </div>

          <p className="text-center text-[11px] text-gray-500 pt-2 border-t border-gray-100 mt-2">
            Need more details?{' '}
            <Link to="/rfq" onClick={onClose} className="text-blue-500 hover:text-blue-700 font-bold underline decoration-blue-500/30 underline-offset-2">
              View full RFQ form
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Dock Component ───────────────────────────────────────────────────── */
export default function StickyProcurementDock() {
  const { settings } = useStore();
  const navigate = useNavigate();

  const [visible,     setVisible]     = useState(false);
  const [expanded,    setExpanded]    = useState(false);
  const [showRFQ,     setShowRFQ]     = useState(false);
  const [hasNewInquiry, setHasNew]    = useState(true); // mock badge
  const online = isTeamOnline();

  const defaultWa = settings?.orderWhatsAppNumber
    || settings?.phoneNumber?.replace(/\D/g, '')
    || '';
  const waNumber = settings?.whatsappRouting?.procurement || defaultWa;
  const waUrl = waNumber 
    ? `https://wa.me/${waNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I have a bulk procurement inquiry. Please assist.')}`
    : '#';
  const callNumber = settings?.callRouting?.procurement || settings?.phoneNumber || settings?.phones?.[0]?.value || '';

  /* Show dock after 200px scroll */
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close RFQ popup on route navigation */
  const handleRFQClose = () => setShowRFQ(false);

  /* Actions */
  const actions = [
    {
      id: 'rfq',
      icon: Upload,
      label: 'Upload List',
      sublabel: 'Get procurement quote',
      color: 'bg-[#0052d9] hover:bg-blue-700 text-white',
      iconBg: '',
      badge: hasNewInquiry,
      action: () => { setShowRFQ(v => !v); setHasNew(false); },
    },
    {
      id: 'whatsapp',
      icon: WhatsAppIcon,
      label: 'WhatsApp',
      sublabel: 'Chat with team',
      color: 'bg-white hover:bg-green-50 text-green-600 border border-gray-200 hover:border-green-200',
      iconBg: '',
      badge: false,
      action: () => window.open(waUrl, '_blank'),
    },
    {
      id: 'upload',
      icon: Upload,
      label: 'Upload Requirement',
      sublabel: 'Send specs / BOM',
      color: 'bg-white hover:bg-violet-50 text-violet-600 border border-gray-200 hover:border-violet-200',
      iconBg: '',
      badge: false,
      action: () => navigate('/rfq'),
    },
    {
      id: 'call',
      icon: PhoneCall,
      label: 'Call Us',
      sublabel: callNumber,
      color: 'bg-white hover:bg-amber-50 text-amber-700 border border-gray-200 hover:border-amber-200',
      iconBg: '',
      badge: false,
      action: () => window.open(`tel:${callNumber}`),
    },
  ];

  return (
    <>
      {/* ── DESKTOP FLOATING DOCK (lg+) ─────────────────────────────────────── */}
      <div
        className={`
          hidden lg:flex flex-col items-end gap-2
          fixed bottom-8 right-6 z-[450]
          transition-all duration-300 ease-out
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
      >
        {/* Mini RFQ Popup — anchored above the dock */}
        {showRFQ && (
          <div className="relative w-[320px]">
            <MiniRFQPopup onClose={handleRFQClose} waNumber={waNumber.replace(/\D/g, '')} />
          </div>
        )}

        {/* Expanded action list */}
        {expanded && (
          <div className="flex flex-col gap-2 items-end">
            {actions.slice(1).map(action => {
              const Icon = action.icon;
              return (
                <div key={action.id} className="flex items-center gap-2 group/item">
                  {/* Tooltip label */}
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 bg-gray-900 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none">
                    <p>{action.label}</p>
                    <p className="text-gray-400 text-[10px]">{action.sublabel}</p>
                  </div>
                  <button
                    onClick={action.action}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-all duration-150 active:scale-95 hover:shadow-lg ${action.color}`}
                    aria-label={action.label}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Main dock pill */}
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-200 shadow-xl px-2 py-2">

          {/* Status dot */}
          <div className="flex flex-col items-center px-1">
            <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-[8px] font-bold mt-0.5 text-gray-400 uppercase tracking-wide">
              {online ? 'Online' : 'Away'}
            </span>
          </div>

          <div className="w-px h-8 bg-gray-100" />

          {/* Primary RFQ button */}
          <div className="relative">
            {/* Explainer tooltip for "Upload List" */}
            {!showRFQ && (
              <div className="absolute -top-20 right-0 w-52 bg-gray-900 text-white p-2.5 rounded-xl shadow-xl text-[11px] leading-tight pointer-events-none animate-bounce z-50">
                <span className="flex items-center gap-1 font-bold text-yellow-400 mb-1">
                  <Zap className="w-3.5 h-3.5" /> Quick Order
                </span>
                Upload your product list for a fast quote & super fast delivery!
                <div className="absolute -bottom-1.5 right-12 w-3 h-3 bg-gray-900 rotate-45" />
              </div>
            )}
            
            <button
              onClick={actions[0].action}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-95 ${actions[0].color}`}
              aria-label="Upload List"
            >
              <Upload className="w-4 h-4" />
              Upload List
            </button>
            {hasNewInquiry && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-sm">
                1
              </span>
            )}
          </div>

          {/* WhatsApp quick */}
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 flex items-center justify-center transition-colors"
            aria-label="WhatsApp Inquiry"
            title="WhatsApp Procurement"
          >
            <WhatsAppIcon className="w-4.5 h-4.5" />
          </a>

          {/* Expand/collapse toggle */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200 flex items-center justify-center transition-colors"
            aria-label={expanded ? 'Collapse dock' : 'More actions'}
            title={expanded ? 'Collapse' : 'More actions'}
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Availability text */}
        <p className="text-[10px] text-gray-400 text-center w-full pr-1">
          {online ? (
            <span className="text-green-600 font-semibold">● Team available now</span>
          ) : (
            <span>● Responds within 24h</span>
          )}
        </p>
      </div>

      {/* ── MOBILE STICKY PROCUREMENT BAR (hidden on lg+) ───────────────────── */}
      {/* This sits above the existing mobile bottom nav (z-40), z-45 */}
      <div
        className={`
          lg:hidden fixed bottom-[56px] left-0 right-0 z-[45]
          transition-all duration-300 ease-out
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}
        `}
      >
        {/* Mini RFQ popup for mobile */}
        {showRFQ && (
          <div className="mx-3 mb-2 relative">
            <MiniRFQPopup onClose={handleRFQClose} waNumber={waNumber.replace(/\D/g, '')} isMobile={true} />
          </div>
        )}

        {/* Mobile procurement bar */}
        <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-3 py-2">
          <div className="flex items-center gap-2">

            {/* Status */}
            <div className="flex items-center gap-1 shrink-0">
              <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide hidden sm:block">
                {online ? 'Online' : 'Away'}
              </span>
            </div>

            {/* Primary RFQ CTA */}
            <div className="flex-1 relative">
              {/* Explainer tooltip for "Upload List" on Mobile */}
              {!showRFQ && (
                <div className="absolute -top-[82px] left-1/2 -translate-x-1/2 w-[220px] bg-gray-900 text-white p-2.5 rounded-xl shadow-xl text-[11px] leading-tight pointer-events-none animate-bounce z-50">
                  <span className="flex items-center justify-center gap-1 font-bold text-yellow-400 mb-1">
                    <Zap className="w-3.5 h-3.5" /> Quick Order
                  </span>
                  <span className="text-center block">Upload your product list for a fast quote & super fast delivery!</span>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45" />
                </div>
              )}

              <button
                onClick={() => { setShowRFQ(v => !v); setHasNew(false); }}
                className="w-full relative flex items-center justify-center gap-1.5 py-2.5 bg-[#0052d9] hover:bg-blue-700 text-white text-[13px] font-bold rounded-xl transition-all active:scale-[0.98]"
              >
                <Upload className="w-4 h-4" />
                Upload List
                {hasNewInquiry && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    1
                  </span>
                )}
              </button>
            </div>

            {/* WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center w-12 h-10 bg-green-50 text-green-600 border border-green-200 rounded-xl transition-colors hover:bg-green-100"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold mt-0.5 leading-none">Chat</span>
            </a>

            {/* Call */}
            <a
              href={`tel:${callNumber}`}
              className="flex flex-col items-center justify-center w-12 h-10 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl transition-colors hover:bg-amber-100"
              aria-label="Call"
            >
              <PhoneCall className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold mt-0.5 leading-none">Call</span>
            </a>

            {/* Upload / Bulk RFQ */}
            <Link
              to="/rfq"
              className="flex flex-col items-center justify-center w-12 h-10 bg-violet-50 text-violet-600 border border-violet-200 rounded-xl transition-colors hover:bg-violet-100"
              aria-label="Upload Requirement"
            >
              <Package className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold mt-0.5 leading-none">Bulk</span>
            </Link>

          </div>
        </div>
      </div>
    </>
  );
}
