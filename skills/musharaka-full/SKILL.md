---
name: musharaka-full
description: >
  Expert in full Musharakah (partnership) per AAOIFI FAS 4. Covers permanent
  Musharakah, running Musharakah (working capital), profit/loss allocation
  mechanics, management fee vs profit share, revolving facility structures,
  exit mechanisms, and IFRS 11 joint control analysis. Distinguishes from
  diminishing Musharakah (musharaka-dm skill). Triggers on: full musharakah,
  permanent musharakah, running musharakah, musharakah partnership, SME
  partnership financing, working capital musharakah, musharakah joint venture,
  musharaka mutanaqisah full, shirkat al-amwal, musharaka revolving facility.
metadata:
  version: "1.0"
  author: "Islamic Banking FTE"
  standard: "AAOIFI FAS 4, IFRS 11, IFRS 9"
allowed_tools: Read, Write
version: 1.0.0
---

# Musharakah (Full Partnership) Skill

## GOVERNING FRAMEWORK

Every Musharakah response MUST begin with:
```
GOVERNING FRAMEWORK: AAOIFI FAS 4 — [Jurisdiction]
PRODUCT: Musharakah (Full Partnership)
JURISDICTION: [Country — Regulator]
```

## AAOIFI FAS 4 Reference

Musharakah is a partnership where all parties contribute capital and share
profits and losses. Unlike Diminishing Musharakah (where one partner gradually
buys out the other), Full Musharakah is a continuing partnership.

### Types of Musharakah

**1. Permanent Musharakah:**
- Long-term partnership with no predetermined exit
- Both partners contribute capital throughout
- Profits shared per agreement, losses STRICTLY per capital ratio
- Used for: Joint ventures, equity investments, long-term projects

**2. Running Musharakah (Working Capital):**
- Revolving partnership facility for working capital
- Bank and customer form partnership for business operations
- Profits shared per agreement (usually bank gets % of profit)
- Customer gradually repays bank's capital from business proceeds
- Used for: SME financing, trade financing, inventory purchases

**3. Diminishing Musharakah:**
- Separate skill: musharakah-mudarabah-specialist
- Bank and customer co-own asset; customer buys bank's share over time
- Used for: Home financing, car financing

### Shariah Rules
1. **All partners must contribute capital** — can be cash, assets, or labor (with restrictions)
2. **Profit ratio:** Can be ANY agreed ratio (e.g., 60:40, 70:30) — does NOT need to match capital ratio
3. **Loss ratio:** MUST be STRICTLY proportional to capital contribution — no exceptions
4. **Management:** All partners can manage, or management can be delegated to one partner
5. **Management fee:** A managing partner can receive a FIXED fee for management (this is NOT a profit share — it's an agreed compensation for work)
6. **No guaranteed return:** Cannot guarantee any partner's capital or profit

### Profit vs Loss Allocation

**Profits — Flexible:**
```
Example: Bank contributes 60% capital, Customer contributes 40%
Agreed profit split: Bank 40%, Customer 60%
This is PERMISSIBLE — profit ratio can differ from capital ratio
```

**Losses — Strictly Proportional:**
```
Same example:
If loss occurs: Bank bears 60% of loss, Customer bears 40%
This CANNOT be changed by agreement — Shariah requirement
```

### Running Musharakah (Working Capital Facility)

This is the most common full Musharakah product in Pakistani Islamic banking:

**Structure:**
1. Bank and customer form Musharakah partnership
2. Both contribute capital (bank: financing, customer: existing business capital)
3. Partnership purchases inventory/raw materials
4. Customer manages the business (may receive management fee)
5. Profits shared per agreed ratio
6. Customer repays bank's capital gradually from business proceeds
7. When bank's capital is fully repaid, Musharakah ends

**Revolving Nature:**
- As customer repays, bank's capital decreases
- Customer can request additional financing (new Musharakah tranche)
- Each tranche has its own profit-sharing ratio

### IFRS Analysis

**IFRS 11 — Joint Arrangements:**
- If joint control exists → Joint Venture (equity method) or Joint Operation (proportional consolidation)
- If no joint control → IFRS 9 financial asset

**SPPI Test:**
- Returns depend on venture profit → SPPI FAILS
- Cannot be classified at amortised cost
- Classification: FVTPL (most likely)

### Accounting (Bank's Books)

**At Formation:**
Dr: Musharakah Investment [Bank's capital contribution]
Cr: Cash [Amount contributed]

**Profit Recognition (Periodic):**
Dr: Cash / Receivable [Bank's share of profit]
Cr: Musharakah Profit Income [Bank's share]

**Loss Recognition:**
Dr: Musharakah Loss [Bank's share of loss]
Cr: Musharakah Investment [Reduce carrying amount]

**Capital Repayment (Running Musharakah):**
Dr: Cash [Amount repaid by customer]
Cr: Musharakah Investment [Reduce carrying amount]

### Income Labels by Jurisdiction
- Pakistan (SBP): "Profit from Musharakah Financing"
- UAE (CBUAE): "Profit from Musharakah Financing"
- Saudi Arabia (SAMA): "Profit from Musharakah Transactions"
- Malaysia (BNM): "Profit from Islamic Financing — Musharakah"
- Bahrain (CBB/AAOIFI): "Musharakah Income"
- NEVER: "Interest Income" or "Return on Partnership Lending"

## When to Activate
- User mentions "full musharakah" or "permanent musharakah"
- User asks about running Musharakah, working capital financing
- User asks about SME partnership financing
- User asks about musharakah joint venture
- User asks about profit/loss allocation in Islamic partnerships
- User asks about management fee vs profit share

## Step-by-Step Workflow

### For Explanation Requests:
1. Define Musharakah in simple terms (partnership)
2. Explain the difference between profit ratio (flexible) and loss ratio (strict)
3. Give relatable example (two people starting a shop together)
4. Explain running Musharakah for business financing
5. Mention Pakistani banks that offer it

### For Calculation Requests:
**Step 1 — Collect Inputs:**
- Bank's capital contribution
- Customer's capital contribution
- Agreed profit-sharing ratio
- Expected business profit
- Tenure (if applicable)

**Step 2 — Calculate:**
```
Total Capital        = Bank's share + Customer's share
Bank's Capital %     = Bank's share ÷ Total Capital × 100
Bank's Profit Share  = Total Profit × Agreed Bank Profit Ratio
Customer's Profit    = Total Profit - Bank's Profit Share

If Loss:
Bank's Loss Share    = Total Loss × Bank's Capital %
Customer's Loss      = Total Loss × Customer's Capital %
```

**Step 3 — Output:**
Show capital contribution, profit allocation, loss allocation, and Shariah rules.

## Output Format

```
Musharakah (Full Partnership) Structure

Bank's Contribution:      Rs. X,XXX,XXX (XX%)
Customer's Contribution:  Rs. X,XXX,XXX (XX%)
Total Capital:            Rs. X,XXX,XXX

Profit Sharing:
  Agreed Ratio: Bank XX% — Customer XX%
  Expected Annual Profit: Rs. X,XXX,XXX
  Bank's Profit:          Rs. X,XXX,XXX
  Customer's Profit:      Rs. X,XXX,XXX

Loss Allocation (Strict — per capital ratio):
  Bank's Loss Share:      XX% of any loss
  Customer's Loss Share:  XX% of any loss

Shariah Rules:
  Profit ratio: FLEXIBLE (can differ from capital ratio) ✓
  Loss ratio: STRICTLY proportional to capital ✓
  No guaranteed return: ✓
  Management fee allowed: Yes (fixed amount for managing partner)
```

## Common User Questions

**"What is the difference between Musharakah and a conventional partnership loan?"**
In a conventional loan, the bank lends money and charges fixed interest regardless of your business performance. In Musharakah, the bank becomes your partner — if the business profits, both share; if it loses, both bear the loss proportionally. There is no guaranteed return to the bank.

**"Can I get working capital financing through Musharakah?"**
Yes — this is called Running Musharakah. The bank contributes capital to your business, you manage it, and profits are shared. You gradually repay the bank's capital from business proceeds. This is halal because the bank shares the business risk.

**"Why can profit ratio differ from capital ratio?"**
Shariah allows flexible profit-sharing because profit is a return on both capital AND effort. If the customer manages the business, they can get a larger profit share than their capital ratio would suggest. But losses must always follow capital — this prevents exploitation.

**"Which banks offer Musharakah financing in Pakistan?"**
Meezan Bank, Bank Islami, Dubai Islamic Bank Pakistan, and others offer Musharakah-based working capital and trade financing. Check references/pakistan-banks.md for details.

**"What if my Musharakah business makes a loss?"**
The loss is shared between you and the bank in proportion to your capital contributions. You cannot be forced to bear more loss than your capital share. The bank cannot charge you interest on top of the loss — that would be riba.
