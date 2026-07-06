// Islamic Banking FTE — Deterministic Calculator Functions (TRANSPARENT)
// Every calculation shows: Formula → Inputs → Steps → Result → Sources
// These functions compute financial results in code, NOT via LLM.

/**
 * Build transparent calculation steps for Zakat
 * @param {number} totalAssets - Total zakatable assets in PKR
 * @param {object} nisab - Nisab values { gold_pkr, silver_pkr }
 * @returns {{ steps: Array, result: object, warnings: string[], sources: string[] }}
 */
export function calculateZakatTransparent(totalAssets, nisab = {}) {
  const steps = [];
  const warnings = [];
  const sources = [];
  const rate = 0.025;

  const goldNisab = nisab.gold_pkr || 1870000;
  const silverNisab = nisab.silver_pkr || 171360;
  const nisabDate = nisab.date || new Date().toISOString().split("T")[0];

  // Step 1: Asset Classification
  steps.push({
    step: 1,
    title: "Total Qualifying Wealth",
    formula: "Total Zakatable Assets = Sum of all qualifying assets",
    inputs: { total_assets: totalAssets },
    output: `PKR ${totalAssets.toLocaleString()}`,
    notes: ["Only qualifying assets are included (cash, savings, gold, business stock, investments)", "Personal items like house, car, furniture are EXCLUDED"],
  });

  // Step 2: Nisab Check
  steps.push({
    step: 2,
    title: "Nisab Threshold Check",
    formula: "If Wealth >= Nisab → Zakat is obligatory",
    inputs: {
      gold_nisab: `PKR ${goldNisab.toLocaleString()} (87.48g × rate)`,
      silver_nisab: `PKR ${silverNisab.toLocaleString()} (612.36g × rate)`,
      your_wealth: `PKR ${totalAssets.toLocaleString()}`,
    },
    output: totalAssets >= silverNisab ? "✅ EXCEEDS NISAB — Zakat is obligatory" : "❌ BELOW NISAB — No Zakat obligation",
    notes: [`Silver Nisab used (more conservative — benefits the poor)`, `Nisab values as of: ${nisabDate}`],
  });

  // Step 3: Zakat Calculation
  if (totalAssets >= silverNisab) {
    const zakatDue = Math.round(totalAssets * rate * 100) / 100;
    steps.push({
      step: 3,
      title: "Zakat Calculation",
      formula: "Zakat = Total Wealth × 2.5%",
      inputs: {
        total_wealth: totalAssets,
        rate: "2.5%",
        calculation: `${totalAssets.toLocaleString()} × 0.025`,
      },
      output: `PKR ${zakatDue.toLocaleString()}`,
      notes: ["2.5% is the fixed Zakat rate on wealth (not income)"],
    });

    sources.push(`Nisab values as of: ${nisabDate}`);
    sources.push("Rate: 2.5% fixed (Quran 9:60, Hadith)");

    return {
      calculation_type: "zakat",
      steps,
      result: {
        zakatDue,
        isZakatable: true,
        rate,
        totalAssets,
      },
      warnings,
      sources,
      currency: "PKR",
    };
  } else {
    steps.push({
      step: 3,
      title: "No Zakat Due",
      formula: "Wealth < Nisab → No Zakat obligation",
      inputs: {
        your_wealth: totalAssets,
        nisab: silverNisab,
        shortfall: silverNisab - totalAssets,
      },
      output: "PKR 0 (No Zakat due)",
      notes: ["Zakat becomes obligatory once wealth reaches Nisab"],
    });

    return {
      calculation_type: "zakat",
      steps,
      result: { zakatDue: 0, isZakatable: false, rate, totalAssets },
      warnings: ["Your wealth is below Nisab threshold — no Zakat obligation this year"],
      sources: [`Nisab values as of: ${nisabDate}`],
      currency: "PKR",
    };
  }
}

/**
 * Build transparent calculation steps for Murabaha
 * @param {number} costPrice - Asset cost in PKR
 * @param {number} profitRate - Annual profit rate (e.g., 0.18 for 18%)
 * @param {number} years - Tenure in years
 * @param {object} options - Optional: { downPayment, kiborRate, bankName }
 * @returns {{ steps: Array, result: object, warnings: string[], sources: string[] }}
 */
export function calculateMurabahaTransparent(costPrice, profitRate, years, options = {}) {
  const steps = [];
  const warnings = [];
  const sources = [];
  const months = years * 12;
  const downPayment = options.downPayment || 0;
  const kiborRate = options.kiborRate;
  const bankName = options.bankName || "General";

  // Step 1: Asset Cost Disclosure (Shariah requirement)
  steps.push({
    step: 1,
    title: "Asset Cost Disclosure",
    formula: "In Murabaha, the actual cost MUST be disclosed to the buyer",
    inputs: { asset_cost: costPrice },
    output: `PKR ${costPrice.toLocaleString()}`,
    notes: ["Shariah requirement: Cost cannot be hidden or estimated", "This is what makes Murabaha different from interest-based loans"],
  });

  // Step 2: Profit Margin Calculation
  const profit = Math.round(costPrice * profitRate * years * 100) / 100;
  const sellingPrice = costPrice + profit;
  steps.push({
    step: 2,
    title: "Profit Margin Calculation",
    formula: "Profit = Cost Price × Profit Rate × Tenure",
    inputs: {
      cost_price: costPrice,
      profit_rate: `${(profitRate * 100).toFixed(1)}% per annum`,
      tenure: `${years} years (${months} months)`,
    },
    output: `Profit: PKR ${profit.toLocaleString()} | Selling Price: PKR ${sellingPrice.toLocaleString()}`,
    notes: ["This is profit on a sale, NOT interest on a loan — structurally different"],
  });

  // Step 3: Down Payment Adjustment
  let financedAmount = sellingPrice;
  if (downPayment > 0) {
    financedAmount = sellingPrice - downPayment;
    steps.push({
      step: 3,
      title: "Down Payment Adjustment",
      formula: "Financed Amount = Selling Price - Down Payment",
      inputs: { selling_price: sellingPrice, down_payment: downPayment },
      output: `PKR ${financedAmount.toLocaleString()}`,
      notes: ["Higher down payment = lower total profit paid"],
    });
  } else {
    steps.push({
      step: 3,
      title: "No Down Payment",
      formula: "Financed Amount = Selling Price",
      inputs: { selling_price: sellingPrice },
      output: `PKR ${financedAmount.toLocaleString()}`,
    });
  }

  // Step 4: Monthly Installment
  const monthlyPayment = Math.round((financedAmount / months) * 100) / 100;
  steps.push({
    step: 4,
    title: "Monthly Installment",
    formula: "Monthly Payment = Financed Amount ÷ Total Months",
    inputs: { financed_amount: financedAmount, total_months: months },
    output: `PKR ${monthlyPayment.toLocaleString()} per month`,
    notes: ["Murabaha installments are usually equal (flat rate)"],
  });

  // Step 5: Effective Rate Analysis (if KIBOR provided)
  if (kiborRate) {
    const effectiveRate = kiborRate + (profitRate * 100);
    steps.push({
      step: 5,
      title: "Effective Profit Rate",
      formula: "Effective Rate = KIBOR + Bank Margin",
      inputs: {
        kibor: `${kiborRate}%`,
        margin: `${(profitRate * 100).toFixed(1)}%`,
      },
      output: `Effective Rate: ${effectiveRate.toFixed(1)}%`,
      notes: ["KIBOR = Karachi Interbank Offered Rate", "Rate may vary during tenure"],
    });
    sources.push(`KIBOR rate: ${kiborRate}% (reference date)`);
  }

  // Step 6: Total Payment Summary
  const totalPayment = downPayment + (monthlyPayment * months);
  const totalProfit = totalPayment - costPrice;
  steps.push({
    step: steps.length + 1,
    title: "Payment Summary",
    formula: "Total Payment = Down Payment + (Monthly × Months)\nTotal Profit = Total Payment - Original Cost",
    inputs: {
      down_payment: downPayment,
      monthly_payment: monthlyPayment,
      months,
      original_cost: costPrice,
    },
    output: {
      total_payment: `PKR ${totalPayment.toLocaleString()}`,
      total_profit: `PKR ${totalProfit.toLocaleString()}`,
      profit_percent: `${((totalProfit / costPrice) * 100).toFixed(1)}% of cost`,
    },
    notes: ["Total profit includes time value — this is the price of deferred payment"],
  });

  warnings.push("This is an estimate — actual rates may vary by bank and customer profile");
  warnings.push("KIBOR-linked rates can change during the tenure");
  warnings.push("Processing fees may apply (must be actual service charges, not disguised profit)");

  sources.push(`Bank: ${bankName}`);
  sources.push("Profit rate: As quoted by bank (verify current rate)");

  return {
    calculation_type: "murabaha",
    steps,
    result: {
      costPrice,
      profit,
      sellingPrice,
      monthlyPayment,
      totalPayment,
      totalProfit,
      months,
    },
    warnings,
    sources,
    currency: "PKR",
  };
}

/**
 * Build transparent calculation steps for Ijara rental
 * @param {number} assetValue - Asset value in PKR
 * @param {number} annualRate - Annual rental rate (e.g., 0.18 for 18%)
 * @returns {{ steps: Array, result: object, warnings: string[], sources: string[] }}
 */
export function calculateIjaraTransparent(assetValue, annualRate) {
  const steps = [];
  const warnings = [];
  const sources = [];

  // Step 1: Asset Value
  steps.push({
    step: 1,
    title: "Asset Value (Bank's Investment)",
    formula: "Asset Value = Cost of the asset leased to customer",
    inputs: { asset_value: assetValue },
    output: `PKR ${assetValue.toLocaleString()}`,
    notes: ["In Ijara, the bank owns the asset and leases it to the customer"],
  });

  // Step 2: Annual Rental Calculation
  const annualRental = Math.round(assetValue * annualRate * 100) / 100;
  steps.push({
    step: 2,
    title: "Annual Rental Calculation",
    formula: "Annual Rental = Asset Value × Annual Rental Rate",
    inputs: {
      asset_value: assetValue,
      annual_rate: `${(annualRate * 100).toFixed(1)}%`,
    },
    output: `PKR ${annualRental.toLocaleString()} per year`,
    notes: ["Rental is based on the bank's investment, not the loan amount"],
  });

  // Step 3: Monthly Rental
  const monthlyRental = Math.round(annualRental / 12 * 100) / 100;
  steps.push({
    step: 3,
    title: "Monthly Rental",
    formula: "Monthly Rental = Annual Rental ÷ 12",
    inputs: { annual_rental: annualRental },
    output: `PKR ${monthlyRental.toLocaleString()} per month`,
    notes: ["Monthly rental is typically fixed during the lease period"],
  });

  warnings.push("This is an estimate — actual rates may vary by bank");
  warnings.push("Rental may be linked to KIBOR and can change periodically");

  sources.push("Rate: As quoted by bank (verify current rate)");

  return {
    calculation_type: "ijara",
    steps,
    result: {
      assetValue,
      annualRental,
      monthlyRental,
      annualRate,
    },
    warnings,
    sources,
    currency: "PKR",
  };
}

/**
 * Build transparent calculation steps for Diminishing Musharakah
 * @param {number} propertyValue - Total property value in PKR
 * @param {number} customerShare - Customer's initial share in PKR
 * @param {number} annualRate - Annual rental rate (e.g., 0.18 for 18%)
 * @param {number} monthlyUnitPurchase - Fixed monthly unit purchase amount in PKR
 * @returns {{ steps: Array, result: object, warnings: string[], sources: string[] }}
 */
export function calculateDiminishingMusharakahTransparent(propertyValue, customerShare, annualRate, monthlyUnitPurchase) {
  const steps = [];
  const warnings = [];
  const sources = [];

  const bankShare = propertyValue - customerShare;
  const monthlyRate = annualRate / 12;
  const month1Rental = Math.round(bankShare * monthlyRate * 100) / 100;
  const month1Total = Math.round((month1Rental + monthlyUnitPurchase) * 100) / 100;

  // Step 1: Property Value & Shares
  steps.push({
    step: 1,
    title: "Property Value & Ownership Shares",
    formula: "Bank Share = Property Value - Customer Share",
    inputs: {
      property_value: propertyValue,
      customer_share: customerShare,
    },
    output: {
      bank_share: `PKR ${bankShare.toLocaleString()} (${((bankShare / propertyValue) * 100).toFixed(1)}%)`,
      customer_share: `PKR ${customerShare.toLocaleString()} (${((customerShare / propertyValue) * 100).toFixed(1)}%)`,
    },
    notes: ["Diminishing Musharakah: Joint ownership between bank and customer", "Customer gradually buys bank's share over time"],
  });

  // Step 2: Rental on Bank's Share
  steps.push({
    step: 2,
    title: "Rental on Bank's Share",
    formula: "Monthly Rental = Bank's Share × (Annual Rate ÷ 12)",
    inputs: {
      bank_share: bankShare,
      annual_rate: `${(annualRate * 100).toFixed(1)}%`,
    },
    output: `PKR ${month1Rental.toLocaleString()} per month (Month 1)`,
    notes: ["Rental decreases as customer buys more units from bank"],
  });

  // Step 3: Unit Purchase
  steps.push({
    step: 3,
    title: "Monthly Unit Purchase",
    formula: "Customer buys a fixed portion of bank's share each month",
    inputs: { monthly_unit_purchase: monthlyUnitPurchase },
    output: `PKR ${monthlyUnitPurchase.toLocaleString()} per month`,
    notes: ["As units are purchased, bank's share decreases, so rental also decreases"],
  });

  // Step 4: Total Monthly Payment
  steps.push({
    step: 4,
    title: "Total Monthly Payment (Month 1)",
    formula: "Total = Rental + Unit Purchase",
    inputs: { rental: month1Rental, unit_purchase: monthlyUnitPurchase },
    output: `PKR ${month1Total.toLocaleString()} per month`,
    notes: ["This amount decreases each month as rental reduces"],
  });

  warnings.push("Rental decreases monthly as bank's share reduces");
  warnings.push("This is an estimate — actual rates may vary by bank");
  warnings.push("Property maintenance, taxes, and insurance are additional");

  sources.push("Rate: As quoted by bank (verify current rate)");

  return {
    calculation_type: "diminishing_musharakah",
    steps,
    result: {
      propertyValue,
      customerShare,
      bankShare,
      month1Rental,
      month1Total,
      monthlyUnitPurchase,
    },
    warnings,
    sources,
    currency: "PKR",
  };
}

/**
 * Format transparent calculation for display
 * @param {object} calcResult - Result from any transparent calculator
 * @returns {string} Formatted text for display
 */
export function formatCalculation(calcResult) {
  const lines = [
    `📊 **${calcResult.calculation_type.toUpperCase()} CALCULATION**`,
    "━".repeat(50),
  ];

  for (const step of calcResult.steps) {
    lines.push(`\n**Step ${step.step}: ${step.title}**`);
    lines.push(`📋 Formula: ${step.formula}`);

    if (typeof step.inputs === "object") {
      lines.push("📥 Inputs:");
      for (const [key, value] of Object.entries(step.inputs)) {
        const formattedKey = key.replace(/_/g, " ");
        if (typeof value === "number") {
          lines.push(`   • ${formattedKey}: PKR ${value.toLocaleString()}`);
        } else {
          lines.push(`   • ${formattedKey}: ${value}`);
        }
      }
    }

    if (typeof step.output === "object" && !Array.isArray(step.output)) {
      lines.push("📤 Result:");
      for (const [key, value] of Object.entries(step.output)) {
        const formattedKey = key.replace(/_/g, " ");
        lines.push(`   • ${formattedKey}: ${value}`);
      }
    } else {
      lines.push(`📤 Result: ${step.output}`);
    }

    if (step.notes && step.notes.length > 0) {
      for (const note of step.notes) {
        lines.push(`   📝 ${note}`);
      }
    }
  }

  lines.push("\n" + "━".repeat(50));

  if (calcResult.warnings && calcResult.warnings.length > 0) {
    lines.push("\n⚠️ **Warnings:**");
    for (const warning of calcResult.warnings) {
      lines.push(`  • ${warning}`);
    }
  }

  if (calcResult.sources && calcResult.sources.length > 0) {
    lines.push("\n📚 **Data Sources:**");
    for (const source of calcResult.sources) {
      lines.push(`  • ${source}`);
    }
  }

  lines.push(`\n📅 Calculation Date: ${new Date().toISOString().split("T")[0]}`);

  return lines.join("\n");
}

/**
 * Build pre-computed calculation block for system prompt injection
 * NOW WITH FULL TRANSPARENCY
 * @param {string} userMessage - Original user message
 * @param {object} liveNisab - Live nisab values
 * @returns {string} Calculation block to inject into prompt
 */
export function buildCalculationBlock(userMessage, liveNisab) {
  const msg = userMessage.toLowerCase();
  let block = "";

  // Zakat on generic savings
  if (msg.includes("zakat") && msg.includes("lakh")) {
    const match = msg.match(/(\d+(?:\.\d+)?)\s*lakh/);
    if (match) {
      const amount = parseFloat(match[1]) * 100000;
      const nisab = {
        gold_pkr: liveNisab?.nisab_gold_pkr || 1870000,
        silver_pkr: liveNisab?.nisab_silver_pkr || 171360,
        date: liveNisab?.updated || new Date().toISOString().split("T")[0],
      };
      const result = calculateZakatTransparent(amount, nisab);
      block += `\n\n---\n\n## PRE-COMPUTED ZAKAT RESULT (USE THIS EXACT NUMBER)\n`;
      block += formatCalculation(result);
      block += `\n\nIMPORTANT: Use this pre-computed result. Do NOT recalculate.`;
    }
  }

  // Zakat on specific PKR amount
  if (msg.includes("zakat") && msg.includes("pkr")) {
    const match = msg.match(/pkr?\s*([\d,]+)/i);
    if (match) {
      const amount = parseInt(match[1].replace(/,/g, ""));
      const nisab = {
        gold_pkr: liveNisab?.nisab_gold_pkr || 1870000,
        silver_pkr: liveNisab?.nisab_silver_pkr || 171360,
        date: liveNisab?.updated || new Date().toISOString().split("T")[0],
      };
      const result = calculateZakatTransparent(amount, nisab);
      block += `\n\n---\n\n## PRE-COMPUTED ZAKAT RESULT (USE THIS EXACT NUMBER)\n`;
      block += formatCalculation(result);
      block += `\n\nIMPORTANT: Use this pre-computed result. Do NOT recalculate.`;
    }
  }

  // Murabaha calculation
  if (msg.includes("murabaha") && (msg.includes("calculate") || msg.includes("kitna") || msg.includes("monthly"))) {
    const costMatch = msg.match(/(?:cost|price|amount|qimat)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac)/i);
    const rateMatch = msg.match(/(\d+(?:\.\d+)?)\s*%/);
    const yearMatch = msg.match(/(\d+)\s*(?:year|saal|sal)/i);

    if (costMatch && rateMatch && yearMatch) {
      const cost = parseFloat(costMatch[1]) * 100000;
      const rate = parseFloat(rateMatch[1]) / 100;
      const years = parseInt(yearMatch[1]);
      const result = calculateMurabahaTransparent(cost, rate, years);
      block += `\n\n---\n\n## PRE-COMPUTED MURABHAHA RESULT (USE THIS EXACT NUMBER)\n`;
      block += formatCalculation(result);
      block += `\n\nIMPORTANT: Use this pre-computed result. Do NOT recalculate.`;
    }
  }

  return block;
}
