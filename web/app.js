// =============================================
// Islamic Banking FTE — app.js
// System prompt server pe hai (api/chat.js)
// Browser mein sirf UI logic hai
// =============================================

// ─── SAFE HTML RENDERING ─────────────────────────────────────────────────────
function safeHtml(html) {
  if (typeof DOMPurify !== "undefined") {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "b",
        "i",
        "strong",
        "em",
        "ul",
        "ol",
        "li",
        "p",
        "br",
        "table",
        "tr",
        "td",
        "th",
        "thead",
        "tbody",
        "code",
        "pre",
        "h1",
        "h2",
        "h3",
        "h4",
        "div",
        "span",
        "a",
      ],
      ALLOWED_ATTR: ["href", "class", "target", "rel"],
    });
  }
  return html;
}

const API_URL = "/api/chat";
const SESSION_ID = crypto.randomUUID();

// ---- SLASH COMMANDS CONFIG ----
const SLASH_COMMANDS = {
  "/calculate": {
    prompt:
      "I want to calculate Islamic financing. Please ask me: (1) Product type — Murabaha, Ijara, or Musharakah? (2) Amount in PKR? (3) Annual profit rate %? (4) Tenure in years?",
    label: "📊 Calculator",
  },
  "/check-halal": {
    prompt:
      "I want to check if something is Shariah compliant. Please ask me what product, investment, or transaction I want to screen for halal status.",
    label: "✅ Halal Check",
  },
  "/zakat": {
    prompt:
      "I want to calculate my annual Zakat. Please guide me through the complete Zakat calculation — ask about my savings, gold, investments, and business assets one by one.",
    label: "🌙 Zakat Calculator",
  },
  "/compare": {
    prompt:
      "I want to compare Islamic banking products or banks. Please ask me: (1) What to compare — two products or two banks? (2) My specific need (home, car, business)? (3) Amount and tenure?",
    label: "⚖️ Compare",
  },
};

// ---- STATE ----
let conversationHistory = [];

// ---- DOM ----
const messagesEl = document.getElementById("messages");
const userInputEl = document.getElementById("userInput");
const sendBtnEl = document.getElementById("sendBtn");
const clearBtnEl = document.getElementById("clearBtn");

// ---- INIT ----
window.addEventListener("DOMContentLoaded", () => {
  showWelcome();
  setupEventListeners();

  // Show upgrade bar for anonymous users with default limit
  if (typeof AUTH === "undefined" || !AUTH.isLoggedIn()) {
    updateUpgradeBar(5, "free");
  }
});

// ---- EVENT LISTENERS ----
function setupEventListeners() {
  sendBtnEl.addEventListener("click", handleSend);

  userInputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  userInputEl.addEventListener("input", () => {
    // Auto-resize textarea
    userInputEl.style.height = "auto";
    userInputEl.style.height = Math.min(userInputEl.scrollHeight, 140) + "px";

    // Character counter
    const len = userInputEl.value.length;
    const countEl = document.getElementById("charCount");
    if (countEl) {
      countEl.textContent = len > 100 ? `${len}/2000` : "";
      countEl.className =
        "char-count" + (len > 1800 ? " limit" : len > 1500 ? " warn" : "");
    }
  });

  clearBtnEl.addEventListener("click", () => {
    conversationHistory = [];
    messagesEl.innerHTML = "";
    showWelcome();
  });

  document.querySelectorAll(".cmd-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      userInputEl.value = btn.getAttribute("data-cmd");
      handleSend();
    });
  });
}

// ---- WELCOME MESSAGE ----
function showWelcome() {
  appendMessage(
    "bot",
    `
    <div class="welcome-card">
      <div class="welcome-title">🕌 Assalamu Alaikum!</div>
      <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:0.75rem">
        Main aapka Islamic Banking Digital FTE hoon — 16 specialist skills ke saath.
        Kisi bhi Islamic finance sawaal ka jawab Urdu ya English mein de sakta hoon.
      </p>
      <div class="welcome-grid">
        <div class="welcome-item" onclick="sendQuick('/calculate murabaha')">📊 Murabaha Calculate</div>
        <div class="welcome-item" onclick="sendQuick('/zakat')">🌙 Zakat Calculate</div>
        <div class="welcome-item" onclick="sendQuick('/check-halal')">✅ Halal Check</div>
        <div class="welcome-item" onclick="sendQuick('Which Islamic bank is best in Pakistan?')">🏦 Best Bank?</div>
        <div class="welcome-item" onclick="sendQuick('What is Diminishing Musharakah?')">🤝 Musharakah</div>
        <div class="welcome-item" onclick="sendQuick('Explain Takaful insurance alternative')">🛡️ Takaful</div>
      </div>
      <div class="welcome-urdu">
        اردو میں بھی پوچھ سکتے ہیں · Roman Urdu bhi chalti hai
      </div>
    </div>
  `,
  );
}

// Helper — welcome card items click karne pe
function sendQuick(text) {
  userInputEl.value = text;
  handleSend();
}

// ---- PARSE SLASH COMMANDS ----
function parseCommand(input) {
  const trimmed = input.trim();
  for (const [cmd, config] of Object.entries(SLASH_COMMANDS)) {
    if (trimmed === cmd || trimmed.startsWith(cmd + " ")) {
      const args = trimmed.replace(cmd, "").trim();
      const fullPrompt = args
        ? config.prompt + "\n\nUser provided: " + args
        : config.prompt;
      return {
        isCommand: true,
        prompt: fullPrompt,
        label: config.label,
        original: trimmed,
      };
    }
  }
  return { isCommand: false, prompt: trimmed };
}

// ---- THINKING STATE ----
function setThinking(on) {
  document.body.classList.toggle("thinking", on);
  if (sendBtnEl) sendBtnEl.disabled = on;
}

// ---- UPGRADE BAR ----
function updateUpgradeBar(remaining, tier) {
  const bar = document.getElementById("upgradeBar");
  const leftEl = document.getElementById("queriesLeft");
  if (!bar) return;

  // Premium/Professional: hide bar completely
  if (tier === "premium" || tier === "professional") {
    bar.classList.add("upgrade-bar-hide");
    return;
  }

  // Free/anonymous: show bar
  bar.classList.remove("upgrade-bar-hide");
  bar.style.display = "flex";
  if (leftEl && remaining != null) leftEl.textContent = remaining;
}

// ---- MAIN SEND HANDLER ----
async function handleSend() {
  const rawInput = userInputEl.value.trim();
  if (!rawInput || sendBtnEl.disabled) return;

  const parsed = parseCommand(rawInput);

  appendMessage("user", escapeHtml(rawInput));
  userInputEl.value = "";
  userInputEl.style.height = "auto";

  // Reset char counter
  const countEl = document.getElementById("charCount");
  if (countEl) countEl.textContent = "";

  conversationHistory.push({ role: "user", parts: [{ text: parsed.prompt }] });

  setThinking(true);
  const typingId = showTyping();

  try {
    const reply = await callGemini();
    removeTyping(typingId);
    setThinking(false);
    appendMessage("bot", formatResponse(reply));
    conversationHistory.push({ role: "model", parts: [{ text: reply }] });
  } catch (err) {
    removeTyping(typingId);
    setThinking(false);
    appendMessage(
      "bot",
      `<span style="color:#c0392b">❌ Error: ${escapeHtml(err.message)}</span>`,
    );
  }

  userInputEl.focus();
}

// ---- GEMINI API CALL ----
async function callGemini() {
  const body = {
    contents: conversationHistory,
    session_id: SESSION_ID,
    user_email:
      typeof AUTH !== "undefined" && AUTH.isLoggedIn()
        ? AUTH.getUser()?.email
        : null,
  };

  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("ibf_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  // Update upgrade bar from response headers (api/chat.js sets these)
  const remaining = response.headers.get("X-RateLimit-Remaining");
  const tier = response.headers.get("X-RateLimit-Tier");
  if (remaining !== null) updateUpgradeBar(parseInt(remaining), tier || "free");

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));

    // Rate limit — show login/upgrade prompt
    if (response.status === 429) {
      const msg =
        typeof AUTH !== "undefined"
          ? `Daily limit reached. <a href="#" onclick="AUTH.showModal();return false;" style="color:var(--green-mid)">Login</a> for more queries, or <a href="pricing.html" style="color:var(--green-mid)">upgrade your plan</a>.`
          : `Daily limit reached. <a href="pricing.html" style="color:var(--green-mid)">Upgrade your plan →</a>`;
      appendMessage("bot", `<span style="color:#c0392b">⚠️ ${msg}</span>`);
    }

    const errorMsg =
      typeof err.error === "object"
        ? err.error.message || JSON.stringify(err.error)
        : err.error;
    throw new Error(errorMsg || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from AI");
  return text;
}

// ---- FORMAT RESPONSE (Markdown-lite) ----
function formatResponse(text) {
  let html = escapeHtml(text);

  // Code blocks
  html = html.replace(
    /```[\w]*\n?([\s\S]*?)```/g,
    (_, code) => `<pre><code>${code.trim()}</code></pre>`,
  );

  // Structured calculation cards — detect key-value patterns (3+ lines)
  html = html.replace(/(?:^|\n)((?:.+:.+\n?){3,})/gm, (match, block) => {
    const lines = block
      .trim()
      .split("\n")
      .filter((l) => l.includes(":"));
    if (lines.length < 3) return match;
    const rows = lines
      .map((line) => {
        const [label, ...rest] = line.split(":");
        const value = rest.join(":").trim();
        if (!value) return "";
        return `<div class="calc-card-row">
        <span class="calc-card-label">${label.trim()}</span>
        <span class="calc-card-value">${value}</span>
      </div>`;
      })
      .filter(Boolean);
    if (rows.length < 3) return match;
    return `<div class="calc-card">
      <div class="calc-card-header">📊 Calculation Result</div>
      <div class="calc-card-body">${rows.join("")}</div>
    </div>`;
  });

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  html = html.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");

  // Headers
  html = html.replace(
    /^## (.+)$/gm,
    '<p style="font-weight:700;color:#1a4731;margin-top:0.75rem;margin-bottom:0.25rem;font-size:0.95rem">$1</p>',
  );
  html = html.replace(
    /^# (.+)$/gm,
    '<p style="font-weight:700;color:#1a4731;margin-top:0.75rem;margin-bottom:0.25rem">$1</p>',
  );

  // Horizontal rule
  html = html.replace(
    /^─+$/gm,
    '<hr style="border:none;border-top:1px solid #dee2e6;margin:0.5rem 0">',
  );

  // Bullet lists
  html = html.replace(
    /^[•\-\*] (.+)$/gm,
    '<li style="margin-left:1.2rem;margin-bottom:0.2rem">$1</li>',
  );

  // Shariah disclaimer highlight box
  html = html.replace(
    /(⚠️ Shariah Disclaimer:[\s\S]*?)(?=\n\n|$)/g,
    '<div class="disclaimer">$1</div>',
  );

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p style="margin-top:0.5rem">');
  html = html.replace(/\n/g, "<br>");

  return `<p>${html}</p>`;
}

// ---- APPEND MESSAGE ----
function appendMessage(role, html) {
  const div = document.createElement("div");
  div.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "bot" ? "🕌" : "U";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = html;

  // Copy button — sirf bot messages pe, hover pe dikhta hai
  if (role === "bot") {
    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.onclick = () => {
      navigator.clipboard
        .writeText(bubble.innerText)
        .then(() => {
          copyBtn.textContent = "✓ Copied";
          copyBtn.classList.add("copied");
          setTimeout(() => {
            copyBtn.textContent = "Copy";
            copyBtn.classList.remove("copied");
          }, 2000);
        })
        .catch(() => {
          // Fallback for older browsers
          const range = document.createRange();
          range.selectNode(bubble);
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);
          document.execCommand("copy");
          window.getSelection().removeAllRanges();
          copyBtn.textContent = "✓ Copied";
          setTimeout(() => {
            copyBtn.textContent = "Copy";
          }, 2000);
        });
    };
    div.appendChild(avatar);
    div.appendChild(bubble);
    div.appendChild(copyBtn);
  } else {
    div.appendChild(avatar);
    div.appendChild(bubble);
  }

  messagesEl.appendChild(div);
  scrollToBottom();
  return div;
}

// ---- TYPING INDICATOR ----
function showTyping() {
  const id = "typing-" + Date.now();
  const div = document.createElement("div");
  div.className = "message bot typing-indicator";
  div.id = id;
  div.innerHTML = `
    <div class="avatar">🕌</div>
    <div class="bubble">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>`;
  messagesEl.appendChild(div);
  scrollToBottom();
  return id;
}

function removeTyping(id) {
  document.getElementById(id)?.remove();
}

// ---- HELPERS ----
function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── VOICE INPUT (Urdu/English) ──────────────────────────────────────────────
(function setupVoiceInput() {
  const voiceBtn = document.getElementById("voiceBtn");
  if (!voiceBtn) return;

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceBtn.style.display = "none";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "ur-PK";
  let isListening = false;

  voiceBtn.addEventListener("click", () => {
    if (isListening) {
      recognition.stop();
      return;
    }
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  });

  recognition.onstart = () => {
    isListening = true;
    voiceBtn.classList.add("listening");
    voiceBtn.textContent = "🔴";
  };
  recognition.onend = () => {
    isListening = false;
    voiceBtn.classList.remove("listening");
    voiceBtn.textContent = "🎤";
  };
  recognition.onresult = (event) => {
    const input = document.getElementById("userInput");
    if (!input) return;
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    input.value = transcript;
    if (event.results[event.results.length - 1].isFinal) {
      setTimeout(() => {
        const sendBtn = document.getElementById("sendBtn");
        if (sendBtn && input.value.trim()) sendBtn.click();
      }, 500);
    }
  };
  recognition.onerror = (e) => {
    isListening = false;
    voiceBtn.classList.remove("listening");
    voiceBtn.textContent = "🎤";
  };
})();
