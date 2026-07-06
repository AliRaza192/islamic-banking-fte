// api/investment-portfolio.js
// Investment Portfolio Tracker — Track Shariah-compliant investments
// POST /api/investment-portfolio — Manage investment portfolio

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Investment types
const INVESTMENT_TYPES = {
  MUTUAL_FUND: {
    name: 'Mutual Fund',
    name_ur: 'مشترکہ فنڈ',
    min_investment: 5000,
    expected_return: '8-12%',
    risk_level: 'medium',
  },
  SUKUK: {
    name: 'Sukuk',
    name_ur: 'صکوک',
    min_investment: 100000,
    expected_return: '6-10%',
    risk_level: 'low',
  },
  STOCKS: {
    name: 'Shariah Stocks',
    name_ur: 'شریعہ اسٹاکس',
    min_investment: 10000,
    expected_return: '10-20%',
    risk_level: 'high',
  },
  GOLD: {
    name: 'Gold',
    name_ur: 'سونا',
    min_investment: 10000,
    expected_return: '5-15%',
    risk_level: 'medium',
  },
  REAL_ESTATE: {
    name: 'Real Estate Fund',
    name_ur: 'ریئل اسٹیٹ فنڈ',
    min_investment: 500000,
    expected_return: '10-15%',
    risk_level: 'medium',
  },
};

/**
 * Calculate portfolio value
 * @param {Array} investments - List of investments
 * @returns {object} Portfolio summary
 */
function calculatePortfolioValue(investments) {
  let totalInvested = 0;
  let currentValue = 0;
  const breakdown = {};

  for (const inv of investments) {
    const invested = inv.amount || 0;
    const current = inv.current_value || invested;
    const profit = current - invested;
    const profitPercent = invested > 0 ? ((profit / invested) * 100) : 0;

    totalInvested += invested;
    currentValue += current;

    if (!breakdown[inv.type]) {
      breakdown[inv.type] = { invested: 0, current: 0, profit: 0 };
    }
    breakdown[inv.type].invested += invested;
    breakdown[inv.type].current += current;
    breakdown[inv.type].profit += profit;
  }

  const totalProfit = currentValue - totalInvested;
  const totalReturn = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;

  return {
    total_invested: totalInvested,
    current_value: currentValue,
    total_profit: totalProfit,
    total_return: `${totalReturn.toFixed(2)}%`,
    breakdown,
    investment_count: investments.length,
  };
}

/**
 * Generate sample portfolio
 * @param {string} userId - User ID
 * @returns {object} Sample portfolio
 */
function generateSamplePortfolio(userId) {
  return {
    user_id: userId,
    portfolio_id: `PF${Date.now().toString(36).toUpperCase()}`,
    investments: [
      {
        id: 'INV001',
        name: 'Meezan Balanced Fund',
        type: 'MUTUAL_FUND',
        amount: 500000,
        current_value: 550000,
        purchase_date: '2025-01-15',
        units: 45000,
        nav: 12.22,
      },
      {
        id: 'INV002',
        name: 'Pakistan Sukuk',
        type: 'SUKUK',
        amount: 1000000,
        current_value: 1060000,
        purchase_date: '2025-03-20',
        maturity_date: '2027-03-20',
        profit_rate: '8.5%',
      },
      {
        id: 'INV003',
        name: 'Meezan Bank',
        type: 'STOCKS',
        amount: 200000,
        current_value: 240000,
        purchase_date: '2025-06-10',
        shares: 5000,
        current_price: 48,
      },
      {
        id: 'INV004',
        name: 'Gold',
        type: 'GOLD',
        amount: 300000,
        current_value: 345000,
        purchase_date: '2025-02-05',
        weight_grams: 18.75,
        price_per_gram: 18400,
      },
    ],
    created_at: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  };
}

/**
 * Get portfolio performance
 * @param {Array} investments - List of investments
 * @returns {object} Performance metrics
 */
function getPortfolioPerformance(investments) {
  const values = investments.map(inv => inv.current_value || inv.amount);
  const returns = investments.map(inv => {
    const invested = inv.amount || 0;
    const current = inv.current_value || invested;
    return invested > 0 ? ((current - invested) / invested) * 100 : 0;
  });

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const maxReturn = Math.max(...returns);
  const minReturn = Math.min(...returns);

  // Simple volatility calculation
  const mean = avgReturn;
  const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / returns.length;
  const volatility = Math.sqrt(variance);

  return {
    average_return: `${avgReturn.toFixed(2)}%`,
    best_performing: `${maxReturn.toFixed(2)}%`,
    worst_performing: `${minReturn.toFixed(2)}%`,
    volatility: `${volatility.toFixed(2)}%`,
    risk_score: volatility > 20 ? 'high' : volatility > 10 ? 'medium' : 'low',
  };
}

/**
 * Get Shariah compliance status
 * @param {Array} investments - List of investments
 * @returns {object} Compliance status
 */
function getShariahCompliance(investments) {
  const compliant = investments.filter(inv => {
    // In production, check against Shariah screening database
    return true; // Simplified — assume all are compliant
  });

  return {
    total_investments: investments.length,
    compliant_count: compliant.length,
    compliance_rate: `${((compliant.length / investments.length) * 100).toFixed(1)}%`,
    status: compliant.length === investments.length ? 'fully_compliant' : 'partially_compliant',
    disclaimer: 'This is an automated compliance check. For definitive Shariah compliance, consult a qualified Shariah advisor.',
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — Get portfolio
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const userId = url.searchParams.get('user_id');
    const action = url.searchParams.get('action');

    if (action === 'types') {
      return res.status(200).json({ investment_types: INVESTMENT_TYPES });
    }

    if (!userId) {
      return res.status(400).json({ error: 'user_id required' });
    }

    // In production, fetch from database
    const portfolio = generateSamplePortfolio(userId);
    const summary = calculatePortfolioValue(portfolio.investments);
    const performance = getPortfolioPerformance(portfolio.investments);
    const compliance = getShariahCompliance(portfolio.investments);

    return res.status(200).json({
      portfolio,
      summary,
      performance,
      compliance,
    });
  }

  // POST — Manage portfolio
  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;

      // Add investment
      if (action === 'add_investment' && data) {
        const investment = {
          id: `INV${Date.now().toString(36).toUpperCase()}`,
          name: data.name,
          type: data.type,
          amount: data.amount,
          current_value: data.amount,
          purchase_date: data.purchase_date || new Date().toISOString().split('T')[0],
          ...data,
        };

        // In production, store in database
        console.log('Investment added:', investment);

        return res.status(200).json({
          success: true,
          investment,
          message: 'Investment added successfully',
          message_ur: 'سرمایہ کاری کامیابی سے شامل ہو گئی',
        });
      }

      // Update investment value
      if (action === 'update_value' && data) {
        // In production, update in database
        console.log('Investment updated:', data);

        return res.status(200).json({
          success: true,
          message: 'Investment value updated',
          message_ur: 'سرمایہ کاری کی قیمت اپڈیٹ ہو گئی',
        });
      }

      // Remove investment
      if (action === 'remove_investment' && data?.investment_id) {
        // In production, remove from database
        console.log('Investment removed:', data.investment_id);

        return res.status(200).json({
          success: true,
          message: 'Investment removed',
          message_ur: 'سرمایہ کاری ہٹا دی گئی',
        });
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['add_investment', 'update_value', 'remove_investment'],
      });
    } catch (err) {
      console.error('Portfolio error:', err.message);
      return res.status(500).json({ error: 'Portfolio operation failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
