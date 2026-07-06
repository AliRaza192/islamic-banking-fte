// api/explainable-ai.js
// Explainable AI Engine — Show formula + variables + steps for calculations
// POST /api/explainable-ai — Generate explainable responses

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

/**
 * Generate explainable Zakat calculation
 * @param {object} data - Zakat data
 * @returns {object} Explainable response
 */
function explainZakatCalculation(data) {
  const { cash = 0, gold = 0, silver = 0, investments = 0, business_assets = 0 } = data;
  const total = cash + gold + silver + investments + business_assets;
  const nisabGold = 87.48 * 18000;
  const nisabSilver = 612.36 * 210;
  const nisab = Math.min(nisabGold, nisabSilver);
  const isDue = total >= nisab;
  const zakat = isDue ? total * 0.025 : 0;

  return {
    type: 'zakat_calculation',
    title: 'Zakat Calculation Explanation',
    title_ur: 'زکو٤ة حساب کی وضاحت',
    steps: [
      {
        step: 1,
        title: 'Gather All Assets',
        title_ur: 'تمام اثاثے جمع کریں',
        description: 'Collect all zakatable assets',
        formula: 'Total = Cash + Gold + Silver + Investments + Business Assets',
        values: { cash, gold, silver, investments, business_assets },
        result: `Total = ${cash} + ${gold} + ${silver} + ${investments} + ${business_assets} = ${total}`,
      },
      {
        step: 2,
        title: 'Determine Nisab',
        title_ur: 'نصاب مقرر کریں',
        description: 'Compare with gold and silver Nisab',
        formula: 'Nisab = min(Gold Nisab, Silver Nisab)',
        values: {
          gold_nisab: `${87.48}g × Rs. ${18000}/g = Rs. ${nisabGold}`,
          silver_nisab: `${612.36}g × Rs. ${210}/g = Rs. ${nisabSilver}`,
        },
        result: `Nisab = min(${nisabGold}, ${nisabSilver}) = ${nisab}`,
      },
      {
        step: 3,
        title: 'Check if Zakat is Due',
        title_ur: 'زکو٤ة واجب ہے یا نہیں',
        description: 'Compare total assets with Nisab',
        formula: 'Is Due = Total Assets ≥ Nisab',
        values: { total_assets: total, nisab },
        result: `${total} ≥ ${nisab} = ${isDue ? 'Yes' : 'No'}`,
      },
      {
        step: 4,
        title: 'Calculate Zakat Amount',
        title_ur: 'زکو٤ة کی رقم معلوم کریں',
        description: 'Calculate 2.5% of total assets if due',
        formula: 'Zakat = Total Assets × 2.5%',
        values: { total_assets: total, rate: '2.5%' },
        result: `Zakat = ${total} × 0.025 = ${zakat}`,
      },
    ],
    conclusion: {
      total_assets: total,
      nisab_threshold: nisab,
      zakat_due: isDue,
      zakat_amount: zakat,
      zakat_percentage: '2.5%',
    },
    assumptions: [
      'Gold Nisab: 87.48 grams at Rs. 18,000/gram',
      'Silver Nisab: 612.36 grams at Rs. 210/gram',
      'Zakat rate: 2.5% of total assets',
      'Assets must exceed Nisab for Zakat to be obligatory',
    ],
    data_sources: [
      'AAOIFI FAS-9: Zakat',
      'SBP Islamic Banking Guidelines',
      'Current gold/silver market prices',
    ],
    disclaimer: 'This is an automated calculation. Please verify with a qualified Islamic scholar.',
  };
}

/**
 * Generate explainable Murabaha calculation
 * @param {object} data - Murabaha data
 * @returns {object} Explainable response
 */
function explainMurabahaCalculation(data) {
  const { cost_price = 0, profit_margin = 10, tenure = 24 } = data;
  const selling_price = cost_price * (1 + profit_margin / 100);
  const total_profit = selling_price - cost_price;
  const monthly_payment = selling_price / tenure;

  return {
    type: 'murabaha_calculation',
    title: 'Murabaha Calculation Explanation',
    title_ur: 'مرابحہ حساب کی وضاحت',
    steps: [
      {
        step: 1,
        title: 'Determine Cost Price',
        title_ur: 'لاگت معلوم کریں',
        description: 'Bank purchases asset at cost',
        formula: 'Cost Price = Actual purchase price',
        values: { cost_price },
        result: `Cost Price = Rs. ${cost_price}`,
      },
      {
        step: 2,
        title: 'Apply Profit Margin',
        title_ur: 'منافع کا حساب لگائیں',
        description: 'Add disclosed profit margin',
        formula: 'Selling Price = Cost Price × (1 + Profit Margin/100)',
        values: { cost_price, profit_margin: `${profit_margin}%` },
        result: `Selling Price = ${cost_price} × (1 + ${profit_margin}/100) = ${selling_price}`,
      },
      {
        step: 3,
        title: 'Calculate Total Profit',
        title_ur: 'کل منافع',
        description: 'Bank\'s profit from the transaction',
        formula: 'Total Profit = Selling Price - Cost Price',
        values: { selling_price, cost_price },
        result: `Total Profit = ${selling_price} - ${cost_price} = ${total_profit}`,
      },
      {
        step: 4,
        title: 'Calculate Monthly Payment',
        title_ur: 'ماہانہ قسط',
        description: 'Divide total amount by tenure',
        formula: 'Monthly Payment = Selling Price / Tenure (months)',
        values: { selling_price, tenure: `${tenure} months` },
        result: `Monthly Payment = ${selling_price} / ${tenure} = ${monthly_payment.toFixed(2)}`,
      },
    ],
    conclusion: {
      cost_price,
      profit_margin: `${profit_margin}%`,
      selling_price,
      total_profit,
      monthly_payment: monthly_payment.toFixed(2),
      tenure: `${tenure} months`,
    },
    key_principles: [
      'Bank must own asset before selling to customer',
      'Profit margin must be disclosed to customer',
      'Cost price must be fully transparent',
      'Payment can be lump sum or installments',
    ],
    aaoifi_reference: 'FAS-2: Murabaha and Other Deferred Payment Sales',
    disclaimer: 'This is an automated calculation. Actual terms may vary by bank.',
  };
}

/**
 * Generate explainable response for any calculation
 * @param {string} type - Calculation type
 * @param {object} data - Input data
 * @returns {object} Explainable response
 */
function generateExplainableResponse(type, data) {
  switch (type) {
    case 'zakat':
      return explainZakatCalculation(data);
    case 'murabaha':
      return explainMurabahaCalculation(data);
    default:
      return {
        type: 'generic',
        title: 'Calculation Explanation',
        title_ur: 'حساب کی وضاحت',
        message: 'Explanation not available for this calculation type.',
        message_ur: 'اس قسم کے حساب کے لیے وضاحت دستیاب نہیں ہے۔',
      };
  }
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — Get available explanation types
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Explainable AI Engine API',
      available_types: ['zakat', 'murabaha'],
      actions: ['explain'],
    });
  }

  // POST — Generate explainable response
  if (req.method === 'POST') {
    try {
      const { type, data } = req.body;

      if (!type) {
        return res.status(400).json({ error: 'Calculation type required' });
      }

      const explanation = generateExplainableResponse(type, data || {});
      return res.status(200).json(explanation);
    } catch (err) {
      console.error('Explainable AI error:', err.message);
      return res.status(500).json({ error: 'Explanation generation failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
