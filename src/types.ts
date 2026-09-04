export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_veg: boolean;
  is_popular: boolean;
  image?: string;
  prep_time?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  delivery_time: string;
  delivery_fee: number;
  min_order: number;
  is_open: boolean;
  address: string;
  is_street_vendor: boolean;
  menu?: MenuItem[];
}

export interface CartItem {
  restaurant_id: string;
  restaurant_name: string;
  delivery_fee: number;
  item: MenuItem;
  quantity: number;
}

export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';

export interface OrderItemPayload {
  item_id: string;
  name: string;
  price: number;
  quantity: number;
  is_veg: boolean;
}

export interface Order {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  items: OrderItemPayload[];
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  customer_name: string;
  customer_phone: string;
  status: OrderStatus;
  created_at: string;
}
