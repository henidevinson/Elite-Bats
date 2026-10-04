import express from 'express';
import db from '../db.js';
import { upload, deleteLocalImage } from '../middleware/upload.js';

const router = express.Router();

// GET all products
router.get('/', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY createdAt DESC').all();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// GET single product
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

// POST create product
router.post('/', (req, res) => {
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

      // 1. Name & Brand Validation with Character Length Limits
      if (!name || !name.trim()) {
        if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
        return res.status(400).json({ error: 'Product name is required.' });
      }
      if (!brand || !brand.trim()) {
        if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
        return res.status(400).json({ error: 'Brand is required.' });
      }

      // 2. Strict Price Validation (between 0 and 5,00,000 INR)
      const priceStr = price !== undefined && price !== null ? String(price).trim() : '';
      const numPrice = Number(priceStr);
      if (priceStr === '' || isNaN(numPrice) || numPrice < 0 || numPrice > 500000) {
        if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
        return res.status(400).json({ error: 'Please enter a valid price between ₹0 and ₹5,00,000.' });
      }

      // 3. Whitelist Willow Type & Stock Availability
      const allowedWillow = ['English Willow', 'Kashmir Willow'];
      const validatedWillow = allowedWillow.includes(willowType) ? willowType : 'English Willow';

      const allowedStock = ['In Stock', 'Out of Stock'];
      const validatedStock = allowedStock.includes(availability) ? availability : 'In Stock';

      // 4. Sanitize and Bound Lengths
      const safeId = id && String(id).trim() ? String(id).trim().slice(0, 50) : `bat-${Date.now()}`;
      const safeName = String(name).trim().slice(0, 100);
      const safeBrand = String(brand).trim().slice(0, 50);
      const safeWeight = String(weight).trim().slice(0, 30);
      const safeShortDesc = String(shortDescription).trim().slice(0, 300);
      const safeDesc = String(description).trim().slice(0, 3000);
      const imagePath = req.file ? `/uploads/${req.file.filename}` : (req.body.image || '');

      const stmt = db.prepare(`
        INSERT INTO products (
          id, name, brand, price, shortDescription, description, weight, willowType, availability, image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        safeId,
        safeName,
        safeBrand,
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
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product: ' + error.message });
    }
  });
});

// PUT update product
router.put('/:id', (req, res) => {
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

      if (!name || !String(name).trim()) {
        if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
        return res.status(400).json({ error: 'Product name cannot be empty.' });
      }
      if (!brand || !String(brand).trim()) {
        if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
        return res.status(400).json({ error: 'Brand cannot be empty.' });
      }

      const priceStr = price !== undefined && price !== null ? String(price).trim() : '';
      const numPrice = Number(priceStr);
      if (priceStr === '' || isNaN(numPrice) || numPrice < 0 || numPrice > 500000) {
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

      db.prepare(`
        UPDATE products SET
          name = ?, brand = ?, price = ?, shortDescription = ?,
          description = ?, weight = ?, willowType = ?, availability = ?, image = ?
        WHERE id = ?
      `).run(
        String(name).trim().slice(0, 100),
        String(brand).trim().slice(0, 50),
        numPrice,
        String(shortDescription).trim().slice(0, 300),
        String(description).trim().slice(0, 3000),
        String(weight).trim().slice(0, 30),
        validatedWillow,
        validatedStock,
        imagePath,
        id
      );

      const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      res.status(200).json({ message: 'Product updated successfully', product: updated });
    } catch (error) {
      if (req.file) deleteLocalImage(`/uploads/${req.file.filename}`);
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product: ' + error.message });
    }
  });
});

// DELETE product
router.delete('/:id', (req, res) => {
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
