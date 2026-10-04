import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import productsRouter from './routes/products.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Disable Express technology signature
app.disable('x-powered-by');

// 1. Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// 2. Strict CORS Configuration
const explicitAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://elite-bats.vercel.app'
];

if (process.env.ALLOWED_ORIGIN) {
  explicitAllowedOrigins.push(process.env.ALLOWED_ORIGIN);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || explicitAllowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// 3. Sensitive File Access Blocker
app.use((req, res, next) => {
  if (/\.(db|sqlite|sqlite3|env|git|bak|config)/i.test(req.path)) {
    return res.status(403).json({ error: 'Access denied: protected resource.' });
  }
  next();
});

// 4. Safe Static Image Serving
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir, {
  dotfiles: 'ignore',
  index: false
}));

app.use('/api/uploads', express.static(uploadsDir, {
  dotfiles: 'ignore',
  index: false
}));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Elite Bats API is running successfully' });
});

// Routes
app.use('/api/products', productsRouter);
app.use('/api/admin', adminRouter);

// 5. Centralized Production Error Handler (Hides internal stack traces)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});
