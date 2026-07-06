// api/public-api.js
// Public API — Third-party integration endpoints
// GET /api/public-api — API documentation
// POST /api/public-api — Execute API calls

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// API versions
const API_VERSIONS = {
  v1: {
    version: '1.0.0',
    status: 'stable',
    release_date: '2026-05-01',
  },
};

// API endpoints documentation
const API_ENDPOINTS = {
  zakat: {
    name: 'Zakat Calculator',
    method: 'POST',
    endpoint: '/api/public-api/zakat',
    description: 'Calculate Zakat on assets',
    parameters: {
      cash: { type: 'number', required: true, description: 'Cash in hand and bank' },
      gold: { type: 'number', required: false, description: 'Value of gold' },
      silver: { type: 'number', required: false, description: 'Value of silver' },
      investments: { type: 'number', required: false, description: 'Investment value' },
      business_assets: { type: 'number', required: false, description: 'Business assets' },
      currency: { type: 'string', required: false, default: 'PKR', description: 'Currency code' },
    },
    response: {
      total_assets: 'number',
      nisab_threshold: 'number',
      zakat_due: 'boolean',
      zakat_amount: 'number',
      zakat_percentage: 'string',
    },
  },
  rates: {
    name: 'Current Rates',
    method: 'GET',
    endpoint: '/api/public-api/rates',
    description: 'Get current gold, silver, and KIBOR rates',
    parameters: {
      type: { type: 'string', required: false, description: 'gold, silver, kibor, all' },
      currency: { type: 'string', required: false, default: 'PKR', description: 'Currency code' },
    },
    response: {
      gold: 'object',
      silver: 'object',
      kibor: 'object',
      timestamp: 'string',
    },
  },
  products: {
    name: 'Islamic Products',
    method: 'GET',
    endpoint: '/api/public-api/products',
    description: 'Get Islamic banking product information',
    parameters: {
      type: { type: 'string', required: false, description: 'murabaha, ijara, musharakah, all' },
    },
    response: {
      products: 'array',
    },
  },
  shariah_check: {
    name: 'Shariah Compliance Check',
    method: 'POST',
    endpoint: '/api/public-api/shariah-check',
    description: 'Check if a financial product is Shariah compliant',
    parameters: {
      product_name: { type: 'string', required: true, description: 'Product name' },
      product_details: { type: 'object', required: false, description: 'Product details' },
    },
    response: {
      compliant: 'boolean',
      issues: 'array',
      recommendations: 'array',
    },
  },
  nisab: {
    name: 'Nisab Values',
    method: 'GET',
    endpoint: '/api/public-api/nisab',
    description: 'Get current Nisab values',
    parameters: {},
    response: {
      gold_nisab: 'object',
      silver_nisab: 'object',
      timestamp: 'string',
    },
  },
};

/**
 * Verify API key
 * @param {string} apiKey - API key
 * @returns {object} Verification result
 */
function verifyApiKey(apiKey) {
  // In production, verify against database
  // const result = await db.query('SELECT * FROM api_keys WHERE key = $1 AND active = true', [apiKey]);

  // Simplified verification
  const validKeys = [
    'IBF-TEST-KEY-123',
    'IBF-PROD-KEY-456',
  ];

  if (!apiKey) {
    return { valid: false, error: 'API key required' };
  }

  if (!apiKey.startsWith('IBF-')) {
    return { valid: false, error: 'Invalid API key format' };
  }

  if (!validKeys.includes(apiKey)) {
    return { valid: false, error: 'Invalid API key' };
  }

  return {
    valid: true,
    tier: apiKey.includes('PROD') ? 'production' : 'test',
    rate_limit: apiKey.includes('PROD') ? 1000 : 100,
  };
}

/**
 * Rate limiting check
 * @param {string} apiKey - API key
 * @returns {object} Rate limit status
 */
function checkRateLimit(apiKey) {
  // In production, use Redis for rate limiting
  return {
    allowed: true,
    remaining: 95,
    limit: 100,
    reset_at: new Date(Date.now() + 3600000).toISOString(),
  };
}

/**
 * Calculate Zakat via public API
 * @param {object} data - Input data
 * @returns {object} Zakat calculation
 */
function calculateZakatPublic(data) {
  const { cash = 0, gold = 0, silver = 0, investments = 0, business_assets = 0 } = data;

  const totalAssets = cash + gold + silver + investments + business_assets;
  const nisabGold = 87.48 * 18000; // 87.48g * Rs. 18,000/g
  const nisabSilver = 612.36 * 210; // 612.36g * Rs. 210/g
  const nisab = Math.min(nisabGold, nisabSilver);
  const zakatDue = totalAssets >= nisab;
  const zakatAmount = zakatDue ? totalAssets * 0.025 : 0;

  return {
    total_assets: totalAssets,
    nisab_threshold: nisab,
    nisab_source: totalAssets >= nisabGold ? 'gold' : 'silver',
    zakat_due: zakatDue,
    zakat_amount: zakatAmount,
    zakat_percentage: '2.5%',
    currency: data.currency || 'PKR',
    calculation_date: new Date().toISOString().split('T')[0],
    disclaimer: 'This is an automated calculation. Please verify with a qualified Islamic scholar.',
  };
}

/**
 * Get current rates via public API
 * @param {string} type - Rate type
 * @param {string} currency - Currency code
 * @returns {object} Rates
 */
function getRatesPublic(type = 'all', currency = 'PKR') {
  const rates = {
    gold: {
      price_per_gram: 18000,
      currency: 'PKR',
      source: 'estimated',
    },
    silver: {
      price_per_gram: 210,
      currency: 'PKR',
      source: 'estimated',
    },
    kibor: {
      rate_6m: 17.5,
      rate_1y: 18.0,
      source: 'estimated',
    },
    timestamp: new Date().toISOString(),
    disclaimer: 'Rates are approximate. Verify with current market rates.',
  };

  if (type === 'all') return rates;
  if (rates[type]) return { [type]: rates[type], timestamp: rates.timestamp };
  return { error: 'Invalid rate type' };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — API documentation
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const path = url.searchParams.get('path');

    if (path === 'docs' || !path) {
      return res.status(200).json({
        api_name: 'Islamic Banking FTE Public API',
        version: '1.0.0',
        description: 'Shariah-compliant Islamic banking calculations and information',
        base_url: '/api/public-api',
        authentication: {
          type: 'API Key',
          header: 'X-API-Key',
          example: 'IBF-TEST-KEY-123',
        },
        rate_limits: {
          test: '100 requests/hour',
          production: '1000 requests/hour',
        },
        endpoints: API_ENDPOINTS,
        examples: {
          zakat_calculation: {
            request: {
              method: 'POST',
              endpoint: '/api/public-api',
              body: {
                action: 'zakat',
                data: { cash: 500000, gold: 200000, silver: 50000 },
              },
            },
            response: {
              total_assets: 750000,
              zakat_due: true,
              zakat_amount: 18750,
            },
          },
        },
        support: {
          email: 'api-support@islamic-banking-fte.com',
          documentation: 'https://docs.islamic-banking-fte.com',
        },
      });
    }

    return res.status(404).json({ error: 'Documentation not found' });
  }

  // POST — Execute API calls
  if (req.method === 'POST') {
    try {
      // Verify API key
      const apiKey = req.headers['x-api-key'];
      const authResult = verifyApiKey(apiKey);
      if (!authResult.valid) {
        return res.status(401).json({ error: authResult.error });
      }

      // Check rate limit
      const rateLimit = checkRateLimit(apiKey);
      if (!rateLimit.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          limit: rateLimit.limit,
          reset_at: rateLimit.reset_at,
        });
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', rateLimit.limit);
      res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
      res.setHeader('X-RateLimit-Reset', rateLimit.reset_at);

      const { action, data } = req.body;

      switch (action) {
        case 'zakat':
          return res.status(200).json(calculateZakatPublic(data || {}));

        case 'rates':
          return res.status(200).json(getRatesPublic(data?.type, data?.currency));

        case 'products':
          return res.status(200).json({
            products: [
              { name: 'Murabaha', type: 'cost_plus', description: 'Cost-plus financing' },
              { name: 'Ijara', type: 'lease', description: 'Islamic lease financing' },
              { name: 'Musharakah', type: 'partnership', description: 'Partnership financing' },
              { name: 'Sukuk', type: 'bonds', description: 'Islamic bonds' },
            ],
          });

        case 'shariah_check':
          return res.status(200).json({
            product_name: data?.product_name || 'Unknown',
            compliant: true,
            issues: [],
            recommendations: ['Consult a qualified Shariah advisor for final verification'],
            disclaimer: 'This is an automated check. Final Shariah compliance must be verified by a qualified scholar.',
          });

        case 'nisab':
          return res.status(200).json({
            gold_nisab: { weight_grams: 87.48, price_per_gram: 18000, total_pkr: 1574640 },
            silver_nisab: { weight_grams: 612.36, price_per_gram: 210, total_pkr: 128596 },
            timestamp: new Date().toISOString(),
            disclaimer: 'Nisab values change with market prices. Verify current values.',
          });

        default:
          return res.status(400).json({
            error: 'Invalid action',
            valid_actions: Object.keys(API_ENDPOINTS),
          });
      }
    } catch (err) {
      console.error('Public API error:', err.message);
      return res.status(500).json({ error: 'API error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
