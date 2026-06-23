import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function MarketingPopup() {
  const { settings } = useStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const campaign = settings?.marketingCampaign;
    if (campaign?.active) {
      // Check if user has seen it in this session
      const seen = sessionStorage.getItem('az_marketing_seen');
      if (!seen) {
        // slight delay before showing so it doesn't interrupt immediate rendering
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [settings?.marketingCampaign]);

  if (!isOpen) return null;

  const campaign = settings!.marketingCampaign!;

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('az_marketing_seen', 'true');
  };

  const handleAction = () => {
    handleClose();
    if (campaign.buttonLink.startsWith('http')) {
      window.open(campaign.buttonLink, '_blank');
    } else {
      navigate(campaign.buttonLink);
    }
  };

  const hasDesktop = !!campaign.desktopImageUrl;
  const hasMobile = !!campaign.mobileImageUrl;

  // Don't render empty popup if no images are provided
  if (!hasDesktop && !hasMobile) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-white rounded-[24px] shadow-2xl overflow-hidden max-w-[420px] md:max-w-[760px] w-full flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Container */}
        <div className="w-full bg-slate-50 overflow-hidden flex items-center justify-center">
          {/* Desktop Image */}
          {hasDesktop && (
            <img 
              src={campaign.desktopImageUrl} 
              alt="Campaign" 
              className={`${hasMobile ? 'hidden md:block' : 'block'} w-full h-auto max-h-[75vh] object-contain`}
            />
          )}
          
          {/* Mobile Image */}
          {hasMobile && (
            <img 
              src={campaign.mobileImageUrl} 
              alt="Campaign" 
              className={`${hasDesktop ? 'md:hidden' : 'block'} w-full h-auto max-h-[75vh] object-contain`}
            />
          )}
        </div>

        {/* Action Button Strip */}
        {campaign.buttonText?.trim() ? (
          <div className="px-5 py-5 md:px-8 md:py-6 bg-white w-full">
            <button 
              onClick={handleAction}
              className="w-full py-4 bg-[#0052d9] hover:bg-blue-700 text-white font-bold text-lg md:text-xl rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              {campaign.buttonText}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
