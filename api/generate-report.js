// api/generate-report.js
// PDF Report Generation — Zakat, Murabaha, Ijara reports
// POST /api/generate-report — Generate a structured report (JSON for client-side PDF)

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

/**
 * Generate Zakat calculation report
 * @param {object} data - Zakat calculation data
 * @returns {object} Structured report
 */
function generateZakatReport(data) {
  const {
    cash,
    gold,
    silver,
    investments,
    business_assets,
    total_zakatable,
    zakat_amount,
    nisab_gold,
    nisab_silver,
    currency = 'PKR',
  } = data;

  return {
    report_type: 'Zakat Calculation Report',
    report_type_ur: 'زکوٰة کی تفصیل',
    generated_at: new Date().toISOString(),
    sections: [
      {
        title: 'Zakatable Assets',
        title_ur: 'زکوٰة واجب المال',
        items: [
          { label: 'Cash in Hand', label_ur: 'نقد', value: cash || 0 },
          { label: 'Gold Value', label_ur: 'سونے کی قیمت', value: gold || 0 },
          { label: 'Silver Value', label_ur: 'چاندی کی قیمت', value: silver || 0 },
          { label: 'Investments', label_ur: 'سرمایہ کاری', value: investments || 0 },
          { label: 'Business Assets', label_ur: 'کاروباری اثاثے', value: business_assets || 0 },
        ],
      },
      {
        title: 'Zakat Summary',
        title_ur: 'زکوٰة کا خلاصہ',
        items: [
          { label: 'Total Zakatable Assets', label_ur: 'کل زکوٰة واجب المال', value: total_zakatable || 0 },
          { label: 'Nisab (Gold)', label_ur: 'نصاب (سونا)', value: nisab_gold || 0 },
          { label: 'Nisab (Silver)', label_ur: 'نصاب (چاندی)', value: nisab_silver || 0 },
          { label: 'Zakat Due (2.5%)', label_ur: 'زکوٰة واجب (2.5%)', value: zakat_amount || 0, highlighted: true },
        ],
      },
    ],
    disclaimer: 'This is a computer-generated report. Please verify with a qualified Islamic scholar before paying Zakat.',
    disclaimer_ur: 'یہ کمپیوٹر جنریٹیڈ رپورٹ ہے۔ زکوٰة ادا کرنے سے پہلے کسی تعلیم یافتہ اسلامی عالم سے رجوع کریں۔',
  };
}

/**
 * Generate Murabaha calculation report
 * @param {object} data - Murabaha calculation data
 * @returns {object} Structured report
 */
function generateMurabahaReport(data) {
  const {
    item_name,
    cost_price,
    profit_margin,
    selling_price,
    monthly_payment,
    tenure_months,
    total_profit,
    total_amount,
  } = data;

  return {
    report_type: 'Murabaha Financing Report',
    report_type_ur: 'مرابحہ فنانسنگ رپورٹ',
    generated_at: new Date().toISOString(),
    sections: [
      {
        title: 'Financing Details',
        title_ur: 'فنانسنگ کی تفصیل',
        items: [
          { label: 'Item', label_ur: 'اشیاء', value: item_name || 'N/A' },
          { label: 'Cost Price', label_ur: 'لاگت', value: cost_price || 0 },
          { label: 'Profit Margin', label_ur: 'منافع کا حساب', value: profit_margin ? `${profit_margin}%` : 'N/A' },
          { label: 'Selling Price', label_ur: 'فروخت قیمت', value: selling_price || 0 },
        ],
      },
      {
        title: 'Payment Schedule',
        title_ur: 'ادائیگی کا شیڈول',
        items: [
          { label: 'Monthly Payment', label_ur: 'ماہانہ قسط', value: monthly_payment || 0, highlighted: true },
          { label: 'Tenure', label_ur: 'مدت', value: tenure_months ? `${tenure_months} months` : 'N/A' },
          { label: 'Total Profit', label_ur: 'کل منافع', value: total_profit || 0 },
          { label: 'Total Amount', label_ur: 'کل رقم', value: total_amount || 0 },
        ],
      },
    ],
    disclaimer: 'This is a computer-generated estimate. Actual terms may vary. Please verify with your bank.',
    disclaimer_ur: 'یہ کمپیوٹر جنریٹیڈ تخمینہ ہے۔ اصل شرائط مختلف ہو سکتی ہیں۔ اپنے بینک سے تصدیق کریں۔',
  };
}

/**
 * Generate Ijara (lease) report
 * @param {object} data - Ijara calculation data
 * @returns {object} Structured report
 */
function generateIjaraReport(data) {
  const {
    asset_name,
    asset_value,
    monthly_rental,
    tenure_months,
    total_rental,
    security_deposit,
    ownership_transfer,
  } = data;

  return {
    report_type: 'Ijara (Lease) Report',
    report_type_ur: 'اجارہ (قید) رپورٹ',
    generated_at: new Date().toISOString(),
    sections: [
      {
        title: 'Lease Details',
        title_ur: 'اجارہ کی تفصیل',
        items: [
          { label: 'Asset', label_ur: 'اثاثہ', value: asset_name || 'N/A' },
          { label: 'Asset Value', label_ur: 'اثاثے کی قیمت', value: asset_value || 0 },
          { label: 'Monthly Rental', label_ur: 'ماہانہ کرایہ', value: monthly_rental || 0, highlighted: true },
          { label: 'Tenure', label_ur: 'مدت', value: tenure_months ? `${tenure_months} months` : 'N/A' },
        ],
      },
      {
        title: 'Cost Summary',
        title_ur: 'لاگت کا خلاصہ',
        items: [
          { label: 'Total Rental', label_ur: 'کل کرایہ', value: total_rental || 0 },
          { label: 'Security Deposit', label_ur: '安全保障', value: security_deposit || 0 },
          { label: 'Ownership Transfer', label_ur: 'تملک کی منتقلی', value: ownership_transfer ? 'Yes' : 'No' },
        ],
      },
    ],
    disclaimer: 'This is a computer-generated estimate. Actual lease terms may vary. Please verify with your bank.',
    disclaimer_ur: 'یہ کمپیوٹر جنریٹیڈ تخمینہ ہے۔ اصل اجارہ کی شرائط مختلف ہو سکتی ہیں۔ اپنے بینک سے تصدیق کریں۔',
  };
}

/**
 * Generate a comprehensive financial summary report
 * @param {object} data - Financial data
 * @returns {object} Structured report
 */
function generateSummaryReport(data) {
  const {
    name,
    zakat_amount,
    total_assets,
    total_liabilities,
    net_worth,
  } = data;

  return {
    report_type: 'Islamic Financial Summary Report',
    report_type_ur: 'اسلامی مالی خلاصہ رپورٹ',
    generated_at: new Date().toISOString(),
    sections: [
      {
        title: 'Financial Overview',
        title_ur: 'مالی جائزہ',
        items: [
          { label: 'Name', label_ur: 'نام', value: name || 'N/A' },
          { label: 'Total Assets', label_ur: 'کل اثاثے', value: total_assets || 0 },
          { label: 'Total Liabilities', label_ur: 'کل قرضے', value: total_liabilities || 0 },
          { label: 'Net Worth', label_ur: 'خالص اثاثے', value: net_worth || 0, highlighted: true },
        ],
      },
      {
        title: 'Zakat Summary',
        title_ur: 'زکوٰة کا خلاصہ',
        items: [
          { label: 'Zakat Due (2.5%)', label_ur: 'زکوٰة واجب (2.5%)', value: zakat_amount || 0, highlighted: true },
        ],
      },
    ],
    disclaimer: 'This is a computer-generated report for informational purposes only. Please consult a qualified Islamic scholar for religious guidance.',
    disclaimer_ur: 'یہ صرف معلوماتی مقاصد کے لیے کمپیوٹر جنریٹیڈ رپورٹ ہے۔ مذہبی رہنمائی کے لیے کسی تعلیم یافتہ اسلامی عالم سے رجوع کریں۔',
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST — Generate report
  if (req.method === 'POST') {
    try {
      const { report_type, data } = req.body;
      if (!report_type || !data) {
        return res.status(400).json({ error: 'report_type and data required' });
      }

      let report;
      switch (report_type) {
        case 'zakat':
          report = generateZakatReport(data);
          break;
        case 'murabaha':
          report = generateMurabahaReport(data);
          break;
        case 'ijara':
          report = generateIjaraReport(data);
          break;
        case 'summary':
          report = generateSummaryReport(data);
          break;
        default:
          return res.status(400).json({ error: 'Invalid report_type. Use: zakat, murabaha, ijara, summary' });
      }

      return res.status(200).json(report);
    } catch (err) {
      console.error('Report generation error:', err.message);
      return res.status(500).json({ error: 'Report generation failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
