-- =====================================================================
-- Torque · Supabase Storage: fotos das peças do estoque
-- Rode UMA vez no SQL Editor do Supabase. Pode rodar de novo sem problema.
--
-- Bucket público "pecas" (as fotos aparecem para qualquer visitante, como
-- no catálogo do cliente). Só o admin pode enviar, trocar e apagar.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pecas', 'pecas', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists pecas_leitura_publica on storage.objects;
create policy pecas_leitura_publica on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'pecas');

drop policy if exists pecas_admin_enviar on storage.objects;
create policy pecas_admin_enviar on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pecas' and public.is_admin());

drop policy if exists pecas_admin_alterar on storage.objects;
create policy pecas_admin_alterar on storage.objects
  for update to authenticated
  using (bucket_id = 'pecas' and public.is_admin())
  with check (bucket_id = 'pecas' and public.is_admin());

drop policy if exists pecas_admin_apagar on storage.objects;
create policy pecas_admin_apagar on storage.objects
  for delete to authenticated
  using (bucket_id = 'pecas' and public.is_admin());
