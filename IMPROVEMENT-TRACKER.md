# Islamic Banking FTE — Master Improvement Tracker
**Created:** 2026-05-30
**Last Updated:** 2026-05-30
**Repo:** https://github.com/AliRaza192/islamic-banking-fte
**Live:** https://islamic-banking-fte.vercel.app

---

## PROJECT INVENTORY — Har File Ka Status

### Core Files
| File | Lines | Status | Purpose |
|---|---|---|---|
| `api/chat.js` | 276 | WORKING | Gemini API + skill routing + Neon DB logging |
| `web/app.js` | 266 | WORKING | Frontend logic, conversation history, slash commands |
| `web/index.html` | 85 | WORKING | Chat UI structure |
| `web/style.css` | ~310 | PARTIAL | Styling, mobile broken at 640px |
| `server.py` | 127 | BROKEN | Local dev proxy — no system prompt |
| `CLAUDE.md` | 178 | WORKING | System prompt content |
| `schema.sql` | 34 | PARTIAL | DB schema, queries_log unused |
| `vercel.json` | 5 | WORKING | Deployment config |

### Skills (11 total — ALL WORKING)
| Skill | File Size | AAOIFI Std | Status |
|---|---|---|---|
| `murabaha-specialist/SKILL.md` | 5920B | FAS 2 | ✅ |
| `ijara-specialist/SKILL.md` | 4278B | FAS 8/32 | ✅ |
| `musharakah-mudarabah-specialist/SKILL.md` | 3914B | FAS 3/4 | ✅ |
| `sukuk-takaful-specialist/SKILL.md` | ~3KB | Std 17/26 | ✅ |
| `zakat-advisor/SKILL.md` | ~3KB | FAS 9 | ✅ |
| `shariah-compliance-checker/SKILL.md` | ~2.5KB | Shariah Std | ✅ |
| `halal-calculator/SKILL.md` | 2489B | FAS 2/3/4/8/9 | ✅ |
| `islamic-product-explainer/SKILL.md` | 2695B | General | ✅ |
| `pakistan-banking-navigator/SKILL.md` | ~2.5KB | SBP | ✅ |
| `islamic-banking-advisor/SKILL.md` | 2660B | General | ✅ |
| `islamic-finance-router/SKILL.md` | 4710B | Router | ✅ |

### Jurisdiction Overlays (6 total — ALL WORKING)
| File | Jurisdiction | Status |
|---|---|---|
| `skills/islamic-finance-router/references/jurisdictions/pakistan-ifrs.md` | Pakistan/SBP | ✅ |
| `skills/islamic-finance-router/references/jurisdictions/uae-ifrs.md` | UAE/CBUAE | ✅ |
| `skills/islamic-finance-router/references/jurisdictions/saudi-ifrs.md` | KSA/SAMA | ✅ |
| `skills/islamic-finance-router/references/jurisdictions/malaysia-mfrs.md` | Malaysia/BNM | ✅ |
| `skills/islamic-finance-router/references/jurisdictions/bahrain-aaoifi.md` | Bahrain/CBB | ✅ |
| `skills/islamic-finance-router/references/jurisdictions/kuwait-ifrs.md` | Kuwait/CBK | ✅ |

### References (6 total — ALL WORKING)
| File | Size | Content |
|---|---|---|
| `references/products.md` | 11,349B | All Islamic banking products |
| `references/faqs.md` | 10,055B | Bilingual FAQ |
| `references/shariah-rules.md` | 8,989B | Riba/Gharar/Maysir rules |
| `references/calculations.md` | 8,631B | All calculation formulas |
| `references/pakistan-banks.md` | 7,068B | Pakistani banks data |
| `references/nisab-table.md` | 6,416B | Gold/Silver Nisab values |

### Other Files
| File | Status | Notes |
|---|---|---|
| `.env.local` | EXISTS | Has real keys — security risk if pushed |
| `.env.example` | EXISTS | Template |
| `.gitignore` | WORKING | .env.local excluded |
| `hooks/hooks.json` | WORKING | SessionStart + PostToolUse hooks |
| `scripts/validate-routing.py` | WORKING (drift risk) | 33 test cases, simplified copy of JS |
| `marketplace.json` | EXISTS | Plugin metadata |
| `CHANGELOG.md` | EXISTS | Version history |
| `.claude-plugin/plugin.json` | EXISTS | Plugin config |

---

## WHAT IS ACTUALLY WORKING (Confirmed by Code Audit)

1. **CLAUDE.md injection** — `api/chat.js:108` reads CLAUDE.md, `api/chat.js:249` sends as `system_instruction` to Gemini ✅
2. **Conversation history** — `web/app.js:31` maintains array, `web/app.js:150` sends full `contents` array ✅
3. **Skill routing** — `api/chat.js:18-75` `detectSkill()` matches 10 skills with Urdu/English/Arabic keywords ✅
4. **Jurisdiction detection** — `api/chat.js:78-103` `detectJurisdiction()` detects 6 jurisdictions, Pakistan default ✅
5. **System prompt composition** — `api/chat.js:106-171` `buildSystemPrompt()` combines CLAUDE.md + router + jurisdiction + skill + references ✅
6. **Neon DB logging** — `api/chat.js:231-268` saves sessions + messages (user + model) ✅
7. **Slash commands** — `web/app.js:11-28` 4 commands defined, `parseCommand()` at line 91 ✅
8. **Typing indicator** — CSS lines 231-248 + JS `showTyping()`/`removeTyping()` ✅
9. **Quick command buttons** — `web/app.js:67-72` wired via `data-cmd` attributes ✅
10. **Input validation** — `api/chat.js:177-194` validates structure + length ✅
11. **CORS** — `api/chat.js` handler has CORS headers ✅

## WHAT IS BROKEN / INCOMPLETE

### CRITICAL (Fix First)
| # | Issue | File:Line | Problem | Fix Needed |
|---|---|---|---|---|
| C1 | server.py no system prompt | `server.py:48-67` | Dumb proxy — sends raw contents to Gemini without CLAUDE.md + skills + references. Local dev produces generic responses. | Port `buildSystemPrompt()` logic from api/chat.js to server.py |
| C2 | Mobile layout broken | `web/style.css:306-309` | Sidebar `display:none` at 640px, no hamburger menu. Quick commands completely inaccessible on mobile. 80% Pakistani users are mobile. | Add hamburger toggle + mobile bottom bar |
| C3 | queries_log dead code | `api/chat.js` | `queries_log` table in schema.sql but NEVER written to. `skill_used` column exists but no INSERT. | Add INSERT after skill detection |

### IMPORTANT (Fix Next)
| # | Issue | File | Problem | Fix Needed |
|---|---|---|---|---|
| I1 | No rate limiting | `api/chat.js` | Anyone can exhaust 1500/day Gemini quota. No IP-based throttling. | Add rate_limits table + IP check |
| I2 | validate-routing.py drift | `scripts/validate-routing.py` | Python routing is simplified copy of JS — fewer keywords, will drift out of sync | Single source of truth or auto-generate |
| I3 | Neon DB schema mismatch | Neon dashboard | `session_id` — schema.sql says TEXT, actual DB might be INT64 (caused earlier error) | Confirm + fix on Neon |
| I4 | Duplicate favicon | `web/index.html:6,8` | Two identical favicon link tags | Remove duplicate |
| I5 | session_id not UUID | `web/app.js:8` | `Date.now()` not collision-resistant | Use `crypto.randomUUID()` or similar |

### POLISH (Week 3-4)
| # | Issue | File | Fix Needed |
|---|---|---|---|
| P1 | No structured calc output | `web/app.js`, `web/style.css` | Render calculations as formatted cards |
| P2 | No "Best Bank?" guided flow | `web/index.html` | 4-step form before AI call |
| P3 | No eval runner | `scripts/` | Create run-evals.js |
| P4 | No custom domain | Vercel | Buy islamicbanking.pk or similar |
| P5 | README needs update | `README.md` | Add demo GIF + feature list for Fiverr/Upwork |

---

## WHAT CHANGES HAVE BEEN MADE (Git Log)

```
64b076d feat: AgentFactory alignment + fix Gemini API session_id error
5ae9413 fix: clean keys + database integration
1175fce feat: Neon database integration — conversations saving
3b615af chore: trigger redeploy for DATABASE_URL
a76d632 Three Phases complete
```

### Changes in latest unpushed commit (64b076d):
- server.py: strip session_id before Gemini call
- web/app.js: numeric session_id (Date.now)
- All SKILL.md files: AgentFactory format
- Added islamic-finance-router skill + 6 jurisdictions
- Added hooks/hooks.json, CHANGELOG.md, plugin.json
- Updated CLAUDE.md, .gitignore, marketplace.json

---

## IMPROVEMENT PLAN — Phase by Phase

### PHASE 1: Critical Fixes (Aaj — ~3 hours)
- [ ] **C1:** Fix server.py — add system prompt building (port from api/chat.js)
- [ ] **C2:** Fix mobile — add hamburger menu + mobile bottom command bar
- [ ] **C3:** Wire queries_log — INSERT into queries_log after skill detection

### PHASE 2: Important Fixes (Kal — ~2 hours)
- [ ] **I1:** Add rate limiting — rate_limits table + IP check (30 req/day)
- [ ] **I2:** Sync validate-routing.py with JS router
- [ ] **I3:** Confirm Neon DB schema (TEXT vs INT64 for session_id)
- [ ] **I4:** Remove duplicate favicon
- [ ] **I5:** session_id use crypto.randomUUID()

### PHASE 3: Polish (Weekend — ~4 hours)
- [ ] **P1:** Structured calculation output (card format)
- [ ] **P2:** "Best Bank?" guided 4-step flow
- [ ] **P3:** Eval runner script
- [ ] **P4:** Custom domain setup
- [ ] **P5:** README with demo GIF

---

## CONFLICT PREVENTION RULES

1. **api/chat.js** — Isko sirf backend changes ke liye touch karo. Frontend logic yahan mat daalo.
2. **web/app.js** — Sirf frontend logic. API calls yahan se hoti hain lekin system prompt server pe banta hai.
3. **server.py** — Sirf local dev ke liye. Production Vercel pe api/chat.js use hota hai.
4. **CLAUDE.md** — System prompt content. Isko sirf tab change karo jab Islamic banking persona update karni ho.
5. **skills/** — Har skill independent hai. Ek skill change karne se doosri pe effect nahi hota.
6. **references/** — Data files. Inko sirf tab update karo jab factual data change ho (e.g., new Nisab values).
7. **schema.sql** — DB schema. Isko change karne se Neon pe bhi ALTER TABLE karna padega.

### Dependencies Map
```
web/app.js  ──POST──>  api/chat.js  ──reads──>  CLAUDE.md
                            │                     skills/*.md
                            │                     references/*.md
                            │                     schema (via Neon)
                            ▼
                      Gemini API  ──response──>  web/app.js

server.py   ──POST──>  Gemini API (DUMB PROXY — no system prompt)
                            │
                            ▼
                      web/app.js (same UI)
```

---

## NOTES
- Gemini free tier: 1500 requests/day — rate limiting zaroori hai
- 80% Pakistani users mobile pe hain — mobile fix priority hai
- Neon DB free tier: 512 MB, 100 connections — enough for demo
- Vercel free tier: 100GB bandwidth, serverless functions — enough for demo
