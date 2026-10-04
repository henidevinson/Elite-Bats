// In-memory rate limiter tracking client IP requests
const hitStore = new Map();

// Periodic cleanup of expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of hitStore.entries()) {
    if (now > data.resetTime) {
      hitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function createRateLimiter({ windowMs = 60 * 1000, max = 30, message = 'Too many requests. Please try again later.' }) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const key = `${req.baseUrl || req.path}_${ip}`;
    const now = Date.now();

    const record = hitStore.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    hitStore.set(key, record);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));

    if (record.count > max) {
      return res.status(429).json({ error: message });
    }

    next();
  };
}

// Login limiter: max 5 attempts per 15 minutes per IP
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please wait 15 minutes before trying again.'
});
