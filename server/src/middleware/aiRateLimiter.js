/**
 * In-memory sliding window rate limiter for AI endpoints.
 * Limits users/IPs to 30 requests per minute to prevent provider abuse.
 */
const rateMap = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30;

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateMap.entries()) {
    if (now - record.startTime > WINDOW_MS) {
      rateMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function aiRateLimiter(req, res, next) {
  const identifier = req.user?.id || req.ip || 'anonymous';
  const now = Date.now();

  const record = rateMap.get(identifier);

  if (!record || now - record.startTime > WINDOW_MS) {
    rateMap.set(identifier, { count: 1, startTime: now });
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many AI requests. Please slow down and try again in a moment.'
    });
  }

  record.count++;
  next();
}
