import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PackageSearch, Users, Truck, Globe2, 
  HelpCircle, Lightbulb, ArrowRight, CheckCircle2,
  Clock, ShieldCheck, HeadphonesIcon, Phone, Mail
} from 'lucide-react';
import WhatsAppIcon from '../icons/WhatsAppIcon';
import { useStore } from '../../context/StoreContext';

const SERVICES = [
  {
    icon: PackageSearch,
    title: 'Product Sourcing Assistance',
    desc: 'Hard-to-find materials? Let our experts locate the exact specifications you need globally.',
    cta: 'Source Products',
    link: '/rfq'
  },
  {
    icon: Users,
    title: 'Supplier Matching',
    desc: 'We match your requirements with verified manufacturers that meet your quality standards.',
    cta: 'Find Suppliers',
    link: '/contact'
  },
  {
    icon: Truck,
    title: 'Bulk Order Handling',
    desc: 'End-to-end management of high-volume orders with consolidated shipping logistics.',
    cta: 'Request Bulk Quote',
    link: '/rfq'
  },
  {
    icon: Globe2,
    title: 'International Shipping',
    desc: 'Streamlined customs clearance and global freight forwarding for seamless delivery.',
    cta: 'Shipping Support',
    link: '/contact'
  },
  {
    icon: HelpCircle,
    title: 'Technical Guidance',
    desc: 'Expert consultation on material specifications, safety standards, and compliances.',
    cta: 'Get Technical Help',
    link: '/contact'
  },
  {
    icon: Lightbulb,
    title: 'Procurement Consultation',
    desc: 'Optimize your purchasing strategy and reduce overhead with our enterprise solutions.',
    cta: 'Book Consultation',
    link: '/contact'
  }
];

const WORKFLOW_STEPS = [
  {
    num: '01',
    title: 'Submit Your Requirement',
    desc: 'Provide exact specifications and volume needs'
  },
  {
    num: '02',
    title: 'Procurement Team Reviews',
    desc: 'Our experts analyze and scope the request'
  },
  {
    num: '03',
    title: 'Supplier Matching & Verification',
    desc: 'We identify and vet top-tier manufacturers'
  },
  {
    num: '04',
    title: 'Receive Quotations',
    desc: 'Review competitive bids and terms'
  },
  {
    num: '05',
    title: 'Confirm & Process Order',
    desc: 'Finalize purchase with assured fulfillment'
  }
];

export default function ProcurementSupport() {
  const navigate = useNavigate();
  const { settings } = useStore();

  return (
    <section className="py-16 bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* ── Section Header ── */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
            <ShieldCheck className="w-4 h-4" />
            Enterprise Solutions
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Procurement Assistance & Sourcing Support
          </h2>
          <p className="text-slate-500 text-[15px] sm:text-[16px] leading-relaxed">
            Get expert help sourcing industrial materials for your business. Our dedicated team manages the entire procurement lifecycle, ensuring quality, speed, and cost-efficiency.
          </p>
        </div>

        {/* ── 1. Procurement Services Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
          {SERVICES.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div 
                key={idx} 
                className="group bg-[#f8fafc] border border-slate-200 hover:border-blue-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
                  <Icon className="w-24 h-24 text-blue-600 -mr-6 -mt-6 transform group-hover:rotate-12 transition-transform duration-500" />
                </div>
                
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-5 group-hover:bg-blue-600 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 relative z-10">{srv.title}</h3>
                <p className="text-sm text-slate-500 mb-5 relative z-10 min-h-[40px]">{srv.desc}</p>
                <button 
                  onClick={() => navigate(srv.link)}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors relative z-10 group/btn"
                >
                  {srv.cta}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

        {/* ── 2. Procurement Workflow Section ── */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 mb-16 relative overflow-hidden shadow-2xl">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">How Our Sourcing Works</h3>
              <p className="text-slate-400 text-sm max-w-xl">
                A streamlined, transparent process designed to handle complex industrial procurement requirements with efficiency.
              </p>
            </div>
            <button 
              onClick={() => navigate('/rfq')}
              className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-lg transition-colors border border-blue-500 shadow-lg"
            >
              Start Sourcing
            </button>
          </div>

          <div className="relative z-10">
            {/* Desktop Horizontal Line */}
            <div className="hidden lg:block absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-slate-700/50"></div>
            
            {/* Mobile Vertical Line */}
            <div className="lg:hidden absolute top-8 bottom-8 left-[28px] w-[2px] bg-slate-700/50"></div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-4 relative">
              {WORKFLOW_STEPS.map((step, idx) => (
                <div key={idx} className="relative flex lg:flex-col items-start lg:items-center gap-4 lg:gap-4 group">
                  <div className="relative">
                    <div className="w-14 h-14 bg-slate-800 border-2 border-slate-700 group-hover:border-blue-500 rounded-full flex items-center justify-center shadow-lg transition-colors z-10 relative">
                      <span className="text-sm font-black text-slate-300 group-hover:text-blue-400 transition-colors">{step.num}</span>
                    </div>
                    {/* Active state indicator glow */}
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="pt-2 lg:pt-0 lg:text-center flex-1">
                    <h4 className="text-[15px] font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{step.title}</h4>
                    <p className="text-[12px] text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. Procurement Team CTA Area ── */}
        {settings?.expertProfile?.active && (
          <div className="max-w-7xl mx-auto border-y sm:border sm:rounded-xl border-slate-200 bg-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-5 flex-1">
              <div className="relative shrink-0">
                {settings.expertProfile.photoUrl ? (
                  <img src={settings.expertProfile.photoUrl} alt={settings.expertProfile.name} className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-500 font-bold text-xl">
                    {settings.expertProfile.name.charAt(0)}
                  </div>
                )}
                <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" title="Online Now" />
              </div>
              
              <div>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 mb-1.5">
                  <h4 className="text-lg font-bold text-slate-900 leading-none">Talk with {settings.expertProfile.name}</h4>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {settings.expertProfile.role}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-2.5 max-w-2xl">
                  Dedicated procurement support for bulk pricing, complex orders, and global logistics tailored to your business needs.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 2 Hour SLA</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Verified Sourcing Network</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end gap-3 shrink-0">
              {settings.expertProfile.whatsapp && (
                <a href={`https://wa.me/${settings.expertProfile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 hover:border-[#25D366] text-slate-700 hover:text-[#25D366] font-semibold rounded-md transition-colors flex items-center justify-center gap-2 text-sm">
                  <WhatsAppIcon className="w-4 h-4" /> WhatsApp
                </a>
              )}
              {settings.expertProfile.phone && (
                <a href={`tel:${settings.expertProfile.phone}`} className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-md transition-colors flex items-center justify-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" /> Call
                </a>
              )}
              {settings.expertProfile.email && (
                <a href={`mailto:${settings.expertProfile.email}`} className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-md transition-colors flex items-center justify-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" /> Email
                </a>
              )}
              {!settings.expertProfile.whatsapp && !settings.expertProfile.phone && !settings.expertProfile.email && (
                <button onClick={() => navigate('/rfq')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2 text-sm">
                  Request Help <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
