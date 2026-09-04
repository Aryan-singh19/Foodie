import { Restaurant, Order, OrderStatus } from '../types.js';
import { INITIAL_RESTAURANTS } from './seedRestaurants.js';

const STORAGE_ORDERS_KEY = 'foodie_saved_orders';

// Helper to simulate order status progression based on elapsed time (in ms)
export function calculateSimulatedStatus(createdAtIso: string, currentStatus: OrderStatus): OrderStatus {
  if (currentStatus === 'delivered') return 'delivered';

  const elapsedSeconds = (Date.now() - new Date(createdAtIso).getTime()) / 1000;

  if (elapsedSeconds > 180) {
    return 'delivered';
  } else if (elapsedSeconds > 100) {
    return 'out_for_delivery';
  } else if (elapsedSeconds > 40) {
    return 'preparing';
  } else if (elapsedSeconds > 15) {
    return 'confirmed';
  }
  return 'placed';
}

export const ApiClient = {
  // Get list of cuisines
  async getCuisines(): Promise<string[]> {
    try {
      const res = await fetch('/api/cuisines', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // fallback
    }

    // Static fallback from seed data
    const set = new Set<string>();
    INITIAL_RESTAURANTS.forEach((r) => set.add(r.cuisine));
    return ['All', ...Array.from(set)];
  },

  // Get restaurants with optional cuisine and search filter
  async getRestaurants(cuisine?: string, search?: string): Promise<Restaurant[]> {
    try {
      const params = new URLSearchParams();
      if (cuisine && cuisine !== 'All') params.append('cuisine', cuisine);
      if (search && search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/restaurants?${params.toString()}`, {
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {
      // fallback
    }

    // High-fidelity client-side filtering fallback
    let results = [...INITIAL_RESTAURANTS];

    if (cuisine && cuisine !== 'All') {
      const c = cuisine.toLowerCase();
      results = results.filter((r) => r.cuisine.toLowerCase() === c);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q) ||
          r.menu?.some(
            (m) =>
              m.name.toLowerCase().includes(q) ||
              m.description.toLowerCase().includes(q) ||
              m.category.toLowerCase().includes(q)
          )
      );
    }

    return results;
  },

  // Get single restaurant by ID
  async getRestaurantById(id: string): Promise<Restaurant | null> {
    try {
      const res = await fetch(`/api/restaurants/${id}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    return INITIAL_RESTAURANTS.find((r) => r.id === id) || null;
  },

  // Submit order
  async createOrder(payload: {
    restaurant_id: string;
    restaurant_name: string;
    items: any[];
    total_amount: number;
    delivery_fee: number;
    delivery_address: string;
    customer_name: string;
    customer_phone: string;
  }): Promise<Order> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3500),
      });

      if (res.ok) {
        const order = await res.json();
        this.saveLocalOrder(order);
        return order;
      }
    } catch {
      // fallback to resilient local creation
    }

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: orderId,
      restaurant_id: payload.restaurant_id,
      restaurant_name: payload.restaurant_name,
      items: payload.items,
      total_amount: payload.total_amount,
      delivery_fee: payload.delivery_fee,
      delivery_address: payload.delivery_address,
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      status: 'placed',
      created_at: new Date().toISOString(),
    };

    this.saveLocalOrder(newOrder);
    return newOrder;
  },

  // Get single order with dynamic progress
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const order = await res.json();
        this.saveLocalOrder(order);
        return order;
      }
    } catch {
      // fallback
    }

    // Local fallback
    const saved = this.getLocalOrders();
    const existing = saved.find((o) => o.id === orderId);
    if (!existing) return null;

    // Advance simulated status
    const updatedStatus = calculateSimulatedStatus(existing.created_at, existing.status);
    if (updatedStatus !== existing.status) {
      existing.status = updatedStatus;
      this.saveLocalOrder(existing);
    }

    return existing;
  },

  // Get local orders from storage
  getLocalOrders(): Order[] {
    try {
      const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Save or update local order
  saveLocalOrder(order: Order) {
    try {
      const orders = this.getLocalOrders();
      const idx = orders.findIndex((o) => o.id === order.id);
      if (idx >= 0) {
        orders[idx] = order;
      } else {
        orders.unshift(order);
      }
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders.slice(0, 20)));
    } catch (e) {
      console.error('Error saving local order:', e);
    }
  },
};
