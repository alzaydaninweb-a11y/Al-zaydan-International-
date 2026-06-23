import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Shield, Truck, Tag, ChevronRight, Package } from 'lucide-react';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import { useCart } from '../context/CartContext';
import { generateSlug } from '../lib/blogService';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();

  // Split items: priced items (fixed/range) vs hidden-price (enquiry) items
  const pricedItems = cartItems.filter(item => item.priceType !== 'hidden' && item.price > 0);
  const enquiryItems = cartItems.filter(item => item.priceType === 'hidden' || item.price === 0);
  const pricedSubtotal = pricedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = pricedSubtotal;

  return (
    <div className="bg-[#f5f6fa] min-h-screen">

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-semibold">Shopping Cart</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">

        {/* Title Row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {cartItems.length === 0 ? 'No items in cart' : `${cartItems.reduce((a, i) => a + i.quantity, 0)} item${cartItems.reduce((a, i) => a + i.quantity, 0) !== 1 ? 's' : ''} in your cart`}
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
            <h2 className="text-xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">
              Looks like you haven't added any items yet. Browse our products and find what you need.
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
              <div className="hidden md:grid grid-cols-[1fr_auto_auto] items-center px-5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Product</span>
                <span className="w-32 text-center">Quantity</span>
                <span className="w-28 text-right">Total</span>
              </div>

              {/* Priced Items */}
              {pricedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-5">
                    <Link
                      to={`/product/${item.slug || generateSlug(item.name)}`}
                      className="w-20 h-20 md:w-[88px] md:h-[88px] shrink-0 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center"
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.slug || generateSlug(item.name)}`}>
                        <h3 className="font-bold text-slate-900 text-[15px] leading-snug hover:text-blue-600 transition-colors line-clamp-2">{item.name}</h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {item.brand && (
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{item.brand}</span>
                        )}
                        {item.inStock && (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>In Stock
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-1">AED {item.price.toFixed(2)} / unit</p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <span className="font-extrabold text-slate-900 text-lg sm:text-xl order-2 sm:order-1">AED {(item.price * item.quantity).toFixed(2)}</span>
                      <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden h-9 order-1 sm:order-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-9 h-9 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-200 transition-colors text-lg">−</button>
                        <span className="w-8 text-center text-sm font-extrabold text-slate-900 select-none">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-9 h-9 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-200 transition-colors text-lg">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="order-3 text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50" title="Remove item">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Hidden-Price / Enquiry Items */}
              {enquiryItems.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <span className="text-[12px] font-extrabold text-slate-700 uppercase tracking-widest">Items — Price to Be Confirmed via WhatsApp</span>
                  </div>
                  <div className="space-y-3">
                    {enquiryItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-5">
                          <Link
                            to={`/product/${item.slug || generateSlug(item.name)}`}
                            className="w-20 h-20 md:w-[88px] md:h-[88px] shrink-0 rounded-xl bg-white border border-amber-200 overflow-hidden flex items-center justify-center"
                          >
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${item.slug || generateSlug(item.name)}`}>
                              <h3 className="font-bold text-slate-900 text-[15px] leading-snug hover:text-blue-600 transition-colors line-clamp-2">{item.name}</h3>
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              {item.brand && (
                                <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-amber-200">{item.brand}</span>
                              )}
                              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">Price on WhatsApp</span>
                            </div>
                            <p className="text-xs text-amber-700 font-medium mt-1">Pricing based on size &amp; quantity — our team will confirm via WhatsApp</p>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <span className="font-extrabold text-amber-700 text-sm sm:text-base order-2 sm:order-1">Quote via WhatsApp</span>
                            <div className="flex items-center bg-white border border-amber-200 rounded-xl overflow-hidden h-9 order-1 sm:order-2">
                              <button onClick={() => updateQuantity(item.id, -1)} className="w-9 h-9 flex items-center justify-center text-slate-600 font-bold hover:bg-amber-50 transition-colors text-lg">−</button>
                              <span className="w-8 text-center text-sm font-extrabold text-slate-900 select-none">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="w-9 h-9 flex items-center justify-center text-slate-600 font-bold hover:bg-amber-50 transition-colors text-lg">+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="order-3 text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50" title="Remove item">
                              <Trash2 className="w-4 h-4" />
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
                  <h2 className="font-extrabold text-slate-900 text-[17px] tracking-tight">Order Summary</h2>
                </div>

                <div className="p-6 space-y-5">

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
                      <span className="font-bold text-slate-900">Calculated at Checkout</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                    <span className="font-bold text-slate-700 text-[15px]">Total</span>
                    <div className="text-right">
                      <div className="font-extrabold text-slate-900 text-2xl tracking-tight">
                        AED {total.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">VAT included</div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    to="/checkout"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/20 group text-[15px] tracking-wide"
                  >
                    Place Order through WhatsApp
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <p className="text-center text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
                    <WhatsAppIcon className="w-3 h-3" />
                    Direct WhatsApp Ordering — Al Zaydan International
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
