import React from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, Award, Lock, CheckCircle2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import WhatsAppIcon from '../icons/WhatsAppIcon';
import { useStore } from '../../context/StoreContext';

export default function Hero() {
  const { settings } = useStore();

  const bgVideo = settings?.homepageHeroBgVideo || "https://assets.mixkit.co/videos/preview/mixkit-large-industrial-machine-in-a-factory-40845-large.mp4";
  const mainImage = settings?.homepageHeroMainImage || "https://i.pinimg.com/736x/0f/82/ce/0f82ce6a2db74a86de40c021da973bbd.jpg";
  const secondaryImage = settings?.homepageHeroSecondaryImage || "https://i.pinimg.com/1200x/31/55/4b/31554b9c5f25bda0bcbca061adaa4ac5.jpg";

  return (
    <div className="w-full relative overflow-hidden bg-slate-900 border-b border-slate-800">
      {/* Background Video */}
      <div className="absolute inset-0 opacity-40">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="object-cover w-full h-full grayscale brightness-50"
          src={bgVideo}
        />
      </div>

      {/* Subtle Dark Gradient Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 relative flex flex-col items-center md:flex-row justify-between min-h-[600px] md:min-h-[700px]">

        {/* Content (Left) */}
        <div className="relative z-20 w-full md:w-3/5 flex flex-col justify-center py-16 md:py-24 h-full">
          <div className="flex items-center gap-2 text-amber-400 text-[12px] font-bold tracking-[0.1em] mb-6 uppercase bg-amber-400/10 w-fit px-3 py-1.5 rounded border border-amber-400/20">
            <ShieldCheck className="w-4 h-4" />
            100% Certified Safety Gear
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
            Equipping Industry
            <span className="block text-blue-500 mt-2">Built for the Tough Jobs.</span>
          </h1>

          <p className="text-slate-300 text-[16px] md:text-[18px] mb-10 max-w-lg leading-relaxed">
            Your trusted B2B partner for safety, reliability, and bulk purchasing. Get wholesale pricing on premium tools, protective equipment, and heavy-duty machinery.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/search" className="bg-blue-600 text-white font-bold py-4 px-8 rounded flex items-center justify-center hover:bg-blue-700 transition-colors shadow-[0_10px_25px_rgba(37,99,235,0.4)] text-[15px] tracking-wide">
              Shop Products
            </Link>
            <button
              onClick={() => {
                document.getElementById('shop-by-department')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold py-4 px-8 rounded flex items-center justify-center hover:bg-white/10 transition-colors text-[15px] tracking-wide cursor-pointer"
            >
              Browse Categories
            </button>
          </div>
        </div>

        {/* Image / Graphics (Right) - High-end E-commerce Industrial Style */}
        <div className="hidden md:flex relative z-10 w-[50%] h-[600px] mt-8 md:mt-0 items-center justify-end">

          <div className="relative w-full max-w-lg h-full pt-10">
            {/* Main large image - Right Aligned & Floating */}
            <div className="absolute top-8 right-0 w-[85%] h-[80%] rounded-[2rem] overflow-hidden border border-slate-700/60 shadow-[0_30px_60px_rgba(0,0,0,0.4)] z-10 group animate-float">
              <img
                src={mainImage}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                alt="Industrial warehouse and inventory"
                loading="eager"
                fetchPriority="low"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
            </div>

            {/* Secondary Image - Overlapping Bottom Left */}
            <div className="absolute bottom-6 left-0 w-[45%] h-[40%] rounded-2xl overflow-hidden border-[6px] border-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-20 group animate-float-delayed">
              <img
                src={secondaryImage}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                alt="Worker with premium safety gear"
                loading="lazy"
              />
            </div>

            {/* Floating Trust Badge 1: ISO Certified */}
            <div className="absolute top-16 -left-4 bg-slate-800/85 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl z-30 flex items-center gap-3.5 animate-float-slow w-52">
              <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-extrabold tracking-tight">ISO 9001</span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] mt-0.5">Certified</span>
              </div>
            </div>

            {/* Floating Trust Badge 2: WhatsApp Ordering */}
            <div className="absolute bottom-32 -right-8 bg-green-600/90 backdrop-blur-xl border border-green-500/80 rounded-2xl p-3.5 shadow-[0_20px_40px_rgba(34,197,94,0.4)] z-30 flex items-center gap-3.5 animate-float w-[210px]">
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/20 text-white shrink-0">
                <WhatsAppIcon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-[13px] font-extrabold tracking-tight leading-tight">WhatsApp Ordering</span>
                <span className="text-green-200 text-[11px] font-medium tracking-wide mt-0.5 flex items-center gap-1.5">
                  Direct & Secure
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
