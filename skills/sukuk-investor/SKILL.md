---
name: sukuk-investor
description: >
  Expert in Sukuk investment and investor-side classification per AAOIFI FAS 25
  and IFRS 9. Covers business model test, SPPI test, FVOCI vs FVTPL vs
  amortised cost classification, ECL staging, yield calculation, and Pakistan
  GOP Ijara Sukuk specifics. Triggers on: sukuk investment, invest in sukuk,
  buy sukuk, sukuk yield, sukuk return, GOP sukuk, Pakistan sukuk, sukuk
  portfolio, sukuk classification, sukuk impairment, sukuk ECL, sukuk FVOCI,
  sukuk amortised cost, KMI-30 sukuk, Islamic bonds investment.
metadata:
  version: "1.0"
  author: "Islamic Banking FTE"
  standard: "AAOIFI FAS 25, IFRS 9"
allowed_tools: Read, Write
version: 1.0.0
---

# Sukuk Investor Skill

## GOVERNING FRAMEWORK

Every Sukuk Investor response MUST begin with:
```
GOVERNING FRAMEWORK: AAOIFI FAS 25 / IFRS 9 — [Jurisdiction]
PRODUCT: Sukuk (Investor Perspective)
JURISDICTION: [Country — Regulator]
```

## AAOIFI FAS 25 / IFRS 9 Reference

### IFRS 9 Two-Step Classification (Investor Side)

**Step 1 — Business Model Test:**
- Hold to Collect (HTC) → Amortised Cost
- Hold to Collect and Sell (HTCS) → FVOCI
- Trading / Other → FVTPL

**Step 2 — SPPI Test (Solely Payments of Principal and Interest):**
- Fixed distributions + fixed redemption = SPPI PASS
- Profit-contingent returns = SPPI FAIL

### Classification by Sukuk Type

| Sukuk Type | SPPI Test | Likely Classification |
|---|---|---|
| Ijara Sukuk (fixed rental) | PASS | Amortised Cost or FVOCI |
| Ijara Sukuk (floating rental) | PASS | FVOCI or FVTPL |
| Musharakah Sukuk (profit-contingent) | FAIL | FVTPL |
| Mudarabah Sukuk (profit-contingent) | FAIL | FVTPL |
| Wakala Sukuk (depends on returns) | Varies | Depends on structure |
| Murabaha Sukuk (fixed markup) | PASS | Amortised Cost or FVOCI |

**Important:** Purchase undertaking at face value does NOT cause SPPI failure.
The SPPI test looks at the nature of returns, not the redemption mechanism.

### AAOIFI FAS 25 Classification (Alternative)
- Held to Maturity → Amortised cost
- Trading → Fair value through profit or loss
- Available for Sale → Fair value through OCI

### ECL Staging for Sukuk (Expected Credit Loss)

**Stage 1 — Performing:**
- 12-month ECL
- No significant increase in credit risk since initial recognition
- Government Sukuk (like GOP Ijara) typically Stage 1

**Stage 2 — Underperforming:**
- Lifetime ECL
- Significant increase in credit risk but not impaired
- Downgrade in credit rating

**Stage 3 — Impaired:**
- Lifetime ECL
- Objective evidence of impairment
- Default, restructuring, or distressed

### Yield Calculation

**Current Yield:**
```
Current Yield = (Annual Profit Distribution ÷ Current Market Price) × 100
```

**Yield to Maturity (YTM):**
The discount rate that equates all future cash flows to the current market price.
Identical mathematics to conventional bond YTM — but label it "Yield to Maturity"
or "Expected Profit Rate," never "Yield to Maturity on a bond."

### Pakistan GOP Ijara Sukuk (Investor Perspective)
- Government of Pakistan issues Ijara Sukuk backed by federal assets
- Rental payments funded from federal budget
- Listed on Pakistan Stock Exchange (PSX)
- Minimum retail investment: Usually Rs. 100,000
- Considered near-risk-free (sovereign credit)
- Eligible as Statutory Liquidity Reserves for Islamic banks

### Income Labels (Investor Side)
- Pakistan: "Profit Income on Sukuk Investments"
- UAE: "Profit Income on Sukuk Investments"
- Saudi Arabia: "Profit Income on Sukuk"
- Malaysia: "Distribution Income from Sukuk"
- Bahrain: "Sukuk Investment Income"
- NEVER: "Interest Income" or "Coupon Income"

## When to Activate
- User asks about investing in Sukuk
- User asks about Sukuk yield, return, profitability
- User mentions buying Sukuk, Sukuk portfolio
- User asks about GOP Sukuk, Pakistan Sukuk, KMI-30
- User asks about Sukuk classification (FVOCI, FVTPL, amortised cost)
- User asks about Sukuk impairment or ECL

## Step-by-Step Workflow

### For Investment Guidance:
1. Explain what Sukuk are in simple terms
2. Describe available Sukuk in Pakistan (GOP Ijara, corporate)
3. Explain how to buy (through Islamic banks, PSX)
4. Calculate expected yield
5. Compare with conventional bonds (and why Sukuk are halal)

### For Classification/Accounting:
**Step 1 — Determine Sukuk type**
**Step 2 — Apply SPPI test**
**Step 3 — Apply business model test**
**Step 4 — Determine classification**
**Step 5 — Show accounting treatment**

### For Yield Calculation:
**Step 1 — Collect inputs:**
- Face value
- Annual profit distribution
- Current market price
- Remaining tenure

**Step 2 — Calculate:**
```
Current Yield = (Annual Profit ÷ Market Price) × 100

For YTM: Solve for r in:
  Market Price = Σ [Annual Profit ÷ (1+r)^t] + [Face Value ÷ (1+r)^n]
```

## Output Format

### Investment Guidance:
```
Sukuk Investment — Pakistan

Available Options:
  1. GOP Ijara Sukuk (Sovereign)
     - Face Value: Rs. 100,000
     - Profit Rate: ~16% (varies)
     - Tenure: 3-10 years
     - Risk: Near-zero (government backed)
     - Where to buy: PSX, Islamic banks

  2. Corporate Sukuk
     - Various issuers (Engro, Meezan, etc.)
     - Higher yield, higher risk
     - Where to buy: PSX, OTC through banks

Expected Return Calculation:
  Investment:     Rs. 1,000,000
  Profit Rate:    16% per annum
  Annual Profit:  Rs. 160,000
  Monthly Income: Rs. 13,333
```

### Classification Output:
```
Sukuk Classification (IFRS 9)

Sukuk Type:        [Ijara / Musharakah / etc.]
SPPI Test:         [PASS / FAIL]
Business Model:    [HTC / HTCS / Trading]
Classification:    [Amortised Cost / FVOCI / FVTPL]

Accounting Treatment:
  Initial: Dr Sukuk Investment [Cost] Cr Cash [Cost]
  Periodic: Dr Cash [Profit] Cr Profit Income [Profit]
  Closing: [Amortised cost / Fair value] on balance sheet
```

## Common User Questions

**"Is investing in Sukuk halal?"**
Yes — Sukuk represent ownership in real assets. Returns come from rental/profit of those assets, not from interest. This is fundamentally different from conventional bonds.

**"How do I buy Sukuk in Pakistan?"**
Through Pakistan Stock Exchange (PSX) for listed Sukuk, or directly through Islamic banks for private placements. GOP Ijara Sukuk are the most accessible.

**"What return can I expect?"**
GOP Ijara Sukuk currently offer around 15-17% per annum (varies with KIBOR). Corporate Sukuk may offer higher yields but with more risk.

**"Are Sukuk safe?"**
Government Sukuk (like GOP Ijara) are considered very safe — backed by sovereign credit. Corporate Sukuk carry the credit risk of the issuing company. Always check the credit rating.

**"Can I sell Sukuk before maturity?"**
Listed Sukuk (on PSX) can be sold in the secondary market. Unlisted Sukuk may have restrictions. The price may be higher or lower than your purchase price.
