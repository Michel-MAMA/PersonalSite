import { createClient } from 'npm:@supabase/supabase-js@2';
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }); }
function validSlug(value: unknown): value is string { return typeof value === 'string' && /^[a-z0-9-]{1,100}$/.test(value); }
function validVisitor(value: unknown): value is string { return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }
Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Méthode non autorisée.' }, 405);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
  const secretKey = secretKeys.default;
  if (!supabaseUrl || !secretKey) return json({ error: 'Le service de commentaires n’est pas configuré.' }, 503);
  const db = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });
  try {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const slug = url.searchParams.get('slug');
      const visitorId = url.searchParams.get('visitorId');
      if (!validSlug(slug) || !validVisitor(visitorId)) return json({ error: 'Article ou visiteur invalide.' }, 400);
      const [{ count, error: likeError }, { data: ownLike, error: ownError }, { data: comments, error: commentError }] = await Promise.all([
        db.from('blog_article_likes').select('id', { count: 'exact', head: true }).eq('article_slug', slug),
        db.from('blog_article_likes').select('id').eq('article_slug', slug).eq('visitor_id', visitorId).maybeSingle(),
        db.from('blog_comments').select('id, author_name, body, created_at').eq('article_slug', slug).eq('status', 'approved').order('created_at', { ascending: false }).limit(100),
      ]);
      if (likeError || ownError || commentError) throw likeError ?? ownError ?? commentError;
      return json({ likes: count ?? 0, liked: Boolean(ownLike), comments: comments ?? [] });
    }
    const input = await request.json();
    if (input?.website) return json({ ok: true });
    const { action, slug, visitorId } = input ?? {};
    if (!validSlug(slug) || !validVisitor(visitorId)) return json({ error: 'Article ou visiteur invalide.' }, 400);
    if (action === 'like') {
      if (input.liked === true) {
        const { error } = await db.from('blog_article_likes').upsert({ article_slug: slug, visitor_id: visitorId }, { onConflict: 'article_slug,visitor_id', ignoreDuplicates: true });
        if (error) throw error;
      } else if (input.liked === false) {
        const { error } = await db.from('blog_article_likes').delete().eq('article_slug', slug).eq('visitor_id', visitorId);
        if (error) throw error;
      } else return json({ error: 'État du like invalide.' }, 400);
      const { count, error } = await db.from('blog_article_likes').select('id', { count: 'exact', head: true }).eq('article_slug', slug);
      if (error) throw error;
      return json({ likes: count ?? 0, liked: input.liked });
    }
    if (action === 'comment') {
      const name = typeof input.name === 'string' ? input.name.trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 80) : '';
      const body = typeof input.body === 'string' ? input.body.trim().slice(0, 2000) : '';
      if (name.length < 2 || body.length < 10) return json({ error: 'Indiquez un nom et un commentaire d’au moins 10 caractères.' }, 400);
      const since = new Date(Date.now() - 3600000).toISOString();
      const { count, error: rateError } = await db.from('blog_comments').select('id', { count: 'exact', head: true }).eq('visitor_id', visitorId).gte('created_at', since);
      if (rateError) throw rateError;
      if ((count ?? 0) >= 5) return json({ error: 'Limite atteinte : réessayez dans une heure.' }, 429);
      const { error } = await db.from('blog_comments').insert({ article_slug: slug, visitor_id: visitorId, author_name: name, body, status: 'pending' });
      if (error) throw error;
      return json({ ok: true, pending: true }, 201);
    }
    return json({ error: 'Action inconnue.' }, 400);
  } catch (error) { console.error('blog-engagement error', error); return json({ error: 'Une erreur est survenue. Réessayez plus tard.' }, 500); }
});