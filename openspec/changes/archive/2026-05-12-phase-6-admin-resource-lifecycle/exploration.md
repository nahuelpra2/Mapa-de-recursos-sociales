## Exploration: phase-6-admin-resource-lifecycle

### Current State
The admin area already has a protected React Router boundary (`/admin`, `/admin/resources`, `/admin/resources/new`, `/admin/resources/:id/edit`) backed by `RequireAdmin` and Supabase Auth/RLS. Admin resources use a separate repository + Zod draft model, but today the model only allows `estado: "activo"`, and the repository only supports `listAll`, `getById`, `create`, and `update`.

The Supabase migration is the key constraint: `public.resources` already has `estado text not null default 'activo'` and `deleted_at timestamptz`, with a check that `deleted_at` implies `estado = 'inactivo'`. Public reads only see active, non-deleted rows; admins can select/insert/update, but there is no delete policy. The migration comment explicitly says physical row removal is not exposed through RLS.

### Affected Areas
- `supabase/migrations/20260508120000_create_resources_schema.sql` — current RLS allows admin update only; delete needs a policy decision.
- `src/data/adminResourceSchema.ts` — admin row/status model only knows `activo`; archive/delete need richer lifecycle fields.
- `src/domain/resources/adminResourceRepository.ts` — repository contract will need lifecycle methods.
- `src/data/adminResourceRepository.ts` — Supabase adapter must implement archive/delete behavior safely.
- `src/hooks/useAdminResources.ts` — submit/state helpers likely need lifecycle action handling and error copy.
- `src/pages/admin/AdminResourcesListPage.tsx` / `adminResourceListPresentation.ts` — best UI surface for archive/delete actions.
- `src/pages/admin/AdminResourceEditPage.tsx` / `adminResourceFormPresentation.ts` — optional secondary surface if actions also appear on detail/edit.
- `src/routes.ts`, `src/App.tsx` — only if a dedicated confirmation route is chosen; otherwise no route change is required.
- `src/data/adminResourceRepository.test.ts`, `src/data/adminResourceSchema.test.ts`, `src/pages/admin/*.test.ts`, `src/routes.test.ts` — cover lifecycle helpers and keep out-of-scope route assumptions honest.

### Approaches
1. **Archive = update, Delete = hard delete with new RLS policy** — keep archive as a status transition (`estado = 'inactivo'`, optionally `deleted_at`), and add a real delete policy/mutation for irreversible removal.
   - Pros: matches the user’s intent exactly; archive stays recoverable while delete truly removes stale rows; clear domain semantics.
   - Cons: requires a migration/policy change; irreversible operation needs stronger confirmation and review; more code than a pure soft-delete model.
   - Effort: Medium/High

2. **Archive and delete both map to soft-retirement** — archive via `estado = 'inactivo'`, delete via `estado = 'inactivo'` plus `deleted_at`, with no physical removal.
   - Pros: aligns with the current schema comments and avoids changing RLS; lower risk; easier to review.
   - Cons: does not satisfy literal delete semantics; old rows remain in the table forever.
   - Effort: Medium

### Recommendation
Use Approach 1 only if the team is willing to change the database policy/migration for hard delete. That is the only option that truly delivers both actions the user asked for; the current schema already supports archive, but it intentionally blocks physical removal. If the team wants the smallest safe slice first, ship archive now and keep delete behind a follow-up migration decision.

For a reviewable first implementation, keep the UI inside the existing admin list/edit screens instead of adding new routes. That avoids route churn, stays under the current admin boundary, and keeps lifecycle actions close to the resource row being managed.

### Risks
- Hard delete is currently blocked by the migration/RLS design, so delete cannot be implemented honestly without a schema change.
- Adding archive/delete to the list page can expand review surface quickly; keep the first slice focused on repository + one UI surface.
- The admin schema still models only `activo`; if archive is added, status mapping and fixtures must be updated together or tests will drift.

### Ready for Proposal
Yes — but the proposal should explicitly decide whether delete means hard delete with a new policy or soft-retirement only. If hard delete is accepted, this change needs a migration-backed design review before apply.
