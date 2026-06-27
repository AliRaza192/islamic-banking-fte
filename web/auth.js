// =============================================
// Islamic Banking FTE — auth.js
// Email + OTP authentication module
// =============================================

const AUTH = {
  TOKEN_KEY: 'ibf_token',
  USER_KEY: 'ibf_user',

  // Get stored token
  getToken() {
    return sessionStorage.getItem(this.TOKEN_KEY);
  },

  // Get stored user info
  getUser() {
    const raw = sessionStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!this.getToken();
  },

  // Store auth data
  setAuth(token, user) {
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  // Update token only (e.g. after tier upgrade)
  setToken(token) {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  },

  // Clear auth data
  logout() {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.updateUI();
  },

  // Send OTP to email
  async sendOTP(email) {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
    return data;
  },

  // Verify OTP and login
  async verifyOTP(email, code) {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    this.setAuth(data.token, data.user);
    this.updateUI();
    return data;
  },

  // Get current user info from server
  async getMe() {
    const token = this.getToken();
    if (!token) return null;
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      this.logout();
      return null;
    }
    const data = await res.json();
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(data));
    return data;
  },

  // Update UI based on auth state
  updateUI() {
    const user = this.getUser();
    const loginBtn = document.getElementById('loginBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const userInfo = document.getElementById('userInfo');
    const mobileUserInfo = document.getElementById('mobileUserInfo');

    if (user) {
      // Logged in
      if (loginBtn) loginBtn.style.display = 'none';
      if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
      if (userInfo) {
        userInfo.style.display = 'flex';
        userInfo.querySelector('.user-email').textContent = user.email;
        const tierBadge = userInfo.querySelector('.tier-badge');
        tierBadge.textContent = user.tier;
        tierBadge.className = `tier-badge tier-${user.tier}`;
      }
      if (mobileUserInfo) {
        mobileUserInfo.style.display = 'flex';
        mobileUserInfo.querySelector('.user-email').textContent = user.email;
      }
    } else {
      // Logged out
      if (loginBtn) loginBtn.style.display = '';
      if (mobileLoginBtn) mobileLoginBtn.style.display = '';
      if (userInfo) userInfo.style.display = 'none';
      if (mobileUserInfo) mobileUserInfo.style.display = 'none';
    }
  },

  // Show login modal
  showModal() {
    document.getElementById('loginModal').classList.add('show');
    document.getElementById('otpStep').style.display = 'none';
    document.getElementById('emailStep').style.display = 'block';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginOTP').value = '';
    document.getElementById('loginError').textContent = '';
    document.getElementById('loginEmail').focus();
  },

  // Hide login modal
  hideModal() {
    document.getElementById('loginModal').classList.remove('show');
  },

  // Handle email submit → send OTP
  async handleEmailSubmit() {
    const email = document.getElementById('loginEmail').value.trim();
    const errorEl = document.getElementById('loginError');
    const btn = document.getElementById('emailSubmitBtn');

    if (!email || !email.includes('@')) {
      errorEl.textContent = 'Please enter a valid email';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending...';
    errorEl.textContent = '';

    try {
      await this.sendOTP(email);
      document.getElementById('otpEmail').textContent = email;
      document.getElementById('emailStep').style.display = 'none';
      document.getElementById('otpStep').style.display = 'block';
      document.getElementById('loginOTP').focus();
    } catch (err) {
      errorEl.textContent = err.message;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Verification Code';
    }
  },

  // Handle OTP submit → verify
  async handleOTPSubmit() {
    const email = document.getElementById('loginEmail').value.trim();
    const code = document.getElementById('loginOTP').value.trim();
    const errorEl = document.getElementById('loginError');
    const btn = document.getElementById('otpSubmitBtn');

    if (!code || code.length !== 6) {
      errorEl.textContent = 'Please enter the 6-digit code';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Verifying...';
    errorEl.textContent = '';

    try {
      await this.verifyOTP(email, code);
      this.hideModal();
      // Refresh data after login to get accurate queries_today
      try {
        const freshUser = await AUTH.getMe();
        if (freshUser) {
          AUTH.updateUI();
          const limit     = freshUser.queries_limit === 'unlimited' ? Infinity : parseInt(freshUser.queries_limit);
          const used      = freshUser.queries_today || 0;
          const remaining = limit === Infinity ? null : Math.max(0, limit - used);
          if (typeof updateUpgradeBar === 'function') {
            updateUpgradeBar(remaining, freshUser.tier);
          }
        }
      } catch { /* non-blocking */ }
    } catch (err) {
      errorEl.textContent = err.message;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Verify & Login';
    }
  },
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  AUTH.updateUI();

  // Refresh user data from server on every page load
  // This ensures queries_today and tier are always accurate
  if (AUTH.isLoggedIn()) {
    try {
      const freshUser = await AUTH.getMe();
      if (freshUser) {
        AUTH.updateUI();
        // Update upgrade bar with accurate remaining count
        const limit    = freshUser.queries_limit === 'unlimited' ? Infinity : parseInt(freshUser.queries_limit);
        const used     = freshUser.queries_today || 0;
        const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used);
        if (typeof updateUpgradeBar === 'function') {
          updateUpgradeBar(remaining === Infinity ? null : remaining, freshUser.tier);
        }
      }
    } catch { /* non-blocking — UI still works */ }
  }

  // Login button clicks
  document.getElementById('loginBtn')?.addEventListener('click', () => AUTH.showModal());
  document.getElementById('mobileLoginBtn')?.addEventListener('click', () => AUTH.showModal());

  // Modal close
  document.getElementById('loginModalClose')?.addEventListener('click', () => AUTH.hideModal());
  document.getElementById('loginModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'loginModal') AUTH.hideModal();
  });

  // Email submit
  document.getElementById('emailSubmitBtn')?.addEventListener('click', () => AUTH.handleEmailSubmit());
  document.getElementById('loginEmail')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') AUTH.handleEmailSubmit();
  });

  // OTP submit
  document.getElementById('otpSubmitBtn')?.addEventListener('click', () => AUTH.handleOTPSubmit());
  document.getElementById('loginOTP')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') AUTH.handleOTPSubmit();
  });

  // Back to email
  document.getElementById('backToEmail')?.addEventListener('click', () => {
    document.getElementById('otpStep').style.display = 'none';
    document.getElementById('emailStep').style.display = 'block';
    document.getElementById('loginError').textContent = '';
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => AUTH.logout());
  document.getElementById('mobileLogoutBtn')?.addEventListener('click', () => AUTH.logout());
});