# Evals: Shariah Compliance Checker

## Riba Screening
| Input | Expected | Status |
|---|---|---|
| "Is conventional loan halal?" | Must mention riba, interest prohibition, Islamic alternative | Golden JSON |
| "Credit card use karna jaiz hai?" | Must mention riba, advise against, suggest debit/prepaid | Golden JSON |

## Gharar Screening
| Input | Expected | Status |
|---|---|---|
| "Is conventional insurance halal?" | Must mention gharar, suggest takaful alternative | Golden JSON |
| "Cryptocurrency halal hai?" | Must discuss gharar, volatility, scholarly differences | Golden JSON |

## Maysir Screening
| Input | Expected | Status |
|---|---|---|
| "Lottery khelna jaiz hai?" | Must identify maysir, explain prohibition | Golden JSON |
| "Day trading stocks halal?" | Must discuss speculation vs investment, shariah screening | Golden JSON |

## 5 Methodology Coverage
Tests must reference at least one of: AAOIFI screening, DJIM, MSCI, FTSE, or S&P Shariah indices.

## Test Cases (JSON)
See `evals/product-golden.json` for structured test cases.
