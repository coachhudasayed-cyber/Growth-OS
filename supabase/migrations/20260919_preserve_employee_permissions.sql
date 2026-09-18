-- Keep the shared Dashboard task list available to staff.
create policy records_staff_todos_read on public.app_records for select to authenticated
using (collection = 'todos' and client_id is null and (select app_private.is_staff()));
create policy records_staff_todos_insert on public.app_records for insert to authenticated
with check (collection = 'todos' and client_id is null and (select app_private.is_staff()));
create policy records_staff_todos_update on public.app_records for update to authenticated
using (collection = 'todos' and client_id is null and (select app_private.is_staff()))
with check (collection = 'todos' and client_id is null and (select app_private.is_staff()));
create policy records_staff_todos_delete on public.app_records for delete to authenticated
using (collection = 'todos' and client_id is null and (select app_private.is_staff()));

-- Preserve shared content-library settings while scoping each brand's templates.
drop policy if exists settings_read on public.app_settings;
create policy settings_read on public.app_settings for select to authenticated
using ((select app_private.is_admin())
  or key = 'content_library_categories_v2'
  or (client_id is not null and
    (client_id = (select app_private.own_client_id())
     or (select app_private.is_assigned_client(client_id)))));

drop policy if exists settings_insert on public.app_settings;
create policy settings_insert on public.app_settings for insert to authenticated
with check ((select app_private.is_admin())
  or (key = 'content_library_categories_v2' and (select app_private.is_staff()))
  or (client_id is not null and (select app_private.is_assigned_client(client_id))));

drop policy if exists settings_update on public.app_settings;
create policy settings_update on public.app_settings for update to authenticated
using ((select app_private.is_admin())
  or (key = 'content_library_categories_v2' and (select app_private.is_staff()))
  or (client_id is not null and (select app_private.is_assigned_client(client_id))))
with check ((select app_private.is_admin())
  or (key = 'content_library_categories_v2' and (select app_private.is_staff()))
  or (client_id is not null and (select app_private.is_assigned_client(client_id))));

drop policy if exists settings_delete on public.app_settings;
create policy settings_delete on public.app_settings for delete to authenticated
using ((select app_private.is_admin())
  or (key = 'content_library_categories_v2' and (select app_private.is_staff()))
  or (client_id is not null and (select app_private.is_assigned_client(client_id))));
