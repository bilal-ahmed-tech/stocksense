import rateLimit from "express-rate-limit";

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: "Too many attempts. Please try again in 15 minutes.",
    });
  },
});

export const refreshRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,                  // 20 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: "Too many requests. Please try again shortly.",
    });
  },
});