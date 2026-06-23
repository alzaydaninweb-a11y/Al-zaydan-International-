import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import {
  Send, Loader2, Factory, FileText, CheckCircle2, ChevronRight, UploadCloud, X, Image as ImageIcon
} from 'lucide-react';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import { uploadToR2 } from '../lib/cloudflareR2';
import { sendEmail } from '../lib/emailService';
import { useSEO } from '../lib/useSEO';

interface SimpleRFQForm {
  productList: string;
  phone: string;
  company: string;
  email: string;
}

const EMPTY: SimpleRFQForm = {
  productList: '', phone: '', company: '', email: ''
};

const fieldBase =
  'w-full text-[13px] border rounded-xl px-4 py-3 outline-none transition-all bg-white placeholder-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900';
const fieldOk    = 'border-slate-200';
const fieldError = 'border-red-400 bg-red-50/30 focus:ring-red-400/20 focus:border-red-400';

export default function RFQPage() {
  const { settings } = useStore();

  useSEO({
    title: 'Request a Bulk Quote | Al Zaydan International UAE',
    description: 'Submit a Request for Quotation to Al Zaydan International. Get competitive wholesale pricing on traffic safety, packaging & industrial supplies in the UAE.',
    ogImage: 'https://www.alzaydaninternational.com/images/og-banner.jpg',
  });

  const [form, setForm]         = useState<SimpleRFQForm>(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors]     = useState<Partial<Record<keyof SimpleRFQForm | 'file', string>>>({});
  
  const [submitting, setSubmitting] = useState(false);
  const [submittingWA, setSubmittingWA] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const e: Partial<Record<keyof SimpleRFQForm | 'file', string>> = {};
    if (!form.productList.trim() && !imageFile) {
      e.productList = 'Please enter your product list or upload an image.';
    }
    if (!form.phone.trim()) e.phone = 'Contact number is required.';
    if (!form.email.trim()) e.email = 'Email address is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (
    ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = ev.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name as keyof SimpleRFQForm]) {
      setErrors(prev => { const n = { ...prev }; delete n[name as keyof SimpleRFQForm]; return n; });
    }
    if (name === 'productList' && value.trim()) {
      setErrors(prev => { const n = { ...prev }; delete n.productList; return n; });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setErrors(prev => { const n = { ...prev }; delete n.productList; delete n.file; return n; });
    }
  };

  const removeFile = () => {
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    
    let imageUrl = '';
    if (imageFile) {
      try {
        imageUrl = await uploadToR2(imageFile, 'rfq_uploads');
      } catch (err) {
        console.error("Error uploading image to R2:", err);
      }
    }

    const msg = `
Company: ${form.company || 'N/A'}

Products Needed:
${form.productList}

Attached Image URL:
${imageUrl || 'No image attached'}
    `;

    const result = await sendEmail({
      name: form.company || 'RFQ Submitter',
      email: form.email,
      phone: form.phone,
      title: 'New Procurement RFQ',
      message: msg.trim()
    });

    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert(`Failed to send RFQ: ${result.error || "Please check your connection or contact us via WhatsApp."}`);
    }
  };

  const handleWhatsAppSubmit = async () => {
    if (!validate()) return;
    setSubmittingWA(true);
    
    let imageUrl = '';
    if (imageFile) {
      try {
        imageUrl = await uploadToR2(imageFile, 'rfq_uploads');
      } catch (err) {
        console.error("Error uploading image to R2 (skipped):", err);
      }
    }
    
    // Send background email alert
    const mailMsg = `
Source: WhatsApp RFQ Submission
Company: ${form.company || 'N/A'}

Products Needed:
${form.productList}

Attached Image URL:
${imageUrl || 'No image attached'}
    `;

    // Send background email alert (don't await so it's instant and doesn't block WhatsApp)
    sendEmail({
      name: form.company || 'WhatsApp RFQ',
      email: form.email,
      phone: form.phone,
      title: 'New WhatsApp RFQ Alert',
      message: mailMsg.trim()
    }).catch(err => console.error("Email alert failed, but WhatsApp continues:", err));
    
    const msg = `*New Procurement Request*\n\n` +
      (form.productList ? `*Products Needed:*\n${form.productList}\n\n` : '') +
      (imageUrl ? `*Attached List Image:* ${imageUrl}\n\n` : '') +
      `*Contact Info:*\n` +
      `Company: ${form.company || 'N/A'}\n` +
      `Phone: ${form.phone}\n` +
      `Email: ${form.email}`;

    const defaultNumber = settings?.orderWhatsAppNumber || settings?.phoneNumber?.replace(/\D/g, '') || '971000000000';
    const number = settings?.whatsappRouting?.rfq || defaultNumber;
    
    // Use location.href instead of window.open to bypass popup blockers
    window.location.href = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
    
    // Safety reset in case they come back
    setTimeout(() => setSubmittingWA(false), 2000);
  };

  return (
    <div className="bg-[#f5f7fa] font-sans min-h-screen pb-20">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-[#0052d9]/40" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 text-blue-400 text-[11px] font-bold uppercase tracking-widest mb-4 bg-blue-900/30 px-3 py-1 rounded-full">
            <Factory className="w-4 h-4" />
            <span>Procurement Portal</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Submit Your Requirement
          </h1>
          <p className="text-slate-300 text-[15px] leading-relaxed max-w-xl mx-auto mb-6">
            Upload your product list or enter it manually below. Provide your contact details and our team will get back to you immediately.
          </p>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-[12px]">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-semibold">Bulk Inquiry</span>
          </div>
        </div>
      </section>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 -mt-8 relative z-20">
        <div className="max-w-5xl mx-auto">

          {submitted ? (
            /* ── Success State ── */
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-blue-900/5 p-12 md:p-16 flex flex-col items-center text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-green-100">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Your submission is submitted!</h2>
              <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
                Thank you. Our procurement team will review your requirements and contact you as soon as possible.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => { setSubmitted(false); setForm(EMPTY); setImageFile(null); }}
                  className="px-8 py-3.5 bg-[#0052d9] hover:bg-blue-700 text-white text-[14px] font-bold rounded-xl transition-colors"
                >
                  Submit Another Request
                </button>
                <Link
                  to="/"
                  className="px-8 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[14px] font-semibold rounded-xl border border-gray-200 transition-colors"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              
              {/* ── Left Column: Cool Explanation ── */}
              <div className="lg:col-span-2 bg-gradient-to-br from-white to-blue-50/50 rounded-3xl border border-blue-100 shadow-xl shadow-blue-900/5 p-8 lg:sticky lg:top-24">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white">
                  <Factory className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-3 leading-tight">
                  Sourcing made incredibly simple.
                </h2>
                <p className="text-[14px] text-slate-500 mb-8 leading-relaxed">
                  If you already know what products you need, just upload your requirement list here. We'll handle the entire sourcing process for you.
                </p>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-md">1</div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-[14px]">Upload or Type</h4>
                      <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">Attach an image/PDF of your product list, or simply type it into the box.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-md">2</div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-[14px]">Leave your contact</h4>
                      <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">Enter your phone number so our procurement experts can reach out.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-md">3</div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-[14px]">Get your quote</h4>
                      <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">We source the best prices globally and deliver a competitive quote fast.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right Column: Form ── */}
              <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-200 shadow-xl shadow-blue-900/5 p-6 sm:p-10">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <FileText className="w-5 h-5" />
                  <h2 className="text-xl font-extrabold text-gray-900">Request Form</h2>
                </div>
                <p className="text-[13px] text-gray-500 mb-8">Fill out the quick form below.</p>

                <form onSubmit={handleEmailSubmit} noValidate className="space-y-6">

                {/* 1. Products List OR Image Upload */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wider mb-3">
                    1. What do you need? <span className="text-red-400">*</span>
                  </label>
                  
                  <div className="space-y-4">
                    {/* File Upload Area */}
                    <div>
                      {!imageFile ? (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50 text-blue-600 rounded-xl p-6 flex flex-col items-center justify-center transition-all"
                        >
                          <UploadCloud className="w-8 h-8 mb-2 opacity-80" />
                          <span className="font-bold text-[13px]">Upload List Image</span>
                          <span className="text-[11px] text-blue-400 mt-1">JPG, PNG, PDF allowed</span>
                        </button>
                      ) : (
                        <div className="w-full border border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-green-800 truncate">{imageFile.name}</p>
                              <p className="text-[11px] text-green-600">{(imageFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="w-8 h-8 bg-white text-gray-500 hover:text-red-500 rounded-full flex items-center justify-center shadow-sm border border-green-100 transition-colors shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        className="hidden"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-slate-200"></div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">OR</span>
                      <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    {/* Text Area */}
                    <div>
                      <textarea
                        name="productList"
                        value={form.productList}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Enter the list of products you need..."
                        className={`${fieldBase} resize-none ${errors.productList ? fieldError : fieldOk}`}
                      />
                    </div>
                  </div>
                  {errors.productList && <p className="text-[12px] font-semibold text-red-500 mt-2">{errors.productList}</p>}
                </div>

                {/* 2. Contact Details */}
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wider mb-3">
                    2. Your Details
                  </label>
                  <div className="space-y-4">
                    <div>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                        placeholder="Contact Number (WhatsApp enabled)*"
                        className={`${fieldBase} ${errors.phone ? fieldError : fieldOk}`} />
                      {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <input type="text" name="company" value={form.company} onChange={handleChange}
                        placeholder="Company Name (Optional)"
                        className={`${fieldBase} ${fieldOk}`} />
                    </div>

                    <div>
                      <input type="email" name="email" value={form.email} onChange={handleChange}
                        placeholder="Email ID*"
                        className={`${fieldBase} ${errors.email ? fieldError : fieldOk}`} />
                      {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-4 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={submitting || submittingWA}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#0052d9] hover:bg-blue-700 disabled:bg-blue-400 text-white text-[14px] font-bold rounded-xl transition-all shadow-md hover:shadow-blue-200 active:scale-[0.98]"
                  >
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing Mail…</>
                      : <><Send className="w-4 h-4" /> Submit Request via Mail</>
                    }
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleWhatsAppSubmit}
                    disabled={submitting || submittingWA}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#25D366] hover:bg-[#128C7E] disabled:bg-green-300 text-white text-[14px] font-bold rounded-xl transition-all shadow-md active:scale-[0.98]"
                  >
                    {submittingWA
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing WhatsApp…</>
                      : <><WhatsAppIcon className="w-4 h-4" /> Submit Request via WhatsApp</>
                    }
                  </button>
                </div>

              </form>
            </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
