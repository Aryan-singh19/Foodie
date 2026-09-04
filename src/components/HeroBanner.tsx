import React from 'react';
import { Flame, Clock, Sparkles, ShieldCheck } from 'lucide-react';

interface HeroBannerProps {
  onExploreStreetVendors: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreStreetVendors }) => {
  return (
    <div id="hero-banner-section" className="relative overflow-hidden rounded-3xl bg-[#2D2422] text-white shadow-md mb-8">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/17223835/pexels-photo-17223835.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
          alt="Authentic Indian street food platter"
          className="w-full h-full object-cover opacity-35 filter saturate-120"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2D2422] via-[#2D2422]/90 to-transparent"></div>
      </div>

      <div className="relative z-10 p-6 sm:p-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E04D01]/90 text-white text-xs font-bold tracking-wide uppercase mb-3">
          <Flame className="w-3.5 h-3.5" />
          Street Flavors Delivered Fresh
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
          Cravings from Iconic Carts & Local Kitchens
        </h1>

        <p className="text-sm sm:text-base text-gray-200 mb-6 line-clamp-2 sm:line-clamp-none font-normal leading-relaxed">
          From steaming Ramu samosas and Sharma Ji's chole bhature to fragrant biryanis and authentic filter coffee, delivered hot in 15-25 minutes.
        </p>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            id="hero-explore-street-vendors-btn"
            onClick={onExploreStreetVendors}
            className="px-5 py-2.5 rounded-2xl bg-[#E04D01] hover:bg-[#C74200] text-white text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Explore Street Carts
          </button>

          <div className="flex items-center gap-4 text-xs font-medium text-gray-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>Avg 20 min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#348A54]" />
              <span>Direct Vendor Pricing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
