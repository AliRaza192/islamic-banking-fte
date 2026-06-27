import Stripe from 'stripe';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// Disable body parsing — Stripe needs raw body for signature verification
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, DATABASE_URL } = process.env;
  if (!STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe not configured' });

  // Read raw body
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString();

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  let event;

  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;
  const sql = pool;
  if (!sql) return res.status(200).json({ received: true });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;
        const subscriptionId = session.subscription;

        if (userId && tier) {
          // Update user tier
          await sql`UPDATE users SET tier = ${tier}, updated_at = NOW() WHERE id = ${userId}`;
          // Activate subscription
          await sql`
            UPDATE subscriptions
            SET status = 'active', provider_subscription_id = ${subscriptionId}, start_date = NOW()
            WHERE user_id = ${userId} AND provider = 'stripe' AND status = 'pending'
          `;

          // Send confirmation email via Resend
          const RESEND_KEY = process.env.RESEND_API_KEY;
          const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
          const userEmail  = session.customer_email || session.customer_details?.email;

          if (RESEND_KEY && userEmail) {
            const tierLabel = tier === 'professional' ? 'Professional' : 'Premium';
            fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
              body: JSON.stringify({
                from: `Islamic Banking FTE <${FROM_EMAIL}>`,
                to: [userEmail],
                subject: `🎉 Welcome to ${tierLabel} — Islamic Banking FTE`,
                html: `
                  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:20px">
                    <div style="background:#1a4731;color:white;padding:24px;border-radius:12px 12px 0 0;text-align:center">
                      <div style="font-size:36px;margin-bottom:8px">🕌</div>
                      <h2 style="margin:0;font-size:20px">Islamic Banking FTE</h2>
                      <p style="margin:4px 0 0;opacity:.8;font-size:13px">بسم الله الرحمن الرحيم</p>
                    </div>
                    <div style="background:white;padding:28px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px">
                      <p style="color:#333;font-size:15px">Assalamu Alaikum,</p>
                      <p style="color:#555">Aapka <strong style="color:#1a4731">${tierLabel} plan</strong> activate ho gaya hai!</p>
                      <div style="background:#f0f9f4;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #52b788">
                        <p style="margin:0;font-size:13px;color:#1a4731"><strong>Aapke paas ab hai:</strong></p>
                        <ul style="margin:8px 0 0;padding-left:20px;color:#2d6a4f;font-size:13px">
                          ${tier === 'professional' 
                            ? '<li>Unlimited AI queries per day</li><li>All calculator features</li><li>Priority support</li>' 
                            : '<li>100 AI queries per day</li><li>All calculator features</li><li>Email support</li>'}
                        </ul>
                      </div>
                      <a href="https://islamic-banking-fte.vercel.app/chat" style="display:block;text-align:center;background:#1a4731;color:white;padding:12px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0">Chat karna shuru karein →</a>
                      <p style="font-size:11px;color:#aaa;text-align:center;margin:0">Subscription manage karne ke liye <a href="https://islamic-banking-fte.vercel.app/pricing" style="color:#1a4731">Pricing page</a> pe jayein.</p>
                    </div>
                  </div>
                `
              })
            }).catch(e => console.error('confirmation email failed:', e.message));
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const status = subscription.status === 'active' ? 'active' :
                       subscription.status === 'past_due' ? 'past_due' : 'expired';
        await sql`
          UPDATE subscriptions SET status = ${status}
          WHERE provider_subscription_id = ${subscription.id} AND provider = 'stripe'
        `;
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        // Revert user to free tier
        await sql`
          UPDATE users SET tier = 'free', updated_at = NOW()
          WHERE id = (
            SELECT user_id FROM subscriptions
            WHERE provider_subscription_id = ${subscription.id} AND provider = 'stripe'
          )
        `;
        await sql`
          UPDATE subscriptions SET status = 'expired', end_date = NOW()
          WHERE provider_subscription_id = ${subscription.id} AND provider = 'stripe'
        `;
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        await sql`
          UPDATE subscriptions SET status = 'active'
          WHERE provider_subscription_id = ${subscriptionId} AND provider = 'stripe'
        `;
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        await sql`
          UPDATE subscriptions SET status = 'past_due'
          WHERE provider_subscription_id = ${subscriptionId} AND provider = 'stripe'
        `;
        break;
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err.message);
  }

  return res.status(200).json({ received: true });
}