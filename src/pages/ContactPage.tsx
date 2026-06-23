import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Building2, Globe, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { sendEmail } from '../lib/emailService';
import { useSEO } from '../lib/useSEO';

export default function ContactPage() {
  const { settings } = useStore();

  useSEO({
    title: 'Contact Al Zaydan International | B2B Industrial Supplies UAE',
    // 64 chars ↑
    description: 'Contact Al Zaydan International FZE for B2B industrial materials sourcing enquiries. Ajman Free Zone, UAE. Available via WhatsApp, email & phone. Request a quote.',
    // 163 chars ↑
    canonical: 'https://www.alzaydaninternational.com/contact',
    ogImage: 'https://www.alzaydaninternational.com/images/og-banner.jpg',
  });

  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '', subject: '', message: '',
  });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    const formattedMessage = `
Company: ${form.company || 'N/A'}
Subject: ${form.subject}

Message:
${form.message}
    `;

    const result = await sendEmail({
      name: form.name,
      email: form.email,
      phone: form.phone,
      title: 'New Contact Us Inquiry',
      message: formattedMessage.trim(),
    });

    setSending(false);
    if (result.success) {
      setSent(true);
    } else {
      alert(`Failed to send message: ${result.error || "Please check your connection or contact us via WhatsApp."}`);
    }
  };

  // Process dynamic contact items from settings
  const contactCards = [
    {
      icon: Mail,
      label: 'Email Support',
      title: settings?.emails?.[0]?.value || settings?.email || 'info@alzaydan.com',
      sub: settings?.emails?.[0]?.label || 'General Inquiry',
      href: `mailto:${settings?.emails?.[0]?.value || settings?.email || 'info@alzaydan.com'}`,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Phone,
      label: 'Phone Support',
      title: settings?.phones?.[0]?.value || settings?.phoneNumber || '+971 XX XXX XXXX',
      sub: settings?.phones?.[0]?.label || 'Customer Care',
      href: `tel:${settings?.phones?.[0]?.value || settings?.phoneNumber || ''}`,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: MapPin,
      label: 'Our Location',
      title: 'UAE Free Zone',
      sub: 'United Arab Emirates',
      href: settings?.googleMapsUrl || '#',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: Clock,
      label: 'Business Hours',
      title: '9 AM – 6 PM',
      sub: 'Mon – Fri, GST',
      href: '#',
      color: 'bg-violet-50 text-violet-600',
    },
  ];

  return (
    <div className="bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=70&w=1600&fm=webp"
            alt="Contact"
            className="w-full h-full object-cover"
            width="1600"
            height="500"
            fetchpriority="high"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28">
          <div className="text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-4">Contact Us</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 max-w-xl">
            Get in Touch with Al Zaydan International
          </h1>
          <p className="text-slate-300 text-base leading-relaxed max-w-lg">
            For business inquiries, sourcing support, and supply partnerships — our team is ready to assist you.
          </p>
        </div>
      </section>

      {/* ── Contact cards ────────────────────────────────────────────────────── */}
      <section className="py-14 px-4 md:px-6 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {contactCards.map(({ icon: Icon, label, title, sub, href, color }) => (
            <a
              key={label}
              href={href}
              className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-amber-200 hover:shadow-md transition-all text-center flex flex-col items-center gap-3"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</p>
                <p className="font-bold text-slate-900 text-sm leading-snug">{title}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{sub}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Form + Company Info ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Form — 3 cols */}
          <div className="lg:col-span-3">
            <div className="text-amber-500 text-[11px] font-bold uppercase tracking-widest mb-3">Send a Message</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-7">
              Tell Us About Your Requirements
            </h2>

            {sent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-extrabold text-emerald-900 text-xl mb-2">Message Sent!</h3>
                <p className="text-emerald-700 text-sm">Thank you for reaching out. Our team will get back to you shortly.</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 text-sm text-emerald-600 hover:text-emerald-800 font-bold underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                    <input
                      required name="name" value={form.name} onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Company Name</label>
                    <input
                      name="company" value={form.company} onChange={handleChange}
                      placeholder="Your company"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                    <input
                      required type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="you@company.com"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input
                      type="tel" name="phone" value={form.phone} onChange={handleChange}
                      placeholder="+971 XX XXX XXXX"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject *</label>
                  <select
                    required name="subject" value={form.subject} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white"
                  >
                    <option value="">Select a subject…</option>
                    <option>Product Inquiry</option>
                    <option>Sourcing Request</option>
                    <option>Trade / B2B Partnership</option>
                    <option>Pricing & Quotation</option>
                    <option>General Question</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Message *</label>
                  <textarea
                    required rows={5} name="message" value={form.message} onChange={handleChange}
                    placeholder="Describe your requirement, product interest, or question…"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-4 rounded-xl transition-colors shadow-lg shadow-slate-200 disabled:opacity-70"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Company info — 2 cols */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="text-amber-500 text-[11px] font-bold uppercase tracking-widest mb-3">Company Details</div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-5">Al Zaydan International FZE</h2>
              
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Connect with our teams</p>
                    {settings?.phones && settings.phones.length > 0 ? (
                      settings.phones.map((p, i) => (
                        <div key={i} className="flex flex-col">
                          <a href={`tel:${p.value}`} className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">{p.value}</a>
                          {p.label && <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{p.label}</span>}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-bold text-slate-900">{settings?.phoneNumber || '+971 XX XXX XXXX'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Email Channels</p>
                    {settings?.emails && settings.emails.length > 0 ? (
                      settings.emails.map((e, i) => (
                        <div key={i} className="flex flex-col">
                          <a href={`mailto:${e.value}`} className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors break-all">{e.value}</a>
                          {e.label && <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{e.label}</span>}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-bold text-slate-900">{settings?.email || 'info@alzaydan.com'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Registered Office</p>
                    <p className="text-sm font-bold text-slate-900 whitespace-pre-wrap">{settings?.address || 'UAE Free Zone Entity'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Scope */}
            <div className="bg-slate-900 rounded-2xl p-7 text-white shadow-xl shadow-slate-200">
               <div className="flex items-center gap-2 text-blue-400 mb-4">
                 <Globe className="w-4 h-4" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Global Logistics</span>
               </div>
               <h3 className="text-lg font-bold mb-3 leading-tight">Serving Strategic Industries Worldwide</h3>
               <p className="text-slate-400 text-sm leading-relaxed mb-6">
                 B2B focused sourcing across Road Safety, Construction, Oil & Gas, and Industrial Tools.
               </p>
               <ul className="space-y-3">
                 {[
                   'Response within 24 hours',
                   'Bulk Order Quotations',
                   'Global Shipping Support',
                 ].map(item => (
                   <li key={item} className="flex items-center gap-3 text-xs font-bold text-slate-200">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                     {item}
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
