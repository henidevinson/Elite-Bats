import crypto from 'crypto';

// Secret key from environment or fallback to random 32-byte secret per boot
const TOKEN_SECRET = process.env.JWT_SECRET || 'elite-bats-secure-secret-key-2026';

// Generate a cryptographically signed token with 24-hour expiration
export function generateAdminToken(username) {
  const payload = JSON.stringify({
    user: username,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });

  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

// Verify signature and expiration
export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  // Timing-safe comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return null; // Expired token
    }
    return payload;
  } catch {
    return null;
  }
}

// Express middleware to protect administrative mutation endpoints
export function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied: Admin authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  const verified = verifyAdminToken(token);

  if (!verified) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  req.adminUser = verified.user;
  next();
}
