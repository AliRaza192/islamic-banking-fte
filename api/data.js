// api/data.js
// Merged data endpoint — rates, bank-rates, compare-banks, health
import { neon } from '@neondatabase/serverless';

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

function setCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// ---- Rates Cache ----
const ratesCache = { data: null, ts: 0 };
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

const BANK_RATES = [
  { bank: 'Meezan Bank', products: [
    { type: 'car', name: 'Faraz Islamic Car Ijara', rate: '16.5-19.5%', benchmark: 'KIBOR', method: 'Ijara' },
    { type: 'home', name: 'Meezan Home Finance', rate: '17-20%', benchmark: 'KIBOR', method: 'Diminishing Musharakah' },
    { type: 'personal', name: 'Meezan Personal Financing', rate: '18-22%', benchmark: 'KIBOR', method: 'Murabaha' },
    { type: 'business', name: 'Meezan Business Financing', rate: '16-19%', benchmark: 'KIBOR', method: 'Murabaha' },
  ]},
  { bank: 'Dubai Islamic Bank', products: [
    { type: 'car', name: 'DIB Car Ijara', rate: '17-20%', benchmark: 'KIBOR', method: 'Ijara' },
    { type: 'home', name: 'DIB Home Finance', rate: '17.5-20.5%', benchmark: 'KIBOR', method: 'Diminishing Musharakah' },
    { type: 'personal', name: 'DIB Personal Finance', rate: '19-23%', benchmark: 'KIBOR', method: 'Murabaha' },
    { type: 'business', name: 'DIB Business Finance', rate: '16.5-19.5%', benchmark: 'KIBOR', method: 'Murabaha' },
  ]},
  { bank: 'BankIslami', products: [
    { type: 'car', name: 'BankIslami Car Ijara', rate: '17.5-20.5%', benchmark: 'KIBOR', method: 'Ijara' },
    { type: 'home', name: 'BankIslami Home Finance', rate: '18-21%', benchmark: 'KIBOR', method: 'Diminishing Musharakah' },
    { type: 'personal', name: 'BankIslami Personal Finance', rate: '19.5-23.5%', benchmark: 'KIBOR', method: 'Murabaha' },
    { type: 'business', name: 'BankIslami Business Finance', rate: '17-20%', benchmark: 'KIBOR', method: 'Murabaha' },
  ]},
  { bank: 'Al Baraka Bank', products: [
    { type: 'car', name: 'Al Baraka Car Ijara', rate: '17-20%', benchmark: 'KIBOR', method: 'Ijara' },
    { type: 'home', name: 'Al Baraka Home Finance', rate: '17.5-20.5%', benchmark: 'KIBOR', method: 'Diminishing Musharakah' },
    { type: 'personal', name: 'Al Baraka Personal Finance', rate: '19-23%', benchmark: 'KIBOR', method: 'Murabaha' },
    { type: 'business', name: 'Al Baraka Business Finance', rate: '16.5-19.5%', benchmark: 'KIBOR', method: 'Murabaha' },
  ]},
  { bank: 'Faysal Bank', products: [
    { type: 'car', name: 'Faysal Islamic Car Ijara', rate: '17-20%', benchmark: 'KIBOR', method: 'Ijara' },
    { type: 'home', name: 'Faysal Home Finance', rate: '17.5-20.5%', benchmark: 'KIBOR', method: 'Diminishing Musharakah' },
    { type: 'personal', name: 'Faysal Personal Finance', rate: '19-23%', benchmark: 'KIBOR', method: 'Murabaha' },
    { type: 'business', name: 'Faysal Business Finance', rate: '16.5-19.5%', benchmark: 'KIBOR', method: 'Murabaha' },
  ]},
  { bank: 'Habib Metropolitan Bank', products: [
    { type: 'car', name: 'HBL Islamic Car Ijara', rate: '17.5-20.5%', benchmark: 'KIBOR', method: 'Ijara' },
    { type: 'home', name: 'HBL Islamic Home Finance', rate: '18-21%', benchmark: 'KIBOR', method: 'Diminishing Musharakah' },
    { type: 'personal', name: 'HBL Islamic Personal Finance', rate: '19.5-23.5%', benchmark: 'KIBOR', method: 'Murabaha' },
    { type: 'business', name: 'HBL Islamic Business Finance', rate: '17-20%', benchmark: 'KIBOR', method: 'Murabaha' },
  ]},
  { bank: 'Askari Bank', products: [
    { type: 'car', name: 'Askari Islamic Car Ijara', rate: '17-20%', benchmark: 'KIBOR', method: 'Ijara' },
    { type: 'home', name: 'Askari Islamic Home Finance', rate: '17.5-20.5%', benchmark: 'KIBOR', method: 'Diminishing Musharakah' },
    { type: 'personal', name: 'Askari Islamic Personal Finance', rate: '19-23%', benchmark: 'KIBOR', method: 'Murabaha' },
    { type: 'business', name: 'Askari Islamic Business Finance', rate: '16.5-19.5%', benchmark: 'KIBOR', method: 'Murabaha' },
  ]},
  { bank: 'Soneri Bank', products: [
    { type: 'car', name: 'Soneri Islamic Car Ijara', rate: '17.5-20.5%', benchmark: 'KIBOR', method: 'Ijara' },
    { type: 'home', name: 'Soneri Islamic Home Finance', rate: '18-21%', benchmark: 'KIBOR', method: 'Diminishing Musharakah' },
    { type: 'personal', name: 'Soneri Islamic Personal Finance', rate: '19.5-23.5%', benchmark: 'KIBOR', method: 'Murabaha' },
    { type: 'business', name: 'Soneri Islamic Business Finance', rate: '17-20%', benchmark: 'KIBOR', method: 'Murabaha' },
  ]},
  { bank: 'Habib Metropolitan Islamic', products: [
    { type: 'car', name: 'Habib Metro Car Ijara', rate: '17-20%', benchmark: 'KIBOR', method: 'Ijara' },
    { type: 'home', name: 'Habib Metro Home Finance', rate: '17.5-20.5%', benchmark: 'KIBOR', method: 'Diminishing Musharakah' },
    { type: 'business', name: 'Habib Metro Business Murabaha', rate: '16.5-19.5%', benchmark: 'KIBOR', method: 'Murabaha' },
  ]},
];

const BANK_COMPARISON = [
  { name: 'Meezan Bank', shariah_board: 'Mufti Muhammad Taqi Usmani', app: 'Meezan Bank App', branches: '1000+', strengths: ['Largest Islamic bank', 'Full product range', 'Strong digital presence'] },
  { name: 'Dubai Islamic Bank', shariah_board: 'Shariah Supervisory Board', app: 'DIB Mobile App', branches: '300+', strengths: ['Strong brand', 'Innovative products', 'International presence'] },
  { name: 'Bank Islami', shariah_board: 'Shariah Advisory Committee', app: 'BankIslami App', branches: '350+', strengths: ['Digital banking', 'Roshan account', 'Competitive rates'] },
  { name: 'Faysal Bank', shariah_board: 'Shariah Advisory Committee', app: 'Faysal Islamic App', branches: '800+', strengths: ['Wide branch network', 'Competitive pricing', 'Strong SME focus'] },
  { name: 'Al Baraka Bank', shariah_board: 'AAOIFI certified', app: 'Al Baraka App', branches: '250+', strengths: ['Gulf remittance corridors', 'International presence', 'Musharakah products'] },
];

// ---- Handlers ----

async function handleRates(req, res) {
  const now = Date.now();
  if (ratesCache.data && now - ratesCache.ts < CACHE_TTL) {
    return res.status(200).json(ratesCache.data);
  }

  try {
    const { GOLD_API_KEY } = process.env;
    const currencyRes = await fetch('https://open.er-api.com/v6/latest/USD');
    const currencyData = await currencyRes.json();
    const usdToPKR = currencyData.rates?.PKR || 280;

    let goldPKRPerTola = 245000;
    let silverPKRPerTola = 2700;

    if (GOLD_API_KEY && GOLD_API_KEY !== 'goldapi.io') {
      try {
        const goldRes = await fetch('https://www.goldapi.io/api/XAU/PKR', {
          headers: { 'x-access-token': GOLD_API_KEY, 'Content-Type': 'application/json' },
        });
        if (goldRes.ok) {
          const goldData = await goldRes.json();
          goldPKRPerTola = Math.round((goldData.price || 0) * 1.174);
        }
      } catch {}
    }

    const nisabGold = Math.round(goldPKRPerTola * 7.5);
    const nisabSilver = Math.round(silverPKRPerTola * 52.5);

    const result = {
      gold: { pkrsPerTola: goldPKRPerTola, pkrsPerGram: Math.round(goldPKRPerTola / 11.664) },
      silver: { pkrsPerTola: silverPKRPerTola, pkrsPerGram: Math.round(silverPKRPerTola / 31.1035) },
      nisab: { gold: nisabGold, silver: nisabSilver, lower: Math.min(nisabGold, nisabSilver) },
      currency: { usdPKR: usdToPKR },
      lastUpdated: new Date().toISOString(),
    };

    ratesCache.data = result;
    ratesCache.ts = now;
    return res.status(200).json(result);
  } catch (err) {
    console.error('rates error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch rates' });
  }
}

function handleBanks(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const bank = url.searchParams.get('bank');
  const product = url.searchParams.get('product');

  let filtered = BANK_RATES;
  if (bank) filtered = filtered.filter(b => b.bank.toLowerCase().includes(bank.toLowerCase()));
  if (product) filtered = filtered.map(b => ({ ...b, products: b.products.filter(p => p.type === product) })).filter(b => b.products.length > 0);

  const result = { banks: filtered, lastUpdated: new Date().toISOString() };
  return res.status(200).json(result);
}

function handleCompare(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const bank = url.searchParams.get('bank');
  const productType = url.searchParams.get('type') || 'home';

  if (bank) {
    const found = BANK_COMPARISON.find(b => b.name.toLowerCase().includes(bank.toLowerCase()));
    if (!found) return res.status(404).json({ error: 'Bank not found' });
    return res.status(200).json(found);
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const type = body.type || productType;
    const rates = BANK_RATES.map(b => ({ bank: b.bank, products: b.products.filter(p => p.type === type) })).filter(b => b.products.length > 0);
    return res.status(200).json({ type, banks: rates, compared_at: new Date().toISOString() });
  }

  return res.status(200).json({ banks: BANK_COMPARISON, product_types: ['home', 'car', 'business', 'savings'] });
}

async function handleHealth(req, res) {
  const checks = { gemini: !!process.env.GEMINI_API_KEY, database: false, version: '1.0.0' };
  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      await sql`SELECT 1`;
      checks.database = true;
    } catch { checks.database = false; }
  }
  const ok = checks.gemini && checks.database;
  return res.status(ok ? 200 : 503).json(checks);
}

// ---- Router ----
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, `https://${req.headers.host}`);
  const action = url.searchParams.get('action') || '';

  if (action === 'rates') return handleRates(req, res);
  if (action === 'banks') return handleBanks(req, res);
  if (action === 'compare') return handleCompare(req, res);
  if (action === 'health') return handleHealth(req, res);

  // Default to rates
  return handleRates(req, res);
}
