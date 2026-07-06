// api/rbac.js
// Role-Based Access Control — Customer/Officer/Manager/Advisor roles
// POST /api/rbac — Manage roles and permissions

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// User roles
const ROLES = {
  CUSTOMER: {
    name: 'Customer',
    name_ur: 'صارف',
    level: 1,
    permissions: [
      'chat:read',
      'chat:write',
      'calculator:use',
      'rates:read',
      'products:read',
      'profile:read',
      'profile:write',
    ],
  },
  OFFICER: {
    name: 'Officer',
    name_ur: 'افسر',
    level: 2,
    permissions: [
      'chat:read',
      'chat:write',
      'calculator:use',
      'rates:read',
      'products:read',
      'profile:read',
      'profile:write',
      'applications:read',
      'applications:write',
      'customers:read',
    ],
  },
  MANAGER: {
    name: 'Manager',
    name_ur: 'مینیجر',
    level: 3,
    permissions: [
      'chat:read',
      'chat:write',
      'calculator:use',
      'rates:read',
      'rates:write',
      'products:read',
      'products:write',
      'profile:read',
      'profile:write',
      'applications:read',
      'applications:write',
      'applications:approve',
      'customers:read',
      'customers:write',
      'reports:read',
      'analytics:read',
    ],
  },
  ADVISOR: {
    name: 'Shariah Advisor',
    name_ur: 'شریعہ مشیر',
    level: 4,
    permissions: [
      'chat:read',
      'chat:write',
      'calculator:use',
      'rates:read',
      'products:read',
      'products:write',
      'profile:read',
      'profile:write',
      'applications:read',
      'applications:review',
      'customers:read',
      'reports:read',
      'reports:write',
      'compliance:read',
      'compliance:write',
      'shariah:review',
    ],
  },
  ADMIN: {
    name: 'Administrator',
    name_ur: 'منتظم',
    level: 5,
    permissions: ['*'], // All permissions
  },
};

/**
 * Check if user has permission
 * @param {string} userRole - User role
 * @param {string} permission - Required permission
 * @returns {boolean} Has permission
 */
function hasPermission(userRole, permission) {
  const role = ROLES[userRole];
  if (!role) return false;

  // Admin has all permissions
  if (role.permissions.includes('*')) return true;

  return role.permissions.includes(permission);
}

/**
 * Get user permissions
 * @param {string} userRole - User role
 * @returns {Array} User permissions
 */
function getUserPermissions(userRole) {
  const role = ROLES[userRole];
  if (!role) return [];

  return role.permissions;
}

/**
 * Check role level
 * @param {string} userRole - User role
 * @param {number} requiredLevel - Required level
 * @returns {boolean} Has required level
 */
function hasLevel(userRole, requiredLevel) {
  const role = ROLES[userRole];
  if (!role) return false;

  return role.level >= requiredLevel;
}

/**
 * Get all roles
 * @returns {object} All roles
 */
function getAllRoles() {
  return Object.entries(ROLES).map(([key, role]) => ({
    key,
    name: role.name,
    name_ur: role.name_ur,
    level: role.level,
    permission_count: role.permissions.length,
  }));
}

/**
 * Validate access
 * @param {string} userRole - User role
 * @param {string} resource - Resource
 * @param {string} action - Action
 * @returns {object} Validation result
 */
function validateAccess(userRole, resource, action) {
  const permission = `${resource}:${action}`;
  const allowed = hasPermission(userRole, permission);

  return {
    user_role: userRole,
    permission,
    allowed,
    reason: allowed ? 'Permission granted' : 'Insufficient permissions',
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

  // GET — Get roles and permissions
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const action = url.searchParams.get('action');
    const role = url.searchParams.get('role');

    if (action === 'roles') {
      return res.status(200).json({ roles: getAllRoles() });
    }

    if (action === 'permissions' && role) {
      const permissions = getUserPermissions(role);
      return res.status(200).json({ role, permissions });
    }

    if (action === 'check' && role && url.searchParams.get('permission')) {
      const result = validateAccess(role,
        url.searchParams.get('resource'),
        url.searchParams.get('action_type')
      );
      return res.status(200).json(result);
    }

    return res.status(200).json({
      message: 'RBAC API',
      actions: ['roles', 'permissions', 'check', 'validate'],
    });
  }

  // POST — Validate access
  if (req.method === 'POST') {
    try {
      const { action, role, resource, action_type } = req.body;

      if (action === 'validate' && role && resource && action_type) {
        const result = validateAccess(role, resource, action_type);
        return res.status(200).json(result);
      }

      if (action === 'check_permission' && role && req.body.permission) {
        const allowed = hasPermission(role, req.body.permission);
        return res.status(200).json({
          role,
          permission: req.body.permission,
          allowed,
        });
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['validate', 'check_permission'],
      });
    } catch (err) {
      console.error('RBAC error:', err.message);
      return res.status(500).json({ error: 'Access validation failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
