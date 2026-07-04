# /if-journal

Generate jurisdiction-aware journal entries or amortisation/distribution schedules
for an Islamic finance transaction.

## Usage

/if-journal <product> <jurisdiction> <transaction-details>

## Examples

/if-journal murabaha pakistan "PKR 5,000,000 car Murabaha, 18 months, 15% profit rate"
/if-journal ijarah uae "AED 2,000,000 home Ijarah, 20 years, diminishing musharakah"
/if-journal sukuk-issuer bahrain "BHD 50M Sukuk issuance, 5-year wakala structure"
/if-journal musharaka-dm malaysia "MYR 1.5M Diminishing Musharakah, 25 years, 12%"

## Workflow

1. Route to the correct product skill via islamic-finance-router
2. Load the jurisdiction overlay from router references
3. Generate journal entries for all recognition events (initial, periodic, derecognition)
4. If the transaction spans multiple periods, produce the full amortisation/distribution schedule
5. Apply jurisdiction-specific labels and disclosure requirements
6. Flag any items requiring SSB review

## Supported Products

| Product | Journal Entry Events |
|---|---|
| Murabaha | Initial recognition, periodic profit accrual, sale completion, default |
| Ijarah | Initial recognition, periodic rental, maintenance, end-of-term transfer |
| Diminishing Musharakah | Initial recognition, monthly rental income, equity buy-out, final transfer |
| Sukuk Issuer | Issuance, periodic distribution, amortisation, maturity |
| Sukuk Investor | Acquisition, periodic income, amortisation, disposal |
| Salam | Advance payment, goods delivery, periodic recognition |
| Istisna'a | Milestone payments, construction progress, final delivery |

## Output Format

```
GOVERNING FRAMEWORK: [e.g., AAOIFI FAS 2 — Pakistan]
PRODUCT: [e.g., Murabaha]
JURISDICTION: [e.g., Pakistan — SBP regulated]

TRANSACTION SUMMARY:
[Key terms of the transaction]

JOURNAL ENTRIES:

[Event 1 — e.g., Initial Recognition]
Dr: [Account Name] [Amount]
Cr: [Account Name] [Amount]
Narration: [Description]

[Event 2 — e.g., Monthly Profit Accrual]
Dr: [Account Name] [Amount]
Cr: [Account Name] [Amount]
Narration: [Description]

[Continue for all events...]

AMORTISATION SCHEDULE (if multi-period):
| Period | Opening Balance | Profit/Income | Payment | Closing Balance |
|--------|----------------|---------------|---------|-----------------|
| 1      | [Amount]       | [Amount]      | [Amount]| [Amount]        |
| ...    | ...            | ...           | ...     | ...             |

DISCLOSURE NOTES:
[ jurisdiction-specific disclosures ]

⚠️ SSB REVIEW REQUIRED: [Yes/No — if yes, specify what needs review]
```

## Important Notes

- Journal entries MUST use jurisdiction-appropriate income labels
- NEVER use "Interest Income" — use "Murabaha Income", "Ijarah Rental Income", etc.
- For AAOIFI jurisdictions (Bahrain, Qatar): use AAOIFI FAS labels
- For IFRS jurisdictions (Pakistan, UAE, Saudi): use IFRS-compliant labels
- Always flag items requiring SSB review
