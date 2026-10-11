import { request } from './api.js';
import { initContactContext } from './contact-context.js';
export function initContact() {
  const contactForm = document.querySelector('#contact-form');
  if (!contactForm) return;
  initContactContext(contactForm, window.location.search);
  const attachmentInput = document.querySelector('#attachment');
  attachmentInput?.addEventListener('change', () => {
    const fileName = document.querySelector('#file-name');
    if (fileName) fileName.textContent = attachmentInput.files?.[0]?.name ?? 'Aucun fichier sélectionné';
  });

  contactForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const note = document.querySelector('#form-note');
    const submitButton = contactForm.querySelector('[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    submitButton.disabled = true;
    submitButton.textContent = 'Envoi en cours…';
    note.classList.remove('error', 'success');

    try {
      const data = new FormData(contactForm);
      if (contactForm.dataset.contactDomain) data.set('message', 'Domaine souhaité : ' + contactForm.dataset.contactDomain + '\n\n' + data.get('message'));
      const result = await request('contact-form', { method: 'POST', body: data });

      note.textContent = result.emailNotified
        ? 'Merci, votre demande a bien été envoyée. Je vous répondrai dans les meilleurs délais.'
        : 'Merci, votre demande a bien été enregistrée. La notification e-mail sera activée prochainement.';
      note.classList.add('success');
      contactForm.reset();
      const fileName = document.querySelector('#file-name');
      if (fileName) fileName.textContent = 'Aucun fichier sélectionné';
    } catch (error) {
      note.textContent = error.message || 'Une erreur est survenue. Vous pouvez écrire à contact@ai-learning-os.com.';
      note.classList.add('error');
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  });
}
