import express from 'express';
import { INITIAL_RESTAURANTS } from '../src/data/seedRestaurants.js';
import { Restaurant, Order } from '../src/types.js';

const app = express();
app.use(express.json());

const orders: Order[] = [];

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', server: 'Foodie Vercel Serverless' });
});

// GET /api/cuisines
app.get('/api/cuisines', (_req, res) => {
  const set = new Set<string>();
  INITIAL_RESTAURANTS.forEach((r) => set.add(r.cuisine));
  res.json(['All', ...Array.from(set)]);
});

// GET /api/restaurants
app.get('/api/restaurants', (req, res) => {
  const { cuisine, search } = req.query;
  let results = [...INITIAL_RESTAURANTS];

  if (cuisine && cuisine !== 'All') {
    const c = (cuisine as string).toLowerCase();
    results = results.filter((r) => r.cuisine.toLowerCase() === c);
  }

  if (search && (search as string).trim()) {
    const q = (search as string).toLowerCase().trim();
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

  res.json(results);
});

// GET /api/restaurants/:id
app.get('/api/restaurants/:id', (req, res) => {
  const rest = INITIAL_RESTAURANTS.find((r) => r.id === req.params.id);
  if (!rest) return res.status(404).json({ error: 'Restaurant not found' });
  res.json(rest);
});

// POST /api/orders
app.post('/api/orders', (req, res) => {
  const {
    restaurant_id,
    restaurant_name,
    items,
    total_amount,
    delivery_fee,
    delivery_address,
    customer_name,
    customer_phone,
  } = req.body;

  const newOrder: Order = {
    id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    restaurant_id: restaurant_id || 'rest-1',
    restaurant_name: restaurant_name || 'Street Corner',
    items: items || [],
    total_amount: total_amount || 0,
    delivery_fee: delivery_fee || 30,
    delivery_address: delivery_address || 'Customer Address',
    customer_name: customer_name || 'Foodie Guest',
    customer_phone: customer_phone || '9876543210',
    status: 'placed',
    created_at: new Date().toISOString(),
  };

  orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

// GET /api/orders
app.get('/api/orders', (req, res) => {
  const { phone } = req.query;
  if (phone) {
    return res.json(orders.filter((o) => o.customer_phone.includes(phone as string)));
  }
  res.json(orders);
});

// GET /api/orders/:id
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// PATCH /api/orders/:id/status
app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = status;
  res.json(order);
});

export default app;
