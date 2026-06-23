import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Zap, Package, Globe, ShieldCheck, ChevronDown, Send, Loader2,
  Factory, Truck, BadgeCheck, Clock
} from 'lucide-react';
import WhatsAppIcon from '../icons/WhatsAppIcon';

const UNITS = ['Pcs', 'Kg', 'Ton', 'Liter', 'Box', 'Carton', 'Roll', 'Meter', 'Set'];

const COUNTRIES = [
  'United Arab Emirates', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman',
  'India', 'Pakistan', 'Bangladesh', 'Philippines', 'United Kingdom', 'United States',
  'Germany', 'China', 'Singapore', 'Malaysia', 'Egypt', 'Jordan', 'Other',
];

const TRUST_BADGES = [
  { icon: Clock,       label: 'Fast Response',           sub: 'Within 24 hours' },
  { icon: Package,     label: 'Bulk Orders Supported',   sub: 'MOQ negotiable' },
  { icon: Globe,       label: 'Global Shipping',         sub: 'Worldwide delivery' },
  { icon: ShieldCheck, label: 'Verified Suppliers',      sub: 'Quality assured' },
];

interface RFQForm {
  productName: string;
  category: string;
  quantity: string;
  unit: string;
  country: string;
  notes: string;
}

const EMPTY: RFQForm = {
  productName: '',
  category: '',
  quantity: '',
  unit: 'Pcs',
  country: '',
  notes: '',
};

export default function QuickRFQ() {
  const { categories, settings } = useStore();
  const [form, setForm] = useState<RFQForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof RFQForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof RFQForm, string>> = {};
    if (!form.productName.trim())  errs.productName = 'Product name is required';
    if (!form.category)            errs.category    = 'Please select a category';
    if (!form.quantity.trim())     errs.quantity    = 'Quantity is required';
    if (!form.country)             errs.country     = 'Please select a country';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name as keyof RFQForm]) {
      setErrors(prev => { const n = { ...prev }; delete n[name as keyof RFQForm]; return n; });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // Static mock — no backend yet
    await new Promise(r => setTimeout(r, 1400));
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleTalkToProcurement = () => {
    const msg = `Hi, I'm looking to procure *${form.productName || 'materials'}*${form.quantity ? ` (${form.quantity} ${form.unit})` : ''}.${form.notes ? ` Notes: ${form.notes}` : ''}`;
    const defaultWa = settings?.orderWhatsAppNumber || settings?.phoneNumber || '971000000000';
    const rawPhone = settings?.whatsappRouting?.rfq || defaultWa;
    const phone = rawPhone.replace(/\D/g, '');
    window.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const fieldBase =
    'w-full text-[13px] border rounded-lg px-3 py-2.5 outline-none transition-all bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500';
  const fieldOk    = 'border-gray-200 text-gray-900';
  const fieldError = 'border-red-400 text-gray-900 bg-red-50/30 focus:ring-red-400/20 focus:border-red-400';

  if (submitted) {
    return (
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-10 sm:py-14">
          <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <BadgeCheck className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-[22px] font-extrabold text-gray-900">RFQ Submitted Successfully!</h2>
            <p className="text-[14px] text-gray-500 max-w-md">
              Thank you for your inquiry. Our procurement team will review your requirements and get back to you within 24 hours.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm(EMPTY); }}
              className="mt-2 px-6 py-2.5 bg-[#0052d9] hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg transition-colors"
            >
              Submit Another RFQ
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 py-8 sm:py-12">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Factory className="w-4.5 h-4.5 text-blue-600" />
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Procurement Portal</span>
            </div>
            <h2 className="text-[20px] sm:text-[22px] font-extrabold text-gray-900 leading-tight">
              Quick RFQ &amp; Bulk Procurement Inquiry
            </h2>
            <p className="text-[13px] text-gray-400 mt-1">
              Tell us what you need — our team will source &amp; quote within 24 hours.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-gray-400 font-medium shrink-0">
            <Truck className="w-4 h-4" />
            <span>Global shipping &amp; fulfilment available</span>
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5">

            {/* ── LEFT: Form ── */}
            <div className="lg:col-span-3 p-6 sm:p-8 bg-white">
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                  {/* Product / Material Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Product / Material Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="productName"
                      value={form.productName}
                      onChange={handleChange}
                      placeholder="e.g. Industrial Adhesive Tape, HDPE Pipe, Safety Helmet…"
                      className={`${fieldBase} ${errors.productName ? fieldError : fieldOk}`}
                    />
                    {errors.productName && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.productName}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className={`${fieldBase} appearance-none pr-8 ${errors.category ? fieldError : fieldOk}`}
                      >
                        <option value="">Select a category…</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="Other">Other / Not Listed</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.category && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.category}</p>
                    )}
                  </div>

                  {/* Quantity + Unit */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Quantity <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="quantity"
                        value={form.quantity}
                        onChange={handleChange}
                        placeholder="e.g. 500"
                        min="1"
                        className={`${fieldBase} flex-1 ${errors.quantity ? fieldError : fieldOk}`}
                      />
                      <div className="relative shrink-0">
                        <select
                          name="unit"
                          value={form.unit}
                          onChange={handleChange}
                          className={`${fieldBase} appearance-none pr-6 pl-3 w-[80px] ${fieldOk}`}
                        >
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    {errors.quantity && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.quantity}</p>
                    )}
                  </div>

                  {/* Delivery Country */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Delivery Country <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        className={`${fieldBase} appearance-none pr-8 ${errors.country ? fieldError : fieldOk}`}
                      >
                        <option value="">Select destination country…</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.country && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.country}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Requirement Notes
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Specifications, brand preference, packaging requirements, delivery timeline…"
                      className={`${fieldBase} resize-none ${fieldOk}`}
                    />
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#0052d9] hover:bg-blue-700 disabled:bg-blue-400 text-white text-[13px] font-bold rounded-lg transition-all shadow-md hover:shadow-blue-200 active:scale-[0.98]"
                  >
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                      : <><Send className="w-4 h-4" /> Request Quotation</>
                    }
                  </button>
                  <button
                    type="button"
                    onClick={handleTalkToProcurement}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-[13px] font-semibold rounded-lg border border-gray-200 hover:border-gray-300 transition-all active:scale-[0.98]"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-green-500" />
                    Talk to Procurement Team
                  </button>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
                  {TRUST_BADGES.map(badge => {
                    const Icon = badge.icon;
                    return (
                      <div key={badge.label} className="flex items-start gap-2">
                        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[11.5px] font-bold text-gray-700 leading-tight">{badge.label}</p>
                          <p className="text-[10.5px] text-gray-400 leading-tight mt-0.5">{badge.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </form>
            </div>

            {/* ── RIGHT: Visual panel ── */}
            <div className="lg:col-span-2 relative bg-gradient-to-br from-[#0052d9] to-[#1a3fa8] flex flex-col items-center justify-center p-8 gap-6 min-h-[280px] lg:min-h-0">
              {/* Decorative circles */}
              <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute bottom-[-30px] left-[-30px] w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

              {/* Icon grid */}
              <div className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-[240px]">
                {[
                  { icon: Factory,     label: 'Industrial',    sub: 'Materials' },
                  { icon: Package,     label: 'Bulk',          sub: 'Supply' },
                  { icon: Globe,       label: 'Global',        sub: 'Sourcing' },
                  { icon: Truck,       label: 'Fast',          sub: 'Delivery' },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/15 transition-colors rounded-xl p-4 text-center cursor-default"
                    >
                      <Icon className="w-7 h-7 text-white/90" strokeWidth={1.5} />
                      <div>
                        <p className="text-[12px] font-bold text-white leading-tight">{item.label}</p>
                        <p className="text-[10px] text-white/60 leading-tight">{item.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom message */}
              <div className="relative z-10 text-center max-w-[240px]">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span className="text-[12px] font-bold text-white">Procurement Made Easy</span>
                </div>
                <p className="text-[11px] text-white/65 leading-relaxed">
                  Submit your requirements once. Get competitive quotes from verified suppliers worldwide.
                </p>
              </div>

              {/* Stats row */}
              <div className="relative z-10 flex items-center gap-4 w-full max-w-[240px] justify-center mt-2">
                {[
                  { val: '24h',    label: 'Response' },
                  { val: '500+',   label: 'Suppliers' },
                  { val: '60+',    label: 'Countries' },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <p className="text-[18px] font-extrabold text-white leading-none">{stat.val}</p>
                    <p className="text-[10px] text-white/55 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
