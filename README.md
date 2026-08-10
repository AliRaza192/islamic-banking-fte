# 🕌 Islamic Banking FTE

> **بسم الله الرحمن الرحيم**

Pakistan's first AI-powered Islamic Banking Digital FTE (Full-Time Employee) — providing 24/7 Shariah-compliant financial guidance in Urdu & English across 13 global jurisdictions.

**Live Demo:** [islamic-banking-fte.vercel.app](https://islamic-banking-fte.vercel.app)

---

## ✨ Features

| Feature | Status |
|---|---|
| 🤖 AI Chat (Gemini 2.5 Flash) | ✅ Live |
| 📊 6 Islamic Finance Calculators | ✅ Live |
| 🏦 13 Pakistan Banks Directory | ✅ Live |
| 🌙 Zakat Calculator (Live Rates) | ✅ Live |
| ✅ Shariah Compliance Checker | ✅ Live |
| 🔐 OTP Email Authentication | ✅ Live |
| 💎 3-Tier Pricing (Free/Premium/Pro) | ✅ Live |
| 💳 Stripe Payments | ✅ Live |
| 📱 PWA (Installable App) | ✅ Live |
| 🌐 Urdu/English Bilingual | ✅ Live |
| 📈 User Dashboard | ✅ Live |
| 🔧 Admin Dashboard | ✅ Live |
| 🌍 13 Jurisdiction Overlays | ✅ Live |
| 🧠 19 AI Specialist Skills | ✅ Live |
| 🛡️ Security (XSS, Injection, Toxicity) | ✅ Live |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — no framework |
| AI Model | Google Gemini 2.5 Flash |
| Backend | Vercel Serverless Functions (Node.js ESM) |
| Database | Neon PostgreSQL (serverless) |
| Auth | Email OTP via Resend + JWT |
| Payments | Stripe (subscription management) |
| Hosting | Vercel (free tier) |
| Methodology | Panaversity AgentFactory |
| Standards | AAOIFI FAS 2/3/4/8/9/32, Shariah Standards 17/21/26 |

**Monthly cost at scale:** ~$0 on free tiers

---

## 🗂️ Project Structure

```
islamic-banking-fte/
├── api/
│   ├── chat.js              # Main AI proxy + skill routing (1300+ lines)
│   ├── data.js              # Rates, banks, compare, health endpoints
│   ├── payments.js          # Stripe checkout, webhooks, portal
│   ├── user.js              # History, feedback
│   ├── admin.js             # Stats, rate management, cleanup
│   ├── calculate.js         # Deterministic financial calculations
│   ├── auth/
│   │   ├── send-otp.js      # Send OTP via Resend
│   │   ├── verify-otp.js    # Verify OTP + issue JWT
│   │   └── me.js            # User info + logout
│   └── lib/                 # Shared utilities (unused, for future)
├── web/
│   ├── landing.html         # Marketing landing page
│   ├── chat.html            # Main AI chat interface
│   ├── calculators.html     # 6 Islamic finance calculators
│   ├── banks.html           # 13 Pakistan banks directory
│   ├── pricing.html         # 3-tier pricing
│   ├── dashboard.html       # User dashboard
│   ├── admin.html           # Admin dashboard
│   ├── privacy.html         # Privacy policy (bilingual)
│   ├── app.js               # Chat UI logic
│   ├── auth.js              # Auth module
│   ├── style.css            # Shared styles (1100+ lines)
│   ├── sw.js                # Service worker (PWA)
│   ├── manifest.json        # PWA manifest
│   ├── icons/icon.svg       # PWA icon
│   └── js/calculators.js    # Deterministic calculation formulas
├── skills/                  # 19 Islamic finance AI skills
│   ├── islamic-finance-router/
│   ├── murabaha-specialist/
│   ├── ijara-specialist/
│   ├── zakat-advisor/
│   └── ... (19 total)
├── references/              # Product data, formulas, banks
├── evals/                   # 44 routing + 15 product test cases
├── workflow-recipes/        # Multi-step finance workflows
├── hooks/                   # AgentFactory lifecycle hooks
├── .github/workflows/       # CI/CD pipeline
├── CLAUDE.md                # AI system prompt + role definition
├── schema.sql               # Database schema (13 tables)
├── vercel.json              # Deployment config (29 routes)
└── package.json             # Dependencies
```

---

## 🚀 Local Setup

### Quick Start (5 minutes)

```bash
git clone https://github.com/AliRaza192/islamic-banking-fte.git
cd islamic-banking-fte
npm install
cp .env.example .env.local
# Fill in your keys in .env.local (see table below)
vercel dev
# Open http://localhost:3000
```

### Environment Variables Required

| Variable | Where to Get | Required? |
|---|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) | Yes |
| `DATABASE_URL` | [neon.tech](https://neon.tech) (connection string) | Yes |
| `JWT_SECRET` | Run: `openssl rand -base64 48` | Yes |
| `RESEND_API_KEY` | [resend.com](https://resend.com) | Yes |
| `STRIPE_SECRET_KEY` | [dashboard.stripe.com](https://dashboard.stripe.com) | For payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks | For payments |
| `STRIPE_PRICE_PREMIUM` | Stripe Dashboard (price_* ID) | For payments |
| `STRIPE_PRICE_PROFESSIONAL` | Stripe Dashboard (price_* ID) | For payments |
| `ADMIN_PASSWORD` | Any strong random string | For admin dashboard |
| `GOLD_API_KEY` | [goldapi.io](https://goldapi.io) (optional) | For live gold rates |

### Prerequisites
- Node.js 18+ (see `.nvmrc`)
- Vercel CLI: `npm i -g vercel`
- Neon account (free): [neon.tech](https://neon.tech)
- Resend account (free): [resend.com](https://resend.com)
- Google AI Studio key: [aistudio.google.com](https://aistudio.google.com)

---

## 🧪 Testing

```bash
# Run structure validation (no server needed)
python3 evals/run-evals.py

# Run routing validation
python3 scripts/validate-routing.py

# Run live API tests (requires server running)
vercel dev  # Terminal 1
python3 evals/run-evals.py --live  # Terminal 2
```

**Current Test Coverage:**
- 44 routing test cases (100% pass rate)
- 15 product explanation test cases
- 10 negative/security test cases
- 13 jurisdiction coverage tests

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
- **Skills** — 19 specialist Islamic finance skill modules
- **Commands** — Slash command definitions (`/calculate`, `/zakat`, `/check-halal`, `/compare`)
- **Hooks** — Pre/post processing hooks
- **Evals** — 44+ test cases for AI response quality
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
| Halal Compliance | Keyword screening + risk assessment |

---

## 🏦 Covered Islamic Banks

**Full Islamic (6):** Meezan Bank, Dubai Islamic Bank Pakistan, Bank Islami, Al Baraka Bank, MCB Islamic, Faysal Bank

**Islamic Windows (4):** HBL Islamic, UBL Ameen, NBP Islamic, Habib Metropolitan Islamic

**Microfinance (3):** NRSP Microfinance, Akhuwat (Qard Hasan), Kashf Foundation

---

## 🌍 Jurisdiction Support

| Jurisdiction | Regulator | Accounting Framework |
|---|---|---|
| Pakistan (Default) | SBP | IFRS (modified) |
| UAE | CBUAE | IFRS |
| Saudi Arabia | SAMA | IFRS (full) |
| Malaysia | BNM | MFRS |
| Bahrain | CBB | AAOIFI FAS (mandatory) |
| Kuwait | CBK | IFRS |
| Qatar | QCB/QFCRA | AAOIFI FAS (mandatory) |
| Oman | CBO | IFRS + AAOIFI |
| Turkey | BDDK | TFRS |
| Nigeria | CBN | IFRS |
| Indonesia | OJK | PSAK |
| UK | PRA/FCA | UK-adopted IFRS |
| GCC Cross-border | Multiple | Mixed |

---

## ⚠️ Disclaimer

This platform is for **educational purposes only**. It does not constitute:
- A formal Fatwa or binding Shariah ruling
- Official financial advice
- A licensed banking service

Always consult your bank's Shariah Advisor for financial decisions.

---

## 📜 License

Apache License 2.0 — See [LICENSE](LICENSE)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests: `python3 evals/run-evals.py`
4. Submit a pull request

*Developed following Panaversity AgentFactory methodology*
*جزاک اللہ خیراً*
