import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Bike, MapPin, User, Phone, ArrowRight, ShoppingBag } from 'lucide-react';
import { CartItem, Order } from '../types.js';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onClearCart: () => void;
  onOrderCreated: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onClearCart,
  onOrderCreated,
}) => {
  const [customerName, setCustomerName] = useState<string>('Aarav Sharma');
  const [customerPhone, setCustomerPhone] = useState<string>('9876543210');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Flat 302, Green Glen Heights, Sector 15');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const itemTotal = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? cart[0].delivery_fee : 0;
  const grandTotal = itemTotal + deliveryFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty');
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 6) {
      setErrorMsg('Please enter a valid contact phone number');
      return;
    }

    if (!deliveryAddress.trim()) {
      setErrorMsg('Please enter a delivery address');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        restaurant_id: cart[0].restaurant_id,
        restaurant_name: cart[0].restaurant_name,
        items: cart.map((c) => ({
          item_id: c.item.id,
          name: c.item.name,
          price: c.item.price,
          quantity: c.quantity,
          is_veg: c.item.is_veg,
        })),
        total_amount: grandTotal,
        delivery_fee: deliveryFee,
        delivery_address: deliveryAddress.trim(),
        customer_name: customerName.trim() || 'Foodie Guest',
        customer_phone: customerPhone.trim(),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to place order');
      }

      const createdOrder: Order = await res.json();
      onClearCart();
      onClose();
      onOrderCreated(createdOrder);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error placing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#2D2422]/60 backdrop-blur-xs flex justify-end">
      <div
        id="cart-drawer-container"
        className="w-full max-w-md bg-[#FFFFFF] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EBE3D5] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E04D01]" />
            <h2 className="text-lg font-bold text-[#2D2422]">Your Cart</h2>
            {cart.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E04D01]/10 text-[#E04D01]">
                {cart.reduce((s, c) => s + c.quantity, 0)} items
              </span>
            )}
          </div>
          <button
            id="close-cart-drawer-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#6A5C58] hover:text-[#2D2422] flex items-center justify-center border border-[#EBE3D5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] flex items-center justify-center mb-4 text-[#6A5C58]">
              <ShoppingBag className="w-8 h-8 stroke-1 text-[#E04D01]" />
            </div>
            <h3 className="text-base font-bold text-[#2D2422] mb-1">
              Your cart is empty
            </h3>
            <p className="text-xs sm:text-sm text-[#6A5C58] max-w-xs mb-6">
              Explore mouth-watering street samosas, kachoris, biryanis and add them to your cart.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#E04D01] text-white text-xs font-bold hover:bg-[#C74200] transition-colors cursor-pointer"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Restaurant header */}
            <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EBE3D5] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#6A5C58] uppercase">
                  Ordering from
                </span>
                <p className="text-sm font-bold text-[#2D2422]">
                  {cart[0]?.restaurant_name}
                </p>
              </div>
              <button
                onClick={onClearCart}
                className="text-xs text-[#D93B3B] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            {/* Cart Items list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6A5C58]">
                Items in Cart
              </h4>
              {cart.map((cartItem) => (
                <div
                  key={cartItem.item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#EBE3D5] bg-white shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-xs shrink-0 ${
                        cartItem.item.is_veg ? 'bg-[#348A54]' : 'bg-[#D93B3B]'
                      }`}
                    ></span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#2D2422]">
                        {cartItem.item.name}
                      </p>
                      <p className="text-xs text-[#6A5C58]">
                        ₹{cartItem.item.price} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#EBE3D5] rounded-xl px-2 py-1">
                      <button
                        onClick={() => onUpdateQuantity(cartItem.item.id, -1)}
                        className="w-4 h-4 text-[#2D2422] flex items-center justify-center hover:text-[#E04D01] cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#2D2422] min-w-3 text-center">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(cartItem.item.id, 1)}
                        className="w-4 h-4 text-[#2D2422] flex items-center justify-center hover:text-[#E04D01] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs sm:text-sm font-extrabold text-[#2D2422] min-w-12 text-right">
                      ₹{cartItem.item.price * cartItem.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Details Form */}
            <form onSubmit={handleCheckout} className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6A5C58]">
                Delivery Details
              </h4>

              <div>
                <label className="text-xs font-medium text-[#6A5C58] mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#E04D01]" />
                  Your Name
                </label>
                <input
                  id="checkout-customer-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="E.g. Priya Sharma"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#EBE3D5] rounded-xl focus:outline-none focus:border-[#E04D01]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#6A5C58] mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#E04D01]" />
                  Phone Number (for tracking)
                </label>
                <input
                  id="checkout-customer-phone"
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="E.g. 9876543210"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#EBE3D5] rounded-xl focus:outline-none focus:border-[#E04D01]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#6A5C58] mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#E04D01]" />
                  Delivery Address
                </label>
                <textarea
                  id="checkout-customer-address"
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House number, Street, Landmark, Pincode"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#EBE3D5] rounded-xl focus:outline-none focus:border-[#E04D01]"
                />
              </div>

              {/* Bill Details */}
              <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EBE3D5] space-y-2 mt-4">
                <div className="flex justify-between text-xs text-[#6A5C58]">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-[#2D2422]">₹{itemTotal}</span>
                </div>
                <div className="flex justify-between text-xs text-[#6A5C58]">
                  <span className="flex items-center gap-1">
                    <Bike className="w-3 h-3 text-[#E04D01]" />
                    Delivery Fee
                  </span>
                  <span className="font-semibold text-[#2D2422]">₹{deliveryFee}</span>
                </div>
                <div className="pt-2 border-t border-[#EBE3D5] flex justify-between text-sm font-extrabold text-[#2D2422]">
                  <span>Grand Total</span>
                  <span className="text-[#E04D01]">₹{grandTotal}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#D93B3B] font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Pinned Bottom CTA */}
              <button
                id="place-order-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-3.5 px-4 rounded-2xl bg-[#E04D01] hover:bg-[#C74200] disabled:bg-gray-400 text-white font-bold text-sm sm:text-base flex items-center justify-between shadow-md transition-all cursor-pointer"
              >
                <span>{isSubmitting ? 'Placing Order...' : 'Place Order Now'}</span>
                <span className="flex items-center gap-1.5 bg-black/15 px-3 py-1 rounded-xl">
                  ₹{grandTotal}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
