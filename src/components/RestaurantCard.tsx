import React from 'react';
import { Star, Clock, Bike, MapPin, Store } from 'lucide-react';
import { Restaurant } from '../types.js';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  return (
    <div
      id={`restaurant-card-${restaurant.id}`}
      onClick={onClick}
      className="group bg-[#FFFFFF] rounded-3xl overflow-hidden border border-[#EBE3D5] hover:border-[#E04D01]/50 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Image container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-100">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop';
          }}
        />

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {restaurant.is_street_vendor ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E04D01] text-white text-xs font-bold shadow-xs">
              <Store className="w-3 h-3" />
              Street Cart
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#2D2422]/80 backdrop-blur-xs text-white text-xs font-semibold">
              Restaurant
            </span>
          )}
        </div>

        {/* Rating Pill */}
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFFFF]/95 backdrop-blur-xs text-[#2D2422] text-xs font-bold shadow-xs">
          <Star className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />
          <span>{restaurant.rating.toFixed(1)}</span>
        </div>

        {/* Delivery Time Pill */}
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2D2422]/85 backdrop-blur-xs text-white text-xs font-medium">
          <Clock className="w-3 h-3 text-[#FFB800]" />
          <span>{restaurant.delivery_time}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-bold text-[#2D2422] group-hover:text-[#E04D01] transition-colors leading-snug">
              {restaurant.name}
            </h3>
          </div>

          <p className="text-xs font-semibold text-[#E04D01] uppercase tracking-wider mb-2">
            {restaurant.cuisine}
          </p>

          <div className="flex items-center gap-1 text-xs text-[#6A5C58] mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#6A5C58] shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#EBE3D5] flex items-center justify-between text-xs text-[#6A5C58]">
          <div className="flex items-center gap-1">
            <Bike className="w-3.5 h-3.5 text-[#E04D01]" />
            <span>₹{restaurant.delivery_fee} delivery</span>
          </div>
          <div>
            <span>Min order: ₹{restaurant.min_order}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
