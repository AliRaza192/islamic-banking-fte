// api/payments/portal.js
// Stripe Customer Portal — user apna subscription manage/cancel kar sakta hai
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { STRIPE_SECRET_KEY, JWT_SECRET, DATABASE_URL } = process.env;
  if (!STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe not configured' });

  try {
    // Verify JWT
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Login required' });
    }
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const pool = new Pool({ connectionString: DATABASE_URL });
    const sql = pool;

    // Get user's Stripe customer ID from subscriptions
    const subs = await sql`
      SELECT provider_subscription_id FROM subscriptions
      WHERE user_id = ${decoded.userId}
        AND provider = 'stripe'
        AND status IN ('active', 'past_due')
      ORDER BY created_at DESC LIMIT 1
    `;

    if (subs.length === 0) {
      return res.status(404).json({ error: 'No active Stripe subscription found' });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);

    // Get subscription to find customer ID
    const subscription = await stripe.subscriptions.retrieve(subs[0].provider_subscription_id);
    const customerId = subscription.customer;

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin || 'https://islamic-banking-fte.vercel.app'}/pricing.html`,
    });

    return res.status(200).json({ portal_url: portalSession.url });

  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('portal error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}