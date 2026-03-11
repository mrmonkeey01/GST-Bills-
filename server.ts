import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import invoiceRoutes from './backend/routes/invoiceRoutes';
import productRoutes from './backend/routes/productRoutes';
import customerRoutes from './backend/routes/customerRoutes';
import authRoutes from './backend/routes/authRoutes';
import { logger } from './backend/middleware/logger';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(logger);

  // API routes
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/auth', authRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
