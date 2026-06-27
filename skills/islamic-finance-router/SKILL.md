---
name: islamic-finance-router
description: >
  Routes Islamic banking queries to the correct product skill and jurisdiction
  overlay. Activate for any query involving Islamic banking, AAOIFI, Shariah-
  compliant finance, murabaha, ijarah, musharakah, mudarabah, sukuk, takaful,
  zakat, or Shariah screening. Covers Pakistan, UAE, Saudi Arabia, Malaysia,
  and Gulf markets.
metadata:
  version: "1.0"
  author: "Islamic Banking FTE"
  standard: "AAOIFI, IFSB, SBP, CBUAE, BNM"
---

## PURPOSE

This is the top-level routing controller for the Islamic Banking FTE.
It determines which product skill and which jurisdiction overlay to load
before generating any Islamic finance response.
It does NOT contain product rules itself. It routes to the files that do.

## ROUTING PROTOCOL — EXECUTE BEFORE ANY OUTPUT

### Step 1: Identify the Jurisdiction

Read the user query for jurisdiction signals:

- Country name (Pakistan, UAE, Saudi Arabia, Malaysia, Bahrain, etc.)
- Currency (PKR, AED, SAR, MYR)
- Regulator name (SBP, CBUAE, SAMA, BNM, CBB)
- Bank name (Meezan Bank → Pakistan, Emirates Islamic → UAE, Al Rajhi → Saudi)
- Standard reference (AAOIFI FAS, SBP guidelines, BNM policy)

**If no jurisdiction is identifiable: Default to Pakistan.**
Pakistan is the primary market for this FTE.

### Step 2: Identify the Product

Map query terms to product skills:

| Query Terms | Route To |
| --- | --- |
| murabaha, cost-plus, deferred sale, commodity murabaha, tawarruq, car loan halal | murabaha-specialist |
| ijarah, ijarah, lease, kiraya, rent-to-own, IMB | ijara-specialist |
| salam, forward sale, crop financing, advance payment, agricultural financing | salam-specialist |
| istisna, construction finance, manufacturing, home construction, milestone payment | istisna-a-specialist |
| sukuk issuance, issue sukuk, corporate sukuk, SPV, sukuk structure | sukuk-issuer |
| sukuk investment, buy sukuk, sukuk yield, GOP sukuk, Pakistan sukuk | sukuk-investor |
| takaful accounting, takaful IFRS17, takaful operator, wakala model | takaful-ifrs17 |
| full musharakah, permanent musharakah, running musharakah, SME partnership | musharaka-full |
| musharakah, mudarabah, partnership, profit sharing, diminishing musharakah | musharakah-mudarabah-specialist |
| sukuk, takaful, islamic insurance, halal insurance, islamic bond (generic) | sukuk-takaful-specialist |
| zakat, zakaat, nisab, purification, tithe | zakat-advisor |
| halal, haram, permissible, jaiz, shariah check, compliance, riba, gharar | shariah-compliance-checker |
| calculate, hisab, kitna, monthly payment, installment, qist | halal-calculator |
| what is, explain, kya hai, bataiye, samjhao | islamic-product-explainer |
| meezan, dubai islamic, bank islami, al baraka, faysal bank, sbp, pakistan | pakistan-banking-navigator |
| General banking questions | islamic-banking-advisor |

### Step 3: Load the Jurisdiction Overlay

| Jurisdiction | Load Overlay |
| --- | --- |
| Pakistan (default) | jurisdictions/pakistan-ifrs.md |
| UAE, Dubai, Abu Dhabi | jurisdictions/uae-ifrs.md |
| Saudi Arabia, KSA | jurisdictions/saudi-ifrs.md |
| Malaysia | jurisdictions/malaysia-mfrs.md |
| Bahrain | jurisdictions/bahrain-aaoifi.md |
| Kuwait | jurisdictions/kuwait-ifrs.md |
| Qatar | jurisdictions/qatar-aaoifi.md |
| Oman | jurisdictions/oman-ifrs.md |
| Turkey | jurisdictions/turkey-tfrs.md |
| Nigeria | jurisdictions/nigeria-ifrs.md |
| Indonesia | jurisdictions/indonesia-psak.md |
| United Kingdom, UK | jurisdictions/uk-ifrs.md |
| GCC Cross-Border | jurisdictions/gcc-crossborder.md |

### Step 4: Apply Rules in Order

1. Apply product skill rules first (explanation + calculation)
2. Apply jurisdiction overlay modifications (local banks, regulators, rates)
3. Confirm governing standard in response header before output

## UNIVERSAL RULES — APPLY IN ALL JURISDICTIONS

### Prohibited Terms — NEVER USE in any Islamic finance output

- "interest" → use "profit" or "profit rate"
- "loan" → use "financing" or "facility"
- "interest rate" → use "profit rate" or "effective profit rate"
- "lender" → use "financier" or "bank"
- "borrower" → use "customer" or "client"
- "coupon" → use "profit distribution" (for sukuk)
- "insurance" → use "takaful" (when referring to Islamic alternative)

### Mandatory Shariah Compliance Escalation

Flag for SSB review when:
- A new product structure not previously covered by an existing fatwa
- A transaction where Shariah structural requirements may not have been met
- Any transaction involving interest-based conventional instruments proposed as Islamic finance

### The Fundamental Limitation

This agent provides educational guidance and calculations. It does NOT make Shariah
compliance judgments. Shariah permissibility determinations are the exclusive
function of qualified Shariah scholars on the institution's SSB.

## RESPONSE FORMAT

Every Islamic finance response must begin with:

```
GOVERNING FRAMEWORK: [e.g., SBP Islamic Banking Guidelines — Pakistan]
PRODUCT: [e.g., Murabaha]
JURISDICTION: [e.g., Pakistan — SBP regulated]
```

## Jurisdiction Overlays

When a jurisdiction is identified, load the appropriate overlay:

- [Pakistan (SBP/IFRS)](references/jurisdictions/pakistan-ifrs.md)
- [UAE (CBUAE/IFRS)](references/jurisdictions/uae-ifrs.md)
- [Saudi Arabia (SAMA/IFRS)](references/jurisdictions/saudi-ifrs.md)
- [Malaysia (BNM/MFRS)](references/jurisdictions/malaysia-mfrs.md)
- [Bahrain (CBB/AAOIFI)](references/jurisdictions/bahrain-aaoifi.md)
- [Kuwait (CBK/IFRS)](references/jurisdictions/kuwait-ifrs.md)
