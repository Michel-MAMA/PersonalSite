const journeys = {
  entreprise: { audience: 'Entreprise / équipe', requestType: 'Formation pour une équipe', label: 'Formation en entreprise', placeholder: 'Nombre de participants, niveau actuel, sujets souhaités, outils et calendrier…' },
  reconversion: { audience: 'Personne en reconversion', requestType: 'Accompagnement à la reconversion', label: 'Formation & reconversion', placeholder: 'Votre parcours, le métier ou domaine qui vous intéresse, vos acquis et vos disponibilités…' },
  coaching: { audience: 'Professionnel·le', requestType: 'Coaching professionnel', label: 'Coaching carrière', placeholder: 'Recrutement, blocage ou évolution : votre situation et l’objectif que vous souhaitez travailler…' },
  orientation: { requestType: 'Aide pour choisir mon accompagnement', label: 'Choisir mon accompagnement', placeholder: 'Votre situation actuelle et ce que vous aimeriez faire avancer…' },
};
const domains = { 'data-engineering': 'Data Engineering', 'ai-engineering': 'AI Engineering', gouvernance: 'Data & AI Governance', 'ai-security': 'AI Security', 'cloud-computing': 'Cloud Computing', observabilite: 'Observabilité & monitoring' };

export function getContactContext(search) {
  const params = new URLSearchParams(search);
  const journey = Object.hasOwn(journeys, params.get('parcours')) ? journeys[params.get('parcours')] : null;
  const domain = Object.hasOwn(domains, params.get('domaine')) ? domains[params.get('domaine')] : null;
  return { journey, domain };
}

export function initContactContext(form, search) {
  const { journey, domain } = getContactContext(search);
  if (journey) {
    for (const key of ['audience', 'requestType']) {
      const field = form.elements.namedItem(key);
      if (journey[key] && field && !field.value) field.value = journey[key];
    }
    form.elements.namedItem('message').placeholder = journey.placeholder;
  }
  const status = form.querySelector('[data-contact-context]');
  if (!status || (!journey && !domain)) return;
  status.textContent = (journey ? 'Votre parcours : ' + journey.label + '. Vous pouvez modifier les choix ci-dessous.' : '') + (domain ? ' Domaine souhaité : ' + domain + '.' : '');
  status.hidden = false;
  if (domain) form.dataset.contactDomain = domain;
}
