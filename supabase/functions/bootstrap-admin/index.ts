import { createClient } from 'npm:@supabase/supabase-js@2';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};
const reply = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') return reply(405, { error: 'Method not allowed' });
  try {
    const { email, password, token } = await req.json();
    if (typeof email !== 'string' || typeof password !== 'string' ||
        typeof token !== 'string' || password.length < 8 || !/^[0-9a-f]{64}$/.test(token)) {
      return reply(400, { error: 'Invalid setup details' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const url = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
      JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default;
    if (!serviceKey) return reply(500, { error: 'Server secret not configured' });
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    const { data: invite, error: inviteError } = await admin.from('bootstrap_tokens')
      .select('email,expires_at,used_at').eq('email', normalizedEmail).eq('token_hash', hash).maybeSingle();
    if (inviteError) return reply(500, { error: 'Could not check setup token' });
    if (!invite || invite.used_at || new Date(invite.expires_at).getTime() < Date.now()) {
      return reply(403, { error: 'Invalid or expired setup token' });
    }
    const { data: existingAdmin } = await admin.from('profiles').select('id').eq('role', 'admin').limit(1);
    if (existingAdmin?.length) return reply(409, { error: 'Admin account already exists' });
    const created = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { name: 'هدي سيد' }
    });
    if (created.error || !created.data.user) return reply(409, {
      error: 'Could not create admin account', detail: created.error?.message
    });
    const userId = created.data.user.id;
    const profile = await admin.from('profiles').insert({
      id: userId, email: normalizedEmail, name: 'هدي سيد', role: 'admin'
    });
    if (profile.error) {
      await admin.auth.admin.deleteUser(userId);
      return reply(500, { error: 'Could not create admin profile', detail: profile.error.message });
    }
    const used = await admin.from('bootstrap_tokens').update({ used_at: new Date().toISOString() })
      .eq('email', normalizedEmail).eq('token_hash', hash).is('used_at', null);
    if (used.error) return reply(500, { error: 'Could not complete activation' });
    return reply(200, { success: true });
  } catch (error) {
    console.error('Admin activation failed', error);
    return reply(500, { error: 'Activation function failed' });
  }
});
