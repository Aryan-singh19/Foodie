import React from 'react';
import { ShoppingBag, Search, Clock, UtensilsCrossed, X, GitPullRequest } from 'lucide-react';
import { CartItem } from '../types.js';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  setIsTrackerOpen: (open: boolean) => void;
  onOpenGithubSync: () => void;
  activeOrderCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  cart,
  setIsCartOpen,
  setIsTrackerOpen,
  onOpenGithubSync,
  activeOrderCount,
}) => {
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header id="app-navbar" className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#EBE3D5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => setSearchQuery('')}>
            <div className="w-10 h-10 rounded-2xl bg-[#E04D01] flex items-center justify-center text-white shadow-sm">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-[#2D2422]">
                Food<span className="text-[#E04D01]">ie</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FFB800]/20 text-[#8F6600]">
                Street & Dining
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A5C58]" />
              <input
                id="search-restaurants-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search samosas, biryani, dosa, vendors..."
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#FAF7F2] border border-[#EBE3D5] rounded-xl focus:outline-none focus:border-[#E04D01] focus:ring-1 focus:ring-[#E04D01] transition-colors placeholder:text-[#6A5C58]/70"
              />
              {searchQuery && (
                <button
                  id="clear-search-button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A5C58] hover:text-[#2D2422]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* GitHub Sync Button */}
            <button
              id="open-github-sync-btn"
              onClick={onOpenGithubSync}
              title="Sync repository with GitHub"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#2D2422] bg-[#FAF7F2] border border-[#EBE3D5] hover:border-[#2D2422] hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <GitPullRequest className="w-4 h-4 text-[#2D2422]" />
              <span className="hidden sm:inline">GitHub Sync</span>
            </button>

            {/* Orders Tracker Button */}
            <button
              id="open-orders-tracker-button"
              onClick={() => setIsTrackerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#2D2422] bg-[#FAF7F2] border border-[#EBE3D5] hover:border-[#E04D01] transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4 text-[#E04D01]" />
              <span className="hidden md:inline">Track Orders</span>
              {activeOrderCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#348A54] animate-pulse"></span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="open-cart-button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#E04D01] hover:bg-[#C74200] transition-colors shadow-sm cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalCartItems > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 text-xs font-black rounded-full bg-white text-[#E04D01]">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
