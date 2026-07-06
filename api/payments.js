// api/payments.js
// Merged payments endpoint — checkout, verify, portal, stripe-webhook
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const pair of cookieHeader.split(';')) {
    const [k, ...v] = pair.split('=');
    cookies[k.trim()] = v.join('=').trim();
  }
  return cookies;
}

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  const cookies = parseCookies(req.headers.cookie);
  return cookies['ibf_token'] || null;
}

function verifyUser(req) {
  const token = extractToken(req);
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// ---- Handlers ----

async function handleCreateCheckout(req, res) {
  const { STRIPE_SECRET_KEY, JWT_SECRET, DATABASE_URL } = process.env;
  if (!JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET not configured' });

  try {
    const user = verifyUser(req);
    if (!user) return res.status(401).json({ error: 'Login required to subscribe' });

    const { tier, provider } = req.body || {};
    const TIER_PRICES = { premium: { pkr: 1500, usd: 5 }, professional: { pkr: 15000, usd: 50 } };
    if (!tier || !TIER_PRICES[tier]) return res.status(400).json({ error: 'Invalid tier. Choose "premium" or "professional".' });

    const PRICE_IDS = { premium: process.env.STRIPE_PRICE_PREMIUM, professional: process.env.STRIPE_PRICE_PROFESSIONAL };

    if (!provider || provider === 'stripe') {
      if (!STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe not configured' });
      const priceId = PRICE_IDS[tier];
      if (!priceId) return res.status(400).json({ error: 'Stripe price not configured' });

      const stripe = new Stripe(STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: user.email,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${req.headers.origin || 'https://islamic-banking-fte.vercel.app'}/dashboard.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || 'https://islamic-banking-fte.vercel.app'}/pricing.html?payment=cancelled`,
        metadata: { userId: user.userId, email: user.email, tier },
      });

      const sql = DATABASE_URL ? neon(DATABASE_URL) : null;
      if (sql) {
        await sql`INSERT INTO subscriptions (user_id, tier, provider, provider_subscription_id, status) VALUES (${user.userId}, ${tier}, 'stripe', ${session.id}, 'pending')`;
      }
      return res.status(200).json({ checkout_url: session.url, provider: 'stripe' });
    }
    return res.status(400).json({ error: 'Invalid provider. Choose "stripe".' });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Invalid or expired token' });
    console.error('create-checkout error:', err.message);
    return res.status(500).json({ error: 'Payment processing failed. Please try again later.' });
  }
}

async function handleVerify(req, res) {
  const { STRIPE_SECRET_KEY, JWT_SECRET, DATABASE_URL } = process.env;
  if (!STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe not configured' });

  try {
    const user = verifyUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const { session_id } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'session_id required' });

    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') return res.status(400).json({ error: 'Payment not completed' });

    const tier = session.metadata?.tier || 'premium';
    const sql = neon(DATABASE_URL);
    await sql`UPDATE users SET tier = ${tier}, updated_at = NOW() WHERE id = ${user.userId}`;
    await sql`UPDATE subscriptions SET status = 'active', start_date = NOW() WHERE user_id = ${user.userId} AND provider = 'stripe' AND provider_subscription_id = ${session_id}`;

    const newToken = jwt.sign({ userId: user.userId, email: user.email, tier }, JWT_SECRET, { expiresIn: '30d' });
    return res.status(200).json({ success: true, tier, token: newToken, user: { email: user.email, tier, queries_today: 0 } });
  } catch (err) {
    console.error('verify error:', err.message);
    return res.status(500).json({ error: 'Verification failed' });
  }
}

async function handlePortal(req, res) {
  const { STRIPE_SECRET_KEY, JWT_SECRET, DATABASE_URL } = process.env;
  if (!STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe not configured' });

  try {
    const user = verifyUser(req);
    if (!user) return res.status(401).json({ error: 'Login required' });

    const sql = neon(DATABASE_URL);
    const subs = await sql`SELECT provider_subscription_id FROM subscriptions WHERE user_id = ${user.userId} AND provider = 'stripe' AND status IN ('active', 'past_due') ORDER BY created_at DESC LIMIT 1`;
    if (subs.length === 0) return res.status(404).json({ error: 'No active Stripe subscription found' });

    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const subscription = await stripe.subscriptions.retrieve(subs[0].provider_subscription_id);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.customer,
      return_url: `${req.headers.origin || 'https://islamic-banking-fte.vercel.app'}/pricing.html`,
    });
    return res.status(200).json({ portal_url: portalSession.url });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Invalid or expired token' });
    console.error('portal error:', err.message);
    return res.status(500).json({ error: 'Failed to create billing portal. Please try again later.' });
  }
}

async function handleWebhook(req, res) {
  // Disable body parsing — Stripe needs raw body
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString();

  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, DATABASE_URL } = process.env;
  if (!STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe not configured' });

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const sql = DATABASE_URL ? neon(DATABASE_URL) : null;
  if (!sql) return res.status(200).json({ received: true });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;
        const subscriptionId = session.subscription;
        if (userId && tier) {
          await sql`UPDATE users SET tier = ${tier}, updated_at = NOW() WHERE id = ${userId}`;
          await sql`UPDATE subscriptions SET status = 'active', provider_subscription_id = ${subscriptionId}, start_date = NOW() WHERE user_id = ${userId} AND provider = 'stripe' AND status = 'pending'`;
          // Send confirmation email
          const RESEND_KEY = process.env.RESEND_API_KEY;
          const FROM_EMAIL = process.env.FROM_EMAIL;
          const userEmail = session.customer_email || session.customer_details?.email;
          if (RESEND_KEY && userEmail) {
            const tierLabel = tier === 'professional' ? 'Professional' : 'Premium';
            fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
              body: JSON.stringify({
                from: `Islamic Banking FTE <${FROM_EMAIL || 'onboarding@resend.dev'}>`,
                to: [userEmail],
                subject: `Welcome to ${tierLabel} — Islamic Banking FTE`,
                html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:20px"><div style="background:#1a4731;color:white;padding:24px;border-radius:12px 12px 0 0;text-align:center"><h2 style="margin:0;font-size:20px">Islamic Banking FTE</h2></div><div style="background:white;padding:28px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px"><p style="color:#333">Assalamu Alaikum,</p><p style="color:#555">Aapka <strong style="color:#1a4731">${tierLabel} plan</strong> activate ho gaya hai!</p><a href="https://islamic-banking-fte.vercel.app/chat" style="display:block;text-align:center;background:#1a4731;color:white;padding:12px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0">Chat karna shuru karein</a></div></div>`
              })
            }).catch(e => console.error('confirmation email failed:', e.message));
          }
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const status = subscription.status === 'active' ? 'active' : subscription.status === 'past_due' ? 'past_due' : 'expired';
        await sql`UPDATE subscriptions SET status = ${status} WHERE provider_subscription_id = ${subscription.id} AND provider = 'stripe'`;
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await sql`UPDATE users SET tier = 'free', updated_at = NOW() WHERE id = (SELECT user_id FROM subscriptions WHERE provider_subscription_id = ${subscription.id} AND provider = 'stripe')`;
        await sql`UPDATE subscriptions SET status = 'expired', end_date = NOW() WHERE provider_subscription_id = ${subscription.id} AND provider = 'stripe'`;
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await sql`UPDATE subscriptions SET status = 'active' WHERE provider_subscription_id = ${invoice.subscription} AND provider = 'stripe'`;
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await sql`UPDATE subscriptions SET status = 'past_due' WHERE provider_subscription_id = ${invoice.subscription} AND provider = 'stripe'`;
        break;
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err.message);
  }
  return res.status(200).json({ received: true });
}

// ---- Router ----
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, `https://${req.headers.host}`);
  const action = url.searchParams.get('action') || '';

  if (action === 'checkout') return handleCreateCheckout(req, res);
  if (action === 'verify') return handleVerify(req, res);
  if (action === 'portal') return handlePortal(req, res);
  if (action === 'webhook') return handleWebhook(req, res);

  // Default: try to infer from method
  if (req.method === 'POST') return handleCreateCheckout(req, res);
  return res.status(400).json({ error: 'Missing action parameter' });
}
