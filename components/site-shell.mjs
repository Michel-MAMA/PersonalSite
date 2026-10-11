const routeGroups = {
  home: ['index'],
  expertises: ['expertises', 'ai-security', 'agentic-ai', 'technologies', 'frameworks', 'industries'],
  about: ['apropos'],
  offers: ['accompagnements', 'entreprises', 'ai-transformation', 'ai-productivity', 'coaching', 'reconversion', 'formations'],
  resources: ['blog', 'article-parcours', 'realisations', 'academy', 'ressources', 'conferences', 'certifications'],
  certifications: ['certifications'],
  blog: ['blog', 'article-parcours'],
  contact: ['contact'],
};

const primary = (label, href, route, currentRoute) => {
  const isCurrent = href === `${currentRoute}.html`;
  const current = isCurrent ? ' aria-current="page"' : '';
  return `<a href="${href}"${current}>${label}</a>`;
};

function dropdown(label, key, currentRoute, links) {
  const groupRoutes = routeGroups[key] ?? [];
  const active = groupRoutes.includes(currentRoute) ? ' is-current' : '';
  const items = links.map(([text, href, route]) => primary(text, href, route, currentRoute)).join('');
  return `<div class="nav-dropdown"><button type="button" class="dropdown-toggle${active}" aria-expanded="false" aria-controls="nav-${key}">${label} <span aria-hidden="true">⌄</span></button><div id="nav-${key}" class="dropdown-menu">${items}</div></div>`;
}

export function renderHeader(currentRoute) {
  const nav = [
    primary('Accueil', 'index.html', 'home', currentRoute),
    dropdown('Accompagnements', 'offers', currentRoute, [
      ['Choisir mon accompagnement', 'accompagnements.html', 'accompagnements'],
      ['Former mon équipe', 'entreprises.html', 'entreprises'],
      ['Me former / me reconvertir', 'reconversion.html', 'reconversion'],
      ['Coaching carrière', 'coaching.html', 'coaching'],
      ['Tous les sujets de formation', 'formations.html', 'formations'],
    ]),
    dropdown('Domaines', 'expertises', currentRoute, [
      ['Vue d’ensemble', 'expertises.html', 'expertises'],
      ['Data Engineering', 'expertises.html#data-engineering', 'expertises'],
      ['AI Engineering', 'expertises.html#ai-engineering', 'expertises'],
      ['Data & AI Governance', 'expertises.html#gouvernance', 'expertises'],
      ['AI Security', 'ai-security.html', 'ai-security'],
      ['Cloud Computing', 'expertises.html#cloud-computing', 'expertises'],
      ['Observabilité & monitoring', 'expertises.html#observabilite', 'expertises'],
    ]),
    primary('À propos', 'apropos.html', 'about', currentRoute),
    dropdown('Ressources', 'resources', currentRoute, [
      ['Articles & conseils', 'blog.html', 'blog'],
      ['Ressources pour apprendre', 'ressources.html', 'ressources'],
      ['Certifications', 'certifications.html', 'certifications'],
      ['Réalisations', 'realisations.html', 'realisations'],
      ['Conférences', 'conferences.html', 'conferences'],
      ['Projets pédagogiques', 'academy.html', 'academy'],
    ]),
    primary('Parlons de votre besoin', 'contact.html', 'contact', currentRoute).replace('<a ', '<a class="nav-cta" '),
  ].join('');

  return `<header class="site-header"><a class="brand" href="index.html" aria-label="Accueil — Dr. Michel MAMA TOULOU"><img class="brand-logo" src="assets/michel-mama-toulou-logo.webp" alt=""><span class="brand-name">MICHEL<br>MAMA TOULOU</span></a><button type="button" class="menu-toggle" aria-expanded="false" aria-controls="navigation" aria-label="Ouvrir le menu"><span></span><span></span></button><nav id="navigation" class="nav" aria-label="Navigation principale">${nav}</nav></header>`;
}

function socialLinks() {
  return `<nav class="footer-social" aria-label="Suivez-moi"><span>SUIVEZ-MOI</span><a class="social-icon linkedin" href="https://www.linkedin.com/in/drmichelmamatoulou" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM8.34 18H5.67V9.4h2.67ZM7 8.22a1.55 1.55 0 1 1 .02-3.1A1.55 1.55 0 0 1 7 8.22ZM18.33 18h-2.66v-4.18c0-1-.02-2.28-1.39-2.28-1.39 0-1.6 1.08-1.6 2.2V18h-2.67V9.4h2.56v1.17h.04a2.8 2.8 0 0 1 2.52-1.39c2.69 0 3.2 1.77 3.2 4.07Z"/></svg></a><a class="social-icon whatsapp" href="https://wa.me/33767936461" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp · +33 7 67 93 64 61"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16.04 3C8.87 3 3.04 8.82 3.04 15.99c0 2.29.6 4.52 1.75 6.48L3 29l6.7-1.75a12.95 12.95 0 0 0 6.34 1.65h.01c7.17 0 13-5.83 13-13S23.21 3 16.04 3Zm0 23.7h-.01c-1.96 0-3.88-.53-5.56-1.53l-.4-.24-3.98 1.04 1.06-3.88-.26-.42a10.7 10.7 0 1 1 9.15 5.03Zm5.88-8.02c-.32-.16-1.9-.94-2.2-1.05-.3-.1-.51-.16-.73.16-.21.32-.83 1.05-1.02 1.27-.19.21-.38.24-.7.08-.32-.16-1.35-.5-2.57-1.58-.95-.84-1.6-1.88-1.79-2.2-.19-.32-.02-.5.14-.66.14-.14.32-.38.48-.57.16-.19.21-.32.32-.54.1-.21.05-.4-.03-.56-.08-.16-.73-1.75-1-2.4-.26-.63-.53-.54-.73-.55h-.62c-.22 0-.57.08-.86.4-.3.32-1.13 1.1-1.13 2.68s1.16 3.11 1.32 3.33c.16.21 2.28 3.48 5.52 4.88.77.33 1.37.53 1.84.68.77.24 1.47.2 2.02.12.62-.1 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.3-.22-.62-.38Z"/></svg></a><a class="social-icon facebook" href="https://www.facebook.com/michelmamatoulou" target="_blank" rel="noopener noreferrer" aria-label="Facebook · michelmamatoulou"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8.2h2.76l.41-3.2H13.5V7.56c0-.93.26-1.56 1.6-1.56h1.7V3.14A22.6 22.6 0 0 0 14.32 3c-2.46 0-4.14 1.5-4.14 4.26V9.6H7.4v3.2h2.78V21Z"/></svg></a><a class="social-icon tiktok" href="https://www.tiktok.com/@dr.michelmamatoulou" target="_blank" rel="noopener noreferrer" aria-label="TikTok · @dr.michelmamatoulou"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.9 2.9 0 0 1-2.9 2.9 2.9 2.9 0 1 1 2.9-2.9c0-.17-.02-.34-.05-.5V11.6a6.34 6.34 0 1 0 3.5 5.67V10.3a8.2 8.2 0 0 0 4.8 1.54V8.4a4.85 4.85 0 0 1-1.03-.11Z"/></svg></a></nav>`;
}

export function renderFooter() {
  return `<footer class="site-footer"><a class="brand footer-brand" href="index.html"><img class="brand-logo" src="assets/michel-mama-toulou-logo.webp" alt=""><span class="brand-name">MICHEL<br>MAMA TOULOU</span></a><span>DATA · AI · CLOUD · AI SECURITY</span><span>© <span class="year">2026</span> Dr. Michel MAMA TOULOU</span><a href="contact.html">Me contacter ↗</a>${socialLinks()}</footer>`;
}

export function renderWhatsAppWidget() {
  return `<aside class="whatsapp-widget" data-wa-widget><section class="whatsapp-panel" data-wa-panel id="whatsapp-panel" aria-labelledby="whatsapp-title" hidden><button class="whatsapp-close" type="button" data-wa-close aria-label="Fermer">×</button><p class="eyebrow">CONTACT DIRECT</p><h2 id="whatsapp-title">Un projet en tête&nbsp;?</h2><p>Écrivez-moi directement sur WhatsApp. Je vous répondrai dès que possible.</p><a class="whatsapp-cta" href="https://wa.me/33767936461?text=Bonjour%20Dr%20Michel%2C%20je%20vous%20contacte%20depuis%20votre%20site." target="_blank" rel="noopener noreferrer">Discuter sur WhatsApp <span aria-hidden="true">↗</span></a></section><button class="whatsapp-trigger" type="button" data-wa-toggle aria-expanded="false" aria-controls="whatsapp-panel" aria-label="Ouvrir le contact WhatsApp"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16.04 3C8.87 3 3.04 8.82 3.04 15.99c0 2.29.6 4.52 1.75 6.48L3 29l6.7-1.75a12.95 12.95 0 0 0 6.34 1.65h.01c7.17 0 13-5.83 13-13S23.21 3 16.04 3Zm0 23.7h-.01c-1.96 0-3.88-.53-5.56-1.53l-.4-.24-3.98 1.04 1.06-3.88-.26-.42a10.7 10.7 0 1 1 9.15 5.03Zm5.88-8.02c-.32-.16-1.9-.94-2.2-1.05-.3-.1-.51-.16-.73.16-.21.32-.83 1.05-1.02 1.27-.19.21-.38.24-.7.08-.32-.16-1.35-.5-2.57-1.58-.95-.84-1.6-1.88-1.79-2.2-.19-.32-.02-.5.14-.66.14-.14.32-.38.48-.57.16-.19.21-.32.32-.54.1-.21.05-.4-.03-.56-.08-.16-.73-1.75-1-2.4-.26-.63-.53-.54-.73-.55h-.62c-.22 0-.57.08-.86.4-.3.32-1.13 1.1-1.13 2.68s1.16 3.11 1.32 3.33c.16.21 2.28 3.48 5.52 4.88.77.33 1.37.53 1.84.68.77.24 1.47.2 2.02.12.62-.1 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.3-.22-.62-.38Z"/></svg></button></aside>`;
}