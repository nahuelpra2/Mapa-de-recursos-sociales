-- Remove operational verification/maintenance metadata from public.resources.
-- Keeps only source, last update, review deadline, lifecycle status, and deletion timestamp.

alter table public.resources
  drop column if exists verification_status cascade,
  drop column if exists verification_verified_at cascade,
  drop column if exists verification_source cascade,
  drop column if exists verification_notes cascade,
  drop column if exists maintenance_owner cascade,
  drop column if exists maintenance_notes cascade;
