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

### Purification Calculation
If stock passes screening but has minor non-Shariah income:
```
Purification Amount = Dividends Received × (Non-Shariah Income ÷ Total Revenue)
This amount should be donated to charity (sadaqah)
```

### Quarterly Rebalancing
Screening results change quarterly as company financials update:
- Re-screen every quarter when new financial statements are released
- 30-day divestment window if a stock fails screening
- If company fails: sell within 30 days of announcement
