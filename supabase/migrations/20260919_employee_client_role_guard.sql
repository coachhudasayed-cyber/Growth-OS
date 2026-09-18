create or replace function app_private.own_client_id()
returns text language sql stable security definer set search_path = ''
as $$ select p.client_id from public.profiles p
  where p.id = (select auth.uid()) and p.role = 'client' $$;
