import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const HOURS = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];
const PLANS: Record<string, { label: string; price: string; duration: string }> = {
  collectif: { label: 'Le Cercle — coaching collectif', price: '50 € / mois', duration: 'Séances collectives, créneaux choisis le week-end' },
  solo: { label: 'Le Cap — coaching solo', price: '75 € / mois', duration: '4 rendez-vous individuels de 30 minutes' },
  elite: { label: 'L’Intensif — coaching Élite', price: '100 € / mois', duration: '4 rendez-vous individuels de 1 h 30' },
};
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }); }
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!); }
function validDate(value: string) { if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const date = new Date(`${value}T00:00:00Z`); return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && [0, 6].includes(date.getUTCDay()); }

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Méthode non autorisée.' }, 405);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
  const secretKey = secretKeys.default;
  if (!supabaseUrl || !secretKey) return json({ error: 'Le service de réservation n’est pas configuré.' }, 503);
  const db = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });

  try {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const date = url.searchParams.get('date') ?? '';
      const time = url.searchParams.get('time') ?? '';
      if (!validDate(date) || !HOURS.includes(time)) return json({ error: 'Date ou horaire invalide.' }, 400);
      const { data: groupBookings, error: groupError } = await db.from('coaching_bookings').select('id').eq('plan', 'collectif').in('status', ['pending', 'confirmed']);
      if (groupError) throw groupError;
      let booked = 0;
      const bookingIds = (groupBookings ?? []).map((row) => row.id);
      if (bookingIds.length) {
        const { count, error } = await db.from('coaching_booking_sessions').select('id', { count: 'exact', head: true }).eq('session_date', date).eq('session_time', time).in('booking_id', bookingIds);
        if (error) throw error;
        booked = count ?? 0;
      }
      return json({ capacity: 10, booked, remaining: Math.max(0, 10 - booked) });
    }

    if (Number(request.headers.get('content-length') ?? 0) > 20000) return json({ error: 'La demande est trop volumineuse.' }, 413);
    const input = await request.json();
    if (input?.website) return json({ ok: true, emailNotified: false, confirmationSent: false });
    const plan = typeof input.plan === 'string' ? input.plan : '';
    const name = typeof input.name === 'string' ? input.name.trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 120) : '';
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase().slice(0, 254) : '';
    const goal = typeof input.goal === 'string' ? input.goal.trim().slice(0, 1500) : '';
    const month = typeof input.month === 'string' ? input.month : '';
    const sessions = Array.isArray(input.sessions) ? input.sessions : [];
    if (input.action !== 'book' || !PLANS[plan] || !input.consent || name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || goal.length < 10 || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return json({ error: 'Vérifiez les informations et le consentement avant l’envoi.' }, 400);
    if ((plan === 'collectif' && (sessions.length < 1 || sessions.length > 4)) || (plan !== 'collectif' && sessions.length !== 4)) return json({ error: 'Le nombre de séances ne correspond pas à cette formule.' }, 400);
    if (sessions.some((slot: Record<string, unknown>) => typeof slot.date !== 'string' || !validDate(slot.date) || slot.date.slice(0, 7) !== month || typeof slot.time !== 'string' || !HOURS.includes(slot.time))) return json({ error: 'Chaque séance doit avoir une date de week-end et un horaire valide dans le mois choisi.' }, 400);
    const keys = sessions.map((slot: { date: string; time: string }) => `${slot.date}|${slot.time}`);
    if (new Set(keys).size !== keys.length) return json({ error: 'Les créneaux doivent être différents.' }, 400);
    if (plan !== 'collectif') {
      const weeks = sessions.map((slot: { date: string }) => { const d = new Date(`${slot.date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); });
      if (new Set(weeks).size !== 4) return json({ error: 'Les quatre séances individuelles doivent être réparties sur quatre semaines différentes.' }, 400);
    }

    const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: recent, error: rateError } = await db.from('coaching_bookings').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', cutoff);
    if (rateError) throw rateError;
    if ((recent ?? 0) >= 2) return json({ error: 'Une demande récente a déjà été reçue pour cette adresse. Réessayez dans quelques minutes.' }, 429);

    const { data: bookingId, error: bookingError } = await db.rpc('create_coaching_booking', { p_plan: plan, p_month: month, p_name: name, p_email: email, p_goal: goal, p_sessions: sessions });
    if (bookingError) {
      if (bookingError.message.includes('GROUP_SLOT_FULL')) return json({ error: 'Ce créneau collectif vient d’afficher complet. Choisissez une autre date ou un autre horaire.' }, 409);
      if (bookingError.message.includes('ONE_SESSION_PER_WEEK')) return json({ error: 'Choisissez une séance dans chacune de quatre semaines différentes.' }, 400);
      console.error('coaching booking database failure', bookingError.message);
      return json({ error: 'La réservation n’a pas pu être enregistrée. Réessayez dans quelques instants.' }, 500);
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) return json({ ok: true, emailNotified: false, confirmationSent: false, id: bookingId });
    const planInfo = PLANS[plan];
    const lines = sessions.map((slot: { date: string; time: string }, i: number) => `Séance ${i + 1} : ${slot.date} à ${slot.time}`).join('\n');
    const details = `Nouvelle demande de coaching\n\nFormule : ${planInfo.label}\nTarif : ${planInfo.price}\nNom : ${name}\nE-mail : ${email}\nMois : ${month}\n${lines}\n\nObjectif :\n${goal}\n\nRéférence : ${bookingId}`;
    const ownerResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Site web <notifications@ai-learning-os.com>', to: ['contact@ai-learning-os.com'], reply_to: email, subject: `Réservation coaching — ${planInfo.label} — ${name}`, text: details, html: `<h2>Nouvelle demande de coaching</h2><p><strong>Formule :</strong> ${escapeHtml(planInfo.label)}<br><strong>Tarif :</strong> ${escapeHtml(planInfo.price)}<br><strong>Nom :</strong> ${escapeHtml(name)}<br><strong>E-mail :</strong> ${escapeHtml(email)}<br><strong>Mois :</strong> ${escapeHtml(month)}</p><ul>${sessions.map((slot: { date: string; time: string }, i: number) => `<li>Séance ${i + 1} : ${escapeHtml(slot.date)} à ${escapeHtml(slot.time)}</li>`).join('')}</ul><p><strong>Objectif :</strong><br>${escapeHtml(goal).replace(/\n/g, '<br>')}</p><p>Référence : ${escapeHtml(bookingId)}</p>` }),
    });
    let customerNotified = false;
    if (ownerResponse.ok) {
      const customerResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'Dr. Michel MAMA TOULOU <notifications@ai-learning-os.com>', to: [email], reply_to: 'contact@ai-learning-os.com', subject: 'Votre demande de coaching a bien été reçue', text: `Bonjour ${name},\n\nVotre demande pour ${planInfo.label} (${planInfo.price}) a bien été reçue. Les créneaux demandés restent en attente de confirmation. Je vous recontacte après vérification.\n\n${lines}\n\nDr. Michel MAMA TOULOU`, html: `<p>Bonjour ${escapeHtml(name)},</p><p>Votre demande pour <strong>${escapeHtml(planInfo.label)}</strong> (${escapeHtml(planInfo.price)}) a bien été reçue. Les créneaux demandés restent en attente de confirmation. Je vous recontacte après vérification.</p><ul>${sessions.map((slot: { date: string; time: string }, i: number) => `<li>Séance ${i + 1} : ${escapeHtml(slot.date)} à ${escapeHtml(slot.time)}</li>`).join('')}</ul><p>Dr. Michel MAMA TOULOU</p>` }),
      });
      customerNotified = customerResponse.ok;
    }
    await db.from('coaching_bookings').update({ email_status: ownerResponse.ok ? 'sent' : 'failed' }).eq('id', bookingId);
    return json({ ok: true, emailNotified: ownerResponse.ok, confirmationSent: customerNotified, id: bookingId });
  } catch (error) {
    console.error('coaching-booking failure', error instanceof Error ? error.message : 'unknown error');
    return json({ error: 'Une erreur est survenue. Réessayez ou écrivez à contact@ai-learning-os.com.' }, 500);
  }
});