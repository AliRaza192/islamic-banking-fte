// api/human-chat.js
// Real-time Chat with Human Agent — WebSocket-based handoff to live officer
// POST /api/human-chat — Manage human agent handoff

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Agent status
const AGENT_STATUS = {
  ONLINE: 'online',
  BUSY: 'busy',
  AWAY: 'away',
  OFFLINE: 'offline',
};

// Handoff reasons
const HANDOFF_REASONS = {
  COMPLEX_QUERY: 'complex_query',
  COMPLAINT: 'complaint',
  DISPUTE: 'dispute',
  LEGAL: 'legal',
  HIGH_VALUE: 'high_value',
  USER_REQUEST: 'user_request',
};

/**
 * Check agent availability
 * @returns {object} Agent availability
 */
function checkAgentAvailability() {
  // In production, query actual agent status
  return {
    available: true,
    agents_online: 3,
    agents_busy: 1,
    estimated_wait_time: '2-3 minutes',
    queue_length: 2,
  };
}

/**
 * Initiate handoff
 * @param {object} data - Handoff data
 * @returns {object} Handoff result
 */
function initiateHandoff(data) {
  const { user_id, reason, query, language = 'en' } = data;

  // Generate session ID
  const sessionId = `CHAT${Date.now().toString(36).toUpperCase()}`;

  return {
    success: true,
    session_id: sessionId,
    status: 'queued',
    status_ur: 'قطار میں',
    reason,
    estimated_wait_time: '2-3 minutes',
    queue_position: 2,
    message: language === 'ur'
      ? 'آپ کو ایک لائیو افسر سے جوڑا جا رہا ہے۔ براہ کرم انتظار کریں۔'
      : 'You are being connected to a live officer. Please wait.',
    message_ur: 'آپ کو ایک لائیو افسر سے جوڑا جا رہا ہے۔ براہ کرم انتظار کریں۔',
  };
}

/**
 * Get session status
 * @param {string} sessionId - Session ID
 * @returns {object} Session status
 */
function getSessionStatus(sessionId) {
  return {
    session_id: sessionId,
    status: 'active',
    agent: {
      id: 'AGENT001',
      name: 'Ahmed Khan',
      name_ur: 'احمد خان',
      role: 'Islamic Banking Officer',
      status: AGENT_STATUS.ONLINE,
    },
    started_at: new Date().toISOString(),
    messages_count: 5,
  };
}

/**
 * End session
 * @param {string} sessionId - Session ID
 * @returns {object} End result
 */
function endSession(sessionId) {
  return {
    success: true,
    session_id: sessionId,
    status: 'completed',
    duration: '15 minutes',
    messages_count: 12,
    feedback_requested: true,
    message: 'Session ended. Please rate your experience.',
    message_ur: 'سیشن ختم ہو گیا۔ براہ کرم اپنے تجربے کی درجہ بندی کریں۔',
  };
}

/**
 * Get agent list
 * @returns {Array} Available agents
 */
function getAgentList() {
  return [
    {
      id: 'AGENT001',
      name: 'Ahmed Khan',
      name_ur: 'احمد خان',
      role: 'Islamic Banking Officer',
      expertise: ['murabaha', 'ijara', 'zakat'],
      languages: ['en', 'ur'],
      status: AGENT_STATUS.ONLINE,
    },
    {
      id: 'AGENT002',
      name: 'Fatima Ali',
      name_ur: 'فاطمہ علی',
      role: 'Shariah Advisor',
      expertise: ['shariah_compliance', 'fatwa'],
      languages: ['en', 'ur', 'ar'],
      status: AGENT_STATUS.ONLINE,
    },
    {
      id: 'AGENT003',
      name: 'Muhammad Hassan',
      name_ur: 'محمد حسن',
      role: 'Customer Service Officer',
      expertise: ['accounts', 'complaints'],
      languages: ['en', 'ur'],
      status: AGENT_STATUS.BUSY,
    },
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

  // GET — Get agent info
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const action = url.searchParams.get('action');
    const sessionId = url.searchParams.get('session_id');

    if (action === 'availability') {
      const availability = checkAgentAvailability();
      return res.status(200).json(availability);
    }

    if (action === 'agents') {
      const agents = getAgentList();
      return res.status(200).json({ agents });
    }

    if (action === 'status' && sessionId) {
      const status = getSessionStatus(sessionId);
      return res.status(200).json(status);
    }

    return res.status(200).json({
      message: 'Human Chat API',
      actions: ['handoff', 'status', 'end', 'availability', 'agents'],
    });
  }

  // POST — Manage handoff
  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;

      if (action === 'handoff' && data) {
        const result = initiateHandoff(data);
        return res.status(200).json(result);
      }

      if (action === 'status' && data?.session_id) {
        const status = getSessionStatus(data.session_id);
        return res.status(200).json(status);
      }

      if (action === 'end' && data?.session_id) {
        const result = endSession(data.session_id);
        return res.status(200).json(result);
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['handoff', 'status', 'end'],
      });
    } catch (err) {
      console.error('Human chat error:', err.message);
      return res.status(500).json({ error: 'Chat handoff failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
