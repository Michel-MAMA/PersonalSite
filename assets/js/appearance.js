export function initAppearance() {
  document.querySelectorAll('.year').forEach((year) => {
    year.textContent = new Date().getFullYear();
  });

  const cardExtras = new Set(['cert-item', 'cert-extra', 'platform-step', 'how-step', 'platform-empty', 'offer-row', 'art-node']);
  document.querySelectorAll('[class]').forEach((card) => {
    if (![...card.classList].some((className) => className.endsWith('card') || cardExtras.has(className))) return;
    card.classList.add('has-card-glow');
    const glow = document.createElement('span');
    glow.className = 'card-glow';
    glow.setAttribute('aria-hidden', 'true');
    card.append(glow);
  });
}
