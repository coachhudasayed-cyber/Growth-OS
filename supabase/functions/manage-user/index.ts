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
    if (body.action === 'create_employee' || body.action === 'update_employee') {
      const input = body.employee || {};
      const email = String(input.email || '').trim().toLowerCase();
      const name = String(input.name || '').trim();
      const phone = String(input.phone || '').trim();
      const password = String(input.password || '');
      const assignments = Array.isArray(input.assignments) ? input.assignments : [];
      const normalized = assignments.map((item: { clientId?: unknown; compensation?: unknown }) => ({
        client_id: String(item.clientId || ''),
        compensation: Number(item.compensation)
      }));
      if (!email.includes('@') || !name || !phone || !normalized.length ||
          (body.action === 'create_employee' && password.length < 8) ||
          normalized.some((item: { client_id: string; compensation: number }) =>
            !item.client_id || !Number.isFinite(item.compensation) || item.compensation < 0) ||
          new Set(normalized.map((item: { client_id: string }) => item.client_id)).size !== normalized.length) {
        return reply(400, { error: 'Invalid employee details' });
      }
      if (normalized.length) {
        const available = await admin.from('clients').select('id,data').in(
          'id', normalized.map((item: { client_id: string }) => item.client_id)
        );
        if (available.error || available.data?.length !== normalized.length ||
            available.data?.some(client => client.data?.clientRole === 'employee')) {
          return reply(400, { error: 'Unknown brand assignment' });
        }
      }
      if (body.action === 'create_employee') {
        const created = await admin.auth.admin.createUser({
          email, password, email_confirm: true, user_metadata: { name }
        });
        if (created.error || !created.data.user) return reply(409, { error: 'Email already used or invalid' });
        const employeeId = created.data.user.id;
        const profile = { id: employeeId, email, name, phone, role: 'employee', client_id: null };
        const profileWrite = await admin.from('profiles').insert(profile);
        if (profileWrite.error) {
          await admin.auth.admin.deleteUser(employeeId);
          return reply(500, { error: 'Could not save employee account' });
        }
        if (normalized.length) {
          const write = await admin.from('employee_assignments').insert(
            normalized.map((item: { client_id: string; compensation: number }) => ({
              ...item, employee_id: employeeId
            }))
          );
          if (write.error) {
            await admin.auth.admin.deleteUser(employeeId);
            return reply(500, { error: 'Could not save brand assignments' });
          }
        }
        return reply(200, { employee: { ...profile, assignments: normalized } });
      }

      const employeeId = String(body.employeeId || '');
      const existing = await admin.from('profiles').select('id,email,role').eq('id', employeeId).maybeSingle();
      if (existing.error || existing.data?.role !== 'employee') return reply(404, { error: 'Employee not found' });
      if (email !== existing.data.email) {
        const authUpdate = await admin.auth.admin.updateUserById(employeeId, { email, email_confirm: true });
        if (authUpdate.error) return reply(409, { error: 'Email cannot be changed' });
      }
      const profileWrite = await admin.from('profiles').update({ email, name, phone }).eq('id', employeeId);
      if (profileWrite.error) return reply(500, { error: 'Could not update employee account' });
      if (normalized.length) {
        const write = await admin.from('employee_assignments').upsert(
          normalized.map((item: { client_id: string; compensation: number }) => ({
            ...item, employee_id: employeeId
          })),
          { onConflict: 'employee_id,client_id' }
        );
        if (write.error) return reply(500, { error: 'Could not update brand assignments' });
      }
      const old = await admin.from('employee_assignments').select('client_id').eq('employee_id', employeeId);
      if (old.error) return reply(500, { error: 'Could not read brand assignments' });
      const kept = new Set(normalized.map((item: { client_id: string }) => item.client_id));
      const removed = (old.data || []).map(item => item.client_id).filter(id => !kept.has(id));
      if (removed.length) {
        const deletion = await admin.from('employee_assignments').delete()
          .eq('employee_id', employeeId).in('client_id', removed);
        if (deletion.error) return reply(500, { error: 'Could not remove old brand assignments' });
      }
      return reply(200, {
        employee: { id: employeeId, email, name, phone, role: 'employee', assignments: normalized }
      });
    }

    if (body.action === 'delete_employee') {
      const employeeId = String(body.employeeId || '');
      const existing = await admin.from('profiles').select('role').eq('id', employeeId).maybeSingle();
      if (existing.error || existing.data?.role !== 'employee') return reply(404, { error: 'Employee not found' });
      const deleted = await admin.auth.admin.deleteUser(employeeId);
      if (deleted.error) return reply(500, { error: 'Could not delete employee login' });
      return reply(200, { success: true });
    }
    if (body.action === 'create') {
      const input = body.client || {};
      const email = String(input.email || '').trim().toLowerCase();
      const password = String(input.password || '');
      const role = 'client';
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
      if (linked.data.role !== 'client') return reply(400, { error: 'Use employee settings for employee accounts' });
      const role = 'client';
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
