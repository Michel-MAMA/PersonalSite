export function initNavigation() {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.nav');
  if (!menuButton || !navigation) return;
  const dropdowns = [...navigation.querySelectorAll('.nav-dropdown')];

  const setMenuOpen = (open) => {
    navigation.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  const closeDropdowns = () => dropdowns.forEach(item => {
    item.classList.remove('open');
    item.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
  });
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    setMenuOpen(open);
    if (!open) closeDropdowns();
  });
  dropdowns.forEach(item => {
    const button = item.querySelector('.dropdown-toggle');
    button?.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      closeDropdowns();
      item.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
    });
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    setMenuOpen(false);
    closeDropdowns();
  }));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const activeDropdown = dropdowns.find(item => item.classList.contains('open') && item.contains(document.activeElement));
    if (activeDropdown) activeDropdown.querySelector('.dropdown-toggle')?.focus();
    else if (navigation.classList.contains('open') && navigation.contains(document.activeElement)) menuButton.focus();
    setMenuOpen(false);
    closeDropdowns();
  });
  document.addEventListener('click', event => {
    if (!navigation.contains(event.target) && !menuButton.contains(event.target)) {
      setMenuOpen(false);
      closeDropdowns();
    }
  });
}
