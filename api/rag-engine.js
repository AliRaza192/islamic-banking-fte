// api/rag-engine.js
// RAG Engine — Retrieval-Augmented Generation for Islamic finance knowledge
// POST /api/rag-engine — Query knowledge base

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Knowledge base sources
const KNOWLEDGE_SOURCES = {
  aaoifi_standards: {
    name: 'AAOIFI Standards',
    description: 'Accounting and Auditing Organization for Islamic Financial Institutions',
    documents: [
      { id: 'FAS-2', title: 'Murabaha and Other Deferred Payment Sales', category: 'product' },
      { id: 'FAS-3', title: 'Investment Sukuk', category: 'product' },
      { id: 'FAS-4', title: 'Musharakah', category: 'product' },
      { id: 'FAS-7', title: 'Salam', category: 'product' },
      { id: 'FAS-8', title: 'Ijara', category: 'product' },
      { id: 'FAS-9', title: 'Zakat', category: 'zakat' },
      { id: 'FAS-10', title: 'Istisna', category: 'product' },
      { id: 'FAS-32', title: 'Financial Instruments', category: 'product' },
      { id: 'SS-17', title: 'Takaful', category: 'insurance' },
      { id: 'SS-21', title: 'Financial Papers', category: 'product' },
      { id: 'SS-26', title: 'Shariah Standards', category: 'shariah' },
    ],
  },
  sbp_guidelines: {
    name: 'SBP Guidelines',
    description: 'State Bank of Pakistan Islamic Banking Guidelines',
    documents: [
      { id: 'IBD-2008-2', title: 'Murabaha Product Guidelines', category: 'product' },
      { id: 'IBD-2009-1', title: 'Ijara Product Guidelines', category: 'product' },
      { id: 'IBD-2010-3', title: 'Islamic Banking Regulations', category: 'regulation' },
      { id: 'IBD-2012-1', title: 'Zakat Advisory', category: 'zakat' },
      { id: 'IBD-2015-2', title: 'Islamic Finance Reporting', category: 'reporting' },
    ],
  },
  shariah_rules: {
    name: 'Shariah Rules',
    description: 'Core Shariah prohibitions and principles',
    documents: [
      { id: 'RIBA', title: 'Prohibition of Riba (Interest)', category: 'shariah' },
      { id: 'GHARAR', title: 'Prohibition of Gharar (Uncertainty)', category: 'shariah' },
      { id: 'MAYSIR', title: 'Prohibition of Maysir (Gambling)', category: 'shariah' },
      { id: 'HALAL', title: 'Halal vs Haram Activities', category: 'shariah' },
      { id: 'MIZAN', title: 'Risk Sharing Principles', category: 'shariah' },
    ],
  },
  fatwa_database: {
    name: 'Fatwa Database',
    description: 'Common Shariah rulings (for reference, not as fatwa)',
    documents: [
      { id: 'FATWA-001', title: 'Permissibility of Islamic Banking', category: 'fatwa' },
      { id: 'FATWA-002', title: 'Shariah Screening of Stocks', category: 'fatwa' },
      { id: 'FATWA-003', title: 'Zakat on Investments', category: 'fatwa' },
      { id: 'FATWA-004', title: 'Takaful vs Conventional Insurance', category: 'fatwa' },
    ],
  },
};

/**
 * Simple text similarity search
 * @param {string} query - Search query
 * @param {Array} documents - Documents to search
 * @returns {Array} Matching documents with scores
 */
function searchDocuments(query, documents) {
  const queryWords = query.toLowerCase().split(' ');
  const results = [];

  for (const doc of documents) {
    const titleWords = doc.title.toLowerCase().split(' ');
    const categoryWords = doc.category.toLowerCase().split(' ');

    // Simple word matching score
    let score = 0;
    for (const word of queryWords) {
      if (titleWords.some(tw => tw.includes(word) || word.includes(tw))) {
        score += 2;
      }
      if (categoryWords.some(cw => cw.includes(word) || word.includes(cw))) {
        score += 1;
      }
    }

    if (score > 0) {
      results.push({ ...doc, score });
    }
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * Retrieve relevant knowledge for a query
 * @param {string} query - User query
 * @param {number} limit - Max results
 * @returns {object} Retrieval result
 */
function retrieveKnowledge(query, limit = 5) {
  const allDocuments = [];

  // Collect all documents
  for (const source of Object.values(KNOWLEDGE_SOURCES)) {
    for (const doc of source.documents) {
      allDocuments.push({
        ...doc,
        source: source.name,
        source_id: doc.id,
      });
    }
  }

  // Search
  const results = searchDocuments(query, allDocuments);

  return {
    query,
    results: results.slice(0, limit),
    total_results: results.length,
    sources_searched: Object.keys(KNOWLEDGE_SOURCES).length,
  };
}

/**
 * Generate RAG response
 * @param {string} query - User query
 * @param {Array} retrieved_docs - Retrieved documents
 * @returns {object} RAG response
 */
function generateRAGResponse(query, retrieved_docs) {
  const context = retrieved_docs.map(doc =>
    `[${doc.source}] ${doc.title} (${doc.id})`
  ).join('\n');

  return {
    query,
    retrieved_context: context,
    documents_used: retrieved_docs.length,
    confidence: retrieved_docs.length > 0 ? 'high' : 'low',
    response_template: `Based on ${retrieved_docs.length} relevant documents:\n\n${context}\n\nPlease use this information to answer the user's query.`,
    disclaimer: 'This information is from reference documents. For final guidance, consult a qualified Islamic scholar.',
  };
}

/**
 * Get document details
 * @param {string} docId - Document ID
 * @returns {object} Document details
 */
function getDocumentDetails(docId) {
  for (const source of Object.values(KNOWLEDGE_SOURCES)) {
    const doc = source.documents.find(d => d.id === docId);
    if (doc) {
      return {
        ...doc,
        source: source.name,
        source_description: source.description,
      };
    }
  }
  return null;
}

/**
 * Get knowledge base statistics
 * @returns {object} Knowledge base stats
 */
function getKnowledgeStats() {
  let totalDocs = 0;
  const stats = {};

  for (const [key, source] of Object.entries(KNOWLEDGE_SOURCES)) {
    stats[key] = {
      name: source.name,
      document_count: source.documents.length,
    };
    totalDocs += source.documents.length;
  }

  return {
    total_sources: Object.keys(KNOWLEDGE_SOURCES).length,
    total_documents: totalDocs,
    sources: stats,
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

  // GET — Get knowledge base info
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const action = url.searchParams.get('action');
    const docId = url.searchParams.get('doc_id');

    if (action === 'stats') {
      return res.status(200).json(getKnowledgeStats());
    }

    if (action === 'sources') {
      return res.status(200).json({ sources: KNOWLEDGE_SOURCES });
    }

    if (action === 'document' && docId) {
      const doc = getDocumentDetails(docId);
      if (!doc) {
        return res.status(404).json({ error: 'Document not found' });
      }
      return res.status(200).json(doc);
    }

    return res.status(200).json({
      message: 'RAG Engine API',
      actions: ['query', 'stats', 'sources', 'document'],
    });
  }

  // POST — Query knowledge base
  if (req.method === 'POST') {
    try {
      const { action, query, limit } = req.body;

      // Query knowledge base
      if (action === 'query' && query) {
        const retrieval = retrieveKnowledge(query, limit || 5);
        const response = generateRAGResponse(query, retrieval.results);
        return res.status(200).json({ retrieval, response });
      }

      // Get specific document
      if (action === 'document' && req.body.doc_id) {
        const doc = getDocumentDetails(req.body.doc_id);
        if (!doc) {
          return res.status(404).json({ error: 'Document not found' });
        }
        return res.status(200).json(doc);
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['query', 'document'],
      });
    } catch (err) {
      console.error('RAG engine error:', err.message);
      return res.status(500).json({ error: 'Knowledge retrieval failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
