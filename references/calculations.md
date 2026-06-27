# Islamic Banking Calculations — Formula Reference
**Version:** 1.0.0 | **Currency:** PKR (Pakistan) | **May 2026**

---

## 1. MURABAHA CALCULATIONS

### Basic Murabaha Formula
```
Total Sale Price = Cost Price + Profit Amount
Profit Amount    = Cost Price × Profit Rate × (Tenure in Years)
Monthly Payment  = Total Sale Price ÷ Number of Months
```

### Example — Car Financing
```
Given:
  Cost Price (Bank Purchase):  Rs. 3,000,000
  Profit Rate (Annual):        18%
  Tenure:                      3 years (36 months)

Step 1 — Profit Amount:
  = 3,000,000 × 0.18 × 3
  = Rs. 1,620,000

Step 2 — Total Sale Price:
  = 3,000,000 + 1,620,000
  = Rs. 4,620,000

Step 3 — Monthly Installment:
  = 4,620,000 ÷ 36
  = Rs. 128,333/month

Step 4 — Total Cost to Customer:
  = Rs. 4,620,000 (vs Rs. 3,000,000 asset cost)
```

### Murabaha with Down Payment
```
Financed Amount  = Asset Price - Down Payment
Profit Amount    = Financed Amount × Rate × Years
Total Payable    = Financed Amount + Profit Amount
Monthly Payment  = Total Payable ÷ Months
```

### Example — Home Appliances with Down Payment
```
Given:
  Asset Price:     Rs. 500,000
  Down Payment:    Rs. 100,000  (20%)
  Financed:        Rs. 400,000
  Rate:            20% p.a.
  Tenure:          2 years

Profit = 400,000 × 0.20 × 2 = Rs. 160,000
Total  = 400,000 + 160,000  = Rs. 560,000
Monthly = 560,000 ÷ 24      = Rs. 23,333
```

---

## 2. IJARA (LEASE) CALCULATIONS

### Basic Rental Formula
```
Monthly Rental = (Financed Amount × Annual Rental Rate) ÷ 12
```

### Ijara Muntahia Bittamleek (Home Finance)
```
Monthly Rental   = Outstanding Bank Investment × Monthly Rate
Monthly Rate     = Annual Rental Rate ÷ 12
Rate Benchmark   = KIBOR (Karachi Interbank Offered Rate) + Spread
                   OR Fixed rate as agreed
```

### Variable Rate Ijara Example
```
Given:
  Property Value:     Rs. 10,000,000
  Customer Equity:    Rs.  2,000,000  (20%)
  Bank Investment:    Rs.  8,000,000  (80%)
  Annual Rate:        KIBOR (16%) + 2% = 18%
  Tenure:             20 years

Month 1 Rental:
  = 8,000,000 × (0.18 ÷ 12)
  = 8,000,000 × 0.015
  = Rs. 120,000/month

Note: As customer buys bank's units, outstanding investment falls
      and monthly rental decreases accordingly
```

### KIBOR Reference (May 2026 — verify with SBP)
```
Overnight KIBOR:  ~15-17% (check sbp.org.pk for current)
1-Month KIBOR:    ~15-17%
3-Month KIBOR:    ~15-17%
6-Month KIBOR:    ~15-17%
```

---

## 3. DIMINISHING MUSHARAKAH CALCULATIONS

### Monthly Payment Components
```
Total Monthly Payment = Rental Payment + Unit Purchase Payment

Rental Payment = Bank's Outstanding Share × Monthly Rental Rate
Unit Purchase  = Fixed amount per month (agreed at start)

Monthly Rental Rate = Annual Rate ÷ 12
```

### Full Worked Example — Home Finance
```
Given:
  Property Value:      Rs. 10,000,000
  Customer Share:      Rs.  2,000,000  (20% — 200 units)
  Bank Share:          Rs.  8,000,000  (80% — 800 units)
  Total Units:         1,000
  Annual Rental Rate:  18%
  Monthly Unit Purchase: Rs. 66,667 (buys ~8 units/month approx)
  Tenure:              10 years (120 months)

Month 1:
  Rental = 8,000,000 × (0.18/12) = Rs. 120,000
  Unit Purchase = 66,667
  Total Payment = Rs. 186,667

Month 2 (after buying Rs.66,667 worth of units):
  Bank's new share = 8,000,000 - 66,667 = Rs. 7,933,333
  Rental = 7,933,333 × 0.015 = Rs. 119,000
  Unit Purchase = 66,667
  Total Payment = Rs. 185,667

...Total payment decreases every month as bank share reduces
```

### Key Insight
Unlike conventional mortgage (fixed payment, interest front-loaded),
Diminishing Musharakah total payment DECREASES over time.

---

## 4. ZAKAT CALCULATIONS

### Nisab (Minimum Threshold) — May 2026
```
Gold Nisab:    87.48 grams of gold
Silver Nisab:  612.36 grams of silver

PKR Equivalent (verify monthly — gold/silver prices change):
  Gold Nisab ≈  Rs. 1,400,000 - 1,600,000 (approx, check current gold rate)
  Silver Nisab ≈ Rs. 100,000 - 130,000 (approx, check current silver rate)

RULING: Use SILVER nisab for most assets (more conservative, helps more poor)
        Use GOLD nisab for gold/jewelry specifically
```

### Zakat Rate
```
Zakat Rate = 2.5% on all Zakatable assets held for 1 full lunar year (Hawl)
```

### Zakatable Assets
```
✅ Cash (savings above nisab)
✅ Bank deposits (current + savings accounts)
✅ Gold and silver (above nisab)
✅ Stocks / shares (market value)
✅ Business inventory (stock for sale)
✅ Rental income received
✅ Agricultural produce (different rate — see below)
✅ Receivables likely to be collected

❌ Primary home (not zakatable)
❌ Personal car for own use
❌ Household furniture / appliances
❌ Clothes and personal items
❌ Tools of trade (used for work, not for sale)
```

### Zakat on Cash / Savings
```
Formula: Zakat = Total Savings × 2.5%

Example:
  Savings Account Balance: Rs.   800,000
  Current Account:         Rs.   200,000
  Cash at Home:            Rs.    50,000
  Total Cash Assets:       Rs. 1,050,000

  Above Silver Nisab? Yes (Rs.1,050,000 > ~Rs.120,000 silver nisab)
  Held for full year? Yes

  Zakat = 1,050,000 × 2.5% = Rs. 26,250
```

### Zakat on Gold
```
Formula: Zakat = (Weight in grams × Current gold rate per gram) × 2.5%

Example:
  Gold owned:         200 grams
  Gold rate (24K):    Rs. 18,000/gram (verify current rate)
  Gold value:         200 × 18,000 = Rs. 3,600,000
  Above nisab? Yes

  Zakat = 3,600,000 × 2.5% = Rs. 90,000
```

### Zakat on Business / Inventory
```
Formula: Zakat = (Inventory value + Cash + Receivables - Payables) × 2.5%

Example (Small Shop):
  Stock for sale:       Rs. 500,000
  Cash in hand/bank:    Rs. 150,000
  Customers owe me:     Rs.  80,000
  I owe suppliers:     -Rs. 120,000
  Net Zakatable:        Rs. 610,000

  Zakat = 610,000 × 2.5% = Rs. 15,250
```

### Zakat on Stocks / Shares
```
Two scholarly opinions:

Opinion 1 (Conservative):
  Zakat on full market value × 2.5%

Opinion 2 (Common in Pakistan):
  Calculate Zakatable assets per share:
  = (Company's cash + inventory + receivables) per share × shares owned × 2.5%

Simple approach (widely used):
  Zakat = Current market value of shares × 2.5%
```

### Agricultural Zakat (Ushr)
```
Rain-fed crops:   10% of produce (at harvest)
Irrigated crops:   5% of produce (at harvest)
Nisab: Minimum 653 kg of crop
```

---

## 5. PROFIT RATE COMPARISON CALCULATIONS

### Effective Annual Rate (EAR) — For Comparison
```
EAR = (1 + Nominal Rate/n)^n - 1
Where n = number of compounding periods per year

Note: Islamic banking uses simple profit (not compound)
This calculation is for comparing with conventional bank rates
```

### Total Cost of Financing Comparison
```
Total Cost = Principal + Total Profit Paid

Murabaha (simple):
  Rs. 3,000,000 at 18% for 3 years
  Total profit = 3,000,000 × 0.18 × 3 = Rs. 1,620,000
  Total cost   = Rs. 4,620,000

Conventional (compound/reducing balance):
  Rs. 3,000,000 at 18% for 3 years
  EMI ≈ Rs. 108,500/month (reducing balance)
  Total paid   ≈ Rs. 3,906,000
  Total markup ≈ Rs.   906,000

Key: Murabaha on flat rate vs conventional on reducing balance
     Always compare APR (Annual Percentage Rate) for fair comparison
```

---

## 6. SUKUK YIELD CALCULATION

### Basic Sukuk Yield
```
Current Yield = (Annual Rental / Certificate Price) × 100

Example:
  GOP Ijara Sukuk face value:  Rs. 100,000
  Annual rental payment:       Rs.  15,000
  Current market price:        Rs.  98,000

  Current Yield = (15,000 / 98,000) × 100 = 15.31%
```

---

## 7. TAKAFUL CONTRIBUTION CALCULATION

### Wakala Model
```
Total Contribution = Tabarru (Donation) + Wakala Fee

Tabarru = Risk contribution (goes to common pool)
Wakala Fee = Operator's management fee (typically 20-30% of total contribution)

Example — Vehicle Takaful:
  Vehicle value:      Rs. 3,000,000
  Annual contribution: Rs. 90,000
  Wakala fee (25%):   Rs. 22,500
  Tabarru:            Rs. 67,500 (goes to risk pool)
```

---

## Useful Constants & Benchmarks (Pakistan — May 2026)

```
SBP Policy Rate:              ~18-22% (check sbp.org.pk)
KIBOR 6-month:                ~17-19% (check sbp.org.pk)
Gold Rate (24K/gram):         ~Rs. 17,000-19,000 (check bullion market)
Silver Rate (per gram):       ~Rs. 200-230 (check bullion market)
USD/PKR:                      ~Rs. 280-290 (check SBP)
Silver Nisab (PKR approx):    ~Rs. 120,000-140,000
Gold Nisab (PKR approx):      ~Rs. 1,400,000-1,600,000

IMPORTANT: Always verify current rates before quoting to customers.
           These figures change frequently.
```
