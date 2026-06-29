# 🕌 Islamic Banking Digital FTE — Complete Project Documentation

**Project Name:** Islamic Banking Digital FTE  
**Version:** 1.0.0  
**Author:** AliRaza192  
**Repository:** https://github.com/AliRaza192/islamic-banking-fte  
**Live Demo:** https://islamic-banking-fte.vercel.app  
**License:** Apache-2.0  
**Last Updated:** May 2026

---

## 📖 Project Overview

**Islamic Banking Digital FTE** ek production-grade AI-powered Islamic Banking assistant hai jo Shariah-compliant financial guidance provide karta hai. Yeh Pakistan aur Gulf markets (UAE, Saudi Arabia, Malaysia, etc.) ke customers, banking officers, aur advisors ke liye banaya gaya hai.

### Yeh Project Kyun Bana?
- Pakistan mein Islamic banking tezi se barh rahi hai
- Logon ko Shariah-compliant products samajhne mein mushkil hoti hai
- Urdu/English dono zubaanon mein instantly madad chahiye
- Murabaha, Ijara, Musharakah, Zakat — sab ka accurate calculation chahiye
- 24/7 availability jo koi bank branch nahi de sakta

### Yeh Kya Karta Hai?
1. **Islamic banking products samjhata hai** — Murabaha, Ijara, Musharakah, Mudarabah, Salam, Istisna, Sukuk, Takaful
2. **Halal financial calculations karta hai** — Murabaha profit, Ijara rental, Diminishing Musharakah, Zakat
3. **Shariah compliance check karta hai** — Riba, Gharar, Maysir screening
4. **Zakat calculate karta hai** — Savings, gold/silver, business assets, investments
5. **Products compare karta hai** — Side-by-side bank comparisons
6. **Product applications guide karta hai** — Step-by-step apply karne ka tarika
7. **Regulatory context samjhata hai** — SBP, AAOIFI, CBUAE guidelines

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │
│  │ Landing │  │  Chat   │  │Dashboard│  │Pricing │ │
│  │  Page   │  │   App   │  │  Admin  │  │  Page  │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └───┬────┘ │
│       │            │            │            │       │
│       └────────────┴────────────┴────────────┘       │
│                         │                            │
│                    app.js + auth.js                  │
└─────────────────────────┼───────────────────────────┘
                          │ HTTP POST /api/chat
                          ▼
┌─────────────────────────────────────────────────────┐
│              BACKEND (Vercel Serverless)              │
│  ┌──────────────────────────────────────────────┐   │
│  │              api/chat.js (Core)              │   │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────┐  │   │
│  │  │  Skill   │  │Jurisdiction│  │  System  │  │   │
│  │  │  Router  │  │  Detector  │  │  Prompt  │  │   │
│  │  │(detectSkill)│(detectJuris)│  │ Builder  │  │   │
│  │  └──────────┘  └───────────┘  └──────────┘  │   │
│  └──────────────────────────────────────────────┘   │
│                         │                            │
│                    Gemini API Call                    │
│              (system_instruction + contents)          │
└─────────────────────────┼───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│               EXTERNAL SERVICES                      │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │ Google   │  │ Neon Postgres│ │   Stripe       │  │
│  │ Gemini   │  │  (Database) │  │  (Payments)    │  │
│  │   AI     │  │              │  │                │  │
│  └──────────┘  └───────────┘  └──────────────────┘  │
│  ┌──────────┐  ┌───────────┐                        │
│  │  Resend  │  │ goldapi.io│                        │
│  │ (Email)  │  │(Gold Rate)│                        │
│  └──────────┘  └───────────┘                        │
└─────────────────────────────────────────────────────┘
```

### Request Flow (Har Chat Message Ka Journey)

```
User types message
       │
       ▼
app.js: conversationHistory mein add karo
       │
       ▼
app.js: POST /api/chat → {contents, session_id, user_email}
       │
       ▼
api/chat.js: Input validation (length, structure, injection check)
       │
       ▼
api/chat.js: JWT token verify karo (authenticated user?)
       │
       ▼
api/chat.js: Rate limit check (IP + tier based)
       │
       ▼
api/chat.js: detectSkill(userMessage) → konsa skill activate hoga
       │
       ▼
api/chat.js: detectJurisdiction(userMessage) → konsa jurisdiction
       │
       ▼
api/chat.js: buildSystemPrompt() → CLAUDE.md + Router + Skill + Jurisdiction + References
       │
       ▼
api/chat.js: Gemini API call → system_instruction + contents
       │
       ▼
api/chat.js: Save to DB (session, message, query_log, shariah_audit_log)
       │
       ▼
api/chat.js: Return Gemini response + rate limit headers
       │
       ▼
app.js: formatResponse() → Markdown rendering
       │
       ▼
User sees response
```

---

## 📁 Project Structure (Detailed)

```
islamic-banking-fte/
│
├── 📄 CLAUDE.md                    # Master prompt - AI ka role, skills, rules
├── 📄 FTE.md                       # Yeh file - Complete project documentation
├── 📄 README.md                    # GitHub readme
├── 📄 LICENSE                      # Apache-2.0 license
├── 📄 package.json                 # Node.js dependencies
├── 📄 package-lock.json            # Locked dependency versions
├── 📄 schema.sql                   # Database schema (Neon PostgreSQL)
├── 📄 vercel.json                  # Vercel deployment config
├── 📄 server.py                    # Local development server (Python)
├── 📄 .env.example                 # Environment variables template
├── 📄 .env.local                   # Local environment (git-ignored)
├── 📄 .gitignore                   # Git ignore rules
├── 📄 marketplace.json             # Plugin marketplace metadata
│
├── 📂 api/                         # Backend API (Vercel Serverless Functions)
│   ├── 📄 chat.js                  # Core chat endpoint (750 lines)
│   ├── 📄 health.js                # Health check endpoint
│   ├── 📄 admin.js                 # Admin stats endpoint (password protected)
│   ├── 📄 rates.js                 # Live gold/silver rates for Zakat
│   ├── 📄 history.js               # Chat history endpoint
│   │
│   ├── 📂 auth/                    # Authentication system
│   │   ├── 📄 send-otp.js          # Send email OTP via Resend
│   │   ├── 📄 verify-otp.js        # Verify OTP & issue JWT
│   │   └── 📄 me.js                # Get current user info
│   │
│   └── 📂 payments/                # Payment system
│       ├── 📄 create-checkout.js   # Stripe checkout session
│       ├── 📄 stripe-webhook.js    # Stripe webhook handler
│       ├── 📄 verify.js            # Payment verification
│       └── 📄 portal.js            # Customer portal
│
├── 📂 web/                         # Frontend (Static Files)
│   ├── 📄 landing.html             # Landing page (SEO optimized, 1625 lines)
│   ├── 📄 chat.html                # Main chat interface (333 lines)
│   ├── 📄 dashboard.html           # User dashboard
│   ├── 📄 admin.html               # Admin panel
│   ├── 📄 pricing.html             # Pricing page
│   ├── 📄 calculators.html         # Standalone calculators
│   ├── 📄 banks.html               # Pakistani Islamic banks directory
│   │
│   ├── 📄 app.js                   # Chat UI logic (522 lines)
│   ├── 📄 auth.js                  # Client-side auth (258 lines)
│   ├── 📄 style.css                # Styles (1106 lines, Islamic green theme)
│   ├── 📄 favicon.svg              # Islamic crescent favicon
│   ├── 📄 manifest.json            # PWA manifest
│   ├── 📄 sw.js                    # Service worker (offline support)
│   │
│   ├── 📂 js/                      # Additional JS
│   │   └── 📄 calculators.js       # Calculator page logic
│   │
│   └── 📂 icons/                   # PWA icons
│       └── 📄 README.md
│
├── 📂 skills/                      # AI Skills (16 Product Specialist Skills)
│   │
│   ├── 📂 islamic-finance-router/  # Master router skill
│   │   ├── 📄 SKILL.md             # Routing protocol (128 lines)
│   │   └── 📂 references/
│   │       ├── 📄 aaoifi-fas-reference.md
│   │       ├── 📄 global-standards-map.md
│   │       └── 📂 jurisdictions/   # 14 jurisdiction overlays
│   │           ├── 📄 pakistan-ifrs.md
│   │           ├── 📄 uae-ifrs.md
│   │           ├── 📄 saudi-ifrs.md
│   │           ├── 📄 malaysia-mfrs.md
│   │           ├── 📄 bahrain-aaoifi.md
│   │           ├── 📄 kuwait-ifrs.md
│   │           ├── 📄 qatar-aaoifi.md
│   │           ├── 📄 oman-ifrs.md
│   │           ├── 📄 turkey-tfrs.md
│   │           ├── 📄 nigeria-ifrs.md
│   │           ├── 📄 indonesia-psak.md
│   │           ├── 📄 uk-ifrs.md
│   │           └── 📄 gcc-crossborder.md
│   │
│   ├── 📂 murabaha-specialist/     # FAS 2 — Cost-Plus Financing
│   │   └── 📄 SKILL.md (194 lines)
│   ├── 📂 ijarah-specialist/       # FAS 8/32 — Islamic Leasing
│   │   └── 📄 SKILL.md
│   ├── 📂 salam-specialist/        # FAS 7 — Forward Sale
│   │   └── 📄 SKILL.md
│   ├── 📂 istisna-a-specialist/    # FAS 10 — Construction Finance
│   │   └── 📄 SKILL.md
│   ├── 📂 sukuk-issuer/            # FAS 33/34 — Sukuk Issuance
│   │   └── 📄 SKILL.md
│   ├── 📂 sukuk-investor/          # FAS 25 — Sukuk Investment
│   │   └── 📄 SKILL.md
│   ├── 📂 takaful-ifrs17/          # IFRS 17 — Islamic Insurance
│   │   └── 📄 SKILL.md
│   ├── 📂 musharaka-full/         # FAS 4 — Full Musharakah
│   │   └── 📄 SKILL.md
│   ├── 📂 musharakah-mudarabah-specialist/ # FAS 3/4 — Partnership
│   │   └── 📄 SKILL.md
│   ├── 📂 sukuk-takaful-specialist/ # Generic Sukuk & Takaful
│   │   └── 📄 SKILL.md
│   ├── 📂 shariah-compliance-checker/ # Halal/Haram Screening
│   │   └── 📄 SKILL.md
│   ├── 📂 roshan-digital-advisor/  # RDA for Overseas Pakistanis
│   │   └── 📄 SKILL.md
│   ├── 📂 zakat-advisor/           # FAS 9 — Zakat Calculation
│   │   └── 📄 SKILL.md
│   ├── 📂 halal-calculator/        # Financial Calculations
│   │   └── 📄 SKILL.md
│   ├── 📂 islamic-product-explainer/ # Product Explanations
│   │   └── 📄 SKILL.md
│   ├── 📂 pakistan-banking-navigator/ # Pakistani Bank Navigation
│   │   └── 📄 SKILL.md
│   └── 📂 islamic-banking-advisor/ # General Banking Q&A
│       └── 📄 SKILL.md
│
├── 📂 references/                  # Knowledge Base (6 Reference Files)
│   ├── 📄 products.md              # All Islamic banking products (357 lines)
│   ├── 📄 calculations.md          # Calculation formulas
│   ├── 📄 pakistan-banks.md        # Pakistani Islamic banks directory
│   ├── 📄 shariah-rules.md         # Core Shariah rules (246 lines)
│   ├── 📄 nisab-table.md           # Current Nisab values for Zakat
│   └── 📄 faqs.md                  # Pre-written FAQs
│
├── 📂 commands/                    # Slash Commands
│   ├── 📄 calculate.md             # /calculate — Finance calculator
│   ├── 📄 check-halal.md           # /check-halal — Shariah compliance
│   ├── 📄 zakat.md                 # /zakat — Zakat calculator
│   └── 📄 compare-products.md      # /compare — Product comparison
│
├── 📂 hooks/                       # System Hooks
│   ├── 📄 hooks.json               # Hook configuration
│   ├── 📄 session-start.md         # Session initialization hook
│   └── 📄 shariah-disclaimer.md    # Shariah disclaimer hook
│
├── 📂 workflow-recipes/            # Complex Multi-Step Workflows
│   ├── 📄 murabaha-application.md  # Complete Murabaha application guide
│   ├── 📄 zakat-audit.md           # Full annual Zakat workflow
│   ├── 📄 investment-screening.md  # Investment Shariah screening
│   └── 📄 product-comparison.md    # Structured product comparison
│
├── 📂 scripts/                     # Development Scripts
│   ├── 📄 test-harness.py          # Automated testing script
│   └── 📄 validate-routing.py      # Skill routing validation
│
├── 📂 evals/                       # Evaluation & Testing
│   ├── 📄 routing-golden.json      # Routing accuracy test cases (254 lines)
│   ├── 📄 product-golden.json      # Product explanation test cases
│   ├── 📄 compliance-checker-evals.md
│   ├── 📄 calculator-evals.md
│   └── 📄 product-explainer-evals.md
│
└── 📂 .claude-plugin/              # Claude Plugin Config
    ├── 📄 plugin.json
    └── 📄 README.md
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| HTML5 | Structure |
| CSS3 | Styling (Islamic green theme) |
| Vanilla JavaScript | UI Logic |
| DOMPurify | XSS protection |
| Web Speech API | Voice input (Urdu) |
| Service Worker | Offline/PWA support |
| Google Fonts | Cormorant Garamond + DM Sans |

### Backend
| Technology | Purpose |
|---|---|
| Node.js (ESM) | Runtime |
| Vercel Serverless Functions | API hosting |
| Python 3.8+ | Local dev server |

### AI & APIs
| Service | Purpose |
|---|---|
| Google Gemini 2.5 Flash | AI model (1500 req/day free) |
| Neon PostgreSQL | Database (sessions, messages, users, analytics) |
| Resend | Email OTP delivery |
| Stripe | Payment processing |
| goldapi.io | Live gold prices |
| exchangerate-api.com | USD/PKR exchange rate |

### NPM Dependencies
```json
{
  "@neondatabase/serverless": "1.1.0",  // Neon PostgreSQL client
  "jsonwebtoken": "9.0.3",              // JWT auth
  "resend": "6.12.4",                   // Email OTP
  "stripe": "22.2.0",                   // Payments
  "ws": "8.18.0"                        // WebSocket for Neon
}
```

---

## 🧠 How The Skill Router Works

### Skill Detection (Priority Order)

The router checks the user's message against keywords and patterns. **Order matters** — more specific skills match before generic ones:

| # | Skill | Triggers On | AAOIFI Standard |
|---|---|---|---|
| 1 | `murabaha-specialist` | murabaha, car loan, cost-plus, ghar ka qarz | FAS 2 |
| 2 | `zakat-advisor` | zakat, nisab, زکات | FAS 9 |
| 3 | `ijara-specialist` | ijara, ijarah, lease, kiraya | FAS 8/32 |
| 4 | `salam-specialist` | salam, forward sale, crop financing | FAS 7 |
| 5 | `istisna-a-specialist` | istisna, construction finance, manufacturing | FAS 10 |
| 6 | `sukuk-issuer` | sukuk + issuance/issue/issuer/structure/SPV | FAS 33/34 |
| 7 | `sukuk-investor` | sukuk + invest/buy/yield/return/portfolio | FAS 25 |
| 8 | `takaful-ifrs17` | takaful + accounting/ifrs17/operator/wakala | IFRS 17 |
| 9 | `musharaka-full` | full musharakah, running musharakah, SME partnership | FAS 4 |
| 10 | `musharakah-mudarabah-specialist` | musharakah, mudarabah, partnership, profit sharing | FAS 3/4 |
| 11 | `sukuk-takaful-specialist` | sukuk, takaful (generic) | Shariah Std 17/26 |
| 12 | `shariah-compliance-checker` | halal, haram, riba, gharar, jaiz | Shariah Standards |
| 13 | `roshan-digital-advisor` | roshan, RDA, overseas Pakistani, NPC | SBP Guidelines |
| 14 | `pakistan-banking-navigator` | meezan, SBP, Pakistan, KIBOR, PKR | SBP Guidelines |
| 15 | `halal-calculator` | calculate, hisab, monthly payment, qist | FAS 2/3/4/8/9 |
| 16 | `islamic-product-explainer` | what is, explain, kya hai, difference between | General |
| 17 | `islamic-banking-advisor` | (default fallback) | General |

### Jurisdiction Detection

| # | Jurisdiction | Triggers On | Regulator |
|---|---|---|---|
| 1 | UAE | uae, dubai, AED, CBUAE, DIB, ADIB | CBUAE |
| 2 | Saudi Arabia | saudi, KSA, Al Rajhi, SAR, SAMA, ZATCA | SAMA |
| 3 | Malaysia | malaysia, MYR, BNM, KLIBOR | BNM |
| 4 | Bahrain | bahrain, BHD, CBB, AAOIFI | CBB |
| 5 | Kuwait | Kuwait, KWD, CBK, KFH | CBK |
| 6 | Qatar | Qatar, QAR, QIB, QCB | QCB |
| 7 | Oman | Oman, OMR, CBO, Bank Nizwa | CBO |
| 8 | Turkey | Turkey, TRY, BDDK | BDDK |
| 9 | Nigeria | Nigeria, NGN, CBN, Jaiz Bank | CBN |
| 10 | Indonesia | Indonesia, IDR, OJK, BSI | OJK |
| 11 | UK | UK, GBP, Al Rayan, HMRC | HMRC |
| 12 | GCC Cross-Border | GCC, cross-border, Gulf | Multi |
| 13 | Pakistan | (default) | SBP |

---

## 🔐 Authentication & Authorization

### Auth Flow
```
User enters email
       │
       ▼
POST /api/auth/send-otp → Resend API → Email with 6-digit OTP
       │
       ▼
User enters OTP
       │
       ▼
POST /api/auth/verify-otp → Verify code → Issue JWT (30 day expiry)
       │
       ▼
JWT stored in sessionStorage → Sent with every /api/chat request
       │
       ▼
api/chat.js verifies JWT → Extracts user tier → Applies rate limits
```

### User Tiers
| Tier | Daily Queries | Price |
|---|---|---|
| `anonymous` | 5 | Free |
| `free` | 5 | Free |
| `premium` | 100 | PKR 1,500/month (~$5) |
| `professional` | Unlimited | PKR 15,000/month (~$50) |

---

## 💾 Database Schema (Neon PostgreSQL)

### Tables
| Table | Purpose | Key Columns |
|---|---|---|
| `sessions` | Chat sessions | id, user_email, created_at, metadata |
| `messages` | All messages | session_id, role (user/model), content |
| `queries_log` | Analytics | session_id, query_text, skill_used |
| `rate_limits` | Rate limiting | ip, req_date, req_count |
| `users` | User accounts | email, tier, queries_today, queries_date |
| `otps` | Email verification | email, code, expires_at, used, failed_attempts |
| `subscriptions` | Payments | user_id, tier, provider, status |
| `shariah_audit_log` | Compliance audit | user_email, query_type, input_data, output_summary |
| `rates_cache` | Gold/silver prices | metal, pkr_per_tola, fetched_at |

---

## 🎨 Frontend Pages

| Page | URL | Description |
|---|---|---|
| `landing.html` | `/` | SEO-optimized landing page with features, pricing, FAQ |
| `chat.html` | `/chat` | Main chat interface with slash commands |
| `dashboard.html` | `/dashboard` | User dashboard with query history |
| `admin.html` | `/admin` | Admin panel with platform stats |
| `pricing.html` | `/pricing` | Pricing tiers (Free/Premium/Professional) |
| `calculators.html` | `/calculators` | Standalone Islamic calculators |
| `banks.html` | `/banks` | Pakistani Islamic banks directory |

### Chat Features
- **Slash Commands:** `/calculate`, `/check-halal`, `/zakat`, `/compare`
- **Voice Input:** Urdu/English via Web Speech API
- **Quick Actions:** Welcome card with common queries
- **Markdown Rendering:** Bold, italic, headers, lists, code blocks
- **Copy Button:** Copy bot responses
- **Thinking Indicator:** Animated dots while waiting
- **Upgrade Bar:** Shows remaining queries for free users
- **Character Counter:** 2000 char limit display

---

## 🔌 API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/chat` | POST | Main chat endpoint (Gemini AI) |
| `/api/health` | GET | Health check (DB + Gemini status) |
| `/api/rates` | GET | Live gold/silver rates for Zakat |
| `/api/admin` | GET | Platform stats (password protected) |
| `/api/history` | GET | Chat history for logged-in user |
| `/api/auth/send-otp` | POST | Send email OTP |
| `/api/auth/verify-otp` | POST | Verify OTP, issue JWT |
| `/api/auth/me` | GET | Current user info |
| `/api/payments/create-checkout` | POST | Create Stripe checkout session |
| `/api/payments/stripe-webhook` | POST | Stripe webhook handler |
| `/api/payments/verify` | POST | Verify payment |

---

## 🛡️ Security Features

1. **Input Validation** — Message length (2000 chars), structure validation
2. **Prompt Injection Protection** — Regex patterns block common attacks
3. **Rate Limiting** — Per-IP and per-user daily limits
4. **CORS** — Whitelist of allowed origins only
5. **XSS Protection** — DOMPurify sanitization on all rendered HTML
6. **JWT Authentication** — 30-day expiry, HMAC-SHA256
7. **OTP Security** — 5-minute expiry, max 5 attempts
8. **Security Headers** — X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
9. **API Keys** — Never exposed to browser (server-side only)
10. **Shariah Audit Log** — Compliance queries are tracked for audit trail

---

## 📊 Shariah Compliance System

### The 3 Major Prohibitions
| Prohibition | Arabic | What It Means |
|---|---|---|
| **Riba** | ربا | Interest/usury — any predetermined return on loan |
| **Gharar** | غرر | Excessive uncertainty/deception in contracts |
| **Maysir** | ميسر | Gambling/speculation |

### Shariah Disclaimer (Mandatory)
Every financial response must end with:
> "⚠️ Shariah Disclaimer: This information is for educational and guidance purposes only. It does not constitute a formal Fatwa or binding Shariah ruling. Please consult your bank's Shariah Advisor or a qualified Islamic scholar before making financial decisions."

---

## 🧪 Testing & Evaluation

### Routing Tests (`evals/routing-golden.json`)
- 50+ test cases for skill routing accuracy
- Tests English, Urdu, and Roman Urdu queries
- Validates correct skill and jurisdiction detection

### Evaluation Categories
- **Routing accuracy** — Does the right skill activate?
- **Compliance checking** — Is halal/haram detection accurate?
- **Calculator accuracy** — Are financial calculations correct?
- **Product explanations** — Are descriptions accurate and clear?

---

## 🚀 Deployment

### Vercel Configuration
- **Runtime:** Node.js 18+
- **Memory:** 512 MB per function
- **Max Duration:** 30 seconds
- **Output Directory:** `web/` (static files)
- **Functions:** `api/**/*.js` (serverless)

### Environment Variables Required
```bash
GEMINI_API_KEY=          # Google Gemini AI key
DATABASE_URL=            # Neon PostgreSQL connection string
GEMINI_MODEL=            # gemini-2.5-flash (default)
JWT_SECRET=              # 32-char random secret
RESEND_API_KEY=          # Resend email API key
STRIPE_SECRET_KEY=       # Stripe secret key
STRIPE_WEBHOOK_SECRET=   # Stripe webhook secret
STRIPE_PRICE_PREMIUM=    # Stripe price ID for premium
STRIPE_PRICE_PROFESSIONAL= # Stripe price ID for professional
GOLD_API_KEY=            # goldapi.io key (optional)
ADMIN_PASSWORD=          # Admin panel password
```

### Local Development
```bash
# Option 1: Python server (recommended)
python3 server.py
# Opens at http://localhost:8000

# Option 2: Vercel CLI
vercel dev
```

---

## 🌍 Supported Jurisdictions

| Country | Currency | Regulator | Benchmark Rate |
|---|---|---|---|
| Pakistan (Default) | PKR | SBP | KIBOR |
| UAE | AED | CBUAE | EIBOR |
| Saudi Arabia | SAR | SAMA | SAIBOR |
| Malaysia | MYR | BNM | BNM-RSRR |
| Bahrain | BHD | CBB | BHIBOR |
| Kuwait | KWD | CBK | KIBOR |
| Qatar | QAR | QCB | QIBOR |
| Oman | OMR | CBO | — |
| Turkey | TRY | BDDK | — |
| Nigeria | NGN | CBN | — |
| Indonesia | IDR | OJK | — |
| United Kingdom | GBP | HMRC | SONIA |

---

## 📱 PWA Features

- **Installable:** Add to home screen on mobile
- **Offline Support:** Service worker caching
- **App Shortcuts:** Chat, Calculators, Compare Banks
- **Theme Color:** Islamic green (#1a4731)
- **Portrait Mode:** Optimized for mobile

---

## 🔮 Roadmap (Future Features)

- [ ] Multi-language support (Arabic, Turkish, Malay)
- [ ] Voice response (TTS)
- [ ] Real-time bank API integration
- [ ] Mobile app (React Native)
- [ ] Advanced portfolio analysis
- [ ] Shariah board certification system
- [ ] Multi-tenant SaaS platform
- [ ] WhatsApp bot integration

---

## 👨‍💻 Development

### Code Style
- **Frontend:** Vanilla JS (no framework), mobile-first CSS
- **Backend:** ESM modules, async/await
- **Database:** Neon serverless PostgreSQL with tagged templates
- **Naming:** snake_case for files, camelCase for JS variables

### Key Design Decisions
1. **No frontend framework** — Keeps it fast, simple, no build step
2. **Server-side system prompt** — API keys and skill routing never reach browser
3. **Skill-based architecture** — Easy to add new Islamic banking products
4. **Jurisdiction overlays** — Same product, different country rules
5. **Shariah audit trail** — Every compliance query is logged for regulatory purposes

---

## 📞 Support

- **Issues:** https://github.com/AliRaza192/islamic-banking-fte/issues
- **Live Demo:** https://islamic-banking-fte.vercel.app
- **Author:** AliRaza192

---

*"In the name of Allah, the Most Gracious, the Most Merciful"*

*This project is a licensed commercial product — not a demo or learning project.*
