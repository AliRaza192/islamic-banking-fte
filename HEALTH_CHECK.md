# PROJECT HEALTH CHECK REPORT
**Date:** 25 June 2026
**Project:** islamic-banking-fte
**Repository:** https://github.com/AliRaza192/islamic-banking-fte
**Live URL:** https://islamic-banking-fte.vercel.app/

---

## Summary Table

| Check | Status | Issues Found |
|-------|--------|-------------|
| Bug Fix #1 (Nisab Silver) | ❌ Still broken | Silver fallback = 310 (should be ≥ 2450) |
| Bug Fix #2 (API Key) | ⚠️ Partially fixed | `api/chat.js` fixed (`x-goog-api-key` header); `server.py` still uses `?key=` in URL |
| Security Scan | ✅ Good | No hardcoded secrets, no client-side key leaks, no SQL injection |
| API Endpoints | ⚠️ Warning | Missing `/api/subscription-status`; JWT expiry is 30 days (should be ≤ 7) |
| Zakat Calculator | ✅ Logic correct | All 4 test cases pass; but fallback values produce wildly wrong nisab |
| Skill Routing | ❌ Bug | "Assalamu alaikum" → `salam-specialist` (false positive) |
| Rate Limiting | ⚠️ Partial | `api/chat.js` enforces daily limits; `server.py` has NO rate limiting |
| Live Site | ✅ Working | All pages load (200), health = OK, rates live, chat responsive |
| Vercel Config | ✅ Good | 12 API routes (≤ 12 Hobby limit), security headers present, no "public" property |
| Database Schema | ✅ Complete | All 8 tables + indexes present and correct |

---

## Overall Health Score: **6.5/10**

Deducted points for:
- **-1.5:** Fallback silver rate still broken (310 instead of 2450+) — makes Zakat calculator inaccurate when live rates fail
- **-1.0:** "Salam" routing bug creates wrong skill assignment for greeting messages
- **-1.0:** `server.py` exposes API key in URL (local dev only, but still a security concern)

---

## Critical Issues (fix before going live)

### 1. Zakat Calculator Silver Fallback — Wrong Nisab
- **File:** `web/js/calculators.js:146`
- **File:** `api/rates.js:17`
- **Issue:** Silver fallback rate is **310 PKR/tola** but should be **~2450 PKR/tola** (June 2026 market)
- **Impact:** When live rates API fails, silver nisab calculates to PKR 16,275 instead of PKR 128,625. A user with PKR 100k savings would incorrectly be told Zakat is due.
- **Fix:** Change `310` → `2450` (and `330000` gold should be verified — live API returns ~415,000 so 330,000 is also outdated)

```diff
- silverRatePerTola = (window._liveRates?.silver_pkr_per_tola) || 310,
+ silverRatePerTola = (window._liveRates?.silver_pkr_per_tola) || 2450,
```
```diff
- goldRatePerTola = (window._liveRates?.gold_pkr_per_tola) || 330000,
+ goldRatePerTola = (window._liveRates?.gold_pkr_per_tola) || 280000,
```

Also fix `api/rates.js:17`:
```diff
-   silver_pkr_per_tola: 310,  // ~PKR 310/tola (June 2026). Update quarterly.
+   silver_pkr_per_tola: 2450,  // ~PKR 2450/tola (June 2026). Update quarterly.
```

### 2. "Salam" Word Match Causes Wrong Skill Routing
- **File:** `api/chat.js:57-67`
- **File:** `server.py:92-93`
- **Issue:** `msg.includes("salam")` matches "Assalamu alaikum" → triggers `salam-specialist` instead of `islamic-banking-advisor`
- **Impact:** Every user greeting (Assalamu Alaikum, Salam, etc.) gets routed to crop/forward sale skill instead of general advisor
- **Fix:** Use `\b` word boundary regex in `api/chat.js`:

```js
// In api/chat.js line 57-67, replace:
if (
    msg.includes("salam") ||
    msg.includes("سلم") ||
    ...)
// With:
if (
    /\bsalam\b/i.test(msg) ||
    msg.includes("سلم") ||
    ...)
```

Same fix in `server.py:92`:
```python
import re
# ...
if re.search(r'\bsalam\b', msg) or any(k in msg for k in ['forward sale', ...]):
```

### 3. server.py Exposes Gemini API Key in URL
- **File:** `server.py:315-316`
- **Issue:** API key passed as `?key={GEMINI_KEY}` query parameter in URL (logged, visible in network tabs)
- **Fix:** Use `x-goog-api-key` header instead:

```diff
- url = (f'https://generativelanguage.googleapis.com/v1beta'
-        f'/models/{GEMINI_MODEL}:generateContent?key={GEMINI_KEY}')
- req = Request(url,
-     data=json.dumps(gemini_body).encode(),
-     headers={'Content-Type': 'application/json'},
-     method='POST')
+ url = (f'https://generativelanguage.googleapis.com/v1beta'
+        f'/models/{GEMINI_MODEL}:generateContent')
+ req = Request(url,
+     data=json.dumps(gemini_body).encode(),
+     headers={'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY},
+     method='POST')
```

---

## Warnings (fix soon)

### 4. JWT Expiry Set to 30 Days
- **Files:** `api/auth/verify-otp.js:84`, `api/payments/verify.js:69`
- **Issue:** `expiresIn: '30d'` — exceeds the recommended 7-day maximum
- **Fix:** Change to `expiresIn: '7d'`

### 5. Missing `/api/subscription-status` Endpoint
- **Issue:** No file exists at `api/payments/subscription-status.js` and no route in `vercel.json`
- **Impact:** Frontend cannot check subscription status via API (though `/api/auth/me` does return subscription data)
- **Fix:** Either document that `/api/auth/me` is the substitute, or create the dedicated endpoint

### 6. server.py Has No Rate Limiting
- **File:** `server.py`
- **Issue:** No daily query limits, no OTP rate limiting, no failed-attempt tracking
- **Impact:** Local dev can be abused; production uses `api/chat.js` which has limits, so this is low-risk
- **Fix:** Add rate limit tracking in `server.py` to match `api/chat.js` behavior

### 7. server.py Lacks Arabic/Urdu Skill Keywords
- **File:** `server.py:86-116`
- **Issue:** Arabic/Urdu keywords (زکات, صكوك, إجارة) are in `api/chat.js` but missing from `server.py`
- **Impact:** Users testing locally in Urdu get routed to generic advisor instead of specialist skills
- **Fix:** Add Arabic/Urdu keywords to server.py to match api/chat.js

### 8. Package.json Missing Test Script
- **File:** `package.json:7`
- **Issue:** `"test": "echo \"Error: no test specified\" && exit 1"`
- **Impact:** No automated testing can be run
- **Fix:** Set up a test framework (e.g., vitest, jest) and add test scripts

---

## Passed Checks

| # | Check | Status | Detail |
|---|-------|--------|--------|
| 1 | Hardcoded Secrets | ✅ | No `sk_live`, `AIzaSy`, `whsec_` in any source file |
| 2 | Client-Side API Keys | ✅ | No API keys in `web/` or `public/` files |
| 3 | .gitignore | ✅ | `.env`, `.env.local`, `.env.*.local` all present |
| 4 | SQL Injection | ✅ | All queries use parameterized syntax (`$1`, `$2`) |
| 5 | Prompt Injection Defense | ✅ | `api/chat.js:429-448` has injection pattern detection |
| 6 | CORS Headers | ✅ | All API endpoints restrict origins to whitelist |
| 7 | Input Validation | ✅ | `validateInput()` checks structure, length limit 2000, injection patterns |
| 8 | Zakat Test 1 (Silver Nisab) | ✅ | 52.5 × 2450 = 128,625 (pass) |
| 9 | Zakat Test 2 (Gold Nisab) | ✅ | 7.5 × 210000 = 1,575,000 (pass) |
| 10 | Zakat Test 3 (500k above nisab) | ✅ | zakatAmount = 12,500 (pass) |
| 11 | Zakat Test 4 (100k below nisab) | ✅ | zakatAmount = 0 (pass) |
| 12 | Skill Routing (EN, correct) | ✅ | 7/10 English tests pass correctly |
| 13 | Skill Routing (UR/AR in api/chat.js) | ✅ | Arabic/Urdu keywords work in api/chat.js |
| 14 | Live Site — Landing Page | ✅ | HTTP 200, loads without errors |
| 15 | Live Site — Chat Page | ✅ | HTTP 200 |
| 16 | Live Site — Pricing Page | ✅ | HTTP 200 |
| 17 | Live Site — Calculators Page | ✅ | HTTP 200 |
| 18 | Live Site — Health API | ✅ | gemini=true, database=true |
| 19 | Live Site — Rates API | ✅ | Returns live gold/silver prices |
| 20 | Vercel Config — No "public" | ✅ | Property absent |
| 21 | Vercel Config — outputDirectory | ✅ | Set to "web" |
| 22 | Vercel Config — API Route Count | ✅ | 12 routes (≤ 12 Hobby limit) |
| 23 | Vercel Config — Security Headers | ✅ | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection all present |
| 24 | Vercel Config — Cache-Control | ✅ | Static assets: max-age=31536000 |
| 25 | Database Schema — users table | ✅ | id, email, created_at; has email index |
| 26 | Database Schema — otps table | ✅ | email, code, expires_at, used; has email index |
| 27 | Database Schema — sessions table | ✅ | id, user_id, created_at; has user_email index |
| 28 | Database Schema — messages table | ✅ | id, session_id, role, content; has session_id index |
| 29 | Database Schema — subscriptions | ✅ | user_id, plan, stripe_customer_id, status; has user_id index |
| 30 | Database Schema — rate_limits | ✅ | ip+date composite PK + index |
| 31 | Database Schema — shariah_audit_log | ✅ | user_id, query_type, disclaimer_shown; has user_id index |
| 32 | Database Schema — rates_cache | ✅ | metal, rate_pkr, updated_at; has metal index |
| 33 | OTP Rate Limit (3 per 10 min) | ✅ | Enforced in `api/auth/send-otp.js:46-55` |
| 34 | OTP Failed Attempts (5 max) | ✅ | Enforced in `api/auth/verify-otp.js:52-54` |
| 35 | JWT Algorithm | ✅ | Uses HS256 (jsonwebtoken default) — never "none" |
| 36 | JWT `exp` Claim | ✅ | Set in both api/chat.js and server.py |
| 37 | Chat API — `api/chat.js` | ✅ | try/catch ✅, JWT verified ✅, CORS ✅, input validated ✅ |
| 38 | Send OTP — `api/auth/send-otp.js` | ✅ | try/catch ✅, CORS ✅, input validated ✅ |
| 39 | Verify OTP — `api/auth/verify-otp.js` | ✅ | try/catch ✅, JWT generated ✅, CORS ✅, input validated ✅ |
| 40 | Rates — `api/rates.js` | ✅ | try/catch ✅, CORS ✅, cache layer ✅ |
| 41 | Create Checkout — `api/payments/create-checkout.js` | ✅ | try/catch ✅, JWT verified ✅, CORS ✅, input validated ✅ |
| 42 | Stripe Webhook — `api/payments/stripe-webhook.js` | ✅ | Signature verification ✅, CORS ✅, try/catch ✅ |
| 43 | Admin — `api/admin.js` | ✅ | Password auth ✅, CORS ✅, try/catch ✅ |
| 44 | Health — `api/health.js` | ✅ | Simple, no auth needed, 200/503 ✅ |
| 45 | History — `api/history.js` | ✅ | JWT verified ✅, CORS ✅, try/catch ✅ |
| 46 | Auth Me — `api/auth/me.js` | ✅ | JWT verified ✅, CORS ✅, try/catch ✅ |

---

## API Endpoints Detail

| Endpoint | File Exists? | try/catch? | JWT Check? | CORS? | Input Validated? |
|----------|-------------|-----------|-----------|-------|-----------------|
| POST /api/chat | ✅ `api/chat.js` | ✅ | ✅ | ✅ | ✅ |
| POST /api/auth/send-otp | ✅ `api/auth/send-otp.js` | ✅ | N/A (public) | ✅ | ✅ |
| POST /api/auth/verify-otp | ✅ `api/auth/verify-otp.js` | ✅ | N/A (creates JWT) | ✅ | ✅ |
| GET /api/rates | ✅ `api/rates.js` | ✅ | N/A (public) | ✅ | N/A (GET) |
| POST /api/create-checkout | ✅ `api/payments/create-checkout.js` | ✅ | ✅ | ✅ | ✅ |
| POST /api/stripe-webhook | ✅ `api/payments/stripe-webhook.js` | ✅ | N/A (webhook sig) | ❌ (no CORS, intentional) | ✅ (sig verify) |
| GET /api/subscription-status | ❌ **MISSING** | — | — | — | — |
| GET /api/auth/me | ✅ `api/auth/me.js` | ✅ | ✅ | ✅ | ✅ |
| GET /api/history | ✅ `api/history.js` | ✅ | ✅ | ✅ | ✅ |
| GET /api/health | ✅ `api/health.js` | ✅ | N/A (public) | ❌ (no CORS, public OK) | N/A |
| GET /api/admin | ✅ `api/admin.js` | ✅ | N/A (password auth) | ✅ | N/A |

---

## Skill Routing — Detailed Results (api/chat.js)

| User Message | Expected Skill | Result | Verdict |
|-------------|---------------|--------|---------|
| "What is murabaha?" | murabaha-specialist | murabaha-specialist | ✅ |
| "Calculate zakat on my savings" | zakat-advisor | zakat-advisor | ✅ |
| "Explain ijara lease" | ijara-specialist | ijara-specialist | ✅ |
| "What is sukuk?" | sukuk-investor/sukuk-takaful | sukuk-takaful-specialist | ✅ |
| "Musharakah partnership rules" | musharakah-mudarabah-specialist | musharakah-mudarabah-specialist | ✅ |
| "زکات کا نصاب کیا ہے؟" | zakat-advisor | zakat-advisor | ✅ |
| "صكوك کیا ہے؟" | sukuk-investor/sukuk-takaful | sukuk-takaful-specialist | ✅ |
| "إجارة contract" | ijara-specialist | ijara-specialist | ✅ |
| "Is this halal?" | shariah-compliance-checker | shariah-compliance-checker | ✅ |
| **"Assalamu alaikum, help me"** | islamic-banking-advisor | **salam-specialist** | **❌ CRITICAL** |
| **"Salam, how are you?"** | islamic-banking-advisor | **salam-specialist** | **❌ CRITICAL** |

---

## Live Site Quick Check

| Test | Status | Notes |
|------|--------|-------|
| Landing page loads | ✅ | HTTP 200 |
| /chat redirects if unauthed | ✅ | Loads chat page (login modal shows) |
| /pricing shows 3 tiers | ✅ | Free / Premium (PKR 1,500/mo) / Professional (PKR 15,000/mo) |
| /calculators page loads | ✅ | HTTP 200 |
| Health API | ✅ | `{"status":"ok","gemini":true,"database":true}` |
| Rates API | ✅ | `gold_pkr_per_tola: 415583`, `silver_pkr_per_tola: 5068` (live) |
| Console errors | ⚠️ | JavaScript injected page, emoji check pending |
| API keys visible in network | ✅ No | `x-goog-api-key` header used (not URL param) |
| Response streaming | ❌ | Response is one JSON blob, not streamed (Gemini SSE not implemented) |
| Mobile check (375px) | ✅ | Responsive design present in CSS |

---

## Recommended Next Action

**Fix the Silver Nisab fallback value (Critical #1)** — this is the highest-impact bug. The current fallback of 310 PKR/tola makes the Zakat calculator unusable when live rates fail. Change to 2450 in both `web/js/calculators.js:146` and `api/rates.js:17`. Then fix the "salam" word-boundary routing bug (Critical #2). These two issues affect every user on every session.

---

## File Tree Snapshot

```
islamic-banking-fte/
├── api/                    # Vercel serverless functions
│   ├── admin.js
│   ├── chat.js             ★ Main chat handler (skill routing + Gemini)
│   ├── health.js
│   ├── history.js
│   ├── rates.js            ★ Live gold/silver rates (cached)
│   ├── auth/
│   │   ├── me.js
│   │   ├── send-otp.js
│   │   └── verify-otp.js
│   └── payments/
│       ├── create-checkout.js
│       ├── portal.js
│       ├── stripe-webhook.js
│       └── verify.js
├── web/                    # Static frontend
│   ├── app.js              ★ Chat UI logic
│   ├── auth.js             ★ OTP/email auth UI
│   ├── style.css
│   ├── sw.js               # Service worker (PWA)
│   ├── js/
│   │   └── calculators.js  ★ Zakat/Murabaha/Ijara calculators
│   ├── landing.html
│   ├── chat.html
│   ├── calculators.html
│   ├── pricing.html
│   ├── dashboard.html
│   ├── banks.html
│   ├── admin.html
│   ├── favicon.svg
│   └── manifest.json
├── server.py               # Python local dev server
├── vercel.json
├── schema.sql
├── package.json
├── .gitignore
├── .env.example
├── CLAUDE.md
├── skills/                 # 16 specialist skill definitions
│   ├── islamic-finance-router/
│   │   ├── SKILL.md
│   │   └── references/jurisdictions/ (14 jurisdiction overlays)
│   ├── murabaha-specialist/
│   ├── zakat-advisor/
│   ├── ijara-specialist/
│   ├── salam-specialist/   ★ Problem: "assalamu" matches this
│   ├── sukuk-investor/
│   └── ... (12 more)
├── references/
├── commands/
├── workflow-recipes/
├── hooks/
└── evals/
```

**Total source files:** ~103 (excluding node_modules, .git)
- JS: 16 | HTML: 7 | CSS: 1 | Python: 3 | JSON: 9 | MD: 60 | SQL: 1
