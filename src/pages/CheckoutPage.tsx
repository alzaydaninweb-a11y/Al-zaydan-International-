import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sendEmail } from '../lib/emailService';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartCount, subtotal, clearCart } = useCart();
  const { settings } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const total = subtotal;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const orderId = `ORD-${Math.floor(10000 + Math.random() * 89999)}`;
    
    const address = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      company: formData.get('company') as string,
      street: formData.get('street') as string,
      area: formData.get('area') as string,
      emirate: formData.get('emirate') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
    };

    try {
      // 1. Save to Firestore (gracefully handle permission/network errors)
      try {
        await addDoc(collection(db, 'orders'), {
          orderId,
          customerName: `${address.firstName} ${address.lastName}`,
          customerEmail: address.email,
          customerPhone: address.phone,
          company: address.company || '',
          address: `${address.street}, ${address.area}, ${address.emirate}`,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          subtotal,
          total,
          status: 'Processing',
          createdAt: serverTimestamp(),
        });
      } catch (dbErr) {
        console.error('Firestore save failed, but continuing to WhatsApp:', dbErr);
      }

      // 2. Format WhatsApp Message Template
      const pricedItems  = cartItems.filter(i => i.priceType !== 'hidden' && i.price > 0);
      const enquiryItems = cartItems.filter(i => i.priceType === 'hidden' || i.price === 0);
      const pricedTotal  = pricedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

      let message = `*ORDER REQUEST*\n`;
      message += `------------------------------------------\n`;
      message += `*Order ID:* ${orderId}\n\n`;

      message += `*CUSTOMER DETAILS*\n`;
      message += `------------------------------------------\n`;
      message += `*Name:* ${address.firstName} ${address.lastName}\n`;
      if (address.company) message += `*Company:* ${address.company}\n`;
      message += `*Phone:* ${address.phone}\n`;
      message += `*Email:* ${address.email}\n`;
      message += `*Address:* ${address.street}, ${address.area}, ${address.emirate}\n`;

      // Section 1 — Priced products
      if (pricedItems.length > 0) {
        message += `\n*CONFIRMED PRODUCTS*\n`;
        message += `------------------------------------------\n`;
        pricedItems.forEach(item => {
          const lineTotal = (item.price * item.quantity).toFixed(2);
          message += `- *${item.name}*\n`;
          message += `  AED ${item.price.toFixed(2)} x ${item.quantity} = *AED ${lineTotal}*\n`;
        });
        message += `\n*SUBTOTAL: AED ${pricedTotal.toFixed(2)}*\n`;
        message += `------------------------------------------\n`;
      }

      // Section 2 — Enquiry products (no price)
      if (enquiryItems.length > 0) {
        message += `\n*PRODUCTS NEEDING A PRICE QUOTE*\n`;
        message += `------------------------------------------\n`;
        enquiryItems.forEach(item => {
          message += `- *${item.name}*  Qty: ${item.quantity}\n`;
        });
        message += `\n(Kindly confirm pricing for the above items)\n`;
        message += `------------------------------------------\n`;
      }

      // Send background email alert (don't await so it's instant and doesn't block WhatsApp)
      sendEmail({
        name: `${address.firstName} ${address.lastName}`,
        email: address.email,
        phone: address.phone,
        title: `New Order Alert: ${orderId}`,
        message: message.trim()
      }).catch(err => console.error("Email alert failed, but order continues:", err));

      const encodedMessage = encodeURIComponent(message);
      
      // Use specific order number from dashboard settings
      const targetPhone = settings?.whatsappRouting?.product || settings?.orderWhatsAppNumber || settings?.phoneNumber || '';
      const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

      setIsProcessing(false);
      clearCart();
      
      // Direct redirect to WhatsApp
      window.location.href = waUrl;
    } catch (error) {
      console.error('Error saving order:', error);
      alert('There was an error processing your order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
        <Link to="/" className="inline-block bg-amber-400 text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-amber-500">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Complete Order via WhatsApp</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h2 className="font-bold text-slate-900">Delivery Details</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex gap-4">
                     <div className="flex-1">
                       <label className="block text-sm font-semibold text-slate-700 mb-1">First Name</label>
                       <input required name="firstName" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors" />
                     </div>
                     <div className="flex-1">
                       <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name</label>
                       <input required name="lastName" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors" />
                     </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
                    <input name="company" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Street Name & Building/Villa</label>
                    <input required name="street" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Area / Neighborhood</label>
                    <input required name="area" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Emirate</label>
                    <select required name="emirate" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors bg-white">
                      <option value="">Select Emirate</option>
                      <option value="Dubai">Dubai</option>
                      <option value="Abu Dhabi">Abu Dhabi</option>
                      <option value="Sharjah">Sharjah</option>
                      <option value="Ajman">Ajman</option>
                      <option value="Umm Al Quwain">Umm Al Quwain</option>
                      <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                      <option value="Fujairah">Fujairah</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                    <input required name="email" type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input required name="phone" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors" />
                  </div>
                </div>
              </div>

              {/* Order Finalization Info */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <WhatsAppIcon className="w-5 h-5 text-green-500" /> WhatsApp Ordering
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Instead of paying online immediately, we finalize all orders and payments directly via WhatsApp. This allows us to confirm exact shipping costs, bulk discounts, and product availability directly with you.
                  </p>
                  <ul className="text-sm text-slate-700 space-y-2">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Click "Send Order to WhatsApp"</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Our sales representative will receive your cart</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Finalize the payment securely with our team</li>
                  </ul>
                </div>
              </div>
            </form>
          </div>

          <div className="lg:w-96 shrink-0">
            <div className="bg-white p-6 rounded-xl border border-slate-200 sticky top-32">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                Order Summary
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-bold py-1 px-2.5 rounded-full">{cartCount} Items</span>
              </h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                      <p className="text-slate-500 font-medium">Qty: {item.quantity}</p>
                      <p className="font-bold text-slate-900 mt-1">
                        {item.priceType === 'hidden' || item.price === 0 
                          ? <span className="text-amber-600 text-xs uppercase tracking-wide">Price on Request</span>
                          : `AED ${(item.price * item.quantity).toFixed(2)}`
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-100 mb-6">
                <div className="flex justify-between text-slate-600 text-sm font-medium">
                  <span>Subtotal</span>
                  <span>AED {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-600 text-sm font-medium">
                  <span>Delivery</span>
                  <span className="text-slate-500 font-medium italic">Calculated over WhatsApp</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200 mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-slate-900">Estimated Total</span>
                  <span className="font-extrabold text-2xl text-slate-900">AED {total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit"
                form="checkout-form"
                disabled={isProcessing}
                className="w-full bg-[#25D366] text-white h-12 rounded font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#128C7E] shadow-sm transition-colors disabled:opacity-70 tracking-wide"
              >
                <WhatsAppIcon className="w-5 h-5" />
                {isProcessing ? 'Redirecting...' : `Send Order to WhatsApp`}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                <ShoppingBag className="w-4 h-4" />
                Your order details will be securely sent to our team.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
