import React, { useState, useMemo } from 'react';
import { X, Star, Clock, Bike, MapPin, Plus, Minus, Check, Store } from 'lucide-react';
import { Restaurant, MenuItem, CartItem } from '../types.js';

interface RestaurantModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
  cart: CartItem[];
  onAddToCart: (restaurant: Restaurant, item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onOpenCart: () => void;
}

export const RestaurantModal: React.FC<RestaurantModalProps> = ({
  restaurant,
  onClose,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onOpenCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!restaurant) return null;

  const menu = restaurant.menu || [];
  const categories = useMemo(() => {
    const cats = new Set<string>();
    menu.forEach((item) => cats.add(item.category));
    return ['All', ...Array.from(cats)];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    if (selectedCategory === 'All') return menu;
    return menu.filter((item) => item.category === selectedCategory);
  }, [menu, selectedCategory]);

  const getItemQuantity = (itemId: string): number => {
    const found = cart.find((c) => c.item.id === itemId);
    return found ? found.quantity : 0;
  };

  const totalCartCount = cart.reduce((acc, c) => acc + c.quantity, 0);
  const totalCartPrice = cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#2D2422]/60 backdrop-blur-xs overflow-y-auto">
      <div
        id={`restaurant-detail-modal-${restaurant.id}`}
        className="relative w-full max-w-3xl bg-[#FFFFFF] rounded-3xl overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col border border-[#EBE3D5]"
      >
        {/* Header with image */}
        <div className="relative h-52 sm:h-64 w-full shrink-0 bg-gray-100">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D2422] via-[#2D2422]/40 to-transparent"></div>

          {/* Close button */}
          <button
            id="close-restaurant-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#2D2422] flex items-center justify-center shadow-md transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on image */}
          <div className="absolute top-4 left-4 flex gap-2">
            {restaurant.is_street_vendor ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E04D01] text-white text-xs font-bold shadow-xs">
                <Store className="w-3.5 h-3.5" />
                Street Vendor
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/60 text-white text-xs font-semibold">
                Dine-In & Delivery
              </span>
            )}
          </div>

          {/* Bottom title block */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FFB800] text-[#2D2422]">
                {restaurant.cuisine}
              </span>
              <div className="inline-flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-[#FFB800] text-[#FFB800]" />
                <span>{restaurant.rating.toFixed(1)}</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{restaurant.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-200 mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{restaurant.address}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{restaurant.delivery_time}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bike className="w-3.5 h-3.5" />
                <span>₹{restaurant.delivery_fee} fee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu category navigation */}
        <div className="px-5 py-3 border-b border-[#EBE3D5] bg-[#FAF7F2] overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`menu-cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#E04D01] text-white shadow-2xs'
                    : 'bg-white text-[#6A5C58] border border-[#EBE3D5] hover:text-[#2D2422]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu list */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#2D2422]">
              Menu Items ({filteredMenu.length})
            </h3>
            <span className="text-xs text-[#6A5C58]">
              Prices in INR (₹)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMenu.map((item) => {
              const qty = getItemQuantity(item.id);
              return (
                <div
                  key={item.id}
                  id={`menu-item-card-${item.id}`}
                  className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFFFF] border border-[#EBE3D5] hover:border-[#E04D01]/50 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all gap-3"
                >
                  <div className="flex gap-3 items-start">
                    {/* Dish Image */}
                    {item.image && (
                      <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-[#EBE3D5]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {/* Veg / Non-veg symbol */}
                          <span
                            className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 ${
                              item.is_veg
                                ? 'border-[#348A54]'
                                : 'border-[#D93B3B]'
                            }`}
                            title={item.is_veg ? 'Pure Veg' : 'Non-Veg'}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.is_veg ? 'bg-[#348A54]' : 'bg-[#D93B3B]'
                              }`}
                            ></span>
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-[#2D2422] truncate">
                            {item.name}
                          </h4>
                        </div>

                        {item.is_popular && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FFB800]/25 text-[#8F6600] text-[10px] font-black uppercase tracking-wider shrink-0">
                            Bestseller
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#6A5C58] line-clamp-2 mb-1.5">
                        {item.description}
                      </p>

                      {item.prep_time && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6A5C58] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#EBE3D5]">
                          <Clock className="w-2.5 h-2.5 text-[#E04D01]" />
                          <span>{item.prep_time}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-[#EBE3D5]/80">
                    <span className="text-sm sm:text-base font-extrabold text-[#2D2422]">
                      ₹{item.price}
                    </span>

                    {qty === 0 ? (
                      <button
                        id={`add-to-cart-btn-${item.id}`}
                        onClick={() => onAddToCart(restaurant, item)}
                        className="px-4 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E04D01] text-[#E04D01] hover:bg-[#E04D01] hover:text-white text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        ADD
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-[#E04D01] text-white rounded-xl px-2 py-1 shadow-xs">
                        <button
                          id={`decrement-item-btn-${item.id}`}
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-5 h-5 rounded-lg flex items-center justify-center hover:bg-black/20 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-extrabold min-w-4 text-center">
                          {qty}
                        </span>
                        <button
                          id={`increment-item-btn-${item.id}`}
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-5 h-5 rounded-lg flex items-center justify-center hover:bg-black/20 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer drawer trigger if cart has items */}
        {totalCartCount > 0 && (
          <div className="p-4 bg-[#FFFFFF] border-t border-[#EBE3D5] flex items-center justify-between shrink-0 shadow-lg">
            <div>
              <span className="text-xs text-[#6A5C58] block">
                {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} added
              </span>
              <span className="text-base font-black text-[#2D2422]">
                ₹{totalCartPrice}
              </span>
            </div>
            <button
              id="view-cart-from-modal-btn"
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="px-5 py-2.5 rounded-2xl bg-[#E04D01] hover:bg-[#C74200] text-white text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>View Cart</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
