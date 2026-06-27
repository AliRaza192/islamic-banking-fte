---
name: ijara-specialist
description: >
  Deep expertise in Ijara Islamic leasing per AAOIFI FAS 8/32 — car Ijarah,
  home Ijara, equipment leasing. Calculates rental schedules, explains Ijara
  Muntahia Bittamleek structure, compares with Murabaha. Triggers on: ijara,
  ijarah, إجارة, lease, rent-to-own, kiraya, car lease halal, equipment lease,
  home lease, operating lease Islamic, car ijarah calculator, monthly rental
  calculation, meezan car ijarah, ijarah muntahia bittamleek.
metadata:
  version: "1.0"
  author: "Islamic Banking FTE"
  standard: "AAOIFI FAS 8 (Ijara), FAS 32 (Ijara Muntahia Bittamleek)"
allowed_tools: Read
version: 1.0.0
---

# Ijara Specialist Skill

## GOVERNING FRAMEWORK

Every Ijara response MUST begin with:
```
GOVERNING FRAMEWORK: AAOIFI FAS 8/32 — [Jurisdiction]
PRODUCT: Ijara
JURISDICTION: [Country — Regulator]
```

## AAOIFI FAS 8/32 Reference

Ijara is a LEASE transaction — the bank leases an asset it owns to the customer
for a specified rental. It is NOT a loan with a different name.

### Recognition Rules (AAOIFI FAS 8)

**Step 1 — Bank purchases asset for ijarah:**
Dr: Ijara Asset (held for lease) [Cost Price]
Cr: Cash / Payable to Supplier [Cost Price]

**Step 2 — Periodic rental recognition:**
Dr: Cash / Receivable [Rental amount per contract]
Cr: Ijara Income [Rental amount]

**Step 3 — Depreciation of ijarah asset:**
Dr: Depreciation Expense [Depreciation charge per policy]
Cr: Accumulated Depreciation — Ijara Asset [Same amount]

**Step 4 — Transfer of asset to customer (IMB only):**
Dr: Accumulated Depreciation [Full accumulated amount]
Dr: Transfer Expense / Loss [Residual book value if any]
Cr: Ijara Asset [Original cost]

### Ijara Muntahia Bittamleek (IMB)
- Lease ending in ownership transfer
- AAOIFI FAS 32 governs this variant
- Transfer via: Gift (Hiba) OR Nominal sale at end of lease
- Customer has binding promise to acquire at end
- If transfer is by sale: transfer price must be disclosed upfront

### Income Labels by Jurisdiction
- Pakistan (SBP): "Rental Income from Ijara"
- UAE (CBUAE): "Rental Income from Ijara"
- Saudi Arabia (SAMA): "Rental Income from Ijara"
- Malaysia (BNM): "Ijara Income"
- Bahrain (CBB/AAOIFI): "Ijara Income"
- NEVER: "Interest Income" or "Finance Income"

### Key Shariah Points
- Bank owns the asset — bears major maintenance responsibility
- Customer pays for normal wear and running costs
- If asset destroyed through no fault of customer → bank bears loss
- Cannot lease asset for haram purpose
- Rental = payment for USE, not for loan of money

## When to Activate
- User mentions "ijara", "ijarah", "إجارة"
- User asks about car/home/equipment leasing
- User asks about "Car Ijarah" (Meezan Bank or any bank)
- User wants to calculate monthly rental

## Ijara Variants

### Pure Ijara (Operating Lease)
- Customer leases, no ownership at end
- Used for: short-term equipment, commercial vehicles

### Ijara Muntahia Bittamleek (IMB) — Most Common
- Lease ending in ownership
- Transfer via: Gift (Hiba) OR Nominal sale at end
- Used for: Car financing, home financing in Pakistan

### Ijara Mawsoofa fil Dhimma
- Forward lease on asset not yet built/delivered
- Used for: Off-plan property, under-construction homes

## Monthly Rental Formula
```
Monthly Rental = Outstanding Bank Investment × (Annual Rate ÷ 12)

For variable rate:
Annual Rate = KIBOR (current) + Bank's spread
```

## Output Format for Rental Calculation
```
🚗 Ijara Rental Calculation

Asset:                [Car/Property/Equipment]
Asset Value:          Rs. X,XXX,XXX
Customer Deposit:     Rs.   XXX,XXX  (XX%)
Bank Investment:      Rs. X,XXX,XXX  (XX%)
Annual Rental Rate:   XX% (KIBOR XX% + Spread X%)
Tenure:               XX months

Month 1 Rental:       Rs. XX,XXX
Transfer at End:      Gift (Hiba) / Nominal Sale

NOTE: Rate may change every 6 months with KIBOR revision.
      Total cost depends on future KIBOR movements.
```

## Key Shariah Points to Explain
- Bank owns the asset — bears major maintenance responsibility
- Customer pays for normal wear and running costs
- If asset destroyed through no fault of customer → bank bears loss
- Cannot lease asset for haram purpose
- Rental = payment for USE, not for loan of money

### DUAL-REGIME ACCOUNTING (AAOIFI vs IFRS)

**AAOIFI FAS 8/32 Treatment:**
- Asset stays on LESSOR's balance sheet throughout lease term
- Depreciate over USEFUL LIFE (not lease term)
- Rental income recognized evenly over lease period
- Transfer to lessee via separate document (Hiba or nominal sale)
- Income label: "Ijara Income"

**IFRS 16 Treatment (Lessor):**
- Finance lease assessment: 5 indicators (ownership transfer, bargain purchase, lease term ≈ useful life, PV ≈ fair value, specialized asset)
- If finance lease: derecognize asset, recognize net investment in lease
- If operating lease: keep asset on books, depreciate over useful life
- Income label: "Rental Income from Ijara"

**IFRS 16 Treatment (Lessee):**
- Right-of-Use (ROU) asset + Lease liability recognized on lessee's balance sheet
- Depreciation of ROU asset + interest on lease liability
- This is a MAJOR difference from AAOIFI (lessee has no asset/liability under AAOIFI)

**Key Divergence:**
```
AAOIFI:  Asset on LESSOR's books, lessee has no balance sheet impact
IFRS 16: Asset may move to LESSEE's books (ROU asset + lease liability)
         Lessor may derecognize if finance lease
```

**Jurisdiction Selection:**
- Bahrain, Qatar → AAOIFI FAS 8/32 (asset stays on lessor's books)
- Pakistan, UAE, Saudi, Kuwait, Oman, UK → IFRS 16 (finance lease assessment)
- Malaysia → MFRS 116 (IFRS 16 equivalent)
