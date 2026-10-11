import test from 'node:test';
import assert from 'node:assert/strict';
import { renderHeader } from '../components/site-shell.mjs';
import { renderPage } from '../components/render-page.mjs';
import { plans, validateSlots } from '../assets/js/booking-rules.js';
import { request } from '../assets/js/api.js';

const plan = key => ({ key, ...plans[key] });
const slots = ['2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24'].map(date => ({ date, time: '09:00' }));

test('individual coaching accepts four different weeks', () => {
  for (const key of ['solo', 'elite']) assert.equal(validateSlots(plan(key), slots, '2026-10'), '');
});
test('collective coaching accepts one to four sessions', () => {
  for (const count of [1, 2, 3, 4]) assert.equal(validateSlots(plan('collectif'), slots.slice(0, count), '2026-10'), '');
  assert.match(validateSlots(plan('collectif'), [], '2026-10'), /nombre/);
});
test('invalid dates, weekdays, times and months are rejected', () => {
  for (const slot of [{ date: '2026-10-05', time: '09:00' }, { date: '2026-10-32', time: '09:00' }, { date: '2026-11-01', time: '09:00' }, { date: '2026-10-03', time: '03:00' }]) {
    assert.notEqual(validateSlots(plan('collectif'), [slot], '2026-10'), '');
  }
});
test('duplicate sessions and individual sessions within the same week are rejected', () => {
  assert.match(validateSlots(plan('collectif'), [slots[0], slots[0]], '2026-10'), /doublons/);
  const sameWeek = [slots[0], { date: '2026-10-04', time: '09:00' }, slots[2], slots[3]];
  assert.match(validateSlots(plan('solo'), sameWeek, '2026-10'), /semaines/);
});
test('individual plan requires four sessions and a selected plan', () => {
  assert.match(validateSlots(plan('solo'), slots.slice(0, 3), '2026-10'), /nombre/);
  assert.match(validateSlots(null, slots, '2026-10'), /nombre/);
});
test('only the exact destination has aria-current in an expertise dropdown', () => {
  const html = renderHeader('ai-security');
  assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
  assert.match(html, /href="ai-security.html" aria-current="page"/);
  assert.match(html, /aria-controls="nav-expertises"/);
});
test('page rendering requires exactly one of each shared marker', () => {
  const source = '<!-- SITE_HEADER --><!-- SITE_FOOTER --><!-- WHATSAPP_WIDGET -->';
  assert.doesNotMatch(renderPage('index.html', source), /<!-- SITE_/);
  assert.throws(() => renderPage('index.html', source + '<!-- SITE_HEADER -->'), /found 2/);
  assert.throws(() => renderPage('index.html', ''), /found 0/);
});
test('API requests preserve multipart boundaries and authenticate JSON requests', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, ...options });
    return new Response(JSON.stringify({ ok: true }));
  });
  const form = new FormData();
  form.set('name', 'Test');
  await request('contact-form', { method: 'POST', body: form });
  await request('blog-engagement', { method: 'POST', body: '{}', headers: { 'X-Test': 'yes' } });
  assert.equal(calls[0].body, form);
  assert.equal(calls[0].headers.has('Content-Type'), false);
  assert.ok(calls[0].headers.get('apikey'));
  assert.equal(calls[1].headers.get('Content-Type'), 'application/json');
  assert.equal(calls[1].headers.get('X-Test'), 'yes');
  assert.match(calls[0].url, /functions\/v1\/contact-form$/);
});
test('API errors surface backend messages and tolerate non-JSON failures', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ error: 'Complet' }), { status: 409 }));
  await assert.rejects(request('coaching-booking'), /Complet/);
  globalThis.fetch = async () => new Response('Unavailable', { status: 503 });
  await assert.rejects(request('coaching-booking'), /temporairement/);
});
