# 🕌 Islamic Banking FTE

> **بسم الله الرحمن الرحيم**

Pakistan's first AI-powered Islamic Banking Digital FTE (Full-Time Employee) — providing 24/7 Shariah-compliant financial guidance in Urdu & English.

**Live Demo:** [islamic-banking-fte.vercel.app](https://islamic-banking-fte.vercel.app)

---

## ✨ Features

| Feature | Status |
|---|---|
| 🤖 AI Chat (Gemini 2.5 Flash) | ✅ Live |
| 📊 Islamic Finance Calculators | ✅ Live |
| 🏦 Pakistan Banks Directory | ✅ Live |
| 🌙 Zakat Calculator | ✅ Live |
| ✅ Shariah Compliance Checker | ✅ Live |
| 🔐 OTP Email Authentication | ✅ Live |
| 💎 Pricing Plans (Free/Premium/Pro) | ✅ Live |
| 💳 Stripe Payments | ✅ Live |
| 📱 PWA (Installable App) | ✅ Live |
| 🌐 Urdu Script Toggle | ✅ Live |
| 📈 User Dashboard | ✅ Live |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — no framework |
| AI Model | Google Gemini 2.5 Flash |
| Backend | Vercel Serverless Functions (Node.js ESM) |
| Database | Neon PostgreSQL (serverless) |
| Auth | Email OTP via Resend |
| Payments | Stripe (international) + JazzCash (Pakistan) |
| Hosting | Vercel (free tier) |
| Methodology | Panaversity AgentFactory |

**Monthly cost at scale:** ~$0 on free tiers

---

## 🗂️ Project Structure

```
islamic-banking-fte/
├── .claude-plugin/          # AgentFactory plugin metadata
├── api/
│   ├── chat.js              # Main AI proxy — Gemini + system prompt
│   ├── health.js            # Health check endpoint
│   ├── history.js           # Conversation history
│   ├── auth/
│   │   ├── send-otp.js      # Send OTP via Resend
│   │   ├── verify-otp.js    # Verify OTP + issue token
│   │   └── me.js            # Token verify + user data
│   └── payments/
│       ├── create-checkout.js   # Stripe checkout session
│       ├── stripe-webhook.js    # Stripe webhook handler
│       ├── verify.js            # Payment verification
│       ├── jazzcash-init.js     # JazzCash payment init
│       └── jazzcash-callback.js # JazzCash callback
├── commands/                # Slash command definitions
├── evals/                   # Test cases for AI responses
├── hooks/                   # AgentFactory lifecycle hooks
├── references/              # Pakistan banks, products data
├── skills/                  # 10 specialist Islamic finance skills
├── web/
│   ├── index.html           # (redirects to landing)
│   ├── landing.html         # Marketing landing page
│   ├── chat.html            # Main AI chat interface
│   ├── calculators.html     # Islamic finance calculators
│   ├── banks.html           # Pakistan banks directory
│   ├── pricing.html         # Pricing plans
│   ├── dashboard.html       # User dashboard
│   ├── app.js               # Chat UI logic
│   ├── auth.js              # Auth module
│   ├── style.css            # Shared styles
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service worker
│   └── js/
│       └── calculators.js   # Deterministic finance calculators
├── workflow-recipes/        # AgentFactory workflow definitions
├── CLAUDE.md                # AI system prompt + role definition
├── ROADMAP.md               # Development roadmap
├── schema.sql               # Database schema
└── vercel.json              # Vercel deployment config
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- Vercel CLI: `npm i -g vercel`
- Neon account (free): [neon.tech](https://neon.tech)
- Resend account (free): [resend.com](https://resend.com)
- Google AI Studio key: [aistudio.google.com](https://aistudio.google.com)

### 1. Clone & Install

```bash
git clone https://github.com/AliRaza192/islamic-banking-fte.git
cd islamic-banking-fte
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
# AI
GEMINI_API_KEY=AIzaSy-your-key-here
GEMINI_MODEL=gemini-2.5-flash

# Database
DATABASE_URL=postgresql://neon-connection-string

# Auth
RESEND_API_KEY=re_your-key-here
JWT_SECRET=your-random-32-char-string

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
STRIPE_PRICE_PREMIUM=price_xxxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxxx

# Admin Dashboard
ADMIN_PASSWORD=your_strong_admin_password

# Live Gold Rates (optional — https://goldapi.io free tier)
GOLD_API_KEY=your_goldapi_key_here
```

### 3. Database Setup

Run `schema.sql` in Neon SQL Editor:

```bash
psql $DATABASE_URL < schema.sql
```

### 4. Stripe Setup (Step-by-Step)

1. **Stripe account banao** → https://dashboard.stripe.com/register
2. **Two products banao** in Stripe Dashboard:
   - Product 1: "Islamic Banking FTE Premium" → Price: $5/month recurring → Copy `price_xxxxx` ID
   - Product 2: "Islamic Banking FTE Professional" → Price: $50/month recurring → Copy `price_xxxxx` ID
3. **Vercel env vars mein paste karo:**
   ```
   STRIPE_PRICE_PREMIUM=price_xxxxx
   STRIPE_PRICE_PROFESSIONAL=price_xxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxx
   ```
4. **Webhook configure karo** in Stripe Dashboard → Developers → Webhooks:
   - URL: `https://islamic-banking-fte.vercel.app/api/payments/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy Webhook Signing Secret → `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

### 5. Admin Dashboard

Access at: `https://your-domain.vercel.app/admin`  
Password: value of `ADMIN_PASSWORD` env var

### 6. Run Locally

```bash
vercel dev
# Opens at http://localhost:3000
```

---

## 🌐 Deploy to Vercel

```bash
vercel --prod
```

Add environment variables in Vercel Dashboard:
`Settings → Environment Variables`

---

## 🧠 AgentFactory Methodology

This project follows [Panaversity AgentFactory](https://agentfactory.panaversity.org/) guidelines:

- **CLAUDE.md** — Complete AI role definition, capabilities, constraints
- **Skills** — 10 specialist Islamic finance skill modules
- **Commands** — Slash command definitions (`/calculate`, `/zakat`, `/check-halal`, `/compare`)
- **Hooks** — Pre/post processing hooks
- **Evals** — Test cases for AI response quality
- **References** — Pakistan banks, products, AAOIFI standards
- **Workflow Recipes** — Multi-step finance workflows

---

## 📊 Islamic Finance Calculators

All calculations are **deterministic formula-based** — not LLM-generated:

| Calculator | Formula |
|---|---|
| Murabaha | Cost + (Financed × Rate × Tenure) |
| Diminishing Musharakah | Decreasing rent + fixed buyback |
| Ijara | Depreciation + rental income |
| Zakat | 2.5% on wealth above silver nisab |
| Sukuk | Face value × periodic rate |

---

## 🏦 Covered Islamic Banks

**Full Islamic:** Meezan Bank, Dubai Islamic Bank Pakistan, Bank Islami, Al Baraka Bank, MCB Islamic, Faysal Bank

**Islamic Windows:** HBL Islamic, UBL Ameen, NBP Islamic, Habib Metro Islamic

**Microfinance:** NRSP Microfinance, Akhuwat (Qard Hasan), Kashf Foundation

---

## ⚠️ Disclaimer

This platform is for **educational purposes only**. It does not constitute:
- A formal Fatwa or binding Shariah ruling
- Official financial advice
- A licensed banking service

Always consult your bank's Shariah Advisor for financial decisions.

---

## 📜 License

MIT License — See [LICENSE](LICENSE)

---

*Developed following Panaversity AgentFactory methodology*
*جزاک اللہ خیراً*