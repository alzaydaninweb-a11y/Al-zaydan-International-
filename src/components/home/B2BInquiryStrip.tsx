import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Phone, ArrowRight, Shield, Package, Globe } from 'lucide-react';
import WhatsAppIcon from '../icons/WhatsAppIcon';
import { useStore } from '../../context/StoreContext';

export default function B2BInquiryStrip() {
  const { settings } = useStore();
  const defaultWa = settings?.orderWhatsAppNumber || settings?.phoneNumber?.replace(/\D/g, '') || '';
  const whatsappNumber = settings?.whatsappRouting?.procurement || defaultWa;
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const whatsappUrl = cleanNumber
    ? `https://wa.me/${cleanNumber}?text=Hello%2C%20I%20am%20a%20B2B%20buyer%20interested%20in%20bulk%20pricing%20and%20procurement%20support.`
    : '#';

  return (
    <div className="bg-[#0d1b2a] border-b border-[#1e3a5f]">
      <div className="max-w-screen-2xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 items-center">
          {/* Left: Value props */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-1 rounded-full">B2B Procurement Platform</span>
            </div>
            <h3 className="text-white font-extrabold text-[18px] mb-3 leading-tight">
              Need bulk quantities or custom specs?
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Shield, label: 'ISO 9001 Certified', sub: 'Quality guaranteed' },
                { icon: Package, label: 'Bulk Pricing', sub: 'Volume discounts' },
                { icon: Globe, label: 'GCC Export', sub: 'Regional delivery' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-[12px]">{item.label}</p>
                    <p className="text-slate-400 text-[11px]">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <a href={whatsappUrl} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-[13px] transition-colors">
              <WhatsAppIcon className="w-4 h-4" /> WhatsApp a Specialist
            </a>
            <Link to="/contact"
              className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-[13px] transition-colors">
              <FileText className="w-4 h-4" /> Submit RFQ
            </Link>
            {settings?.phones?.[0]?.value && (
              <a href={`tel:${settings.phones[0].value}`}
                className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[13px] transition-colors border border-white/20">
                <Phone className="w-4 h-4" /> {settings.phones[0].value}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
