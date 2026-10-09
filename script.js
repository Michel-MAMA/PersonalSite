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

const engagementBlocks = [...document.querySelectorAll('[data-blog-engagement]')];
if (engagementBlocks.length) {
  const apiUrl = 'https://gdgeghypyljichmzlbxv.supabase.co/functions/v1/blog-engagement';
  const publicKey = 'sb_publishable_ofvmsaxijbV3KwREGO0giw_mL37iVjm';
  let visitorId;
  try {
    visitorId = localStorage.getItem('site-blog-visitor-id');
    if (!visitorId) { visitorId = crypto.randomUUID(); localStorage.setItem('site-blog-visitor-id', visitorId); }
  } catch { visitorId = crypto.randomUUID(); }

  engagementBlocks.forEach((block) => {
    const slug = block.dataset.articleSlug;
    const likeButton = block.querySelector('[data-like-button]');
    const likeCount = block.querySelector('[data-like-count]');
    const commentsList = block.querySelector('[data-comment-list]');
    const commentsCount = block.querySelector('[data-comment-count]');
    const form = block.querySelector('[data-comment-form]');
    const status = block.querySelector('[data-engagement-status]');
    if (slug === 'slug-a-remplacer') { block.hidden = true; return; }
    const announce = (message, kind = '') => {
      if (!status) return;
      status.textContent = message;
      status.classList.remove('error', 'success');
      if (kind) status.classList.add(kind);
    };
    const request = async (url, options = {}) => {
      const response = await fetch(url, { ...options, headers: { apikey: publicKey, ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Le service est temporairement indisponible.');
      return result;
    };
    const renderComments = (comments) => {
      if (!commentsList || !commentsCount) return;
      commentsList.replaceChildren();
      commentsCount.textContent = `(${comments.length})`;
      if (!comments.length) {
        const empty = document.createElement('li');
        empty.className = 'comment-empty';
        empty.textContent = 'Aucun commentaire publié. Soyez le premier à réagir.';
        commentsList.append(empty);
        return;
      }
      comments.forEach((comment) => {
        const item = document.createElement('li');
        item.className = 'comment-item';
        const author = document.createElement('strong');
        author.textContent = comment.author_name;
        const body = document.createElement('p');
        body.textContent = comment.body;
        item.append(author, body);
        commentsList.append(item);
      });
    };
    const refresh = async () => {
      const data = await request(`${apiUrl}?slug=${encodeURIComponent(slug)}&visitorId=${encodeURIComponent(visitorId)}`);
      if (likeCount) likeCount.textContent = String(data.likes);
      likeButton?.setAttribute('aria-pressed', String(data.liked));
      if (likeButton) likeButton.querySelector('span').textContent = data.liked ? '♥' : '♡';
      renderComments(data.comments);
    };
    refresh().catch(() => announce('Les réactions seront disponibles dès que le service du blog sera activé.', 'error'));
    likeButton?.addEventListener('click', async () => {
      likeButton.disabled = true;
      const liked = likeButton.getAttribute('aria-pressed') !== 'true';
      try {
        const result = await request(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'like', slug, visitorId, liked }) });
        if (likeCount) likeCount.textContent = String(result.likes);
        likeButton.setAttribute('aria-pressed', String(result.liked));
        likeButton.querySelector('span').textContent = result.liked ? '♥' : '♡';
      } catch (error) { announce(error.message, 'error'); }
      finally { likeButton.disabled = false; }
    });
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submit = form.querySelector('[type="submit"]');
      const data = new FormData(form);
      submit.disabled = true;
      try {
        await request(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'comment', slug, visitorId, name: data.get('name'), body: data.get('body'), website: data.get('website') }) });
        form.reset();
        announce('Merci ! Votre commentaire sera visible après validation.', 'success');
      } catch (error) { announce(error.message, 'error'); }
      finally { submit.disabled = false; }
    });
  });
}
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
const coachingBooking = document.querySelector('[data-coaching-booking]');
if (coachingBooking) {
  const bookingForm = coachingBooking.querySelector('[data-booking-form]');
  const slotList = coachingBooking.querySelector('[data-booking-slots]');
  const addSlotButton = coachingBooking.querySelector('[data-add-date]');
  const bookingMonth = coachingBooking.querySelector('[data-booking-month]');
  const bookingStatus = coachingBooking.querySelector('[data-booking-status]');
  const bookingApi = 'https://gdgeghypyljichmzlbxv.supabase.co/functions/v1/coaching-booking';
  const bookingKey = 'sb_publishable_ofvmsaxijbV3KwREGO0giw_mL37iVjm';
  const plans = {
    collectif: { name: 'Le Cercle · coaching collectif', count: 1, min: 1, max: 4, instructions: 'Choisissez de 1 à 4 créneaux du mois, le samedi ou le dimanche. Chaque groupe est limité à 10 personnes.' },
    solo: { name: 'Le Cap · coaching solo', count: 4, min: 4, max: 4, instructions: 'Choisissez quatre créneaux, un par semaine, le samedi ou le dimanche. Chaque rendez-vous dure 30 minutes.' },
    elite: { name: 'L’Intensif · coaching Élite', count: 4, min: 4, max: 4, instructions: 'Choisissez quatre créneaux, un par semaine, le samedi ou le dimanche. Chaque rendez-vous dure 1 h 30.' },
  };
  let selectedPlan = null;
  const today = new Date();
  const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  bookingMonth.min = currentMonth;
  bookingMonth.value = currentMonth;

  const setBookingStatus = (message, type = '') => {
    bookingStatus.textContent = message;
    bookingStatus.classList.remove('error', 'success', 'warning');
    if (type) bookingStatus.classList.add(type);
  };
  const requestBooking = async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { apikey: bookingKey, ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Le service de réservation est temporairement indisponible.');
    return result;
  };
  const getSlots = () => [...slotList.querySelectorAll('.booking-slot')].map((row) => ({ date: row.querySelector('[name="sessionDate"]').value, time: row.querySelector('[name="sessionTime"]').value }));
  const updateAddButton = () => {
    const count = slotList.querySelectorAll('.booking-slot').length;
    addSlotButton.hidden = !selectedPlan || count >= selectedPlan.max;
    addSlotButton.textContent = selectedPlan?.max === 4 ? '+ Ajouter une date' : '+ Ajouter une date (maximum 4)';
  };
  const mondayKey = (value) => {
    const date = new Date(`${value}T12:00:00`);
    const day = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - day);
    return localDate(date);
  };
  const checkSlot = async (row) => {
    const dateInput = row.querySelector('[name="sessionDate"]');
    const timeInput = row.querySelector('[name="sessionTime"]');
    const note = row.querySelector('.slot-availability');
    note.textContent = '';
    note.className = 'slot-availability';
    if (!dateInput.value || !timeInput.value) return;
    const date = new Date(`${dateInput.value}T12:00:00`);
    if (![0, 6].includes(date.getDay())) { dateInput.setCustomValidity('Choisissez un samedi ou un dimanche.'); dateInput.reportValidity(); note.textContent = 'Les séances ont lieu le samedi ou le dimanche.'; note.classList.add('full'); return; }
    dateInput.setCustomValidity('');
    if (dateInput.value.slice(0, 7) !== bookingMonth.value) { dateInput.setCustomValidity('La date doit appartenir au mois sélectionné.'); dateInput.reportValidity(); note.textContent = 'Cette date est en dehors du mois choisi.'; note.classList.add('full'); return; }
    if (selectedPlan?.key !== 'collectif') return;
    try {
      const data = await requestBooking(`${bookingApi}?date=${encodeURIComponent(dateInput.value)}&time=${encodeURIComponent(timeInput.value)}`);
      note.textContent = data.remaining > 0 ? `${data.remaining} place${data.remaining > 1 ? 's' : ''} disponible${data.remaining > 1 ? 's' : ''} sur 10.` : 'Ce créneau est complet. Choisissez une autre date ou un autre horaire.';
      note.classList.add(data.remaining > 0 ? 'available' : 'full');
      dateInput.dataset.remaining = String(data.remaining);
    } catch {
      note.textContent = 'La disponibilité sera vérifiée à l’envoi de votre demande.';
      note.classList.add('warning');
    }
  };
  const addBookingSlot = (removable = true) => {
    const row = document.createElement('div');
    row.className = 'booking-slot';
    const dateLabel = document.createElement('label');
    dateLabel.textContent = `Date ${slotList.children.length + 1}`;
    const date = document.createElement('input');
    date.type = 'date'; date.name = 'sessionDate'; date.required = true; date.min = localDate(today);
    dateLabel.append(date);
    const timeLabel = document.createElement('label');
    timeLabel.textContent = 'Heure';
    const time = document.createElement('select'); time.name = 'sessionTime'; time.required = true;
    const placeholder = new Option('Choisir', ''); placeholder.disabled = true; placeholder.selected = true; time.add(placeholder);
    ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'].forEach((hour) => time.add(new Option(hour, hour)));
    timeLabel.append(time);
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'booking-remove-date'; remove.textContent = '×'; remove.setAttribute('aria-label', 'Retirer cette date'); remove.hidden = !removable;
    remove.addEventListener('click', () => { row.remove(); [...slotList.children].forEach((item, index) => { item.querySelector('label').firstChild.textContent = `Date ${index + 1}`; }); updateAddButton(); });
    const note = document.createElement('p'); note.className = 'slot-availability'; note.setAttribute('aria-live', 'polite');
    date.addEventListener('change', () => checkSlot(row));
    time.addEventListener('change', () => checkSlot(row));
    row.append(dateLabel, timeLabel, remove, note);
    slotList.append(row);
    updateAddButton();
  };

  document.querySelectorAll('[data-coaching-select]').forEach((button) => button.addEventListener('click', () => {
    const planKey = button.dataset.coachingSelect;
    selectedPlan = { key: planKey, ...plans[planKey] };
    slotList.replaceChildren();
    bookingForm.reset();
    bookingMonth.value = currentMonth;
    bookingForm.querySelector('[data-plan-value]').value = planKey;
    coachingBooking.querySelector('[data-selected-plan]').textContent = selectedPlan.name;
    coachingBooking.querySelector('[data-plan-instructions]').textContent = selectedPlan.instructions;
    for (let i = 0; i < selectedPlan.count; i += 1) addBookingSlot(selectedPlan.max > 1);
    if (selectedPlan.max === 4 && selectedPlan.min === 4) addSlotButton.hidden = true;
    coachingBooking.hidden = false;
    setBookingStatus('Les demandes sont confirmées par e-mail après vérification des disponibilités.');
    coachingBooking.scrollIntoView({ behavior: 'smooth', block: 'start' });
    bookingForm.querySelector('[name="name"]').focus({ preventScroll: true });
  }));
  addSlotButton.addEventListener('click', () => { if (slotList.children.length < (selectedPlan?.max ?? 0)) addBookingSlot(true); });
  bookingMonth.addEventListener('change', () => {
    slotList.querySelectorAll('.booking-slot').forEach((row) => { row.querySelector('[name="sessionDate"]').setCustomValidity(''); checkSlot(row); });
  });
  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const slots = getSlots();
    if (!selectedPlan || slots.length < selectedPlan.min || slots.length > selectedPlan.max) { setBookingStatus('Vérifiez le nombre de dates demandé pour cette formule.', 'error'); return; }
    if (slots.some((slot) => !slot.date || !slot.time || slot.date.slice(0, 7) !== bookingMonth.value || ![0, 6].includes(new Date(`${slot.date}T12:00:00`).getDay()))) { setBookingStatus('Choisissez une date de week-end valide dans le mois sélectionné pour chaque séance.', 'error'); return; }
    if (new Set(slots.map((slot) => `${slot.date}|${slot.time}`)).size !== slots.length) { setBookingStatus('Retirez les doublons de date et d’horaire.', 'error'); return; }
    if (selectedPlan.key !== 'collectif' && new Set(slots.map((slot) => mondayKey(slot.date))).size !== 4) { setBookingStatus('Pour les formules individuelles, choisissez une date dans chacune de quatre semaines différentes.', 'error'); return; }
    const submit = bookingForm.querySelector('[data-booking-submit]');
    submit.disabled = true; submit.textContent = 'Envoi en cours…';
    const data = new FormData(bookingForm);
    try {
      const result = await requestBooking(bookingApi, { method: 'POST', body: JSON.stringify({ action: 'book', plan: selectedPlan.key, month: data.get('month'), name: data.get('name'), email: data.get('email'), goal: data.get('goal'), sessions: slots, consent: data.get('consent') === 'on', website: data.get('website') }) });
      const confirmation = result.confirmationSent ? 'Un accusé de réception vous a été envoyé par e-mail ; les créneaux restent à confirmer.' : result.emailNotified ? 'Votre demande a été transmise. Les créneaux restent à confirmer par e-mail.' : 'Votre demande est enregistrée, mais la notification e-mail est indisponible. Contactez contact@ai-learning-os.com pour confirmer.';
      setBookingStatus(confirmation, result.emailNotified ? 'success' : 'warning');
      bookingForm.reset(); bookingMonth.value = currentMonth;
    } catch (error) { setBookingStatus(error.message, 'error'); }
    finally { submit.disabled = false; submit.innerHTML = 'Envoyer ma demande <span>↗</span>'; }
  });
}