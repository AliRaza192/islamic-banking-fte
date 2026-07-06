// api/analytics-dashboard.js
// Analytics Dashboard — Admin analytics and reporting
// GET /api/analytics-dashboard — Get analytics data

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Analytics time periods
const TIME_PERIODS = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
};

/**
 * Get user analytics
 * @param {string} period - Time period
 * @returns {object} User analytics
 */
function getUserAnalytics(period = 'month') {
  // In production, query database
  return {
    total_users: 15420,
    active_users: 8750,
    new_users_today: 125,
    new_users_this_week: 890,
    new_users_this_month: 3450,
    retention_rate: '78.5%',
    average_session_duration: '12.3 minutes',
    user_growth: {
      daily: [120, 135, 128, 142, 155, 168, 175],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
  };
}

/**
 * Get query analytics
 * @param {string} period - Time period
 * @returns {object} Query analytics
 */
function getQueryAnalytics(period = 'month') {
  return {
    total_queries: 45230,
    queries_today: 1250,
    average_response_time: '2.3 seconds',
    success_rate: '94.5%',
    top_queries: [
      { query: 'Zakat calculate', count: 8500, percentage: '18.8%' },
      { query: 'Murabaha info', count: 6200, percentage: '13.7%' },
      { query: 'Bank rates', count: 5800, percentage: '12.8%' },
      { query: 'Shariah check', count: 4500, percentage: '9.9%' },
      { query: 'Ijara vs Murabaha', count: 3200, percentage: '7.1%' },
    ],
    query_categories: {
      zakat: 35,
      products: 25,
      calculations: 20,
      general: 15,
      other: 5,
    },
  };
}

/**
 * Get financial analytics
 * @param {string} period - Time period
 * @returns {object} Financial analytics
 */
function getFinancialAnalytics(period = 'month') {
  return {
    total_calculations: 28500,
    zakat_calculated: 15200,
    total_zakat_amount: 'Rs. 45,000,000',
    murabaha_calculations: 8500,
    ijara_calculations: 4800,
    average_zakat_per_user: 'Rs. 2,960',
    calculator_usage: {
      zakat: 53.3,
      murabaha: 29.8,
      ijara: 16.9,
    },
  };
}

/**
 * Get system analytics
 * @returns {object} System analytics
 */
function getSystemAnalytics() {
  return {
    api_uptime: '99.8%',
    average_response_time: '2.3 seconds',
    error_rate: '0.5%',
    rate_limit_hits: 125,
    database_size: '2.5 GB',
    storage_used: '45%',
    api_calls_today: 12500,
    api_calls_this_month: 345000,
    performance: {
      response_time_p50: '1.8s',
      response_time_p95: '4.2s',
      response_time_p99: '8.5s',
    },
  };
}

/**
 * Get security analytics
 * @returns {object} Security analytics
 */
function getSecurityAnalytics() {
  return {
    blocked_queries: 245,
    blocked_reasons: {
      fatwa_attempt: 85,
      scope_violation: 65,
      toxicity: 45,
      injection: 30,
      jailbreak: 20,
    },
    suspicious_activities: 12,
    failed_logins: 45,
    rate_limit_violations: 125,
  };
}

/**
 * Get feedback analytics
 * @returns {object} Feedback analytics
 */
function getFeedbackAnalytics() {
  return {
    total_feedback: 3450,
    positive_feedback: 2890,
    negative_feedback: 560,
    satisfaction_rate: '83.8%',
    feedback_trend: {
      daily: [85, 92, 78, 95, 88, 90, 92],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    top_issues: [
      { issue: 'Rate accuracy', count: 120, percentage: '21.4%' },
      { issue: 'Response time', count: 95, percentage: '17.0%' },
      { issue: 'Language issues', count: 85, percentage: '15.2%' },
    ],
  };
}

/**
 * Get channel analytics
 * @returns {object} Channel analytics
 */
function getChannelAnalytics() {
  return {
    channels: {
      web: { users: 12000, percentage: '77.8%' },
      whatsapp: { users: 2500, percentage: '16.2%' },
      telegram: { users: 800, percentage: '5.2%' },
      sms: { users: 120, percentage: '0.8%' },
    },
    device_types: {
      mobile: 65,
      desktop: 30,
      tablet: 5,
    },
    languages: {
      urdu: 55,
      english: 45,
    },
  };
}

/**
 * Generate dashboard summary
 * @returns {object} Dashboard summary
 */
function generateDashboardSummary() {
  const users = getUserAnalytics();
  const queries = getQueryAnalytics();
  const financial = getFinancialAnalytics();
  const system = getSystemAnalytics();
  const security = getSecurityAnalytics();
  const feedback = getFeedbackAnalytics();
  const channels = getChannelAnalytics();

  return {
    overview: {
      total_users: users.total_users,
      active_users: users.active_users,
      total_queries: queries.total_queries,
      success_rate: queries.success_rate,
      api_uptime: system.api_uptime,
      satisfaction_rate: feedback.satisfaction_rate,
    },
    alerts: [
      { type: 'warning', message: 'Rate limit hits increased by 15% this week' },
      { type: 'info', message: 'New user registrations up 12% this month' },
      { type: 'success', message: 'API uptime maintained at 99.8%' },
    ],
    generated_at: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=300'); // 5min cache

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — Get analytics data
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const section = url.searchParams.get('section');
    const period = url.searchParams.get('period') || 'month';

    // Verify admin token in production
    // const token = req.headers.authorization?.split(' ')[1];
    // if (!verifyAdminToken(token)) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    switch (section) {
      case 'users':
        return res.status(200).json(getUserAnalytics(period));
      case 'queries':
        return res.status(200).json(getQueryAnalytics(period));
      case 'financial':
        return res.status(200).json(getFinancialAnalytics(period));
      case 'system':
        return res.status(200).json(getSystemAnalytics());
      case 'security':
        return res.status(200).json(getSecurityAnalytics());
      case 'feedback':
        return res.status(200).json(getFeedbackAnalytics());
      case 'channels':
        return res.status(200).json(getChannelAnalytics());
      case 'summary':
      default:
        return res.status(200).json(generateDashboardSummary());
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
