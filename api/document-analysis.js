// api/document-analysis.js
// AI Document Clause Analysis — Upload contract → clause-by-clause Shariah check
// POST /api/document-analysis — Analyze document clauses

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Shariah compliance criteria for clauses
const SHARIAH_CRITERIA = {
  INTEREST: {
    name: 'Interest (Riba)',
    name_ur: 'ربا',
    keywords: ['interest', 'interest rate', 'markup', 'finance charge'],
    status: 'prohibited',
  },
  UNCERTAINTY: {
    name: 'Uncertainty (Gharar)',
    name_ur: 'غرر',
    keywords: ['uncertain', 'undetermined', 'unknown', 'conditional'],
    status: 'prohibited',
  },
  GAMBLING: {
    name: 'Gambling (Maysir)',
    name_ur: 'میسر',
    keywords: ['gambling', 'speculation', 'lottery', 'bet'],
    status: 'prohibited',
  },
  PENALTY: {
    name: 'Penalty Clauses',
    name_ur: 'جزا کلوز',
    keywords: ['penalty', 'late fee', 'fine', 'penalty interest'],
    status: 'review',
  },
  INSURANCE: {
    name: 'Insurance (Non-Takaful)',
    name_ur: '.insurance',
    keywords: ['insurance', 'premium', 'coverage', 'claim'],
    status: 'review',
  },
};

/**
 * Analyze a clause for Shariah compliance
 * @param {string} clause - Clause text
 * @returns {object} Analysis result
 */
function analyzeClause(clause) {
  const lowerClause = clause.toLowerCase();
  const issues = [];
  let status = 'compliant';

  for (const [key, criteria] of Object.entries(SHARIAH_CRITERIA)) {
    const foundKeywords = criteria.keywords.filter(keyword =>
      lowerClause.includes(keyword.toLowerCase())
    );

    if (foundKeywords.length > 0) {
      issues.push({
        criterion: criteria.name,
        criterion_ur: criteria.name_ur,
        status: criteria.status,
        found_keywords: foundKeywords,
      });

      if (criteria.status === 'prohibited') {
        status = 'non_compliant';
      } else if (criteria.status === 'review' && status !== 'non_compliant') {
        status = 'requires_review';
      }
    }
  }

  return {
    clause: clause.substring(0, 200) + (clause.length > 200 ? '...' : ''),
    status,
    issues,
    recommendation: status === 'compliant'
      ? 'This clause appears Shariah compliant'
      : status === 'non_compliant'
        ? 'This clause may violate Shariah principles. Consult a Shariah advisor.'
        : 'This clause requires review by a Shariah advisor.',
  };
}

/**
 * Analyze full document
 * @param {string} text - Document text
 * @returns {object} Analysis result
 */
function analyzeDocument(text) {
  // Split into clauses (simplified)
  const clauses = text.split(/\n\n+/).filter(clause => clause.trim().length > 20);

  const results = clauses.map(clause => analyzeClause(clause));

  const compliant = results.filter(r => r.status === 'compliant').length;
  const nonCompliant = results.filter(r => r.status === 'non_compliant').length;
  const review = results.filter(r => r.status === 'requires_review').length;

  let overallStatus = 'compliant';
  if (nonCompliant > 0) overallStatus = 'non_compliant';
  else if (review > 0) overallStatus = 'requires_review';

  return {
    total_clauses: clauses.length,
    compliant_clauses: compliant,
    non_compliant_clauses: nonCompliant,
    review_required: review,
    overall_status: overallStatus,
    compliance_percentage: Math.round((compliant / clauses.length) * 100),
    clause_results: results,
    disclaimer: 'This is an automated analysis. Please consult a qualified Shariah advisor for definitive compliance assessment.',
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

  // GET — Get analysis criteria
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Document Analysis API',
      criteria: SHARIAH_CRITERIA,
      actions: ['analyze'],
    });
  }

  // POST — Analyze document
  if (req.method === 'POST') {
    try {
      const { action, text, clauses } = req.body;

      if (action === 'analyze' && text) {
        const result = analyzeDocument(text);
        return res.status(200).json(result);
      }

      if (action === 'analyze_clause' && clauses) {
        const results = Array.isArray(clauses)
          ? clauses.map(clause => analyzeClause(clause))
          : [analyzeClause(clauses)];
        return res.status(200).json({ results });
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['analyze', 'analyze_clause'],
      });
    } catch (err) {
      console.error('Document analysis error:', err.message);
      return res.status(500).json({ error: 'Analysis failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
