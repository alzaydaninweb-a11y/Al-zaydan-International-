import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { uploadToR2 } from '../../lib/cloudflareR2';
import { Save, UserCircle, Upload, CheckCircle } from 'lucide-react';

export default function AdminExpertProfile() {
  const { settings, updateGeneralSettings } = useStore();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [expert, setExpert] = useState({
    active: false,
    name: '',
    role: '',
    photoUrl: '',
    whatsapp: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (settings?.expertProfile) {
      setExpert({
        active: settings.expertProfile.active || false,
        name: settings.expertProfile.name || '',
        role: settings.expertProfile.role || '',
        photoUrl: settings.expertProfile.photoUrl || '',
        whatsapp: settings.expertProfile.whatsapp || '',
        phone: settings.expertProfile.phone || '',
        email: settings.expertProfile.email || ''
      });
    }
  }, [settings]);

  const handlePhotoUpload = async (): Promise<string | null> => {
    if (!photoFile) return null;
    return await uploadToR2(photoFile, 'expert');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalPhotoUrl = expert.photoUrl;
      if (photoFile) {
        const url = await handlePhotoUpload();
        if (url) finalPhotoUrl = url;
      }

      const newProfile = { ...expert, photoUrl: finalPhotoUrl };
      
      await updateGeneralSettings({ expertProfile: newProfile });
      
      setExpert(newProfile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving expert profile:', error);
      alert('Failed to save profile. Please check permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expert Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Configure the personal contact details displayed in the "Talk with your Expert" section.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        
        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <h3 className="font-bold text-slate-900">Enable Custom Expert Profile</h3>
            <p className="text-sm text-slate-500">If enabled, this will replace the generic "Procurement Support" banner.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={expert.active}
              onChange={(e) => setExpert(prev => ({ ...prev, active: e.target.checked }))}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {expert.active && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile Photo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Expert Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {photoFile ? (
                      <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : expert.photoUrl ? (
                      <img src={expert.photoUrl} alt="Current" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <input 
                      type="file" 
                      id="expert-photo" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                    <label 
                      htmlFor="expert-photo"
                      className="cursor-pointer inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      <Upload className="w-4 h-4" /> Change Photo
                    </label>
                    <p className="text-xs text-slate-500 mt-2">Recommended: 200x200px (1:1 ratio)</p>
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={expert.name}
                  onChange={e => setExpert({...expert, name: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role / Job Title</label>
                <input 
                  type="text" 
                  value={expert.role}
                  onChange={e => setExpert({...expert, role: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none"
                  placeholder="e.g. Senior Sourcing Specialist"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                <input 
                  type="text" 
                  value={expert.whatsapp}
                  onChange={e => setExpert({...expert, whatsapp: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none"
                  placeholder="+971 50 123 4567"
                />
                <p className="text-xs text-slate-500 mt-1">Include country code (e.g., +971).</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number (Calling)</label>
                <input 
                  type="text" 
                  value={expert.phone}
                  onChange={e => setExpert({...expert, phone: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none"
                  placeholder="+971 4 123 4567"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={expert.email}
                  onChange={e => setExpert({...expert, email: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none"
                  placeholder="john@example.com"
                />
              </div>

            </div>
          </>
        )}

        <div className="pt-4 border-t border-slate-200 flex justify-end items-center gap-4">
          {success && (
            <span className="text-emerald-600 font-bold text-sm flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Saved successfully
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : (
              <>
                <Save className="w-4 h-4" /> Save Profile
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
