// This key is publishable; server secrets remain in Supabase.
const functionsUrl = 'https://gdgeghypyljichmzlbxv.supabase.co/functions/v1/';
const publishableKey = 'sb_publishable_ofvmsaxijbV3KwREGO0giw_mL37iVjm';

export async function request(endpoint, options = {}) {
  const headers = new Headers(options.headers);
  headers.set('apikey', publishableKey);
  // FormData needs the browser-generated multipart boundary.
  if (typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(functionsUrl + endpoint, { ...options, headers });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Le service est temporairement indisponible.');
  return result;
}
