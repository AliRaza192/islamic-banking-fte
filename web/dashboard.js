(async function() {
  const container = document.getElementById('dashContent');

  // Handle payment success redirect from Stripe
  const urlParams    = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('payment');
  const stripeSession = urlParams.get('session_id');

  if (paymentStatus === 'success' && stripeSession && AUTH.isLoggedIn()) {
    // Show processing banner
    const banner = document.createElement('div');
    banner.id = 'payment-banner';
    banner.style.cssText = 'background:#1a3a1a;border:.5px solid #2a6a2a;border-radius:8px;padding:.85rem 1.25rem;margin-bottom:1rem;font-size:13px;color:#a5d6a7;display:flex;align-items:center;gap:.5rem';
    banner.innerHTML = '<span>⏳</span> <span>Payment verify ho raha hai...</span>';
    container.parentNode.insertBefore(banner, container);

    try {
      const vRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ session_id: stripeSession })
      });
      const vData = await vRes.json();
      if (vData.success && vData.token) {
        // Update token AND user object so tier shows correctly everywhere
        if (vData.user) {
          AUTH.setAuth(vData.token, vData.user);
        } else {
          AUTH.setToken(vData.token);
        }
        AUTH.updateUI();
        banner.style.background = '#1a3a1a';
        banner.innerHTML = '<span>✅</span> <span>Payment successful! Your plan has been upgraded to <strong>' + vData.tier + '</strong>. <a href="/dashboard" style="color:#a5d6a7;text-decoration:underline">Refresh →</a></span>';
      } else {
        banner.style.background = '#2a1a1a';
        banner.style.color = '#ef9a9a';
        banner.innerHTML = '<span>⚠️</span> <span>Payment received but verification pending. Refresh in a moment.</span>';
      }
    } catch {
      banner.innerHTML = '<span>⚠️</span> <span>Could not verify payment automatically — refresh the page.</span>';
    }
    // Clean URL
    window.history.replaceState({}, '', '/dashboard');
  }

  if (paymentStatus === 'cancelled') {
    const banner = document.createElement('div');
    banner.style.cssText = 'background:#2a1a1a;border:.5px solid #6a2a2a;border-radius:8px;padding:.85rem 1.25rem;margin-bottom:1rem;font-size:13px;color:#ef9a9a';
    banner.innerHTML = '⚠️ Payment cancelled — no charge was made. <a href="/pricing" style="color:#ef9a9a;text-decoration:underline">Try again →</a>';
    container.parentNode.insertBefore(banner, container);
    window.history.replaceState({}, '', '/dashboard');
  }

  // Check auth
  if (!AUTH.isLoggedIn()) {
    container.innerHTML = `
      <div class="error-msg">
        <h2>Please login first</h2>
        <p>You need to be logged in to view your dashboard.</p>
        <br>
        <button class="dash-btn primary" onclick="AUTH.showModal()">Login</button>
      </div>`;
    return;
  }

  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'include',
    });

    if (!res.ok) {
      if (res.status === 401) {
        AUTH.logout();
        window.location.reload();
        return;
      }
      throw new Error('Failed to load dashboard');
    }

    const data = await res.json();
    const user = data;
    const tierLabels = { free: 'Free', premium: 'Premium', professional: 'Professional' };
    const limit = user.queries_limit === 'unlimited' ? '∞' : user.queries_limit;
    const pct = user.queries_limit === 'unlimited' ? 0 : Math.min(100, (user.queries_today / user.queries_limit) * 100);
    const barClass = pct >= 100 ? 'full' : pct >= 80 ? 'warn' : '';

    container.innerHTML = `
      <div class="dash-greeting">
        <h1>Assalamu Alaikum</h1>
        <p>${user.email}</p>
      </div>

      <div class="dash-grid">
        <div class="dash-card">
          <div class="dash-card-label">Current Plan</div>
          <div class="tier-display">
            <span class="tier-badge tier-${user.tier}">${tierLabels[user.tier] || user.tier}</span>
          </div>
          <div class="dash-actions">
            ${user.tier !== 'professional' ? '<a href="/pricing.html" class="dash-btn primary">Upgrade Plan</a>' : ''}
          </div>
        </div>

        <div class="dash-card">
          <div class="dash-card-label">Today's Usage</div>
          <div class="dash-card-value">${user.queries_today} <span style="font-size:1rem;font-weight:400;color:var(--text-muted)">/ ${limit}</span></div>
          <div class="usage-bar-container">
            <div class="usage-bar ${barClass}" style="width: ${pct}%"></div>
          </div>
          <div class="dash-card-sub">Resets at midnight PKT</div>
        </div>

        ${user.subscription ? `
        <div class="dash-card full-width">
          <div class="dash-card-label">Subscription Details</div>
          <div class="account-info">
            <dt>Status</dt>
            <dd>${user.subscription.status === 'active' ? '✅ Active' :
                user.subscription.status === 'past_due' ?
                '⚠️ Past Due — <a href="/pricing.html" style="color:#ef9f27">Update payment →</a>' :
                '⚠️ ' + user.subscription.status}</dd>
            <dt>Provider</dt>
            <dd>${user.subscription.provider === 'stripe' ? '💳 Card (Stripe)' : '📱 JazzCash'}</dd>
            ${user.subscription.start_date ? `
            <dt>Started</dt>
            <dd>${new Date(user.subscription.start_date).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
            ` : ''}
            ${user.subscription.end_date ? `
            <dt>Renews</dt>
            <dd>${new Date(user.subscription.end_date).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
            ` : ''}
          </div>
        </div>
        ` : ''}

        <div class="dash-card full-width" id="history-card">
          <div class="dash-card-label">Recent Conversations</div>
          <div id="history-list" style="margin-top:.5rem">
            <div style="font-size:13px;color:var(--text-muted)">Loading history...</div>
          </div>
        </div>

        <div class="dash-card full-width">
          <div class="dash-card-label">Account</div>
          <div class="account-info">
            <dt>Email</dt>
            <dd>${user.email}</dd>
            <dt>Plan</dt>
            <dd>${tierLabels[user.tier]}</dd>
            <dt>Daily Limit</dt>
            <dd>${limit} queries/day</dd>
          </div>
          <div class="dash-actions" style="margin-top:1.25rem">
            <a href="/" class="dash-btn outline">Back to Chat</a>
            <button class="dash-btn danger" onclick="AUTH.logout(); window.location.href='/'">Sign Out</button>
          </div>
        </div>
      </div>
    `;

    loadHistory();

  } catch (err) {
    container.innerHTML = `
      <div class="error-msg">
        <h2>Something went wrong</h2>
        <p>${err.message}</p>
        <br>
        <a href="/" class="dash-btn outline">Back to Chat</a>
      </div>`;
  }
})();

async function loadHistory() {
  const listEl = document.getElementById('history-list');
  if (!listEl) return;
  try {
    const r = await fetch('/api/history', {
      credentials: 'include',
    });
    if (!r.ok) {
      listEl.innerHTML = '<div style="font-size:13px;color:var(--text-muted)">Login required to view history.</div>';
      return;
    }
    const data = await r.json();
    if (!data.sessions || data.sessions.length === 0) {
      listEl.innerHTML = '<div style="font-size:13px;color:var(--text-muted)">No conversations yet. <a href="/chat" style="color:var(--green-mid)">Start chatting →</a></div>';
      return;
    }
    listEl.innerHTML = data.sessions.map(s => {
      const title    = s.first_message ? s.first_message.substring(0, 80) + (s.first_message.length > 80 ? '...' : '') : 'Untitled conversation';
      const date     = new Date(s.updated_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const msgCount = s.message_count || 0;
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 0;border-bottom:.5px solid var(--border-color);gap:8px">'
        + '<div style="min-width:0">'
        + '<a href="/chat?session=' + s.id + '" style="font-size:13px;color:var(--text-primary);text-decoration:none;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + title + '</a>'
        + '<div style="font-size:11px;color:var(--text-muted);margin-top:2px">' + date + ' · ' + msgCount + ' messages</div>'
        + '</div>'
        + '<button onclick="deleteSession(\'' + s.id + '\', this)" style="font-size:11px;background:none;border:.5px solid var(--border-color);border-radius:4px;padding:2px 8px;cursor:pointer;color:var(--text-muted);flex-shrink:0">Delete</button>'
        + '</div>';
    }).join('');
  } catch {
    listEl.innerHTML = '<div style="font-size:13px;color:var(--text-muted)">Could not load history.</div>';
  }
}

async function deleteSession(sessionId, btn) {
  if (!confirm('Delete this conversation?')) return;
  btn.textContent = '...';
  try {
    await fetch('/api/history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ session_id: sessionId })
    });
    btn.closest('div[style]').remove();
  } catch { btn.textContent = 'Error'; }
}
