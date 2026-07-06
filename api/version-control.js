// api/version-control.js
// Version Control — Git-based versioning for AI components
// GET /api/version-control — Get version information

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Component types
const COMPONENT_TYPES = {
  SKILL: 'skill',
  PROMPT: 'prompt',
  REFERENCE: 'reference',
  CONFIG: 'config',
};

/**
 * Get version information for a component
 * @param {string} componentType - Component type
 * @param {string} componentName - Component name
 * @returns {object} Version info
 */
function getVersionInfo(componentType, componentName) {
  // In production, read from git or version database
  return {
    component_type: componentType,
    component_name: componentName,
    current_version: '1.0.0',
    last_updated: '2026-05-01',
    author: 'System',
    changes: [
      { version: '1.0.0', date: '2026-05-01', description: 'Initial release' },
    ],
  };
}

/**
 * Get all component versions
 * @returns {object} All versions
 */
function getAllVersions() {
  return {
    skills: {
      'islamic-finance-router': { version: '1.0.0', status: 'active' },
      'murabaha-specialist': { version: '1.0.0', status: 'active' },
      'ijara-specialist': { version: '1.0.0', status: 'active' },
      'zakat-advisor': { version: '1.0.0', status: 'active' },
      'shariah-compliance-checker': { version: '1.0.0', status: 'active' },
      'halal-calculator': { version: '1.0.0', status: 'active' },
    },
    prompts: {
      'system-prompt': { version: '1.0.0', status: 'active' },
      'disclaimer-template': { version: '1.0.0', status: 'active' },
      'escalation-template': { version: '1.0.0', status: 'active' },
    },
    references: {
      'products': { version: '1.0.0', status: 'active' },
      'calculations': { version: '1.0.0', status: 'active' },
      'shariah-rules': { version: '1.0.0', status: 'active' },
    },
    last_checked: new Date().toISOString(),
  };
}

/**
 * Compare versions
 * @param {string} version1 - Version 1
 * @param {string} version2 - Version 2
 * @returns {object} Comparison result
 */
function compareVersions(version1, version2) {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1 = v1Parts[i] || 0;
    const v2 = v2Parts[i] || 0;

    if (v1 > v2) return { result: 1, newer: version1 };
    if (v1 < v2) return { result: -1, newer: version2 };
  }

  return { result: 0, newer: null };
}

/**
 * Get version history
 * @param {string} componentName - Component name
 * @returns {Array} Version history
 */
function getVersionHistory(componentName) {
  // In production, query git history or version database
  return [
    {
      version: '1.0.0',
      date: '2026-05-01',
      author: 'System',
      description: 'Initial release',
      changes: ['Created component', 'Added basic functionality'],
    },
  ];
}

/**
 * Check for updates
 * @returns {object} Update status
 */
function checkForUpdates() {
  return {
    updates_available: false,
    components: [],
    last_checked: new Date().toISOString(),
    next_check: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // 1h cache

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — Get version information
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const action = url.searchParams.get('action');
    const componentType = url.searchParams.get('type');
    const componentName = url.searchParams.get('name');

    if (action === 'all') {
      return res.status(200).json(getAllVersions());
    }

    if (action === 'version' && componentType && componentName) {
      const version = getVersionInfo(componentType, componentName);
      return res.status(200).json(version);
    }

    if (action === 'history' && componentName) {
      const history = getVersionHistory(componentName);
      return res.status(200).json({ component: componentName, history });
    }

    if (action === 'compare' && url.searchParams.get('v1') && url.searchParams.get('v2')) {
      const comparison = compareVersions(
        url.searchParams.get('v1'),
        url.searchParams.get('v2')
      );
      return res.status(200).json(comparison);
    }

    if (action === 'updates') {
      return res.status(200).json(checkForUpdates());
    }

    return res.status(200).json({
      message: 'Version Control API',
      actions: ['all', 'version', 'history', 'compare', 'updates'],
      component_types: COMPONENT_TYPES,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
