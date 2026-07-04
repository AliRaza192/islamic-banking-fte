---
name: musharakah-mudarabah-specialist
description: >
  Expert in Musharakah partnership financing and Mudarabah profit-sharing per
  AAOIFI FAS 3/4. Covers Diminishing Musharakah home finance, Running Musharakah
  working capital, Mudarabah deposits and investments. Calculates monthly payments
  for Diminishing Musharakah. Triggers on: musharakah, مشاركة, mudarabah, مضاربة,
  partnership financing, profit sharing, shirkat, business partnership Islamic,
  joint venture halal, diminishing musharakah, running musharakah, SME finance
  Islamic, working capital Islamic, investment account profit, mudarabah savings.
metadata:
  version: "1.0"
  author: "Islamic Banking FTE"
  standard: "AAOIFI FAS 3 (Mudaraba), FAS 4 (Musharaka)"
allowed_tools: Read
version: 1.0.0
---

# Musharakah & Mudarabah Specialist Skill

## GOVERNING FRAMEWORK

Every Musharakah/Mudarabah response MUST begin with:
```
GOVERNING FRAMEWORK: AAOIFI FAS 3/4 — [Jurisdiction]
PRODUCT: [Musharakah / Mudarabah / Diminishing Musharakah]
JURISDICTION: [Country — Regulator]
```

## AAOIFI FAS 3/4 Reference

### Mudarabah (AAOIFI FAS 3)
- Investor (Rab-ul-Maal) provides capital
- Manager (Mudarib) provides expertise and effort
- Profit shared per agreed ratio
- Loss borne by investor only (unless Mudarib was negligent)
- Mudarabah deposits: bank is Mudarib, depositor is Rab-ul-Maal

### Musharakah (AAOIFI FAS 4)
- All partners contribute capital
- All partners share profit per agreed ratio
- Loss shared proportional to capital contribution
- Diminishing Musharakah: partner buys out shares over time
- Running Musharakah: revolving facility for working capital

### Recognition Rules

**Step 1 — Capital contribution:**
Dr: Musharakah/Mudarabah Investment [Amount]
Cr: Cash [Amount]

**Step 2 — Profit allocation (periodic):**
Dr: Musharakah/Mudarabah Receivable [Partner's share]
Cr: [Income account — label per jurisdiction]

**Step 3 — Loss allocation:**
Dr: Loss on Musharakah/Mudarabah [Amount]
Cr: Musharakah/Mudarabah Investment [Amount]

### Income Labels by Jurisdiction
- Pakistan: "Profit from Musharakah Financing"
- UAE: "Profit from Musharakah Financing"
- Saudi Arabia: "Profit from Musharakah Financing"
- Malaysia: "Musharakah Income"
- Bahrain: "Musharakah Income"
- NEVER: "Interest Income" or "Return on Investment"

## Mudarabah Deposit Explanation
```
Your Savings Account → YOU are investor (Rab-ul-Maal)
Bank invests → Bank is manager (Mudarib)
Profit shared → e.g., 70% to you, 30% to bank
Rate declared monthly based on actual bank earnings
No GUARANTEED rate — but consistently competitive
```

## When to Recommend Which Product
- Home financing → Diminishing Musharakah → use musharaka-dm skill ✅
- Business working capital → Running Musharakah ✅
- SME project financing → Musharakah ✅
- Savings/deposits → Mudarabah ✅
- Investment in startup → Mudarabah ✅

### DUAL-REGIME ACCOUNTING (AAOIFI vs IFRS)

**Mudarabah Deposits — The Most Significant Divergence:**

**AAOIFI FAS 3 Treatment:**
- IAH (Investment Account Holders) funds classified as "Equity of IAH"
- Shown SEPARATELY from shareholders' equity
- Not a liability — IAH share the risk
- Bank discloses profit-sharing ratio and weightage table

**IFRS 9 Treatment:**
- IAH funds classified as "Financial Liabilities" (IAS 32)
- Because bank has obligation to return funds (even though returns are variable)
- This significantly increases reported liabilities and affects capital ratios

**Impact:**
```
AAOIFI Balance Sheet:  Total Equity = Shareholders' Equity + IAH Equity
IFRS Balance Sheet:    Total Equity = Shareholders' Equity only
                       Total Liabilities includes IAH funds
This is the LARGEST structural difference between AAOIFI and IFRS for Islamic banks.
```

**Diminishing Musharakah:**
- AAOIFI: Income declines linearly with ownership share
- IFRS 9: Income front-loaded via EIR (same as Murabaha divergence)
- IFRS 9 SPPI test: PASSES (classified at amortised cost)

**Musharakah (Full Partnership):**
- AAOIFI: Profit per agreement, loss per capital ratio
- IFRS 11: Joint control test → Joint Venture (equity method) or Joint Operation
- IFRS 9 SPPI test: FAILS (returns depend on venture profit) → FVTPL

**Jurisdiction Selection:**
- Bahrain, Qatar → AAOIFI FAS 3/4 (IAH = Equity)
- Pakistan, UAE, Saudi, Kuwait, Oman → IFRS 9 (IAH = Financial Liability)
- Malaysia → MFRS (IFRS-equivalent)
