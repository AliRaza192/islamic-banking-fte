# Islamic Banking Digital FTE — Complete Project Status
**Last Updated:** 2026-06-01
**Repo:** https://github.com/AliRaza192/islamic-banking-fte
**Live:** https://islamic-banking-fte.vercel.app
**Author:** AliRaza192

---

## PROJECT OVERVIEW

A production-grade Islamic Banking Digital FTE (Full-Time Employee) built using
the Panaversity AgentFactory methodology. Provides Shariah-compliant financial
guidance, halal product calculators, Zakat advisory, and Islamic banking product
explanations for customers, officers, and advisors in Pakistan and Gulf markets.

**Target Market:** Pakistan + Gulf (UAE, Saudi Arabia, Malaysia, Bahrain, Kuwait)
**Business Model:** Freemium SaaS — Free / Premium (PKR 1,500/mo) / Professional (PKR 15,000/mo)
**Goal:** Real-world commercial product — source of income via Fiverr/Upwork/LinkedIn

---

## TECH STACK

| Component | Technology | Cost |
|---|---|---|
| AI Model | Google Gemini 2.5 Flash | Free (1500 req/day) |
| Database | Neon PostgreSQL | Free tier (512MB) |
| Deployment | Vercel | Free tier |
| Frontend | Vanilla HTML/CSS/JS | Free |
| Backend | Vercel Serverless (Node.js) | Free |
| Local Dev | Python HTTP Server | Free |
| Build Tool | Claude Code (OpenClaude) | Free |

---

## CURRENT FILE TREE

```
islamic-banking-fte/
├── .claude-plugin/
│   ├── plugin.json                    ✅ Plugin manifest (v1.0.0, Apache-2.0)
│   └── README.md                      ✅ Installation docs
├── .env.example                       ✅ Environment template
├── .env.local                         ⚠️  Has real keys (NEEDS ROTATION)
├── .gitignore                         ✅ Comprehensive
├── .openclaude/
│   └── settings.local.json            ✅ OpenClaude config
├── api/
│   └── chat.js                        ✅ Production backend (265 lines)
├── commands/
│   ├── calculate.md                   ✅ /calculate slash command
│   ├── check-halal.md                 ✅ /check-halal slash command
│   ├── compare-products.md            ✅ /compare slash command
│   └── zakat.md                       ✅ /zakat slash command
├── evals/
│   ├── calculator-evals.md            ❌ PLACEHOLDER (empty)
│   ├── compliance-checker-evals.md    ❌ PLACEHOLDER (empty)
│   └── product-explainer-evals.md     ❌ PLACEHOLDER (empty)
├── hooks/
│   ├── hooks.json                     ✅ SessionStart + PostToolUse
│   ├── session-start.md               ✅ Session init
│   └── shariah-disclaimer.md          ✅ Disclaimer trigger
├── node_modules/
│   └── @neondatabase/serverless/      ✅ Neon DB client
├── references/
│   ├── calculations.md                ✅ All Islamic finance formulas
│   ├── faqs.md                        ✅ Bilingual FAQ (7 categories)
│   ├── nisab-table.md                 ✅ Nisab values + Zakat rates
│   ├── pakistan-banks.md              ✅ 14 Pakistani Islamic banks
│   ├── products.md                    ✅ 10 Islamic banking products
│   └── shariah-rules.md              ✅ Riba/Gharar/Maysir rules
├── scripts/
│   ├── test-harness.py                ❌ PLACEHOLDER (stub)
│   └── validate-routing.py            ⚠️  Working but drift risk (33 tests)
├── skills/
│   ├── halal-calculator/SKILL.md      ✅
│   ├── ijara-specialist/SKILL.md      ✅
│   ├── islamic-banking-advisor/SKILL.md ✅
│   ├── islamic-finance-router/
│   │   ├── SKILL.md                   ✅ Router skill
│   │   └── references/jurisdictions/
│   │       ├── bahrain-aaoifi.md      ✅
│   │       ├── kuwait-ifrs.md         ✅
│   │       ├── malaysia-mfrs.md       ✅
│   │       ├── pakistan-ifrs.md       ✅
│   │       ├── saudi-ifrs.md          ✅
│   │       └── uae-ifrs.md            ✅
│   ├── islamic-product-explainer/SKILL.md ✅
│   ├── murabaha-specialist/SKILL.md   ✅
│   ├── musharakah-mudarabah-specialist/SKILL.md ✅
│   ├── pakistan-banking-navigator/SKILL.md ✅
│   ├── shariah-compliance-checker/SKILL.md ✅
│   ├── sukuk-takaful-specialist/SKILL.md ✅
│   └── zakat-advisor/SKILL.md         ✅
├── web/
│   ├── app.js                         ✅ Frontend logic (266 lines)
│   ├── favicon.svg                    ✅ Mosque emoji
│   ├── index.html                     ✅ Chat UI (135 lines)
│   └── style.css                      ✅ CSS with mobile (472 lines)
├── workflow-recipes/
│   ├── investment-screening.md        ✅ 4-step Shariah screening
│   ├── murabaha-application.md        ✅ 6-step application guide
│   ├── product-comparison.md          ✅ 5-step comparison
│   └── zakat-audit.md                 ✅ 7-step annual Zakat
├── CHANGELOG.md                       ✅ Version history
├── CLAUDE.md                          ✅ Core system prompt
├── IMPROVEMENT-TRACKER.md             ⚠️  OLD — replaced by this file
├── LICENSE                            ✅ Apache 2.0 (fixed 2026-06-01)
├── marketplace.json                   ✅ Plugin metadata
├── package.json                       ✅ Node.js config
├── package-lock.json                  ✅ Lockfile
├── PROJECT-STATUS.md                  ✅ THIS FILE
├── README.md                          ✅ Project docs (fixed 2026-06-01)
├── response.json                      ✅ Vercel checkpoint (gitignored)
├── schema.sql                         ✅ DB schema (4 tables, fixed 2026-06-01)
├── server.py                          ✅ Local dev server (fixed 2026-06-01)
└── vercel.json                        ✅ Deployment config
```

---

## GIT HISTORY (All Commits)

```
eb3a661 feat: rate limiting 50 req/day per IP
418a483 fix: mobile responsive UI, hamburger menu, server.py skill routing
9ba7412 fix: session_id UUID, package type, queries_log
64b076d feat: AgentFactory alignment + fix Gemini API session_id error
5ae9413 fix: clean keys + database integration
1175fce feat: Neon database integration — conversations saving
3b615af chore: trigger redeploy for DATABASE_URL
a76d632 Three Phases complete
```

**Uncommitted changes (2026-06-01):**

Phase 1:
- `api/chat.js` — dead code removed (285 lines), CORS fixed
- `schema.sql` — rate_limits table added
- `server.py` — CORS fixed
- `LICENSE` — MIT → Apache 2.0
- `README.md` — placeholders fixed
- `.claude-plugin/plugin.json` — license updated
- `marketplace.json` — license updated

Phase 2 (partially done):
- 6 new SKILL.md files: salam, istisna-a, sukuk-issuer, sukuk-investor, takaful-ifrs17, musharaka-full
- 7 new jurisdiction overlays: gcc-crossborder, indonesia, nigeria, oman, qatar, turkey, uk
- 2 new reference files: aaoifi-fas-reference.md, global-standards-map.md
- `api/chat.js` — routing updated (16 skills, 13 jurisdictions)
- `server.py` — routing updated (matching)
- `CLAUDE.md` — skills table + jurisdiction table updated
- `skills/islamic-finance-router/SKILL.md` — routing tables updated

---

## COMPARISON: OUR PROJECT vs PANAVERSITY REFERENCE

Reference: https://github.com/panaversity/agentfactory-business-plugins/tree/main/islamic-finance

| Aspect | Our Project | Panaversity | Status |
|---|---|---|---|
| Product Skills | 10 | 12 | Missing 6 (salam, istisna, sukuk-issuer, sukuk-investor, takaful-ifrs17, musharaka-full) |
| Jurisdiction Overlays | 6 | 13 | Missing 7 (gcc-crossborder, indonesia, nigeria, oman, qatar, turkey, uk) |
| AAOIFI FAS Reference | None | Complete table | Missing |
| Global Standards Map | None | 20-jurisdiction map | Missing |
| Dual-Regime Accounting | Mentioned only | AAOIFI+IFRS side-by-side | Not systematic |
| Test Suite | 33 routing tests (drift risk) | Golden-file JSON + runner | ✅ 51/51 passing |
| Shariah Screening | 5-point framework | 5 methodologies compared | Single methodology |
| Hooks | SessionStart + disclaimer | SessionStart + PostToolUse validation | Less comprehensive |
| License | Apache 2.0 ✅ | Apache 2.0 | Aligned |
| **Web Deployment** | **Vercel + Gemini + Neon** | **Plugin only** | **WE HAVE ADVANTAGE** |
| **Bilingual** | **Urdu + English + Arabic** | **English only** | **WE HAVE ADVANTAGE** |
| **Customer Focus** | **Product explanations, calculators** | **Accounting professionals** | **DIFFERENT MARKET** |
| **Rate Limiting** | **50 req/day per IP** | **None** | **WE HAVE ADVANTAGE** |
| **DB Logging** | **Neon PostgreSQL** | **None** | **WE HAVE ADVANTAGE** |
| **Mobile UI** | **Responsive + hamburger** | **N/A (plugin)** | **WE HAVE ADVANTAGE** |

---

## 6-PHASE UPGRADE PLAN

### PHASE 1: Security & Foundation Fixes ✅ DONE (2026-06-01)

| Task | Status | Details |
|---|---|---|
| 1.1 Rotate API Keys | ❌ MANUAL | User must rotate Gemini key + Neon password |
| 1.2 rate_limits table | ✅ DONE | Added to schema.sql |
| 1.3 Remove dead code | ✅ DONE | api/chat.js 544→265 lines |
| 1.4 Fix CORS (api/chat.js) | ✅ DONE | `*` → origin allowlist |
| 1.4b Fix CORS (server.py) | ✅ DONE | `*` → origin allowlist |
| 1.5 Fix LICENSE | ✅ DONE | MIT → Apache 2.0 + Domain Notice |
| 1.6 Clean README placeholders | ✅ DONE | YOUR_GITHUB_USERNAME → AliRaza192 |
| 1.7 response.json | ✅ ALREADY DONE | Was gitignored |

### PHASE 2: Knowledge Gap Closure — Panaversity Alignment ✅ DONE (2026-06-01)

| Task | Priority | Effort | Status |
|---|---|---|---|
| 2.1a Add salam-specialist skill (FAS 7) | Should-Have | Medium | ✅ DONE |
| 2.1b Add istisna-a-specialist skill (FAS 10) | Should-Have | Medium | ✅ DONE |
| 2.1c Add sukuk-issuer skill (FAS 33/34) | Should-Have | Medium | ✅ DONE |
| 2.1d Add sukuk-investor skill (FAS 25) | Should-Have | Medium | ✅ DONE |
| 2.1e Add takaful-ifrs17 skill (IFRS 17) | Nice-to-Have | Medium | ✅ DONE |
| 2.1f Add musharaka-full skill (FAS 4) | Nice-to-Have | Medium | ✅ DONE |
| 2.2a Add gcc-crossborder jurisdiction | Nice-to-Have | Small | ✅ DONE |
| 2.2b Add indonesia-psak jurisdiction | Nice-to-Have | Small | ✅ DONE |
| 2.2c Add nigeria-ifrs jurisdiction | Nice-to-Have | Small | ✅ DONE |
| 2.2d Add oman-ifrs jurisdiction | Nice-to-Have | Small | ✅ DONE |
| 2.2e Add qatar-aaoifi jurisdiction | Nice-to-Have | Small | ✅ DONE |
| 2.2f Add turkey-tfrs jurisdiction | Nice-to-Have | Small | ✅ DONE |
| 2.2g Add uk-ifrs jurisdiction | Nice-to-Have | Small | ✅ DONE |
| 2.3 Add AAOIFI FAS reference table | Should-Have | Small | ✅ DONE |
| 2.4 Add global standards map | Should-Have | Small | ✅ DONE |
| 2.5 Dual-regime accounting in existing skills | Should-Have | Large | ✅ DONE |
| 2.6 Enhance Shariah screening (5 methodologies) | Should-Have | Medium | ✅ DONE |
| 2.7 Update routing in api/chat.js + server.py | Must-Have | Medium | ✅ DONE |
| 2.8 Update CLAUDE.md + router SKILL.md | Must-Have | Small | ✅ DONE |

**Files to modify in Phase 2:**
- `api/chat.js` — `detectSkill()` + `detectJurisdiction()` functions
- `server.py` — `detect_skill()` + `detect_jurisdiction()` functions
- `scripts/validate-routing.py` — update test cases
- `CLAUDE.md` — Skills Reference table + Jurisdiction table
- `skills/islamic-finance-router/SKILL.md` — routing tables
- `hooks/hooks.json` — SessionStart capability count
- All 10 existing SKILL.md files — add dual-regime sections
- `skills/shariah-compliance-checker/SKILL.md` — add 5 methodologies
- 6 new SKILL.md files (salam, istisna, sukuk-issuer, sukuk-investor, takaful-ifrs17, musharaka-full)
- 7 new jurisdiction overlay files
- 2 new reference files (aaoifi-fas-reference.md, global-standards-map.md)

### PHASE 3: Production Hardening ✅ DONE (2026-06-02)

| Task | Priority | Effort | Status |
|---|---|---|---|
| 3.1 Build golden-file eval suite | Should-Have | Medium | ✅ |
| 3.2 Implement test harness | Should-Have | Medium | ✅ |
| 3.3 Structured calculation output (cards) | Should-Have | Medium | ✅ |
| 3.4 Input sanitization improvements | Should-Have | Small | ✅ |
| 3.5 Error recovery for missing files | Should-Have | Small | ✅ |
| 3.6 Health check endpoint | Nice-to-Have | Small | ✅ |

**Phase 3 completed 2026-06-02.** 51/51 golden-file tests passing (100%).
- `scripts/test-harness.py` — replace placeholder
- `scripts/validate-routing.py` — use golden JSON files
- `web/style.css` — add `.calc-card` class
- `web/app.js` — update `formatResponse()` for cards
- `api/chat.js` — input sanitization + error recovery
- `api/health.js` (new)

### PHASE 4: Monetization Infrastructure ⏳ NOT STARTED

| Task | Priority | Effort | Status |
|---|---|---|---|
| 4.1 Design freemium model | Must-Have | Small | ⏳ |
| 4.2 User authentication (Email + OTP) | Must-Have | Large | ⏳ |
| 4.3 Usage tracking per user | Must-Have | Medium | ⏳ |
| 4.4 Payment integration (Stripe + JazzCash) | Must-Have | Large | ⏳ |
| 4.5 Pricing page | Must-Have | Medium | ⏳ |

**Freemium Model:**
| Tier | Price (PKR/mo) | Queries/Day | Features |
|---|---|---|---|
| Free | 0 | 10 | Basic queries, Zakat calculator, product explanations |
| Premium | 1,500 (~$5) | 100 | All calculations, bank comparisons, export reports |
| Professional | 15,000 (~$50) | Unlimited | API access, white-label widget, priority support |

**Files to create in Phase 4:**
- `api/auth/send-otp.js` — Send OTP via email
- `api/auth/verify-otp.js` — Verify OTP, create JWT
- `api/auth/me.js` — Get current user info
- `api/payments/create-checkout.js` — Stripe checkout
- `api/payments/webhook.js` — Stripe webhook
- `api/payments/verify.js` — Verify payment
- `web/pricing.html` — Pricing page
- `web/pricing.css` — Pricing styles

**Schema additions:**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE otps (
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  tier TEXT NOT NULL,
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  status TEXT DEFAULT 'active',
  payment_id TEXT
);
```

**Files to modify in Phase 4:**
- `api/chat.js` — auth check, user-based rate limits
- `web/app.js` — login/logout UI, JWT storage
- `web/index.html` — login modal
- `vercel.json` — new API routes
- `schema.sql` — new tables

### PHASE 5: Revenue Features ⏳ NOT STARTED

| Task | Priority | Effort | Status |
|---|---|---|---|
| 5.1 Bank comparison reports (PDF) | Should-Have | Medium | ⏳ |
| 5.2 Zakat calculation reports (annual) | Should-Have | Medium | ⏳ |
| 5.3 Investment screening reports | Should-Have | Medium | ⏳ |
| 5.4 Guided workflows in UI | Should-Have | Medium | ⏳ |
| 5.5 API access for banks/fintechs | Nice-to-Have | Large | ⏳ |
| 5.6 White-label widget | Nice-to-Have | Large | ⏳ |

**Files to create in Phase 5:**
- `api/reports/bank-comparison.js`
- `api/reports/zakat-annual.js`
- `api/reports/investment-screening.js`
- `api/v1/chat.js` — RESTful API
- `api/v1/zakat.js`
- `api/v1/screen.js`
- `docs/api.md`
- `web/widget.js` — Embeddable widget
- `web/widget.css`
- `docs/widget.md`

**Files to modify in Phase 5:**
- `web/app.js` — workflow buttons, PDF generation
- `web/index.html` — guided workflows sidebar

### PHASE 6: Marketing & Launch ⏳ NOT STARTED

| Task | Priority | Effort | Status |
|---|---|---|---|
| 6.1 Custom domain | Nice-to-Have | Small | ⏳ |
| 6.2 SEO optimization | Nice-to-Have | Small | ⏳ |
| 6.3 Social media presence | Nice-to-Have | Ongoing | ⏳ |
| 6.4 Partnership outreach | Nice-to-Have | Ongoing | ⏳ |
| 6.5 Demo video | Nice-to-Have | Medium | ⏳ |

**Target domains:** islamicbanking.pk or halalfinance.pk
**SEO keywords:** "Islamic banking calculator Pakistan", "Zakat calculator PKR", "halal car financing"
**Platforms:** LinkedIn, Twitter/X, YouTube (Urdu+English), Facebook

---

## DEPENDENCY GRAPH

```
Phase 1 (Security) ✅ DONE ─────────────────────────────────┐
    │                                                        │
    ├──> Phase 2 (Knowledge Gaps) ⏳ ───────────────────┐    │
    │                                                   │    │
    ├──> Phase 3 (Production Hardening) ✅ DONE ────┐   │    │
    │                                               │   │    │
    └───────────────────────────────────────────────┼───┼────┘
                                                    │   │
                                                    ▼   │
                                            Phase 4 (Monetization) ⏳
                                                    │
                                                    ▼
                                            Phase 5 (Revenue Features) ⏳
                                                    │
                                                    ▼
                                            Phase 6 (Marketing & Launch) ⏳
```

**Phases 2 and 3 can run in parallel. Phase 4 needs Phase 1 done (which it is).**

---

## WHAT IS WORKING (Verified)

1. ✅ CLAUDE.md injection as system prompt
2. ✅ Conversation history (full contents array sent to Gemini)
3. ✅ Skill routing (10 skills, English + Urdu + Arabic keywords)
4. ✅ Jurisdiction detection (6 jurisdictions, Pakistan default)
5. ✅ System prompt composition (CLAUDE.md + router + jurisdiction + skill + references)
6. ✅ Neon DB logging (sessions + messages + queries_log)
7. ✅ Rate limiting (50 req/day per IP)
8. ✅ Slash commands (4: /calculate, /check-halal, /zakat, /compare)
9. ✅ Typing indicator
10. ✅ Quick command buttons
11. ✅ Input validation (structure + length)
12. ✅ CORS (origin allowlist)
13. ✅ Mobile responsive UI (hamburger menu)
14. ✅ Session UUID (crypto.randomUUID)

---

## WHAT NEEDS MANUAL ACTION

1. **API Key Rotation** — User must:
   - Generate new Gemini API key at https://aistudio.google.com/apikey
   - Reset Neon DB password at https://console.neon.tech
   - Update `.env.local` with new keys
   - Update Vercel environment variables

2. **Execute rate_limits SQL on Neon** — Run the CREATE TABLE SQL from schema.sql on Neon SQL editor

3. **Commit Phase 1 changes** — Uncommitted changes from 2026-06-01 need to be committed

---

## EFFORT ESTIMATES

| Phase | Effort | Priority | Timeline |
|---|---|---|---|
| Phase 1: Security & Foundation | Small (1-2 days) | Must-Have | ✅ DONE |
| Phase 2: Knowledge Gaps | Medium-Large (1-2 weeks) | Should-Have | Weeks 2-3 |
| Phase 3: Production Hardening | Medium (3-5 days) | Should-Have | ✅ DONE 2026-06-02 |
| Phase 4: Monetization | Large (2-3 weeks) | Must-Have | Weeks 4-6 |
| Phase 5: Revenue Features | Large (2-4 weeks) | Should-Have | Weeks 7-10 |
| Phase 6: Marketing & Launch | Medium (1-2 weeks, ongoing) | Nice-to-Have | Weeks 8+ |

**Total estimated time to first revenue: 6-8 weeks** (Phase 4 done)

---

## COMPETITIVE ADVANTAGES (Keep These)

1. **Web deployment** — Panaversity is plugin-only, we have full web UI
2. **Bilingual** — Urdu + English + Roman Urdu + Arabic (Panaversity is English-only)
3. **Customer-facing** — product explanations, calculators (Panaversity is for accounting professionals)
4. **Rate limiting + DB logging** — production-ready infrastructure
5. **Mobile-responsive UI** — 80% Pakistani users are mobile
6. **Pakistan market focus** — SBP regulations, PKR, Meezan Bank references

---

## CONFLICT PREVENTION RULES

1. `api/chat.js` — Backend only. No frontend logic.
2. `web/app.js` — Frontend only. No system prompt logic.
3. `server.py` — Local dev only. Production uses api/chat.js.
4. `CLAUDE.md` — System prompt. Change only for persona updates.
5. `skills/` — Each skill independent. Change one without affecting others.
6. `references/` — Data files. Update only for factual changes.
7. `schema.sql` — DB schema. Requires matching ALTER TABLE on Neon.

## NOTES

- Gemini free tier: 1500 req/day — rate limiting essential
- 80% Pakistani users mobile — mobile-first design critical
- Neon free tier: 512 MB, 100 connections — sufficient for demo
- Vercel free tier: 100GB bandwidth — sufficient for demo
- Git history has exposed API keys — rotation mandatory
- IMPROVEMENT-TRACKER.md is OLD — this PROJECT-STATUS.md is the source of truth
