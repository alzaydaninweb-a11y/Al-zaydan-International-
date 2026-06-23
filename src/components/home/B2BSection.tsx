import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function B2BSection() {
  const benefits = [
    'Net-30 payment terms',
    'Volume-based wholesale pricing',
    'Dedicated account manager',
    'Priority fulfillment & shipping'
  ];

  return (
    <section className="py-16 px-4 md:px-6 max-w-7xl mx-auto w-full">
      <div className="bg-slate-900 rounded-3xl overflow-hidden flex flex-col lg:flex-row relative shadow-lg shadow-slate-900/10">
        
        {/* Text Content Block */}
        <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative z-10">
          <div className="text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-4">Corporate Accounts</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Buying in Bulk? <br className="hidden md:block"/>
            <span className="text-slate-300">Get Better Pricing.</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed max-w-md">
            Equip your entire workforce, warehouse, or construction site. Open a trade account for exclusive benefits designed to scale with your operations.
          </p>
          
          <ul className="flex flex-col gap-3 mb-10 text-slate-300 text-sm">
            {benefits.map((text, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                {text}
              </li>
            ))}
          </ul>

          <div>
            <button className="bg-amber-400 text-slate-900 text-[14px] font-bold px-8 py-4 rounded-full hover:bg-amber-500 transition-colors inline-flex items-center">
              Apply for Trade Account <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Image Block */}
        <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-full">
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=1200&auto=format&fit=crop" 
            alt="Warehouse Bulk Storage" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-50"
          />
        </div>

      </div>
    </section>
  );
}
