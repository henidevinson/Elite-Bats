import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';

const router = express.Router();

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const trimmedUser = String(username).trim();
    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(trimmedUser);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    let isMatch = false;

    // 1. Try standard bcrypt comparison
    try {
      if (admin.password && admin.password.startsWith('$2')) {
        isMatch = bcrypt.compareSync(String(password), admin.password);
      }
    } catch (bcryptErr) {
      console.warn('Bcrypt check error, checking fallback:', bcryptErr.message);
    }

    // 2. Fallback check (in case password was stored as plain text "admin123")
    if (!isMatch && admin.password === String(password)) {
      isMatch = true;
      // Automatically upgrade stored password to a secure hash
      const newHash = bcrypt.hashSync(String(password), 10);
      db.prepare('UPDATE admins SET password = ? WHERE id = ?').run(newHash, admin.id);
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = `admin-token-${Date.now()}`;
    console.log(`Admin login successful: "${admin.username}"`);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      username: admin.username
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server authentication error: ' + error.message });
  }
});

router.post('/logout', (req, res) => {
  return res.status(200).json({ success: true, message: 'Logout successful' });
});

export default router;
