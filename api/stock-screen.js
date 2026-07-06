// api/stock-screen.js
// Shariah Stock Screening Engine — AAOIFI Standards
// POST /api/stock-screen — Screen a stock for Shariah compliance
// GET /api/stock-screen?stock=X — Get screening result

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// AAOIFI Shariah Screening Criteria (simplified)
const SCREENING_CRITERIA = {
  // Sector exclusion (business activity must not be haram)
  excluded_sectors: [
    'conventional_banking',
    'conventional_insurance',
    'alcohol',
    'tobacco',
    'pork',
    'gambling',
    'weapons',
    'adult_entertainment',
    'music_entertainment',
  ],

  // Financial ratio thresholds (AAOIFI)
  financial_thresholds: {
    // Interest-bearing securities / Market cap < 33%
    interest_ratio: 0.33,
    // Debt / Market cap < 33%
    debt_ratio: 0.33,
    // Cash & interest-bearing securities / Market cap < 33%
    cash_ratio: 0.33,
    // Non-permissible income / Total income < 5%
    non_permissible_income_ratio: 0.05,
  },
};

// Stock database (simplified — Pakistan Stock Exchange)
// In production, this would come from a financial data API
const STOCK_DATABASE = {
  // Meezan Bank
  MEBL: {
    name: 'Meezan Bank Limited',
    sector: 'islamic_banking',
    market_cap: 500000000000,
    interest_ratio: 0.02,
    debt_ratio: 0.15,
    cash_ratio: 0.10,
    non_permissible_income: 0.01,
    status: 'halal',
    notes: 'Full Islamic bank — minimal non-permissible activity',
  },
  // Habib Bank (conventional)
  HBL: {
    name: 'Habib Bank Limited',
    sector: 'conventional_banking',
    market_cap: 800000000000,
    interest_ratio: 0.45,
    debt_ratio: 0.40,
    cash_ratio: 0.20,
    non_permissible_income: 0.02,
    status: 'haram',
    notes: 'Conventional banking — interest-based operations',
  },
  // Lucky Cement
  LUCK: {
    name: 'Lucky Cement Limited',
    sector: 'cement',
    market_cap: 300000000000,
    interest_ratio: 0.05,
    debt_ratio: 0.20,
    cash_ratio: 0.08,
    non_permissible_income: 0.03,
    status: 'halal',
    notes: 'Manufacturing company — minimal non-permissible activity',
  },
  // Engro Corporation
  ENGRO: {
    name: 'Engro Corporation Limited',
    sector: 'chemicals',
    market_cap: 400000000000,
    interest_ratio: 0.08,
    debt_ratio: 0.25,
    cash_ratio: 0.12,
    non_permissible_income: 0.04,
    status: 'halal',
    notes: 'Diversified conglomerate — mostly permissible activities',
  },
  // Nestle Pakistan
  NESTLE: {
    name: 'Nestle Pakistan Limited',
    sector: 'food',
    market_cap: 250000000000,
    interest_ratio: 0.03,
    debt_ratio: 0.10,
    cash_ratio: 0.05,
    non_permissible_income: 0.02,
    status: 'halal',
    notes: 'Food manufacturing — permissible business',
  },
  // Pakistan Tobacco Company
  PAKT: {
    name: 'Pakistan Tobacco Company',
    sector: 'tobacco',
    market_cap: 200000000000,
    interest_ratio: 0.02,
    debt_ratio: 0.15,
    cash_ratio: 0.06,
    non_permissible_income: 0.01,
    status: 'haram',
    notes: 'Tobacco production — excluded sector',
  },
  // Murree Brewery
  MURE: {
    name: 'Murree Brewery Company',
    sector: 'alcohol',
    market_cap: 50000000000,
    interest_ratio: 0.04,
    debt_ratio: 0.18,
    cash_ratio: 0.07,
    non_permissible_income: 0.02,
    status: 'haram',
    notes: 'Alcohol production — excluded sector',
  },
  // Dawood Hercules
  DAWH: {
    name: 'Dawood Hercules Corporation',
    sector: 'chemicals',
    market_cap: 150000000000,
    interest_ratio: 0.06,
    debt_ratio: 0.22,
    cash_ratio: 0.09,
    non_permissible_income: 0.03,
    status: 'halal',
    notes: 'Chemical manufacturing — permissible business',
  },
  // Mari Petroleum
  MARI: {
    name: 'Mari Petroleum Company',
    sector: 'oil_gas',
    market_cap: 600000000000,
    interest_ratio: 0.04,
    debt_ratio: 0.12,
    cash_ratio: 0.06,
    non_permissible_income: 0.02,
    status: 'halal',
    notes: 'Oil & gas exploration — permissible business',
  },
  // Oil & Gas Development Company
  OGDC: {
    name: 'Oil & Gas Development Company',
    sector: 'oil_gas',
    market_cap: 900000000000,
    interest_ratio: 0.03,
    debt_ratio: 0.10,
    cash_ratio: 0.05,
    non_permissible_income: 0.01,
    status: 'halal',
    notes: 'Oil & gas — permissible business',
  },
};

/**
 * Screen a stock for Shariah compliance
 * @param {string} ticker - Stock ticker symbol
 * @returns {object} Screening result
 */
function screenStock(ticker) {
  const stock = STOCK_DATABASE[ticker.toUpperCase()];
  if (!stock) {
    return {
      ticker: ticker.toUpperCase(),
      status: 'unknown',
      error: 'Stock not found in database',
      note: 'This stock is not in our screening database. Please consult a Shariah advisor for manual screening.',
    };
  }

  const issues = [];
  const warnings = [];

  // Check sector
  if (SCREENING_CRITERIA.excluded_sectors.includes(stock.sector)) {
    issues.push(`Sector "${stock.sector}" is excluded per AAOIFI standards`);
  }

  // Check financial ratios
  if (stock.interest_ratio > SCREENING_CRITERIA.financial_thresholds.interest_ratio) {
    issues.push(`Interest ratio ${(stock.interest_ratio * 100).toFixed(1)}% exceeds 33% threshold`);
  }
  if (stock.debt_ratio > SCREENING_CRITERIA.financial_thresholds.debt_ratio) {
    issues.push(`Debt ratio ${(stock.debt_ratio * 100).toFixed(1)}% exceeds 33% threshold`);
  }
  if (stock.cash_ratio > SCREENING_CRITERIA.financial_thresholds.cash_ratio) {
    warnings.push(`Cash ratio ${(stock.cash_ratio * 100).toFixed(1)}% is approaching 33% threshold`);
  }
  if (stock.non_permissible_income > SCREENING_CRITERIA.financial_thresholds.non_permissible_income_ratio) {
    issues.push(`Non-permissible income ${(stock.non_permissible_income * 100).toFixed(1)}% exceeds 5% threshold`);
  }

  // Determine final status
  let finalStatus = 'halal';
  if (issues.length > 0) {
    finalStatus = issues.some(i => i.includes('excluded sector')) ? 'haram' : 'doubtful';
  }

  return {
    ticker: ticker.toUpperCase(),
    name: stock.name,
    sector: stock.sector,
    status: finalStatus,
    issues,
    warnings,
    notes: stock.notes,
    financials: {
      interest_ratio: `${(stock.interest_ratio * 100).toFixed(1)}%`,
      debt_ratio: `${(stock.debt_ratio * 100).toFixed(1)}%`,
      cash_ratio: `${(stock.cash_ratio * 100).toFixed(1)}%`,
      non_permissible_income: `${(stock.non_permissible_income * 100).toFixed(1)}%`,
    },
    screening_date: new Date().toISOString().split('T')[0],
    disclaimer: 'This is an automated screening based on AAOIFI standards. For definitive Shariah compliance, consult a qualified Shariah advisor.',
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // 1h cache

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — Screen a stock
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const stock = url.searchParams.get('stock');

    if (!stock) {
      return res.status(400).json({ error: 'Stock ticker required (e.g., ?stock=MEBL)' });
    }

    const result = screenStock(stock);
    return res.status(200).json(result);
  }

  // POST — Screen multiple stocks
  if (req.method === 'POST') {
    try {
      const { stocks } = req.body;
      if (!stocks || !Array.isArray(stocks)) {
        return res.status(400).json({ error: 'Stocks array required' });
      }

      const results = stocks.map(s => screenStock(s));
      const summary = {
        halal: results.filter(r => r.status === 'halal').length,
        haram: results.filter(r => r.status === 'haram').length,
        doubtful: results.filter(r => r.status === 'doubtful').length,
        unknown: results.filter(r => r.status === 'unknown').length,
      };

      return res.status(200).json({ results, summary });
    } catch (err) {
      console.error('Stock screening error:', err.message);
      return res.status(500).json({ error: 'Screening failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
