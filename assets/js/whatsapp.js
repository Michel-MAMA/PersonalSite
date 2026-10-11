export function initWhatsApp() {
  const whatsappWidget = document.querySelector('[data-wa-widget]');
  if (whatsappWidget) {
    const toggle = whatsappWidget.querySelector('[data-wa-toggle]');
    const panel = whatsappWidget.querySelector('[data-wa-panel]');
    const close = whatsappWidget.querySelector('[data-wa-close]');
    const setOpen = (open) => {
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) close.focus();
      else toggle.focus();
    };
    toggle.addEventListener('click', () => setOpen(panel.hidden));
    close.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) setOpen(false);
    });
  }
}
