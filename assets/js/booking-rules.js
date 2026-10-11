export const plans = {
    collectif: { name: 'Le Cercle · coaching collectif', count: 1, min: 1, max: 4, instructions: 'Choisissez de 1 à 4 créneaux du mois, le samedi ou le dimanche. Chaque groupe est limité à 10 personnes.' },
    solo: { name: 'Le Cap · coaching solo', count: 4, min: 4, max: 4, instructions: 'Choisissez quatre créneaux, un par semaine, le samedi ou le dimanche. Chaque rendez-vous dure 30 minutes.' },
    elite: { name: 'L’Intensif · coaching Élite', count: 4, min: 4, max: 4, instructions: 'Choisissez quatre créneaux, un par semaine, le samedi ou le dimanche. Chaque rendez-vous dure 1 h 30.' },
  };

export const hours = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];

export function localDate(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function mondayKey(value) {
  const date = new Date(value + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

function isWeekend(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && [0, 6].includes(date.getUTCDay());
}

export function validateSlots(plan, slots, month) {
  if (!plan || slots.length < plan.min || slots.length > plan.max) return 'Vérifiez le nombre de dates demandé pour cette formule.';
  if (slots.some(slot => !isWeekend(slot.date) || slot.date.slice(0, 7) !== month || !hours.includes(slot.time))) return 'Choisissez une date de week-end valide dans le mois sélectionné pour chaque séance.';
  if (new Set(slots.map(slot => slot.date + '|' + slot.time)).size !== slots.length) return 'Retirez les doublons de date et d’horaire.';
  if (plan.key !== 'collectif' && new Set(slots.map(slot => mondayKey(slot.date))).size !== 4) return 'Pour les formules individuelles, choisissez une date dans chacune de quatre semaines différentes.';
  return '';
}
