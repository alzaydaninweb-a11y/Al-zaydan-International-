import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Shield, Truck, Tag, ChevronRight, Package } from 'lucide-react';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { generateSlug } from '../lib/blogService';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();
  const { settings } = useStore();

  // Split items: priced items (fixed/range) vs hidden-price (enquiry) items
  const pricedItems = cartItems.filter(item => item.priceType !== 'hidden' && item.price > 0);
  const enquiryItems = cartItems.filter(item => item.priceType === 'hidden' || item.price === 0);
  const pricedSubtotal = pricedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = pricedSubtotal;

  const handleRequestQuote = () => {
    const inquiryId = `RFQ-${Math.floor(10000 + Math.random() * 89999)}`;
    let message = `*QUOTE INQUIRY REQUEST*\n`;
    message += `------------------------------------------\n`;
    message += `*Inquiry ID:* ${inquiryId}\n\n`;

    if (total === 0) {
      message += `*ITEMS LIST:*\n`;
      message += `------------------------------------------\n`;
      cartItems.forEach(item => {
        message += `- *${item.name}* (Qty: ${item.quantity})\n`;
      });
      message += `------------------------------------------\n`;
      message += `Kindly share a quote.`;
    } else {
      if (pricedItems.length > 0) {
        message += `*CONFIRMED PRODUCTS*\n`;
        message += `------------------------------------------\n`;
        pricedItems.forEach(item => {
          const lineTotal = (item.price * item.quantity).toFixed(2);
          message += `- *${item.name}*\n`;
          message += `  AED ${item.price.toFixed(2)} x ${item.quantity} = *AED ${lineTotal}*\n`;
        });
        message += `\n*SUBTOTAL: AED ${pricedSubtotal.toFixed(2)}*\n`;
        message += `------------------------------------------\n`;
      }

      if (enquiryItems.length > 0) {
        message += `\n*PRODUCTS NEEDING A PRICE QUOTE*\n`;
        message += `------------------------------------------\n`;
        enquiryItems.forEach(item => {
          message += `- *${item.name}*  Qty: ${item.quantity}\n`;
        });
        message += `\n(Kindly confirm pricing for the above items)\n`;
        message += `------------------------------------------\n`;
      }
    }

    const encodedMessage = encodeURIComponent(message);
    const targetPhone = settings?.whatsappRouting?.product || settings?.orderWhatsAppNumber || settings?.phoneNumber || '';
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="bg-[#f5f6fa] min-h-screen">

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-semibold">Quote List</span>
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
              {cartItems.length === 0 ? 'No items in quote list' : `${cartItems.reduce((a, i) => a + i.quantity, 0)} item${cartItems.reduce((a, i) => a + i.quantity, 0) !== 1 ? 's' : ''} in your quote list`}
            </p>
          </div>
          {cartItems.length > 0 && (
            <Link to="/search" className="hidden md:flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-bold transition-colors">
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* ── Empty State ── */
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-9 h-9 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Your quote list is empty</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">
              Looks like you haven't added any items to your inquiry list yet. Browse our products and find what you need.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-800 transition-colors"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">

            {/* ── Left: Cart Items ── */}
            <div className="flex-1 min-w-0 space-y-3">

              {/* Table Header (desktop only) */}
              {total > 0 && (
                <div className="hidden md:grid grid-cols-[1fr_auto_auto] items-center px-5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Product</span>
                  <span className="w-32 text-center">Quantity</span>
                  <span className="w-28 text-right">Total</span>
                </div>
              )}

              {/* Priced Items */}
              {pricedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
                      <Link
                        to={`/product/${item.slug || generateSlug(item.name)}`}
                        className="w-16 h-16 md:w-[80px] md:h-[80px] shrink-0 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center"
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.slug || generateSlug(item.name)}`}>
                          <h3 className="font-bold text-slate-900 text-[14px] md:text-[15px] leading-snug hover:text-blue-600 transition-colors line-clamp-2">{item.name}</h3>
                        </Link>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {item.brand && (
                            <span className="text-[10px] md:text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{item.brand}</span>
                          )}
                          {item.inStock && (
                            <span className="text-[10px] md:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1 h-1 bg-emerald-500 rounded-full inline-block"></span>In Stock
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] md:text-xs text-slate-400 font-medium mt-1">AED {item.price.toFixed(2)} / unit</p>
                      </div>
                      
                      {/* Controls */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="font-extrabold text-slate-900 text-[14px] md:text-[15px]">AED {(item.price * item.quantity).toFixed(2)}</span>
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden h-7 md:h-8">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-200 transition-colors text-base md:text-lg">−</button>
                            <span className="w-6 md:w-8 text-center text-xs md:text-sm font-extrabold text-slate-900 select-none">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-200 transition-colors text-base md:text-lg">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50" title="Remove item">
                            <Trash2 className="w-4 h-4 md:w-4.5 md:h-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                </div>
              ))}

              {/* Hidden-Price / Enquiry Items */}
              {enquiryItems.length > 0 && (
                <div className="mt-4">
                  {total > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-amber-500" />
                      <span className="text-[12px] font-extrabold text-slate-700 uppercase tracking-widest">Items — Price to Be Confirmed via WhatsApp</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    {enquiryItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
                          <Link
                            to={`/product/${item.slug || generateSlug(item.name)}`}
                            className="w-16 h-16 md:w-[80px] md:h-[80px] shrink-0 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center"
                          >
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${item.slug || generateSlug(item.name)}`}>
                              <h3 className="font-bold text-slate-900 text-[14px] md:text-[15px] leading-snug hover:text-blue-600 transition-colors line-clamp-2">{item.name}</h3>
                            </Link>
                            {item.brand && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="text-[10px] md:text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{item.brand}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center shrink-0 ml-2">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { icon: Truck, label: 'Fast Shipping', sub: 'Reliable delivery network' },
                  { icon: WhatsAppIcon, label: 'WhatsApp Ordering', sub: 'Direct discussion & payment' },
                  { icon: Package, label: 'Easy Returns', sub: '30-day return policy' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center text-center gap-1.5">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 leading-tight">{label}</span>
                    <span className="text-[10px] text-slate-400 leading-tight hidden md:block">{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="w-full lg:w-[360px] xl:w-[380px] shrink-0 sticky top-28">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                {/* Summary Header */}
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h2 className="font-extrabold text-slate-900 text-[17px] tracking-tight">Quote Summary</h2>
                </div>

                <div className="p-6 space-y-5">
                  {total === 0 ? (
                    /* Zero Total B2B Quote Mode */
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-xl p-4 text-xs font-semibold leading-relaxed space-y-2">
                        <div className="font-extrabold text-[13px] text-blue-900 flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-blue-700" />
                          Quote via WhatsApp
                        </div>
                        <p className="text-slate-600 font-normal">
                          All selected items will be quoted with custom trade prices and shipping rates by our sales team.
                        </p>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={handleRequestQuote}
                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20 group text-[15px] tracking-wide"
                      >
                        <WhatsAppIcon className="w-5 h-5 text-white" />
                        Request Quote via WhatsApp
                      </button>
                    </div>
                  ) : (
                    /* Normal priced items summary */
                    <>
                      {/* Price Breakdown */}
                      <div className="space-y-3 pt-1">
                        <div className="flex justify-between items-center text-[13px] font-medium text-slate-600">
                          <span>Subtotal ({pricedItems.reduce((a, i) => a + i.quantity, 0)} priced item{pricedItems.reduce((a, i) => a + i.quantity, 0) !== 1 ? 's' : ''})</span>
                          <span className="font-semibold text-slate-900">AED {pricedSubtotal.toFixed(2)}</span>
                        </div>
                        {enquiryItems.length > 0 && (
                          <div className="flex justify-between items-center text-[13px] font-medium text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                            <span>{enquiryItems.reduce((a, i) => a + i.quantity, 0)} item{enquiryItems.reduce((a, i) => a + i.quantity, 0) !== 1 ? 's' : ''} (price via WhatsApp)</span>
                            <span className="font-bold">Quote via WhatsApp</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-[13px] font-medium text-slate-600">
                          <span>Shipping</span>
                          <span className="font-bold text-slate-900">Calculated over WhatsApp</span>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                        <span className="font-bold text-slate-700 text-[15px]">Estimated Total</span>
                        <div className="text-right">
                          <div className="font-extrabold text-slate-900 text-2xl tracking-tight">
                            AED {total.toFixed(2)}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">VAT included</div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={handleRequestQuote}
                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20 group text-[15px] tracking-wide"
                      >
                        <WhatsAppIcon className="w-5 h-5 text-white" />
                        Request Quote via WhatsApp
                      </button>
                    </>
                  )}

                  <p className="text-center text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
                    <WhatsAppIcon className="w-3 h-3" />
                    Direct WhatsApp Quotations — Al Zaydan International
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
