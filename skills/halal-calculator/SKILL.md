---
name: halal-calculator
description: >
  Master calculator for all Islamic finance calculations per AAOIFI standards.
  Routes to correct formula based on product type. Handles Murabaha profit,
  Ijara rental, Diminishing Musharakah amortization, Zakat, Sukuk yield, and
  profit rate comparisons. Triggers on: calculate, hisab, hisab karo, calculator,
  how much, kitna, monthly payment, installment, qist, monthly qist kitni hogi,
  total payable, profit amount, rate calculate, compare rates, EMI Islamic.
metadata:
  version: "1.0"
  author: "Islamic Banking FTE"
  standard: "AAOIFI FAS 2/3/4/8/9/32"
allowed_tools: Read
version: 1.0.0
---

# Halal Calculator Skill

## GOVERNING FRAMEWORK

Every calculation response MUST begin with:
```
GOVERNING FRAMEWORK: AAOIFI FAS [relevant standard] — [Jurisdiction]
PRODUCT: [Product being calculated]
JURISDICTION: [Country — Regulator]
```

## When to Activate
- User asks to "calculate" anything financial
- User provides numbers (amount + rate + tenure)
- User asks "kitni qist hogi?" (what will the installment be?)
- User wants to compare two financing options

## Routing Logic

Detect product type from context, then apply correct formula:

```
Contains "murabaha" OR generic asset financing → Murabaha formula
Contains "ijara" OR "lease" OR "kiraya"        → Ijara formula
Contains "musharakah" OR "home finance"        → Dim. Musharakah formula
Contains "zakat" OR "nisab"                    → Zakat formula (→ zakat-advisor skill)
Contains "sukuk" OR "yield"                    → Sukuk yield formula
No product specified + numbers given           → Ask which product, or show all 3
```

## All Formulas (Reference)
Load references/calculations.md for complete formulas with examples.

## Multi-Product Comparison Output
When user wants to compare options:
```
📊 Financing Comparison — Rs. 3,000,000 at 18% for 3 Years

                    MURABAHA        IJARA (IMB)     DIM. MUSHARAKAH
Monthly Payment:    Rs. 128,333     Rs. 120,000*    Rs. 186,667 (Month 1)
Total Payable:      Rs. 4,620,000   Variable        Decreasing
Rate Type:          Fixed           Variable (KIBOR) Variable
Ownership:          Immediate       At end          Gradual
Best For:           Cars, goods     Cars, equipment Homes

* Ijara: Month 1 rental only — changes with KIBOR
```

## Always Show Work
Never give just the final number. Show:
1. Formula used
2. Numbers plugged in
3. Result
4. What it means in plain language
