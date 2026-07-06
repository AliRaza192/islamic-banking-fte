# 🕌 Islamic Banking FTE — Unified Production Roadmap

**Generated:** July 5, 2026
**Sources:** opencode + Claude + ChatGPT + Z.AI (consolidated & deduplicated)
**Status:** Ready for Implementation

---

## Current State — Kya PEHLE SE Hai ✅

| Feature | Status | Location | Notes |
|---------|--------|----------|-------|
| Shariah disclaimer enforcement | ✅ DONE | `api/chat.js:769-801` | Regex-based, auto-appends EN/UR |
| Stripe webhook signature verification | ✅ DONE | `api/payments/stripe-webhook.js:23` | `constructEvent()` used |
| Live gold/silver rates | ✅ DONE | `api/rates.js` | goldapi.io + exchangerate-api |
| Rate limit enforcement (per IP/day) | ✅ DONE | `api/chat.js` + `schema.sql` | Tier-based: 50/100/unlimited |
| Shariah audit log | ✅ DONE | `schema.sql:97-108` | Compliance keyword detection |
| Evals runner (structure + live) | ✅ DONE | `evals/run-evals.py` | Golden file validation |
| 19 Skills (product specialists) | ✅ DONE | `skills/` | Router + 18 specialists |
| Payment integration (Stripe) | ✅ DONE | `api/payments/` | Checkout + webhooks |
| Auth system (OTP + JWT) | ✅ DONE | `api/auth/` | Email OTP, JWT tokens |
| PWA manifest | ✅ DONE | `web/manifest.json` | Installable |
| SEO (JSON-LD, Open Graph) | ✅ DONE | `web/landing.html` | Full schema markup |
| CORS allowlist (no wildcard) | ✅ DONE | All API files | Only allowed origins |
| CSP header | ✅ DONE | `vercel.json` | Script/style restrictions |
| Client-side input validation (2000 char) | ✅ DONE | `web/app.js:225-228` | With character counter |
| Client-side disclaimer check | ✅ DONE | `web/app.js` | Console warning |
| Error message map (bilingual) | ✅ DONE | `web/app.js:254-260` | Friendly UR/EN messages |
| Admin rate limiting (5/min) | ✅ DONE | `api/admin.js:36-48` | IP-based + lockout |
| Timing-safe password comparison | ✅ DONE | `api/admin.js:54-58` | `crypto.timingSafeEqual()` |
| /api/me rate limiting (30/min) | ✅ DONE | `api/auth/me.js:36-51` | IP-based throttle |
| Ijara calculator formula (correct) | ✅ DONE | `web/js/calculators.js:120` | Customer rental formula |
| Silver rate transparency | ✅ DONE | `api/rates.js:99` | "estimated" label shown |
| Bank directory page | ✅ DONE | `web/banks.html` | Filterable bank list |
| Calculators page (Murabaha/Ijara/etc.) | ✅ DONE | `web/calculators.html` | 5 calculators |
| Workflow recipes (4 playbooks) | ✅ DONE | `workflow-recipes/` | Murabaha, Zakat, etc. |
| Jurisdiction overlays (13 countries) | ✅ DONE | `skills/islamic-finance-router/references/jurisdictions/` | PK, UAE, SA, MY, etc. |
| Subscription management (Stripe) | ✅ DONE | `api/payments/` | Free/Premium/Professional |
| Confirmation emails (Resend) | ✅ DONE | `api/payments/stripe-webhook.js:58-91` | On payment success |

---

## What's MISSING — Complete List (40 Features)

### 🔴 TIER 0: Non-Negotiable (Week 1) — Product structurally unsafe without these

| # | Feature | From | Effort | Description |
|---|---------|------|--------|-------------|
| 1 | Fatwa blocking hook | Claude | 2 hrs | Block "give me a fatwa" requests with clear redirect |
| 2 | Scope enforcement hook | Claude | 2 hrs | Block stock tips, legal advice, other religion finance |
| 3 | Overclaiming detection | Claude | 1 hr | Flag "100% halal", "guaranteed permissible" in responses |
| 4 | Calculation transparency engine | Z.AI | 5 hrs | Step-by-step breakdown with formula, inputs, outputs |
| 5 | Enhanced disclaimer (fatwa-specific) | Claude | 1 hr | Separate hook for fatwa vs general disclaimer |
| 6 | Scope keyword detection in router | Claude | 1 hr | Detect out-of-scope queries before LLM processes them |

**TIER 0 Total: ~12 hours**

---

### 🟠 TIER 1: Core Enterprise (Week 2-3) — Required for bank pilot

| # | Feature | From | Effort | Description |
|---|---------|------|--------|-------------|
| 7 | Human escalation logic | Claude/Z.AI | 4 hrs | Classify queries: auto-answer vs escalate |
| 8 | Escalation response templates | Claude | 2 hrs | Bilingual templates for "consult a scholar" |
| 9 | Live KIBOR rates | Z.AI | 3 hrs | Daily KIBOR fetch from SBP website |
| 10 | Live bank profit rates | Z.AI | 5 hrs | Scrape/fetch rates from bank websites |
| 11 | Rate provider fallback chain | Z.AI | 3 hrs | Live → Cached → Manual → Estimated |
| 12 | Rate reliability display | Z.AI | 2 hrs | Show "Live" / "Cached" / "Estimated" labels |
| 13 | Session memory (conversation continuity) | Claude/Z.AI | 4 hrs | Remember last 5 queries + user preferences |
| 14 | User profile store | Claude | 3 hrs | Language pref, financial details mentioned |
| 15 | Full audit log table | Claude/Z.AI | 2 hrs | Every response logged with metadata |
| 16 | Rate update history table | Z.AI | 2 hrs | Track all rate changes for audit |
| 17 | Manual rate admin panel | Z.AI | 3 hrs | Admin can manually update rates |
| 18 | Nisab date-stamping | Claude | 1 hr | Every Nisab calculation shows "as of [date]" |
| 19 | Response date-stamping | Claude | 1 hr | Every response shows when data was last updated |
| 20 | CI/CD pipeline (GitHub Actions) | Claude | 2 hrs | Auto-run evals on every push |
| 21 | Deploy gate (evals must pass) | Claude | 1 hr | Block deploy if evals fail |
| 22 | Rate limit friendly fallback | Claude | 2 hrs | Bilingual "service busy" message on Gemini limits |
| 23 | Owner alerting (email/Slack) | Claude | 2 hrs | Alert when rate limits near |
| 24 | Privacy policy page | Claude | 2 hrs | EN + Roman Urdu, data collection disclosure |
| 25 | Data retention policy | Claude | 1 hr | Auto-delete queries older than 12 months |
| 26 | At-rest encryption for PII | Claude | 3 hrs | Encrypt financial data in database |
| 27 | Input PII detection | Z.AI | 2 hrs | Detect CNIC, account numbers in queries |
| 28 | Toxicity detection | Z.AI | 2 hrs | Block abusive/offensive queries |
| 29 | Prompt injection detection | Z.AI | 3 hrs | Detect attempts to manipulate the AI |
| 30 | Jailbreak detection | Z.AI | 3 hrs | Detect "ignore previous instructions" type attacks |

**TIER 1 Total: ~56 hours**

---

### 🟡 TIER 2: Competitive Differentiators (Week 4-6)

| # | Feature | From | Effort | Description |
|---|---------|------|--------|-------------|
| 31 | PDF report generation | Z.AI | 5 hrs | Zakat report, bank comparison, Murabaha analysis |
| 32 | Shariah stock screening engine | Z.AI | 8 hrs | AAOIFI-based stock compliance checker |
| 33 | Document upload + OCR | ChatGPT | 6 hrs | Upload contracts → AI analyzes Shariah clauses |
| 34 | Voice input (Urdu + English) | ChatGPT/Z.AI | 6 hrs | Web Speech API + Google STT |
| 35 | WhatsApp bot integration | ChatGPT/Z.AI | 10 hrs | Twilio WhatsApp API |
| 36 | Telegram bot integration | ChatGPT | 6 hrs | Telegram Bot API |
| 37 | SMS alerts (OTP + notifications) | Me | 4 hrs | Twilio SMS for users without email |
| 38 | Push notifications (PWA) | Me | 4 hrs | Profit rate updates, Zakat reminders |
| 39 | Referral program | Me | 5 hrs | Unique codes, tier upgrade rewards |
| 40 | Islamic calendar integration | Me | 3 hrs | Zakat due dates, Ramadan reminders |
| 41 | Multi-currency live rates | Me | 4 hrs | AED, SAR, MYR, BHD — live exchange rates |
| 42 | Bank comparison engine | ChatGPT | 5 hrs | Input needs → AI recommends best product |
| 43 | Financing application workflow | ChatGPT/Z.AI | 8 hrs | CNIC → Salary slip → Eligibility → Application |
| 44 | Branch locator + appointment | Me | 4 hrs | Google Maps API + booking |
| 45 | Investment portfolio tracker | Me | 6 hrs | Sukuk, mutual funds — auto Shariah screening |
| 46 | Zakat auto-reminder | Me | 3 hrs | Islamic calendar-based push notification |
| 47 | Knowledge freshness monitoring | Claude | 2 hrs | Flag stale data, monthly review reminders |
| 48 | Analytics dashboard (admin) | ChatGPT | 5 hrs | Top queries, conversion, revenue metrics |
| 49 | Feedback loop (thumbs up/down) | ChatGPT | 3 hrs | Collect feedback → improve prompts |
| 50 | API for third-party integration | ChatGPT | 6 hrs | REST API with API keys + rate limiting |

**TIER 2 Total: ~111 hours**

---

### 🔵 TIER 3: Advanced / Enterprise (Week 7-10)

| # | Feature | From | Effort | Description |
|---|---------|------|--------|-------------|
| 51 | Multi-agent architecture | ChatGPT/Z.AI | 15 hrs | Orchestrator → Specialist agents |
| 52 | RAG (Retrieval-Augmented Generation) | ChatGPT/Z.AI | 20 hrs | AAOIFI standards, SBP circulars as vector DB |
| 53 | Islamic Finance Knowledge Graph | Z.AI | 12 hrs | Relationships between products, scholars, standards |
| 54 | Document generation (DOCX/PDF) | ChatGPT | 8 hrs | Applications, complaint letters, eligibility reports |
| 55 | Explainable AI engine | Z.AI | 5 hrs | Every calculation shows formula + variables + steps |
| 56 | Version control for skills/prompts | ChatGPT | 4 hrs | Git-based versioning for all AI components |
| 57 | Continuous evals (auto-run) | ChatGPT | 4 hrs | Golden tests, prompt injection, hallucination checks |
| 58 | Model fallback (Gemini → backup) | Claude | 4 hrs | Auto-switch to backup model on failure |
| 59 | Banking API integration | ChatGPT | 15 hrs | Open Banking APIs, eligibility, financing status |
| 60 | Compliance reporting for regulators | Z.AI | 8 hrs | AAOIFI/SBP compliance export |
| 61 | Role-based access control (RBAC) | Me | 6 hrs | Customer/Officer/Manager/Advisor roles |
| 62 | Multi-tenant support | ChatGPT | 8 hrs | Multiple banks using same platform |
| 63 | Real-time chat with human agent | Me | 6 hrs | WebSocket-based handoff to live officer |
| 64 | AI document clause analysis | Z.AI | 6 hrs | Upload contract → clause-by-clause Shariah check |
| 65 | Hallucination detection | Z.AI | 5 hrs | Auto-detect when AI makes up information |
| 66 | Source verification | Z.AI | 4 hrs | Verify cited references actually exist |

**TIER 3 Total: ~130 hours**

---

## 📊 Complete Summary

| Tier | Features | Total Hours | Timeline |
|------|----------|-------------|----------|
| TIER 0 (Non-Negotiable) | 6 | ~12 hrs | Week 1 |
| TIER 1 (Core Enterprise) | 24 | ~56 hrs | Week 2-3 |
| TIER 2 (Competitive) | 20 | ~111 hrs | Week 4-6 |
| TIER 3 (Advanced) | 16 | ~130 hrs | Week 7-10 |
| **TOTAL** | **66 new features** | **~309 hrs** | **10 weeks** |

---

## 🎯 Immediate Action Plan — Is Hafte Kya Karein

### Day 1 (2-3 hours): Fatwa Blocking + Scope Enforcement
**Files to modify:** `api/chat.js`

Add 3 regex-based hooks after line 767:
1. **Fatwa blocking** — Detect "fatwa", "fatawa", "fatawa den", "binding ruling" → block with redirect
2. **Scope enforcement** — Detect "stock tip", "which stock", "legal advice", "court case" → redirect
3. **Overclaiming detection** — Detect "100% halal", "guaranteed halal", "definitely permissible" → soften

### Day 2 (3-4 hours): Calculation Transparency
**Files to modify:** `api/calculate.js`, `skills/halal-calculator/SKILL.md`

Add step-by-step breakdown to all calculations:
- Show formula
- Show inputs plugged in
- Show intermediate results
- Show assumptions
- Show data sources + date

### Day 3 (2-3 hours): Enhanced Audit Logging
**Files to modify:** `schema.sql`, `api/chat.js`

New table `full_audit_log`:
- Every response logged with: skill, rate used, disclaimer status, escalation status, response hash
- Queryable for compliance reviews

### Day 4 (2-3 hours): CI/CD Pipeline
**New file:** `.github/workflows/evals.yml`

- On every push: run `python3 evals/run-evals.py`
- If evals fail: block merge
- Simple, one-time setup

### Day 5 (2-3 hours): Privacy + Retention
**New files:** `web/privacy.html`, `scripts/cleanup-old-queries.sql`

- Privacy policy page (EN + Roman Urdu)
- Data retention: auto-delete queries > 12 months
- PII encryption for sensitive fields

---

## 🔗 Source Mapping — Kiska Suggestion Kahan Se Aaya

| Feature | Source(s) |
|---------|-----------|
| Fatwa blocking | Claude |
| Scope enforcement | Claude |
| Overclaiming detection | Claude |
| Calculation transparency | Z.AI + Claude |
| Human escalation | Claude + ChatGPT |
| Live bank rates | Z.AI + Me |
| Session memory | Claude + ChatGPT |
| Audit logging | Claude + Z.AI |
| PDF generation | ChatGPT + Z.AI |
| Stock screening | Z.AI |
| Voice interface | ChatGPT + Z.AI |
| WhatsApp bot | ChatGPT + Z.AI |
| RAG | ChatGPT + Z.AI |
| Multi-agent | ChatGPT + Z.AI |
| Knowledge graph | Z.AI |
| Document generation | ChatGPT |
| Explainable AI | Z.AI |
| CI/CD | Claude |
| Privacy policy | Claude |
| Rate limiting fallback | Claude |
| Owner alerting | Claude |
| Push notifications | Me |
| Referral program | Me |
| Islamic calendar | Me |
| Multi-currency | Me |
| Branch locator | Me |
| Investment tracker | Me |
| Zakat reminder | Me |
| RBAC | Me |
| Real-time human handoff | Me |
| Hallucination detection | Z.AI |
| Source verification | Z.AI |
| Prompt injection detection | Z.AI |
| Jailbreak detection | Z.AI |
| Toxicity detection | Z.AI |
| PII detection | Z.AI |
| Feedback loop | ChatGPT |
| Analytics dashboard | ChatGPT |
| API for third parties | ChatGPT |
| Banking API integration | ChatGPT |
| Multi-tenant | ChatGPT |
| Compliance reporting | Z.AI |
| Model fallback | Claude |
| Version control for prompts | ChatGPT |
| Continuous evals | ChatGPT |
| Document clause analysis | Z.AI |
| Banking comparison engine | ChatGPT |
| Financing workflow | ChatGPT + Z.AI |
| SMS alerts | Me |
| Data retention | Claude |
| PII encryption | Claude |
| Knowledge freshness | Claude |
| Nisab date-stamping | Claude |
| Response date-stamping | Claude |
| Rate reliability display | Z.AI |
| Rate provider fallback | Z.AI |
| Manual rate admin | Z.AI |
| Rate update history | Z.AI |
| User profile store | Claude |
| Escalation templates | Claude |
| KIBOR rates | Z.AI |
| Investment portfolio | Me |
| Banking API integration | ChatGPT |

---

## ⚠️ Important Notes

1. **TIER 0 is mandatory** — Product is structurally unsafe without fatwa blocking + scope enforcement
2. **TIER 1 is required for any bank pilot** — No bank will deploy without audit trail + escalation + privacy
3. **TIER 2 is what makes you different** — Generic chatbots don't have stock screening, voice, WhatsApp
4. **TIER 3 is enterprise grade** — RAG + multi-agent + knowledge graph = production-grade Digital FTE

---

*Generated by opencode (mimo-v2.5-free) — July 5, 2026*
