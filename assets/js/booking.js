import { request } from './api.js';
import { plans, hours, localDate, validateSlots } from './booking-rules.js';
export function initBooking() {
  const coachingBooking = document.querySelector('[data-coaching-booking]');
  if (coachingBooking) {
    const bookingForm = coachingBooking.querySelector('[data-booking-form]');
    const slotList = coachingBooking.querySelector('[data-booking-slots]');
    const addSlotButton = coachingBooking.querySelector('[data-add-date]');
    const bookingMonth = coachingBooking.querySelector('[data-booking-month]');
    const bookingStatus = coachingBooking.querySelector('[data-booking-status]');
    const bookingApi = 'coaching-booking';
    let selectedPlan = null;
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    bookingMonth.min = currentMonth;
    bookingMonth.value = currentMonth;

    const setBookingStatus = (message, type = '') => {
      bookingStatus.textContent = message;
      bookingStatus.classList.remove('error', 'success', 'warning');
      if (type) bookingStatus.classList.add(type);
    };
    const getSlots = () => [...slotList.querySelectorAll('.booking-slot')].map((row) => ({ date: row.querySelector('[name="sessionDate"]').value, time: row.querySelector('[name="sessionTime"]').value }));
    const updateAddButton = () => {
      const count = slotList.querySelectorAll('.booking-slot').length;
      addSlotButton.hidden = !selectedPlan || count >= selectedPlan.max;
      addSlotButton.textContent = selectedPlan?.max === 4 ? '+ Ajouter une date' : '+ Ajouter une date (maximum 4)';
    };
    const checkSlot = async (row) => {
      const dateInput = row.querySelector('[name="sessionDate"]');
      const timeInput = row.querySelector('[name="sessionTime"]');
      const note = row.querySelector('.slot-availability');
      const version = String(Number(row.dataset.checkVersion ?? 0) + 1);
      row.dataset.checkVersion = version;
      dateInput.setCustomValidity('');
      note.textContent = '';
      note.className = 'slot-availability';
      if (!dateInput.value || !timeInput.value) return;
      const date = new Date(`${dateInput.value}T12:00:00`);
      if (![0, 6].includes(date.getDay())) { dateInput.setCustomValidity('Choisissez un samedi ou un dimanche.'); dateInput.reportValidity(); note.textContent = 'Les séances ont lieu le samedi ou le dimanche.'; note.classList.add('full'); return; }
      dateInput.setCustomValidity('');
      if (dateInput.value.slice(0, 7) !== bookingMonth.value) { dateInput.setCustomValidity('La date doit appartenir au mois sélectionné.'); dateInput.reportValidity(); note.textContent = 'Cette date est en dehors du mois choisi.'; note.classList.add('full'); return; }
      if (selectedPlan?.key !== 'collectif') return;
      try {
        const data = await request(`${bookingApi}?date=${encodeURIComponent(dateInput.value)}&time=${encodeURIComponent(timeInput.value)}`);
        if (row.dataset.checkVersion !== version || !row.isConnected) return;
        note.textContent = data.remaining > 0 ? `${data.remaining} place${data.remaining > 1 ? 's' : ''} disponible${data.remaining > 1 ? 's' : ''} sur 10.` : 'Ce créneau est complet. Choisissez une autre date ou un autre horaire.';
        note.classList.add(data.remaining > 0 ? 'available' : 'full');
      } catch {
        if (row.dataset.checkVersion !== version || !row.isConnected) return;
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
      hours.forEach((hour) => time.add(new Option(hour, hour)));
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
      if (!plans[planKey]) return;
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
      const validationError = validateSlots(selectedPlan, slots, bookingMonth.value);
      if (validationError) { setBookingStatus(validationError, 'error'); return; }
      const submit = bookingForm.querySelector('[data-booking-submit]');
      submit.disabled = true; submit.textContent = 'Envoi en cours…';
      const data = new FormData(bookingForm);
      try {
        const result = await request(bookingApi, { method: 'POST', body: JSON.stringify({ action: 'book', plan: selectedPlan.key, month: data.get('month'), name: data.get('name'), email: data.get('email'), goal: data.get('goal'), sessions: slots, consent: data.get('consent') === 'on', website: data.get('website') }) });
        const confirmation = result.confirmationSent ? 'Un accusé de réception vous a été envoyé par e-mail ; les créneaux restent à confirmer.' : result.emailNotified ? 'Votre demande a été transmise. Les créneaux restent à confirmer par e-mail.' : 'Votre demande est enregistrée, mais la notification e-mail est indisponible. Contactez contact@ai-learning-os.com pour confirmer.';
        setBookingStatus(confirmation, result.emailNotified ? 'success' : 'warning');
        bookingForm.reset(); bookingMonth.value = currentMonth;
      } catch (error) { setBookingStatus(error.message, 'error'); }
      finally { submit.disabled = false; submit.innerHTML = 'Envoyer ma demande <span>↗</span>'; }
    });
  }
}
