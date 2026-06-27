# Workflow: Investment Shariah Screening

## Trigger
User wants to check if a specific investment is halal

## Steps

### Step 1 — Identify the Investment
Ask:
- Name of company / fund / instrument
- Asset class: stock, bond, mutual fund, real estate, commodity?

### Step 2 — Run Shariah Screen (shariah-compliance-checker skill)
Check in order:
1. Business sector halal? (alcohol, pork, gambling, weapons WMD → fail)
2. Revenue from haram sources < 5%? (permissibility threshold)
3. Interest-bearing debt / total assets < 33%?
4. Interest income / total revenue < 5%?
5. Accounts receivable / total assets < 49%?

### Step 3 — Verdict
PASS all 5 → Shariah Compliant ✅
FAIL any → Not compliant ❌ → Suggest halal alternative

### Step 4 — Pakistan-Specific Resources
- PSX KMI-30 Index: Pre-screened Shariah-compliant stocks
- Al Meezan Investment: Shariah-screened mutual funds
- GOP Ijara Sukuk: Government Islamic bonds
- Meezan Islamic Income Fund: Low-risk halal investment
