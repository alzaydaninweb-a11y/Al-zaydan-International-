import React from 'react';
import { useStore } from '../../context/StoreContext';
import WhatsAppIcon from '../icons/WhatsAppIcon';

export default function FloatingWhatsApp() {
  const { settings } = useStore();
  const defaultWa = settings?.orderWhatsAppNumber || settings?.phoneNumber?.replace(/\D/g, '') || '';
  const rawNumber = settings?.whatsappRouting?.contact || defaultWa;
  const number = rawNumber.replace(/\D/g, '');
  const url = number
    ? `https://wa.me/${number}?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20your%20products%20and%20bulk%20pricing.`
    : '#';

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-[400] flex items-center gap-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-green-500/40 hover:shadow-2xl group"
    >
      {/* Pulsing ring */}
      <span className="absolute inset-0 rounded-full bg-green-500 opacity-30 animate-ping" />
      <span className="relative flex items-center gap-2.5 px-4 py-3">
        <WhatsAppIcon className="w-5 h-5 shrink-0" />
        <span className="text-[13px] font-bold max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 whitespace-nowrap">
          Chat with us
        </span>
      </span>
    </a>
  );
}
