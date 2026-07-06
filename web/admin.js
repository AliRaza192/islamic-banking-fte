let _adminKey = sessionStorage.getItem('ib_admin_key') || '';

function adminLogin() {
  const key = document.getElementById('adminKey').value.trim();
  if (!key) return;
  _adminKey = key;
  sessionStorage.setItem('ib_admin_key', key);
  loadDash();
}

function adminLogout() {
  sessionStorage.removeItem('ib_admin_key');
  _adminKey = '';
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('dashSection').style.display  = 'none';
}

document.getElementById('adminKey')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') adminLogin();
});

async function loadDash() {
  document.getElementById('loginErr').textContent = '';
  try {
    const res = await fetch('/api/admin', {
      headers: { 'Authorization': `Bearer ${_adminKey}` }
    });
    if (res.status === 401) {
      document.getElementById('loginErr').textContent = 'Wrong password';
      sessionStorage.removeItem('ib_admin_key');
      return;
    }
    if (!res.ok) throw new Error('Server error');

    const d = await res.json();

    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashSection').style.display  = 'block';
    document.getElementById('genAt').textContent = 'Updated: ' + new Date(d.generated_at).toLocaleString('en-PK');

    // Stats
    document.getElementById('s-total').textContent   = d.users.total.toLocaleString();
    document.getElementById('s-today').textContent   = '+' + d.users.new_today;
    document.getElementById('s-queries').textContent = d.queries.today.toLocaleString();
    document.getElementById('s-revenue').textContent = '$' + d.revenue.estimated_monthly_usd;
    document.getElementById('s-revenue-pkr').textContent = '≈ PKR ' + (d.revenue.estimated_monthly_pkr || 0).toLocaleString();

    // Tier breakdown
    const total = d.users.total || 1;
    document.getElementById('tierList').innerHTML = d.users.by_tier.map(t => {
      const pct = Math.round((t.count / total) * 100);
      const badgeClass = t.tier === 'premium' ? 'badge-premium' : t.tier === 'professional' ? 'badge-professional' : 'badge-free';
      return `<div class="data-row">
        <span class="badge-tier ${badgeClass}">${t.tier}</span>
        <div style="flex:1;margin:0 12px"><div class="bar-wrap"><div class="bar-fill" style="width:${pct}%"></div></div></div>
        <span class="data-val">${t.count} (${pct}%)</span>
      </div>`;
    }).join('') || '<div class="data-row"><span class="data-key">No users yet</span></div>';

    // Query chart
    const days = d.queries.last_7_days;
    const maxQ  = Math.max(...days.map(d => parseInt(d.queries)), 1);
    document.getElementById('queryChart').innerHTML = days.map(d => {
      const h = Math.max(4, Math.round((parseInt(d.queries) / maxQ) * 56));
      return `<div class="chart-bar" title="${d.day}: ${d.queries} queries" style="height:${h}px"></div>`;
    }).join('');
    document.getElementById('queryChartLabels').innerHTML = days.map(d => {
      const label = new Date(d.day).toLocaleDateString('en-PK', { weekday: 'short' });
      return `<div class="chart-label" style="flex:1;text-align:center">${label}</div>`;
    }).join('');

    // Skills
    document.getElementById('skillsList').innerHTML = d.skills.top_30_days.map((s, i) => {
      const maxCount = d.skills.top_30_days[0]?.count || 1;
      const pct = Math.round((s.count / maxCount) * 100);
      return `<div class="data-row">
        <span class="data-key" style="width:200px;flex-shrink:0">${s.skill_used || 'unknown'}</span>
        <div style="flex:1;margin:0 12px"><div class="bar-wrap"><div class="bar-fill" style="width:${pct}%;background:${i<3?'#66bb6a':'#2e7d32'}"></div></div></div>
        <span class="data-val">${s.count}</span>
      </div>`;
    }).join('') || '<div class="data-row"><span class="data-key">No data yet</span></div>';

    // Recent users
    document.getElementById('usersList').innerHTML = d.recent_users.map(u => {
      const badgeClass = u.tier === 'premium' ? 'badge-premium' : u.tier === 'professional' ? 'badge-professional' : 'badge-free';
      const joined = new Date(u.joined).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
      return `<div class="data-row">
        <span class="data-key" style="flex:1">${u.email}</span>
        <span class="badge-tier ${badgeClass}" style="margin:0 12px">${u.tier}</span>
        <span class="data-val" style="min-width:80px;text-align:right">${joined}</span>
      </div>`;
    }).join('') || '<div class="data-row"><span class="data-key">No users yet</span></div>';

    // Subscriptions
    document.getElementById('subsList').innerHTML = d.revenue.active_subscriptions.length > 0
      ? d.revenue.active_subscriptions.map(s => `
        <div class="data-row">
          <span class="data-key">${s.provider === 'stripe' ? '💳 Stripe' : '📱 JazzCash'}</span>
          <span class="badge-tier ${s.tier === 'premium' ? 'badge-premium' : 'badge-professional'}">${s.tier}</span>
          <span class="data-val">${s.count} active</span>
        </div>`).join('')
      : '<div class="data-row"><span class="data-key" style="color:#4a7a5a">No active subscriptions yet</span></div>';

  } catch (err) {
    document.getElementById('loginErr').textContent = err.message;
  }
}

// Auto-login if key saved
if (_adminKey) loadDash();
