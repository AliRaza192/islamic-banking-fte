# Evals: Calculator Tests

## Murabaha Calculator
| Input | Expected Output | Status |
|---|---|---|
| PKR 1,000,000 at 15% for 5 years | Total profit: PKR 750,000; Monthly: PKR 29,167 | Golden JSON |
| PKR 500,000 at 12% for 3 years | Total profit: PKR 180,000; Monthly: PKR 18,889 | Golden JSON |

## Zakat Calculator
| Input | Expected Output | Status |
|---|---|---|
| Savings PKR 800,000, Gold 10 tola | Zakat on savings + gold above nisab | Golden JSON |
| Below nisab threshold | No zakat due | Golden JSON |

## Ijara Calculator
| Input | Expected Output | Status |
|---|---|---|
| PKR 2,000,000 property, 10% rental, 15 years | Monthly rental schedule | Golden JSON |

## Test Cases (JSON)
See `evals/product-golden.json` for structured test cases with `must_contain` and `must_not_contain` assertions.
