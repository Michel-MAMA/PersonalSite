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
