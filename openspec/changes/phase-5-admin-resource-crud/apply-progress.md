# Apply Progress: Phase 5 Admin Resource CRUD

**Mode**: Strict TDD  
**Slice**: cumulative — Slice 1 foundation + Slice 2 admin resource list UI / route mounting / list states  
**PR boundary**: stacked-to-main; Slice 2 mounts only `/admin/resources` inside the existing `RequireAdmin` boundary and leaves create/edit forms/pages for the next slice.  
**Status**: partial — Slice 1 and Slice 2 complete, create/edit slice pending.

## Completed Tasks

- [x] 1.1 RED: update `src/routes.test.ts` to allow only `/admin/resources`, `/new`, `/:id/edit`; keep invite/roles/delete/bulk absent.
- [x] 1.2 GREEN: update `src/routes.ts` route constants and `configuredAdminRoutePaths` for list/create/edit only.
- [x] 1.3 RED: add tests for `src/data/adminResourceSchema.ts` draft validation, null mapping, required SQL fields, `estado: activo`.
- [x] 1.4 GREEN: create `src/domain/resources/adminResourceRepository.ts` contract and `src/data/adminResourceSchema.ts` helpers.
- [x] 2.1 RED: add `src/data/adminResourceRepository.test.ts` for `listAll`, `getById`, `create`, `update`, Supabase/RLS failures, and no local fallback.
- [x] 2.2 GREEN: create `src/data/adminResourceRepository.ts` using anon Supabase client only; no service secrets or fallback imports.
- [x] 3.1 RED: test `src/hooks/useAdminResources.ts` list state transitions: loading, error, empty, success.
- [x] 3.2 GREEN: create `src/hooks/useAdminResources.ts` list orchestration and `src/pages/admin/AdminResourcesListPage.tsx` with create/edit links.
- [x] 3.3 Wire `src/App.tsx` nested admin routes and convert `src/pages/AdminShell.tsx` to layout/nav with `Outlet`.
- [x] 5.1 Add tests/assertions that delete, soft-delete, archive, deactivate, bulk, geocoding, upload, and user-management actions/routes are absent.
- [x] 5.3 Allowed verification run with targeted `npm test -- <files>`, `npm test`, and `npm run lint`; `npm run build` was not run.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.1 | `src/routes.test.ts` | Unit | ✅ Existing route baseline: 3/3 passed | ✅ Failed on missing `appRoutes.adminResources` | ✅ `src/routes.test.ts`: 4/4 passed | ✅ List/create/edit plus out-of-scope route absence | ✅ Route assertions grouped by in-scope/out-of-scope behavior |
| 1.2 | `src/routes.test.ts` | Unit | ✅ Covered by 1.1 baseline | ✅ Same RED from 1.1 drove route constants | ✅ `src/routes.test.ts`: 4/4 passed | ➖ Structural constants; triangulation captured by multiple route constants | ➖ None needed |
| 1.3 | `src/data/adminResourceSchema.test.ts` | Unit | N/A (new file) | ✅ Failed on missing `./adminResourceSchema` | ✅ `src/data/adminResourceSchema.test.ts`: 5/5 passed | ✅ Complete draft, invalid required SQL fields, blank-to-null payload, row mapping, nullable SQL row | ✅ Extracted optional blank text normalization |
| 1.4 | `src/data/adminResourceSchema.test.ts` | Unit | N/A (new files) | ✅ Same RED from 1.3 drove schema/contract creation | ✅ `src/data/adminResourceSchema.test.ts`: 5/5 passed | ✅ Payload and row mapper cover different paths | ✅ Kept repository contract type-only and schema helpers pure |
| 2.1 | `src/data/adminResourceRepository.test.ts` | Unit with mocked adapter client | N/A (new file) | ✅ Failed on missing `./adminResourceRepository` | ✅ `src/data/adminResourceRepository.test.ts`: 6/6 passed | ✅ list/get/create/update/error/no-client scenarios | ✅ Shared row/draft fixtures within test |
| 2.2 | `src/data/adminResourceRepository.test.ts` | Unit with mocked adapter client | N/A (new file) | ✅ Same RED from 2.1 drove repository adapter | ✅ `src/data/adminResourceRepository.test.ts`: 6/6 passed | ✅ Success and Supabase/RLS failure paths; no fallback on null client | ✅ Centralized safe persistence error handling |
| 3.1 | `src/hooks/useAdminResources.test.ts` | Unit with pure state helpers | N/A (new file) | ✅ Failed on missing `./useAdminResources` | ✅ Slice tests: 11/11 passed | ✅ Loading, success, empty, error-with-previous-resources, and row visibility paths | ✅ Kept hook thin and extracted state transitions as pure functions |
| 3.2 | `src/pages/admin/AdminResourcesListPage.test.ts` | Unit presentation-model | N/A (new file) | ✅ Failed on missing `./AdminResourcesListPage` | ✅ Slice tests: 11/11 passed | ✅ Loading/error/empty copy plus success row mapping with edit link | ✅ Moved presentation resolver to `adminResourceListPresentation.ts` to satisfy Fast Refresh lint |
| 3.3 | `src/App.test.tsx`, `src/pages/AdminShell.test.ts` | Unit route/nav config | ✅ Baseline targeted tests: 14/14 passed before modifying existing route/auth-adjacent files | ✅ Failed on missing `appRouteConfiguration` and missing `getAdminShellNavigation` export | ✅ Slice tests: 11/11 passed; targeted verification: 21/21 passed | ✅ Protected list child mounted; create/edit constants remain declared but not mounted in this slice; nav excludes bulk/delete/users | ✅ Extracted route and nav helpers to pure modules so tests avoid DOM/Leaflet and Fast Refresh warnings |
| 5.1 | `src/routes.test.ts`, `src/pages/AdminShell.test.ts` | Unit | ✅ Existing route baseline: 3/3 passed | ✅ Out-of-scope route/nav assertions added before/around constants | ✅ Targeted verification: 21/21 passed | ✅ Delete/archive/deactivate/bulk/geocoding/upload/users/invite/roles asserted absent across routes/nav | ➖ None needed |
| 5.3 | Targeted tests + lint + full tests | Verification | N/A | ➖ Verification task | ✅ Targeted tests: 21/21 passed; lint passed; full `npm test`: 117/117 passed | ➖ Not applicable | ➖ Not applicable |

## Test Summary

- **Total tests written/updated**: 26 targeted tests across 7 files for Phase 5 completed slices.
- **Total targeted tests passing**: 21/21 in Slice 2 verification command; full suite 117/117 passing.
- **Layers used**: Unit (26), Integration (0), E2E (0).
- **Approval tests**: None — no refactoring-only task.
- **Pure functions created**: `validateAdminResourceDraft`, `toAdminResourcePayload`, `mapAdminResourceRow`, repository error helpers, `createAdminResourcesLoadingState`, `resolveAdminResourcesSuccess`, `resolveAdminResourcesError`, `shouldShowAdminResourceRows`, `resolveAdminResourceListPresentation`, `getAdminShellNavigation`, `getProtectedAdminRouteConfiguration`, `getRelativeAdminResourcesPath`.

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `src/routes.test.ts` | Modified in Slice 1 | Added Phase 5 in-scope admin resource route assertions and out-of-scope route exclusions. |
| `src/routes.ts` | Modified in Slice 1 | Added protected list/create/edit admin resource route constants. |
| `src/data/adminResourceSchema.test.ts` | Created in Slice 1 | Covered draft validation, required SQL-backed fields, blank-to-null payload mapping, active status, and row mapping. |
| `src/data/adminResourceSchema.ts` | Created in Slice 1 | Added admin draft schema, payload mapper, row mapper, and admin resource row/payload types. |
| `src/domain/resources/adminResourceRepository.ts` | Created in Slice 1 | Added admin repository contract with `listAll`, `getById`, `create`, and `update`. |
| `src/data/adminResourceRepository.test.ts` | Created in Slice 1 | Covered mocked Supabase list/get/create/update, safe failures, and no local fallback behavior. |
| `src/data/adminResourceRepository.ts` | Created in Slice 1 | Added anon Supabase admin adapter with safe non-sensitive errors and no local fallback imports. |
| `src/hooks/useAdminResources.test.ts` | Created in Slice 2 | Covered list loading, success, empty, error, and row visibility states. |
| `src/hooks/useAdminResources.ts` | Created in Slice 2 | Added thin admin resource list hook plus pure state transition helpers. |
| `src/pages/admin/AdminResourcesListPage.test.ts` | Created in Slice 2 | Covered presentation-model copy, create link, edit link row mapping, and no delete/bulk action model. |
| `src/pages/admin/adminResourceListPresentation.ts` | Created in Slice 2 | Added pure presentation resolver for loading/error/empty/success list states. |
| `src/pages/admin/AdminResourcesListPage.tsx` | Created in Slice 2 | Added admin list page UI with create and edit links only; no delete/bulk actions. |
| `src/pages/AdminShell.test.ts` | Created in Slice 2 | Covered safe admin shell resources navigation and out-of-scope nav absence. |
| `src/pages/adminShellNavigation.ts` | Created in Slice 2 | Added pure admin shell navigation model. |
| `src/pages/AdminShell.tsx` | Modified in Slice 2 | Converted shell to admin layout/nav with `Outlet` and resources link. |
| `src/App.test.tsx` | Created in Slice 2 | Covered protected admin route configuration for the list slice. |
| `src/appRouteConfiguration.ts` | Created in Slice 2 | Added pure route configuration helpers used by tests and `App.tsx`. |
| `src/App.tsx` | Modified in Slice 2 | Mounted `/admin/resources` as a nested child under the existing `RequireAdmin` boundary. |
| `src/test/fixtures/adminResources.ts` | Created in Slice 2 | Added reusable admin resource fixture for Vitest unit tests. |
| `openspec/changes/phase-5-admin-resource-crud/tasks.md` | Modified | Marked completed Slice 1 and Slice 2 tasks. |
| `openspec/changes/phase-5-admin-resource-crud/apply-progress.md` | Modified | Recorded cumulative Slice 1 + Slice 2 implementation and TDD evidence. |

## Commands Run

| Command | Result |
|---------|--------|
| `npm test -- src/routes.test.ts` | Slice 1 baseline before route changes: 3/3 passed. |
| `npm test -- src/routes.test.ts` | Slice 1 RED: failed on missing `appRoutes.adminResources`. |
| `npm test -- src/routes.test.ts` | Slice 1 GREEN: 4/4 passed after route constants. |
| `npm test -- src/data/adminResourceSchema.test.ts` | Slice 1 RED: failed on missing `./adminResourceSchema`. |
| `npm test -- src/data/adminResourceSchema.test.ts` | Slice 1 intermediate GREEN attempt: 4/5 passed; blank optional text still rejected. |
| `npm test -- src/data/adminResourceSchema.test.ts` | Slice 1 GREEN: 5/5 passed after optional blank normalization. |
| `npm test -- src/data/adminResourceRepository.test.ts` | Slice 1 RED: failed on missing `./adminResourceRepository`. |
| `npm test -- src/data/adminResourceRepository.test.ts` | Slice 1 GREEN: 6/6 passed after repository adapter. |
| `npm test -- src/routes.test.ts src/data/adminResourceSchema.test.ts src/data/adminResourceRepository.test.ts && npm run lint` | Slice 1 final targeted verification: 15/15 passed; lint passed. |
| `npm test -- src/routes.test.ts src/components/admin/RequireAdmin.test.ts src/data/adminResourceRepository.test.ts` | Slice 2 safety net before modifying existing admin route/shell flow: 14/14 passed. |
| `npm test -- src/hooks/useAdminResources.test.ts src/pages/admin/AdminResourcesListPage.test.ts src/pages/AdminShell.test.ts src/App.test.tsx` | Slice 2 RED attempt: failed on missing fixture/modules plus `App` import triggered Leaflet `window` in node. |
| `npm test -- src/hooks/useAdminResources.test.ts src/pages/admin/AdminResourcesListPage.test.ts src/pages/AdminShell.test.ts src/App.test.tsx` | Slice 2 corrected RED: failed on missing `./useAdminResources`, `./AdminResourcesListPage`, `./appRouteConfiguration`, and `getAdminShellNavigation`. |
| `npm test -- src/hooks/useAdminResources.test.ts src/pages/admin/AdminResourcesListPage.test.ts src/pages/AdminShell.test.ts src/App.test.tsx` | Slice 2 GREEN: 11/11 passed after list state, presentation, nav, and route helpers/pages. |
| `npm test -- src/hooks/useAdminResources.test.ts src/pages/admin/AdminResourcesListPage.test.ts src/pages/AdminShell.test.ts src/App.test.tsx src/routes.test.ts src/data/adminResourceRepository.test.ts && npm run lint` | First Slice 2 verification: tests 21/21 passed; lint failed on unused `_error` and Fast Refresh helper exports. |
| `npm test -- src/hooks/useAdminResources.test.ts src/pages/admin/AdminResourcesListPage.test.ts src/pages/AdminShell.test.ts src/App.test.tsx src/routes.test.ts src/data/adminResourceRepository.test.ts && npm run lint` | Final targeted verification: tests 21/21 passed; lint passed after refactor. |
| `npm test` | Full Vitest suite: 26 files passed, 117/117 tests passed. |

## Deviations from Design

- Slice 2 mounts only `/admin/resources`; create/edit route constants remain from Slice 1, but create/edit pages/forms are intentionally not mounted or implemented until the next slice per the user boundary.
- UI behavior was tested through pure state/presentation/route/nav helpers instead of DOM Testing Library because Testing Library is not installed and the project testing capability cache says unit-only Vitest is available.
- The proposal still mentions soft-delete/retire in older text, but the controlling user scope/spec for Phase 5 is List + Create + Edit only. Implementation excludes delete/soft-delete/archive/deactivate.

## Issues Found

- `openspec/config.yaml` is absent in this workspace; Strict TDD mode was resolved from the orchestrator instruction and Engram testing-capabilities cache.
- Existing `tasks.md` still says `Chain strategy: pending`; the apply prompt resolved this slice as `stacked-to-main`, so implementation followed the prompt and recorded that boundary here.
- Importing `App.tsx` directly in a node-only Vitest unit test pulls the public resources page/Leaflet dependency and fails with `window is not defined`; route mounting assertions were moved to a pure `appRouteConfiguration` helper to avoid adding DOM tooling.

## Remaining Tasks

- [ ] 4.1 RED: test create/edit validation and submit success/failure helpers in `src/hooks/useAdminResources.ts`.
- [ ] 4.2 GREEN: create `src/components/admin/AdminResourceForm.tsx` controlled form with field-safe errors.
- [ ] 4.3 Create `src/pages/admin/AdminResourceCreatePage.tsx` using validation before repository `create`.
- [ ] 4.4 Create `src/pages/admin/AdminResourceEditPage.tsx` using `getById`, not-found/error states, and repository `update`.
- [ ] 5.2 Update SDD docs only if scope notes changed; no migration or public UX redesign added.

## Workload / PR Boundary

- **Mode**: stacked PR slice.
- **Current work unit**: Slice 2 admin resource list UI / route mounting / list states.
- **Boundary**: Starts from Slice 1 admin CRUD foundation; ends with a protected `/admin/resources` list page, admin shell navigation, and pure-tested loading/error/empty/success list behavior.
- **Estimated review budget impact**: Kept focused by excluding create/edit forms and avoiding new DOM testing dependencies.

## Status

11/16 tasks complete. Slice 2 is ready for verify or the next stacked create/edit slice.
