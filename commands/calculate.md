# /calculate — Halal Finance Calculator

## Usage
```
/calculate murabaha 3000000 18% 3years
/calculate zakat
/calculate ijara 5000000 20% 5years
/calculate musharakah 10000000 20% 80% 18% 10years
```

## Behavior
Activates `halal-calculator` skill with the provided parameters.
If parameters are missing, ask for them before calculating.
Always show calculation steps — never just a final number.
Always append Shariah note relevant to the product calculated.

## Quick Templates

**Murabaha:** Amount + Rate + Tenure → Monthly payment + Total payable
**Ijara:** Investment + Rate + Tenure → Month 1 rental + Rate note
**Musharakah:** Property + Customer% + Bank% + Rate + Tenure → Payment schedule
**Zakat:** (interactive) → Walks through each asset type
