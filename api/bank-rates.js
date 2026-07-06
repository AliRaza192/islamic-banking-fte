// api/bank-rates.js
// Live bank profit rates for Islamic banking products
// Source: Bank websites (manual update) + fallback estimates
// Cache: in-memory 12 hours

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Bank profit rates (updated manually — add admin panel later)
// Source: Individual bank websites, SBP reports
// Last updated: July 2026
const BANK_RATES = {
  meezan_bank: {
    name: "Meezan Bank",
    products: {
      car_financing: { rate: 14.5, type: "reducing", benchmark: "KIBOR + 2.5%", updated: "2026-07-01" },
      home_financing: { rate: 15.0, type: "reducing", benchmark: "KIBOR + 3.0%", updated: "2026-07-01" },
      personal_financing: { rate: 16.5, type: "flat", benchmark: "KIBOR + 4.5%", updated: "2026-07-01" },
      business_financing: { rate: 15.5, type: "reducing", benchmark: "KIBOR + 3.5%", updated: "2026-07-01" },
    },
    source: "meezanbank.com",
    reliability: "estimated",
  },
  dubai_islamic: {
    name: "Dubai Islamic Bank",
    products: {
      car_financing: { rate: 14.0, type: "reducing", benchmark: "KIBOR + 2.0%", updated: "2026-07-01" },
      home_financing: { rate: 14.5, type: "reducing", benchmark: "KIBOR + 2.5%", updated: "2026-07-01" },
      personal_financing: { rate: 16.0, type: "flat", benchmark: "KIBOR + 4.0%", updated: "2026-07-01" },
      business_financing: { rate: 15.0, type: "reducing", benchmark: "KIBOR + 3.0%", updated: "2026-07-01" },
    },
    source: "dib.com.pk",
    reliability: "estimated",
  },
  bank_islami: {
    name: "BankIslami",
    products: {
      car_financing: { rate: 14.25, type: "reducing", benchmark: "KIBOR + 2.25%", updated: "2026-07-01" },
      home_financing: { rate: 14.75, type: "reducing", benchmark: "KIBOR + 2.75%", updated: "2026-07-01" },
      personal_financing: { rate: 16.25, type: "flat", benchmark: "KIBOR + 4.25%", updated: "2026-07-01" },
      business_financing: { rate: 15.25, type: "reducing", benchmark: "KIBOR + 3.25%", updated: "2026-07-01" },
    },
    source: "bankislami.com.pk",
    reliability: "estimated",
  },
  al_baraka: {
    name: "Al Baraka Bank",
    products: {
      car_financing: { rate: 14.0, type: "reducing", benchmark: "KIBOR + 2.0%", updated: "2026-07-01" },
      home_financing: { rate: 14.5, type: "reducing", benchmark: "KIBOR + 2.5%", updated: "2026-07-01" },
      personal_financing: { rate: 15.5, type: "flat", benchmark: "KIBOR + 3.5%", updated: "2026-07-01" },
      business_financing: { rate: 14.75, type: "reducing", benchmark: "KIBOR + 2.75%", updated: "2026-07-01" },
    },
    source: "albaraka.com.pk",
    reliability: "estimated",
  },
  faysal_bank: {
    name: "Faysal Bank (Islamic)",
    products: {
      car_financing: { rate: 14.5, type: "reducing", benchmark: "KIBOR + 2.5%", updated: "2026-07-01" },
      home_financing: { rate: 15.0, type: "reducing", benchmark: "KIBOR + 3.0%", updated: "2026-07-01" },
      personal_financing: { rate: 16.5, type: "flat", benchmark: "KIBOR + 4.5%", updated: "2026-07-01" },
      business_financing: { rate: 15.5, type: "reducing", benchmark: "KIBOR + 3.5%", updated: "2026-07-01" },
    },
    source: "faysalbank.com",
    reliability: "estimated",
  },
  Habib_Metropolitan: {
    name: "Habib Metropolitan (Islamic)",
    products: {
      car_financing: { rate: 14.25, type: "reducing", benchmark: "KIBOR + 2.25%", updated: "2026-07-01" },
      home_financing: { rate: 14.75, type: "reducing", benchmark: "KIBOR + 2.75%", updated: "2026-07-01" },
      personal_financing: { rate: 16.0, type: "flat", benchmark: "KIBOR + 4.0%", updated: "2026-07-01" },
      business_financing: { rate: 15.0, type: "reducing", benchmark: "KIBOR + 3.0%", updated: "2026-07-01" },
    },
    source: "habibbank.com",
    reliability: "estimated",
  },
  Askari_Bank: {
    name: "Askari Bank (Islamic)",
    products: {
      car_financing: { rate: 14.5, type: "reducing", benchmark: "KIBOR + 2.5%", updated: "2026-07-01" },
      home_financing: { rate: 15.0, type: "reducing", benchmark: "KIBOR + 3.0%", updated: "2026-07-01" },
      personal_financing: { rate: 16.5, type: "flat", benchmark: "KIBOR + 4.5%", updated: "2026-07-01" },
      business_financing: { rate: 15.5, type: "reducing", benchmark: "KIBOR + 3.5%", updated: "2026-07-01" },
    },
    source: "askaribank.com.pk",
    reliability: "estimated",
  },
  Soneri_Bank: {
    name: "Soneri Bank (Islamic)",
    products: {
      car_financing: { rate: 14.0, type: "reducing", benchmark: "KIBOR + 2.0%", updated: "2026-07-01" },
      home_financing: { rate: 14.5, type: "reducing", benchmark: "KIBOR + 2.5%", updated: "2026-07-01" },
      personal_financing: { rate: 15.5, type: "flat", benchmark: "KIBOR + 3.5%", updated: "2026-07-01" },
      business_financing: { rate: 14.75, type: "reducing", benchmark: "KIBOR + 2.75%", updated: "2026-07-01" },
    },
    source: "soneribank.com.pk",
    reliability: "estimated",
  },
};

// Simple in-memory cache
let _cache = null;
let _cacheTime = 0;
const CACHE_MS = 12 * 60 * 60 * 1000; // 12 hours

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=43200'); // 12h browser cache

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Return cache if fresh
  const now = Date.now();
  if (_cache && (now - _cacheTime) < CACHE_MS) {
    return res.status(200).json({ ..._cache, cached: true });
  }

  // Parse query params
  const url = new URL(req.url, `https://${req.headers.host}`);
  const bank = url.searchParams.get('bank');
  const product = url.searchParams.get('product');

  let response = {
    banks: BANK_RATES,
    updated: new Date().toISOString(),
    source: "Manual update from bank websites",
    reliability: "estimated",
    note: "⚠️ Rates are estimated from bank websites. Verify directly with bank before making decisions.",
    cached: false,
  };

  // Filter by bank if specified
  if (bank && BANK_RATES[bank]) {
    response = {
      bank: BANK_RATES[bank],
      bank_id: bank,
      updated: new Date().toISOString(),
      cached: false,
    };
  }

  // Filter by product if specified
  if (product) {
    const bankData = bank ? BANK_RATES[bank] : BANK_RATES;
    const productRates = {};
    for (const [bankId, data] of Object.entries(bankData)) {
      if (data.products?.[product]) {
        productRates[bankId] = {
          name: data.name,
          rate: data.products[product],
        };
      }
    }
    response = {
      product,
      rates: productRates,
      updated: new Date().toISOString(),
      cached: false,
    };
  }

  _cache = response;
  _cacheTime = now;

  return res.status(200).json(response);
}
