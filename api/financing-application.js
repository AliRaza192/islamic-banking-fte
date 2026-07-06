// api/financing-application.js
// Financing Application Workflow — Murabaha, Ijara applications
// POST /api/financing-application — Manage financing applications

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Application statuses
const APPLICATION_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  DOCUMENTS_PENDING: 'documents_pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DISBURSED: 'disbursed',
  COMPLETED: 'completed',
};

// Financing types
const FINANCING_TYPES = {
  MURABAHA_CAR: {
    name: 'Car Murabaha',
    name_ur: 'گاڑی مرابحہ',
    max_amount: 10000000, // 1 crore
    max_tenure: 84, // 7 years
    required_documents: ['cnic', 'salary_slip', 'bank_statement', 'vehicle_quote'],
    processing_fee: 1, // 1%
  },
  MURABAHA_HOME: {
    name: 'Home Murabaha',
    name_ur: 'گھر مرابحہ',
    max_amount: 50000000, // 5 crore
    max_tenure: 300, // 25 years
    required_documents: ['cnic', 'salary_slip', 'bank_statement', 'property_documents', 'valuation_report'],
    processing_fee: 1,
  },
  IJARA_CAR: {
    name: 'Car Ijara',
    name_ur: 'گاڑی اجارہ',
    max_amount: 10000000,
    max_tenure: 84,
    required_documents: ['cnic', 'salary_slip', 'bank_statement', 'vehicle_quote'],
    processing_fee: 1,
  },
  IJARA_HOME: {
    name: 'Home Ijara',
    name_ur: 'گھر اجارہ',
    max_amount: 50000000,
    max_tenure: 300,
    required_documents: ['cnic', 'salary_slip', 'bank_statement', 'property_documents', 'valuation_report'],
    processing_fee: 1,
  },
  BUSINESS_MURABAHA: {
    name: 'Business Murabaha',
    name_ur: 'کاروباری مرابحہ',
    max_amount: 100000000, // 10 crore
    max_tenure: 60, // 5 years
    required_documents: ['cnic', 'business_registration', 'financial_statements', 'bank_statement', 'invoice_quote'],
    processing_fee: 1.5,
  },
};

/**
 * Generate application ID
 * @returns {string} Application ID
 */
function generateApplicationId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `APP${timestamp}${random}`;
}

/**
 * Validate application data
 * @param {object} data - Application data
 * @returns {object} Validation result
 */
function validateApplication(data) {
  const errors = [];

  if (!data.financing_type || !FINANCING_TYPES[data.financing_type]) {
    errors.push('Invalid financing type');
  }

  if (!data.amount || data.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!data.tenure || data.tenure <= 0) {
    errors.push('Tenure must be greater than 0');
  }

  if (!data.personal_info?.name) {
    errors.push('Name is required');
  }

  if (!data.personal_info?.cnic) {
    errors.push('CNIC is required');
  }

  if (!data.personal_info?.phone) {
    errors.push('Phone number is required');
  }

  // Check if amount exceeds maximum
  if (data.financing_type && FINANCING_TYPES[data.financing_type]) {
    const config = FINANCING_TYPES[data.financing_type];
    if (data.amount > config.max_amount) {
      errors.push(`Amount exceeds maximum of Rs. ${config.max_amount.toLocaleString()}`);
    }
    if (data.tenure > config.max_tenure) {
      errors.push(`Tenure exceeds maximum of ${config.max_tenure} months`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate application details
 * @param {object} data - Application data
 * @returns {object} Calculated details
 */
function calculateApplicationDetails(data) {
  const config = FINANCING_TYPES[data.financing_type];
  if (!config) return null;

  const amount = data.amount;
  const tenure = data.tenure;
  const processingFee = amount * (config.processing_fee / 100);

  // Simplified calculation (Murabaha)
  // In production, use actual profit rates from bank
  const profitRate = 0.15; // 15% assumed rate
  const monthlyRate = profitRate / 12;
  const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1);
  const totalAmount = monthlyPayment * tenure;
  const totalProfit = totalAmount - amount;

  return {
    financing_type: config.name,
    financing_type_ur: config.name_ur,
    requested_amount: amount,
    tenure_months: tenure,
    processing_fee: processingFee,
    monthly_payment: Math.round(monthlyPayment),
    total_amount: Math.round(totalAmount),
    total_profit: Math.round(totalProfit),
    profit_rate: `${(profitRate * 100).toFixed(1)}%`,
    required_documents: config.required_documents,
  };
}

/**
 * Store application in database
 * @param {object} application - Application data
 * @returns {object} Storage result
 */
async function storeApplication(application) {
  // In production, store in database
  // await db.query(
  //   'INSERT INTO financing_applications (id, user_id, type, amount, tenure, status, data, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
  //   [application.id, application.user_id, application.type, application.amount, application.tenure, application.status, JSON.stringify(application)]
  // );

  console.log('Application stored:', {
    id: application.id,
    type: application.type,
    amount: application.amount,
    status: application.status,
  });

  return { success: true, application_id: application.id };
}

/**
 * Get application status
 * @param {string} applicationId - Application ID
 * @returns {object} Application status
 */
async function getApplicationStatus(applicationId) {
  // In production, query database
  // const result = await db.query('SELECT * FROM financing_applications WHERE id = $1', [applicationId]);

  return {
    application_id: applicationId,
    status: APPLICATION_STATUSES.SUBMITTED,
    status_history: [
      { status: APPLICATION_STATUSES.DRAFT, timestamp: new Date().toISOString() },
      { status: APPLICATION_STATUSES.SUBMITTED, timestamp: new Date().toISOString() },
    ],
    estimated_processing_time: '3-5 business days',
    next_steps: [
      'Upload required documents',
      'Wait for review',
      'Receive decision notification',
    ],
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

  // GET — Get application info
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const action = url.searchParams.get('action');
    const applicationId = url.searchParams.get('application_id');

    if (action === 'types') {
      const types = Object.entries(FINANCING_TYPES).map(([key, value]) => ({
        id: key,
        name: value.name,
        name_ur: value.name_ur,
        max_amount: value.max_amount,
        max_tenure: value.max_tenure,
        processing_fee: value.processing_fee,
      }));
      return res.status(200).json({ financing_types: types });
    }

    if (action === 'status' && applicationId) {
      const status = await getApplicationStatus(applicationId);
      return res.status(200).json(status);
    }

    return res.status(200).json({
      message: 'Financing Application API',
      actions: ['calculate', 'submit', 'status', 'types'],
    });
  }

  // POST — Submit or calculate application
  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;

      // Calculate application details
      if (action === 'calculate' && data) {
        const details = calculateApplicationDetails(data);
        if (!details) {
          return res.status(400).json({ error: 'Invalid financing type' });
        }
        return res.status(200).json({ success: true, details });
      }

      // Submit application
      if (action === 'submit' && data) {
        // Validate
        const validation = validateApplication(data);
        if (!validation.valid) {
          return res.status(400).json({ errors: validation.errors });
        }

        // Calculate details
        const details = calculateApplicationDetails(data);

        // Create application
        const application = {
          id: generateApplicationId(),
          user_id: data.user_id,
          type: data.financing_type,
          amount: data.amount,
          tenure: data.tenure,
          status: APPLICATION_STATUSES.SUBMITTED,
          personal_info: data.personal_info,
          details,
          created_at: new Date().toISOString(),
        };

        // Store application
        await storeApplication(application);

        return res.status(200).json({
          success: true,
          application_id: application.id,
          status: application.status,
          details,
          message: 'Application submitted successfully',
          message_ur: 'درخواست کامیابی سے جمع ہو گئی',
          next_steps: [
            'Upload required documents',
            'Wait for review (3-5 business days)',
            'Receive decision via SMS/email',
          ],
        });
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['calculate', 'submit'],
      });
    } catch (err) {
      console.error('Financing application error:', err.message);
      return res.status(500).json({ error: 'Application processing failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
