import React from 'react';
import { Store, Utensils } from 'lucide-react';

interface CuisineTabsProps {
  cuisines: string[];
  selectedCuisine: string;
  onSelectCuisine: (cuisine: string) => void;
  streetOnly: boolean;
  setStreetOnly: (val: boolean) => void;
}

export const CuisineTabs: React.FC<CuisineTabsProps> = ({
  cuisines,
  selectedCuisine,
  onSelectCuisine,
  streetOnly,
  setStreetOnly,
}) => {
  return (
    <div id="cuisine-navigation-bar" className="mb-6 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#2D2422] tracking-tight">
            Popular Categories
          </h2>
          <p className="text-xs sm:text-sm text-[#6A5C58]">
            Explore authentic street cart dishes and restaurant specialties
          </p>
        </div>

        {/* Vendor type toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FFFFFF] border border-[#EBE3D5] rounded-2xl self-start sm:self-auto shadow-2xs">
          <button
            id="filter-all-vendors-toggle"
            onClick={() => setStreetOnly(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !streetOnly
                ? 'bg-[#E04D01] text-white shadow-2xs'
                : 'text-[#6A5C58] hover:text-[#2D2422]'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            All Places
          </button>
          <button
            id="filter-street-vendors-toggle"
            onClick={() => setStreetOnly(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              streetOnly
                ? 'bg-[#E04D01] text-white shadow-2xs'
                : 'text-[#6A5C58] hover:text-[#2D2422]'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            Street Vendors Only
          </button>
        </div>
      </div>

      {/* Horizontal scrollable category list */}
      <div className="overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-2.5 min-w-max">
          {cuisines.map((cuisine) => {
            const isSelected = selectedCuisine === cuisine;
            return (
              <button
                key={cuisine}
                id={`cuisine-pill-${cuisine.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectCuisine(cuisine)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2D2422] text-white shadow-sm ring-2 ring-[#2D2422]/10'
                    : 'bg-[#FFFFFF] text-[#6A5C58] border border-[#EBE3D5] hover:border-[#E04D01] hover:text-[#2D2422]'
                }`}
              >
                {cuisine}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
