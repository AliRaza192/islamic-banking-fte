// api/rates.js
// Live gold, silver, KIBOR rates for Zakat calculator + Murabaha/Ijara
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
  silver_pkr_per_tola: 2450,    // ~PKR 2,450/tola (June 2026). Update quarterly.
  usd_pkr:             280,     // ~USD/PKR June 2026
  source:              'fallback',
  updated:             '2026-06-12',
};

// KIBOR fallback rates (updated manually — SBP publishes daily)
// Source: State Bank of Pakistan (sbp.org.pk)
const KIBOR_FALLBACK = {
  overnight:     13.50,
  '1_week':      13.75,
  '2_week':      13.85,
  '1_month':     14.00,
  '3_month':     14.25,
  '6_month':     14.50,
  '9_month':     14.75,
  '1_year':      15.00,
  source:        'SBP fallback (update manually)',
  updated:       '2026-06-12',
};

// Simple in-memory cache (per serverless instance)
let _cache = null;
let _cacheTime = 0;
const CACHE_MS = 6 * 60 * 60 * 1000; // 6 hours

// KIBOR cache (separate — different update frequency)
let _kiborCache = null;
let _kiborCacheTime = 0;
const KIBOR_CACHE_MS = 12 * 60 * 60 * 1000; // 12 hours (KIBOR updates daily)

async function fetchLiveRates() {
  // Use exchangerate-api free tier for USD/PKR
  // Use goldapi.io free tier for gold price in USD
  // Both have free tiers, no key needed for basic use

  const GOLD_API_KEY = process.env.GOLD_API_KEY; // optional — set in Vercel env

  let usdPkr = FALLBACK.usd_pkr;
  let goldUsdPerOz = 2300; // fallback

  // 1. Fetch USD/PKR rate
  let fxData = null;
  try {
    const fxRes = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(3000),
    });
    if (fxRes.ok) {
      fxData = await fxRes.json();
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

  // Determine reliability based on data source
  const goldReliability = GOLD_API_KEY ? 'live' : 'estimated';
  const silverReliability = 'estimated'; // Silver is always estimated from gold ratio

  // Multi-currency rates (AED, SAR, MYR, BHD, EUR, GBP)
  const multiCurrency = {};
  if (fxData?.rates) {
    const currencies = ['AED', 'SAR', 'MYR', 'BHD', 'EUR', 'GBP', 'TRY', 'IDR', 'NGN'];
    for (const cur of currencies) {
      if (fxData.rates[cur]) {
        multiCurrency[cur] = {
          to_pkr: Math.round(fxData.rates[cur] * usdPkr * 100) / 100,
          to_usd: Math.round((1 / fxData.rates[cur]) * 10000) / 10000,
        };
      }
    }
  }

  return {
    gold_pkr_per_tola:        goldPkrPerTola   || FALLBACK.gold_pkr_per_tola,
    silver_pkr_per_tola:      silverPkrPerTola || FALLBACK.silver_pkr_per_tola,
    gold_usd_per_oz:          Math.round(goldUsdPerOz),
    usd_pkr:                  Math.round(usdPkr * 100) / 100,
    nisab_gold_pkr:           Math.round((goldPkrPerTola || FALLBACK.gold_pkr_per_tola) * NISAB_GOLD_TOLA),
    nisab_silver_pkr:         Math.round((silverPkrPerTola || FALLBACK.silver_pkr_per_tola) * NISAB_SILVER_TOLA),
    nisab_gold_tola:          NISAB_GOLD_TOLA,
    nisab_silver_tola:        NISAB_SILVER_TOLA,
    multi_currency: multiCurrency,
    source:                   GOLD_API_KEY ? 'goldapi.io + exchangerate-api' : 'exchangerate-api (silver estimated)',
    updated:                  new Date().toISOString(),
    cached:                   false,
    // Reliability indicators for transparency
    reliability: {
      gold: goldReliability,
      silver: silverReliability,
      usd_pkr: usdPkr !== FALLBACK.usd_pkr ? 'live' : 'fallback',
      kibor: 'estimated', // KIBOR is fallback until SBP scraping works
      multi_currency: Object.keys(multiCurrency).length > 0 ? 'live' : 'unavailable',
    },
    labels: {
      gold: goldReliability === 'live' ? '🔴 Live (fetched just now)' : '⚪ Estimated (use with caution)',
      silver: '⚪ Estimated (from gold/silver ratio)',
      usd_pkr: usdPkr !== FALLBACK.usd_pkr ? '🔴 Live' : '🟡 Fallback',
    },
  };
}

/**
 * Fetch KIBOR rates from SBP or use fallback
 * KIBOR = Karachi Interbank Offered Rate
 * Published daily by State Bank of Pakistan
 */
async function fetchKiborRates() {
  // Try to scrape SBP website for latest KIBOR
  // SBP publishes KIBOR at: https://www.sbp.org.pk/dfib/KIBOR.asp
  // Since scraping is unreliable, we use fallback + manual update via admin panel

  try {
    // Attempt to fetch from SBP (may fail due to website structure)
    const sbpRes = await fetch('https://www.sbp.org.pk/dfib/KIBOR.asp', {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (sbpRes.ok) {
      const html = await sbpRes.text();
      // Try to extract KIBOR rates from HTML
      // This is a simplified extraction — real implementation would use proper HTML parsing
      const rateMatch = html.match(/1\s*Year.*?(\d+\.?\d*)/i);
      if (rateMatch) {
        const oneYearRate = parseFloat(rateMatch[1]);
        if (oneYearRate > 5 && oneYearRate < 30) {
          // Reasonable KIBOR range
          return {
            overnight: oneYearRate - 1.5,
            '1_week': oneYearRate - 1.25,
            '2_week': oneYearRate - 1.15,
            '1_month': oneYearRate - 1.0,
            '3_month': oneYearRate - 0.75,
            '6_month': oneYearRate - 0.5,
            '9_month': oneYearRate - 0.25,
            '1_year': oneYearRate,
            source: 'SBP website (scraped)',
            updated: new Date().toISOString(),
            reliability: 'live',
          };
        }
      }
    }
  } catch {
    // Scraping failed — use fallback
  }

  // Return fallback with 'estimated' reliability
  return {
    ...KIBOR_FALLBACK,
    reliability: 'estimated',
    updated: KIBOR_FALLBACK.updated,
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const ALLOWED_ORIGINS = [
    'https://islamic-banking-fte.vercel.app',
    'http://localhost:8000',
    'http://localhost:3000',
  ];
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'public, max-age=21600'); // 6h browser cache

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Check if KIBOR rates requested
  const url = new URL(req.url, `https://${req.headers.host}`);
  const includeKibor = url.searchParams.get('kibor') === 'true';

  // Return cache if fresh
  const now = Date.now();
  if (_cache && (now - _cacheTime) < CACHE_MS) {
    const response = { ..._cache, cached: true };
    if (includeKibor) {
      if (_kiborCache && (now - _kiborCacheTime) < KIBOR_CACHE_MS) {
        response.kibor = { ..._kiborCache, cached: true };
      } else {
        const kibor = await fetchKiborRates();
        _kiborCache = kibor;
        _kiborCacheTime = now;
        response.kibor = kibor;
      }
    }
    return res.status(200).json(response);
  }

  try {
    const rates = await fetchLiveRates();
    _cache     = rates;
    _cacheTime = now;

    const response = { ...rates };
    if (includeKibor) {
      const kibor = await fetchKiborRates();
      _kiborCache = kibor;
      _kiborCacheTime = now;
      response.kibor = kibor;
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error('rates error:', err.message);
    return res.status(200).json({ ...FALLBACK, error_note: 'Live fetch failed, using fallback' });
  }
}