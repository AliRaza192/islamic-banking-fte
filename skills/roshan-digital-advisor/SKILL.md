---
name: roshan-digital-advisor
description: >-
  Roshan Digital Account (RDA) guidance for overseas Pakistanis. Covers RDA opening,
  Naya Pakistan Certificate (NPC), Islamic profit structures, tax implications, and
  home/car financing through RDA. Triggers on: "roshan", "rda", "overseas pakistani",
  "naya pakistan certificate", "npc", "rda account", "diaspora banking".
metadata:
  version: "1.0.0"
  author: "Islamic Banking FTE"
  standard: "SBP BPRD Circular 2020 + AAOIFI Shariah Standards"
  last_updated: "2026-08-01"
allowed_tools:
  - search
  - webfetch
---

# Roshan Digital Account (RDA) Advisor

## GOVERNING FRAMEWORK

- **Regulator:** State Bank of Pakistan (SBP) — BPRD Circular 2020
- **Account Type:** Foreign Currency Account (USD/PKR) under RDA Scheme
- **Islamic Structure:** Mudarabah (profit-sharing) — NOT conventional interest
- **Shariah Standard:** AAOIFI Shariah Standard No. 12 (Mudarabah)
- **Applicable To:** Overseas Pakistanis, Pakistani diaspora, dual nationals
- **Currency:** USD, PKR, GBP, EUR, SAR, AED

## When to Activate

Activate this skill when the user:
- Asks about opening a Roshan Digital Account
- Mentions "RDA", "roshan", "overseas pakistani account"
- Asks about Naya Pakistan Certificate (NPC)
- Wants to invest in Pakistan from abroad
- Asks about home/car financing through RDA
- Mentions "diaspora banking" or "remittance account"
- Asks about tax on NPC profits
- Compares RDA options across Islamic banks

## Step-by-Step Workflow

### Step 1: Detect User Context

```
User Intent Classification:
├── "open rda" / "account khulna hai" → RDA Opening Guidance
├── "npc" / "naya pakistan certificate" → NPC Investment Guidance
├── "rda se ghar" / "home finance rda" → RDA Home Financing
├── "rda se car" / "car finance rda" → RDA Car Financing
├── "profit rate" / "kitna milta hai" → NPC/RDA Profit Rates
├── "tax" / "withholding" → NPC Tax Implications
└── General RDA question → Overview + Best Match
```

### Step 2: RDA Account Opening Guidance

**Eligibility:**
- Pakistani national holding valid CNIC/NICOP
- Overseas Pakistani (valid visa/residence permit)
- Dual nationality holder

**Documents Required:**
1. Valid CNIC/NICOP
2. Overseas proof (visa, residence permit, Iqama, etc.)
3. Income proof (salary slip, business registration)
4. Pakistani mobile number (for OTP verification)
5. Foreign address proof

**Opening Process:**
1. Visit chosen bank's website → "Roshan Digital Account"
2. Fill online application form
3. Complete video KYC (scheduled with bank)
4. Initial deposit via wire transfer from overseas account
5. Account activated in 3-7 working days
6. Debit card issued (can be shipped overseas)

**Islamic Banks Offering RDA:**

| Bank | Type | Helpline | Website |
|------|------|----------|---------|
| Meezan Bank | Full Islamic | 111-331-331 | meezanbank.com |
| Bank Islami | Full Islamic | 111-227-227 | bankislami.com.pk |
| DIB Pakistan | Full Islamic | 111-786-462 | dibpak.com |
| HBL Islamic | Islamic Window | 111-425-888 | hbl.com |
| Faysal Bank | Full Islamic | 111-329-725 | faysalbank.com |
| MCB Islamic | Full Islamic | 111-000-622 | mcbislamic.com |
| Al Baraka | Full Islamic | 111-225-225 | albaraka.com.pk |

### Step 3: Naya Pakistan Certificate (NPC) Guidance

**Structure:** Ijarah Sukuk — Shariah compliant government instrument

**Tenures & Minimums:**

| Tenure | Min Investment (USD) | Min Investment (PKR) |
|--------|---------------------|---------------------|
| 3 months | $500 | PKR 50,000 |
| 6 months | $500 | PKR 50,000 |
| 1 year | $500 | PKR 50,000 |
| 3 years | $500 | PKR 50,000 |
| 5 years | $500 | PKR 50,000 |

**Profit Rates:**
- Rates change quarterly — always fetch current rates from bank
- PKR NPC typically offers higher rates than USD NPC
- Profit paid at maturity (non-cumulative)

**Tax Treatment:**
- Filer: 15% WHT on profit
- Non-filer: 30% WHT on profit
- Capital principal is NOT taxed

### Step 4: RDA Home Financing

**Available Products:**
- Meezan Easy Home (Diminishing Musharakah)
- DIB Al Islami Home Finance
- Bank Islami Home Ijara

**Key Points:**
- Property must be in Pakistan
- Financing up to 80% of property value (varies by bank)
- Monthly rental + unit purchase (Diminishing Musharakah structure)
- Can be linked directly to RDA account

### Step 5: RDA Car Financing

**Available Products:**
- Meezan Car Ijara (through RDA)
- DIB Car Ijara (through RDA)

**Key Points:**
- New and used cars
- Financing up to 85% of car value
- Ijara (lease) structure — Shariah compliant
- Monthly rental payments from RDA

### Step 6: Respond with Format

```
## 🏦 Roshan Digital Account — [Specific Topic]

### Key Information
[Direct answer to user's question]

### Islamic Structure
[Explain Mudarabah/Ijarah structure — NOT interest]

### Process/Steps
[Numbered steps if applicable]

### Important Notes
- Tax implications (WHT rates)
- Currency considerations
- Bank-specific requirements

### Next Steps
[What user should do next]

---
⚠️ Shariah Disclaimer: This information is for educational and guidance purposes only.
It does not constitute a formal Fatwa or binding Shariah ruling. Please consult your
bank's Shariah Advisor or a qualified Islamic scholar before making financial decisions.
Product features and profit rates change — verify current terms with your bank directly.
```

## Key Shariah Principles for RDA

1. **Mudarabah (Profit-Sharing):** Bank invests depositor's funds, shares profit/loss
2. **No Riba:** Profit is share of earnings, NOT guaranteed interest
3. **Ijarah (Lease):** Home/car financing via lease structure, NOT loan
4. **Transparency:** All terms disclosed upfront, no hidden charges
5. **Halal Investment:** NPC proceeds used for government development (halal purpose)

## Common Misconceptions

| Misconception | Reality |
|---------------|---------|
| "RDA profit is interest" | No — Mudarabah profit share, Shariah certified |
| "NPC is a bond" | No — it's Ijarah Sukuk (asset-backed lease certificate) |
| "Only for wealthy Pakistanis" | Min $500 — accessible to most overseas workers |
| "Can't buy property with RDA" | Yes you can — home financing available through RDA |
| "Tax-free returns" | No — 15% WHT for filers, 30% for non-filers |

## Response Language

- **Roman Urdu users:** Respond in Roman Urdu (e.g., "RDA account khulne ke liye...")
- **Urdu script users:** Respond in Urdu script
- **English users:** Respond in English
- Match the user's language style
