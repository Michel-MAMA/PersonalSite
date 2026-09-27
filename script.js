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

const contactForm = document.querySelector('#contact-form');
const attachmentInput = document.querySelector('#attachment');
attachmentInput?.addEventListener('change', () => {
  const fileName = document.querySelector('#file-name');
  fileName.textContent = attachmentInput.files?.[0]?.name ?? 'Aucun fichier sélectionné';
});

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const note = document.querySelector('#form-note');
  // Set this to the professional email address before publishing the site.
  const contactEmail = 'VOTRE_ADRESSE_EMAIL';
  if (contactEmail === 'VOTRE_ADRESSE_EMAIL') {
    note.textContent = 'Le formulaire est prêt, mais il faut encore configurer votre adresse e-mail dans script.js avant de pouvoir envoyer le message.';
    note.classList.add('error');
    return;
  }

  const formData = new FormData(contactForm);
  const subject = `Demande de contact — ${formData.get('requestType')}`;
  const selectedFile = attachmentInput?.files?.[0];
  const body = [
    `Nom : ${formData.get('name')}`,
    `E-mail : ${formData.get('email')}`,
    `Profil : ${formData.get('audience')}`,
    `Organisation : ${formData.get('organisation') || 'Non précisée'}`,
    `Type de demande : ${formData.get('requestType')}`,
    selectedFile ? `Document à joindre : ${selectedFile.name} (à ajouter manuellement dans ce message)` : 'Document à joindre : aucun',
    '',
    formData.get('message'),
  ].join('\n');
  window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  note.textContent = selectedFile
    ? `Votre logiciel de messagerie va s’ouvrir. Ajoutez-y le fichier « ${selectedFile.name} » avant d’envoyer.`
    : 'Votre logiciel de messagerie va s’ouvrir avec votre message prérempli.';
  note.classList.remove('error');
  note.classList.add('success');
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
