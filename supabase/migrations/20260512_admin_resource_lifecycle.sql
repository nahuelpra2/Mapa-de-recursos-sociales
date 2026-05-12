-- Phase 6: admin resource lifecycle foundation.
-- Adds admin-only hard delete while keeping public reads restricted to active rows.

drop policy if exists "Admins can delete resources" on public.resources;

create policy "Admins can delete resources"
on public.resources
for delete
to authenticated
using (public.is_admin());

comment on column public.resources.estado is 'Use inactivo or deleted_at for retirement; physical row removal is intentionally exposed through admin-only delete RLS.';
