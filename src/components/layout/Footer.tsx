import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, Lock, Award, Instagram, Facebook, Linkedin, Youtube, Twitter, Phone, Mail, MapPin } from 'lucide-react';
import WhatsAppIcon from '../icons/WhatsAppIcon';
import { useStore } from '../../context/StoreContext';
import { generateSlug } from '../../lib/blogService';

export default function Footer() {
  const { settings, categories, categoryDetails } = useStore();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8 text-sm text-slate-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Trust Signals Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">100% Genuine</h4>
              <p className="text-xs text-slate-400">Certified industrial grade</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
              <WhatsAppIcon className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">WhatsApp Ordering</h4>
              <p className="text-xs text-slate-400">Direct discussion & payment</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">Net-30 Terms</h4>
              <p className="text-xs text-slate-400">B2B Trade accounts</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">ISO 9001</h4>
              <p className="text-xs text-slate-400">Quality management</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-12">
          
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="mb-6 flex items-center gap-2.5 group">
              <img
                src="/android-chrome-512x512.png"
                alt="Al Zaydan International"
                className="h-8 w-auto object-contain brightness-0 invert shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white uppercase leading-none group-hover:text-blue-400 transition-colors">Al Zaydan</span>
                <span className="text-[9px] font-bold tracking-[0.2em] text-blue-500 uppercase mt-1">International</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
              Your trusted partner for certified safety gear, industrial tools, and premium B2B supplies. Operating globally to keep your sites safe and productive.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              {settings?.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.linkedinUrl && (
                <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {settings?.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {settings?.xUrl && (
                <a href={settings.xUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {settings?.whatsappUrl && (
                <a href={settings.whatsappUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-green-600 hover:text-white transition-colors">
                  <WhatsAppIcon className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Google Map Miniature */}
            <div className="mt-8 pt-4">
              <a 
                href={settings?.googleMapsUrl || "https://goo.gl/maps/placeholder"} 
                target="_blank" 
                rel="noreferrer" 
                className="block rounded-xl overflow-hidden border border-slate-800 bg-slate-800/50 h-36 w-full relative group transition-all hover:border-blue-500/50"
              >
                <div className="absolute inset-0 z-10 pointer-events-none group-hover:bg-blue-600/5 transition-colors" />
                <iframe 
                  src={settings?.googleMapsEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.3308826276!2d55.2713!3d25.2048!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDEyJzE3LjMiTiA1NcKwMTYnMTYuNyJF!5e0!3m2!1sen!2sae!4v1650000000000!5m2!1sen!2sae"}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) opacity(0.6)', pointerEvents: 'none' }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="absolute bottom-2 right-2 z-20 bg-slate-900/80 backdrop-blur-sm border border-white/10 px-2 py-1 rounded text-[9px] font-bold text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Maps
                </div>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-[11px]">Categories</h3>
            <ul className="space-y-4 font-medium text-sm">
              {categories.map(cat => (
                <li key={cat}>
                  <Link to={`/category/${categoryDetails?.[cat]?.slug || generateSlug(cat)}`} className="hover:text-white transition-colors capitalize">
                    {cat}
                  </Link>
                </li>
              ))}
              <li><Link to="/categories" className="hover:text-blue-400 transition-colors">View All Categories &rarr;</Link></li>
            </ul>
          </div>



          <div>
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-[11px]">Quick Links</h3>
            <ul className="space-y-4 font-medium text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/search" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/solutions" className="hover:text-white transition-colors">Our Solutions</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog & News</Link></li>
              <li><Link to="/rfq" className="hover:text-white transition-colors">RFQ / Bulk Order</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/legal" className="hover:text-white transition-colors">Legal & Policies</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-[11px]">Contact</h3>
            <ul className="space-y-4 font-medium text-sm">
              {/* Phone Numbers */}
              {settings?.phones && settings.phones.length > 0 ? (
                settings.phones.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                    <div className="flex flex-col">
                      {p.label && <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold leading-none mb-1">{p.label}</span>}
                      <a href={`tel:${p.value}`} className="hover:text-white transition-colors">{p.value}</a>
                    </div>
                  </li>
                ))
              ) : settings?.phoneNumber ? (
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                  <a href={`tel:${settings.phoneNumber}`} className="hover:text-white transition-colors">{settings.phoneNumber}</a>
                </li>
              ) : null}

              {/* Email Addresses */}
              {settings?.emails && settings.emails.length > 0 ? (
                settings.emails.map((e, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Mail className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                    <div className="flex flex-col">
                      {e.label && <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold leading-none mb-1">{e.label}</span>}
                      <a href={`mailto:${e.value}`} className="hover:text-white transition-colors break-all">{e.value}</a>
                    </div>
                  </li>
                ))
              ) : settings?.email ? (
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors break-all">{settings.email}</a>
                </li>
              ) : null}

              {settings?.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                  <span className="whitespace-pre-wrap">{settings.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
          <p className="text-slate-500 text-xs">&copy; {new Date().getFullYear()} Al Zaydan International FZE. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-slate-500 font-medium">
             <Link to="/legal#terms"   className="hover:text-white cursor-pointer transition-colors">Terms of Sale</Link>
             <Link to="/legal#privacy" className="hover:text-white cursor-pointer transition-colors">Privacy Policy</Link>
             <Link to="/legal#cookies" className="hover:text-white cursor-pointer transition-colors">Cookie Preferences</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
