# Proposal: Phase 5 Admin Resource CRUD

## Intent

Enable admins to manage resources without weakening public UX, RLS, or secret boundaries. Success means CRUD/retire flows work through Supabase RLS under `RequireAdmin`, while public map/list behavior stays unchanged.

## Scope

### In Scope
- Protected `/admin/resources` resource CRUD under the existing admin boundary.
- Admin-only repository with `listAll`, `create`, `update`, and `softDelete`/retire.
- Reuse resource validation/mapping where safe; add admin input/row mapping for `estado`, timestamps, and deletion fields.
- Vitest coverage for routes, repository, validation/mapping helpers, and pure component states.

### Out of Scope
- User/admin management, invites, roles, MFA, or provisioning endpoints.
- File uploads, moderation, audit logs, and public UX redesign.
- Frontend secrets: no `service_role`, DB password, API keys, or privileged APIs.
- Hard delete unless a later design proves new delete policy/migration is required.

## Capabilities

### New Capabilities
- `admin-resource-crud`: Admin resource listing, creation, editing, and soft deletion/retirement.

### Modified Capabilities
- `app-routing`: Add protected `/admin/resources`; replace Phase 4 “CRUD unavailable” limits for resources.

## Approach

Keep `/admin` as landing/shell and add `/admin/resources` under `RequireAdmin`; optionally use `/new` and `/:id/edit` if design accepts route/form size. Implement a separate admin repository using the anon Supabase client plus `admin_users`/`is_admin()` RLS. Admin writes MUST NOT use local fallback. Delete means soft-delete via `estado = 'inactivo'` and/or `deleted_at`; no physical delete policy here. Tests use current Vitest only; do not run build.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/routes.ts` | Modified | Add resource routes. |
| `src/App.tsx` | Modified | Mount inside `RequireAdmin`. |
| `src/pages/AdminShell.tsx`, `src/pages/admin/` | Modified/New | Nav, pages, forms. |
| `src/data/`, `src/domain/resources/` | New/Modified | Admin repository/mappings. |
| `openspec/specs/app-routing/spec.md` | Modified | Route scope delta. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Exceeds 400-line review budget | High | `ask-on-risk`: recommend later task split before apply. |
| Hidden write failures via fallback | Medium | Separate repository; no write fallback. |
| Unsupported hard delete | Medium | Use soft-delete unless design adds migration. |
| Form testing friction without DOM tooling | Medium | Keep logic in pure helpers/hooks; Vitest-only. |

## Rollback Plan

Remove `/admin/resources` routes/pages and admin repository files. Revert app-routing/admin-resource deltas. No data rollback is expected if soft-delete uses existing columns.

## Dependencies

- Phase 4 admin auth and Supabase RLS/admin policies.
- Existing `public.resources` schema and validation utilities.

## Success Criteria

- [ ] Authorized admins can list, create, edit, and soft-delete resources.
- [ ] Unauthenticated/non-admin users cannot access CRUD UI or write resources.
- [ ] Public route/fallback behavior remains unchanged.
- [ ] Vitest-only tests cover route/repository/mapping/form logic; build is not run.
