// ─── DEMO CHAT ANIMATION ───
const demoConversation = [
  {
    role: 'user',
    text: 'Mujhe PKR 50 lakh ka ghar Murabaha pe lena hai. Monthly installment kitni hogi?',
    skill: '● murabaha-specialist'
  },
  {
    role: 'bot',
    text: `<strong>Murabaha Home Finance — PKR 50 Lakh</strong><br><br>
Zaroor! Meezan Bank ka Murabaha structure mein yeh calculation hogi:
<div class="demo-calc-card">
  <div class="demo-calc-row"><span>Asset Price</span><span>PKR 50,00,000</span></div>
  <div class="demo-calc-row"><span>Annual Profit Rate</span><span>22% (SBP KIBOR + spread)</span></div>
  <div class="demo-calc-row"><span>Tenure</span><span>20 years (240 months)</span></div>
  <div class="demo-calc-row"><span>Bank Markup</span><span>PKR 2,20,00,000</span></div>
  <div class="demo-calc-row"><span>Monthly Qist ✓</span><span>PKR 1,12,500</span></div>
</div>`,
    skill: '● murabaha-specialist'
  },
  {
    role: 'user',
    text: 'Kya yeh Shariah compliant hai? Riba toh nahi?',
    skill: '● shariah-compliance-checker'
  },
  {
    role: 'bot',
    text: `<strong>✅ Halal — Shariah Compliant</strong><br><br>
Murabaha mein Riba <em>nahi</em> hota. Farq yeh hai:<br><br>
• <strong>Riba:</strong> Paise pe paise — haram ہے<br>
• <strong>Murabaha:</strong> Bank asset khareedta hai, aapko cost+profit pe bechta hai — <strong>halal ہے</strong><br><br>
AAOIFI FAS-2 standard ke tehat yeh structure approved hai. Meezan Bank ka Murabaha fully SBP-regulated hai. 🕌`,
    skill: '● shariah-compliance-checker'
  }
];

let msgIndex = 0;
const messagesEl = document.getElementById('demoMessages');
const skillTag = document.getElementById('demoSkillTag');
const demoInput = document.getElementById('demoInput');

const demoInputTexts = [
  'Murabaha pe PKR 50 lakh ka ghar lena chahta hoon...',
  '',
  'Kya yeh Riba nahi hai?',
  ''
];

function showNextDemoMessage() {
  if (msgIndex >= demoConversation.length) {
    setTimeout(() => {
      messagesEl.innerHTML = '';
      msgIndex = 0;
      setTimeout(showNextDemoMessage, 800);
    }, 5000);
    return;
  }

  const msg = demoConversation[msgIndex];
  skillTag.textContent = msg.skill;

  if (msg.role === 'user') {
    demoInput.value = demoInputTexts[msgIndex] || '';
    const div = document.createElement('div');
    div.className = 'demo-msg user';
    div.innerHTML = `
      <div class="demo-avatar user">U</div>
      <div class="demo-bubble user">${msg.text}</div>`;
    messagesEl.appendChild(div);
    setTimeout(() => div.classList.add('visible'), 50);
    msgIndex++;
    setTimeout(showNextDemoMessage, 1200);
  } else {
    // Show typing first
    const typing = document.createElement('div');
    typing.className = 'demo-msg bot visible';
    typing.innerHTML = `
      <div class="demo-avatar bot">🕌</div>
      <div class="demo-bubble bot">
        <div class="demo-typing"><span></span><span></span><span></span></div>
      </div>`;
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const div = document.createElement('div');
      div.className = 'demo-msg bot';
      div.innerHTML = `
        <div class="demo-avatar bot">🕌</div>
        <div class="demo-bubble bot">${msg.text}</div>`;
      messagesEl.appendChild(div);
      setTimeout(() => div.classList.add('visible'), 50);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      msgIndex++;
      setTimeout(showNextDemoMessage, 3000);
    }, 1800);
  }
}

setTimeout(showNextDemoMessage, 1200);

// ─── PRICING TOGGLE ───
function setToggle(btn, mode) {
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const mult = mode === 'yearly' ? 0.8 : 1;
  document.querySelectorAll('.monthly-val').forEach(el => {
    const base = parseFloat(el.dataset.base || el.textContent);
    el.dataset.base = base;
    el.textContent = mode === 'yearly' ? Math.round(base * mult) : base;
  });
  document.querySelectorAll('.monthly-pkr').forEach(el => {
    if (mode === 'yearly') {
      el.textContent = el.textContent
        .replace('PKR 1,500 / month', 'PKR 1,200 / month (billed annually)')
        .replace('PKR 15,000 / month', 'PKR 12,000 / month (billed annually)');
    } else {
      el.textContent = el.textContent
        .replace('PKR 1,200 / month (billed annually)', 'PKR 1,500 / month · Stripe or JazzCash')
        .replace('PKR 12,000 / month (billed annually)', 'PKR 15,000 / month · For banks & fintechs');
    }
  });
}

// ─── SCROLL REVEAL ───
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .step').forEach(el => observer.observe(el));
