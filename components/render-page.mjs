import { renderFooter, renderHeader, renderWhatsAppWidget } from './site-shell.mjs';

export function renderPage(page, source) {
  const route = page.replace(/\.html$/, '');
  const fragments = [
    ['<!-- SITE_HEADER -->', renderHeader(route)],
    ['<!-- SITE_FOOTER -->', renderFooter()],
    ['<!-- WHATSAPP_WIDGET -->', renderWhatsAppWidget()],
  ];
  let html = source;
  for (const [marker, markup] of fragments) {
    const occurrences = html.split(marker).length - 1;
    if (occurrences !== 1) throw new Error(page + ': expected one ' + marker + ', found ' + occurrences + '.');
    html = html.replace(marker, markup);
  }
  return html;
}
