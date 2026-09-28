const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
  navigation?.classList.toggle('open', !isOpen);
});

document.querySelectorAll('.dropdown-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    button.closest('.nav-dropdown')?.classList.toggle('open', !isOpen);
  });
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Ouvrir le menu');
  });
});

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

const contactForm = document.querySelector('#contact-form');
const attachmentInput = document.querySelector('#attachment');
attachmentInput?.addEventListener('change', () => {
  const fileName = document.querySelector('#file-name');
  fileName.textContent = attachmentInput.files?.[0]?.name ?? 'Aucun fichier sélectionné';
});

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const note = document.querySelector('#form-note');
  const submitButton = contactForm.querySelector('[type="submit"]');
  const originalButtonText = submitButton.innerHTML;
  const supabaseUrl = 'https://gdgeghypyljichmzlbxv.supabase.co';
  const supabasePublishableKey = 'sb_publishable_ofvmsaxijbV3KwREGO0giw_mL37iVjm';

  submitButton.disabled = true;
  submitButton.textContent = 'Envoi en cours…';
  note.classList.remove('error', 'success');

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/contact-form`, {
      method: 'POST',
      headers: { apikey: supabasePublishableKey },
      body: new FormData(contactForm),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'La demande n’a pas pu être envoyée. Réessayez dans quelques instants.');

    note.textContent = result.emailNotified
      ? 'Merci, votre demande a bien été envoyée. Je vous répondrai dans les meilleurs délais.'
      : 'Merci, votre demande a bien été enregistrée. La notification e-mail sera activée prochainement.';
    note.classList.add('success');
    contactForm.reset();
    document.querySelector('#file-name').textContent = 'Aucun fichier sélectionné';
  } catch (error) {
    note.textContent = error.message || 'Une erreur est survenue. Vous pouvez écrire à contact@ai-learning-os.com.';
    note.classList.add('error');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
  }
});


document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    navigation?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.nav-dropdown.open').forEach((item) => {
      item.classList.remove('open');
      item.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    });
  }
});

const blogCards = [...document.querySelectorAll('.blog-feature[data-category]')];
const blogSearch = document.querySelector('#blog-search');
const blogFilters = [...document.querySelectorAll('.blog-filter')];
const blogResults = document.querySelector('#blog-results');
let activeBlogFilter = 'all';
function filterBlog() {
  if (!blogCards.length) return;
  const query = blogSearch?.value.trim().toLocaleLowerCase('fr') ?? '';
  let shown = 0;
  blogCards.forEach((card) => {
    const matchesCategory = activeBlogFilter === 'all' || card.dataset.category === activeBlogFilter;
    const matchesQuery = (card.dataset.search + ' ' + card.textContent).toLocaleLowerCase('fr').includes(query);
    card.hidden = !(matchesCategory && matchesQuery);
    if (!card.hidden) shown += 1;
  });
  if (blogResults) blogResults.textContent = shown ? `${shown} article${shown > 1 ? 's' : ''} affiché${shown > 1 ? 's' : ''}` : 'Aucun article publié ne correspond à cette recherche pour le moment.';
}
blogSearch?.addEventListener('input', filterBlog);
blogFilters.forEach((button) => button.addEventListener('click', () => {
  activeBlogFilter = button.dataset.filter ?? 'all';
  blogFilters.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  filterBlog();
}));
filterBlog();


document.querySelectorAll('[data-share-article]').forEach((button) => {
  button.addEventListener('click', async () => {
    const status = document.querySelector('[data-share-status]');
    const shareData = { title: document.title, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        if (status) status.textContent = 'Lien copié.';
      } else if (status) status.textContent = 'Copiez l’adresse de cette page depuis la barre du navigateur.';
    } catch (error) {
      if (error.name !== 'AbortError' && status) status.textContent = 'Le partage n’a pas abouti. Copiez le lien depuis la barre du navigateur.';
    }
  });
});
