---
name: salam-specialist
description: >
  Deep expertise in Salam and Parallel Salam per AAOIFI FAS 7. Explains
  forward sale structure, full advance payment requirements, commodity
  specifications, parallel Salam hedging, and agricultural financing context.
  Triggers on: salam, سلم, forward sale, advance payment, crop financing,
  agricultural financing, commodity forward, pre-paid goods, parallel salam,
  salam contract, forward purchase.
metadata:
  version: "1.0"
  author: "Islamic Banking FTE"
  standard: "AAOIFI FAS 7 (Salam and Parallel Salam)"
allowed_tools: Read, Write
version: 1.0.0
---

# Salam Specialist Skill

## GOVERNING FRAMEWORK

Every Salam response MUST begin with:
```
GOVERNING FRAMEWORK: AAOIFI FAS 7 — [Jurisdiction]
PRODUCT: Salam / Parallel Salam
JURISDICTION: [Country — Regulator]
```

## AAOIFI FAS 7 Reference

Salam is a FORWARD SALE where the buyer pays the FULL price upfront at
contract inception, and the seller delivers the specified goods at a future date.

### Key Difference from Conventional Forward
- Conventional forwards: exchange of debt for debt (prohibited — bay al-kali bil-kali)
- Salam: FULL advance payment makes it permissible — buyer pays now, seller delivers later
- The advance payment is the Shariah justification for the deferred delivery

### Shariah Conditions
1. **Full payment at signing** — 100% of price paid upfront (no partial payment)
2. **Commodity must be fungible/standardizable** — cannot be unique items
3. **Delivery date must be specified** — cannot be "whenever ready"
4. **Quantity and quality must be precisely described** — reduces gharar
5. **Commodity need not exist at contract date** — but must be producible by delivery date
6. **Possession at delivery** — buyer must take physical or constructive possession

### Salam vs Istisna'a
| Feature | Salam | Istisna'a |
|---|---|---|
| Payment | Full upfront | Can be deferred/staged |
| Commodity | Fungible goods | Custom manufactured |
| Use case | Agricultural, standard goods | Construction, manufacturing |
| AAOIFI Standard | FAS 7 | FAS 10 |

### Recognition Rules (Journal Entries)

**At Contract Signing (Full Payment):**
Dr: Salam Asset (at cost = full price paid) [Amount]
Cr: Cash / Bank [Amount]

**At Delivery (Goods Received):**
Dr: Inventory / Receivable [Fair value at delivery]
Cr: Salam Asset [Cost]
Cr: Salam Profit [Difference — if fair value > cost]

If fair value < cost at delivery: recognize loss immediately.

**Important:** The Salam asset is carried at COST (amount paid), NOT at fair value until delivery.

### Parallel Salam
Two INDEPENDENT Salam contracts — the bank buys via Salam from producer, sells via Salam to buyer.

**Critical:** The two contracts MUST remain independent. Linking them (making one conditional on the other) may violate Shariah. The bank bears commodity price risk between the two contracts.

**Parallel Salam Journal Entries:**

**First Salam (Bank buys from producer):**
Dr: Salam Asset [Full price paid to producer]
Cr: Cash [Full price paid]

**Second Salam (Bank sells to buyer):**
Dr: Cash [Full price received from buyer]
Cr: Salam Payable [Full price to deliver to buyer]

**At delivery — settle both:**
Dr: Salam Payable [Cost]
Cr: Salam Asset [Cost]
Cr: Salam Profit [Difference]

### Income Labels by Jurisdiction
- Pakistan (SBP): "Profit from Salam Financing"
- UAE (CBUAE): "Profit from Salam Financing"
- Saudi Arabia (SAMA): "Profit from Salam Transactions"
- Malaysia (BNM): "Profit from Islamic Financing — Salam"
- Bahrain (CBB/AAOIFI): "Salam Income"
- NEVER: "Interest Income" or "Forward Premium Income"

## When to Activate
- User mentions "salam" or "سلم"
- User asks about forward sale, advance payment for goods
- User asks about agricultural financing, crop financing
- User asks about pre-paid commodity contracts
- User mentions parallel salam or salam hedging

## Step-by-Step Workflow

### For Explanation Requests:
1. Define Salam in simple language
2. Explain why full advance payment is required
3. Give relatable example (farmer selling next season's crop)
4. Compare with conventional forward contracts
5. Mention when banks use Salam (agricultural, commodity financing)

### For Calculation Requests:
**Step 1 — Collect Inputs:**
- Commodity being purchased
- Salam price (full amount paid upfront)
- Delivery date
- Expected fair value at delivery (for profit estimate)

**Step 2 — Calculate:**
```
Salam Cost         = Full price paid at signing
Expected Revenue   = Fair value at delivery
Expected Profit    = Expected Revenue - Salam Cost
Profit Rate        = (Expected Profit ÷ Salam Cost) × 100
```

**Step 3 — Output:**
Show calculation breakdown, Shariah conditions, and risk note (commodity price risk).

## Output Format

### Calculation Output:
```
Salam Calculation

Commodity:          [Item Name]
Salam Price:        Rs. X,XXX,XXX (paid upfront)
Delivery Date:      [Date]
Expected Fair Value: Rs. X,XXX,XXX

Expected Profit:    Rs. X,XXX,XXX
Expected Profit Rate: XX.X%

Shariah Conditions Verified:
  Full payment at signing: Yes
  Commodity fungible: Yes
  Delivery date specified: Yes
  Quantity/quality defined: Yes

Risk Note: If market price at delivery is LOWER than Salam price,
the bank bears the loss. Salam involves commodity price risk.
```

## Common User Questions

**"Why must I pay everything upfront?"**
Salam requires full advance payment because you are buying goods that don't exist yet. The upfront payment is what makes this permissible — otherwise it would be selling debt for debt (prohibited).

**"Can I use Salam for a house?"**
No — Salam is for fungible/standardizable goods (wheat, rice, oil). For custom construction, use Istisna'a instead.

**"What if the goods are never delivered?"**
The seller is obligated to deliver. If they fail, you can demand a refund of the full amount. The contract is binding.

**"Is Salam used in Pakistan?"**
Yes — Islamic banks use Salam for agricultural financing (crop pre-purchase), commodity financing, and sometimes for SME working capital. NRSP Microfinance Bank and some Islamic banks offer Salam-based products.
