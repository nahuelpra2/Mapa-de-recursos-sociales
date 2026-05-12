# Tasks: Phase 6 Admin Resource Lifecycle

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~520-680 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 foundation+RLS → PR 2 schema/repo/hook tests+impl → PR 3 UI wiring + verification |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | DB + contract foundation | PR 1 | `supabase/migrations/20260512_admin_resource_lifecycle.sql`, `src/domain/resources/adminResourceRepository.ts` |
| 2 | Schema/repo/hook behavior | PR 2 | test-first for `src/data/adminResourceSchema.ts`, `src/data/adminResourceRepository.ts`, `src/hooks/useAdminResources.ts` |
| 3 | Admin UI lifecycle flow | PR 3 | `src/pages/admin/adminResourceListPresentation.ts`, `src/pages/admin/AdminResourcesListPage.tsx`, tests |

## Phase 1: Foundation / Contracts

- [x] 1.1 Add `supabase/migrations/20260512_admin_resource_lifecycle.sql` with admin-only delete RLS and updated comment for physical removal.
- [x] 1.2 Extend `src/domain/resources/adminResourceRepository.ts` with `archive(id)` and `delete(id)` and keep existing methods unchanged.
- [x] 1.3 Update `src/test/fixtures/adminResources.ts` to support inactive/deleted rows for lifecycle cases.

## Phase 2: RED Tests First

- [x] 2.1 Add failing cases in `src/data/adminResourceSchema.test.ts` for `estado: "inactivo"`, `deleted_at` mapping, and archive payload shape.
- [x] 2.2 Add failing repository cases in `src/data/adminResourceRepository.test.ts` for archive update, hard delete, and safe RLS rejection.
- [x] 2.3 Add failing lifecycle-state cases in `src/hooks/useAdminResources.test.ts` for confirmation gating and non-sensitive archive/delete errors.

## Phase 3: GREEN Implementation

- [x] 3.1 Implement schema changes in `src/data/adminResourceSchema.ts` for `AdminResourceStatus`, `deletedAt`, and archive payload mapping.
- [x] 3.2 Implement `archive`/`delete` in `src/data/adminResourceRepository.ts` using Supabase `update`/`delete` with safe persistence errors only.
- [x] 3.3 Extend `src/hooks/useAdminResources.ts` with lifecycle action state/helpers and confirmation-blocked delete handling.

## Phase 4: UI Wiring + Verification

- [x] 4.1 Update `src/pages/admin/adminResourceListPresentation.ts` and `src/pages/admin/AdminResourcesListPage.tsx` with archive/delete row actions, explicit delete copy, and safe error states.
- [x] 4.2 Update `src/pages/admin/AdminResourcesListPage.test.ts` and related presentation tests to cover archive/delete visibility, confirmation, and rejected writes.
