import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

function verifyToken(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { STRIPE_SECRET_KEY, JWT_SECRET, DATABASE_URL } = process.env;
  if (!STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe not configured' });

  try {
    const user = verifyToken(req);
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const { session_id } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'session_id required' });

    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const tier = session.metadata?.tier || 'premium';
    const sql = neon(DATABASE_URL);

    // Update user tier
    await sql`UPDATE users SET tier = ${tier}, updated_at = NOW() WHERE id = ${user.userId}`;

    // Update subscription
    await sql`
      UPDATE subscriptions
      SET status = 'active', start_date = NOW()
      WHERE user_id = ${user.userId} AND provider = 'stripe' AND provider_subscription_id = ${session_id}
    `;

    // Generate new JWT with updated tier
    const newToken = jwt.sign(
      { userId: user.userId, email: user.email, tier },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      tier,
      token: newToken,
      user: { email: user.email, tier, queries_today: 0 }
    });

  } catch (err) {
    console.error('verify error:', err.message);
    return res.status(500).json({ error: 'Verification failed' });
  }
}