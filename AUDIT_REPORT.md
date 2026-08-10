# Islamic Banking FTE — Comprehensive Security & Architecture Audit Report

**Date:** August 4, 2026  
**Auditor:** OpenCode CLI (Nemotron 3 Ultra)  
**Scope:** Full codebase audit across 6 phases

---

## Executive Summary

| Phase | Area | Critical | High | Medium | Low | Status |
|-------|------|----------|------|--------|-----|--------|
| 1 | Security & Secrets | 0 | 2 | 3 | 2 | ✅ Complete |
| 2 | Architecture & Logic Bugs | 1 | 3 | 2 | 1 | ✅ Complete |
| 3 | Financial Calculation Accuracy | 0 | 1 | 2 | 1 | ✅ Complete |
| 4 | Dead Code & Cleanup | 0 | 0 | 4 | 2 | ✅ Complete |
| 5 | Skill Routing Logic | 0 | 2 | 3 | 1 | ✅ Complete |
| 6 | Config & Deployment | 0 | 1 | 2 | 2 | ✅ Complete |
| **Total** | | **1** | **9** | **16** | **9** | |

---

## PHASE 1 — Security & Secrets Audit

### 🔴 HIGH Severity Issues

| # | File & Line | Issue | Fix Suggestion |
|---|-------------|-------|----------------|
| 1 | `api/lib/pii-encryption.js:17-21` | **Fallback key derivation from JWT_SECRET** — If `PII_ENCRYPTION_KEY` not set, derives key from `JWT_SECRET` using SHA-256. This creates key reuse across auth and encryption, weakening both. | Remove fallback; require `PII_ENCRYPTION_KEY` env var. Fail fast at startup if missing. |
| 2 | `api/chat.js:764-777` | **Global state for alert deduplication** — Uses `globalThis._alertSent` to track webhook alerts. In serverless, global state leaks across invocations and is unreliable. | Use database table or Redis for alert deduplication; or accept duplicate alerts (cheaper than state bugs). |

### 🟡 MEDIUM Severity Issues

| # | File & Line | Issue | Fix Suggestion |
|---|-------------|-------|----------------|
| 3 | `api/auth/send-otp.js:6-8, 25-30` | **In-memory IP rate limiting** — Uses `globalThis.__otpIpLimits` Map. Lost on cold start; doesn't work across multiple instances. | Move to database (`rate_limits` table) or use Vercel Edge Config. |
| 4 | `api/auth/me.js:52-55` | **In-memory rate limiting for /me endpoint** — Same issue as above with `globalThis._meRateLimit`. | Move to database or remove (JWT validation already rate-limits via auth). |
| 5 | `api/admin.js:32-47` | **Admin rate limiting in global memory** — `globalThis._adminAttempts` not shared across instances. | Use database table for admin auth attempts. |

### 🟢 LOW Severity Issues

| # | File & Line | Issue | Fix Suggestion |
|---|-------------|-------|----------------|
| 6 | `vercel.json:12` | **CSP allows `unsafe-inline` for styles** — `style-src 'self' 'unsafe-inline'` weakens CSP. | Move inline styles to CSS files or use nonce-based CSP. |
| 7 | `api/data.js:99-116` | **Gold API key check uses string comparison** — `GOLD_API_KEY !== 'goldapi.io'` suggests placeholder value may be used. | Use boolean check: `if (GOLD_API_KEY && !GOLD_API_KEY.includes('placeholder'))`. |

### ✅ PASSED Checks

- No hardcoded secrets in source code (all via `process.env`)
- `.env.local` properly in `.gitignore` (not committed)
- No `NEXT_PUBLIC_` prefix misuse (no client-side env exposure)
- Stripe webhook signature verification implemented (`stripe.webhooks.constructEvent`)
- All SQL queries use parameterized tagged templates (no injection risk)
- CORS origins explicitly allowlisted (no wildcard reflection)
- JWT tokens stored in HttpOnly Secure cookies
- PII detection in chat input (logs warning, doesn't block)

---

## PHASE 2 — Architecture & Logic Bugs Audit

### 🔴 CRITICAL Severity Issues

| # | File & Line | Issue | Known Before? |
|---|-------------|-------|---------------|
| 1 | `api/chat.js:995-1006` | **Variables used before declaration (Temporal Dead Zone)** — `sessionHistoryBlock` and `userProfileBlock` referenced at line 995 but declared at lines 1014 and 1039. This will crash the handler. | ❌ Not previously caught — will cause runtime `ReferenceError` |

### 🟡 HIGH Severity Issues

| # | File & Line | Issue | Known Before? |
|---|-------------|-------|---------------|
| 2 | `api/lib/audit-logger.js:1,5` | **Neon driver misuse — uses `neonConfig` with `ws`** — Imports `neonConfig` and `ws` for WebSocket, but this is dead code (never imported). In serverless, WebSocket connections don't persist. | ✅ Known — audit-logger is dead code |
| 3 | `api/chat.js:696` | **Neon driver usage** — Uses `neon(DATABASE_URL)` correctly (serverless driver), not `Pool`. | ✅ Fixed in recent commits (50832ee) |
| 4 | `api/chat.js:1119` | **25-second Gemini timeout** — Vercel Hobby plan has 10s limit for serverless functions. 25s will cause function timeout before Gemini responds. | ❌ Not caught — must reduce to <10s or use async pattern |
| 5 | `api/chat.js:777` | **`setTimeout` in serverless function** — `setTimeout(() => { delete globalThis._alertSent?.[tier]; }, 3600000)` — Timer won't fire reliably in serverless (function frozen after response). | ❌ Not caught — use database TTL or accept leak |

### 🟡 MEDIUM Severity Issues

| # | File & Line | Issue | Known Before? |
|---|-------------|-------|---------------|
| 6 | `api/chat.js:1106-1121` | **No retry/backoff for Gemini calls** — Single attempt; transient network errors cause 503. | Add exponential backoff (max 2 retries) |
| 7 | `api/data.js:98-136` | **Rates endpoint lacks timeout on external API calls** — `fetch('https://open.er-api.com/v6/latest/USD')` and gold API have no `AbortSignal.timeout`. Can hang indefinitely. | Add `signal: AbortSignal.timeout(5000)` |

### 🟢 LOW Severity Issues

| # | File & Line | Issue | Fix Suggestion |
|---|-------------|-------|----------------|
| 8 | `api/chat.js:1305-1317` | **Generic catch-all error handler** — Returns 500 with generic message; logs full error server-side (good) but no structured error codes for debugging. | Add error codes (e.g., `ERR_GEMINI_TIMEOUT`, `ERR_DB_CONNECTION`) |

---

## PHASE 3 — Financial Calculation Accuracy Audit

### 🟡 HIGH Severity Issues

| # | File & Function | Issue | Fix Suggestion |
|---|-----------------|-------|----------------|
| 1 | `api/calculate.js:17-19` | **Hardcoded fallback Nisab values** — `goldNisab = 1870000`, `silverNisab = 171360` used when `liveNisab` not provided. These are stale (May 2026 estimates). | Make `liveNisab` mandatory; fail calculation if not available. Or fetch from `/api/rates` inside function. |

### 🟡 MEDIUM Severity Issues

| # | File & Function | Issue | Fix Suggestion |
|---|-----------------|-------|----------------|
| 2 | `api/calculate.js:47, 130, 263, 322` | **`Math.round(x * 100) / 100` for 2-decimal rounding** — Floating-point precision issues possible (e.g., `Math.round(1.005 * 100) / 100 = 1` not `1.01`). | Use `Math.round(x * 100) / 100` is acceptable for display, but for financial ledger use integer paisa (multiply all by 100). |
| 3 | `web/js/calculators.js:145-166` | **Frontend Zakat calculator uses hardcoded fallback rates** — `goldRatePerTola = 330000`, `silverRatePerTola = 2450` if `window._liveRates` not loaded. | Block calculation until live rates loaded; show loading state. |

### 🟢 LOW Severity Issues

| # | File & Function | Issue | Fix Suggestion |
|---|-----------------|-------|----------------|
| 4 | `api/calculate.js:469-524` | **`buildCalculationBlock` only handles Zakat and Murabaha** — No pre-computed blocks for Ijara, Diminishing Musharakah, Sukuk. | Extend to cover all calculator types for consistency. |

### ✅ POSITIVE Findings

- All calculations are **deterministic pure functions** (same input = same output)
- No LLM involvement in actual math — calculations done in code, results injected into prompt
- Transparent step-by-step output with formulas, inputs, results, warnings, sources
- PKR formatting uses proper lakh/crores notation
- Silver nisab used as default (more conservative, benefits poor)

---

## PHASE 4 — Dead Code & Cleanup Audit

### 🟡 MEDIUM Severity Issues

| # | File | Issue | Safe to Remove? |
|---|------|-------|-----------------|
| 1 | `api/lib/pii-encryption.js` | **Never imported/used anywhere** — Defines `encrypt`, `decrypt`, `detectPII`, `sanitizeForLog` but zero imports in codebase. | ✅ Yes — delete file |
| 2 | `api/lib/audit-logger.js` | **Never imported/used** — `AuditLogger` class defined but zero imports. Also uses deprecated `neonConfig` + `ws`. | ✅ Yes — delete file |
| 3 | `server.py` | **Local dev server duplicate of Vercel functions** — Mirrors `api/chat.js` logic in Python. Not used in production. | ✅ Yes — delete (use `vercel dev` instead) |
| 4 | `sql/cleanup-pii.sql` | **References PII encryption tables that don't exist** — Schema has no encrypted PII columns; this migration is orphaned. | ✅ Yes — delete file |

### 🟢 LOW Severity Issues

| # | File | Issue | Fix Suggestion |
|---|------|-------|----------------|
| 5 | `web/js/calculators.js` vs `api/calculate.js` | **Duplicate calculation logic** — Both implement Murabaha, Ijara, Diminishing Musharakah, Zakat, Sukuk. Frontend uses `web/js/calculators.js`, backend uses `api/calculate.js`. | Consolidate to single source of truth (e.g., shared package or generate frontend from backend). |
| 6 | `package.json` | **Unused dependency: `resend`** — Imported in `api/auth/send-otp.js` and `api/payments.js` but only via `fetch()` to Resend API, not SDK. | Remove `resend` from dependencies; use native `fetch`. |

---

## PHASE 5 — Skill Routing Logic Audit

### 🟡 HIGH Severity Issues

| # | Issue | Evidence | Fix Approach |
|---|-------|----------|--------------|
| 1 | **Pure keyword matching — no semantic understanding** | `detectSkills()` uses 150+ `msg.includes()` checks. Fails on: synonyms ("vehicle financing" ≠ "car loan"), typos ("murabha"), Roman Urdu variations ("murabaha kaise kaam karta hai"), mixed language. | Migrate to embedding-based routing: compute query embedding, match against skill centroids. Or use Gemini to classify intent (1 extra call, ~200ms). |
| 2 | **Skill ordering dependency — fragile priority** | Skills checked in fixed order (lines 27-236). "Musharakah" (line 144) catches BEFORE "Full musharakah" (line 133) — but full musharakah is MORE specific. Relies on manual ordering. | Use specificity scoring: count matched keywords per skill, pick highest. Or invert order (most specific first). |

### 🟡 MEDIUM Severity Issues

| # | Issue | Evidence | Fix Approach |
|---|-------|----------|--------------|
| 3 | **False positive: "Jaiz Bank Nigeria" → `shariah-compliance-checker`** | "jaiz" in query triggers compliance checker (line 168) instead of Nigeria jurisdiction + banking navigator. | Add bank name allowlist check BEFORE keyword matching. |
| 4 | **No fallback for ambiguous queries** | "Compare home financing options" matches both `halal-calculator` and `pakistan-banking-navigator` — returns both, no disambiguation. | Add confidence scoring; if top skill < threshold, ask clarifying question. |
| 5 | **Jurisdiction detection overlaps with skill detection** | "Pakistan" triggers `pakistan-banking-navigator` skill (line 196) AND sets jurisdiction to Pakistan. Coupled logic. | Separate concerns: jurisdiction detector independent of skill detector. |

### 🟢 LOW Severity Issues

| # | Issue | Fix Suggestion |
|---|-------|----------------|
| 6 | **Arabic/Urdu script support limited** | Only exact Unicode matches; no normalization (e.g., different hamza forms). | Use Unicode normalization (NFC) before matching. |

### 💡 Migration Approach (Semantic Routing)

```
1. Pre-compute embeddings for each skill's canonical queries (offline)
2. At runtime: embed user query (text-embedding-004, ~50ms)
3. Cosine similarity against skill centroids
4. Top-k skills with threshold > 0.75
5. Fallback to keyword matching if embedding fails
```

**Estimated effort:** 2-3 days. Adds ~100ms latency per request.

---

## PHASE 6 — Config & Deployment Audit

### 🟡 HIGH Severity Issues

| # | File & Line | Issue | Fix Suggestion |
|---|-------------|-------|----------------|
| 1 | `api/chat.js:1119` | **Gemini timeout (25s) exceeds Vercel Hobby limit (10s)** — Function will timeout before Gemini responds. | Reduce to `AbortSignal.timeout(8000)`; implement streaming or async pattern with polling. |

### 🟡 MEDIUM Severity Issues

| # | File & Line | Issue | Fix Suggestion |
|---|-------------|-------|----------------|
| 2 | `vercel.json:12` | **CSP allows `cdnjs.cloudflare.com` for scripts** — External CDN dependency; if compromised, XSS risk. | Self-host Chart.js/libraries or use Subresource Integrity (SRI) hashes. |
| 3 | `schema.sql` | **No migration versioning** — Single `schema.sql` with `CREATE TABLE IF NOT EXISTS`. No way to track applied migrations or rollback. | Add migration system (e.g., `migrations/001_init.sql`, `002_add_indexes.sql`) with version table. |

### 🟢 LOW Severity Issues

| # | File & Line | Issue | Fix Suggestion |
|---|-------------|-------|----------------|
| 4 | `.github/workflows/evals.yml:123-128` | **CORS check grep pattern may false-positive** — `grep -r "else if (origin)"` could match comments. | Use more specific pattern: `grep -r "Access-Control-Allow-Origin.*origin"`. |
| 5 | `package.json:7` | **No test script** — `"test": "echo \"Error: no test specified\" && exit 1"` | Add `npm test` running `python3 evals/run-evals.py` and `python3 scripts/validate-routing.py`. |

### ✅ POSITIVE Findings

- `.env.example` exists with all required variables documented
- Vercel rewrites correctly map `/api/*` to merged function files (6 API files → within 100 function limit)
- Security headers present (X-Content-Type-Options, X-Frame-Options, CSP)
- CI/CD pipeline validates structure, skills, jurisdiction overlays, guardrails, security baseline
- Database schema has proper indexes for query patterns
- Rate limiting implemented at multiple levels (IP, user, tier)

---

## Cross-Phase Critical Path Issues (Fix First)

| Priority | Issue | Phase | Files to Fix |
|----------|-------|-------|--------------|
| **P0** | Temporal Dead Zone crash — `sessionHistoryBlock`/`userProfileBlock` used before declaration | 2 | `api/chat.js:995, 1014, 1039` |
| **P0** | Gemini timeout 25s > Vercel 10s limit | 2, 6 | `api/chat.js:1119` |
| **P1** | PII encryption fallback key reuse | 1 | `api/lib/pii-encryption.js:17-21` (or delete file) |
| **P1** | In-memory rate limiting lost in serverless | 1, 2 | `api/auth/send-otp.js`, `api/auth/me.js`, `api/admin.js` |
| **P1** | Hardcoded stale Nisab fallbacks | 3 | `api/calculate.js:17-19` |
| **P2** | Dead code removal (pii-encryption, audit-logger, server.py, cleanup-pii.sql) | 4 | Delete 4 files |
| **P2** | Consolidate duplicate calculator logic | 4 | `api/calculate.js` + `web/js/calculators.js` |
| **P3** | Migrate to semantic skill routing | 5 | `api/chat.js:22-239`, `scripts/validate-routing.py` |
| **P3** | Add migration versioning for schema | 6 | New `migrations/` folder + version table |

---

## Verification Commands

```bash
# Run structure validation (CI gate)
python3 evals/run-evals.py

# Run routing validation
python3 scripts/validate-routing.py

# Check for dead code imports
grep -r "pii-encryption\|audit-logger" api/ --include="*.js"

# Verify no hardcoded secrets
grep -r "sk_\|AIza\|re_\|whsec_" --include="*.js" .

# Test local dev
vercel dev
```

---

## Appendix: Skill & Jurisdiction Coverage

| Skill | File | Status |
|-------|------|--------|
| islamic-finance-router | skills/islamic-finance-router/SKILL.md | ✅ |
| murabaha-specialist | skills/murabaha-specialist/SKILL.md | ✅ |
| ijara-specialist | skills/ijara-specialist/SKILL.md | ✅ |
| salam-specialist | skills/salam-specialist/SKILL.md | ✅ |
| istisna-a-specialist | skills/istisna-a-specialist/SKILL.md | ✅ |
| sukuk-issuer | skills/sukuk-issuer/SKILL.md | ✅ |
| sukuk-investor | skills/sukuk-investor/SKILL.md | ✅ |
| takaful-ifrs17 | skills/takaful-ifrs17/SKILL.md | ✅ |
| musharaka-full | skills/musharaka-full/SKILL.md | ✅ |
| musharaka-dm | skills/musharaka-dm/SKILL.md | ✅ |
| musharakah-mudarabah-specialist | skills/musharakah-mudarabah-specialist/SKILL.md | ✅ |
| zakat-advisor | skills/zakat-advisor/SKILL.md | ✅ |
| shariah-compliance-checker | skills/shariah-compliance-checker/SKILL.md | ✅ |
| halal-calculator | skills/halal-calculator/SKILL.md | ✅ |
| islamic-product-explainer | skills/islamic-product-explainer/SKILL.md | ✅ |
| pakistan-banking-navigator | skills/pakistan-banking-navigator/SKILL.md | ✅ |
| islamic-banking-advisor | skills/islamic-banking-advisor/SKILL.md | ✅ |
| sukuk-takaful-specialist | skills/sukuk-takaful-specialist/SKILL.md | ✅ |
| roshan-digital-advisor | skills/roshan-digital-advisor/SKILL.md | ✅ |

| Jurisdiction Overlay | File | Status |
|---------------------|------|--------|
| pakistan-ifrs | skills/islamic-finance-router/references/jurisdictions/pakistan-ifrs.md | ✅ |
| uae-ifrs | skills/islamic-finance-router/references/jurisdictions/uae-ifrs.md | ✅ |
| saudi-ifrs | skills/islamic-finance-router/references/jurisdictions/saudi-ifrs.md | ✅ |
| malaysia-mfrs | skills/islamic-finance-router/references/jurisdictions/malaysia-mfrs.md | ✅ |
| bahrain-aaoifi | skills/islamic-finance-router/references/jurisdictions/bahrain-aaoifi.md | ✅ |
| kuwait-ifrs | skills/islamic-finance-router/references/jurisdictions/kuwait-ifrs.md | ✅ |
| qatar-aaoifi | skills/islamic-finance-router/references/jurisdictions/qatar-aaoifi.md | ✅ |
| oman-ifrs | skills/islamic-finance-router/references/jurisdictions/oman-ifrs.md | ✅ |
| turkey-tfrs | skills/islamic-finance-router/references/jurisdictions/turkey-tfrs.md | ✅ |
| nigeria-ifrs | skills/islamic-finance-router/references/jurisdictions/nigeria-ifrs.md | ✅ |
| indonesia-psak | skills/islamic-finance-router/references/jurisdictions/indonesia-psak.md | ✅ |
| uk-ifrs | skills/islamic-finance-router/references/jurisdictions/uk-ifrs.md | ✅ |
| gcc-crossborder | skills/islamic-finance-router/references/jurisdictions/gcc-crossborder.md | ✅ |

---

*Report generated by automated audit. Manual verification recommended for all Critical/High findings.*