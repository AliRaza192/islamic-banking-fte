# ISLAMIC BANKING FTE — PRODUCTION AUDIT REPORT

**Date:** 2026-07-03
**Auditor:** Senior Full-Stack Security & Architecture Auditor
**Scope:** Complete codebase — API routes, auth, database, frontend, deployment config

---

## PROJECT MAP

```
Framework:           Vercel Serverless Functions (vanilla JS, no framework)
Auth System:         Custom Email OTP + JWT (jsonwebtoken)
DB Driver:           @neondatabase/serverless 1.1.0 — neon() HTTP driver ✅
API Routes:          11 (chat, auth/send-otp, auth/verify-otp, auth/me, admin,
                     health, history, rates, payments/create-checkout,
                     payments/verify, payments/portal, payments/stripe-webhook)
Pages:               8 (landing, chat, calculators, banks, dashboard,
                     pricing, admin, 404)
ENV vars needed:     11 (GEMINI_API_KEY, DATABASE_URL, GEMINI_MODEL,
                     JWT_SECRET, RESEND_API_KEY, STRIPE_SECRET_KEY,
                     STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PREMIUM,
                     STRIPE_PRICE_PROFESSIONAL, ADMIN_PASSWORD, GOLD_API_KEY)
Skills:              18 specialist skills
References:          6 reference documents
```

---

## OVERALL GRADE: B-

## SCORES (out of 10)

| Category                      | Score |
|-------------------------------|-------|
| Authentication Security       |  6/10 |
| Database Driver               |  9/10 |
| API Security                  |  5/10 |
| Islamic Finance Logic         |  8/10 |
| Frontend/UX                   |  7/10 |
| Code Quality                  |  6/10 |
| Deployment Config             |  7/10 |

---

## PHASE 1: PROJECT DISCOVERY

### Framework
- **NOT Next.js.** This is a Vercel Serverless Functions project with vanilla JS API routes in `api/` and static HTML in `web/`.
- `vercel.json` serves `web/` as `outputDirectory`.
- No build step — files served directly.

### Dependencies (package.json)
| Package | Version | Notes |
|---------|---------|-------|
| @neondatabase/serverless | 1.1.0 | ⚠️ Latest is 1.14.x — outdated |
| jsonwebtoken | 9.0.3 | ✅ OK |
| resend | 6.12.4 | ✅ OK |
| stripe | 22.2.0 | ✅ OK |
| ws | 8.18.0 | ⚠️ Unnecessary — neon() uses HTTP, not WebSocket |

### Missing from package.json
- No `scripts` section (no lint, no test, no build)
- No TypeScript
- No Zod/joi for validation
- No ESLint/Prettier

---

## PHASE 2: AUTHENTICATION AUDIT

### File: `api/auth/send-otp.js`
**Status: ✅ PASS (with warnings)**

| Check | Status | Notes |
|-------|--------|-------|
| OTP stored in DB | ✅ | Inserted into `otps` table |
| OTP expiry | ✅ | 5 minutes (`expires_at = NOW() + 5min`) |
| Rate limit per email | ✅ | Max 3 OTPs per 10 minutes per email |
| OTP attempts limit | ⚠️ | No limit on OTP send attempts from same IP |
| Race condition | ⚠️ | No advisory lock — double-submit possible |
| Email validation | ✅ | Regex + `.toLowerCase().trim()` |

**Issues:**
1. ⚠️ **No IP-based rate limit** — Attacker can send OTPs to many emails from same IP
2. ⚠️ **No advisory lock** — Race condition on concurrent OTP requests

### File: `api/auth/verify-otp.js`
**Status: ✅ PASS**

| Check | Status | Notes |
|-------|--------|-------|
| OTP expiry check | ✅ | `expires_at > NOW()` |
| Failed attempts limit | ✅ | Max 5 attempts per OTP |
| OTP marked as used | ✅ | `UPDATE otps SET used = TRUE` |
| User upsert | ✅ | `ON CONFLICT (email) DO UPDATE` |
| JWT expiry | ✅ | 7 days |
| JWT secret check | ✅ | Returns 500 if not configured |

**Issues:**
1. ⚠️ **OTP comparison is plain string equality** — `otpRows[0].code !== code.trim()` — not timing-safe. Use `crypto.timingSafeEqual()`.

### File: `api/auth/me.js`
**Status: ✅ PASS**

| Check | Status | Notes |
|-------|--------|-------|
| Auth header check | ✅ | Bearer token required |
| JWT verify | ✅ | `jwt.verify()` with secret |
| Daily counter reset | ✅ | Resets if date changed |
| Subscription fetch | ✅ | Returns active/past_due subs |

### File: middleware.ts
**Status: ❌ NOT FOUND**
- No middleware file exists. This is expected for vanilla Vercel serverless (not Next.js).
- Route protection is handled per-API in each handler.

### Session Management
| Check | Status | Notes |
|-------|--------|-------|
| Token storage | ⚠️ | `sessionStorage` — XSS vulnerable |
| HttpOnly cookie | ❌ | Not used — token in JS-accessible storage |
| Secure flag | N/A | Not using cookies |
| SameSite | N/A | Not using cookies |
| Session expiry | ✅ | JWT expires in 7 days |

**Critical Issue:** Token stored in `sessionStorage` (accessible via XSS). Should use HttpOnly cookies.

---

## PHASE 3: DATABASE DRIVER AUDIT

### ✅ ALL FILES USE `neon()` — NO `Pool` USAGE

| File | Import Pattern | Status |
|------|---------------|--------|
| api/chat.js | `import { neonConfig, neon } from "@neondatabase/serverless"` | ✅ |
| api/auth/send-otp.js | `import { neonConfig, neon } from "@neondatabase/serverless"` | ✅ |
| api/auth/verify-otp.js | `import { neonConfig, neon } from "@neondatabase/serverless"` | ✅ |
| api/auth/me.js | `import { neonConfig, neon } from '@neondatabase/serverless'` | ✅ |
| api/admin.js | `import { neonConfig, neon } from '@neondatabase/serverless'` | ✅ |
| api/health.js | `import { neon } from "@neondatabase/serverless"` | ✅ |
| api/history.js | `import { neon } from '@neondatabase/serverless'` | ✅ |
| api/rates.js | No DB usage | ✅ |
| api/payments/create-checkout.js | `import { neon } from '@neondatabase/serverless'` | ✅ |
| api/payments/verify.js | `import { neon } from '@neondatabase/serverless'` | ✅ |
| api/payments/portal.js | `import { neon } from '@neondatabase/serverless'` | ✅ |
| api/payments/stripe-webhook.js | `import { neon } from '@neondatabase/serverless'` | ✅ |

**Database Connection Pattern:**
- `neon(process.env.DATABASE_URL)` called inside handlers ✅
- SQL uses tagged template literals (safe from SQL injection) ✅
- No connection pooling issues ✅

**Issues:**
1. ⚠️ **Unnecessary WebSocket config** — `neonConfig.webSocketConstructor = ws` in 5 files. `neon()` uses HTTP, not WebSocket. This is dead code. The `ws` dependency can be removed.
2. ⚠️ **`ws` dependency is unnecessary** — Only needed for `Pool` (WebSocket driver). Since all files use `neon()` (HTTP), `ws` is dead weight.

---

## PHASE 4: API ROUTES SECURITY AUDIT

### Route: `/api/chat` (POST)
**Status: ⚠️ WARNING**

| Check | Status | Notes |
|-------|--------|-------|
| Input validation | ✅ | `validateInput()` — checks contents, length, injection patterns |
| Rate limiting | ✅ | Tiered: anonymous=5, free=5, premium=100, professional=∞ |
| Auth required | ❌ | Allows anonymous (5 queries) |
| Error handling | ✅ | Generic error messages |
| Prompt injection defense | ✅ | Regex patterns block common attempts |
| CORS | ⚠️ | See CORS issues below |

**Issues:**
1. ⚠️ **CORS fallback allows any origin** — `api/chat.js:596-598` — If origin not in ALLOWED_ORIGINS but is present, it's echoed back as allowed. This is effectively a wildcard.
2. ⚠️ **Error messages leak internal details** — `api/chat.js:803` returns `err.message` which may contain stack traces.

### Route: `/api/auth/send-otp` (POST)
**Status: ✅ PASS**

| Check | Status | Notes |
|-------|--------|-------|
| Input validation | ✅ | Email regex + trim |
| Rate limiting | ✅ | 3 OTPs per email per 10 minutes |
| Error handling | ✅ | Generic messages |

### Route: `/api/auth/verify-otp` (POST)
**Status: ✅ PASS**

| Check | Status | Notes |
|-------|--------|-------|
| Input validation | ✅ | Email + code required |
| Rate limiting | ✅ | 5 failed attempts per OTP |
| Error handling | ✅ | Generic messages |

### Route: `/api/auth/me` (GET)
**Status: ✅ PASS**

| Check | Status | Notes |
|-------|--------|-------|
| Auth required | ✅ | Bearer token |
| Error handling | ✅ | JWT errors caught |

### Route: `/api/admin` (GET)
**Status: ⚠️ WARNING**

| Check | Status | Notes |
|-------|--------|-------|
| Auth required | ✅ | Bearer password |
| Password auth | ⚠️ | Plain password comparison, no JWT |
| Error handling | ⚠️ | `err.message` leaked at line 151 |

**Issues:**
1. ⚠️ **Admin uses password-only auth** — No JWT, no session. Password sent in every request header.
2. ⚠️ **Error message leaked** — `api/admin.js:151` returns `err.message` to client.

### Route: `/api/history` (GET/DELETE)
**Status: ⚠️ WARNING**

| Check | Status | Notes |
|-------|--------|-------|
| Auth required | ✅ | Bearer token |
| Input validation | ⚠️ | DELETE checks session_id but no ownership verification before delete |
| Error handling | ⚠️ | `err.message` leaked at line 79 |

**Issues:**
1. ⚠️ **Error message leaked** — `api/history.js:79` returns `err.message`.

### Route: `/api/rates` (GET)
**Status: ✅ PASS**

| Check | Status | Notes |
|-------|--------|-------|
| No auth needed | ✅ | Public endpoint |
| Caching | ✅ | In-memory 6h cache + browser 6h cache |
| Fallback | ✅ | Hardcoded fallback if API fails |

### Route: `/api/health` (GET)
**Status: ⚠️ WARNING**

| Check | Status | Notes |
|-------|--------|-------|
| No auth needed | ✅ | Health check |
| Error handling | ⚠️ | `checks.db_error = err.message` leaks DB error |

**Issues:**
1. ⚠️ **DB error message leaked** — `api/health.js:40` exposes database error details.

### Route: `/api/payments/create-checkout` (POST)
**Status: ✅ PASS**

| Check | Status | Notes |
|-------|--------|-------|
| Auth required | ✅ | Bearer token |
| Input validation | ✅ | Tier + provider validated |
| Stripe integration | ✅ | Proper session creation |

### Route: `/api/payments/verify` (POST)
**Status: ✅ PASS**

| Check | Status | Notes |
|-------|--------|-------|
| Auth required | ✅ | Bearer token |
| Stripe verification | ✅ | Session payment_status checked |
| Tier update | ✅ | User tier updated in DB |

### Route: `/api/payments/portal` (POST)
**Status: ✅ PASS**

| Check | Status | Notes |
|-------|--------|-------|
| Auth required | ✅ | Bearer token |
| Stripe portal | ✅ | Customer portal session created |

### Route: `/api/payments/stripe-webhook` (POST)
**Status: ✅ PASS**

| Check | Status | Notes |
|-------|--------|-------|
| Signature verification | ✅ | `stripe.webhooks.constructEvent()` |
| Raw body parsing | ✅ | `bodyParser: false` + manual read |
| Event handling | ✅ | checkout.session.completed, subscription updated/deleted, invoice succeeded/failed |
| Confirmation email | ✅ | Sent via Resend |

---

## CORS VULNERABILITY (CRITICAL)

### Affected Files:
- `api/chat.js:593-598`
- `api/auth/send-otp.js:15-19`
- `api/auth/verify-otp.js:15-19`
- `api/auth/me.js:23-27`
- `api/admin.js:19-23`
- `api/health.js:10-14`
- `api/rates.js:112-116`
- `api/payments/*.js`

### The Problem:
```javascript
// CURRENT (VULNERABLE):
if (ALLOWED_ORIGINS.includes(origin)) {
  res.setHeader("Access-Control-Allow-Origin", origin);
} else if (origin) {
  // Fallback: allow the requesting origin if not blocked
  res.setHeader("Access-Control-Allow-Origin", origin);  // ← ALLOWS ANY ORIGIN
}
```

### The Fix:
```javascript
// FIXED:
if (origin && ALLOWED_ORIGINS.includes(origin)) {
  res.setHeader("Access-Control-Allow-Origin", origin);
}
// No else — don't set header for unknown origins
```

**Impact:** Any website can make authenticated API requests on behalf of logged-in users. This is a **CSRF-like vulnerability**.

---

## PHASE 5: ISLAMIC BANKING LOGIC AUDIT

### Murabaha Calculator (`web/js/calculators.js:11-51`)
| Check | Status | Notes |
|-------|--------|-------|
| Formula correct | ✅ | Cost + (Cost × Rate × Years) = Total |
| Down payment | ✅ | Financed = Cost - DownPayment |
| Monthly installment | ✅ | Total / Months (flat, not reducing) |
| Shariah compliance | ✅ | Profit fixed at contract time |

### Diminishing Musharakah (`web/js/calculators.js:55-107`)
| Check | Status | Notes |
|-------|--------|-------|
| Bank share calculation | ✅ | Value × BankSharePct |
| Monthly buyback | ✅ | BankAmount / Months |
| Rental on bank share | ✅ | BankBalance × Rate / 12 |
| Decreasing rental | ✅ | Recalculated each month on remaining balance |
| Formula | ✅ | Rental = BankBalance × ProfitRate / 12 |

### Ijara (`web/js/calculators.js:111-132`)
| Check | Status | Notes |
|-------|--------|-------|
| Residual value | ✅ | Configurable (default 10%) |
| Monthly rental | ✅ | Depreciation + RentalIncome |
| Total cost | ✅ | TotalRent + Residual |

### Zakat Calculator (`web/js/calculators.js:136-192`)
| Check | Status | Notes |
|-------|--------|-------|
| Nisab values | ✅ | Gold (7.5 tola) + Silver (52.5 tola) |
| 2.5% rate | ✅ | `totalWealth * 0.025` |
| Silver nisab basis | ✅ | Used for Pakistan (more inclusive) |
| Live rates | ✅ | Fetched from `/api/rates` |
| Deductions | ✅ | Liabilities subtracted |

### Sukuk Calculator (`web/js/calculators.js:196-230`)
| Check | Status | Notes |
|-------|--------|-------|
| Semi-annual payments | ✅ | Default frequency |
| Periodic payment | ✅ | Face × Rate / PeriodsPerYear |
| Principal return at maturity | ✅ | Last period includes face value |

### Shariah Compliance Checker (`web/js/calculators.js:233-285`)
| Check | Status | Notes |
|-------|--------|-------|
| Riba detection | ✅ | interest, sood, apr, guaranteed profit |
| Gharar detection | ✅ | futures, options, short selling |
| Maysir detection | ✅ | gambling, lottery, casino |
| Haram industry | ✅ | alcohol, pork, tobacco |
| Disclaimer | ✅ | "Not a Fatwa" disclaimer included |

### Rates API (`api/rates.js`)
| Check | Status | Notes |
|-------|--------|-------|
| Gold price source | ✅ | goldapi.io (free tier) |
| USD/PKR rate | ✅ | open.er-api.com |
| Nisab calculation | ✅ | Gold: 7.5 tola, Silver: 52.5 tola |
| Fallback rates | ✅ | Hardcoded June 2026 estimates |
| Silver ratio | ⚠️ | Uses 82:1 gold/silver ratio (estimated, not live) |

### Bank Comparison
- Not implemented as code — handled by AI skills dynamically ✅
- Rates are approximate, AI provides context ✅

### Shariah Disclaimer
- Required in every financial response ✅
- Included in CLAUDE.md system prompt ✅
- `⚠️ Shariah Disclaimer` pattern matched in frontend formatting ✅

---

## PHASE 6: FRONTEND & UX AUDIT

### Loading States
| Check | Status | Notes |
|-------|--------|-------|
| Thinking indicator | ✅ | `setThinking(true)` + typing dots |
| Button disable during send | ✅ | `sendBtnEl.disabled = on` |
| OTP send button disable | ✅ | `btn.disabled = true` during send |
| OTP verify button disable | ✅ | `btn.disabled = true` during verify |

### Error Display
| Check | Status | Notes |
|-------|--------|-------|
| API errors shown | ✅ | `appendMessage("bot", error)` |
| Rate limit message | ✅ | Shows login/upgrade prompt |
| Network errors | ✅ | try/catch with user-friendly message |

### Mobile Responsiveness
| Check | Status | Notes |
|-------|--------|-------|
| Responsive CSS | ✅ | Tailwind-style classes in `style.css` |
| Mobile header | ✅ | Hamburger menu + sidebar |
| Touch targets | ✅ | Buttons are adequately sized |
| Input type="email" | ✅ | Used in login modal |
| Inputmode="numeric" | ✅ | OTP input uses `inputmode="numeric"` |

### Voice Input
| Check | Status | Notes |
|-------|--------|-------|
| SpeechRecognition | ✅ | Web Speech API with `ur-PK` locale |
| Fallback | ✅ | Button hidden if not supported |
| Auto-send on final | ✅ | Sends after speech ends |

### XSS Protection
| Check | Status | Notes |
|-------|--------|-------|
| DOMPurify | ✅ | Loaded from CDN, used in `safeHtml()` |
| escapeHtml | ✅ | Used for user messages |
| innerHTML with sanitize | ✅ | Bot responses go through `safeHtml()` first... |

**Issue:** `safeHtml()` is defined but NOT called in `formatResponse()`. The `formatResponse()` function at line 310 calls `escapeHtml()` on the full text, but then uses `innerHTML` to render. The `safeHtml()` function with DOMPurify is defined but never actually invoked in the render path.

Actually — looking more carefully: `formatResponse()` at line 310 does `let html = escapeHtml(text)` which escapes HTML entities, then applies regex transformations. This is safe because the text is escaped first. DOMPurify's `safeHtml()` is a defense-in-depth layer that isn't being used but doesn't create a vulnerability since `escapeHtml()` already prevents XSS.

### PWA Support
| Check | Status | Notes |
|-------|--------|-------|
| manifest.json | ✅ | Complete with shortcuts, icons |
| Service worker | ✅ | Cache-first for static, network-first for API |
| Theme color | ✅ | `#1a4731` |

---

## PHASE 7: ENVIRONMENT & DEPLOYMENT AUDIT

### 🔴 CRITICAL: SECRETS EXPOSED IN .env.local

**`.env.local` contains LIVE credentials:**
```
GEMINI_API_KEY=***REDACTED***
DATABASE_URL=***REDACTED***
RESEND_API_KEY=***REDACTED***
JWT_SECRET=***REDACTED***
STRIPE_SECRET_KEY=***REDACTED***
STRIPE_WEBHOOK_SECRET=***REDACTED***
ADMIN_PASSWORD=***REDACTED***
GOLD_API_KEY=***REDACTED***
```

**Status:** `.env.local` IS in `.gitignore` ✅ — but if this file was ever committed (check git history), all secrets are compromised.

### JWT Secret Weakness
- `JWT_SECRET=***REDACTED***` — Only 20 chars, predictable pattern
- **Should be:** 32+ random characters, e.g., `crypto.randomBytes(32).toString('hex')`

### Vercel Configuration (`vercel.json`)
| Check | Status | Notes |
|-------|--------|-------|
| Functions config | ✅ | 512MB memory, 30s timeout |
| Security headers | ✅ | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy |
| Cache headers | ✅ | API: no-cache, Static: 1yr immutable |
| Rewrites | ✅ | Clean URLs |

### .gitignore
| Check | Status | Notes |
|-------|--------|-------|
| .env files | ✅ | `.env`, `.env.local`, `.env.*.local` all ignored |
| node_modules | ✅ | Ignored |
| .vercel | ✅ | Ignored |

### Package Versions
| Package | Installed | Latest | Status |
|---------|-----------|--------|--------|
| @neondatabase/serverless | 1.1.0 | ~1.14.x | ⚠️ Outdated |
| jsonwebtoken | 9.0.3 | 9.0.x | ✅ OK |
| resend | 6.12.4 | 6.x | ✅ OK |
| stripe | 22.2.0 | 22.x | ✅ OK |

---

## PHASE 8: CODE QUALITY AUDIT

### TypeScript
- ❌ **No TypeScript** — All files are plain JavaScript
- ❌ No type definitions
- ❌ No `tsconfig.json`

### Code Duplication
| Issue | Files Affected |
|-------|---------------|
| CORS logic duplicated | All 11 API files — each has its own ALLOWED_ORIGINS + setCors |
| neon() import + ws config | 5 files repeat `neonConfig.webSocketConstructor = ws` |
| TIER_LIMITS defined twice | `api/chat.js` and `api/auth/me.js` |

### Console Statements
- **28 console statements** across API files (log, error, warn)
- `console.error` is appropriate for server-side error logging ✅
- `console.log` in `server.py` is for dev server — OK

### Dead Code
| Item | Location |
|------|----------|
| `neonConfig.webSocketConstructor = ws` | 5 files — unnecessary for HTTP driver |
| `ws` dependency | package.json — unused |
| `safeHtml()` function | `web/app.js:8-41` — defined but never called |
| `resend` import | Not imported in any API file (used via `fetch` directly) |

### Error Message Leakage
| File | Line | Leaked Message |
|------|------|----------------|
| api/history.js | 79 | `err.message` |
| api/payments/portal.js | 65 | `err.message` |
| api/payments/create-checkout.js | 93 | `err.message` |
| api/admin.js | 151 | `err.message` |
| api/health.js | 40 | `err.message` (DB error) |
| api/chat.js | 803 | `err.message` (may contain internal details) |

### Input Validation Gaps
| Endpoint | Validation |
|----------|-----------|
| `/api/chat` | ✅ Full validation |
| `/api/auth/send-otp` | ✅ Email regex |
| `/api/auth/verify-otp` | ✅ Email + code |
| `/api/admin` | ⚠️ Password only |
| `/api/history` | ⚠️ No session ownership check on DELETE |
| `/api/payments/*` | ✅ JWT + tier validation |
| `/api/rates` | ✅ Public, no input needed |
| `/api/health` | ✅ Public, no input needed |

---

## PHASE 9: FINAL AUDIT REPORT

### 🔴 CRITICAL BUGS (Fix immediately — Production breaking):

1. **CORS wildcard vulnerability** → All API files → Remove `else if (origin)` fallback that echoes any origin
   ```javascript
   // BEFORE (VULNERABLE):
   } else if (origin) {
     res.setHeader("Access-Control-Allow-Origin", origin);
   }
   
   // AFTER (FIXED):
   }
   // Don't set header for unknown origins
   ```

2. **Secrets in .env.local with weak JWT secret** → `.env.local` → Rotate JWT_SECRET to 32+ random chars
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Admin password in plaintext** → `.env.local:19` → Hash with bcrypt, compare hash in admin.js

### 🟠 HIGH PRIORITY (Fix within 24 hours):

1. **Error messages leaked to clients** → api/history.js:79, api/admin.js:151, api/payments/portal.js:65, api/payments/create-checkout.js:93, api/health.js:40, api/chat.js:803
   - Replace `err.message` with generic strings: `"Internal server error"`, `"Database error"`, etc.

2. **Token stored in sessionStorage (XSS vulnerable)** → web/auth.js:12,29
   - Move to HttpOnly cookie OR add CSP headers to prevent inline script injection

3. **OTP comparison not timing-safe** → api/auth/verify-otp.js:74
   ```javascript
   // BEFORE:
   if (otpRows[0].code !== code.trim())
   
   // AFTER:
   import crypto from 'crypto';
   const stored = Buffer.from(otpRows[0].code);
   const provided = Buffer.from(code.trim());
   if (!crypto.timingSafeEqual(stored, provided))
   ```

4. **`ws` dependency unnecessary** → package.json → Remove `ws` and all `neonConfig.webSocketConstructor` lines

### 🟡 MEDIUM PRIORITY (Fix this week):

1. **Rate limiting only on chat + send-otp** → No rate limit on verify-otp brute force from different IPs
   - Add IP-based rate limit: max 10 verify attempts per IP per hour

2. **CORS logic duplicated across 11 files** → Extract to shared utility
   - Create `api/_lib/cors.js` with shared `setCors()` and `ALLOWED_ORIGINS`

3. **TIER_LIMITS defined in 2 places** → api/chat.js and api/auth/me.js
   - Create shared `api/_lib/tiers.js`

4. **No input validation on history DELETE** → api/history.js:44-51
   - Verify session belongs to user before delete

5. **admin.js error leakage** → api/admin.js:151
   ```javascript
   // BEFORE:
   return res.status(500).json({ error: err.message });
   // AFTER:
   return res.status(500).json({ error: 'Failed to load dashboard data' });
   ```

6. **health.js DB error leakage** → api/health.js:40
   ```javascript
   // BEFORE:
   checks.db_error = err.message;
   // AFTER:
   checks.db_error = 'Connection failed';
   ```

### 🟢 LOW PRIORITY (Nice to have):

1. **Add TypeScript** — Convert API routes to `.ts` for type safety
2. **Add Zod validation** — Schema validation for all API inputs
3. **Add ESLint** — Code quality enforcement
4. **Add tests** — Unit tests for calculators, API integration tests
5. **Add CSP headers** — Content-Security-Policy in vercel.json
6. **Update @neondatabase/serverless** — 1.1.0 → latest
7. **Remove dead `safeHtml()` function** — Or wire it into render path
8. **Add HTTPS-only flag** — Ensure cookies use Secure attribute
9. **Add security.txt** — `/.well-known/security.txt` for vulnerability reports

### 📋 MIGRATION CHECKLIST:

- [ ] Fix CORS vulnerability in all 11 API files
- [ ] Rotate JWT_SECRET to cryptographically strong value
- [ ] Hash admin password with bcrypt
- [ ] Replace all `err.message` in 500 responses with generic messages
- [ ] Move session token to HttpOnly cookie
- [ ] Use timing-safe comparison for OTP
- [ ] Remove `ws` dependency and neonConfig lines
- [ ] Extract shared CORS/tier utilities
- [ ] Add IP rate limiting to verify-otp

### 💡 QUICK WINS (30 min fixes that improve quality):

1. **Fix CORS** — Remove the `else if (origin)` fallback in all files (5 min)
2. **Rotate JWT_SECRET** — Generate new secret + update Vercel env (2 min)
3. **Remove error message leakage** — Replace 6 instances of `err.message` (10 min)
4. **Remove `ws` dependency** — `npm uninstall ws` + remove 5 neonConfig lines (5 min)
5. **Add CSP header** — Add to vercel.json headers section (5 min)

### ⚠️ SHARIAH COMPLIANCE NOTES:

- All calculators use correct Islamic finance formulas ✅
- Murabaha: Profit fixed at contract time ✅
- Diminishing Musharakah: Rental decreases as ownership increases ✅
- Zakat: Silver nisab used (appropriate for Pakistan) ✅
- Shariah compliance checker covers Riba, Gharar, Maysir, Haram industries ✅
- Disclaimer present in system prompt ✅
- No compounding interest in any calculation ✅

### 🔧 RECOMMENDED NEXT SPRINT:

**Priority 1:** Fix CORS vulnerability (security)
**Priority 2:** Fix error message leakage + JWT secret rotation (security)
**Priority 3:** Move token to HttpOnly cookie (security)
**Priority 4:** Extract shared utilities (code quality)
**Priority 5:** Add TypeScript + validation (code quality)

---

*Report generated: 2026-07-03 | Auditor: Senior Full-Stack Security & Architecture Auditor*
*This is an educational audit — consult qualified security professionals for penetration testing.*
