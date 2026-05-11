# Tasks: Phase 5 Admin Resource CRUD

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 700-1,000 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 foundation → PR2 list → PR3 create/edit |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Routes, contracts, validators, mappers | PR 1 | Vitest first; no UI pages beyond wiring-safe stubs. |
| 2 | Admin repository + list page | PR 2 | Covers loading/error/empty/success and no fallback. |
| 3 | Shared form + create/edit pages | PR 3 | Reuses validation; verifies no delete/soft-delete UI. |

## Phase 1: Routing Inventory / Foundation

- [x] 1.1 RED: update `src/routes.test.ts` to allow only `/admin/resources`, `/new`, `/:id/edit`; keep invite/roles/delete/bulk absent.
- [x] 1.2 GREEN: update `src/routes.ts` route constants and `configuredAdminRoutePaths` for list/create/edit only.
- [x] 1.3 RED: add tests for `src/data/adminResourceSchema.ts` draft validation, null mapping, required SQL fields, `estado: activo`.
- [x] 1.4 GREEN: create `src/domain/resources/adminResourceRepository.ts` contract and `src/data/adminResourceSchema.ts` helpers.

## Phase 2: Admin Repository

- [x] 2.1 RED: add `src/data/adminResourceRepository.test.ts` for `listAll`, `getById`, `create`, `update`, Supabase/RLS failures, and no local fallback.
- [x] 2.2 GREEN: create `src/data/adminResourceRepository.ts` using anon Supabase client only; no service secrets or fallback imports.

## Phase 3: Admin List

- [ ] 3.1 RED: test `src/hooks/useAdminResources.ts` list state transitions: loading, error, empty, success.
- [ ] 3.2 GREEN: create `src/hooks/useAdminResources.ts` list orchestration and `src/pages/admin/AdminResourcesListPage.tsx` with create/edit links.
- [ ] 3.3 Wire `src/App.tsx` nested admin routes and convert `src/pages/AdminShell.tsx` to layout/nav with `Outlet`.

## Phase 4: Create / Edit

- [ ] 4.1 RED: test create/edit validation and submit success/failure helpers in `src/hooks/useAdminResources.ts`.
- [ ] 4.2 GREEN: create `src/components/admin/AdminResourceForm.tsx` controlled form with field-safe errors.
- [ ] 4.3 Create `src/pages/admin/AdminResourceCreatePage.tsx` using validation before repository `create`.
- [ ] 4.4 Create `src/pages/admin/AdminResourceEditPage.tsx` using `getById`, not-found/error states, and repository `update`.

## Phase 5: Exclusions / Verification / Docs

- [x] 5.1 Add tests/assertions that delete, soft-delete, archive, deactivate, bulk, geocoding, upload, and user-management actions/routes are absent.
- [ ] 5.2 Update SDD docs only if scope notes changed; do not add migrations or public UX redesign.
- [x] 5.3 Allowed verification: `npm test`, targeted `npx vitest run <file>`, and `npm run lint`; do NOT run `npm run build`.
