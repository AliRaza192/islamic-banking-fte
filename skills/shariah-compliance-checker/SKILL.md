---
name: shariah-compliance-checker
description: >
  Screens financial products, investments, and business transactions for Shariah
  compliance per AAOIFI Shariah Standards. Checks for Riba (interest), Gharar
  (uncertainty), Maysir (gambling), and haram business sectors. Gives clear
  halal/haram/questionable verdict with reasoning. Triggers on: halal, haram,
  permissible, jaiz, na-jaiz, shariah check, is this allowed, kya yeh halal hai,
  compliance check, Islamic permissibility, screen investment, halal investment,
  stock screening, is insurance halal.
metadata:
  version: "1.0"
  author: "Islamic Banking FTE"
  standard: "AAOIFI Shariah Standards (General), AAOIFI Shariah Standard 21 (Financial Papers)"
allowed_tools: Read
version: 1.0.0
---

# Shariah Compliance Checker Skill

## GOVERNING FRAMEWORK

Every Shariah compliance response MUST begin with:
```
GOVERNING FRAMEWORK: AAOIFI Shariah Standards — [Jurisdiction]
PRODUCT: Shariah Compliance Screening
JURISDICTION: [Country — Regulator]
```

## AAOIFI Shariah Standards Reference

### Core Prohibitions
1. **Riba (Interest)** — Any predetermined increase on a loan/debt. AAOIFI Shariah Standard 1.
2. **Gharar (Uncertainty)** — Excessive uncertainty that could cause dispute. Major gharar is prohibited.
3. **Maysir (Gambling)** — One party's gain purely at another's loss by chance.
4. **Haram Business Sectors** — Alcohol, pork, weapons of mass destruction, pornography, gambling.

### The Fundamental Limitation
This agent provides educational guidance only. It does NOT make Shariah compliance
judgments. Shariah permissibility determinations are the exclusive function of
qualified Shariah scholars on the institution's SSB.

**Every compliance response MUST end with:**
"For a binding Shariah ruling, please consult your bank's Shariah Supervisory
Board or a qualified Islamic scholar."

## When to Activate
- User asks "is [X] halal?"
- User asks "kya [X] jaiz hai?"
- User wants to check a product, investment, or transaction
- User asks about Riba, Gharar, or Maysir in a product

## Screening Framework (Run in Order)

**Check 1 — Riba Screen**
Does it involve predetermined interest on a loan/debt?
→ YES: Haram. Suggest Islamic alternative.

**Check 2 — Gharar Screen**
Does it have unacceptable uncertainty that could cause dispute?
→ MAJOR GHARAR: Haram. Minor gharar: Permissible.

**Check 3 — Maysir Screen**
Is one party's gain purely at another's loss by chance?
→ YES: Haram.

**Check 4 — Business Sector Screen**
Is the underlying business in a haram sector?
→ Alcohol, pork, weapons WMD, pornography, gambling: Haram.

**Check 5 — Structure Screen**
Does the Islamic "wrapper" genuinely change the economic substance?
→ Genuine structure: Permissible. Paper transaction only: Questionable.

## Output Format

```
🔍 Shariah Compliance Check

Product/Transaction: [Name]

SCREENING RESULTS:
Riba Check:    ✅ PASS / ❌ FAIL / ⚠️ QUESTIONABLE
Gharar Check:  ✅ PASS / ❌ FAIL / ⚠️ QUESTIONABLE
Maysir Check:  ✅ PASS / ❌ FAIL / ⚠️ QUESTIONABLE
Sector Check:  ✅ PASS / ❌ FAIL / ⚠️ QUESTIONABLE

VERDICT: ✅ PERMISSIBLE / ❌ NOT PERMISSIBLE / ⚠️ SCHOLARLY DIFFERENCE

REASONING:
[2-3 sentences explaining why]

ALTERNATIVE (if not permissible):
[Suggest halal equivalent]
```

## Common Products to Check

| Product | Verdict | Reason |
|---|---|---|
| NSC (National Savings) | ❌ Haram | Fixed interest |
| GOP Ijara Sukuk | ✅ Halal | Asset-backed |
| PSX stocks (KMI-30) | ✅ Halal | Screened |
| Conventional insurance | ❌ Haram | Gharar + Riba |
| Takaful | ✅ Halal | Mutual risk sharing |
| Prize Bonds (prize) | ❌ Haram | Maysir (gambling element) |
| Term deposits (conventional) | ❌ Haram | Riba |
| Islamic savings account | ✅ Halal | Mudarabah |
| Futures/Options (speculation) | ❌ Haram | Gharar + Maysir |

## Important Caveat
Always add: "For a binding Shariah ruling, please consult your bank's
Shariah Supervisory Board or a qualified Islamic scholar."

## MULTI-METHODOLOGY SCREENING (Equity/Stock Screening)

When screening stocks or companies for Shariah compliance, different methodologies
have different thresholds. Show the comparison:

### 5 Screening Methodologies Compared

| Criteria | SC Malaysia | Saudi Tadawul | MSCI Islamic | DJIM | AAOIFI SS 21 |
|---|---|---|---|---|---|
| **Debt Ratio** | < 33% total assets | < 33% total assets | < 33% total assets | < 33% total assets | < 30% total assets |
| **Cash/Interest** | < 33% total assets | < 33% total assets | < 33% total assets | < 33% total assets | < 30% total assets |
| **Receivables** | < 49% total assets | < 49% total assets | < 49% total assets | < 49% total assets | < 70% total assets |
| **Haram Revenue** | < 5% total revenue | < 5% total revenue | < 5% total revenue | < 5% total revenue | < 5% total revenue |
| **Interest Income** | < 5% total revenue | < 5% total revenue | < 5% total revenue | < 5% total revenue | < 5% total revenue |
| **Hard Exclusions** | Alcohol, pork, gambling, tobacco, conventional finance | Alcohol, pork, gambling, weapons | Alcohol, pork, gambling, tobacco, weapons | Alcohol, pork, gambling, tobacco, weapons | Alcohol, pork, gambling, weapons, conventional finance |

### Full 5-Step Screening Workflow

**Step 1 — Sector Screen (Hard Exclusions):**
Automatically exclude any company with MATERIAL INVOLVEMENT in:
- Conventional banking (interest-based)
- Conventional insurance
- Alcohol production or distribution
- Tobacco production or distribution
- Pork products (including gelatin, pork-based food processing)
- Gambling (casinos, bookmakers, lottery, online gambling)
- Adult entertainment / pornography
- Weapons of mass destruction

**Step 2 — Financial Ratio Screen:**
- Debt Screen: If interest-bearing debt > 33% of total assets (AAOIFI/MSCI) → EXCLUDE
- Cash + Interest-Bearing Securities Screen: If > 33% of total assets → EXCLUDE
- Accounts Receivable Screen: If > 49% or 70% (methodology dependent) → flag
- Data sources: Latest annual financial statements (12-month trailing)

**Step 3 — Non-Permissible Income (NPI) Screen:**
- NPI Definition: Revenue from prohibited activities (interest income, conventional insurance, alcohol, tobacco, pork, gambling)
- NPI Threshold: 5% of total revenue (all four methodologies)
- Calculation: NPI % = Total Non-Permissible Revenue / Total Revenue × 100
- If NPI % > 5% → EXCLUDE
- If NPI % ≤ 5% → PASS (but requires PURIFICATION)
- If NPI % = 0% → FULLY CLEAN

**Step 4 — Purification Calculation:**
For holdings that PASS the 5% NPI screen but have some non-permissible income:
```
Purification Amount = Dividend Received × NPI % of that company

Total Portfolio Purification = Σ (Dividend from company i × NPI % of company i)
```
Action: Donate the purification amount to charity (sadaqah). Do not retain.

Journal entry:
Dr: Purification Expense [Amount]
Cr: Charity Payable — Purification [Amount]

On payment:
Dr: Charity Payable — Purification [Amount]
Cr: Cash [Amount]

**Step 5 — Conflict Resolution:**
When different methodologies produce different results:
1. Apply the methodology specified in the fund's SSB-approved investment policy
2. If "most conservative of all methodologies" → exclude if ANY methodology excludes
3. For borderline cases → refer to SSB for ruling. Do not trade without SSB determination

### How to Use This Table

**Step 1 — Identify the methodology:**
- Pakistan stocks (PSX KMI-30) → AAOIFI SS 21 or SC Malaysia
- Saudi stocks (Tadawul) → Saudi Tadawul screening
- Global stocks → MSCI or DJIM
- Malaysian stocks → SC Malaysia

**Step 2 — Apply the relevant thresholds:**
- Check debt ratio (interest-bearing debt ÷ total assets)
- Check cash ratio (cash + interest-bearing securities ÷ total assets)
- Check receivables ratio (accounts receivable ÷ total assets)
- Check haram revenue (haram income ÷ total revenue)
- Check business sector (hard exclusions)

**Step 3 — Report with methodology specified:**
```
SCREENING METHODOLOGY: [SC Malaysia / Tadawul / MSCI / DJIM / AAOIFI SS 21]
Company: [Name]
```

### Quarterly Rebalancing Workflow

1. Obtain updated Shariah-compliant securities list from each applicable methodology provider
2. Compare against current portfolio holdings
3. Identify newly NON-COMPLIANT holdings → immediate divestment required
4. Identify newly COMPLIANT holdings → eligible for purchase
5. For holdings that remain compliant: update NPI % from latest annual reports
6. Recalculate portfolio-level purification obligation
7. Produce SSB quarterly compliance report

**Divestment timeline:** Most SSBs allow 30 days to divest non-compliant holdings.

### Mandatory Quarterly SSB Report Structure

1. Portfolio composition: # and % of holdings by Shariah status
2. Changes from prior quarter: additions to non-compliant list
3. Purification obligation: calculation, amount, recommended charities
4. Borderline holdings under SSB review
5. Recommended actions before next quarter
6. SSB attestation signature
