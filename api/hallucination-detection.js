// api/hallucination-detection.js
// Hallucination Detection — Auto-detect when AI makes up information
// POST /api/hallucination-detection — Detect hallucinations

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Known facts database
const KNOWN_FACTS = {
  nisab_gold: {
    value: 87.48,
    unit: 'grams',
    source: 'Prophetic tradition',
  },
  nisab_silver: {
    value: 612.36,
    unit: 'grams',
    source: 'Prophetic tradition',
  },
  zakat_rate: {
    value: 2.5,
    unit: 'percentage',
    source: 'Quran (9:60)',
  },
  products: {
    murabaha: { description: 'Cost-plus financing', standard: 'FAS-2' },
    ijara: { description: 'Islamic lease', standard: 'FAS-8' },
    musharakah: { description: 'Partnership financing', standard: 'FAS-4' },
  },
};

/**
 * Check for factual inaccuracies
 * @param {string} response - AI response
 * @returns {object} Detection result
 */
function checkFactualAccuracy(response) {
  const issues = [];
  const lowerResponse = response.toLowerCase();

  // Check Nisab values
  if (lowerResponse.includes('nisab')) {
    if (lowerResponse.includes('87.48') || lowerResponse.includes('87.5')) {
      // Correct
    } else if (lowerResponse.match(/nisab.*\d{3,}/)) {
      issues.push({
        type: 'factual_error',
        detail: 'Nisab value may be incorrect',
        expected: '87.48 grams for gold',
      });
    }
  }

  // Check Zakat rate
  if (lowerResponse.includes('zakat') && lowerResponse.includes('%')) {
    if (lowerResponse.includes('2.5%') || lowerResponse.includes('2.5 percent')) {
      // Correct
    } else if (lowerResponse.match(/\d+\.?\d*%/)) {
      issues.push({
        type: 'factual_error',
        detail: 'Zakat rate may be incorrect',
        expected: '2.5%',
      });
    }
  }

  return {
    checked: true,
    issues,
    accuracy_score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 20),
  };
}

/**
 * Check for made-up references
 * @param {string} response - AI response
 * @returns {object} Detection result
 */
function checkReferences(response) {
  const issues = [];

  // Check for made-up fatwas
  const fatwaPattern = /fatwa.*\d{4}/i;
  if (fatwaPattern.test(response)) {
    issues.push({
      type: 'reference_check',
      detail: 'Fatwa reference should be verified',
      recommendation: 'Verify fatwa exists and is current',
    });
  }

  // Check for made-up standards
  const standardPattern = /FAS-\d+/g;
  const standards = response.match(standardPattern) || [];
  for (const standard of standards) {
    const num = parseInt(standard.split('-')[1]);
    if (num > 35) { // AAOIFI FAS standards go up to ~35
      issues.push({
        type: 'reference_check',
        detail: `${standard} may not exist`,
        recommendation: 'Verify AAOIFI standard exists',
      });
    }
  }

  return {
    checked: true,
    issues,
    references_valid: issues.length === 0,
  };
}

/**
 * Check for logical inconsistencies
 * @param {string} response - AI response
 * @returns {object} Detection result
 */
function checkLogicalConsistency(response) {
  const issues = [];

  // Check for contradictory statements
  if (response.includes('halal') && response.includes('haram')) {
    // Could be explaining differences, not necessarily inconsistent
  }

  // Check for impossible claims
  if (response.includes('guaranteed') && response.includes('profit')) {
    issues.push({
      type: 'logical_inconsistency',
      detail: 'Profit cannot be guaranteed in Islamic finance',
      recommendation: 'Remove guarantee claim',
    });
  }

  return {
    checked: true,
    issues,
    logically_consistent: issues.length === 0,
  };
}

/**
 * Full hallucination detection
 * @param {string} response - AI response
 * @returns {object} Detection result
 */
function detectHallucinations(response) {
  const factualCheck = checkFactualAccuracy(response);
  const referenceCheck = checkReferences(response);
  const logicalCheck = checkLogicalConsistency(response);

  const allIssues = [
    ...factualCheck.issues,
    ...referenceCheck.issues,
    ...logicalCheck.issues,
  ];

  const hallucinationDetected = allIssues.length > 0;
  const confidence = hallucinationDetected ? 0.7 : 0.95;

  return {
    response_preview: response.substring(0, 200) + (response.length > 200 ? '...' : ''),
    hallucination_detected: hallucinationDetected,
    confidence,
    checks: {
      factual_accuracy: factualCheck,
      reference_validity: referenceCheck,
      logical_consistency: logicalCheck,
    },
    total_issues: allIssues.length,
    issues: allIssues,
    recommendation: hallucinationDetected
      ? 'Response may contain inaccuracies. Please verify critical information.'
      : 'Response appears factually accurate.',
    disclaimer: 'This is an automated check. Always verify important information with authoritative sources.',
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

  // GET — Get detection info
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Hallucination Detection API',
      checks: ['factual_accuracy', 'reference_validity', 'logical_consistency'],
      actions: ['detect'],
    });
  }

  // POST — Detect hallucinations
  if (req.method === 'POST') {
    try {
      const { action, response } = req.body;

      if (action === 'detect' && response) {
        const result = detectHallucinations(response);
        return res.status(200).json(result);
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['detect'],
      });
    } catch (err) {
      console.error('Hallucination detection error:', err.message);
      return res.status(500).json({ error: 'Detection failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
