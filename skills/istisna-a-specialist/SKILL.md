---
name: istisna-a-specialist
description: >
  Deep expertise in Istisna'a and Parallel Istisna'a per AAOIFI FAS 10.
  Explains construction finance, manufacturing contracts, progressive payment
  milestones, percentage-of-completion accounting, and parallel Istisna'a
  structures. Triggers on: istisna, استصناع, construction finance, manufacturing
  finance, home construction, under-construction property, progressive payment,
  milestone payment, parallel istisna, building contract, HBFC, home finance
  construction.
metadata:
  version: "1.0"
  author: "Islamic Banking FTE"
  standard: "AAOIFI FAS 10 (Istisna'a and Parallel Istisna'a)"
allowed_tools: Read, Write
version: 1.0.0
---

# Istisna'a Specialist Skill

## GOVERNING FRAMEWORK

Every Istisna'a response MUST begin with:
```
GOVERNING FRAMEWORK: AAOIFI FAS 10 — [Jurisdiction]
PRODUCT: Istisna'a / Parallel Istisna'a
JURISDICTION: [Country — Regulator]
```

## AAOIFI FAS 10 Reference

Istisna'a is a contract to manufacture/construct a specified item where the
payment can be deferred or staged — unlike Salam which requires full upfront payment.

### Key Features
- **Payment flexibility:** Can pay in full, in stages, or deferred until completion
- **Custom specification:** Item is made to buyer's specifications (not fungible)
- **Manufacturer must have capability:** Cannot subcontract without consent
- **Cancellation allowed:** Before manufacturing begins, either party can cancel

### Shariah Conditions
1. **Specifications must be precisely described** — material, dimensions, quality
2. **Price must be fixed** — or a clear formula for determining it
3. **Payment terms can be flexible** — upfront, staged, or at completion
4. **The subject must be manufactured/constructed** — not naturally occurring
5. **Both parties can specify the delivery date** — or a range

### Istisna'a vs Salam vs Conventional Construction Loan

| Feature | Istisna'a | Salam | Conventional Loan |
|---|---|---|---|
| Payment | Flexible (staged OK) | Full upfront | Disbursed in tranches |
| Subject | Custom manufactured | Fungible goods | Any purpose |
| Specification | Buyer's specs | Standard specs | N/A |
| Cancellation | Before manufacturing | After signing | Penalty-based |
| AAOIFI | FAS 10 | FAS 7 | N/A |

### Recognition Rules (Journal Entries)

**Progressive Payment (Percentage-of-Completion):**

At each milestone:
Dr: Istisna'a Receivable [Milestone amount]
Cr: Istisna'a Revenue [Percentage complete × Total contract price]

Cost incurred:
Dr: Istisna'a Cost [Cost incurred]
Cr: Cash / Payable [Cost incurred]

**At Completion:**
Dr: Cash [Final payment]
Cr: Istisna'a Receivable [Remaining balance]

**Loss-Making Contracts:** If expected total cost exceeds contract price,
recognize the FULL expected loss immediately (do not defer).

### Parallel Istisna'a
Bank acts as intermediary — two independent Istisna'a contracts:

**Contract 1:** Bank engages manufacturer to build for Rs. X
**Contract 2:** Bank sells to customer for Rs. X + profit

**Critical:** The two contracts MUST remain independent. The bank bears the
risk if the manufacturer defaults or delivers substandard work.

### IFRS 15 Comparison
Istisna'a accounting arithmetic is IDENTICAL to IFRS 15 (Revenue from Contracts).
Key difference: AAOIFI requires explicit Shariah compliance confirmation that
specifications comply with gharar prohibition.

### Gross vs Net Presentation
- Most Parallel Istisna'a structures: GROSS presentation (both receivable and payable on balance sheet)
- This effectively DOUBLES the balance sheet size for these transactions
- Net presentation only if bank is clearly acting as agent (not principal)

### Income Labels by Jurisdiction
- Pakistan (SBP): "Profit from Istisna'a Financing"
- UAE (CBUAE): "Profit from Istisna'a Financing"
- Saudi Arabia (SAMA): "Profit from Istisna'a Transactions"
- Malaysia (BNM): "Profit from Islamic Financing — Istisna'a"
- Bahrain (CBB/AAOIFI): "Istisna'a Income"
- NEVER: "Construction Loan Interest" or "Progress Billing Income"

## When to Activate
- User mentions "istisna" or "استصناع"
- User asks about construction finance, home construction financing
- User asks about manufacturing finance, custom-built items
- User mentions under-construction property, progressive payment, milestone payment
- User asks about HBFC Islamic or home construction Islamic financing

## Step-by-Step Workflow

### For Explanation Requests:
1. Define Istisna'a in simple language
2. Explain why payment can be staged (unlike Salam)
3. Give relatable example (building a house, manufacturing equipment)
4. Compare with conventional construction loans
5. Mention parallel Istisna'a structure used by banks

### For Calculation Requests:
**Step 1 — Collect Inputs:**
- Item being constructed/manufactured
- Total contract price
- Payment milestones (% at each stage)
- Expected cost to manufacturer
- Tenure (months)

**Step 2 — Calculate:**
```
Total Contract Price  = Agreed price
Total Cost            = Manufacturer's cost
Bank Profit           = Contract Price - Cost (in parallel Istisna'a)
Profit Rate           = (Bank Profit ÷ Cost) × 100
Monthly Payment       = Contract Price ÷ Tenure (if equal installments)
```

**Step 3 — Output:**
Show milestone schedule, profit breakdown, and Shariah conditions.

## Output Format

```
Istisna'a Calculation

Project:              [Description — e.g., House Construction]
Total Contract Price: Rs. X,XXX,XXX
Manufacturer Cost:    Rs. X,XXX,XXX
Bank Profit:          Rs. X,XXX,XXX
Profit Rate:          XX.X%
Tenure:               XX months

Milestone Schedule:
  1. Foundation (20%):  Rs. X,XXX,XXX — Due: Month X
  2. Structure (30%):   Rs. X,XXX,XXX — Due: Month X
  3. Finishing (30%):   Rs. X,XXX,XXX — Due: Month X
  4. Handover (20%):    Rs. X,XXX,XXX — Due: Month X

Shariah Conditions Verified:
  Specifications defined: Yes
  Price fixed: Yes
  Payment terms agreed: Yes
  Manufacturer capable: Yes
```

## Common User Questions

**"Can I get a house built with Islamic financing?"**
Yes — Istisna'a is specifically designed for construction. The bank arranges the construction (or engages a builder) and you pay in installments. This is halal because the bank is actually commissioning construction, not lending money.

**"How is Istisna'a different from a regular construction loan?"**
In a conventional loan, the bank gives you money and charges interest. In Istisna'a, the bank commissions the construction itself and sells you the completed property at a markup. The profit is from a sale, not from interest.

**"Can I pay in stages as construction progresses?"**
Yes — this is one of the key features of Istisna'a. Unlike Salam (which requires full payment upfront), Istisna'a allows flexible payment schedules tied to construction milestones.

**"Which banks offer Istisna'a in Pakistan?"**
Most Islamic banks offer Istisna'a for home construction: Meezan Bank, Bank Islami, Dubai Islamic Bank Pakistan. HBFC (House Building Finance Corporation) also has Islamic options. Check references/pakistan-banks.md for details.
