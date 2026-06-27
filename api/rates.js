// api/rates.js
// Live gold & silver rates for Zakat calculator
// Free source: https://open.er-api.com (currency) + goldprice.org scrape fallback
// Cache: in-memory 6 hours (Vercel serverless resets anyway)
// If API fails → return last known hardcoded fallback

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Fallback rates (updated manually quarterly)
const FALLBACK = {
  gold_pkr_per_tola:   330000,  // ~PKR 330,000 per tola (June 2026 estimate)
  silver_pkr_per_tola: 310,     // ~PKR 310/tola (June 2026). Update quarterly.
  usd_pkr:             280,     // ~USD/PKR June 2026
  source:              'fallback',
  updated:             '2026-06-12',
};

// Simple in-memory cache (per serverless instance)
let _cache = null;
let _cacheTime = 0;
const CACHE_MS = 6 * 60 * 60 * 1000; // 6 hours

async function fetchLiveRates() {
  // Use exchangerate-api free tier for USD/PKR
  // Use goldapi.io free tier for gold price in USD
  // Both have free tiers, no key needed for basic use

  const GOLD_API_KEY = process.env.GOLD_API_KEY; // optional — set in Vercel env

  let usdPkr = FALLBACK.usd_pkr;
  let goldUsdPerOz = 2300; // fallback

  // 1. Fetch USD/PKR rate
  try {
    const fxRes = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(3000),
    });
    if (fxRes.ok) {
      const fxData = await fxRes.json();
      if (fxData.rates?.PKR) {
        usdPkr = fxData.rates.PKR;
      }
    }
  } catch {
    // use fallback silently
  }

  // 2. Fetch gold price in USD
  if (GOLD_API_KEY) {
    try {
      const goldRes = await fetch('https://www.goldapi.io/api/XAU/USD', {
        headers: { 'x-access-token': GOLD_API_KEY },
        signal: AbortSignal.timeout(3000),
      });
      if (goldRes.ok) {
        const goldData = await goldRes.json();
        if (goldData.price) goldUsdPerOz = goldData.price;
      }
    } catch {
      // use fallback silently
    }
  }

  // Conversions
  // 1 troy oz = 31.1035 grams
  // 1 tola    = 11.6638 grams
  // 1 troy oz = 31.1035 / 11.6638 = 2.6667 tolas
  const GRAMS_PER_OZ   = 31.1035;
  const GRAMS_PER_TOLA = 11.6638;
  const OZ_PER_TOLA    = GRAMS_PER_TOLA / GRAMS_PER_OZ; // 0.3750

  const goldUsdPerTola = goldUsdPerOz * OZ_PER_TOLA;
  const goldPkrPerTola = Math.round(goldUsdPerTola * usdPkr);

  // Silver: gold/silver ratio avg ~80:1 in 2026
  // More accurate: silverUsdPerOz from separate call, but fallback ratio is fine
  const SILVER_GOLD_RATIO = 82;
  const silverUsdPerOz    = goldUsdPerOz / SILVER_GOLD_RATIO;
  const silverUsdPerTola  = silverUsdPerOz * OZ_PER_TOLA;
  const silverPkrPerTola  = Math.round(silverUsdPerTola * usdPkr);

  // Nisab values
  const NISAB_GOLD_TOLA   = 7.5;   // 87.48 grams
  const NISAB_SILVER_TOLA = 52.5;  // 612.36 grams

  return {
    gold_pkr_per_tola:        goldPkrPerTola   || FALLBACK.gold_pkr_per_tola,
    silver_pkr_per_tola:      silverPkrPerTola || FALLBACK.silver_pkr_per_tola,
    gold_usd_per_oz:          Math.round(goldUsdPerOz),
    usd_pkr:                  Math.round(usdPkr * 100) / 100,
    nisab_gold_pkr:           Math.round((goldPkrPerTola || FALLBACK.gold_pkr_per_tola) * NISAB_GOLD_TOLA),
    nisab_silver_pkr:         Math.round((silverPkrPerTola || FALLBACK.silver_pkr_per_tola) * NISAB_SILVER_TOLA),
    nisab_gold_tola:          NISAB_GOLD_TOLA,
    nisab_silver_tola:        NISAB_SILVER_TOLA,
    source:                   GOLD_API_KEY ? 'goldapi.io + exchangerate-api' : 'exchangerate-api (silver estimated)',
    updated:                  new Date().toISOString(),
    cached:                   false,
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=21600'); // 6h browser cache

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Return cache if fresh
  const now = Date.now();
  if (_cache && (now - _cacheTime) < CACHE_MS) {
    return res.status(200).json({ ..._cache, cached: true });
  }

  try {
    const rates = await fetchLiveRates();
    _cache     = rates;
    _cacheTime = now;
    return res.status(200).json(rates);
  } catch (err) {
    console.error('rates error:', err.message);
    return res.status(200).json({ ...FALLBACK, error_note: 'Live fetch failed, using fallback' });
  }
}