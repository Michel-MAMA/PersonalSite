import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function clean(value: FormDataEntryValue | null, maxLength: number) {
  return String(value ?? '').trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, maxLength);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
  const secretKey = secretKeys.default;
  if (!supabaseUrl || !secretKey) return json({ error: 'Le stockage des demandes n’est pas configuré.' }, 503);

  let attachmentPath: string | null = null;
  const supabase = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });

  try {
    const form = await request.formData();
    if (clean(form.get('website'), 200)) return json({ ok: true, emailNotified: false });

    const name = clean(form.get('name'), 150);
    const email = clean(form.get('email'), 254).toLowerCase();
    const organisation = clean(form.get('organisation'), 200);
    const audience = clean(form.get('audience'), 100);
    const requestType = clean(form.get('requestType'), 120);
    const message = String(form.get('message') ?? '').trim().slice(0, 10000);
    const consent = clean(form.get('consent'), 10) === 'on';

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !audience || !requestType || message.length < 10 || !consent) {
      return json({ error: 'Vérifiez les champs obligatoires et votre consentement.' }, 400);
    }

    const cutoff = new Date(Date.now() - 60_000).toISOString();
    const { count, error: rateError } = await supabase
      .from('contact_requests')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', cutoff);
    if (rateError) throw rateError;
    if ((count ?? 0) >= 2) return json({ error: 'Une demande récente existe déjà. Réessayez dans une minute.' }, 429);

    const uploaded = form.get('attachment');
    let attachmentName: string | null = null;
    let signedAttachmentUrl: string | null = null;
    if (uploaded instanceof File && uploaded.size > 0) {
      const originalName = uploaded.name.split(/[\\/]/).pop() ?? 'document';
      const extension = originalName.split('.').pop()?.toLowerCase() ?? '';
      if (uploaded.size > MAX_FILE_SIZE) return json({ error: 'Le fichier dépasse la taille maximale de 8 Mo.' }, 400);
      if (!MIME_TYPES[extension] || uploaded.type !== MIME_TYPES[extension]) {
        return json({ error: 'Ce format de fichier n’est pas accepté.' }, 400);
      }

      attachmentName = originalName.replace(/[^\p{L}\p{N}._-]+/gu, '_').slice(0, 120);
      attachmentPath = `${crypto.randomUUID()}/${attachmentName}`;
      const { error: uploadError } = await supabase.storage
        .from('contact-attachments')
        .upload(attachmentPath, uploaded, { contentType: uploaded.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data: signed, error: signedError } = await supabase.storage
        .from('contact-attachments')
        .createSignedUrl(attachmentPath, 60 * 60 * 24 * 7);
      if (signedError) throw signedError;
      signedAttachmentUrl = signed.signedUrl;
    }

    const { data: submission, error: insertError } = await supabase
      .from('contact_requests')
      .insert({ name, email, organisation: organisation || null, audience, request_type: requestType, message, attachment_path: attachmentPath, attachment_name: attachmentName })
      .select('id')
      .single();
    if (insertError) throw insertError;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) return json({ ok: true, emailNotified: false, id: submission.id });

    const details = [
      `Nom : ${name}`,
      `E-mail : ${email}`,
      `Profil : ${audience}`,
      `Organisation : ${organisation || 'Non précisée'}`,
      `Type de demande : ${requestType}`,
      `Document : ${signedAttachmentUrl ?? 'Aucun'}`,
      '',
      message,
    ].join('\n');
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Site web <notifications@ai-learning-os.com>',
        to: ['contact@ai-learning-os.com'],
        reply_to: email,
        subject: `Demande de contact — ${requestType}`,
        text: details,
        html: `<h2>Nouvelle demande de contact</h2><p><strong>Nom :</strong> ${escapeHtml(name)}<br><strong>E-mail :</strong> ${escapeHtml(email)}<br><strong>Profil :</strong> ${escapeHtml(audience)}<br><strong>Organisation :</strong> ${escapeHtml(organisation || 'Non précisée')}<br><strong>Type :</strong> ${escapeHtml(requestType)}<br><strong>Document :</strong> ${signedAttachmentUrl ? `<a href="${escapeHtml(signedAttachmentUrl)}">${escapeHtml(attachmentName ?? 'Télécharger le fichier')}</a>` : 'Aucun'}</p><hr><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
      }),
    });

    if (!emailResponse.ok) {
      await supabase.from('contact_requests').update({ email_status: 'failed' }).eq('id', submission.id);
      return json({ ok: true, emailNotified: false, id: submission.id });
    }

    await supabase.from('contact_requests').update({ email_status: 'sent', email_sent_at: new Date().toISOString() }).eq('id', submission.id);
    return json({ ok: true, emailNotified: true, id: submission.id });
  } catch (error) {
    if (attachmentPath) await supabase.storage.from('contact-attachments').remove([attachmentPath]);
    console.error('contact-form failure', error instanceof Error ? error.message : 'unknown error');
    return json({ error: 'La demande n’a pas pu être enregistrée. Réessayez ou écrivez à contact@ai-learning-os.com.' }, 500);
  }
});
