// api/banking-integration.js
// Banking API Integration — Open Banking APIs, eligibility, financing status
// POST /api/banking-integration — Banking operations

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Supported banks
const SUPPORTED_BANKS = {
  meezan: {
    name: 'Meezan Bank',
    api_available: true,
    endpoints: {
      eligibility: '/api/v1/eligibility',
      financing_status: '/api/v1/financing/status',
      account_balance: '/api/v1/account/balance',
    },
  },
  Albilad: {
    name: 'Bank Albilad',
    api_available: true,
    endpoints: {
      eligibility: '/api/v1/eligibility',
      financing_status: '/api/v1/financing/status',
    },
  },
  Dubai: {
    name: 'Dubai Islamic Bank',
    api_available: false,
    endpoints: {},
  },
  HBL: {
    name: 'HBL Islamic Banking',
    api_available: true,
    endpoints: {
      eligibility: '/api/v1/eligibility',
    },
  },
};

/**
 * Check eligibility
 * @param {object} data - Applicant data
 * @returns {object} Eligibility result
 */
function checkEligibility(data) {
  const { monthly_income, age, employment_status, existing_loans = 0 } = data;

  // Simplified eligibility check
  let eligible = true;
  const reasons = [];

  if (!monthly_income || monthly_income < 50000) {
    eligible = false;
    reasons.push('Minimum monthly income of Rs. 50,000 required');
  }

  if (!age || age < 21 || age > 65) {
    eligible = false;
    reasons.push('Age must be between 21 and 65');
  }

  if (!employment_status) {
    eligible = false;
    reasons.push('Employment status required');
  }

  // Calculate maximum financing based on income
  const max_financing = eligible ? monthly_income * 60 : 0; // 5 years of income
  const estimated_monthly = eligible ? max_financing / 60 : 0;

  return {
    eligible,
    reasons,
    maximum_financing: max_financing,
    estimated_monthly_payment: estimated_monthly,
    tenure: '60 months',
    conditions: eligible ? [
      'Subject to credit assessment',
      'Property valuation (for home financing)',
      'Document verification',
    ] : [],
  };
}

/**
 * Get financing status
 * @param {string} applicationId - Application ID
 * @returns {object} Financing status
 */
function getFinancingStatus(applicationId) {
  // In production, query actual bank API
  return {
    application_id: applicationId,
    status: 'under_review',
    status_ur: 'جائزہ ہو رہا ہے',
    progress: 65,
    stages: [
      { name: 'Application Submitted', status: 'completed', date: '2026-05-01' },
      { name: 'Document Verification', status: 'completed', date: '2026-05-03' },
      { name: 'Credit Assessment', status: 'in_progress', date: '2026-05-05' },
      { name: 'Shariah Review', status: 'pending', date: null },
      { name: 'Final Approval', status: 'pending', date: null },
      { name: 'Disbursement', status: 'pending', date: null },
    ],
    estimated_completion: '2026-05-15',
    next_step: 'Credit assessment in progress',
    next_step_ur: 'کریڈٹ جائزہ جاری ہے',
  };
}

/**
 * Get account balance
 * @param {string} accountNumber - Account number
 * @returns {object} Account balance
 */
function getAccountBalance(accountNumber) {
  // In production, query actual bank API
  return {
    account_number: accountNumber.replace(/.(?=.{4})/g, '*'),
    balance: 1250000,
    currency: 'PKR',
    available_balance: 1200000,
    hold_amount: 50000,
    last_updated: new Date().toISOString(),
  };
}

/**
 * Get bank products
 * @param {string} bankKey - Bank key
 * @returns {Array} Bank products
 */
function getBankProducts(bankKey) {
  const bank = SUPPORTED_BANKS[bankKey];
  if (!bank) {
    return [];
  }

  return [
    { name: 'Home Financing', type: 'ijara', max_amount: 50000000 },
    { name: 'Car Financing', type: 'murabaha', max_amount: 10000000 },
    { name: 'Business Financing', type: 'murabaha', max_amount: 100000000 },
    { name: 'Savings Account', type: 'mudarabah', min_balance: 100 },
  ];
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — Get banking info
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const action = url.searchParams.get('action');
    const bank = url.searchParams.get('bank');

    if (action === 'banks') {
      const banks = Object.entries(SUPPORTED_BANKS).map(([key, value]) => ({
        key,
        name: value.name,
        api_available: value.api_available,
      }));
      return res.status(200).json({ banks });
    }

    if (action === 'products' && bank) {
      const products = getBankProducts(bank);
      return res.status(200).json({ bank, products });
    }

    if (action === 'status' && url.searchParams.get('application_id')) {
      const status = getFinancingStatus(url.searchParams.get('application_id'));
      return res.status(200).json(status);
    }

    return res.status(200).json({
      message: 'Banking API Integration',
      actions: ['eligibility', 'status', 'balance', 'banks', 'products'],
    });
  }

  // POST — Banking operations
  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;

      if (action === 'eligibility' && data) {
        const result = checkEligibility(data);
        return res.status(200).json(result);
      }

      if (action === 'status' && data?.application_id) {
        const status = getFinancingStatus(data.application_id);
        return res.status(200).json(status);
      }

      if (action === 'balance' && data?.account_number) {
        const balance = getAccountBalance(data.account_number);
        return res.status(200).json(balance);
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['eligibility', 'status', 'balance'],
      });
    } catch (err) {
      console.error('Banking integration error:', err.message);
      return res.status(500).json({ error: 'Banking operation failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
