import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, ChefHat, Bike, PackageCheck, RefreshCw, Search, Phone, ChevronRight } from 'lucide-react';
import { Order, OrderStatus } from '../types.js';
import { ApiClient, calculateSimulatedStatus } from '../data/apiClient.js';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrder: Order | null;
  onSelectOrder: (order: Order) => void;
}

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: 'placed', label: 'Order Placed', desc: 'Received and awaiting kitchen review', icon: <Clock className="w-4 h-4" /> },
  { key: 'confirmed', label: 'Confirmed', desc: 'Accepted by vendor & queue assigned', icon: <CheckCircle2 className="w-4 h-4" /> },
  { key: 'preparing', label: 'Preparing Fresh', desc: 'Chefs are frying & packing your order', icon: <ChefHat className="w-4 h-4" /> },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider is on the way to your location', icon: <Bike className="w-4 h-4" /> },
  { key: 'delivered', label: 'Delivered', desc: 'Enjoy your hot and tasty meal!', icon: <PackageCheck className="w-4 h-4" /> },
];

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  activeOrder,
  onSelectOrder,
}) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(activeOrder);
  const [searchPhone, setSearchPhone] = useState<string>(activeOrder?.customer_phone || '9876543210');
  const [phoneOrders, setPhoneOrders] = useState<Order[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeOrder) {
      setCurrentOrder(activeOrder);
      if (activeOrder.customer_phone) {
        setSearchPhone(activeOrder.customer_phone);
        fetchOrdersByPhone(activeOrder.customer_phone);
      }
    }
  }, [activeOrder]);

  const fetchOrdersByPhone = async (phone: string) => {
    if (!phone) return;
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone.trim())}`, {
        signal: AbortSignal.timeout(2000),
      }).catch(() => null);

      if (res && res.ok) {
        const data: Order[] = await res.json();
        setPhoneOrders(data);
        if (!currentOrder && data.length > 0) {
          setCurrentOrder(data[0]);
        }
        return;
      }

      // Local fallback
      const local = ApiClient.getLocalOrders().filter((o) =>
        o.customer_phone.includes(phone.trim())
      );
      setPhoneOrders(local);
      if (!currentOrder && local.length > 0) {
        setCurrentOrder(local[0]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAdvanceStatus = async () => {
    if (!currentOrder) return;
    const orderIndex = STATUS_STEPS.findIndex((s) => s.key === currentOrder.status);
    if (orderIndex >= STATUS_STEPS.length - 1) {
      setStatusMessage('Order has already reached final "Delivered" status.');
      return;
    }

    const nextStatus = STATUS_STEPS[orderIndex + 1].key;
    setIsUpdatingStatus(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
        signal: AbortSignal.timeout(2000),
      }).catch(() => null);

      if (res && res.ok) {
        const updated: Order = await res.json();
        setCurrentOrder(updated);
        onSelectOrder(updated);
        ApiClient.saveLocalOrder(updated);
        if (updated.customer_phone) {
          fetchOrdersByPhone(updated.customer_phone);
        }
      } else {
        // Local state update fallback
        const updated: Order = { ...currentOrder, status: nextStatus };
        setCurrentOrder(updated);
        onSelectOrder(updated);
        ApiClient.saveLocalOrder(updated);
        if (updated.customer_phone) {
          fetchOrdersByPhone(updated.customer_phone);
        }
      }
    } catch (err: any) {
      // Local fallback
      const updated: Order = { ...currentOrder, status: nextStatus };
      setCurrentOrder(updated);
      onSelectOrder(updated);
      ApiClient.saveLocalOrder(updated);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!isOpen) return null;

  const currentStepIndex = currentOrder
    ? STATUS_STEPS.findIndex((s) => s.key === currentOrder.status)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2D2422]/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="order-tracker-modal"
        className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-3xl overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col border border-[#EBE3D5]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EBE3D5] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E04D01] text-white flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2D2422]">
                Live Order Tracker
              </h2>
              <p className="text-xs text-[#6A5C58]">
                Real-time preparation & dispatch updates
              </p>
            </div>
          </div>
          <button
            id="close-order-tracker-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#6A5C58] hover:text-[#2D2422] flex items-center justify-center border border-[#EBE3D5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Phone lookup bar */}
          <div className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EBE3D5]">
            <div className="relative flex-1 w-full">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A5C58]" />
              <input
                id="tracker-phone-input"
                type="tel"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Enter phone to view your orders"
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-[#EBE3D5] rounded-xl focus:outline-none focus:border-[#E04D01]"
              />
            </div>
            <button
              id="tracker-find-orders-btn"
              onClick={() => fetchOrdersByPhone(searchPhone)}
              disabled={isLoadingHistory}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#2D2422] text-white text-xs font-bold hover:bg-[#1A1412] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Lookup Orders</span>
            </button>
          </div>

          {currentOrder ? (
            <div className="space-y-6">
              {/* Order quick metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-[#FAF7F2]/60 rounded-2xl border border-[#EBE3D5]">
                <div>
                  <span className="text-[11px] font-bold text-[#E04D01] uppercase tracking-wider block">
                    Order ID: #{currentOrder.id.slice(-8)}
                  </span>
                  <h3 className="text-base font-bold text-[#2D2422]">
                    {currentOrder.restaurant_name}
                  </h3>
                  <span className="text-xs text-[#6A5C58]">
                    Placed on {new Date(currentOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-[#6A5C58] block">Total Bill</span>
                  <span className="text-lg font-black text-[#2D2422]">
                    ₹{currentOrder.total_amount}
                  </span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6A5C58] mb-4">
                  Delivery Milestones
                </h4>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EBE3D5]">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div key={step.key} className="relative flex items-start gap-3.5">
                        {/* Dot / icon */}
                        <div
                          className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                            isCompleted
                              ? 'bg-[#348A54] text-white shadow-xs'
                              : 'bg-white border-2 border-[#EBE3D5] text-[#6A5C58]'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold ${
                                isCurrent
                                  ? 'text-[#E04D01]'
                                  : isCompleted
                                  ? 'text-[#2D2422]'
                                  : 'text-[#6A5C58]'
                              }`}
                            >
                              {step.label}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-[#E04D01]/10 text-[#E04D01] text-[10px] font-extrabold uppercase animate-pulse">
                                In Progress
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6A5C58] mt-0.5">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rider simulation card when out for delivery */}
              {currentOrder.status === 'out_for_delivery' && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1617194191528-9a50cf609304?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwyfHxmb29kJTIwZGVsaXZlcnklMjBtYW58ZW58MHx8fHwxNzc1OTUyNTgzfDA&ixlib=rb-4.1.0&q=85"
                    alt="Delivery Partner"
                    className="w-12 h-12 rounded-xl object-cover border border-amber-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#2D2422]">
                      Delivery Partner: Rajesh K.
                    </p>
                    <p className="text-[11px] text-[#6A5C58]">
                      On an electric bike • Heading to {currentOrder.delivery_address.slice(0, 30)}...
                    </p>
                  </div>
                </div>
              )}

              {/* Interactive Status Simulation Button */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D5] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#2D2422] block">
                    Vendor / Kitchen Simulator
                  </span>
                  <span className="text-[11px] text-[#6A5C58]">
                    Test the order lifecycle by advancing to the next milestone
                  </span>
                </div>
                <button
                  id="advance-order-status-btn"
                  onClick={handleAdvanceStatus}
                  disabled={isUpdatingStatus || currentOrder.status === 'delivered'}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#E04D01] hover:bg-[#C74200] disabled:bg-gray-300 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingStatus ? 'animate-spin' : ''}`} />
                  <span>
                    {currentOrder.status === 'delivered'
                      ? 'Completed'
                      : 'Simulate Next Stage'}
                  </span>
                </button>
              </div>

              {statusMessage && (
                <p className="text-xs text-center text-[#6A5C58] italic">
                  {statusMessage}
                </p>
              )}

              {/* Items summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6A5C58] mb-2">
                  Items in this order
                </h4>
                <div className="divide-y divide-[#EBE3D5] border border-[#EBE3D5] rounded-2xl bg-white p-3 space-y-2">
                  {currentOrder.items.map((it) => (
                    <div key={it.item_id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-xs ${it.is_veg ? 'bg-[#348A54]' : 'bg-[#D93B3B]'}`}></span>
                        <span className="font-semibold text-[#2D2422]">
                          {it.name} <span className="text-[#6A5C58]">× {it.quantity}</span>
                        </span>
                      </div>
                      <span className="font-bold text-[#2D2422]">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                  <div className="pt-2 flex items-center justify-between text-xs text-[#6A5C58]">
                    <span>Delivery destination:</span>
                    <span className="font-medium text-[#2D2422] text-right truncate max-w-xs">
                      {currentOrder.delivery_address}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[#6A5C58]">
              <Clock className="w-10 h-10 mx-auto stroke-1 text-[#E04D01] mb-2" />
              <p className="text-sm font-bold text-[#2D2422]">No active order selected</p>
              <p className="text-xs mt-1">
                Enter your phone number above or place an order from our restaurants to track status.
              </p>
            </div>
          )}

          {/* Past orders by this phone */}
          {phoneOrders.length > 0 && (
            <div className="pt-4 border-t border-[#EBE3D5]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6A5C58] mb-3">
                Orders for {searchPhone} ({phoneOrders.length})
              </h4>
              <div className="space-y-2">
                {phoneOrders.map((ord) => (
                  <div
                    key={ord.id}
                    id={`order-history-item-${ord.id}`}
                    onClick={() => setCurrentOrder(ord)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      currentOrder?.id === ord.id
                        ? 'border-[#E04D01] bg-[#FAF7F2]'
                        : 'border-[#EBE3D5] hover:border-[#E04D01]/40 bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-[#2D2422]">
                        {ord.restaurant_name}
                      </p>
                      <p className="text-[11px] text-[#6A5C58]">
                        ₹{ord.total_amount} • Status: <span className="font-semibold text-[#E04D01]">{ord.status}</span>
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#6A5C58]" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
