---
name: sukuk-issuer
description: >
  Expert in Sukuk issuance and issuer-side accounting per AAOIFI FAS 33/34
  and IAS 32. Covers all Sukuk types (Ijara, Musharakah, Mudarabah, Wakala,
  Murabaha, Hybrid), SPV setup, asset transfer, derecognition tests, profit
  distribution mechanics, and disclosure requirements. Triggers on: sukuk
  issuance, issue sukuk, corporate sukuk, sovereign sukuk, sukuk al-ijara
  issuance, sukuk structure, SPV sukuk, sukuk offering, sukuk prospectus,
  sukuk rating, sukuk underwriter.
metadata:
  version: "1.0"
  author: "Islamic Banking FTE"
  standard: "AAOIFI FAS 33/34, IAS 32, IFRS 9"
allowed_tools: Read, Write
version: 1.0.0
---

# Sukuk Issuer Skill

## GOVERNING FRAMEWORK

Every Sukuk Issuer response MUST begin with:
```
GOVERNING FRAMEWORK: AAOIFI FAS 33/34 — [Jurisdiction]
PRODUCT: Sukuk (Issuer Perspective)
JURISDICTION: [Country — Regulator]
```

## AAOIFI FAS 33/34 Reference

### Sukuk Types from Issuer Perspective

| Sukuk Type | Underlying Contract | Asset Ownership | Typical Classification |
|---|---|---|---|
| Ijara Sukuk | Lease contract | SPV owns asset, leases to originator | Financial Liability (most common) |
| Musharakah Sukuk | Partnership | SPV and originator co-own | Equity or Financial Liability |
| Mudarabah Sukuk | Profit-sharing | SPV invests in originator's venture | Equity or Financial Liability |
| Wakala Sukuk | Agency | SPV appoints originator as agent | Depends on structure |
| Murabaha Sukuk | Cost-plus sale | SPV buys, sells to originator | Financial Liability |
| Hybrid Sukuk | Multiple contracts | Varies | Depends on structure |

### The Derecognition Test (Critical)

Most Ijara Sukuk globally result in **FAILED derecognition**:

**Why:** Purchase undertaking at face value means the originator retains the
risks and rewards of ownership. The asset stays on the originator's balance sheet.

**Failed Derecognition = Two consequences:**
1. Asset remains on originator's balance sheet
2. Sukuk proceeds are classified as FINANCIAL LIABILITY (not equity)

**True Derecognition (rare) requires:**
- No purchase undertaking, or purchase at fair value (not face value)
- Risks and rewards genuinely transferred to sukuk holders
- No obligation to repurchase

### Issuer Accounting (Failed Derecognition — Most Common)

**At Issuance:**
Dr: Cash [Sukuk proceeds received]
Cr: Sukuk Financial Liability [Face value of sukuk]

**Periodic Profit Distribution:**
Dr: Finance Cost / Sukuk Profit Expense [Period allocation]
Cr: Cash / Payable [Profit distribution to holders]

**At Maturity (Repurchase):**
Dr: Sukuk Financial Liability [Face value]
Cr: Cash [Face value paid back]

### Issuer Accounting (True Derecognition — Rare)

**At Issuance:**
Dr: Cash [Sukuk proceeds]
Cr: Asset Derecognized [Carrying amount of transferred asset]
Cr/Pd: Gain/Loss on Derecognition [Difference]

### Equity-Like Sukuk (Musharakah/Mudarabah)

Genuine Musharakah/Mudarabah Sukuk MAY qualify for equity classification IF:
- No guaranteed redemption at face value
- Returns are genuinely profit-contingent (not fixed)
- No obligation to repurchase

**Equity Classification:**
Dr: Cash [Proceeds]
Cr: Sukuk Equity [Classified as equity on balance sheet]

Distributions treated as profit distribution (not finance cost).

### AAOIFI Draft FAS 62 Warning
Draft FAS 62 would shift Sukuk from "asset-based" to "asset-backed" —
requiring true sale (not just purchase undertaking). This would significantly
impact the Sukuk market. Flag this risk in responses.

### Disclosure Requirements
- Nature and terms of Sukuk issued
- Profit rate and distribution schedule
- Whether derecognition was achieved
- Purchase undertaking details (if any)
- Maturity date and repayment terms
- Assets transferred to SPV
- Any Shariah non-compliance events

### Income Labels by Jurisdiction
- Pakistan (SBP): "Profit Distribution on Sukuk"
- UAE (CBUAE): "Profit Distribution on Sukuk"
- Saudi Arabia (SAMA): "Profit Distribution on Sukuk"
- Malaysia (BNM): "Distribution on Sukuk"
- Bahrain (CBB/AAOIFI): "Profit Distributed on Sukuk"
- NEVER: "Coupon Payment" or "Interest Expense on Bonds"

## When to Activate
- User asks about issuing/structuring Sukuk
- User mentions corporate Sukuk, sovereign Sukuk, Sukuk offering
- User asks about SPV setup for Sukuk
- User asks about Sukuk prospectus, rating, underwriting
- User asks "how does a bank issue Sukuk?"

## Step-by-Step Workflow

### For Explanation Requests:
1. Explain Sukuk issuance process in simple terms
2. Describe SPV role
3. Explain derecognition test (why most Sukuk are financial liabilities)
4. Compare with conventional bond issuance
5. Mention Pakistan-specific context (GOP Ijara Sukuk, SBP regulations)

### For Structuring Requests:
**Step 1 — Identify Sukuk type needed:**
- Asset-backed (Ijara) — most common
- Partnership-based (Musharakah/Mudarabah) — may get equity treatment
- Agency-based (Wakala) — flexible

**Step 2 — Outline structure:**
```
Originator → transfers asset to SPV → SPV issues Sukuk → Investors buy
SPV collects rental/profit → distributes to investors
At maturity: Originator repurchases (usually at face value)
```

**Step 3 — Accounting treatment:**
Determine derecognition outcome and show journal entries.

## Output Format

```
Sukuk Issuance Structure

Sukuk Type:          [Ijara / Musharakah / etc.]
Issuer:              [Company/Bank Name]
Face Value:          Rs./AED/SAR X,XXX,XXX
Tenure:              X years
Profit Rate:         X.X% (fixed/floating)
SPV:                 [SPV Name]

Derecognition Test:
  Purchase undertaking: [Yes/No] at [Face Value / Fair Value]
  Risks/rewards transferred: [Yes/No]
  Result: [Derecognition / Failed Derecognition]

Issuer Balance Sheet Impact:
  Asset: [Removed / Remains on books]
  Liability: [Sukuk classified as Financial Liability / Equity]

Profit Distribution:
  Frequency: [Quarterly / Semi-annual]
  Label: "Profit Distribution on Sukuk" (NOT "Coupon")
```

## Common User Questions

**"What is the difference between Sukuk and bonds?"**
Bonds are debt instruments paying interest. Sukuk represent ownership in assets — holders receive rental/profit, not interest. But in practice, most Sukuk are structured to behave economically similar to bonds (purchase undertaking at face value).

**"Can a company issue Sukuk in Pakistan?"**
Yes — SBP has regulations for corporate Sukuk issuance. Companies like Meezan Bank, Engro, and others have issued Sukuk in Pakistan. The Pakistan Stock Exchange (PSX) lists tradable Sukuk.

**"Why do most Sukuk fail the derecognition test?"**
Because the originator usually provides a purchase undertaking to repurchase the assets at face value at maturity. This means the originator still bears the risk — so the asset stays on their books and the Sukuk proceeds are a liability.

**"Are Musharakah Sukuk better than Ijara Sukuk?"**
For issuers seeking equity treatment, yes — Musharakah Sukuk with no guaranteed redemption can be classified as equity (not debt). This improves debt-to-equity ratios. But investors prefer the certainty of Ijara Sukuk.
