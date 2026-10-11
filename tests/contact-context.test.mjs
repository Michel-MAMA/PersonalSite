import test from 'node:test';
import assert from 'node:assert/strict';
import { getContactContext, initContactContext } from '../assets/js/contact-context.js';

test('contact journeys map to the actual form option values', () => {
  assert.equal(getContactContext('?parcours=entreprise').journey.requestType, 'Formation pour une équipe');
  assert.equal(getContactContext('?parcours=reconversion').journey.audience, 'Personne en reconversion');
  assert.equal(getContactContext('?parcours=coaching').journey.requestType, 'Coaching professionnel');
  assert.equal(getContactContext('?parcours=orientation').journey.audience, undefined);
});
test('unknown query parameters are ignored', () => {
  assert.deepEqual(getContactContext('?parcours=__proto__&domaine=constructor'), { journey:null, domain:null });
  assert.deepEqual(getContactContext('?parcours=inconnu&domaine=inconnu'), { journey:null, domain:null });
});
test('context keeps visitor edits and does not fill the message with boilerplate', () => {
  const fields = { audience:{ value:'Étudiant·e' }, requestType:{ value:'' }, message:{ value:'Mon besoin', placeholder:'' } };
  const status = { hidden:true, textContent:'' };
  const form = { dataset:{}, elements:{ namedItem:key=>fields[key] }, querySelector:()=>status };
  initContactContext(form, '?parcours=coaching&domaine=ai-security');
  assert.equal(fields.audience.value, 'Étudiant·e');
  assert.equal(fields.requestType.value, 'Coaching professionnel');
  assert.equal(fields.message.value, 'Mon besoin');
  assert.equal(form.dataset.contactDomain, 'AI Security');
  assert.equal(status.hidden, false);
});
