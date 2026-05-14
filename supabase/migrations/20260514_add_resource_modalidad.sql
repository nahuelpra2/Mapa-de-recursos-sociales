-- Add modalidad as nullable first so existing Programa Calle rows can be backfilled safely.
-- backfill existing resources before any later not null hardening.
-- This is a nullable-first rollout; keep public reads tolerant until the backfill finishes.

alter table public.resources
  add column if not exists modalidad text;

alter table public.resources
  drop constraint if exists resources_modalidad_allowed;

alter table public.resources
  add constraint resources_modalidad_allowed check (
    modalidad is null or modalidad in (
      'COLMENA - Nocturno Hombres',
      'COLMENA - Nocturno Mixto',
      'Nocturno Hombres',
      'Nocturno Mixto',
      'Nocturno Mujeres',
      'Plan Nacional Invierno - Área Metropolitana',
      'Plan Nacional Invierno - Puertas Abiertas'
    )
  );

create index if not exists resources_modalidad_idx
  on public.resources (modalidad);

comment on column public.resources.modalidad is 'Nullable during the backfill-first rollout; populate existing rows before enforcing not null.';
