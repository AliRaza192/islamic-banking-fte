// api/multi-tenant.js
// Multi-Tenant Support — Multiple banks using same platform
// POST /api/multi-tenant — Manage tenant configuration

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Tenant configuration
const TENANTS = {
  meezan: {
    id: 'meezan',
    name: 'Meezan Bank',
    name_ur: 'میزان بینک',
    type: 'full_islamic_bank',
    status: 'active',
    config: {
      branding: {
        primary_color: '#0066B3',
        logo_url: '/logos/meezan.png',
      },
      features: {
        chat: true,
        calculator: true,
        applications: true,
        zakat: true,
      },
      limits: {
        daily_queries: 1000,
        max_users: 100000,
      },
    },
    shariah_board: 'Dr. Muhammad Imran Usmani',
    products: ['murabaha', 'ijara', 'musharakah', 'sukuk'],
  },
  Albilad: {
    id: 'Albilad',
    name: 'Bank Albilad',
    name_ur: 'بینک العباد',
    type: 'full_islamic_bank',
    status: 'active',
    config: {
      branding: {
        primary_color: '#00A651',
        logo_url: '/logos/Albilad.png',
      },
      features: {
        chat: true,
        calculator: true,
        applications: true,
        zakat: true,
      },
      limits: {
        daily_queries: 500,
        max_users: 50000,
      },
    },
    shariah_board: 'Shariah Board',
    products: ['murabaha', 'ijara', 'musharakah'],
  },
  Dubai: {
    id: 'Dubai',
    name: 'Dubai Islamic Bank',
    name_ur: 'دبئی اسلامی بینک',
    type: 'full_islamic_bank',
    status: 'active',
    config: {
      branding: {
        primary_color: '#003366',
        logo_url: '/logos/Dubai.png',
      },
      features: {
        chat: true,
        calculator: true,
        applications: true,
        zakat: true,
      },
      limits: {
        daily_queries: 500,
        max_users: 50000,
      },
    },
    shariah_board: 'Shariah Board',
    products: ['murabaha', 'ijara', 'sukuk'],
  },
};

/**
 * Get tenant configuration
 * @param {string} tenantId - Tenant ID
 * @returns {object} Tenant config
 */
function getTenantConfig(tenantId) {
  const tenant = TENANTS[tenantId];
  if (!tenant) {
    return { success: false, error: 'Tenant not found' };
  }

  return { success: true, tenant };
}

/**
 * Get all tenants
 * @returns {Array} All tenants
 */
function getAllTenants() {
  return Object.entries(TENANTS).map(([key, tenant]) => ({
    id: key,
    name: tenant.name,
    name_ur: tenant.name_ur,
    type: tenant.type,
    status: tenant.status,
    product_count: tenant.products.length,
  }));
}

/**
 * Validate tenant access
 * @param {string} tenantId - Tenant ID
 * @param {string} feature - Feature name
 * @returns {object} Validation result
 */
function validateTenantAccess(tenantId, feature) {
  const tenant = TENANTS[tenantId];
  if (!tenant) {
    return { allowed: false, reason: 'Tenant not found' };
  }

  if (tenant.status !== 'active') {
    return { allowed: false, reason: 'Tenant not active' };
  }

  const featureEnabled = tenant.config.features[feature];
  if (!featureEnabled) {
    return { allowed: false, reason: 'Feature not enabled for this tenant' };
  }

  return { allowed: true, tenant: tenant.name };
}

/**
 * Get tenant statistics
 * @param {string} tenantId - Tenant ID
 * @returns {object} Tenant stats
 */
function getTenantStats(tenantId) {
  // In production, query database
  return {
    tenant_id: tenantId,
    total_users: 15000,
    active_users: 8500,
    daily_queries: 1200,
    query_limit: TENANTS[tenantId]?.config.limits.daily_queries || 500,
    usage_percentage: 60,
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

  // GET — Get tenant info
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const action = url.searchParams.get('action');
    const tenantId = url.searchParams.get('tenant_id');

    if (action === 'tenants') {
      return res.status(200).json({ tenants: getAllTenants() });
    }

    if (action === 'config' && tenantId) {
      const result = getTenantConfig(tenantId);
      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }
      return res.status(200).json(result);
    }

    if (action === 'stats' && tenantId) {
      const stats = getTenantStats(tenantId);
      return res.status(200).json(stats);
    }

    return res.status(200).json({
      message: 'Multi-Tenant API',
      actions: ['tenants', 'config', 'stats', 'validate'],
    });
  }

  // POST — Validate tenant access
  if (req.method === 'POST') {
    try {
      const { action, tenant_id, feature } = req.body;

      if (action === 'validate' && tenant_id && feature) {
        const result = validateTenantAccess(tenant_id, feature);
        return res.status(200).json(result);
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['validate'],
      });
    } catch (err) {
      console.error('Multi-tenant error:', err.message);
      return res.status(500).json({ error: 'Tenant validation failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
