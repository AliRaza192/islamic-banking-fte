const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

export function setCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCors(req, res);
    return res.status(200).end();
  }
  return false;
}
