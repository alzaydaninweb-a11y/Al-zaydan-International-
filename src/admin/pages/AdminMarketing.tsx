import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { uploadToR2 } from '../../lib/cloudflareR2';
import { Save, Upload, CheckCircle, Image as ImageIcon } from 'lucide-react';

export default function AdminMarketing() {
  const { settings, updateGeneralSettings } = useStore();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  
  const [campaign, setCampaign] = useState({
    active: false,
    desktopImageUrl: '',
    mobileImageUrl: '',
    buttonText: 'Shop Now',
    buttonLink: '/'
  });

  useEffect(() => {
    if (settings?.marketingCampaign) {
      setCampaign({
        active: settings.marketingCampaign.active || false,
        desktopImageUrl: settings.marketingCampaign.desktopImageUrl || '',
        mobileImageUrl: settings.marketingCampaign.mobileImageUrl || '',
        buttonText: settings.marketingCampaign.buttonText || 'Shop Now',
        buttonLink: settings.marketingCampaign.buttonLink || '/'
      });
    }
  }, [settings]);

  const handleFileUpload = async (file: File | null, type: string): Promise<string | null> => {
    if (!file) return null;
    return await uploadToR2(file, type);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalDesktopUrl = campaign.desktopImageUrl;
      let finalMobileUrl = campaign.mobileImageUrl;
      
      if (desktopFile) {
        const url = await handleFileUpload(desktopFile, 'marketing-desktop');
        if (url) finalDesktopUrl = url;
      }
      
      if (mobileFile) {
        const url = await handleFileUpload(mobileFile, 'marketing-mobile');
        if (url) finalMobileUrl = url;
      }

      const newCampaign = { 
        ...campaign, 
        desktopImageUrl: finalDesktopUrl,
        mobileImageUrl: finalMobileUrl
      };
      
      await updateGeneralSettings({ marketingCampaign: newCampaign });
      
      setCampaign(newCampaign);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving marketing campaign:', error);
      alert('Failed to save campaign. Please check permissions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketing Campaign</h1>
          <p className="text-slate-500 text-sm mt-1">Configure the global pop-up campaign for your store.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
        
        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <h3 className="font-bold text-slate-900">Enable Pop-up Campaign</h3>
            <p className="text-sm text-slate-500">If enabled, this pop-up will show to customers once per session.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={campaign.active}
              onChange={(e) => setCampaign(prev => ({ ...prev, active: e.target.checked }))}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {campaign.active && (
          <div className="space-y-8">
            
            {/* Desktop Banner Image */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Desktop Banner Image</label>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-full md:w-[400px] h-[200px] bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center overflow-hidden relative">
                  {desktopFile ? (
                    <img src={URL.createObjectURL(desktopFile)} alt="Desktop Preview" className="w-full h-full object-cover" />
                  ) : campaign.desktopImageUrl ? (
                    <img src={campaign.desktopImageUrl} alt="Desktop Current" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <ImageIcon className="w-10 h-10 mb-2" />
                      <span className="text-xs font-semibold">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <input 
                    type="file" 
                    id="desktop-photo" 
                    className="hidden" 
                    accept="image/*"
                    onChange={e => e.target.files && setDesktopFile(e.target.files[0])}
                  />
                  <label 
                    htmlFor="desktop-photo"
                    className="cursor-pointer inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors mb-3"
                  >
                    <Upload className="w-4 h-4" /> Upload Desktop Image
                  </label>
                  <p className="text-xs text-slate-500 mb-4">Recommended: 800x400px (Landscape)</p>
                  
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Or use direct image link</label>
                  <input 
                    type="text" 
                    value={campaign.desktopImageUrl}
                    onChange={e => setCampaign({...campaign, desktopImageUrl: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none"
                    placeholder="https://example.com/desktop.jpg"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Mobile Banner Image */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Banner Image</label>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-[200px] h-[300px] bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center overflow-hidden relative">
                  {mobileFile ? (
                    <img src={URL.createObjectURL(mobileFile)} alt="Mobile Preview" className="w-full h-full object-cover" />
                  ) : campaign.mobileImageUrl ? (
                    <img src={campaign.mobileImageUrl} alt="Mobile Current" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <ImageIcon className="w-10 h-10 mb-2" />
                      <span className="text-xs font-semibold">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <input 
                    type="file" 
                    id="mobile-photo" 
                    className="hidden" 
                    accept="image/*"
                    onChange={e => e.target.files && setMobileFile(e.target.files[0])}
                  />
                  <label 
                    htmlFor="mobile-photo"
                    className="cursor-pointer inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors mb-3"
                  >
                    <Upload className="w-4 h-4" /> Upload Mobile Image
                  </label>
                  <p className="text-xs text-slate-500 mb-4">Recommended: 400x600px (Portrait)</p>
                  
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Or use direct image link</label>
                  <input 
                    type="text" 
                    value={campaign.mobileImageUrl}
                    onChange={e => setCampaign({...campaign, mobileImageUrl: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none"
                    placeholder="https://example.com/mobile.jpg"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Button Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Button Text (Optional)</label>
                <input 
                  type="text" 
                  value={campaign.buttonText}
                  onChange={e => setCampaign({...campaign, buttonText: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none"
                  placeholder="e.g. Shop Now (Leave blank for no button)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Button Link</label>
                <input 
                  type="text" 
                  value={campaign.buttonLink}
                  onChange={e => setCampaign({...campaign, buttonLink: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-600 outline-none"
                  placeholder="e.g. /categories/safety-gear"
                />
                <p className="text-xs text-slate-500 mt-1">Use a relative path (e.g. /search) or an absolute URL.</p>
              </div>
            </div>

          </div>
        )}

        <div className="pt-4 border-t border-slate-200 flex justify-end items-center gap-4">
          {success && (
            <span className="text-emerald-600 font-bold text-sm flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Saved successfully
            </span>
          )}
          <button
            type="submit"
            disabled={saving || (campaign.active && (!campaign.desktopImageUrl && !desktopFile) && (!campaign.mobileImageUrl && !mobileFile))}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : (
              <>
                <Save className="w-4 h-4" /> Save Campaign
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
