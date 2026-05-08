-- Phase 1: resources schema foundation for Supabase.
-- This migration only creates database structure and RLS policies; app integration
-- and CRUD flows are intentionally left for later phases.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

create table if not exists public.resources (
  id text primary key,
  nombre text not null,
  tipo text not null,
  direccion text not null,
  barrio text,
  lat double precision not null,
  lng double precision not null,
  telefono text,
  horario text,
  poblacion text[] not null,
  es_centro_referencia boolean not null default false,
  observaciones text,
  fuente text not null,
  ultima_actualizacion date not null,
  verification_status text not null,
  verification_verified_at date,
  verification_source text not null,
  verification_notes text,
  maintenance_owner text not null,
  maintenance_review_by date not null,
  maintenance_notes text,
  estado text not null default 'activo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint resources_id_not_blank check (length(btrim(id)) > 0),
  constraint resources_nombre_not_blank check (length(btrim(nombre)) > 0),
  constraint resources_tipo_allowed check (
    tipo in (
      'Refugio nocturno',
      'Centro diurno',
      'Puerta abierta',
      'Centro de atención',
      'Otro'
    )
  ),
  constraint resources_direccion_not_blank check (length(btrim(direccion)) > 0),
  constraint resources_barrio_not_blank check (barrio is null or length(btrim(barrio)) > 0),
  constraint resources_lat_range check (lat between -90 and 90),
  constraint resources_lng_range check (lng between -180 and 180),
  constraint resources_telefono_not_blank check (telefono is null or length(btrim(telefono)) > 0),
  constraint resources_horario_not_blank check (horario is null or length(btrim(horario)) > 0),
  constraint resources_poblacion_not_empty check (cardinality(poblacion) > 0),
  constraint resources_poblacion_items_not_blank check (array_position(poblacion, '') is null),
  constraint resources_observaciones_not_blank check (observaciones is null or length(btrim(observaciones)) > 0),
  constraint resources_fuente_not_blank check (length(btrim(fuente)) > 0),
  constraint resources_verification_status_allowed check (verification_status in ('verified', 'needs_review')),
  constraint resources_verified_requires_date check (
    verification_status <> 'verified' or verification_verified_at is not null
  ),
  constraint resources_verification_source_not_blank check (length(btrim(verification_source)) > 0),
  constraint resources_verification_notes_not_blank check (
    verification_notes is null or length(btrim(verification_notes)) > 0
  ),
  constraint resources_maintenance_owner_not_blank check (length(btrim(maintenance_owner)) > 0),
  constraint resources_maintenance_notes_not_blank check (
    maintenance_notes is null or length(btrim(maintenance_notes)) > 0
  ),
  constraint resources_estado_allowed check (estado in ('activo', 'inactivo')),
  constraint resources_deleted_inactive check (deleted_at is null or estado = 'inactivo')
);

create index if not exists resources_public_visible_idx
  on public.resources (estado, deleted_at)
  where deleted_at is null;

create index if not exists resources_tipo_idx on public.resources (tipo);
create index if not exists resources_es_centro_referencia_idx on public.resources (es_centro_referencia);
create index if not exists resources_poblacion_gin_idx on public.resources using gin (poblacion);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_resources_updated_at on public.resources;

create trigger set_resources_updated_at
before update on public.resources
for each row
execute function public.set_updated_at();

alter table public.resources enable row level security;

create policy "Public can read active resources"
on public.resources
for select
to anon, authenticated
using (estado = 'activo' and deleted_at is null);

create policy "Admins can read all resources"
on public.resources
for select
to authenticated
using (public.is_admin());

create policy "Admins can insert resources"
on public.resources
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update resources"
on public.resources
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

comment on table public.admin_users is 'Manually managed allow-list for future admin email/password users.';
comment on table public.resources is 'Social resources published by the app; public reads are limited to active, non-deleted rows.';
comment on column public.resources.es_centro_referencia is 'SQL mapping for app field esCentroReferencia.';
comment on column public.resources.estado is 'Use inactivo or deleted_at for retirement; physical row removal is intentionally not exposed through RLS.';
comment on column public.resources.deleted_at is 'Soft-delete timestamp; public policy hides rows with any deleted_at value.';
