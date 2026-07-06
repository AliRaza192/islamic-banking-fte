let currentMode = "monthly";

function setMode(mode, btn) {
  currentMode = mode;
  document
    .querySelectorAll(".toggle-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  if (mode === "yearly") {
    document.getElementById("premiumPrice").textContent = "4";
    document.getElementById("premiumPkr").textContent =
      "PKR 1,200 / month (billed annually)";
    document.getElementById("proPrice").textContent = "40";
    document.getElementById("proPkr").textContent =
      "PKR 12,000 / month (billed annually)";
  } else {
    document.getElementById("premiumPrice").textContent = "5";
    document.getElementById("premiumPkr").textContent =
      "PKR 1,500 / month · Stripe or JazzCash";
    document.getElementById("proPrice").textContent = "50";
    document.getElementById("proPkr").textContent =
      "PKR 15,000 / month · For banks & fintechs";
  }
}

function showToast(msg, type) {
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 5000);
}

async function handlePlan(tier, provider) {
  if (tier === "free") {
    window.location.href = AUTH.isLoggedIn() ? "/" : "#";
    if (!AUTH.isLoggedIn()) AUTH.showModal();
    return;
  }

  if (!AUTH.isLoggedIn()) {
    AUTH.showModal();
    return;
  }

  const btnId = tier === "premium" ? "premiumBtn" : "proBtn";
  const btn = document.getElementById(btnId);
  const orig = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Redirecting...";

  try {
    const res = await fetch("/api/payments/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ tier, provider: provider || "stripe" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Checkout failed");

    if (data.provider === "jazzcash" && data.params) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.form_action;
      for (const [k, v] of Object.entries(data.params)) {
        const inp = document.createElement("input");
        inp.type = "hidden";
        inp.name = k;
        inp.value = v;
        form.appendChild(inp);
      }
      document.body.appendChild(form);
      form.submit();
    } else {
      window.location.href = data.checkout_url;
    }
  } catch (err) {
    showToast(err.message, "error");
    btn.disabled = false;
    btn.textContent = orig;
  }
}

// Customer Portal — manage/cancel subscription
async function openCustomerPortal() {
  if (!AUTH.isLoggedIn()) { AUTH.showModal(); return; }
  const btn = event?.target || document.activeElement;
  const origText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Opening...";
  try {
    const res = await fetch("/api/payments/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not open portal");
    window.location.href = data.portal_url;
  } catch (err) {
    showToast(err.message, "error");
    btn.disabled = false;
    btn.textContent = origText;
  }
}

// URL param toast
const p = new URLSearchParams(window.location.search);
if (p.get("payment") === "success")
  showToast("🎉 Payment successful! Your plan is now active.", "success");
if (p.get("payment") === "cancelled")
  showToast("Payment cancelled. You can try again anytime.", "error");
if (p.get("payment"))
  window.history.replaceState({}, "", "/pricing.html");

// Mark current plan buttons
document.addEventListener("DOMContentLoaded", () => {
  const user = AUTH.getUser();
  if (!user) return;
  if (user.tier === "free") {
    const b = document.getElementById("freeBtn");
    b.textContent = "✓ Current Plan";
    b.className = "cta-btn cta-current";
    b.disabled = true;
  }
  if (user.tier === "premium") {
    const b = document.getElementById("premiumBtn");
    b.textContent = "✓ Current Plan";
    b.className = "cta-btn cta-current";
    b.disabled = true;
    const mg = document.createElement("button");
    mg.textContent = "Manage / Cancel →";
    mg.className = "cta-btn";
    mg.style.cssText = "margin-top:.5rem;background:none;border:1.5px solid rgba(255,255,255,.3);font-size:.78rem";
    mg.addEventListener("click", openCustomerPortal);
    b.parentNode.appendChild(mg);
  }
  if (user.tier === "professional") {
    const b = document.getElementById("proBtn");
    b.textContent = "✓ Current Plan";
    b.className = "cta-btn cta-current";
    b.disabled = true;
    const mg = document.createElement("button");
    mg.textContent = "Manage / Cancel →";
    mg.className = "cta-btn";
    mg.style.cssText = "margin-top:.5rem;background:none;border:1.5px solid rgba(255,255,255,.3);font-size:.78rem";
    mg.addEventListener("click", openCustomerPortal);
    b.parentNode.appendChild(mg);
  }
});
