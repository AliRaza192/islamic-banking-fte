// ---- TAB SWITCHING ----
document.querySelectorAll('.calc-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.calc-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});

// ---- PKR FORMAT HELPER ----
function fmt(n) { return IslamicCalc.formatPKR(n); }
function fmtRaw(n) { return 'PKR ' + Math.round(n).toLocaleString('en-PK'); }

// ---- SHOW RESULT ----
function showResult(id) {
  document.getElementById('result-' + id).classList.add('show');
  document.getElementById('result-' + id).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ---- RESET ----
function resetPanel(id) {
  document.getElementById('result-' + id).classList.remove('show');
}

// ---- BUILD SUMMARY CARDS ----
function buildSummary(containerId, cards) {
  const el = document.getElementById(containerId);
  el.innerHTML = cards.map(c => `
    <div class="summary-card ${c.highlight ? 'highlight' : ''}">
      <div class="summary-label">${c.label}</div>
      <div class="summary-value">${c.value}</div>
      ${c.sub ? `<div class="summary-sub">${c.sub}</div>` : ''}
    </div>
  `).join('');
}

// ---- AI LINK BUILDER ----
function buildAiLink(id, prompt) {
  const el = document.getElementById('ai-link-' + id);
  if (el) el.href = '/chat?q=' + encodeURIComponent(prompt);
}

// ============================================================
// MURABAHA
// ============================================================
function calcMurabaha() {
  const cost   = parseFloat(document.getElementById('m-cost').value);
  const rate   = parseFloat(document.getElementById('m-rate').value);
  const tenure = parseInt(document.getElementById('m-tenure').value);
  const down   = parseFloat(document.getElementById('m-down').value) || 0;

  if (!cost || !rate || !tenure) { alert('Sab fields fill karein'); return; }

  const r = IslamicCalc.murabaha({ assetCost: cost, profitRate: rate, tenureMonths: tenure, downPaymentPct: down });

  buildSummary('summary-murabaha', [
    { label: 'Asset Cost',         value: fmt(r.assetCost) },
    { label: 'Down Payment',       value: fmt(r.downPayment), sub: down + '%' },
    { label: 'Financed Amount',    value: fmt(r.financedAmount) },
    { label: 'Total Profit',       value: fmt(r.profitAmount), sub: rate + '% p.a.' },
    { label: 'Total Payable',      value: fmt(r.totalPayable) },
    { label: 'Monthly Installment', value: fmtRaw(r.monthlyPayment), highlight: true, sub: tenure + ' months' },
  ]);

  const tbody = document.getElementById('schedule-murabaha');
  tbody.innerHTML = r.schedule.map(row => `
    <tr>
      <td>${row.month}</td>
      <td>${fmtRaw(row.principal)}</td>
      <td>${fmtRaw(row.profit)}</td>
      <td><strong>${fmtRaw(row.payment)}</strong></td>
      <td>${fmtRaw(row.balance)}</td>
    </tr>
  `).join('');

  buildAiLink('murabaha',
    `Maine Murabaha calculate kiya: Asset ${fmt(r.assetCost)}, ${rate}% profit rate, ${tenure} months tenure. Monthly installment ${fmtRaw(r.monthlyPayment)} aati hai. Kya yeh rate theek hai? Pakistan mein best Islamic bank kaun dega?`
  );

  showResult('murabaha');
}

// ============================================================
// DIMINISHING MUSHARAKAH
// ============================================================
function calcMusharakah() {
  const value  = parseFloat(document.getElementById('ms-value').value);
  const bank   = parseFloat(document.getElementById('ms-bank').value);
  const rate   = parseFloat(document.getElementById('ms-rate').value);
  const tenure = parseInt(document.getElementById('ms-tenure').value);

  if (!value || !bank || !rate) { alert('Sab fields fill karein'); return; }

  const r = IslamicCalc.diminishingMusharakah({ propertyValue: value, bankSharePct: bank, profitRate: rate, tenureMonths: tenure });

  buildSummary('summary-musharakah', [
    { label: 'Property Value',      value: fmt(r.propertyValue) },
    { label: 'Bank Contribution',   value: fmt(r.bankAmount), sub: bank + '%' },
    { label: 'Your Down Payment',   value: fmt(r.customerAmount), sub: (100-bank) + '%' },
    { label: 'First Month Payment', value: fmtRaw(r.firstMonthTotal), highlight: true, sub: 'Highest' },
    { label: 'Last Month Payment',  value: fmtRaw(r.lastMonthTotal), sub: 'Lowest' },
    { label: 'Total Paid',          value: fmt(r.totalPaid) },
  ]);

  const tbody = document.getElementById('schedule-musharakah');
  tbody.innerHTML = r.schedule.map(row => `
    <tr>
      <td>${row.month}</td>
      <td>${fmtRaw(row.rent)}</td>
      <td>${fmtRaw(row.buyback)}</td>
      <td><strong>${fmtRaw(row.totalPayment)}</strong></td>
      <td>${fmtRaw(row.bankBalance)}</td>
    </tr>
  `).join('');

  buildAiLink('musharakah',
    `Diminishing Musharakah: Property ${fmt(r.propertyValue)}, bank share ${bank}%, ${rate}% rate. First month ${fmtRaw(r.firstMonthTotal)}. Murabaha se compare karein — konsa behtar hai home financing ke liye?`
  );

  showResult('musharakah');
}

// ============================================================
// IJARA
// ============================================================
function calcIjara() {
  const value    = parseFloat(document.getElementById('ij-value').value);
  const rate     = parseFloat(document.getElementById('ij-rate').value);
  const tenure   = parseInt(document.getElementById('ij-tenure').value);
  const residual = parseFloat(document.getElementById('ij-residual').value) || 10;

  if (!value || !rate) { alert('Sab fields fill karein'); return; }

  const r = IslamicCalc.ijara({ assetValue: value, rentalRate: rate, tenureMonths: tenure, residualValuePct: residual });

  buildSummary('summary-ijara', [
    { label: 'Asset Value',      value: fmt(r.assetValue) },
    { label: 'Monthly Rent',     value: fmtRaw(r.monthlyRent), highlight: true, sub: tenure + ' months' },
    { label: 'Total Rent Paid',  value: fmt(r.totalRent) },
    { label: 'Residual Value',   value: fmt(r.residualValue), sub: residual + '% at end' },
    { label: 'Total Cost',       value: fmt(r.totalCost) },
    { label: 'Annual Rate',      value: rate + '%', sub: 'per year' },
  ]);

  buildAiLink('ijara',
    `Ijara calculation: Asset ${fmt(r.assetValue)}, monthly rent ${fmtRaw(r.monthlyRent)}, ${tenure} months. Car financing ke liye Pakistan mein Ijara aur Murabaha mein kya farq hai?`
  );

  showResult('ijara');
}

// ============================================================
// ZAKAT
// ============================================================
function calcZakat() {
  const r = IslamicCalc.zakat({
    savings:        document.getElementById('z-savings').value      || 0,
    goldTola:       document.getElementById('z-gold').value         || 0,
    silverTola:     document.getElementById('z-silver').value       || 0,
    businessAssets: document.getElementById('z-business').value     || 0,
    investments:    document.getElementById('z-investments').value   || 0,
    receivables:    document.getElementById('z-receivables').value   || 0,
    liabilities:    document.getElementById('z-liabilities').value   || 0,
  });

  // Nisab pill
  const pillEl = document.getElementById('nisab-pill-container');
  pillEl.innerHTML = r.nisabMet
    ? `<div class="nisab-pill met">✅ Nisab poora hua — Zakat wajib hai (Silver: ${fmtRaw(r.nisabSilverPKR)})</div>`
    : `<div class="nisab-pill not-met">⚠️ Nisab poora nahi hua — Zakat wajib nahi (Threshold: ${fmtRaw(r.nisabSilverPKR)})</div>`;

  // Breakdown
  const labels = {
    savings: 'Cash / Savings', goldValue: 'Gold', silverValue: 'Silver',
    businessAssets: 'Business Assets', investments: 'Investments',
    receivables: 'Receivables', liabilities: 'Liabilities (deducted)',
  };
  const breakdownEl = document.getElementById('zakat-breakdown');
  breakdownEl.innerHTML = Object.entries(r.breakdown)
    .filter(([, v]) => v !== 0)
    .map(([k, v]) => `
      <div class="zakat-row">
        <span class="zakat-label">${labels[k] || k}</span>
        <span class="zakat-value ${v < 0 ? 'deduction' : ''}">${fmtRaw(Math.abs(v))}</span>
      </div>
    `).join('') +
    `<div class="zakat-total-row">
      <span>Total Zakatable Wealth</span>
      <span>${fmtRaw(r.totalWealth)}</span>
    </div>`;

  buildSummary('summary-zakat', [
    { label: 'Total Wealth',    value: fmtRaw(r.totalWealth) },
    { label: 'Nisab (Silver)',  value: fmtRaw(r.nisabSilverPKR) },
    { label: 'Zakat Rate',      value: '2.5%' },
    { label: 'Zakat Amount',    value: fmtRaw(r.zakatAmount), highlight: r.nisabMet, sub: r.nisabMet ? 'Wajib' : 'N/A' },
  ]);

  buildAiLink('zakat',
    `Mera total zakatable wealth ${fmtRaw(r.totalWealth)} hai. Zakat ${r.nisabMet ? fmtRaw(r.zakatAmount) + ' wajib hai' : 'wajib nahi'}. Zakat kaise aur kahan dein? Gold nisab aur silver nisab mein kya farq hai?`
  );

  showResult('zakat');
}

// ============================================================
// SUKUK
// ============================================================
function calcSukuk() {
  const value  = parseFloat(document.getElementById('sk-value').value);
  const rate   = parseFloat(document.getElementById('sk-rate').value);
  const tenure = parseFloat(document.getElementById('sk-tenure').value);
  const freq   = document.getElementById('sk-freq').value;

  if (!value || !rate) { alert('Sab fields fill karein'); return; }

  const r = IslamicCalc.sukuk({ faceValue: value, profitRate: rate, tenureYears: tenure, frequency: freq });

  buildSummary('summary-sukuk', [
    { label: 'Investment',         value: fmt(r.faceValue) },
    { label: 'Periodic Payment',   value: fmtRaw(r.periodicPayment), highlight: true, sub: freq },
    { label: 'Total Profit',       value: fmt(r.totalProfit) },
    { label: 'Total Received',     value: fmt(r.totalReceived), sub: 'incl. principal' },
    { label: 'Annual Return',      value: rate + '%' },
    { label: 'Tenure',             value: tenure + ' years' },
  ]);

  const tbody = document.getElementById('schedule-sukuk');
  tbody.innerHTML = r.schedule.map(row => `
    <tr>
      <td>${row.period}</td>
      <td>${row.type}</td>
      <td>${fmtRaw(row.payment)}</td>
      <td>${row.principal ? fmtRaw(row.principal) : '—'}</td>
      <td><strong>${fmtRaw(row.payment + row.principal)}</strong></td>
    </tr>
  `).join('');

  buildAiLink('sukuk',
    `Sukuk investment: ${fmt(r.faceValue)} pe ${rate}% annual return, ${tenure} saal tenure. Total profit ${fmt(r.totalProfit)}. Pakistan mein konse Sukuk available hain aur kahan se khareedein?`
  );

  showResult('sukuk');
}

// ============================================================
// SHARIAH COMPLIANCE
// ============================================================
function checkCompliance() {
  const text = document.getElementById('compliance-text').value.trim();
  if (!text) { alert('Kuch darj karein'); return; }

  const r   = IslamicCalc.checkCompliance(text);
  const out = document.getElementById('compliance-output');

  if (r.compliant) {
    out.innerHTML = `
      <div class="compliance-result halal">
        <div class="compliance-verdict">✅ No Obvious Shariah Issues Detected</div>
        <p style="font-size:0.85rem;color:var(--text-muted)">
          Automated check mein koi Riba, Gharar, Maysir, ya Haram industry keyword nahi mila.
          Lekin formal Fatwa ke liye Shariah Advisor se zaroor milein.
        </p>
      </div>`;
  } else {
    out.innerHTML = `
      <div class="compliance-result haram">
        <div class="compliance-verdict">⚠️ ${r.issues.length} Potential Issue(s) Found</div>
        ${r.issues.map(i => `
          <div class="compliance-issue">
            <span class="issue-cat">${i.category}</span>
            <span>${i.issue}</span>
          </div>
        `).join('')}
      </div>`;
  }

  buildAiLink('compliance',
    `Yeh product/transaction check karein: "${text.slice(0, 200)}". Shariah compliance ke lihaaz se kya masail hain?`
  );

  showResult('compliance');
}

// ============================================================
// LIVE RATES — goldapi.io via /api/rates
// ============================================================
let _liveRatesLoaded = false;

async function loadLiveRates() {
  const updated  = document.getElementById('live-rates-updated');

  try {
    const res   = await fetch('/api/rates', { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error('API error ' + res.status);
    const rates = await res.json();

    // Set global for calculators.js to use
    window._liveRates = rates;
    _liveRatesLoaded  = true;

    // Format nicely
    const goldFmt   = 'PKR ' + Math.round(rates.gold.pkrsPerTola).toLocaleString('en-PK');
    const silverFmt = 'PKR ' + Math.round(rates.silver.pkrsPerTola).toLocaleString('en-PK');
    const usdFmt    = 'PKR ' + parseFloat(rates.currency.usdPKR).toFixed(1);
    const srcLabel  = '🟢 Live';
    const timeStr   = rates.lastUpdated
      ? new Date(rates.lastUpdated).toLocaleString('en-PK', { hour:'2-digit', minute:'2-digit', day:'numeric', month:'short' })
      : 'Unknown';

    if (badge) {
      badge.innerHTML = `
        <span class="rate-pill gold-pill">🥇 Gold: <strong>${goldFmt}</strong>/tola</span>
        <span class="rate-pill silver-pill">🥈 Silver: <strong>${silverFmt}</strong>/tola</span>
        <span class="rate-pill usd-pill">💵 USD: <strong>${usdFmt}</strong></span>
        <span class="rate-pill src-pill">${srcLabel}</span>
      `;
    }
    if (updated) {
      updated.textContent = 'Updated: ' + timeStr;
    }

    // Update inline Zakat tab rate display
    const goldInline   = document.getElementById('live-gold-rate');
    const silverInline = document.getElementById('live-silver-rate');
    if (goldInline)   goldInline.textContent   = goldFmt + '/tola';
    if (silverInline) silverInline.textContent = silverFmt + '/tola';

  } catch (err) {
    console.warn('Live rates failed:', err.message);
    if (badge) {
      badge.innerHTML = '<span class="rates-loading" style="color:var(--gold)">⚠️ Using offline rates (goldapi.io unavailable)</span>';
    }
    // Ensure calculators still work with fallback
    if (!window._liveRates) {
      window._liveRates = {
        gold: { pkrsPerTola: 330000, pkrsPerGram: 28290 },
        silver: { pkrsPerTola: 3100, pkrsPerGram: 100 },
        nisab: { gold: 2475000, silver: 162750, lower: 162750 },
        currency: { usdPKR: 280 },
        lastUpdated: new Date().toISOString(),
        source: 'offline-fallback'
      };
    }
  }
}

// Load on page ready
document.addEventListener('DOMContentLoaded', loadLiveRates);
