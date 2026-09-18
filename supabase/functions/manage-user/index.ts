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
  const bearer = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!bearer) return reply(401, { error: 'Authentication required' });
  const url = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
    JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default;
  if (!serviceKey) return reply(500, { error: 'Server secret not configured' });
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const verified = await admin.auth.getUser(bearer);
  if (verified.error || !verified.data.user) return reply(401, { error: 'Invalid session' });
  const actor = await admin.from('profiles').select('role')
    .eq('id', verified.data.user.id).maybeSingle();
  if (actor.error || actor.data?.role !== 'admin') return reply(403, { error: 'Admin access required' });

  try {
    const body = await req.json();
    if (body.action === 'create') {
      const input = body.client || {};
      const email = String(input.email || '').trim().toLowerCase();
      const password = String(input.password || '');
      const role = input.clientRole === 'employee' ? 'employee' : 'client';
      if (!email.includes('@') || password.length < 8 ||
          !String(input.name || '').trim() || !String(input.brandName || '').trim()) {
        return reply(400, { error: 'Missing required account details' });
      }
      const id = `client-${crypto.randomUUID()}`;
      const client = {
        id,
        name: String(input.name).trim(),
        brandName: String(input.brandName).trim(),
        email,
        phone: String(input.phone || ''),
        brandPageUrl: String(input.brandPageUrl || ''),
        websiteUrl: String(input.websiteUrl || ''),
        formUrl: String(input.formUrl || ''),
        formAnswersUrl: String(input.formAnswersUrl || ''),
        status: ['active', 'paused', 'finished'].includes(input.status) ? input.status : 'active',
        clientRole: role,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      const created = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { name: client.name }
      });
      if (created.error || !created.data.user) return reply(409, { error: 'Email already used or invalid' });
      const userId = created.data.user.id;
      const clientWrite = await admin.from('clients').insert({ id, data: client });
      if (clientWrite.error) {
        await admin.auth.admin.deleteUser(userId);
        return reply(500, { error: 'Could not save client' });
      }
      const profile = { id: userId, email, name: client.name, role, client_id: id };
      const profileWrite = await admin.from('profiles').insert(profile);
      if (profileWrite.error) {
        await admin.from('clients').delete().eq('id', id);
        await admin.auth.admin.deleteUser(userId);
        return reply(500, { error: 'Could not save account' });
      }
      return reply(200, { client, profile });
    }

    if (body.action === 'update') {
      const id = String(body.clientId || '');
      const fields = body.fields || {};
      const current = await admin.from('clients').select('data').eq('id', id).maybeSingle();
      const linked = await admin.from('profiles').select('id,email,role').eq('client_id', id).maybeSingle();
      if (current.error || linked.error || !current.data || !linked.data) {
        return reply(404, { error: 'Account not found' });
      }
      const oldClient = current.data.data;
      const email = fields.email ? String(fields.email).trim().toLowerCase() : oldClient.email;
      const role = fields.clientRole === 'employee' ? 'employee' :
        fields.clientRole === 'client' ? 'client' : linked.data.role;
      const client = {
        ...oldClient, ...fields, id, email, clientRole: role,
        createdAt: oldClient.createdAt
      };
      delete client.password;
      if (!email.includes('@') || !String(client.name || '').trim()) {
        return reply(400, { error: 'Invalid account details' });
      }
      if (email !== linked.data.email) {
        const authUpdate = await admin.auth.admin.updateUserById(linked.data.id, { email, email_confirm: true });
        if (authUpdate.error) return reply(409, { error: 'Email cannot be changed' });
      }
      const clientWrite = await admin.from('clients').update({ data: client }).eq('id', id);
      if (clientWrite.error) return reply(500, { error: 'Could not update client' });
      const profile = { id: linked.data.id, email, name: client.name, role, client_id: id };
      const profileWrite = await admin.from('profiles').update(profile).eq('id', linked.data.id);
      if (profileWrite.error) return reply(500, { error: 'Could not update account' });
      return reply(200, { client, profile });
    }

    if (body.action === 'delete') {
      const id = String(body.clientId || '');
      const linked = await admin.from('profiles').select('id').eq('client_id', id).maybeSingle();
      if (linked.error || !linked.data) return reply(404, { error: 'Account not found' });
      const authDelete = await admin.auth.admin.deleteUser(linked.data.id);
      if (authDelete.error) return reply(500, { error: 'Could not delete login' });
      const clientDelete = await admin.from('clients').delete().eq('id', id);
      if (clientDelete.error) return reply(500, { error: 'Could not delete client data' });
      return reply(200, { success: true });
    }
    return reply(400, { error: 'Unknown action' });
  } catch {
    return reply(400, { error: 'Invalid request' });
  }
});
