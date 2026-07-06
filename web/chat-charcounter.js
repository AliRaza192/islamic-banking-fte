// Mobile sidebar toggle
const hamburgerBtn = document.getElementById("hamburgerBtn");
const sidebarClose = document.getElementById("sidebarClose");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebar = document.getElementById("sidebar");
const clearBtnMobile = document.getElementById("clearBtnMobile");
const clearBtn = document.getElementById("clearBtn");

function openSidebar() {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("show");
}
function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("show");
}

hamburgerBtn?.addEventListener("click", openSidebar);
sidebarClose?.addEventListener("click", closeSidebar);
sidebarOverlay?.addEventListener("click", closeSidebar);

// Close sidebar when command button clicked on mobile
document.querySelectorAll(".cmd-btn").forEach((btn) => {
  btn.addEventListener("click", closeSidebar);
});

// Mobile new chat button
clearBtnMobile?.addEventListener("click", () => {
  document.getElementById("clearBtn").click();
});

// 1. URDU TOGGLE
const urduToggleBtn = document.getElementById("urduToggle");
let urduMode = localStorage.getItem("ib_urdu") === "true";
function applyUrduMode(on) {
  document.body.classList.toggle("urdu-mode", on);
  if (urduToggleBtn)
    urduToggleBtn.style.background = on ? "var(--green-mid)" : "";
  if (urduToggleBtn) urduToggleBtn.style.color = on ? "white" : "";
}
applyUrduMode(urduMode);
urduToggleBtn?.addEventListener("click", () => {
  urduMode = !urduMode;
  localStorage.setItem("ib_urdu", urduMode);
  applyUrduMode(urduMode);
});

// 2. URL QUERY PARAM — ?q=... se auto-send
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q) {
    // URL clean karo
    window.history.replaceState({}, "", "/chat");
    // Thodi delay de taake welcome message aajaye
    setTimeout(() => {
      const input = document.getElementById("userInput");
      if (input) {
        input.value = q;
        document.getElementById("sendBtn")?.click();
      }
    }, 400);
  }
});

// 3. CHARACTER COUNTER
document
  .getElementById("userInput")
  ?.addEventListener("input", function () {
    const len = this.value.length;
    const el = document.getElementById("charCount");
    if (el) {
      el.textContent = len > 100 ? `${len}/2000` : "";
      el.className =
        "char-count" +
        (len > 1800 ? " limit" : len > 1500 ? " warn" : "");
    }
  });

// Character counter
