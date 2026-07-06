// Filter banks
function filterBanks(type, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const cards = document.querySelectorAll('.bank-card');
  cards.forEach(card => {
    if (type === 'all') {
      card.style.display = '';
    } else if (type === 'home') {
      card.style.display = card.dataset.products?.includes('home') ? '' : 'none';
    } else if (type === 'car') {
      card.style.display = card.dataset.products?.includes('car') ? '' : 'none';
    } else {
      card.style.display = card.dataset.type === type ? '' : 'none';
    }
  });

  // Show/hide sections
  ['full','window','micro'].forEach(s => {
    const section = document.getElementById('section-' + s);
    if (!section) return;
    const visible = section.querySelectorAll('.bank-card:not([style*="none"])').length;
    section.style.display = visible > 0 ? '' : 'none';
  });
}

// Switch comparison table
function switchCompare(type, btn) {
  document.querySelectorAll('.compare-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.compare-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('compare-' + type).classList.add('active');
}

// Ask AI about specific bank
function askAboutBank(bankName) {
  const q = `Tell me about ${bankName} — their Islamic products, profit rates, and is it a good choice for home/car financing?`;
  window.location.href = '/chat?q=' + encodeURIComponent(q);
}
