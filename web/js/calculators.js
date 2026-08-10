// =============================================
// Islamic Banking FTE — calculators.js
// Deterministic formula-based calculations
// LLM pe depend nahi — pure math
// =============================================

const IslamicCalc = {

  // ---- MURABAHA ----
  // Bank asset khareedta hai, phir cost+profit pe bechta hai
  murabaha({ assetCost, profitRate, tenureMonths, downPaymentPct = 0 }) {
    const cost         = parseFloat(assetCost);
    const rate         = parseFloat(profitRate);
    const months       = parseInt(tenureMonths);
    const downPct      = parseFloat(downPaymentPct);

    const downPayment      = cost * (downPct / 100);
    const financedAmount   = cost - downPayment;
    const totalProfit      = financedAmount * (rate / 100) * (months / 12);
    const totalPayable     = financedAmount + totalProfit;
    const monthlyPayment   = totalPayable / months;

    // Payment schedule — first 12 months
    const schedule = [];
    const monthlyPrincipal = financedAmount / months;
    const monthlyProfit    = totalProfit / months;
    let   balance          = financedAmount;

    for (let m = 1; m <= Math.min(months, 12); m++) {
      balance -= monthlyPrincipal;
      schedule.push({
        month:     m,
        payment:   Math.round(monthlyPayment),
        principal: Math.round(monthlyPrincipal),
        profit:    Math.round(monthlyProfit),
        balance:   Math.round(Math.max(0, balance)),
      });
    }

    return {
      assetCost:       Math.round(cost),
      downPayment:     Math.round(downPayment),
      financedAmount:  Math.round(financedAmount),
      profitAmount:    Math.round(totalProfit),
      totalPayable:    Math.round(totalPayable),
      monthlyPayment:  Math.round(monthlyPayment),
      profitRate:      rate,
      tenureMonths:    months,
      schedule,
    };
  },

  // ---- DIMINISHING MUSHARAKAH ----
  // Ghar financing — har mahine bank ka hissa khareedte hain
  diminishingMusharakah({ propertyValue, bankSharePct, profitRate, tenureMonths }) {
    const value    = parseFloat(propertyValue);
    const bShare   = parseFloat(bankSharePct);
    const rate     = parseFloat(profitRate);
    const months   = parseInt(tenureMonths);

    const bankAmount      = value * (bShare / 100);
    const customerAmount  = value - bankAmount;
    const monthlyBuyback  = bankAmount / months;

    // First month calculation
    const firstMonthRent  = bankAmount * (rate / 100) / 12;
    const firstMonthTotal = firstMonthRent + monthlyBuyback;

    // Last month calculation (bank share almost zero)
    const lastMonthRent   = monthlyBuyback * (rate / 100) / 12;
    const lastMonthTotal  = lastMonthRent + monthlyBuyback;

    // Total payment (approximate — decreasing rentals)
    const avgRent    = (firstMonthRent + lastMonthRent) / 2;
    const totalRent  = avgRent * months;
    const totalPaid  = bankAmount + totalRent;

    // Schedule first 12 months
    const schedule = [];
    let bankBalance = bankAmount;
    for (let m = 1; m <= Math.min(months, 12); m++) {
      const rent    = bankBalance * (rate / 100) / 12;
      const total   = rent + monthlyBuyback;
      bankBalance  -= monthlyBuyback;
      schedule.push({
        month:        m,
        rent:         Math.round(rent),
        buyback:      Math.round(monthlyBuyback),
        totalPayment: Math.round(total),
        bankBalance:  Math.round(Math.max(0, bankBalance)),
      });
    }

    return {
      propertyValue:    Math.round(value),
      bankAmount:       Math.round(bankAmount),
      customerAmount:   Math.round(customerAmount),
      bankSharePct:     bShare,
      firstMonthTotal:  Math.round(firstMonthTotal),
      lastMonthTotal:   Math.round(lastMonthTotal),
      monthlyBuyback:   Math.round(monthlyBuyback),
      totalRent:        Math.round(totalRent),
      totalPaid:        Math.round(totalPaid),
      schedule,
      note: 'Monthly payment har mahine kam hoti hai kyunki bank ka share reduce hota rehta hai.',
    };
  },

  // ---- IJARA (LEASING) ----
  // Bank asset khareedta hai, aapko lease pe deta hai
  // Customer rental formula: Outstanding Investment × Monthly Rate
  ijara({ assetValue, rentalRate, tenureMonths, residualValuePct = 10 }) {
    const value    = parseFloat(assetValue);
    const rate     = parseFloat(rentalRate);
    const months   = parseInt(tenureMonths);
    const residual = value * (parseFloat(residualValuePct) / 100);

    // Customer pays rental on bank's investment (simplified: flat on full value)
    // Real IMB would have decreasing rental as customer buys units
    const monthlyRent = (value * (rate / 100)) / 12;
    const totalRent   = monthlyRent * months;

    return {
      assetValue:    Math.round(value),
      residualValue: Math.round(residual),
      monthlyRent:   Math.round(monthlyRent),
      totalRent:     Math.round(totalRent),
      totalCost:     Math.round(totalRent + residual),
      rentalRate:    rate,
      tenureMonths:  months,
    };
  },

  // ---- ZAKAT ----
  // 2.5% on zakatable wealth above nisab
  zakat({
    savings        = 0,  // PKR
    goldTola       = 0,  // Tola (1 tola = 11.664 grams)
    silverTola     = 0,  // Tola
    businessAssets = 0,
    investments    = 0,
    receivables    = 0,  // Money others owe you
    liabilities    = 0,  // Debts you must pay NOW
    // Live rates injected from /api/rates, fallback to June 2026 estimates
    goldRatePerTola   = (window._liveRates?.gold?.pkrsPerTola)   || 330000,
    silverRatePerTola = (window._liveRates?.silver?.pkrsPerTola) || 3100,
  }) {
    const GOLD_RATE_PER_TOLA   = goldRatePerTola;
    const SILVER_RATE_PER_TOLA = silverRatePerTola;
    const NISAB_GOLD_TOLA      = 7.5;   // 87.48 grams
    const NISAB_SILVER_TOLA    = 52.5;  // 612.36 grams

    const goldValue    = parseFloat(goldTola)   * GOLD_RATE_PER_TOLA;
    const silverValue  = parseFloat(silverTola) * SILVER_RATE_PER_TOLA;
    const nisabGoldPKR   = NISAB_GOLD_TOLA   * GOLD_RATE_PER_TOLA;   // ~1,575,000
    const nisabSilverPKR = NISAB_SILVER_TOLA * SILVER_RATE_PER_TOLA; // ~128,625

    const totalWealth = (
      parseFloat(savings) +
      goldValue +
      silverValue +
      parseFloat(businessAssets) +
      parseFloat(investments) +
      parseFloat(receivables) -
      parseFloat(liabilities)
    );

    // Pakistan mein silver nisab zyada use hota hai (more inclusive)
    const nisabMet       = totalWealth >= nisabSilverPKR;
    const zakatAmount    = nisabMet ? totalWealth * 0.025 : 0;

    return {
      breakdown: {
        savings:        Math.round(parseFloat(savings)),
        goldValue:      Math.round(goldValue),
        silverValue:    Math.round(silverValue),
        businessAssets: Math.round(parseFloat(businessAssets)),
        investments:    Math.round(parseFloat(investments)),
        receivables:    Math.round(parseFloat(receivables)),
        liabilities:    -Math.round(parseFloat(liabilities)),
      },
      totalWealth:      Math.round(totalWealth),
      nisabSilverPKR:   Math.round(nisabSilverPKR),
      nisabGoldPKR:     Math.round(nisabGoldPKR),
      nisabMet,
      zakatAmount:      Math.round(zakatAmount),
      zakatRate:        '2.5%',
      goldRateUsed:     GOLD_RATE_PER_TOLA,
      silverRateUsed:   SILVER_RATE_PER_TOLA,
      nisabBasis:       'Silver nisab (52.5 tola) — Pakistan mein zyada use hota hai',
    };
  },

  // ---- SUKUK ----
  // Islamic bonds — periodic profit payments + principal return at maturity
  sukuk({ faceValue, profitRate, tenureYears, frequency = 'semi-annual' }) {
    const face    = parseFloat(faceValue);
    const rate    = parseFloat(profitRate);
    const years   = parseFloat(tenureYears);

    const periodsPerYear   = frequency === 'quarterly' ? 4 : 2;
    const totalPeriods     = years * periodsPerYear;
    const periodRate       = rate / 100 / periodsPerYear;
    const periodicPayment  = face * periodRate;
    const totalProfit      = periodicPayment * totalPeriods;

    // Schedule — all periods
    const schedule = [];
    for (let p = 1; p <= totalPeriods; p++) {
      schedule.push({
        period:    p,
        payment:   Math.round(periodicPayment),
        type:      p === totalPeriods ? 'Profit + Principal' : 'Profit',
        principal: p === totalPeriods ? Math.round(face) : 0,
      });
    }

    return {
      faceValue:        Math.round(face),
      periodicPayment:  Math.round(periodicPayment),
      frequency,
      periodsPerYear,
      totalPeriods,
      totalProfit:      Math.round(totalProfit),
      totalReceived:    Math.round(face + totalProfit),
      annualReturn:     rate,
      tenureYears:      years,
      schedule,
    };
  },

  // ---- SHARIAH COMPLIANCE CHECKER ----
  checkCompliance(description) {
    const text   = description.toLowerCase();
    const issues = [];

    const checks = {
      RIBA: [
        { term: 'interest',                 msg: '"Interest" detected — Riba mein aata hai' },
        { term: 'sood',                     msg: '"Sood" detected — Riba hai' },
        { term: 'apr',                      msg: 'APR (Annual Percentage Rate) — interest-based' },
        { term: 'fixed return on cash',     msg: 'Cash pe fixed return — Riba' },
        { term: 'guaranteed profit',        msg: 'Guaranteed profit without asset — potential Riba' },
        { term: 'loan with interest',       msg: 'Interest-bearing loan — Riba' },
      ],
      GHARAR: [
        { term: 'unknown quantity',         msg: 'Unknown quantity — Gharar (excessive uncertainty)' },
        { term: 'futures contract',         msg: 'Futures without commodity delivery — Gharar' },
        { term: 'options contract',         msg: 'Options trading — potential Gharar' },
        { term: 'short selling',            msg: 'Short selling — selling what you don\'t own' },
        { term: 'speculation',              msg: 'Pure speculation without underlying asset — Gharar' },
      ],
      MAYSIR: [
        { term: 'gambling',                 msg: 'Gambling — Maysir, strictly forbidden' },
        { term: 'lottery',                  msg: 'Lottery — Maysir' },
        { term: 'jua',                      msg: 'Jua (gambling) — Maysir' },
        { term: 'satta',                    msg: 'Satta — Maysir' },
        { term: 'casino',                   msg: 'Casino — Maysir' },
      ],
      HARAM_INDUSTRY: [
        { term: 'alcohol',                  msg: 'Alcohol industry — Haram' },
        { term: 'pork',                     msg: 'Pork/swine industry — Haram' },
        { term: 'tobacco',                  msg: 'Tobacco — majority scholars say Haram/Makruh' },
        { term: 'adult entertainment',      msg: 'Adult entertainment — Haram' },
        { term: 'weapons of mass',          msg: 'Weapons of mass destruction — Haram' },
      ],
    };

    for (const [category, rules] of Object.entries(checks)) {
      for (const rule of rules) {
        if (text.includes(rule.term)) {
          issues.push({ category, issue: rule.msg });
        }
      }
    }

    return {
      compliant: issues.length === 0,
      issues,
      verdict: issues.length === 0
        ? '✅ No obvious Shariah violations detected in the description.'
        : `⚠️ ${issues.length} potential issue(s) found. Review required.`,
      disclaimer: 'Yeh automated check hai — formal Fatwa nahi. Apne bank ke Shariah Advisor se zaroor consult karein.',
    };
  },

  // ---- PKR FORMATTER ----
  formatPKR(amount) {
    const num = Math.round(amount);
    if (num >= 10000000) return `PKR ${(num / 10000000).toFixed(2)} Crore`;
    if (num >= 100000)   return `PKR ${(num / 100000).toFixed(2)} Lakh`;
    return `PKR ${num.toLocaleString('en-PK')}`;
  },
};

// Export
window.IslamicCalc = IslamicCalc;

// Fetch live gold/silver rates from /api/rates on page load
(async function fetchLiveRates() {
  try {
    const res  = await fetch('/api/rates');
    if (!res.ok) return;
    const data = await res.json();
    window._liveRates = data;

    // Update rate display elements if present on page
    const goldEl   = document.getElementById('live-gold-rate');
    const silverEl = document.getElementById('live-silver-rate');
    const updEl    = document.getElementById('live-rates-updated');
    if (goldEl)   goldEl.textContent   = IslamicCalc.formatPKR(data.gold.pkrsPerTola) + '/tola';
    if (silverEl) silverEl.textContent = IslamicCalc.formatPKR(data.silver.pkrsPerTola) + '/tola';
    if (updEl)    updEl.textContent    = 'Live — ' + new Date(data.lastUpdated).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  } catch {
    // silently use hardcoded fallback
  }
})();
