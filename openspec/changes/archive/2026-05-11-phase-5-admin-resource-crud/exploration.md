## Exploration: phase-5-admin-resource-crud

### Current State
The app already has a protected admin boundary from Phase 4: `/admin/login` authenticates with Supabase Auth, `/admin` is guarded by `RequireAdmin`, and admin authorization is re-checked through `rpc("is_admin")` against `public.admin_users`. The browser Supabase client is anon-only and must stay that way.

Resources already have a validated domain model in `src/data/resourceSchema.ts` and `src/types/resource.ts`. Public loading uses `usePublicResources` plus `supabaseResourceRepository`, which maps `public.resources` snake_case rows into the public `Resource` shape and falls back to bundled JSON if Supabase is unavailable. That public flow is intentionally resilient, but it is not a good admin CRUD boundary because it hides persistence errors behind fallback behavior and does not model admin-only fields like `estado`, `deleted_at`, `created_at`, or `updated_at`.

The existing Supabase migration creates `public.resources`, enables RLS, allows public reads only for active non-deleted rows, allows admins to select all rows, and allows admins to insert/update rows through `public.is_admin()`. There is no delete policy; retirement is intentionally modeled through `estado = 'inactivo'` and/or `deleted_at`, so admin “delete” should be soft-delete unless a later schema change explicitly adds physical delete.

No `openspec/config.yaml` is present, but Phase 4 verification recorded Strict TDD. Current test setup is Vitest-only, with no Testing Library or E2E dependency; existing UI tests mostly cover pure helpers, route constants, repositories, and component return values.

### Affected Areas
- `src/routes.ts` — add `/admin/resources` under the existing admin route inventory and remove/update the Phase 4 assertion that CRUD is out of scope.
- `src/App.tsx` — fit resource CRUD under `RequireAdmin`, likely with an `/admin/*` route or explicit `/admin/resources` route; avoid exposing it outside the protected boundary.
- `src/pages/AdminShell.tsx` — convert the placeholder into a small admin landing/layout with navigation, or keep it as `/admin` and add a separate resources page.
- `src/pages/` or `src/pages/admin/` — add resource list/create/edit/detail page components if this phase implements UI.
- `src/data/supabaseResourceRepository.ts` — reuse row-to-domain mapping where safe, but avoid extending the public repository into admin CRUD because fallback-on-error is unsafe for writes.
- `src/data/resourceSchema.ts` and `src/types/resource.ts` — reuse validation and enum/date constraints; may need admin draft/input schemas and admin row types for nullable SQL fields plus status fields.
- `src/domain/resources/resourceRepository.ts` — public repository currently only lists resources/options; admin CRUD should either use a separate `AdminResourceRepository` or extend through a clearly separate interface.
- `supabase/migrations/20260508120000_create_resources_schema.sql` — already supports admin select/insert/update and soft-delete-by-update; physical delete would require a new migration and is not recommended for this phase.
- `src/lib/adminAuth.ts`, `src/context/AdminAuthContext.tsx`, `src/components/admin/RequireAdmin.tsx` — admin CRUD should consume the existing boundary, not duplicate auth/authorization checks in UI code.
- Tests: `src/routes.test.ts`, repository tests, hook/helper tests, and page/component pure-render tests should cover the CRUD behavior without adding Testing Library unless explicitly scoped.

### Approaches
1. **Separate admin resource repository + protected admin pages** — Create an admin-only repository with `listAll`, `create`, `update`, and `softDelete` methods using the anon client under existing RLS. Reuse resource validation/mapping, but do not reuse public fallback behavior for writes.
   - Pros: Keeps public map/list behavior isolated; honors RLS/admin boundary; testable with mocked Supabase client; supports active/inactive resources; safest path for real data.
   - Cons: More code than only extending the public repository; requires careful row/draft mapping and form validation.
   - Effort: Medium/High

2. **Extend the existing public resource repository into CRUD** — Add insert/update/delete-ish methods to `supabaseResourceRepository` and use it from admin pages.
   - Pros: Fewer files and can reuse existing row mapping directly.
   - Cons: Dangerous coupling: the public repository silently falls back to JSON on read errors, lacks admin status fields, and its contract is public listing rather than persistence management.
   - Effort: Medium

3. **Database-first RPC CRUD layer** — Add Supabase RPC functions for create/update/soft-delete, exposing narrow operations to the frontend instead of direct table mutations.
   - Pros: Stronger encapsulation and centralized validation/audit possibilities.
   - Cons: Requires new SQL surface and more migration review; likely too much for a first CRUD slice unless business rules become complex.
   - Effort: High

### Recommendation
Use Approach 1. Keep Phase 5 focused on resources only: protected `/admin/resources` CRUD, a separate admin repository, shared Zod/domain validation, and soft-delete via update because current RLS intentionally exposes no physical delete policy. The public list/map should continue using `usePublicResources`; admin CRUD may reuse pure mapping/validation utilities but should not import the public hook or inherit fallback-to-local behavior.

For route shape, prefer a reviewable first slice: keep `/admin` as the landing/shell and add `/admin/resources` as a protected page under `RequireAdmin`. If multiple CRUD subpages are needed, use `/admin/resources/new` and `/admin/resources/:id/edit`, but plan this carefully because route/page/form work can exceed the 400-line review budget.

### Risks
- Full CRUD UI can exceed the 400-line review budget. A safer split is: (1) admin repository + route/list/read-only admin table, (2) create/edit form, (3) soft-delete/status handling and docs.
- Physical delete is not supported by current RLS. Implementing hard delete would require a migration and a stronger data-retention decision; default to soft-delete.
- Public repository fallback is useful for anonymous reads but unsafe for admin writes because it can hide Supabase failures. Do not couple admin CRUD to that behavior.
- Tests currently avoid DOM tooling; complex form interactions will be harder to test without Testing Library. Either keep form logic in pure helpers/hooks or explicitly scope adding DOM test tooling later.
- Supabase table constraints require valid dates, non-empty arrays/text, allowed resource types, and `verification_verified_at` when status is `verified`; admin forms must surface these validation failures clearly.
- Admin authorization still depends on real Supabase RLS in production. Frontend route guards improve UX but are not the security boundary; the database policies remain authoritative.

### Ready for Proposal
Yes — propose Phase 5 as a reviewable admin resource CRUD change under `/admin`, backed by existing `admin_users`/`is_admin()` RLS. Keep scope to resources, use soft-delete/status retirement, avoid secrets/admin provisioning, and forecast chained PRs if create/edit/delete UI is included in one phase.
