import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  const orderId = `NXM-${Math.floor(10000000 + Math.random() * 90000000)}`;

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-200px)] py-12 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full mx-auto px-4 md:px-6">
        <div className="bg-white p-8 md:p-12 rounded-xl border border-slate-200 text-center relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>

          <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Order Confirmed!</h1>
          <p className="text-slate-500 text-sm mb-8">Thank you for shopping with Al Zaydan. Your order has been placed successfully.</p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 text-left grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Order ID</p>
              <p className="font-bold text-slate-900">{orderId}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Total Amount</p>
              <p className="font-bold text-slate-900">AED 1212.30</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Payment Method</p>
              <p className="font-bold text-slate-900 line-clamp-1">Invoice / PO</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Estimated Freight</p>
              <p className="font-bold text-emerald-600">Tomorrow, 9 AM</p>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center transition tracking-wide uppercase text-sm">
              <Package className="w-4 h-4 mr-2" />
              Track Order
            </button>
            <Link to="/" className="w-full h-12 bg-white text-slate-700 border border-slate-300 font-bold rounded-lg flex items-center justify-center hover:bg-slate-50 transition group uppercase tracking-wide text-sm">
              Continue Shopping 
            </Link>
          </div>
          
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">Need help? <a href="#" className="text-blue-600 font-bold hover:underline">Contact Customer Support</a></p>
        </div>
      </div>
    </div>
  );
}
