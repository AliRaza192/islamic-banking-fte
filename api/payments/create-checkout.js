import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

neonConfig.webSocketConstructor = ws;

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

function setCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

const TIER_PRICES = {
  premium: { pkr: 1500, usd: 5 },
  professional: { pkr: 15000, usd: 50 },
};

const PRICE_IDS = {
  premium: process.env.STRIPE_PRICE_PREMIUM,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL,
};

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { STRIPE_SECRET_KEY, JWT_SECRET, DATABASE_URL } = process.env;
  if (!JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET not configured' });

  try {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Login required to subscribe' });
    }

    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const { tier, provider } = req.body || {};

    if (!tier || !TIER_PRICES[tier]) {
      return res.status(400).json({ error: 'Invalid tier. Choose "premium" or "professional".' });
    }

    const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;
    const sql = pool
      ? (strings, ...vals) => pool.query(strings, vals).then(r => r.rows)
      : null;

    // ---- STRIPE ----
    if (!provider || provider === 'stripe') {
      if (!STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe not configured' });

      const priceId = PRICE_IDS[tier];
      if (!priceId) return res.status(400).json({ error: 'Stripe price not configured' });

      const stripe = new Stripe(STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: decoded.email,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${req.headers.origin || 'https://islamic-banking-fte.vercel.app'}/dashboard.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || 'https://islamic-banking-fte.vercel.app'}/pricing.html?payment=cancelled`,
        metadata: { userId: decoded.userId, email: decoded.email, tier },
      });

      // Store subscription (default status = active, webhook updates if needed)
      if (sql) {
        await sql`
          INSERT INTO subscriptions (user_id, tier, provider, provider_subscription_id)
          VALUES (${decoded.userId}, ${tier}, 'stripe', ${session.id})
        `;
      }

      return res.status(200).json({ checkout_url: session.url, provider: 'stripe' });
    }

    return res.status(400).json({ error: 'Invalid provider. Choose "stripe".' });

  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('create-checkout error:', err.message);
    return res.status(500).json({ error: err.message || 'Payment processing failed' });
  }
}
