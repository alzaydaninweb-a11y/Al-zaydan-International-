import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Truck, ChevronRight, Package, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { generateSlug } from '../lib/blogService';
import { sendEmail } from '../lib/emailService';

export default function CartPage() {
  const { cartItems, removeFromCart } = useCart();
  const { settings } = useStore();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailName, setEmailName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [emailPhone, setEmailPhone] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleRequestWhatsAppQuote = () => {
    const inquiryId = `RFQ-${Math.floor(10000 + Math.random() * 89999)}`;
    let message = `*B2B PRODUCT QUOTE INQUIRY*\n`;
    message += `------------------------------------------\n`;
    message += `*Inquiry Reference:* ${inquiryId}\n\n`;
    message += `*REQUESTED PRODUCTS LIST:*\n`;
    message += `------------------------------------------\n`;
    cartItems.forEach((item, idx) => {
      message += `${idx + 1}. *${item.name}*\n   (Code: ${item.id} | Category: ${item.category || 'General'})\n`;
    });
    message += `------------------------------------------\n`;
    message += `Kindly share product pricing, availability, and bulk discount terms.`;

    const encodedMessage = encodeURIComponent(message);
    const targetPhone = settings?.whatsappRouting?.product || settings?.orderWhatsAppNumber || settings?.phoneNumber || '971551551329';
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(waUrl, '_blank');
  };

  const handleSendEmailQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailName.trim() || !emailAddress.trim()) return;

    setEmailSending(true);
    const inquiryId = `RFQ-${Math.floor(10000 + Math.random() * 89999)}`;
    let messageBody = `B2B Product Quote Inquiry (${inquiryId})\n\n`;
    messageBody += `Customer Information:\n`;
    messageBody += `- Name / Company: ${emailName}\n`;
    messageBody += `- Email: ${emailAddress}\n`;
    messageBody += `- Phone: ${emailPhone || 'Not provided'}\n\n`;
    messageBody += `Requested Products List (${cartItems.length} items):\n`;
    cartItems.forEach((item, idx) => {
      messageBody += `${idx + 1}. ${item.name} (Code: ${item.id} | Category: ${item.category || 'General'})\n`;
    });

    const activeEmails = Array.isArray(settings?.inquiryEmails) && settings.inquiryEmails.length > 0
      ? settings.inquiryEmails.filter(Boolean)
      : [settings?.inquiryEmail || 'alzaydaninweb@gmail.com'];

    try {
      await sendEmail({
        name: emailName,
        email: emailAddress,
        phone: emailPhone,
        title: `B2B Product Quote Request (${cartItems.length} items)`,
        message: messageBody,
        to_email: activeEmails.join(', '),
      });
      setEmailSubmitted(true);
    } catch (err) {
      console.error('Failed to send email inquiry', err);
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-semibold">Quote Inquiry List</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Quote Inquiry List
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {cartItems.length === 0 ? 'No items in quote list' : `${cartItems.length} product${cartItems.length !== 1 ? 's' : ''} added for inquiry`}
            </p>
          </div>
          {cartItems.length > 0 && (
            <Link to="/search" className="hidden md:flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-bold transition-colors">
              <ShoppingBag className="w-4 h-4" />
              Add More Products
            </Link>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* ── Empty State ── */
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-9 h-9 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Your inquiry list is empty</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">
              Browse our catalog and add products to your inquiry list to request a custom quote.
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-800 transition-colors"
            >
              Browse Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
            {/* ── Left: Product List ── */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <Link
                        to={`/product/${item.slug || generateSlug(item.name)}`}
                        className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center"
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="min-w-0">
                        <Link to={`/product/${item.slug || generateSlug(item.name)}`}>
                          <h3 className="font-bold text-slate-900 text-[15px] md:text-base leading-snug hover:text-blue-600 transition-colors line-clamp-2">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {item.brand && (
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                              {item.brand}
                            </span>
                          )}
                          {item.category && (
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md">
                              {item.category}
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>Available for Quote
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-colors shrink-0"
                      title="Remove product"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-3">
                {[
                  { icon: Truck, label: 'Fast Delivery', sub: 'UAE & Global Shipping' },
                  { icon: WhatsAppIcon, label: 'Instant Discussion', sub: 'Connect via WhatsApp' },
                  { icon: Package, label: 'Bulk Wholesale', sub: 'Customized Pricing' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col items-center text-center gap-1">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mb-1">
                      <Icon className="w-4 h-4 text-slate-700" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-800 leading-tight">{label}</span>
                    <span className="text-[10px] text-slate-400 leading-tight hidden md:block">{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Inquiry Options Card ── */}
            <div className="w-full lg:w-[380px] xl:w-[400px] shrink-0 sticky top-28">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h2 className="font-extrabold text-slate-900 text-base tracking-tight">Submit Inquiry</h2>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                    {cartItems.length} Products
                  </span>
                </div>

                <div className="p-6">
                  {!showEmailForm ? (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Request formal pricing and availability for your selected products directly through WhatsApp or Email:
                      </p>

                      {/* Option 1: WhatsApp */}
                      <button
                        onClick={handleRequestWhatsAppQuote}
                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md shadow-green-500/20 text-sm"
                      >
                        <WhatsAppIcon className="w-5 h-5 text-white" />
                        Inquire via WhatsApp
                      </button>

                      {/* Option 2: Email */}
                      <button
                        onClick={() => setShowEmailForm(true)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md text-sm"
                      >
                        <Mail className="w-5 h-5" />
                        Inquire via Email
                      </button>
                    </div>
                  ) : emailSubmitted ? (
                    /* Confirmation Screen */
                    <div className="text-center py-6 space-y-3">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base">Inquiry Submitted!</h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                        Thank you. Your product quote request has been sent. Our team will get back to you shortly.
                      </p>
                      <button
                        onClick={() => {
                          setEmailSubmitted(false);
                          setShowEmailForm(false);
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline pt-2 inline-block"
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  ) : (
                    /* Inline Email Form */
                    <form onSubmit={handleSendEmailQuote} className="space-y-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">Complete Inquiry Form</span>
                        <button
                          type="button"
                          onClick={() => setShowEmailForm(false)}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3 h-3" /> Back
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Name / Company Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Your Name or Company"
                          value={emailName}
                          onChange={e => setEmailName(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="name@company.com"
                          value={emailAddress}
                          onChange={e => setEmailAddress(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Contact Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="+971 50 123 4567"
                          value={emailPhone}
                          onChange={e => setEmailPhone(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={emailSending}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                      >
                        {emailSending ? 'Sending Quote Request...' : <><Mail className="w-4 h-4" /> Send Email Quote Request</>}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
