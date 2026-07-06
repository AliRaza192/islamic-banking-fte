// api/document-generation.js
// Document Generation — Generate DOCX/PDF documents
// POST /api/document-generation — Generate documents

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Document templates
const DOCUMENT_TEMPLATES = {
  zakat_report: {
    name: 'Zakat Calculation Report',
    name_ur: 'زکو٤ة کی تفصیل',
    format: 'pdf',
    sections: ['header', 'assets', 'calculation', 'nisab', 'result', 'disclaimer'],
  },
  murabaha_application: {
    name: 'Murabaha Application Form',
    name_ur: 'مرابحہ درخواست فارم',
    format: 'pdf',
    sections: ['header', 'personal_info', 'financing_details', 'declaration', 'signature'],
  },
  ijara_application: {
    name: 'Ijara Application Form',
    name_ur: 'اجارہ درخواست فارم',
    format: 'pdf',
    sections: ['header', 'personal_info', 'lease_details', 'declaration', 'signature'],
  },
  shariah_certificate: {
    name: 'Shariah Compliance Certificate',
    name_ur: 'شریعہ تعمیل سرٹیفکیٹ',
    format: 'pdf',
    sections: ['header', 'product_info', 'compliance_statement', 'scholar_signature'],
  },
  eligibility_report: {
    name: 'Financing Eligibility Report',
    name_ur: 'فنانسنگ اہلیت رپورٹ',
    format: 'pdf',
    sections: ['header', 'applicant_info', 'financial_analysis', 'eligibility_result'],
  },
  complaint_letter: {
    name: 'Complaint Letter',
    name_ur: 'شکایت خط',
    format: 'docx',
    sections: ['header', 'recipient', 'subject', 'complaint_details', 'request', 'signature'],
  },
};

/**
 * Generate document content
 * @param {string} templateKey - Template key
 * @param {object} data - Document data
 * @returns {object} Document content
 */
function generateDocumentContent(templateKey, data) {
  const template = DOCUMENT_TEMPLATES[templateKey];
  if (!template) {
    return { success: false, error: 'Template not found' };
  }

  const content = {
    template: template.name,
    template_ur: template.name_ur,
    format: template.format,
    generated_at: new Date().toISOString(),
    sections: [],
  };

  // Generate sections based on template
  for (const section of template.sections) {
    switch (section) {
      case 'header':
        content.sections.push({
          type: 'header',
          title: template.name,
          title_ur: template.name_ur,
          date: new Date().toISOString().split('T')[0],
        });
        break;

      case 'assets':
        content.sections.push({
          type: 'assets',
          title: 'Zakatable Assets',
          title_ur: 'زکو٤ة واجب المال',
          items: [
            { label: 'Cash', label_ur: 'نقد', value: data.cash || 0 },
            { label: 'Gold', label_ur: 'سونا', value: data.gold || 0 },
            { label: 'Silver', label_ur: 'چاندی', value: data.silver || 0 },
            { label: 'Investments', label_ur: 'سرمایہ کاری', value: data.investments || 0 },
            { label: 'Business Assets', label_ur: 'کاروباری اثاثے', value: data.business_assets || 0 },
          ],
        });
        break;

      case 'calculation':
        const total = (data.cash || 0) + (data.gold || 0) + (data.silver || 0) +
          (data.investments || 0) + (data.business_assets || 0);
        const zakat = total * 0.025;
        content.sections.push({
          type: 'calculation',
          title: 'Zakat Calculation',
          title_ur: 'زکو٤ة کا حساب',
          formula: 'Total Assets × 2.5%',
          total_assets: total,
          zakat_amount: zakat,
        });
        break;

      case 'nisab':
        content.sections.push({
          type: 'nisab',
          title: 'Nisab Threshold',
          title_ur: 'نصاب',
          gold_nisab: 1574640,
          silver_nisab: 128596,
        });
        break;

      case 'result':
        const totalAssets = (data.cash || 0) + (data.gold || 0) + (data.silver || 0) +
          (data.investments || 0) + (data.business_assets || 0);
        const isDue = totalAssets >= 128596;
        content.sections.push({
          type: 'result',
          title: 'Zakat Result',
          title_ur: 'زکو٤ة کا نتیجہ',
          zakat_due: isDue,
          amount: isDue ? totalAssets * 0.025 : 0,
        });
        break;

      case 'personal_info':
        content.sections.push({
          type: 'personal_info',
          title: 'Personal Information',
          title_ur: 'ذاتی معلومات',
          name: data.name || '',
          cnic: data.cnic || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
        });
        break;

      case 'financing_details':
        content.sections.push({
          type: 'financing_details',
          title: 'Financing Details',
          title_ur: 'فنانسنگ کی تفصیل',
          product: data.product || '',
          amount: data.amount || 0,
          tenure: data.tenure || 0,
          monthly_payment: data.monthly_payment || 0,
        });
        break;

      case 'declaration':
        content.sections.push({
          type: 'declaration',
          title: 'Declaration',
          title_ur: 'بیان',
          text: 'I declare that the information provided is true and correct to the best of my knowledge.',
          text_ur: 'میں بیان کرتا ہوں کہ فراہم کردہ معلومات میری علم کے مطابق صحیح ہیں۔',
        });
        break;

      case 'signature':
        content.sections.push({
          type: 'signature',
          title: 'Signature',
          title_ur: 'دستخط',
          date: new Date().toISOString().split('T')[0],
        });
        break;

      case 'disclaimer':
        content.sections.push({
          type: 'disclaimer',
          title: 'Disclaimer',
          title_ur: 'ڈس کلیمر',
          text: 'This document is computer-generated and for informational purposes only. Please verify with your bank or Shariah advisor.',
          text_ur: 'یہ دستاویز کمپیوٹر جنریٹیڈ ہے اور صرف معلوماتی مقاصد کے لیے ہے۔ اپنے بینک یا شریعہ مشیر سے تصدیق کریں۔',
        });
        break;
    }
  }

  return { success: true, content };
}

/**
 * Generate document as base64
 * @param {string} templateKey - Template key
 * @param {object} data - Document data
 * @returns {object} Generated document
 */
async function generateDocument(templateKey, data) {
  const content = generateDocumentContent(templateKey, data);
  if (!content.success) {
    return content;
  }

  // In production, use libraries like:
  // - PDFKit for PDF generation
  // - docx for DOCX generation
  // - Puppeteer for HTML-to-PDF

  // For now, return JSON content
  return {
    success: true,
    template: templateKey,
    format: DOCUMENT_TEMPLATES[templateKey].format,
    content: content.content,
    note: 'In production, this would be a downloadable PDF/DOCX file',
  };
}

/**
 * Get available templates
 * @returns {Array} Available templates
 */
function getAvailableTemplates() {
  return Object.entries(DOCUMENT_TEMPLATES).map(([key, template]) => ({
    id: key,
    name: template.name,
    name_ur: template.name_ur,
    format: template.format,
    sections: template.sections,
  }));
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — Get available templates
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const action = url.searchParams.get('action');
    const templateId = url.searchParams.get('template_id');

    if (action === 'templates') {
      return res.status(200).json({ templates: getAvailableTemplates() });
    }

    if (action === 'template' && templateId) {
      const template = DOCUMENT_TEMPLATES[templateId];
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      return res.status(200).json({ template_id: templateId, ...template });
    }

    return res.status(200).json({
      message: 'Document Generation API',
      actions: ['generate', 'templates', 'template'],
    });
  }

  // POST — Generate document
  if (req.method === 'POST') {
    try {
      const { action, template, data } = req.body;

      if (action === 'generate' && template && data) {
        const result = await generateDocument(template, data);
        return res.status(200).json(result);
      }

      if (action === 'preview' && template && data) {
        const content = generateDocumentContent(template, data);
        return res.status(200).json(content);
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['generate', 'preview'],
      });
    } catch (err) {
      console.error('Document generation error:', err.message);
      return res.status(500).json({ error: 'Document generation failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
