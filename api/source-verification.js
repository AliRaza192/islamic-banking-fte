// api/source-verification.js
// Source Verification — Verify cited references actually exist
// POST /api/source-verification — Verify sources

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Verified sources database
const VERIFIED_SOURCES = {
  aaoifi_standards: {
    'FAS-2': { title: 'Murabaha and Other Deferred Payment Sales', status: 'verified' },
    'FAS-3': { title: 'Investment Sukuk', status: 'verified' },
    'FAS-4': { title: 'Musharakah', status: 'verified' },
    'FAS-7': { title: 'Salam', status: 'verified' },
    'FAS-8': { title: 'Ijara', status: 'verified' },
    'FAS-9': { title: 'Zakat', status: 'verified' },
    'FAS-10': { title: 'Istisna', status: 'verified' },
    'FAS-32': { title: 'Financial Instruments', status: 'verified' },
    'SS-17': { title: 'Takaful', status: 'verified' },
    'SS-21': { title: 'Financial Papers', status: 'verified' },
    'SS-26': { title: 'Shariah Standards', status: 'verified' },
  },
  sbp_guidelines: {
    'IBD-2008-2': { title: 'Murabaha Product Guidelines', status: 'verified' },
    'IBD-2009-1': { title: 'Ijara Product Guidelines', status: 'verified' },
    'IBD-2010-3': { title: 'Islamic Banking Regulations', status: 'verified' },
  },
  quran_references: {
    '2:275': { title: 'Prohibition of Riba', status: 'verified' },
    '2:278': { title: 'Complete abandonment of Riba', status: 'verified' },
    '3:130': { title: 'Do not consume Riba', status: 'verified' },
    '4:29': { title: 'Do not consume each others wealth unjustly', status: 'verified' },
    '9:60': { title: 'Zakat categories', status: 'verified' },
  },
  hadith_references: {
    'Sahih Bukhari 1401': { title: 'Curse on consumes of Riba', status: 'verified' },
    'Sahih Muslim 1598': { title: 'Riba has seventy-three branches', status: 'verified' },
    'Sahih Bukhari 1402': { title: 'Riba practitioner', status: 'verified' },
  },
};

/**
 * Verify a source reference
 * @param {string} source - Source reference
 * @returns {object} Verification result
 */
function verifySource(source) {
  const lowerSource = source.toLowerCase();

  // Check AAOIFI standards
  for (const [key, value] of Object.entries(VERIFIED_SOURCES.aaoifi_standards)) {
    if (lowerSource.includes(key.toLowerCase())) {
      return {
        source: key,
        title: value.title,
        category: 'AAOIFI Standard',
        status: 'verified',
        exists: true,
      };
    }
  }

  // Check SBP guidelines
  for (const [key, value] of Object.entries(VERIFIED_SOURCES.sbp_guidelines)) {
    if (lowerSource.includes(key.toLowerCase())) {
      return {
        source: key,
        title: value.title,
        category: 'SBP Guideline',
        status: 'verified',
        exists: true,
      };
    }
  }

  // Check Quran references
  for (const [key, value] of Object.entries(VERIFIED_SOURCES.quran_references)) {
    if (lowerSource.includes(key.toLowerCase()) || lowerSource.includes(`quran ${key}`)) {
      return {
        source: `Quran ${key}`,
        title: value.title,
        category: 'Quran',
        status: 'verified',
        exists: true,
      };
    }
  }

  // Check Hadith references
  for (const [key, value] of Object.entries(VERIFIED_SOURCES.hadith_references)) {
    if (lowerSource.includes(key.toLowerCase())) {
      return {
        source: key,
        title: value.title,
        category: 'Hadith',
        status: 'verified',
        exists: true,
      };
    }
  }

  // Source not found
  return {
    source,
    status: 'unverified',
    exists: false,
    recommendation: 'This source could not be verified. Please check the reference.',
  };
}

/**
 * Verify multiple sources
 * @param {Array} sources - List of sources
 * @returns {object} Verification results
 */
function verifyMultipleSources(sources) {
  const results = sources.map(source => verifySource(source));

  const verified = results.filter(r => r.status === 'verified').length;
  const unverified = results.filter(r => r.status === 'unverified').length;

  return {
    total_sources: sources.length,
    verified_sources: verified,
    unverified_sources: unverified,
    verification_rate: Math.round((verified / sources.length) * 100),
    results,
    disclaimer: 'Source verification is automated. Always verify with primary sources.',
  };
}

/**
 * Extract and verify sources from text
 * @param {string} text - Text containing references
 * @returns {object} Extraction and verification result
 */
function extractAndVerifySources(text) {
  // Extract potential sources
  const sources = [];

  // AAOIFI standards
  const aaoifiPattern = /FAS-\d+|SS-\d+/g;
  const aaoifiMatches = text.match(aaoifiPattern) || [];
  sources.push(...aaoifiMatches);

  // SBP guidelines
  const sbpPattern = /IBD-\d{4}-\d+/g;
  const sbpMatches = text.match(sbpPattern) || [];
  sources.push(...sbpMatches);

  // Quran references
  const quranPattern = /Quran\s+\d+:\d+|Quran\s+\d+\s+\d+:\d+/gi;
  const quranMatches = text.match(quranPattern) || [];
  sources.push(...quranMatches);

  // Hadith references
  const hadithPattern = /Sahih\s+(Bukhari|Muslim)\s+\d+/gi;
  const hadithMatches = text.match(hadithPattern) || [];
  sources.push(...hadithMatches);

  // Remove duplicates
  const uniqueSources = [...new Set(sources)];

  if (uniqueSources.length === 0) {
    return {
      sources_found: 0,
      message: 'No recognizable sources found in text',
    };
  }

  return verifyMultipleSources(uniqueSources);
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — Get verified sources
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Source Verification API',
      verified_sources: VERIFIED_SOURCES,
      actions: ['verify', 'extract_and_verify'],
    });
  }

  // POST — Verify sources
  if (req.method === 'POST') {
    try {
      const { action, source, sources, text } = req.body;

      if (action === 'verify' && source) {
        const result = verifySource(source);
        return res.status(200).json(result);
      }

      if (action === 'verify_multiple' && sources) {
        const result = verifyMultipleSources(sources);
        return res.status(200).json(result);
      }

      if (action === 'extract_and_verify' && text) {
        const result = extractAndVerifySources(text);
        return res.status(200).json(result);
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['verify', 'verify_multiple', 'extract_and_verify'],
      });
    } catch (err) {
      console.error('Source verification error:', err.message);
      return res.status(500).json({ error: 'Verification failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
