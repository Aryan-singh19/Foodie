import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.js';
import { HeroBanner } from './components/HeroBanner.js';
import { CuisineTabs } from './components/CuisineTabs.js';
import { RestaurantCard } from './components/RestaurantCard.js';
import { RestaurantModal } from './components/RestaurantModal.js';
import { CartDrawer } from './components/CartDrawer.js';
import { OrderTrackerModal } from './components/OrderTrackerModal.js';
import { GithubSyncModal } from './components/GithubSyncModal.js';
import { Restaurant, MenuItem, CartItem, Order } from './types.js';
import { Store, Utensils, AlertCircle, ShoppingBag } from 'lucide-react';

export const App: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cuisines, setCuisines] = useState<string[]>(['All']);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [streetOnly, setStreetOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Selected restaurant for menu modal
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('foodie_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Order Tracker state
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem('foodie_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [isGithubSyncOpen, setIsGithubSyncOpen] = useState<boolean>(false);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('foodie_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save active order to local storage
  useEffect(() => {
    try {
      if (activeOrder) {
        localStorage.setItem('foodie_active_order', JSON.stringify(activeOrder));
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeOrder]);

  // Fetch cuisines list once
  useEffect(() => {
    fetch('/api/cuisines')
      .then((res) => (res.ok ? res.json() : ['All']))
      .then((data) => setCuisines(data))
      .catch((err) => console.error('Error fetching cuisines:', err));
  }, []);

  // Fetch restaurants based on search & cuisine
  const loadRestaurants = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCuisine && selectedCuisine !== 'All') {
        params.append('cuisine', selectedCuisine);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await fetch(`/api/restaurants?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load restaurants');
      const data: Restaurant[] = await res.json();
      setRestaurants(data);
    } catch (err: any) {
      setFetchError(err.message || 'Error fetching restaurant list');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCuisine, searchQuery]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  // Open restaurant details modal (loads full restaurant with menu)
  const handleOpenRestaurant = async (restaurantId: string) => {
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}`);
      if (res.ok) {
        const fullRestaurant: Restaurant = await res.json();
        setSelectedRestaurant(fullRestaurant);
      }
    } catch (err) {
      console.error('Error opening restaurant details:', err);
    }
  };

  // Cart operations
  const handleAddToCart = (restaurant: Restaurant, item: MenuItem) => {
    setCart((prevCart) => {
      // If adding from a different restaurant, check and clear or confirm
      if (prevCart.length > 0 && prevCart[0].restaurant_id !== restaurant.id) {
        // Replace with new restaurant's item
        return [
          {
            restaurant_id: restaurant.id,
            restaurant_name: restaurant.name,
            delivery_fee: restaurant.delivery_fee,
            item,
            quantity: 1,
          },
        ];
      }

      const existingIndex = prevCart.findIndex((c) => c.item.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [
        ...prevCart,
        {
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name,
          delivery_fee: restaurant.delivery_fee,
          item,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((c) => {
          if (c.item.id === itemId) {
            return { ...c, quantity: c.quantity + delta };
          }
          return c;
        })
        .filter((c) => c.quantity > 0);
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderCreated = (order: Order) => {
    setActiveOrder(order);
    setIsTrackerOpen(true);
  };

  // Filter by street vendors if toggle is on
  const displayedRestaurants = streetOnly
    ? restaurants.filter((r) => r.is_street_vendor)
    : restaurants;

  const totalCartCount = cart.reduce((acc, c) => acc + c.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2422] flex flex-col">
      {/* Navigation Header */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        setIsTrackerOpen={setIsTrackerOpen}
        onOpenGithubSync={() => setIsGithubSyncOpen(true)}
        activeOrderCount={activeOrder && activeOrder.status !== 'delivered' ? 1 : 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <HeroBanner
          onExploreStreetVendors={() => {
            setStreetOnly(true);
            setSelectedCuisine('Street Food');
          }}
        />

        {/* Cuisine Filter Tabs */}
        <CuisineTabs
          cuisines={cuisines}
          selectedCuisine={selectedCuisine}
          onSelectCuisine={(cuisine) => setSelectedCuisine(cuisine)}
          streetOnly={streetOnly}
          setStreetOnly={setStreetOnly}
        />

        {/* Status / Notice if searching */}
        {searchQuery && (
          <div className="mb-4 flex items-center justify-between text-xs text-[#6A5C58]">
            <span>
              Search results for "<strong>{searchQuery}</strong>"
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#E04D01] font-semibold hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Restaurant Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl h-72 border border-[#EBE3D5]"></div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="p-8 rounded-3xl bg-white border border-[#EBE3D5] text-center max-w-md mx-auto my-8">
            <AlertCircle className="w-10 h-10 text-[#D93B3B] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#2D2422]">{fetchError}</p>
            <button
              onClick={loadRestaurants}
              className="mt-4 px-4 py-2 rounded-xl bg-[#E04D01] text-white text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : displayedRestaurants.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-[#EBE3D5] text-center max-w-lg mx-auto my-6">
            <Store className="w-12 h-12 text-[#6A5C58] mx-auto mb-3 stroke-1" />
            <h3 className="text-base font-bold text-[#2D2422] mb-1">
              No places found
            </h3>
            <p className="text-xs sm:text-sm text-[#6A5C58] mb-4">
              Try changing your search keywords or switching cuisine categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCuisine('All');
                setStreetOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#E04D01] text-white text-xs font-bold"
            >
              Show All Restaurants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedRestaurants.map((res) => (
              <RestaurantCard
                key={res.id}
                restaurant={res}
                onClick={() => handleOpenRestaurant(res.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar (Mobile/Tablet helper) */}
      {totalCartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto">
          <button
            id="floating-cart-view-btn"
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3 px-4 rounded-2xl bg-[#E04D01] text-white font-bold flex items-center justify-between shadow-xl hover:bg-[#C74200] transition-transform active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-sm">
                {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} in cart
              </span>
            </div>
            <span className="text-sm font-black bg-black/15 px-3 py-1 rounded-xl">
              View Cart →
            </span>
          </button>
        </div>
      )}

      {/* Modals & Drawers */}
      <RestaurantModal
        restaurant={selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        cart={cart}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onOrderCreated={handleOrderCreated}
      />

      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        activeOrder={activeOrder}
        onSelectOrder={(ord) => setActiveOrder(ord)}
      />

      <GithubSyncModal
        isOpen={isGithubSyncOpen}
        onClose={() => setIsGithubSyncOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-[#EBE3D5] bg-[#FFFFFF] text-center text-xs text-[#6A5C58]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#E04D01]" />
            <span className="font-bold text-[#2D2422]">Foodie</span>
            <span>• Authentic Street Carts & Kitchens</span>
          </div>
          <p>© {new Date().getFullYear()} Foodie Inc. Freshly delivered to your doorstep.</p>
        </div>
      </footer>
    </div>
  );
};
