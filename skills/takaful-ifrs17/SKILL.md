---
name: takaful-ifrs17
description: >
  Expert in Takaful (Islamic insurance) accounting under IFRS 17 and AAOIFI
  FAS 12/19. Covers Wakala, Mudarabah, and Hybrid models, IFRS 17 measurement
  models (GMM, VFA, PAA), tabarru accounting, operator vs participant fund
  separation, qard hasan, surplus/deficit treatment, and Pakistani Takaful
  operator reporting. Triggers on: takaful accounting, takaful IFRS17, takaful
  operator, takaful contracts, wakala model accounting, tabarru accounting,
  takaful surplus, takaful qard hasan, takaful financial statements, takaful
  GMM, takaful VFA, takaful PAA, Islamic insurance accounting.
metadata:
  version: "1.0"
  author: "Islamic Banking FTE"
  standard: "IFRS 17, AAOIFI FAS 12/19"
allowed_tools: Read, Write
version: 1.0.0
---

# Takaful IFRS 17 Skill

## GOVERNING FRAMEWORK

Every Takaful IFRS 17 response MUST begin with:
```
GOVERNING FRAMEWORK: IFRS 17 / AAOIFI FAS 12 — [Jurisdiction]
PRODUCT: Takaful
JURISDICTION: [Country — Regulator]
```

## IFRS 17 + Takaful Reference

### The Fundamental Question: Who is the "Insurer" under IFRS 17?

In Takaful, the operator does NOT bear insurance risk (unlike conventional insurer).
The participants' fund bears the risk. This creates a classification challenge:

**Option A:** Operator is the "insurer" → applies IFRS 17 to operator's books
**Option B:** Participants' fund is the "insurer" → IFRS 17 applies to fund

Most jurisdictions (including Malaysia BNM) require the OPERATOR to apply IFRS 17.

### Three Takaful Models

**1. Wakala Model (Most Common in Pakistan):**
- Operator is wakeel (agent) managing the participants' fund
- Operator charges fixed wakala fee (management fee)
- Operator does NOT share in underwriting results
- Surplus belongs to participants

**2. Mudarabah Model:**
- Operator is mudarib (manager) sharing profits
- Profit sharing ratio agreed in advance
- Operator shares in investment returns AND underwriting surplus

**3. Hybrid Model (Wakala + Mudarabah):**
- Wakala fee for management
- Mudarabah share for investment returns
- Most common globally

### Takaful vs Conventional Insurance (Accounting)

| Feature | Takaful | Conventional Insurance |
|---|---|---|
| Risk bearer | Participants' fund | Insurance company |
| Surplus | Belongs to participants | Belongs to shareholders |
| Deficit | Qard Hasan (interest-free loan) | Company's obligation |
| Investment | Shariah-compliant only | Any investment |
| Contract | Tabarru (donation) + Wakala | Insurance contract |
| Accounting | IFRS 17 (modified) | IFRS 17 |

### IFRS 17 Measurement Models

**1. GMM (General Measurement Model):**
- Default model for long-term family Takaful
- CSM (Contractual Service Margin) = unearned profit
- Losses recognized immediately
- Most complex but most accurate

**2. VFA (Variable Fee Approach):**
- For direct-participation contracts (common in family Takaful)
- CSM adjusts for changes in financial assumptions
- Simpler than GMM for unit-linked products

**3. PAA (Premium Allocation Approach):**
- Simplified model for short-term general Takaful (≤12 months)
- Similar to current premium-based accounting
- Most Pakistani general Takaful uses PAA

### Tabarru Accounting (Donation Element)

The tabarru (donation) component is the Shariah foundation of Takaful:

**Participant pays contribution = Tabarru (donation to risk pool) + Wakala fee**

**At Contribution:**
Dr: Cash [Total contribution]
Cr: Takaful Revenue — Tabarru [Tabarru portion]
Cr: Takaful Revenue — Wakala Fee [Operator's fee]

**Claims Paid from Pool:**
Dr: Takaful Claims Expense [Claim amount]
Cr: Cash / Payable [Claim amount]

### Surplus/Deficit Treatment

**Surplus (Pool has more than needed):**
- Belongs to participants (NOT operator)
- Can be: returned to participants, carried forward, or used to reduce future contributions
- Accounting: Dr Participants' Fund Surplus, Cr Participants' Equity

**Deficit (Pool cannot meet claims):**
- Qard Hasan (interest-free loan) from operator/shareholders
- Operator provides interest-free loan to cover deficit
- Repaid from future surplus
- Accounting: Dr Qard Hasan Receivable, Cr Cash

### Pakistani Takaful Operators

| Company | Type | Takaful Model |
|---|---|---|
| Pak-Qatar Family Takaful | Dedicated | Wakala |
| Pak-Qatar General Takaful | Dedicated | Wakala |
| EFU Life (Takaful window) | Window | Hybrid |
| Jubilee Life (Takaful window) | Window | Hybrid |
| Salaam Takaful | Dedicated | Wakala |

### Income Labels by Jurisdiction
- Pakistan: "Takaful Contribution Revenue" / "Wakala Fee Income"
- UAE: "Takaful Contribution Revenue" / "Wakala Fee Income"
- Saudi Arabia: "Takaful Contribution Revenue"
- Malaysia: "Takaful Contribution Revenue" / "Operator's Fee Income"
- Bahrain: "Takaful Contribution Revenue"
- NEVER: "Premium Income" or "Insurance Revenue"

## When to Activate
- User asks about Takaful accounting or financial statements
- User mentions IFRS 17 and Takaful together
- User asks about Takaful operator accounting
- User asks about wakala model, tabarru accounting, surplus/deficit
- User asks about Takaful contribution recognition
- User asks about qard hasan in Takaful context

## Step-by-Step Workflow

### For Explanation Requests:
1. Explain Takaful in simple terms (mutual insurance)
2. Describe the wakala model (most common in Pakistan)
3. Explain how contributions are split (tabarru + wakala fee)
4. Explain surplus belongs to participants
5. Mention Pakistani operators

### For Accounting/IFRS 17 Requests:
**Step 1 — Identify Takaful type** (general/life, model type)
**Step 2 — Select measurement model** (PAA for general, GMM/VFA for family)
**Step 3 — Show journal entries** for contributions, claims, surplus/deficit
**Step 4 — Show financial statement presentation**

## Output Format

```
Takaful Accounting — [Type]

Model:           [Wakala / Mudarabah / Hybrid]
Measurement:     [PAA / GMM / VFA]
Operator:        [Name]

Contribution Split:
  Total Contribution:   Rs. X,XXX
  Tabarru (Risk Pool):  Rs. X,XXX (XX%)
  Wakala Fee (Operator): Rs. X,XXX (XX%)

Accounting Entries:
  At Contribution:
    Dr Cash                          Rs. X,XXX
    Cr Takaful Revenue — Tabarru     Rs. X,XXX
    Cr Takaful Revenue — Wakala Fee  Rs. X,XXX

  At Claim:
    Dr Takaful Claims Expense        Rs. X,XXX
    Cr Cash                          Rs. X,XXX

  Surplus Treatment:
    Surplus belongs to participants
    Dr Participants' Fund Surplus    Rs. X,XXX
    Cr Participants' Equity          Rs. X,XXX

Financial Statements Required:
  1. Operator's own financial statements (IFRS 17)
  2. Participants' fund financial statements (separate)
```

## Common User Questions

**"Is Takaful really different from conventional insurance?"**
Yes — in Takaful, participants pool their money as a donation (tabarru). The operator is just a manager (wakeel), not a risk-bearer. Surplus belongs to participants. In conventional insurance, the company owns the premiums and bears the risk.

**"What is Qard Hasan in Takaful?"**
If the risk pool cannot cover claims, the operator provides an interest-free loan (Qard Hasan) to cover the deficit. This is a Shariah obligation — the operator must support the pool without charging interest.

**"Which Takaful operators are in Pakistan?"**
Pak-Qatar Family Takaful, Pak-Qatar General Takaful, Salaam Takaful, and Takaful windows at EFU Life and Jubilee Life. Check references/pakistan-banks.md for details.

**"Can I get vehicle Takaful?"**
Yes — Pak-Qatar General Takaful and others offer comprehensive vehicle Takaful. The contribution is split into tabarru (risk pool) and wakala fee (management charge). Claim process is similar to conventional motor insurance.
