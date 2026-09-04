import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { INITIAL_RESTAURANTS } from './src/data/seedRestaurants.js';
import { Restaurant, Order } from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // In-memory data storage
  const restaurants: Restaurant[] = JSON.parse(JSON.stringify(INITIAL_RESTAURANTS));
  const orders: Order[] = [];

  // API Endpoints
  app.get('/api', (req: Request, res: Response) => {
    res.json({ message: 'FoodHub API is running' });
  });

  app.get('/api/', (req: Request, res: Response) => {
    res.json({ message: 'FoodHub API is running' });
  });

  // GET /api/restaurants - search, cuisine filter, strips menu from list view
  app.get('/api/restaurants', (req: Request, res: Response) => {
    const { search, cuisine } = req.query as { search?: string; cuisine?: string };
    let filtered = restaurants;

    if (cuisine && cuisine !== 'All') {
      filtered = filtered.filter(
        (r) => r.cuisine.toLowerCase() === cuisine.toLowerCase()
      );
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((r) => {
        const nameMatch = r.name.toLowerCase().includes(q);
        const cuisineMatch = r.cuisine.toLowerCase().includes(q);
        const menuMatch = r.menu?.some(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q)
        );
        return nameMatch || cuisineMatch || menuMatch;
      });
    }

    // Exclude menu property for list view (matches python backend and test suite requirement)
    const listResult = filtered.map(({ menu, ...rest }) => rest);
    res.json(listResult);
  });

  // GET /api/restaurants/:restaurant_id - full restaurant with menu
  app.get('/api/restaurants/:restaurant_id', (req: Request, res: Response) => {
    const { restaurant_id } = req.params;
    const restaurant = restaurants.find((r) => r.id === restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ detail: 'Restaurant not found' });
    }
    res.json(restaurant);
  });

  // GET /api/cuisines - distinct cuisines with "All"
  app.get('/api/cuisines', (req: Request, res: Response) => {
    const cuisineSet = new Set<string>();
    restaurants.forEach((r) => {
      if (r.cuisine) cuisineSet.add(r.cuisine);
    });
    const sortedCuisines = Array.from(cuisineSet).sort();
    res.json(['All', ...sortedCuisines]);
  });

  // POST /api/orders - create a new order
  app.post('/api/orders', (req: Request, res: Response) => {
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

    if (!restaurant_id || !items || !items.length || !customer_phone) {
      return res.status(400).json({ detail: 'Missing required order fields' });
    }

    const orderId = 'order-' + crypto.randomUUID();
    const newOrder: Order = {
      id: orderId,
      restaurant_id,
      restaurant_name: restaurant_name || 'Restaurant',
      items,
      total_amount: Number(total_amount),
      delivery_fee: Number(delivery_fee || 0),
      delivery_address: delivery_address || '',
      customer_name: customer_name || 'Valued Customer',
      customer_phone: String(customer_phone),
      status: 'placed',
      created_at: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    res.json(newOrder);
  });

  // GET /api/orders - by phone or all
  app.get('/api/orders', (req: Request, res: Response) => {
    const { phone } = req.query as { phone?: string };
    if (phone) {
      const userOrders = orders
        .filter((o) => o.customer_phone === phone)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return res.json(userOrders);
    }
    const sortedOrders = [...orders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    res.json(sortedOrders);
  });

  // GET /api/orders/:order_id
  app.get('/api/orders/:order_id', (req: Request, res: Response) => {
    const { order_id } = req.params;
    const order = orders.find((o) => o.id === order_id);
    if (!order) {
      return res.status(404).json({ detail: 'Order not found' });
    }
    res.json(order);
  });

  // PATCH /api/orders/:order_id/status
  app.patch('/api/orders/:order_id/status', (req: Request, res: Response) => {
    const { order_id } = req.params;
    const { status } = req.body;
    const validStatuses = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        detail: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const orderIndex = orders.findIndex((o) => o.id === order_id);
    if (orderIndex === -1) {
      return res.status(404).json({ detail: 'Order not found' });
    }

    orders[orderIndex].status = status;
    res.json(orders[orderIndex]);
  });

  // --- GitHub Sync Endpoints ---
  // GET /api/github/status - check git branch, changed files, last commit
  app.get('/api/github/status', (req: Request, res: Response) => {
    try {
      let branch = 'main';
      try {
        branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
      } catch {
        // fallback
      }

      let changes: string[] = [];
      try {
        const statusOutput = execSync('git status --short', { encoding: 'utf-8' }).trim();
        if (statusOutput) {
          changes = statusOutput.split('\n').filter(Boolean);
        }
      } catch {
        // fallback
      }

      let lastCommit: { hash: string; message: string; author: string; date: string } | null = null;
      try {
        const logOutput = execSync('git log -1 --format="%h||%s||%an||%cd"', { encoding: 'utf-8' }).trim();
        if (logOutput) {
          const [hash, message, author, date] = logOutput.split('||');
          lastCommit = { hash, message, author, date };
        }
      } catch {
        // fallback
      }

      let remoteUrl = 'https://github.com/Aryan-singh19/Foodie.git';
      try {
        remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
        // sanitize PAT if embedded in URL
        remoteUrl = remoteUrl.replace(/:[^@]+@/, '@');
      } catch {
        // fallback
      }

      res.json({
        repo: 'Aryan-singh19/Foodie',
        branch,
        remoteUrl,
        changedFiles: changes,
        changeCount: changes.length,
        lastCommit,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error reading git status' });
    }
  });

  // POST /api/github/verify - verify PAT against GitHub API
  app.post('/api/github/verify', async (req: Request, res: Response) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ valid: false, message: 'No Personal Access Token provided' });
    }

    try {
      const ghRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Foodie-Sync-App',
        },
      });

      if (!ghRes.ok) {
        return res.status(ghRes.status).json({
          valid: false,
          message: `GitHub token verification failed: HTTP ${ghRes.status} ${ghRes.statusText}`,
        });
      }

      const userData = await ghRes.json();
      return res.json({
        valid: true,
        login: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
      });
    } catch (err: any) {
      return res.status(500).json({
        valid: false,
        message: err.message || 'Failed to connect to GitHub API',
      });
    }
  });

  // POST /api/github/sync - commit and push changes with token
  app.post('/api/github/sync', async (req: Request, res: Response) => {
    const { pat, commitMessage, branch = 'main' } = req.body;
    const token = (pat || '').trim();

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Personal Access Token (PAT) is required to push to GitHub',
      });
    }

    const message = (commitMessage || 'Update Foodie with rich street dishes, local assets, and enhanced menus').trim();

    try {
      // Ensure git user config is set
      execSync('git config user.name "Aryan Singh Chandel"', { encoding: 'utf-8' });
      execSync('git config user.email "aryansingh19gh@gmail.com"', { encoding: 'utf-8' });

      // Stage all modified and added files
      execSync('git add -A', { encoding: 'utf-8' });

      // Check if there are changes to commit
      let committed = false;
      let commitHash = '';
      try {
        const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
        if (status) {
          const commitOut = execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { encoding: 'utf-8' });
          committed = true;
        }
      } catch (commitErr: any) {
        // If nothing to commit, continue to push
      }

      try {
        commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
      } catch {
        // fallback
      }

      // Ensure branch name is main
      try {
        execSync('git branch -M main', { encoding: 'utf-8' });
      } catch {
        // ignore
      }

      // Configure remote with PAT securely
      const authedRemote = `https://Aryan-singh19:${token}@github.com/Aryan-singh19/Foodie.git`;
      try {
        execSync(`git remote set-url origin "${authedRemote}"`, { encoding: 'utf-8' });
      } catch {
        execSync(`git remote add origin "${authedRemote}"`, { encoding: 'utf-8' });
      }

      // Push to GitHub main branch
      const pushOutput = execSync('git push -u origin main', { encoding: 'utf-8', timeout: 30000 });

      // Clean remote URL to not store token persistently
      try {
        execSync('git remote set-url origin "https://github.com/Aryan-singh19/Foodie.git"', { encoding: 'utf-8' });
      } catch {
        // ignore
      }

      return res.json({
        success: true,
        message: 'Successfully pushed all updates to GitHub repository Aryan-singh19/Foodie!',
        commitHash,
        output: pushOutput,
        repoUrl: 'https://github.com/Aryan-singh19/Foodie',
      });
    } catch (err: any) {
      // Clean remote URL in case of error
      try {
        execSync('git remote set-url origin "https://github.com/Aryan-singh19/Foodie.git"', { encoding: 'utf-8' });
      } catch {
        // ignore
      }

      return res.status(500).json({
        success: false,
        error: err.stderr || err.stdout || err.message || 'Git push operation failed',
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Foodie server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
