// api/multi-agent.js
// Multi-Agent Architecture — Orchestrator → Specialist agents
// POST /api/multi-agent — Route queries to specialist agents

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Specialist agents
const SPECIALIST_AGENTS = {
  zakat_specialist: {
    name: 'Zakat Specialist',
    name_ur: 'زکو٤ة ماہر',
    expertise: ['zakat', 'nisab', 'purification', 'zakat_calculation'],
    triggers: ['zakat', 'nisab', 'how much zakat', 'zakat calculate', 'زکو٤ة'],
    system_prompt: 'You are a Zakat specialist. Calculate Zakat accurately using current Nisab values. Always show step-by-step calculations.',
  },
  product_specialist: {
    name: 'Product Specialist',
    name_ur: 'مہارت ماحول',
    expertise: ['murabaha', 'ijara', 'musharakah', 'salam', 'istisna', 'sukuk'],
    triggers: ['murabaha', 'ijara', 'musharakah', 'product', 'financing', 'مرابحہ'],
    system_prompt: 'You are an Islamic banking product specialist. Explain products clearly with AAOIFI standards reference.',
  },
  shariah_specialist: {
    name: 'Shariah Compliance Specialist',
    name_ur: 'شریعہ تعمیل ماہر',
    expertise: ['shariah_compliance', 'halal', 'haram', 'screening'],
    triggers: ['halal', 'haram', 'shariah', 'compliance', 'حلال', 'حرام'],
    system_prompt: 'You are a Shariah compliance specialist. Check products for Riba, Gharar, and Maysir. Reference AAOIFI standards.',
  },
  calculation_specialist: {
    name: 'Calculation Specialist',
    name_ur: 'حسابات ماہر',
    expertise: ['calculations', 'formulas', 'amortization', 'profit_rates'],
    triggers: ['calculate', 'formula', 'how much', 'monthly payment', 'حساب'],
    system_prompt: 'You are a financial calculation specialist. Show all formulas, inputs, and step-by-step calculations.',
  },
  escalation_specialist: {
    name: 'Escalation Specialist',
    name_ur: 'اعلیٰ اہلکار',
    expertise: ['complex_queries', 'complaints', 'disputes', 'legal'],
    triggers: ['complaint', 'dispute', 'problem', 'help', 'شکایت'],
    system_prompt: 'You are a senior officer handling escalations. Be empathetic and provide clear next steps.',
  },
};

/**
 * Classify query intent
 * @param {string} query - User query
 * @returns {object} Classification result
 */
function classifyQuery(query) {
  const lowerQuery = query.toLowerCase();
  const scores = {};

  for (const [agentKey, agent] of Object.entries(SPECIALIST_AGENTS)) {
    scores[agentKey] = 0;
    for (const trigger of agent.triggers) {
      if (lowerQuery.includes(trigger.toLowerCase())) {
        scores[agentKey] += 1;
      }
    }
  }

  // Find best matching agent
  const bestAgent = Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b));
  const confidence = bestAgent[1] > 0 ? Math.min(bestAgent[1] / 3, 1) : 0;

  return {
    agent: bestAgent[1] > 0 ? bestAgent[0] : 'general',
    confidence,
    scores,
  };
}

/**
 * Route query to specialist agent
 * @param {string} query - User query
 * @param {object} context - Conversation context
 * @returns {object} Routing result
 */
function routeToSpecialist(query, context = {}) {
  const classification = classifyQuery(query);
  const agent = SPECIALIST_AGENTS[classification.agent];

  if (!agent) {
    return {
      agent: 'general',
      system_prompt: 'You are a helpful Islamic banking assistant. Answer accurately and always include Shariah disclaimer.',
      confidence: 0,
    };
  }

  return {
    agent: classification.agent,
    name: agent.name,
    name_ur: agent.name_ur,
    system_prompt: agent.system_prompt,
    expertise: agent.expertise,
    confidence: classification.confidence,
    context_enhancement: generateContextEnhancement(query, agent),
  };
}

/**
 * Generate context enhancement for agent
 * @param {string} query - User query
 * @param {object} agent - Agent info
 * @returns {string} Context string
 */
function generateContextEnhancement(query, agent) {
  const contextParts = [];

  // Add agent-specific context
  if (agent.expertise.includes('zakat')) {
    contextParts.push('Current Nisab: Gold ~Rs. 15,74,640 | Silver ~Rs. 1,28,596');
    contextParts.push('Zakat rate: 2.5% of total assets above Nisab');
  }

  if (agent.expertise.includes('murabaha')) {
    contextParts.push('Murabaha: Cost + disclosed profit margin');
    contextParts.push('Key principle: Bank must own asset before selling');
  }

  if (agent.expertise.includes('shariah_compliance')) {
    contextParts.push('Check for: Riba (interest), Gharar (uncertainty), Maysir (gambling)');
    contextParts.push('Reference: AAOIFI Shariah Standards');
  }

  return contextParts.join('\n');
}

/**
 * Execute agent with query
 * @param {string} agentKey - Agent key
 * @param {string} query - User query
 * @param {object} context - Conversation context
 * @returns {object} Agent execution plan
 */
function executeAgent(agentKey, query, context = {}) {
  const agent = SPECIALIST_AGENTS[agentKey];
  if (!agent) {
    return { success: false, error: 'Unknown agent' };
  }

  const routing = routeToSpecialist(query, context);

  return {
    success: true,
    agent: agentKey,
    name: agent.name,
    name_ur: agent.name_ur,
    query,
    system_prompt: routing.system_prompt,
    context_enhancement: routing.context_enhancement,
    confidence: routing.confidence,
    estimated_response_time: '2-3 seconds',
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

  // GET — Get agent information
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const action = url.searchParams.get('action');

    if (action === 'agents') {
      const agents = Object.entries(SPECIALIST_AGENTS).map(([key, agent]) => ({
        key,
        name: agent.name,
        name_ur: agent.name_ur,
        expertise: agent.expertise,
        triggers: agent.triggers,
      }));
      return res.status(200).json({ agents });
    }

    return res.status(200).json({
      message: 'Multi-Agent Architecture API',
      actions: ['route', 'execute', 'agents'],
    });
  }

  // POST — Route or execute agent
  if (req.method === 'POST') {
    try {
      const { action, query, agent: agentKey, context } = req.body;

      // Route query to best agent
      if (action === 'route' && query) {
        const routing = routeToSpecialist(query, context);
        return res.status(200).json(routing);
      }

      // Execute specific agent
      if (action === 'execute' && query) {
        const execution = executeAgent(agentKey || 'general', query, context);
        return res.status(200).json(execution);
      }

      // Get agent capabilities
      if (action === 'capabilities' && agentKey) {
        const agent = SPECIALIST_AGENTS[agentKey];
        if (!agent) {
          return res.status(404).json({ error: 'Agent not found' });
        }
        return res.status(200).json({
          agent: agentKey,
          name: agent.name,
          name_ur: agent.name_ur,
          expertise: agent.expertise,
          triggers: agent.triggers,
          system_prompt: agent.system_prompt,
        });
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['route', 'execute', 'capabilities'],
      });
    } catch (err) {
      console.error('Multi-agent error:', err.message);
      return res.status(500).json({ error: 'Agent routing failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
