// api/knowledge-graph.js
// Islamic Finance Knowledge Graph — Relationships between products, scholars, standards
// GET /api/knowledge-graph — Query knowledge graph

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Knowledge graph nodes
const GRAPH_NODES = {
  // Products
  murabaha: {
    id: 'murabaha',
    type: 'product',
    name: 'Murabaha',
    name_ur: 'مرابحہ',
    description: 'Cost-plus financing',
    aaoifi_standard: 'FAS-2',
    related_products: ['istisna', 'salam'],
    scholars: ['dr_imran_usmani', 'dr_mufti_menk'],
  },
  ijara: {
    id: 'ijara',
    type: 'product',
    name: 'Ijara',
    name_ur: 'اجارہ',
    description: 'Islamic lease',
    aaoifi_standard: 'FAS-8',
    related_products: ['ijara_wa_iqtina'],
    scholars: ['dr_imran_usmani'],
  },
  musharakah: {
    id: 'musharakah',
    type: 'product',
    name: 'Musharakah',
    name_ur: 'مشرکہ',
    description: 'Partnership financing',
    aaoifi_standard: 'FAS-4',
    related_products: ['mudarabah'],
    scholars: ['dr_mufti_menk'],
  },
  mudarabah: {
    id: 'mudarabah',
    type: 'product',
    name: 'Mudarabah',
    name_ur: 'مودعہ',
    description: 'Profit-sharing',
    aaoifi_standard: 'FAS-4',
    related_products: ['musharakah'],
    scholars: ['dr_mufti_menk'],
  },
  salam: {
    id: 'salam',
    type: 'product',
    name: 'Salam',
    name_ur: 'سلم',
    description: 'Forward sale',
    aaoifi_standard: 'FAS-7',
    related_products: ['istisna', 'murabaha'],
    scholars: ['dr_imran_usmani'],
  },
  istisna: {
    id: 'istisna',
    type: 'product',
    name: 'Istisna',
    name_ur: 'استناع',
    description: 'Manufacturing finance',
    aaoifi_standard: 'FAS-10',
    related_products: ['salam', 'murabaha'],
    scholars: ['dr_imran_usmani'],
  },
  sukuk: {
    id: 'sukuk',
    type: 'product',
    name: 'Sukuk',
    name_ur: 'صکوک',
    description: 'Islamic bonds',
    aaoifi_standard: 'FAS-3',
    related_products: ['murabaha', 'ijara'],
    scholars: ['dr_mufti_menk'],
  },
  takaful: {
    id: 'takaful',
    type: 'product',
    name: 'Takaful',
    name_ur: 'تکفل',
    description: 'Islamic insurance',
    aaoifi_standard: 'SS-17',
    related_products: [],
    scholars: ['dr_mufti_menk'],
  },

  // Scholars
  dr_imran_usmani: {
    id: 'dr_imran_usmani',
    type: 'scholar',
    name: 'Dr. Muhammad Imran Usmani',
    expertise: ['murabaha', 'ijara', 'sukuk'],
    organization: 'Darul Uloom Karachi',
  },
  dr_mufti_menk: {
    id: 'dr_mufti_menk',
    type: 'scholar',
    name: 'Mufti Muhammad Taqi Usmani',
    expertise: ['musharakah', 'mudarabah', 'takaful'],
    organization: 'Darul Uloom Karachi',
  },

  // Standards
  'FAS-2': {
    id: 'FAS-2',
    type: 'standard',
    name: 'FAS-2: Murabaha',
    organization: 'AAOIFI',
    products: ['murabaha'],
  },
  'FAS-4': {
    id: 'FAS-4',
    type: 'standard',
    name: 'FAS-4: Musharakah',
    organization: 'AAOIFI',
    products: ['musharakah', 'mudarabah'],
  },
  'FAS-7': {
    id: 'FAS-7',
    type: 'standard',
    name: 'FAS-7: Salam',
    organization: 'AAOIFI',
    products: ['salam'],
  },
  'FAS-8': {
    id: 'FAS-8',
    type: 'standard',
    name: 'FAS-8: Ijara',
    organization: 'AAOIFI',
    products: ['ijara'],
  },
  'FAS-10': {
    id: 'FAS-10',
    type: 'standard',
    name: 'FAS-10: Istisna',
    organization: 'AAOIFI',
    products: ['istisna'],
  },
  'SS-17': {
    id: 'SS-17',
    type: 'standard',
    name: 'SS-17: Takaful',
    organization: 'AAOIFI',
    products: ['takaful'],
  },

  // Concepts
  riba: {
    id: 'riba',
    type: 'concept',
    name: 'Riba',
    name_ur: 'ربا',
    description: 'Interest/usury prohibition',
    prohibited_in: ['murabaha', 'ijara', 'musharakah', 'sukuk'],
  },
  gharar: {
    id: 'gharar',
    type: 'concept',
    name: 'Gharar',
    name_ur: 'غرر',
    description: 'Uncertainty prohibition',
    prohibited_in: ['murabaha', 'ijara', 'salam'],
  },
  maysir: {
    id: 'maysir',
    type: 'concept',
    name: 'Maysir',
    name_ur: 'میسر',
    description: 'Gambling prohibition',
    prohibited_in: ['takaful', 'sukuk'],
  },
};

// Knowledge graph edges (relationships)
const GRAPH_EDGES = [
  // Product relationships
  { source: 'murabaha', target: 'FAS-2', type: 'governed_by' },
  { source: 'ijara', target: 'FAS-8', type: 'governed_by' },
  { source: 'musharakah', target: 'FAS-4', type: 'governed_by' },
  { source: 'mudarabah', target: 'FAS-4', type: 'governed_by' },
  { source: 'salam', target: 'FAS-7', type: 'governed_by' },
  { source: 'istisna', target: 'FAS-10', type: 'governed_by' },
  { source: 'takaful', target: 'SS-17', type: 'governed_by' },

  // Scholar relationships
  { source: 'dr_imran_usmani', target: 'murabaha', type: 'expert_in' },
  { source: 'dr_imran_usmani', target: 'ijara', type: 'expert_in' },
  { source: 'dr_imran_usmani', target: 'sukuk', type: 'expert_in' },
  { source: 'dr_mufti_menk', target: 'musharakah', type: 'expert_in' },
  { source: 'dr_mufti_menk', target: 'mudarabah', type: 'expert_in' },
  { source: 'dr_mufti_menk', target: 'takaful', type: 'expert_in' },

  // Concept relationships
  { source: 'riba', target: 'murabaha', type: 'prohibited_in' },
  { source: 'riba', target: 'ijara', type: 'prohibited_in' },
  { source: 'riba', target: 'musharakah', type: 'prohibited_in' },
  { source: 'riba', target: 'sukuk', type: 'prohibited_in' },
  { source: 'gharar', target: 'murabaha', type: 'prohibited_in' },
  { source: 'gharar', target: 'ijara', type: 'prohibited_in' },
  { source: 'gharar', target: 'salam', type: 'prohibited_in' },
  { source: 'maysir', target: 'takaful', type: 'prohibited_in' },
  { source: 'maysir', target: 'sukuk', type: 'prohibited_in' },
];

/**
 * Get node by ID
 * @param {string} nodeId - Node ID
 * @returns {object} Node data
 */
function getNode(nodeId) {
  return GRAPH_NODES[nodeId] || null;
}

/**
 * Get related nodes
 * @param {string} nodeId - Node ID
 * @param {string} relationship - Relationship type (optional)
 * @returns {Array} Related nodes
 */
function getRelatedNodes(nodeId, relationship = null) {
  const related = [];

  for (const edge of GRAPH_EDGES) {
    if (edge.source === nodeId) {
      const targetNode = GRAPH_NODES[edge.target];
      if (targetNode && (!relationship || edge.type === relationship)) {
        related.push({ ...targetNode, relationship: edge.type });
      }
    }
    if (edge.target === nodeId) {
      const sourceNode = GRAPH_NODES[edge.source];
      if (sourceNode && (!relationship || edge.type === relationship)) {
        related.push({ ...sourceNode, relationship: edge.type });
      }
    }
  }

  return related;
}

/**
 * Search knowledge graph
 * @param {string} query - Search query
 * @returns {Array} Matching nodes
 */
function searchGraph(query) {
  const lowerQuery = query.toLowerCase();
  const results = [];

  for (const [id, node] of Object.entries(GRAPH_NODES)) {
    let score = 0;
    const searchText = `${node.name} ${node.name_ur || ''} ${node.description || ''}`.toLowerCase();

    if (searchText.includes(lowerQuery)) {
      score = 3;
    } else if (lowerQuery.split(' ').some(word => searchText.includes(word))) {
      score = 1;
    }

    if (score > 0) {
      results.push({ ...node, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * Get graph statistics
 * @returns {object} Graph stats
 */
function getGraphStats() {
  const nodeTypes = {};
  for (const node of Object.values(GRAPH_NODES)) {
    nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
  }

  const edgeTypes = {};
  for (const edge of GRAPH_EDGES) {
    edgeTypes[edge.type] = (edgeTypes[edge.type] || 0) + 1;
  }

  return {
    total_nodes: Object.keys(GRAPH_NODES).length,
    total_edges: GRAPH_EDGES.length,
    node_types: nodeTypes,
    edge_types: edgeTypes,
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // 1h cache

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — Query knowledge graph
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const action = url.searchParams.get('action');
    const nodeId = url.searchParams.get('node_id');
    const query = url.searchParams.get('query');
    const relationship = url.searchParams.get('relationship');

    if (action === 'stats') {
      return res.status(200).json(getGraphStats());
    }

    if (action === 'node' && nodeId) {
      const node = getNode(nodeId);
      if (!node) {
        return res.status(404).json({ error: 'Node not found' });
      }
      const related = getRelatedNodes(nodeId, relationship);
      return res.status(200).json({ node, related_nodes: related });
    }

    if (action === 'search' && query) {
      const results = searchGraph(query);
      return res.status(200).json({ query, results });
    }

    return res.status(200).json({
      message: 'Islamic Finance Knowledge Graph',
      actions: ['node', 'search', 'stats'],
      total_nodes: Object.keys(GRAPH_NODES).length,
      total_edges: GRAPH_EDGES.length,
    });
  }

  // POST — Complex queries
  if (req.method === 'POST') {
    try {
      const { action, query, node_id, relationship } = req.body;

      if (action === 'search' && query) {
        const results = searchGraph(query);
        return res.status(200).json({ query, results });
      }

      if (action === 'related' && node_id) {
        const related = getRelatedNodes(node_id, relationship);
        return res.status(200).json({ node_id, related_nodes: related });
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['search', 'related'],
      });
    } catch (err) {
      console.error('Knowledge graph error:', err.message);
      return res.status(500).json({ error: 'Knowledge graph query failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
