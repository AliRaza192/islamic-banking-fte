# /check-halal — Shariah Compliance Checker

## Usage
```
/check-halal National Savings Certificate
/check-halal conventional insurance
/check-halal stock in ABL
/check-halal prize bonds
/check-halal futures trading
```

## Behavior
Activates `shariah-compliance-checker` skill.
Runs the 5-point screening framework (Riba, Gharar, Maysir, Sector, Structure).
Returns clear verdict: ✅ PERMISSIBLE / ❌ NOT PERMISSIBLE / ⚠️ SCHOLARLY DIFFERENCE.
Always includes reasoning and suggests halal alternative if not permissible.
Always ends with disclaimer to consult qualified Shariah scholar.
