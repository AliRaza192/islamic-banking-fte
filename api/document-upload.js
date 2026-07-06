// api/document-upload.js
// Document Upload + OCR — Extract text from financial documents
// POST /api/document-upload — Upload document for text extraction

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/gif': 'gif',
  'text/plain': 'text',
  'text/csv': 'csv',
};

// Document categories for classification
const DOCUMENT_CATEGORIES = {
  bank_statement: ['statement', 'balance', 'transaction', 'account', 'bank'],
  salary_slip: ['salary', 'pay', 'income', 'deduction', 'tax'],
  invoice: ['invoice', 'bill', 'amount', 'total', 'item'],
  contract: ['agreement', 'terms', 'conditions', 'signature', 'party'],
  receipt: ['receipt', 'payment', 'received', 'date', 'amount'],
  tax_return: ['tax', 'return', 'income', 'deduction', 'assessment'],
  other: ['document'],
};

/**
 * Extract text from uploaded file (simplified OCR)
 * In production, use Google Vision API, Tesseract.js, or AWS Textract
 * @param {Buffer} fileBuffer - File content
 * @param {string} mimeType - File MIME type
 * @param {string} originalName - Original filename
 * @returns {object} Extraction result
 */
async function extractText(fileBuffer, mimeType, originalName) {
  const fileType = ALLOWED_TYPES[mimeType];
  if (!fileType) {
    return {
      success: false,
      error: 'Unsupported file type',
      supported: Object.keys(ALLOWED_TYPES),
    };
  }

  // For text files, extract directly
  if (fileType === 'text' || fileType === 'csv') {
    const text = fileBuffer.toString('utf-8');
    return {
      success: true,
      text,
      fileType,
      characterCount: text.length,
      lineCount: text.split('\n').length,
    };
  }

  // For images and PDFs, use simplified OCR simulation
  // In production, integrate with Google Vision API or Tesseract.js
  const simulatedText = `[OCR Processing Required for ${fileType.toUpperCase()}]\n\n` +
    `File: ${originalName}\n` +
    `Type: ${mimeType}\n` +
    `Size: ${(fileBuffer.length / 1024).toFixed(1)} KB\n\n` +
    `To extract text from this ${fileType.toUpperCase()} file, please:\n` +
    `1. Use Google Vision API for production OCR\n` +
    `2. Or use Tesseract.js for client-side OCR\n` +
    `3. Or manually copy the text from the document\n\n` +
    `Supported document types for financial analysis:\n` +
    `- Bank statements\n` +
    `- Salary slips\n` +
    `- Invoices and receipts\n` +
    `- Tax returns\n` +
    `- Financial contracts`;

  return {
    success: true,
    text: simulatedText,
    fileType,
    characterCount: simulatedText.length,
    note: 'OCR simulation — integrate Google Vision API for production',
  };
}

/**
 * Classify document based on content
 * @param {string} text - Extracted text
 * @returns {object} Classification result
 */
function classifyDocument(text) {
  const lowerText = text.toLowerCase();
  const scores = {};

  for (const [category, keywords] of Object.entries(DOCUMENT_CATEGORIES)) {
    scores[category] = keywords.filter(keyword => lowerText.includes(keyword)).length;
  }

  const bestCategory = Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b));
  const confidence = bestCategory[1] / DOCUMENT_CATEGORIES[bestCategory[0]].length;

  return {
    category: bestCategory[0],
    confidence: Math.min(confidence, 1),
    scores,
  };
}

/**
 * Extract financial data from text (simplified)
 * @param {string} text - Document text
 * @returns {object} Extracted financial data
 */
function extractFinancialData(text) {
  const data = {
    amounts: [],
    dates: [],
    account_numbers: [],
    descriptions: [],
  };

  // Extract amounts (PKR, Rs., etc.)
  const amountRegex = /(?:PKR|Rs\.?|USD|\$|EUR|£|¥)\s*[\d,]+(?:\.\d{2})?/gi;
  const amounts = text.match(amountRegex) || [];
  data.amounts = amounts.map(a => a.trim());

  // Extract dates
  const dateRegex = /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/g;
  const dates = text.match(dateRegex) || [];
  data.dates = dates;

  // Extract account numbers (simplified)
  const accountRegex = /\b\d{10,16}\b/g;
  const accounts = text.match(accountRegex) || [];
  data.account_numbers = accounts;

  // Extract lines that might be descriptions
  const lines = text.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed.length > 10 && trimmed.length < 200 &&
           !trimmed.match(/^\d/) &&
           !trimmed.match(/^(PKR|Rs\.?|USD|\$)/i);
  });
  data.descriptions = lines.slice(0, 10); // Limit to 10 lines

  return data;
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST — Upload and process document
  if (req.method === 'POST') {
    try {
      // Note: In Vercel, use FormData for file uploads
      // For simplicity, we're accepting base64 encoded content
      const { file_content, file_name, file_type, purpose } = req.body;

      if (!file_content || !file_name || !file_type) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['file_content', 'file_name', 'file_type'],
        });
      }

      // Validate file size (base64 is ~33% larger)
      const estimatedSize = (file_content.length * 3) / 4;
      if (estimatedSize > MAX_FILE_SIZE) {
        return res.status(400).json({
          error: 'File too large',
          max_size: '5MB',
          received_size: `${(estimatedSize / 1024 / 1024).toFixed(1)} MB`,
        });
      }

      // Validate file type
      if (!ALLOWED_TYPES[file_type]) {
        return res.status(400).json({
          error: 'Unsupported file type',
          received: file_type,
          supported: Object.keys(ALLOWED_TYPES),
        });
      }

      // Convert base64 to buffer
      const fileBuffer = Buffer.from(file_content, 'base64');

      // Extract text
      const extraction = await extractText(fileBuffer, file_type, file_name);
      if (!extraction.success) {
        return res.status(400).json(extraction);
      }

      // Classify document
      const classification = classifyDocument(extraction.text);

      // Extract financial data if applicable
      let financialData = null;
      if (['bank_statement', 'salary_slip', 'invoice', 'receipt'].includes(classification.category)) {
        financialData = extractFinancialData(extraction.text);
      }

      return res.status(200).json({
        success: true,
        file_name,
        file_type: ALLOWED_TYPES[file_type],
        extraction: {
          text: extraction.text,
          character_count: extraction.characterCount,
          line_count: extraction.lineCount,
        },
        classification,
        financial_data: financialData,
        purpose: purpose || 'general',
        disclaimer: 'OCR extraction is approximate. Please verify extracted data with the original document.',
      });
    } catch (err) {
      console.error('Document upload error:', err.message);
      return res.status(500).json({ error: 'Document processing failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
