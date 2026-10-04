import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { generateAdminToken } from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', loginRateLimiter, (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const trimmedUser = String(username).trim().slice(0, 50);
    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(trimmedUser);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    let isMatch = false;

    try {
      if (admin.password && admin.password.startsWith('$2')) {
        isMatch = bcrypt.compareSync(String(password), admin.password);
      }
    } catch (bcryptErr) {
      console.warn('Bcrypt check error:', bcryptErr.message);
    }

    // Fallback upgrade for legacy plain-text password
    if (!isMatch && admin.password === String(password)) {
      isMatch = true;
      const newHash = bcrypt.hashSync(String(password), 10);
      db.prepare('UPDATE admins SET password = ? WHERE id = ?').run(newHash, admin.id);
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Issue cryptographically signed token with 24-hour expiration
    const token = generateAdminToken(admin.username);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      username: admin.username
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ error: 'Authentication service temporarily unavailable.' });
  }
});

router.post('/logout', (req, res) => {
  return res.status(200).json({ success: true, message: 'Logout successful' });
});

export default router;
