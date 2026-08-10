// Islamic Banking FTE — Privacy Page Language Toggle
document.addEventListener('DOMContentLoaded', () => {
  const enContent = document.getElementById('en-content');
  const urContent = document.getElementById('ur-content');
  const buttons = document.querySelectorAll('.lang-btn');

  if (!enContent || !urContent || !buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.textContent.includes('اردو') ? 'ur' : 'en';

      buttons.forEach(b => b.classList.remove('active'));

      if (lang === 'ur') {
        enContent.classList.add('hidden');
        urContent.classList.add('active');
        buttons[1].classList.add('active');
      } else {
        enContent.classList.remove('hidden');
        urContent.classList.remove('active');
        buttons[0].classList.add('active');
      }
    });
  });
});
