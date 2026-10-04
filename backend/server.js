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

// Ensure uploads folder exists
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 1. CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser calls, localhost, and Vercel production domains
    if (
      !origin ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.includes('vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// 2. Sensitive File Interceptor
app.use((req, res, next) => {
  if (/\.(db|sqlite|sqlite3|env|git)/i.test(req.path)) {
    return res.status(403).json({ error: 'Access denied: protected resource.' });
  }
  next();
});

// 3. Static Uploads
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

// Bind to 0.0.0.0 for cloud hosting platforms like Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});
