# Design: Phase 5 Admin Resource CRUD

## Technical Approach

Add admin-only list/create/edit routes under the existing React Router + `RequireAdmin` boundary. Keep public resource loading untouched. Create a separate admin Supabase adapter with no local fallback, reuse existing Zod/domain validation where safe, and add admin input/row mapping for SQL-only fields (`estado`, timestamps). No delete, archive, deactivate, bulk, geocoding, or secret-bearing flows.

## Architecture Decisions

| Topic | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Routes | Use `/admin/resources`, `/admin/resources/new`, `/admin/resources/:id/edit` under `RequireAdmin`. | Single modal route; flat unprotected route declarations. | Matches spec URLs and keeps all resource management behind Phase 4 admin auth. |
| Admin UI boundary | Convert `AdminShell` into a small admin layout/nav using React Router nested routes/`Outlet`; move landing copy to an index page or shell section. | Duplicate shell markup per page. | Avoids repeated logout/nav code as admin grows. |
| Repository | Create `src/data/adminResourceRepository.ts` and `src/domain/resources/adminResourceRepository.ts`. | Extend `supabaseResourceRepository`. | Public repo falls back to JSON on failures; admin reads/writes must fail loudly and safely. |
| Validation | Add admin draft schema/mapper beside existing `resourceSchema`. | Validate only through form `required` and DB constraints. | Pure Zod helpers are Vitest-friendly and catch invalid writes before persistence. |
| Security | Browser anon Supabase client only; rely on `is_admin()` RLS for select/insert/update. | Service role/API routes/admin provisioning. | Existing project security model forbids frontend secrets and already has RLS policies. |

## Data Flow

```text
Admin route -> RequireAdmin -> AdminShell -> page/hook -> AdminResourceRepository
                                               |              |
                                               v              v
                                         form/list state   Supabase RLS
```

List calls `listAll()` and renders loading/error/empty/success. Create validates draft, maps camelCase form input to `resources` insert payload, persists, then shows success or navigates to list. Edit loads by `id`, maps row to editable draft, validates updates, persists via update, and handles not-found/RLS errors with non-sensitive messages.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/routes.ts` | Modify | Add `adminResources`, `adminResourceNew`, `adminResourceEdit`; update tests to allow only these CRUD routes. |
| `src/App.tsx` | Modify | Mount nested/child admin resource routes inside `RequireAdmin`. |
| `src/pages/AdminShell.tsx` | Modify | Add nav/logout layout and render admin child content. |
| `src/pages/admin/AdminResourcesListPage.tsx` | Create | Admin list states and edit/create links. |
| `src/pages/admin/AdminResourceCreatePage.tsx` | Create | Create flow using reusable form. |
| `src/pages/admin/AdminResourceEditPage.tsx` | Create | Load-by-id, edit, not-found/error states. |
| `src/components/admin/AdminResourceForm.tsx` | Create | Controlled form UI; receives draft, field errors, submit state. |
| `src/hooks/useAdminResources.ts` | Create | Testable list/create/edit state orchestration. |
| `src/domain/resources/adminResourceRepository.ts` | Create | `listAll`, `getById`, `create`, `update` async contract. |
| `src/data/adminResourceRepository.ts` | Create | Supabase adapter, row/input mappers, safe errors; no fallback. |
| `src/data/adminResourceSchema.ts` | Create | Draft schema, payload mapping, field-safe validation errors. |

## Interfaces / Contracts

```ts
type AdminResourceRepository = {
  listAll(): Promise<AdminResource[]>;
  getById(id: string): Promise<AdminResource | null>;
  create(input: AdminResourceDraft): Promise<AdminResource>;
  update(id: string, input: AdminResourceDraft): Promise<AdminResource>;
};
```

Required fields mirror DB constraints: `id`, `nombre`, `tipo`, `direccion`, `lat`, `lng`, non-empty `poblacion`, `fuente`, `ultima_actualizacion`, `verification_status/source`, `maintenance_owner/review_by`; `verified` requires `verification_verified_at`. Optional blank text maps to `null`. `estado` remains `activo` for create/edit in this phase.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Draft validation, row/payload mappers, route constants, pure state decisions. | Vitest only. |
| Adapter | Supabase select/insert/update success and rejected RLS/error paths. | Mock repository client; assert no fallback calls exist. |
| UI logic | Loading/error/empty/success and submit success/failure reducers/helpers. | Pure helpers/hooks where possible; avoid Testing Library unless implementation cannot isolate logic. |
| E2E | Not in scope. | Manual verification later. |

## Migration / Rollout

No migration required. Existing RLS supports admin select/insert/update and trigger-managed `updated_at`. Roll out in review slices: (1) routes/contracts/validators/mappers, (2) admin repository + tests, (3) list page, (4) create/edit form pages. Under `ask-on-risk`, stop before apply if a slice is forecast above 400 changed lines.

## Open Questions

- [ ] None blocking; final form field grouping can be decided during tasks without changing architecture.
