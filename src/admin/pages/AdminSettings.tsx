import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Save, Phone, MapPin, Mail, Instagram, Facebook, Linkedin, Youtube, Twitter, Image as ImageIcon, Plus, X, Users, Trash2, Shield, Layout, Upload, Loader, ArrowRight, MessageCircle } from 'lucide-react';
import WhatsAppIcon from '../../components/icons/WhatsAppIcon';
import { useStore } from '../../context/StoreContext';
import { uploadToR2 } from '../../lib/cloudflareR2';

export default function AdminSettings() {
  const { settings, updateGeneralSettings, dmEmployees, addDMEmployee, deleteDMEmployee } = useStore();
  const [form, setForm] = useState(settings || {});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [newDM, setNewDM] = useState({ name: '', username: '', password: '' });
  const [dmLoading, setDmLoading] = useState(false);

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
  const [newSlideCta2Label, setNewSlideCta2Label] = useState('Become a Supplier');
  const [newSlideCta2To, setNewSlideCta2To] = useState('/contact');
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

  const handleHeroImageUpload = async (file: File) => {
    setSlideUploading(true);
    try {
      const url = await uploadToR2(file, 'hero');
      setNewSlideUrl(url);
    } catch (err) {
      alert('Image upload failed. Please try again or paste a URL.');
    } finally {
      setSlideUploading(false);
    }
  };

  const addHeroSlide = () => {
    if (!newSlideUrl.trim()) return;
    const slides = [...(form.heroSlides || [])];
    slides.push({
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: newSlideUrl.trim(),
      title1: newSlideTitle1.trim() || '',
      title2: newSlideTitle2.trim() || '',
      title3: newSlideTitle3.trim() || '',
      sub: newSlideSub.trim() || '',
      cta1Label: newSlideCta1Label.trim() || 'Start Sourcing',
      cta1To: newSlideCta1To.trim() || '/search',
      cta2Label: newSlideCta2Label.trim() || 'Become a Supplier',
      cta2To: newSlideCta2To.trim() || '/contact',
    });
    setForm({ ...form, heroSlides: slides });
    setNewSlideUrl('');
    setNewSlideTitle1('');
    setNewSlideTitle2('');
    setNewSlideTitle3('');
    setNewSlideSub('');
    setNewSlideCta1Label('Start Sourcing');
    setNewSlideCta1To('/search');
    setNewSlideCta2Label('Become a Supplier');
    setNewSlideCta2To('/contact');
    setSaved(false);
  };

  const removeHeroSlide = (id: string) => {
    const slides = (form.heroSlides || []).filter((s: any) => s.id !== id);
    setForm({ ...form, heroSlides: slides });
    setSaved(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateGeneralSettings(form);
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

  const handleAddDM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDM.name || !newDM.username || !newDM.password) return;
    setDmLoading(true);
    try {
      await addDMEmployee(newDM);
      setNewDM({ name: '', username: '', password: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to add employee');
    } finally {
      setDmLoading(false);
    }
  };

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

        {/* Hero Slider Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-800">Homepage Hero Slider</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">Customize the main image sliders and banners on your homepage.</p>
            </div>
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Layout className="w-3 h-3" /> Visual
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Add New Slide Form */}
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/60">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" /> Add New Hero Slide
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Background Image</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newSlideUrl}
                      onChange={e => setNewSlideUrl(e.target.value)}
                      placeholder="https://example.com/slide.jpg"
                      className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                    />
                    <input
                      type="file"
                      ref={heroFileRef}
                      className="hidden"
                      accept="image/*"
                      onChange={e => e.target.files && handleHeroImageUpload(e.target.files[0])}
                    />
                    <button
                      type="button"
                      onClick={() => heroFileRef.current?.click()}
                      disabled={slideUploading}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 border border-slate-200 shrink-0"
                    >
                      {slideUploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Upload
                    </button>
                  </div>
                  {newSlideUrl && (
                    <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <img src={newSlideUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Title Line 1 (White)</label>
                  <input
                    type="text"
                    value={newSlideTitle1}
                    onChange={e => setNewSlideTitle1(e.target.value)}
                    placeholder="e.g. Industrial Tools."
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Title Line 2 (White)</label>
                  <input
                    type="text"
                    value={newSlideTitle2}
                    onChange={e => setNewSlideTitle2(e.target.value)}
                    placeholder="e.g. Safety Equipment."
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Title Line 3 (Blue Accent)</label>
                  <input
                    type="text"
                    value={newSlideTitle3}
                    onChange={e => setNewSlideTitle3(e.target.value)}
                    placeholder="e.g. Delivered Fast."
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Subtitle / Description</label>
                  <textarea
                    value={newSlideSub}
                    onChange={e => setNewSlideSub(e.target.value)}
                    placeholder="Brief description below the main titles..."
                    rows={2}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                  />
                </div>

                {/* Primary Button */}
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 space-y-3">
                  <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-widest px-1">Primary Button (Blue)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Button Text</label>
                      <input type="text" value={newSlideCta1Label} onChange={e => setNewSlideCta1Label(e.target.value)} placeholder="e.g. Start Sourcing" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Button Link</label>
                      <input type="text" value={newSlideCta1To} onChange={e => setNewSlideCta1To(e.target.value)} placeholder="e.g. /search" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
                    </div>
                  </div>
                </div>

                {/* Secondary Button */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Secondary Button (Outline)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Button Text</label>
                      <input type="text" value={newSlideCta2Label} onChange={e => setNewSlideCta2Label(e.target.value)} placeholder="e.g. Become a Supplier" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Button Link</label>
                      <input type="text" value={newSlideCta2To} onChange={e => setNewSlideCta2To(e.target.value)} placeholder="e.g. /contact" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={addHeroSlide}
                    disabled={!newSlideUrl.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Slide to Banner
                  </button>
                </div>
              </div>
            </div>

            {/* List Current Slides */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 px-1">
                Current Slides ({form.heroSlides?.length || 0})
              </h3>
              {(form.heroSlides || []).length === 0 ? (
                <div className="text-center py-8 bg-slate-50/30 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-400">No custom slides added yet. Storefront is using default placeholder slides.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(form.heroSlides || []).map((slide: any) => (
                    <div key={slide.id} className="relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                      <div className="h-32 relative">
                        <img src={slide.imageUrl} alt="Slide Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                        <div className="absolute inset-0 p-4 flex flex-col justify-center">
                          <p className="text-white font-bold text-sm leading-tight">
                            {slide.title1 && <>{slide.title1}<br/></>}
                            {slide.title2 && <>{slide.title2}<br/></>}
                            {slide.title3 && <span className="text-blue-300">{slide.title3}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Slide Preview</span>
                        <button
                          type="button"
                          onClick={() => removeHeroSlide(slide.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          title="Remove Slide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp & Call Buttons */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-600" />
                WhatsApp & Call Button Numbers
              </h2>
              <p className="text-[13px] text-slate-500 mt-0.5">Default numbers for WhatsApp chat and phone call buttons across the site.</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default WhatsApp Number */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-green-600" /> Default WhatsApp Number
                </label>
                <input
                  type="text"
                  name="orderWhatsAppNumber"
                  value={form.orderWhatsAppNumber || ''}
                  onChange={handleChange}
                  placeholder="e.g. +971 52 987 1369"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-slate-50/50"
                />
                <p className="text-[11px] text-slate-400 px-1">This number is used for the floating WhatsApp button and as a fallback across all pages.</p>
              </div>

              {/* Default Call Number */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-600" /> Default Call Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={form.phoneNumber || ''}
                  onChange={handleChange}
                  placeholder="e.g. +971 55 155 1329"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-slate-50/50"
                />
                <p className="text-[11px] text-slate-400 px-1">This is the primary phone number used for the call button in the procurement dock.</p>
              </div>
            </div>

            {/* Link to advanced routing */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
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

        {/* DM Team Management */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-800">Digital Marketing Team</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">Manage employees who can edit SEO tracking codes.</p>
            </div>
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3" /> Managed Access
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Add New DM Employee */}
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/60">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" /> Create New DM Login
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={newDM.name}
                    onChange={e => setNewDM({ ...newDM, name: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Username</label>
                  <input
                    type="text"
                    placeholder="e.g. dm_john"
                    value={newDM.username}
                    onChange={e => setNewDM({ ...newDM, username: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Password</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newDM.password}
                      onChange={e => setNewDM({ ...newDM, password: e.target.value })}
                      className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddDM}
                      disabled={dmLoading || !newDM.username || !newDM.password}
                      className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm shadow-blue-600/20"
                    >
                      {dmLoading ? '...' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* List DM Employees */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 px-1">
                <Users className="w-3.5 h-3.5" /> Current DM Team members
              </h3>
              {dmEmployees.length === 0 ? (
                <div className="text-center py-8 bg-slate-50/30 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-400">No DM employees created yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dmEmployees.map(emp => (
                    <div key={emp.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{emp.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">@{emp.username}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete DM access for ${emp.name}?`)) deleteDMEmployee(emp.id);
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

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
    </div>
  );
}
