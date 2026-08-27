import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Save, Phone, MapPin, Mail, Instagram, Facebook, Linkedin, Youtube, Twitter, Image as ImageIcon, Plus, X, Users, Trash2, Shield, Layout, Upload, Loader, ArrowRight, MessageCircle, Sparkles, Layers, Sliders, Eye, ExternalLink, RefreshCw, Search, Check, CheckCircle2, PackageSearch } from 'lucide-react';
import WhatsAppIcon from '../../components/icons/WhatsAppIcon';
import { useStore } from '../../context/StoreContext';
import { uploadToR2 } from '../../lib/cloudflareR2';

export default function AdminSettings() {
  const { settings, updateGeneralSettings, products } = useStore();
  const [form, setForm] = useState(settings || {});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Security IP states
  const [currentIp, setCurrentIp] = useState('');
  const [newIpInput, setNewIpInput] = useState('');

  // Hero Section Dynamic Controls State
  const [bgUploading, setBgUploading] = useState(false);
  const bgFileRef = useRef<HTMLInputElement>(null);

  const [newFeaturedUrl, setNewFeaturedUrl] = useState('');
  const [newFeaturedLink, setNewFeaturedLink] = useState('');
  const [newFeaturedAlt, setNewFeaturedAlt] = useState('');
  const [featuredUploading, setFeaturedUploading] = useState(false);
  const featuredFileRef = useRef<HTMLInputElement>(null);

  const [nodeUploadingId, setNodeUploadingId] = useState<string | null>(null);
  const nodeFileRef = useRef<HTMLInputElement>(null);
  const [activeNodeUploadKey, setActiveNodeUploadKey] = useState<string>('');

  // Searchable Product Catalog Picker Modal State
  const [productPickerNodeId, setProductPickerNodeId] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('All');

  useEffect(() => {
    fetch('/api/get-ip')
      .then(res => {
        if (!res.ok) throw new Error('Not ok');
        return res.json();
      })
      .then(data => {
        if (data && data.ip) setCurrentIp(data.ip);
      })
      .catch(err => {
        console.warn('Local IP fetch failed, trying ipify fallback:', err);
        fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => {
            if (data && data.ip) setCurrentIp(data.ip);
          })
          .catch(fallbackErr => console.error('All IP fetches failed:', fallbackErr));
      });
  }, []);

  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState('');

  // Hero slide manager state
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [newSlideTitle1, setNewSlideTitle1] = useState('');
  const [newSlideTitle2, setNewSlideTitle2] = useState('');
  const [newSlideTitle3, setNewSlideTitle3] = useState('');
  const [newSlideSub, setNewSlideSub] = useState('');
  const [newSlideCta1Label, setNewSlideCta1Label] = useState('Start Sourcing');
  const [newSlideCta1To, setNewSlideCta1To] = useState('/search');
  const [newSlideCta2Label, setNewSlideCta2Label] = useState('');
  const [newSlideCta2To, setNewSlideCta2To] = useState('');
  const [slideUploading, setSlideUploading] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setForm({
        ...settings,
        trustedBrands: settings.trustedBrands || [
          { id: '1', name: 'BASF' },
          { id: '2', name: 'Dow' },
          { id: '3', name: 'SAMSUNG' },
          { id: '4', name: 'SIEMENS' },
          { id: '5', name: 'posco' },
          { id: '6', name: 'Schneider Electric' },
          { id: '7', name: 'Honeywell' },
          { id: '8', name: '3M' }
        ]
      });
    } else {
      setForm({
        trustedBrands: [
          { id: '1', name: 'BASF' },
          { id: '2', name: 'Dow' },
          { id: '3', name: 'SAMSUNG' },
          { id: '4', name: 'SIEMENS' },
          { id: '5', name: 'posco' },
          { id: '6', name: 'Schneider Electric' },
          { id: '7', name: 'Honeywell' },
          { id: '8', name: '3M' }
        ]
      });
    }
  }, [settings]);

  const addBrand = () => {
    if (!newBrandName.trim()) return;
    const brands = [...(form.trustedBrands || [])];
    brands.push({
      id: Math.random().toString(36).substr(2, 9),
      name: newBrandName.trim(),
      logoUrl: newBrandLogo.trim() || ''
    });
    setForm({ ...form, trustedBrands: brands });
    setNewBrandName('');
    setNewBrandLogo('');
    setSaved(false);
  };

  const removeBrand = (id: string) => {
    const brands = (form.trustedBrands || []).filter((b: any) => b.id !== id);
    setForm({ ...form, trustedBrands: brands });
    setSaved(false);
  };

  // ── Hero Config Helpers ──
  const heroConfig = form.heroConfig || {};

  const updateHeroConfig = (patch: any) => {
    setForm({
      ...form,
      heroConfig: {
        ...form.heroConfig,
        ...patch,
      }
    });
    setSaved(false);
  };

  const handleBgImageUpload = async (file: File) => {
    setBgUploading(true);
    try {
      const url = await uploadToR2(file, 'hero-bg');
      updateHeroConfig({ bgImageUrl: url });
    } catch (err) {
      alert('Background image upload failed. Please try again.');
    } finally {
      setBgUploading(false);
    }
  };

  const handleFeaturedImageUpload = async (file: File) => {
    setFeaturedUploading(true);
    try {
      const url = await uploadToR2(file, 'hero-featured');
      const slides = [...(heroConfig.featuredSlides || [])];
      slides.push({
        id: Math.random().toString(36).substr(2, 9),
        imageUrl: url,
        linkUrl: newFeaturedLink.trim() || '',
        altText: 'Featured Promotion',
      });
      updateHeroConfig({
        featuredSlides: slides,
        featuredImageUrl: url,
      });
      setNewFeaturedUrl('');
      setNewFeaturedLink('');
      setNewFeaturedAlt('');
    } catch (err) {
      alert('Featured image upload failed. Please try again.');
    } finally {
      setFeaturedUploading(false);
    }
  };

  const addFeaturedSlide = () => {
    if (!newFeaturedUrl.trim()) return;
    const slides = [...(heroConfig.featuredSlides || [])];
    slides.push({
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: newFeaturedUrl.trim(),
      linkUrl: newFeaturedLink.trim() || '',
      altText: newFeaturedAlt.trim() || 'Featured Promotion',
    });
    updateHeroConfig({
      featuredSlides: slides,
      featuredImageUrl: newFeaturedUrl.trim(),
    });
    setNewFeaturedUrl('');
    setNewFeaturedLink('');
    setNewFeaturedAlt('');
  };

  const removeFeaturedSlide = (id: string) => {
    const slides = (heroConfig.featuredSlides || []).filter((s: any) => s.id !== id);
    updateHeroConfig({ featuredSlides: slides });
  };

  const updateFeaturedCard = (cardId: string, patch: any) => {
    const defaultCards = [
      { id: 'card-1', label: 'Top Left Floating Card', customBadge: '🔥 Best Seller', customTitle: 'Traffic Signal Warning Lights', customPrice: 'Wholesale Certified', linkUrl: '/category/traffic-safety' },
      { id: 'card-2', label: 'Bottom Right Floating Card', customBadge: '⚡ UAE In Stock', customTitle: 'Zydex Neutral Silicone Sealant', customPrice: 'Direct Factory Rate', linkUrl: '/category/industrial-adhesive-tapes' },
    ];

    const currentCards = heroConfig.featuredCards && heroConfig.featuredCards.length === 2
      ? [...heroConfig.featuredCards]
      : defaultCards;

    const updated = currentCards.map(card => {
      if (card.id === cardId) {
        return { ...card, ...patch };
      }
      return card;
    });

    updateHeroConfig({ featuredCards: updated });
  };

  const handleCardImageUpload = async (cardId: string, file: File) => {
    setNodeUploadingId(cardId);
    try {
      const url = await uploadToR2(file, `hero-card-${cardId}`);
      updateFeaturedCard(cardId, { customImageUrl: url });
    } catch (err) {
      alert('Card image upload failed. Please try again.');
    } finally {
      setNodeUploadingId(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const addWhitelistedIp = (ipAddress: string) => {
    const cleanIp = ipAddress.replace(/^::ffff:/, '').trim();
    if (!cleanIp) return;
    
    // Support wildcards like 223.185.23.*
    if (!/^[0-9a-fA-F.:*]+$/.test(cleanIp)) {
      alert('Please enter a valid IP address or subnet wildcard (e.g. 223.185.23.*).');
      return;
    }
    
    const allowedIps = [...(form.adminAllowedIps || [])];
    if (allowedIps.includes(cleanIp)) {
      alert('This IP or subnet is already whitelisted.');
      return;
    }
    
    allowedIps.push(cleanIp);
    setForm({ ...form, adminAllowedIps: allowedIps });
    setNewIpInput('');
    setSaved(false);
  };

  const removeWhitelistedIp = (ipToRemove: string) => {
    const allowedIps = (form.adminAllowedIps || []).filter((ip: string) => ip !== ipToRemove);
    setForm({ ...form, adminAllowedIps: allowedIps });
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    let updatedForm = { ...form };
    const allowedIps = updatedForm.adminAllowedIps || [];

    // Failsafe: if whitelist is empty, set restriction mode to disabled automatically
    if (allowedIps.length === 0 && updatedForm.adminIpRestrictionEnabled) {
      alert('⚠️ Note: You cannot enable IP restrictions with an empty Whitelisted IP List. IP restriction has been set to Disabled to prevent locking yourself out.');
      updatedForm.adminIpRestrictionEnabled = false;
      setForm(prev => ({ ...prev, adminIpRestrictionEnabled: false }));
    }

    // Lockout safety check for current public IP
    if (updatedForm.adminIpRestrictionEnabled) {
      const cleanCurrent = currentIp.replace(/^::ffff:/, '').trim();
      
      const isCurrentCovered = allowedIps.some(allowed => {
        const cleanAllowed = allowed.replace(/^::ffff:/, '').trim();
        if (cleanAllowed.endsWith('*')) {
          const prefix = cleanAllowed.slice(0, -1);
          return cleanCurrent.startsWith(prefix);
        }
        return cleanCurrent === cleanAllowed;
      });

      if (currentIp && !isCurrentCovered) {
        const confirmSave = window.confirm(
          `⚠️ WARNING: Your current IP (${currentIp}) is not whitelisted.\n\n` +
          `Saving will lock you out of this dashboard immediately!\n\n` +
          `Would you like to automatically whitelist your IP (${cleanCurrent}) and proceed?`
        );
        if (confirmSave) {
          const newAllowed = [...allowedIps, cleanCurrent];
          updatedForm.adminAllowedIps = newAllowed;
          setForm(prev => ({ ...prev, adminAllowedIps: newAllowed }));
        } else {
          return; // cancel save
        }
      }
    }

    setLoading(true);
    try {
      await updateGeneralSettings(updatedForm);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addPhone = () => {
    const phones = [...(form.phones || [])];
    phones.push({ label: '', value: '' });
    setForm({ ...form, phones });
  };

  const removePhone = (index: number) => {
    const phones = [...(form.phones || [])];
    phones.splice(index, 1);
    setForm({ ...form, phones });
  };

  const updatePhone = (index: number, field: 'label' | 'value', value: string) => {
    const phones = [...(form.phones || [])];
    phones[index] = { ...phones[index], [field]: value };
    setForm({ ...form, phones });
  };

  const addEmail = () => {
    const emails = [...(form.emails || [])];
    emails.push({ label: '', value: '' });
    setForm({ ...form, emails });
  };

  const removeEmail = (index: number) => {
    const emails = [...(form.emails || [])];
    emails.splice(index, 1);
    setForm({ ...form, emails });
  };

  const updateEmail = (index: number, field: 'label' | 'value', value: string) => {
    const emails = [...(form.emails || [])];
    emails[index] = { ...emails[index], [field]: value };
    setForm({ ...form, emails });
  };

  // DM login section removed

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          General Settings
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-slate-50">
            <h2 className="text-[15px] font-bold text-slate-800">Contact Information</h2>
            <p className="text-[13px] text-slate-500 mt-0.5">Displayed in headers, footers, and contact pages.</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Phone Numbers Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone Numbers
                  </label>
                  <button
                    type="button"
                    onClick={addPhone}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add More
                  </button>
                </div>
                
                <div className="space-y-3">
                  {/* Primary Legacy Phone (optional/backward compatible) */}
                  {!form.phones?.length && (
                    <input
                      type="text"
                      name="phoneNumber"
                      value={form.phoneNumber || ''}
                      onChange={handleChange}
                      placeholder="Primary Number (e.g. +971...)"
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-slate-50/50"
                    />
                  )}

                  {form.phones?.map((phone, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={phone.label}
                        onChange={(e) => updatePhone(idx, 'label', e.target.value)}
                        placeholder="Label (e.g. Sales)"
                        className="w-24 text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-bold uppercase tracking-tight"
                      />
                      <input
                        type="text"
                        value={phone.value}
                        onChange={(e) => updatePhone(idx, 'value', e.target.value)}
                        placeholder="+971..."
                        className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removePhone(idx)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Addresses Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Addresses
                  </label>
                  <button
                    type="button"
                    onClick={addEmail}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add More
                  </button>
                </div>

                <div className="space-y-3">
                  {!form.emails?.length && (
                    <input
                      type="email"
                      name="email"
                      value={form.email || ''}
                      onChange={handleChange}
                      placeholder="Primary Email (e.g. info@...)"
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-slate-50/50"
                    />
                  )}

                  {form.emails?.map((email, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={email.label}
                        onChange={(e) => updateEmail(idx, 'label', e.target.value)}
                        placeholder="Label (e.g. Support)"
                        className="w-24 text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-bold uppercase tracking-tight"
                      />
                      <input
                        type="email"
                        value={email.value}
                        onChange={(e) => updateEmail(idx, 'value', e.target.value)}
                        placeholder="mail@alzaydan.com"
                        className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeEmail(idx)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maps Column */}
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Maps & Location
                </label>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="googleMapsUrl"
                    value={form.googleMapsUrl || ''}
                    onChange={handleChange}
                    placeholder="Google Maps Share URL"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <div>
                    <input
                      type="text"
                      name="googleMapsEmbedUrl"
                      value={form.googleMapsEmbedUrl || ''}
                      onChange={handleChange}
                      placeholder="Google Maps Embed (src URL)"
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 italic px-1">Paste the "src" attribute from the Google Maps iframe embed code here.</p>
                  </div>
                </div>
              </div>

              {/* Physical Address Column */}
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Physical Address
                </label>
                <textarea
                  name="address"
                  value={form.address || ''}
                  onChange={handleChange}
                  placeholder="Al Zaydan International FZE..."
                  rows={4}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-slate-50">
            <h2 className="text-[15px] font-bold text-slate-800">Social Media Links</h2>
            <p className="text-[13px] text-slate-500 mt-0.5">Links to your social media profiles (leave blank to hide).</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5" /> Instagram URL
              </label>
              <input
                type="url"
                name="instagramUrl"
                value={form.instagramUrl || ''}
                onChange={handleChange}
                placeholder="https://instagram.com/alzaydan"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5" /> Facebook URL
              </label>
              <input
                type="url"
                name="facebookUrl"
                value={form.facebookUrl || ''}
                onChange={handleChange}
                placeholder="https://facebook.com/alzaydan"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={form.linkedinUrl || ''}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/alzaydan"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5" /> YouTube URL
              </label>
              <input
                type="url"
                name="youtubeUrl"
                value={form.youtubeUrl || ''}
                onChange={handleChange}
                placeholder="https://youtube.com/@alzaydan"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Twitter className="w-3.5 h-3.5" /> X (Twitter) URL
              </label>
              <input
                type="url"
                name="xUrl"
                value={form.xUrl || ''}
                onChange={handleChange}
                placeholder="https://x.com/alzaydan"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp URL
              </label>
              <input
                type="url"
                name="whatsappUrl"
                value={form.whatsappUrl || ''}
                onChange={handleChange}
                placeholder="https://wa.me/971xxxxxxxxx"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>
        </div>



        {/* Trusted Brands */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-slate-50">
            <h2 className="text-[15px] font-bold text-slate-800">Trusted Brands</h2>
            <p className="text-[13px] text-slate-500 mt-0.5">Manage the brands displayed in the auto-scrolling bar on the homepage.</p>
          </div>
          <div className="p-6 space-y-6">
            {/* Add Brand Form */}
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/60">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" /> Add New Brand
              </h3>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Brand Name</label>
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={e => setNewBrandName(e.target.value)}
                    placeholder="e.g. BASF"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Logo Image URL (Optional)</label>
                  <input
                    type="url"
                    value={newBrandLogo}
                    onChange={e => setNewBrandLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={addBrand}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors shadow-sm shadow-blue-600/20 shrink-0"
                >
                  Add Brand
                </button>
              </div>
            </div>

            {/* Brands List */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 px-1">
                Current Trusted Brands ({form.trustedBrands?.length || 0})
              </h3>
              {(form.trustedBrands || []).length === 0 ? (
                <div className="text-center py-8 bg-slate-50/30 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-400">No brands added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {(form.trustedBrands || []).map((brand: any) => (
                    <div key={brand.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center gap-3 min-w-0">
                        {brand.logoUrl ? (
                          <div className="w-8 h-8 rounded border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center bg-gray-50">
                            <img src={brand.logoUrl} alt={brand.name} className="max-w-full max-h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500 shrink-0">
                            {brand.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-bold text-slate-800 truncate">{brand.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBrand(brand.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── MODERN HOMEPAGE HERO SECTION SETTINGS ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                <Layout className="w-4 h-4 text-blue-600" />
                Homepage Hero Section & Interactive Visuals
              </h2>
              <p className="text-[13px] text-slate-500 mt-0.5">Customize background opacity, headline text, featured ad banners (with click links), and the 4 orbiting product circles.</p>
            </div>
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Live Dynamic
            </div>
          </div>
          
          <div className="p-6 space-y-8">

            {/* 1. BACKGROUND IMAGE & OPACITY */}
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-blue-600" /> 1. Section Background & Opacity
                </h3>
                <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  Opacity: {heroConfig.bgOpacity ?? 15}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Background Image URL or Upload</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={heroConfig.bgImageUrl || ''}
                      onChange={e => updateHeroConfig({ bgImageUrl: e.target.value })}
                      placeholder="https://example.com/hero-bg.jpg (Optional)"
                      className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                    />
                    <input
                      type="file"
                      ref={bgFileRef}
                      className="hidden"
                      accept="image/*"
                      onChange={e => e.target.files && handleBgImageUpload(e.target.files[0])}
                    />
                    <button
                      type="button"
                      onClick={() => bgFileRef.current?.click()}
                      disabled={bgUploading}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-slate-200 shrink-0 cursor-pointer"
                    >
                      {bgUploading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      Upload
                    </button>
                    {heroConfig.bgImageUrl && (
                      <button
                        type="button"
                        onClick={() => updateHeroConfig({ bgImageUrl: '' })}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove Background Image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1 flex items-center justify-between">
                    <span>Background Opacity Blend</span>
                    <span className="text-blue-600 font-extrabold">{heroConfig.bgOpacity ?? 15}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={heroConfig.bgOpacity ?? 15}
                    onChange={e => updateHeroConfig({ bgOpacity: parseInt(e.target.value, 10) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Lower opacity (10-25%) provides subtle elegance without obscuring text.</p>
                </div>

                {/* ── Background Live Preview Card ── */}
                {heroConfig.bgImageUrl && (
                  <div className="md:col-span-2 mt-1 p-4 bg-slate-900 rounded-2xl border border-slate-700/60 shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Simulated Background Layer with Exact Opacity */}
                    <div
                      className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-300"
                      style={{
                        backgroundImage: `url(${heroConfig.bgImageUrl})`,
                        opacity: (heroConfig.bgOpacity ?? 15) / 100,
                      }}
                    />
                    <div className="relative z-10 flex items-center gap-3.5 min-w-0">
                      <div className="w-20 h-14 rounded-xl overflow-hidden border-2 border-white/30 shadow-md bg-black/60 shrink-0">
                        <img src={heroConfig.bgImageUrl} alt="Background Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Background Live Preview
                          </span>
                          <span className="text-[11px] font-semibold text-slate-300">
                            Opacity: <b className="text-white">{heroConfig.bgOpacity ?? 15}%</b>
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 truncate mt-1 max-w-[420px]">
                          {heroConfig.bgImageUrl}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateHeroConfig({ bgImageUrl: '' })}
                      className="relative z-10 bg-red-600/90 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. HEADLINE & DESCRIPTION */}
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-blue-600" /> 2. Hero Headline, Description & Search Bar
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Headline Main Text</label>
                  <input
                    type="text"
                    value={heroConfig.titleLine1 !== undefined ? heroConfig.titleLine1 : 'Materials that help you'}
                    onChange={e => updateHeroConfig({ titleLine1: e.target.value })}
                    placeholder="e.g. Materials that help you"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Headline Highlighted Accent (Blue)</label>
                  <input
                    type="text"
                    value={heroConfig.titleHighlight !== undefined ? heroConfig.titleHighlight : 'stay focus'}
                    onChange={e => updateHeroConfig({ titleHighlight: e.target.value })}
                    placeholder="e.g. stay focus"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Subtitle / Description</label>
                  <textarea
                    value={heroConfig.description !== undefined ? heroConfig.description : 'Direct UAE & GCC wholesale supply of certified traffic safety equipment, reflective materials, industrial adhesive tapes, and packaging supplies.'}
                    onChange={e => updateHeroConfig({ description: e.target.value })}
                    rows={2}
                    placeholder="Brief description below the main headline..."
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Search Placeholder</label>
                  <input
                    type="text"
                    value={heroConfig.searchPlaceholder !== undefined ? heroConfig.searchPlaceholder : 'e.g. Reflective tape, Safety cones...'}
                    onChange={e => updateHeroConfig({ searchPlaceholder: e.target.value })}
                    placeholder="e.g. Reflective tape, Safety cones..."
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Search Button Label</label>
                  <input
                    type="text"
                    value={heroConfig.buttonText !== undefined ? heroConfig.buttonText : 'Get Started'}
                    onChange={e => updateHeroConfig({ buttonText: e.target.value })}
                    placeholder="e.g. Get Started"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 3. FEATURED BANNER IMAGES (AUTO-SLIDE WITH REDIRECT LINKS) */}
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> 3. Featured Advertisements & Visuals (Auto-Slider)
                  </h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">Upload multiple ad banners or specialist photos. Slides automatically transition smoothly without cluttered dots, and redirect when clicked.</p>
                </div>
              </div>

              {/* Add New Featured Slide Form */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Image URL or Upload</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newFeaturedUrl}
                        onChange={e => setNewFeaturedUrl(e.target.value)}
                        placeholder="https://example.com/ad-banner.jpg"
                        className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-slate-50/50"
                      />
                      <input
                        type="file"
                        ref={featuredFileRef}
                        className="hidden"
                        accept="image/*"
                        onChange={e => e.target.files && handleFeaturedImageUpload(e.target.files[0])}
                      />
                      <button
                        type="button"
                        onClick={() => featuredFileRef.current?.click()}
                        disabled={featuredUploading}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-slate-200 shrink-0 cursor-pointer"
                      >
                        {featuredUploading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        Upload
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Redirect Link (When Clicked)</label>
                    <input
                      type="text"
                      value={newFeaturedLink}
                      onChange={e => setNewFeaturedLink(e.target.value)}
                      placeholder="e.g. /category/traffic-safety or /search"
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    {newFeaturedUrl && (
                      <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          <img src={newFeaturedUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs text-slate-600 font-semibold truncate max-w-[200px]">Image Ready</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={addFeaturedSlide}
                    disabled={!newFeaturedUrl.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Featured Slide
                  </button>
                </div>
              </div>

              {/* Current Featured Slides List */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase px-1">
                  Active Featured Slides ({(heroConfig.featuredSlides || []).length})
                </label>
                {(heroConfig.featuredSlides || []).length === 0 ? (
                  <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400">No custom featured slides uploaded. Showing default specialist portrait.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(heroConfig.featuredSlides || []).map((slide, idx) => (
                      <div key={slide.id} className="relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs group flex flex-col justify-between">
                        <div className="aspect-[4/3] relative bg-slate-100">
                          <img src={slide.imageUrl} alt={slide.altText || `Slide ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeFeaturedSlide(slide.id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-lg shadow-sm transition-transform group-hover:scale-105 cursor-pointer"
                            title="Delete Slide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="p-2.5 bg-slate-50/70 border-t border-slate-100">
                          <div className="text-[11px] font-semibold text-slate-700 truncate">Slide #{idx + 1}</div>
                          {slide.linkUrl ? (
                            <div className="text-[10px] text-blue-600 truncate flex items-center gap-1">
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              {slide.linkUrl}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 italic">No link assigned</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4. HERO FLOATING PRODUCT CARDS (2 INTERACTIVE CARDS) */}
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> 4. Hero Floating Product Cards (2 Interactive Cards)
                  </h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">Select 2 featured products to display as floating, animated interactive cards over the hero section.</p>
                </div>
              </div>

              {/* Hidden file input for card image uploads */}
              <input
                type="file"
                ref={nodeFileRef}
                className="hidden"
                accept="image/*"
                onChange={e => {
                  if (e.target.files && activeNodeUploadKey) {
                    handleCardImageUpload(activeNodeUploadKey, e.target.files[0]);
                  }
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { id: 'card-1', defaultLabel: 'Top Left Floating Card', defaultBadge: '🔥 Best Seller', defaultTitle: 'Traffic Signal Warning Lights', defaultPrice: 'Wholesale Certified', defaultLink: '/category/traffic-safety', defaultImage: 'https://images.unsplash.com/photo-1584844308364-a690e03eaff1?q=80&w=400&auto=format&fit=crop' },
                  { id: 'card-2', defaultLabel: 'Bottom Right Floating Card', defaultBadge: '⚡ UAE In Stock', defaultTitle: 'Zydex Neutral Silicone Sealant', defaultPrice: 'Direct Factory Rate', defaultLink: '/category/industrial-adhesive-tapes', defaultImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400&auto=format&fit=crop' },
                ].map(cardDef => {
                  const cardData = (heroConfig.featuredCards || []).find(n => n.id === cardDef.id) ||
                                   (heroConfig.orbitNodes || []).find(n => n.id === (cardDef.id === 'card-1' ? 'node-1' : 'node-4')) || {};
                  const selectedProduct = products.find(p => p.id === cardData.productId);
                  const displayImage = cardData.customImageUrl || selectedProduct?.image || cardDef.defaultImage;
                  const displayTitle = cardData.customTitle || selectedProduct?.name || cardDef.defaultTitle;
                  const displayBadge = cardData.customBadge || selectedProduct?.category || cardDef.defaultBadge;
                  const displayPrice = cardData.customPrice || (selectedProduct?.price ? `AED ${selectedProduct.price}` : cardDef.defaultPrice);
                  const displayLink = cardData.linkUrl || (selectedProduct ? `/product/${selectedProduct.slug || selectedProduct.id}` : cardDef.defaultLink);

                  return (
                    <div key={cardDef.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                      
                      {/* Card Header with Position & Search Button */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {cardDef.defaultLabel}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setProductPickerNodeId(cardDef.id);
                            setPickerSearch('');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>{cardData.productId ? 'Change Product' : 'Search Catalog'}</span>
                        </button>
                      </div>

                      {/* ── Live Floating Card Simulation Preview ── */}
                      <div className="p-3 bg-gradient-to-br from-slate-100/90 to-slate-200/50 rounded-2xl border border-slate-200/60">
                        <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                          Live Card Appearance (Floating on Homepage)
                        </label>
                        <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-md border border-white/90 flex items-center gap-3 max-w-[280px]">
                          <div className="w-13 h-13 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0 shadow-xs">
                            <img src={displayImage} alt={displayTitle} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 pr-1">
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md mb-0.5">
                              {displayBadge}
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1 leading-tight">
                              {displayTitle}
                            </h4>
                            <div className="flex items-center justify-between gap-1 mt-1">
                              <span className="text-[10px] font-extrabold text-[#0052d9] truncate">
                                {displayPrice}
                              </span>
                              <span className="text-slate-400 text-xs">→</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Attached Product Notification */}
                      {selectedProduct ? (
                        <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-2.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-blue-200 bg-white shrink-0">
                              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-800 truncate">{selectedProduct.name}</div>
                              <div className="text-[10px] text-slate-500 truncate">{selectedProduct.category}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              updateFeaturedCard(cardDef.id, {
                                productId: '',
                                customTitle: '',
                                customImageUrl: '',
                                customBadge: '',
                                customPrice: '',
                                linkUrl: '',
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Unlink Product"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-between">
                          <span className="text-xs text-slate-500">No catalog product linked.</span>
                          <button
                            type="button"
                            onClick={() => {
                              setProductPickerNodeId(cardDef.id);
                              setPickerSearch('');
                            }}
                            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <PackageSearch className="w-3.5 h-3.5" /> Select from Catalog
                          </button>
                        </div>
                      )}

                      {/* Card Customization Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Badge Text</label>
                          <input
                            type="text"
                            value={cardData.customBadge !== undefined ? cardData.customBadge : cardDef.defaultBadge}
                            onChange={e => updateFeaturedCard(cardDef.id, { customBadge: e.target.value })}
                            placeholder="e.g. 🔥 Best Seller"
                            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price / Tag Line</label>
                          <input
                            type="text"
                            value={cardData.customPrice !== undefined ? cardData.customPrice : cardDef.defaultPrice}
                            onChange={e => updateFeaturedCard(cardDef.id, { customPrice: e.target.value })}
                            placeholder="e.g. Wholesale Rate"
                            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                          />
                        </div>
                      </div>

                      {/* Custom Image Upload */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Custom Image URL or Upload</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={cardData.customImageUrl || ''}
                            onChange={e => updateFeaturedCard(cardDef.id, { customImageUrl: e.target.value })}
                            placeholder="https://... (Optional custom image override)"
                            className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveNodeUploadKey(cardDef.id);
                              nodeFileRef.current?.click();
                            }}
                            disabled={nodeUploadingId === cardDef.id}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition-colors border border-slate-200 shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            {nodeUploadingId === cardDef.id ? <Loader className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                            <span>Upload</span>
                          </button>
                        </div>
                      </div>

                      {/* Destination Link */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Destination Link</label>
                        <input
                          type="text"
                          value={cardData.linkUrl !== undefined ? cardData.linkUrl : displayLink}
                          onChange={e => updateFeaturedCard(cardDef.id, { linkUrl: e.target.value })}
                          placeholder={cardDef.defaultLink}
                          className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white font-mono text-slate-700"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* WhatsApp & Call Buttons */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-indigo-600" />
                WhatsApp & Call Button Numbers
              </h2>
              <p className="text-[13px] text-slate-500 mt-0.5">Default numbers for WhatsApp chat and phone call buttons across the site.</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default WhatsApp Number */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-slate-500" /> Default WhatsApp Number
                </label>
                <input
                  type="text"
                  name="orderWhatsAppNumber"
                  value={form.orderWhatsAppNumber || ''}
                  onChange={handleChange}
                  placeholder="e.g. +971 52 987 1369"
                  className="w-full text-sm border border-gray-250 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
                <p className="text-[11px] text-slate-400 px-1">This number is used for the floating WhatsApp button and as a fallback across all pages.</p>
              </div>

              {/* Default Call Number */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> Default Call Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={form.phoneNumber || ''}
                  onChange={handleChange}
                  placeholder="e.g. +971 55 155 1329"
                  className="w-full text-sm border border-gray-250 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
                <p className="text-[11px] text-slate-400 px-1">This is the primary phone number used for the call button in the procurement dock.</p>
              </div>
            </div>

            {/* Link to advanced routing */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-bold text-slate-700">Need per-page routing?</p>
                <p className="text-[12px] text-slate-500 mt-0.5">Route different pages to different WhatsApp / call numbers (e.g. RFQ to one team, Contact page to another).</p>
              </div>
              <Link
                to="/admin/support"
                className="shrink-0 ml-4 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-[12px] transition-colors shadow-sm"
              >
                Advanced Routing <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Security & IP Whitelisting */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-500" />
                Security & IP Restrictions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Restrict access to the Admin panel to specific whitelisted IP addresses.</p>
            </div>
            <div>
              <select
                value={form.adminIpRestrictionEnabled ? 'enabled' : 'disabled'}
                onChange={e => {
                  setForm({ ...form, adminIpRestrictionEnabled: e.target.value === 'enabled' });
                  setSaved(false);
                }}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 bg-white font-medium text-slate-700 cursor-pointer shadow-sm"
              >
                <option value="disabled">Access: Open (Anyone)</option>
                <option value="enabled">Access: Restricted (Whitelist Only)</option>
              </select>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Show Current Detected IP */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50 p-4 border border-gray-150 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Your current public IP:</span>
                <span className="font-semibold text-slate-900 font-mono text-[13px]">
                  {currentIp || 'detecting...'}
                </span>
              </div>
              {currentIp && !(form.adminAllowedIps || []).includes(currentIp) && (
                <button
                  type="button"
                  onClick={() => addWhitelistedIp(currentIp)}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-1 text-xs"
                >
                  + Whitelist My Current IP
                </button>
              )}
            </div>

            {/* List & Add Whitelisted IPs */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIpInput}
                  onChange={e => setNewIpInput(e.target.value)}
                  placeholder="e.g. 223.185.23.55 or 223.185.23.*"
                  className="flex-1 text-sm border border-gray-250 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => addWhitelistedIp(newIpInput)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm"
                >
                  Add IP
                </button>
              </div>
              <p className="text-[11px] text-slate-400 px-1 leading-relaxed">
                💡 **Office Wi-Fi Tip:** If your office has a dynamic IP address, you can use a wildcard asterisk (e.g. **223.185.23.***) to whitelist the entire subnet, ensuring your staff's access never gets blocked when the router resets.
              </p>

              {/* Whitelisted IP Addresses */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Whitelisted IP List</h3>
                {(form.adminAllowedIps || []).length === 0 ? (
                  <div className="text-center py-5 border border-dashed border-gray-200 rounded-lg">
                    <p className="text-xs text-slate-400">No IP addresses whitelisted yet. Anyone can access the panel.</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-150 overflow-hidden">
                    {(form.adminAllowedIps || []).map((ip: string) => (
                      <div key={ip} className="flex items-center justify-between px-4 py-2.5 bg-white text-xs">
                        <span className="font-mono text-slate-700 font-medium">{ip}</span>
                        <button
                          type="button"
                          onClick={() => removeWhitelistedIp(ip)}
                          className="text-red-500 hover:text-red-600 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DM Team Management section removed */}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-blue-600/20"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? 'Settings Saved!' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* ── Product Catalog Search & Choose Modal ── */}
      {productPickerNodeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl">
                  <PackageSearch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Select Product from Catalog</h3>
                  <p className="text-xs text-slate-500">
                    Assigning to{' '}
                    <span className="font-bold text-blue-600">
                      {productPickerNodeId === 'node-1' ? 'Top Left Circle' : productPickerNodeId === 'node-2' ? 'Mid Left Circle' : productPickerNodeId === 'node-3' ? 'Top Right Circle' : 'Bottom Right Circle'}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProductPickerNodeId(null);
                  setPickerSearch('');
                }}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="p-4 border-b border-slate-100 bg-white space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  placeholder="Search products by name, category, or SKU..."
                  className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                  autoFocus
                />
                {pickerSearch && (
                  <button
                    type="button"
                    onClick={() => setPickerSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200/60 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Categories Pills Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                {['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))].slice(0, 15).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPickerCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      pickerCategory === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtered Products Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {(() => {
                const filtered = products.filter(p => {
                  const matchesCategory = pickerCategory === 'All' || p.category === pickerCategory;
                  const q = pickerSearch.toLowerCase().trim();
                  const matchesSearch = !q || (p.name && p.name.toLowerCase().includes(q)) || (p.category && p.category.toLowerCase().includes(q)) || (p.sku && p.sku.toLowerCase().includes(q));
                  return matchesCategory && matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <PackageSearch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-500">No products found matching "{pickerSearch}"</p>
                      <button
                        type="button"
                        onClick={() => {
                          setPickerSearch('');
                          setPickerCategory('All');
                        }}
                        className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Reset search filters
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.slice(0, 80).map(p => {
                      const currentCard = (heroConfig.featuredCards || []).find(n => n.id === productPickerNodeId) ||
                                          (heroConfig.orbitNodes || []).find(n => n.id === (productPickerNodeId === 'card-1' ? 'node-1' : 'node-4'));
                      const isSelected = currentCard?.productId === p.id;

                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            updateFeaturedCard(productPickerNodeId!, {
                              productId: p.id,
                              customTitle: p.name,
                              customImageUrl: p.image,
                              customPrice: p.price ? `AED ${p.price}` : 'Wholesale Rate',
                              customBadge: p.category || 'Featured Item',
                              linkUrl: `/product/${p.slug || p.id}`,
                            });
                            setProductPickerNodeId(null);
                            setPickerSearch('');
                          }}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-md ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                              : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/60'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</h4>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{p.category}</p>
                              {p.price ? (
                                <p className="text-[11px] font-bold text-blue-600 mt-0.5">AED {p.price}</p>
                              ) : (
                                <p className="text-[10px] text-slate-400 mt-0.5">Wholesale pricing</p>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Choose'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Showing matching products from your live catalog.</span>
              <button
                type="button"
                onClick={() => {
                  setProductPickerNodeId(null);
                  setPickerSearch('');
                }}
                className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
