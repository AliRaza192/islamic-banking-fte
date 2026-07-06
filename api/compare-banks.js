// api/compare-banks.js
// Bank Comparison Engine — Compare Islamic bank products
// POST /api/compare-banks — Compare products across banks

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Bank product database (simplified)
const BANK_PRODUCTS = {
  meezan: {
    name: 'Meezan Bank',
    type: 'Full Islamic Bank',
    products: {
      home: { name: 'Meezan Home Ijara', rate: '14.5-17%', max_tenure: '25 years', processing_fee: '1%', features: ['Diminishing Musharakah', 'Fixed rental rate', 'No prepayment penalty'] },
      car: { name: 'Meezan Car Ijara', rate: '15-18%', max_tenure: '7 years', processing_fee: '1%', features: ['Diminishing Musharakah', 'Balloon payment option', 'Insurance included'] },
      business: { name: 'Meezan Business Murabaha', rate: '16-20%', max_tenure: '5 years', processing_fee: '1.5%', features: ['Cost-plus financing', 'Working capital', 'Trade finance'] },
      savings: { name: 'Meezan Savings Account', rate: '4-6%', min_balance: 'Rs. 100', features: ['Profit-sharing', 'No minimum balance', 'Free debit card'] },
    },
    shariah_board: 'Dr. Muhammad Imran Usmani',
    branches: '1000+',
    app: 'Meezan Mobile Banking',
  },
  Albilad: {
    name: 'Bank Albilad',
    type: 'Full Islamic Bank',
    products: {
      home: { name: 'Albilad Home Ijara', rate: '14-16%', max_tenure: '25 years', processing_fee: '1%', features: ['Murabaha financing', 'Flexible tenure', 'Competitive rates'] },
      car: { name: 'Albilad Car Murabaha', rate: '15-17%', max_tenure: '7 years', processing_fee: '1%', features: ['Cost-plus financing', 'Quick approval', 'No hidden fees'] },
      business: { name: 'Albilad Business Musharakah', rate: '16-19%', max_tenure: '5 years', processing_fee: '1.5%', features: ['Partnership financing', 'Profit-sharing', 'Growth support'] },
      savings: { name: 'Albilad Savings Account', rate: '4-5%', min_balance: 'Rs. 500', features: ['Profit-sharing', 'Free ATM', 'Mobile banking'] },
    },
    shariah_board: 'Shariah Board',
    branches: '500+',
    app: 'Albilad Mobile App',
  },
  Dubai: {
    name: 'Dubai Islamic Bank',
    type: 'Full Islamic Bank',
    products: {
      home: { name: 'DIB Home Ijara', rate: '13.5-16%', max_tenure: '25 years', processing_fee: '1%', features: ['Diminishing Musharakah', 'Competitive rates', 'Flexible tenure'] },
      car: { name: 'DIB Car Ijara', rate: '14.5-17%', max_tenure: '7 years', processing_fee: '1%', features: ['Balloon payment', 'Insurance included', 'Quick approval'] },
      business: { name: 'DIB Business Murabaha', rate: '15-18%', max_tenure: '5 years', processing_fee: '1.5%', features: ['Cost-plus financing', 'Trade finance', 'Working capital'] },
      savings: { name: 'DIB Savings Account', rate: '4-6%', min_balance: 'Rs. 1000', features: ['Profit-sharing', 'Free debit card', 'Mobile banking'] },
    },
    shariah_board: 'Shariah Board',
    branches: '400+',
    app: 'DIB Mobile',
  },
  Faysal: {
    name: 'Faysal Bank',
    type: 'Islamic Banking Window',
    products: {
      home: { name: 'Faysal Home Ijara', rate: '14-17%', max_tenure: '25 years', processing_fee: '1%', features: ['Diminishing Musharakah', 'Competitive rates', 'Flexible tenure'] },
      car: { name: 'Faysal Car Ijara', rate: '15-18%', max_tenure: '7 years', processing_fee: '1%', features: ['Balloon payment', 'Insurance included', 'Quick approval'] },
      business: { name: 'Faysal Business Murabaha', rate: '16-19%', max_tenure: '5 years', processing_fee: '1.5%', features: ['Cost-plus financing', 'Trade finance', 'Working capital'] },
      savings: { name: 'Faysal Savings Account', rate: '4-5%', min_balance: 'Rs. 500', features: ['Profit-sharing', 'Free ATM', 'Mobile banking'] },
    },
    shariah_board: 'Shariah Board',
    branches: '600+',
    app: 'Faysal Mobile',
  },
  HBL: {
    name: 'HBL Islamic Banking',
    type: 'Islamic Banking Window',
    products: {
      home: { name: 'HBL Home Ijara', rate: '14-17%', max_tenure: '25 years', processing_fee: '1%', features: ['Diminishing Musharakah', 'Competitive rates', 'Flexible tenure'] },
      car: { name: 'HBL Car Ijara', rate: '15-18%', max_tenure: '7 years', processing_fee: '1%', features: ['Balloon payment', 'Insurance included', 'Quick approval'] },
      business: { name: 'HBL Business Murabaha', rate: '16-19%', max_tenure: '5 years', processing_fee: '1.5%', features: ['Cost-plus financing', 'Trade finance', 'Working capital'] },
      savings: { name: 'HBL Savings Account', rate: '4-5%', min_balance: 'Rs. 500', features: ['Profit-sharing', 'Free ATM', 'Mobile banking'] },
    },
    shariah_board: 'Shariah Board',
    branches: '1500+',
    app: 'HBL Mobile',
  },
};

/**
 * Compare banks for a specific product
 * @param {string} productType - home, car, business, savings
 * @param {string[]} banks - Optional list of banks to compare (default: all)
 * @returns {object} Comparison result
 */
function compareBanks(productType, banks = null) {
  const availableBanks = banks || Object.keys(BANK_PRODUCTS);
  const comparisons = [];

  for (const bankKey of availableBanks) {
    const bank = BANK_PRODUCTS[bankKey];
    if (!bank || !bank.products[productType]) continue;

    const product = bank.products[productType];
    comparisons.push({
      bank: bank.name,
      bank_type: bank.type,
      product_name: product.name,
      rate: product.rate,
      max_tenure: product.max_tenure,
      processing_fee: product.processing_fee,
      features: product.features,
      shariah_board: bank.shariah_board,
      branches: bank.branches,
      app: bank.app,
    });
  }

  // Sort by rate (lowest first)
  comparisons.sort((a, b) => {
    const rateA = parseFloat(a.rate.split('-')[0]);
    const rateB = parseFloat(b.rate.split('-')[0]);
    return rateA - rateB;
  });

  return {
    product_type: productType,
    banks_compared: comparisons.length,
    comparisons,
    recommendation: comparisons.length > 0 ? comparisons[0].bank : null,
    disclaimer: 'This is a simplified comparison based on publicly available information. Actual rates and terms may vary. Please verify with each bank directly.',
    comparison_date: new Date().toISOString().split('T')[0],
  };
}

/**
 * Get all products for a specific bank
 * @param {string} bankKey - Bank key (meezan, albilad, dubai, faysal, hbl)
 * @returns {object} Bank details
 */
function getBankProducts(bankKey) {
  const bank = BANK_PRODUCTS[bankKey];
  if (!bank) {
    return { error: 'Bank not found', available_banks: Object.keys(BANK_PRODUCTS) };
  }
  return { bank_key: bankKey, ...bank };
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

  // GET — Get bank products
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const bank = url.searchParams.get('bank');

    if (bank) {
      const result = getBankProducts(bank);
      return res.status(200).json(result);
    }

    // Return all banks
    return res.status(200).json({ banks: Object.keys(BANK_PRODUCTS).map(k => ({ key: k, name: BANK_PRODUCTS[k].name })) });
  }

  // POST — Compare banks
  if (req.method === 'POST') {
    try {
      const { product_type, banks } = req.body;
      if (!product_type) {
        return res.status(400).json({ error: 'Product type required (home, car, business, savings)' });
      }

      const result = compareBanks(product_type, banks);
      return res.status(200).json(result);
    } catch (err) {
      console.error('Bank comparison error:', err.message);
      return res.status(500).json({ error: 'Comparison failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
