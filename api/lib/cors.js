// api/lib/cors.js
// Shared CORS utility — single source of truth for allowed origins

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

/**
 * Set CORS headers on response
 * @param {Request} req
 * @param {Response} res
 * @param {string} [methods='GET, OPTIONS'] - Allowed HTTP methods
 */
export function setCors(req, res, methods = 'GET, OPTIONS') {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}
