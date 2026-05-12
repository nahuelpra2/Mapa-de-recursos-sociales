# Proposal: Phase 6 Admin Resource Lifecycle

## Intent

Let authorized admins archive resources and irreversibly hard delete obsolete rows from the existing admin resource screens, while preserving public visibility rules and Supabase RLS as the security boundary.

## Scope

### In Scope
- Archive a resource by setting `estado = 'inactivo'` and a retirement timestamp compatible with current public-read filtering.
- Hard delete a resource through an explicit admin-only delete repository method, Supabase mutation, RLS policy, and migration/comment update.
- Add safe list/edit UI affordances, confirmation copy for irreversible delete, error states, and tests.

### Out of Scope
- Bulk actions, restore/unarchive flows, audit log, role management, geocoding/uploads, public UX redesign, or new admin routes unless design proves they are required.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `admin-resource-crud`: replace Phase 5 “no delete/archive” limits with admin-only archive and hard-delete lifecycle requirements.

## Approach

Use the existing protected admin boundary and list/edit screens. Extend the admin schema to model `activo | inactivo` plus `deleted_at`, add repository methods for `archive(id)` and `delete(id)`, and implement archive as an update. Add a Supabase migration that exposes physical deletion only to `public.is_admin()` via RLS and updates the existing “physical row removal is intentionally not exposed” comment. Keep confirmations and failure copy non-sensitive.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/` | New | Admin delete policy/comment migration for hard delete. |
| `src/data/adminResourceSchema.ts` | Modified | Lifecycle status and `deleted_at` mapping. |
| `src/domain/resources/adminResourceRepository.ts` | Modified | Add archive/delete contract methods. |
| `src/data/adminResourceRepository.ts` | Modified | Supabase update/delete implementation and errors. |
| `src/hooks/useAdminResources.ts` | Modified | Lifecycle action state helpers. |
| `src/pages/admin/*Resource*` | Modified | Archive/delete actions and confirmations. |
| `src/**/*.test.ts` | Modified | Repository, schema, hook, presentation coverage. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Hard delete removes data irreversibly | Med | Require explicit confirmation and isolate to admin RLS. |
| RLS migration accidentally broadens access | Med | Add only `for delete to authenticated using (public.is_admin())`; test rejected failures safely. |
| Review surface grows | Med | Keep one UI surface first; defer routes/bulk/restore. |

## Rollback Plan

Revert UI/repository/schema changes, drop the admin delete RLS policy in a rollback migration, and restore the DB comment that physical row removal is not exposed. Archived rows remain recoverable by DB update; hard-deleted rows require backup restore.

## Dependencies

- Existing Supabase admin allow-list and `public.is_admin()` boundary.

## Success Criteria

- [ ] Admins can archive resources; public reads hide archived/deleted resources.
- [ ] Admins can hard delete only with the new RLS policy; non-admin attempts fail safely.
- [ ] Tests cover schema mapping, repository archive/delete, and UI lifecycle states.
