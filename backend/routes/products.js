import express from 'express';
import db from '../db.js';
import { upload, deleteLocalImage } from '../middleware/upload.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to strip HTML tags and prevent stored XSS
function sanitizeText(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

// Helper to validate safe image URLs/paths (blocks javascript: schemes)
function isSafeImagePath(pathStr) {
  if (!pathStr || typeof pathStr !== 'string') return true;
  const trimmed = pathStr.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
    return false;
  }
  return trimmed.startsWith('/uploads/') || trimmed.startsWith('https://') || trimmed.startsWith('http://');
}

// GET all products (Public)
router.get('/', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY createdAt DESC').all();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// GET single product (Public)
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});

// POST create product (Protected by requireAdminAuth)
router.post('/', requireAdminAuth, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const {
        id,
        name,
        brand,
        price,
        shortDescription = '',
        description = '',
        weight = '',
        willowType = 'English Willow',
        availability = 'In Stock'
      } = req.body || {};

      const cleanName = sanitizeText(name);
      const cleanBrand = sanitizeText(brand);

      if (!cleanName) {
        if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
        return res.status(400).json({ error: 'Product name is required.' });
      }
      if (!cleanBrand) {
        if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
        return res.status(400).json({ error: 'Brand is required.' });
      }

      const numPrice = Number(price);
      if (price === undefined || price === null || String(price).trim() === '' || isNaN(numPrice) || numPrice < 0 || numPrice > 500000) {
        if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
        return res.status(400).json({ error: 'Please enter a valid price between ₹0 and ₹5,00,000.' });
      }

      const allowedWillow = ['English Willow', 'Kashmir Willow'];
      const validatedWillow = allowedWillow.includes(willowType) ? willowType : 'English Willow';

      const allowedStock = ['In Stock', 'Out of Stock'];
      const validatedStock = allowedStock.includes(availability) ? availability : 'In Stock';

      const imagePath = req.file ? `/uploads/${req.file.filename}` : sanitizeText(req.body.image);
      if (!isSafeImagePath(imagePath)) {
        if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
        return res.status(400).json({ error: 'Invalid image format or protocol.' });
      }

      const safeId = id && String(id).trim() ? sanitizeText(id).slice(0, 50) : `bat-${Date.now()}`;
      const safeShortDesc = sanitizeText(shortDescription).slice(0, 300);
      const safeDesc = sanitizeText(description).slice(0, 3000);
      const safeWeight = sanitizeText(weight).slice(0, 30);

      const stmt = db.prepare(`
        INSERT INTO products (
          id, name, brand, price, shortDescription, description, weight, willowType, availability, image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        safeId,
        cleanName.slice(0, 100),
        cleanBrand.slice(0, 50),
        numPrice,
        safeShortDesc,
        safeDesc,
        safeWeight,
        validatedWillow,
        validatedStock,
        imagePath
      );

      const created = db.prepare('SELECT * FROM products WHERE id = ?').get(safeId);
      res.status(201).json({ message: 'Product created successfully', product: created });
    } catch (error) {
      if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
      res.status(500).json({ error: 'Failed to create product: ' + error.message });
    }
  });
});

// PUT update product (Protected by requireAdminAuth)
router.put('/:id', requireAdminAuth, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

      if (!existing) {
        if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
        return res.status(404).json({ error: `Product with ID '${id}' not found.` });
      }

      const {
        name = existing.name,
        brand = existing.brand,
        price = existing.price,
        shortDescription = existing.shortDescription,
        description = existing.description,
        weight = existing.weight,
        willowType = existing.willowType,
        availability = existing.availability,
        removeImage
      } = req.body || {};

      const cleanName = sanitizeText(name);
      const cleanBrand = sanitizeText(brand);

      if (!cleanName) {
        if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
        return res.status(400).json({ error: 'Product name cannot be empty.' });
      }
      if (!cleanBrand) {
        if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
        return res.status(400).json({ error: 'Brand cannot be empty.' });
      }

      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0 || numPrice > 500000) {
        if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
        return res.status(400).json({ error: 'Please enter a valid price between ₹0 and ₹5,00,000.' });
      }

      const allowedWillow = ['English Willow', 'Kashmir Willow'];
      const validatedWillow = allowedWillow.includes(willowType) ? willowType : existing.willowType;

      const allowedStock = ['In Stock', 'Out of Stock'];
      const validatedStock = allowedStock.includes(availability) ? availability : existing.availability;

      let imagePath = existing.image;
      if (req.file) {
        deleteLocalImage(existing.image);
        imagePath = `/uploads/${req.file.filename}`;
      } else if (removeImage === 'true' || removeImage === true) {
        deleteLocalImage(existing.image);
        imagePath = '';
      }

      if (!isSafeImagePath(imagePath)) {
        return res.status(400).json({ error: 'Invalid image path.' });
      }

      db.prepare(`
        UPDATE products SET
          name = ?, brand = ?, price = ?, shortDescription = ?,
          description = ?, weight = ?, willowType = ?, availability = ?, image = ?
        WHERE id = ?
      `).run(
        cleanName.slice(0, 100),
        cleanBrand.slice(0, 50),
        numPrice,
        sanitizeText(shortDescription).slice(0, 300),
        sanitizeText(description).slice(0, 3000),
        sanitizeText(weight).slice(0, 30),
        validatedWillow,
        validatedStock,
        imagePath,
        id
      );

      const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      res.status(200).json({ message: 'Product updated successfully', product: updated });
    } catch (error) {
      if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
      res.status(500).json({ error: 'Failed to update product: ' + error.message });
    }
  });
});

// DELETE product (Protected by requireAdminAuth)
router.delete('/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: `Product with ID '${id}' not found.` });
    }
    deleteLocalImage(existing.image);
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.status(200).json({ message: `Product '${id}' deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

export default router;
