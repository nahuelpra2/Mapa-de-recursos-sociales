# Design: Phase 6 Admin Resource Lifecycle

## Technical Approach

Extend the existing protected admin CRUD path instead of adding routes. Admin list/edit already load through `useAdminResources` and `AdminResourceRepository`; this change adds single-resource archive and hard-delete actions to that path. Archive is an `update` that sets `estado = 'inactivo'` and `deleted_at = now()`. Hard delete is a Supabase `.delete().eq("id", id)` protected by a new RLS delete policy using `public.is_admin()`.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Lifecycle boundary | Add `archive(id)` and `delete(id)` to `AdminResourceRepository` | Put Supabase calls directly in pages/hooks | Existing code keeps persistence behind repository contracts; preserving it keeps RLS failures testable and UI-safe. |
| Archive semantics | Persist `estado: "inactivo"` plus `deleted_at` timestamp | Only set `estado`, or add restore UI | The public RLS policy already hides `estado != 'activo'` and `deleted_at != null`; setting both matches proposal and keeps restore out of scope. |
| UI placement | Add actions in `AdminResourcesListPage` row actions with confirmation state | Add new admin routes or bulk toolbar | Specs require single-resource behavior only; row actions keep review surface small and avoid route churn. |
| Delete guard | Require explicit in-page confirmation before calling repository | Browser `confirm()` only | A modeled confirmation state is unit-testable and prevents persistence when confirmation is incomplete. |

## Data Flow

```text
AdminResourcesListPage
  └─ useAdminResourceLifecycleAction(repository)
       ├─ archive(id) ──→ repository.archive(id) ──→ Supabase update resources
       └─ delete(id, confirmed) ──→ repository.delete(id) ──→ Supabase delete resources
                  │                                      │
                  └── safe UI state/error ← AdminResourcePersistenceError/RLS
```

After success, refresh list state from `listAll()` or remove the affected row locally only after persistence succeeds. No optimistic fallback is allowed.

## File Changes

| File | Action | Description |
|---|---|---|
| `supabase/migrations/20260512_admin_resource_lifecycle.sql` | Create | Add admin-only delete RLS policy and update comments that physical delete is admin-exposed. |
| `src/data/adminResourceSchema.ts` | Modify | Expand `AdminResourceStatus` to `"activo" | "inactivo"`; add `deletedAt`; add archive payload helper. |
| `src/domain/resources/adminResourceRepository.ts` | Modify | Add `archive(id)` and `delete(id)` contract methods. |
| `src/data/adminResourceRepository.ts` | Modify | Implement Supabase `update({ estado: "inactivo", deleted_at })` and `.delete().eq("id", id)` with safe errors. |
| `src/hooks/useAdminResources.ts` | Modify | Add lifecycle action result/state helpers for pending, success, and safe error states. |
| `src/pages/admin/adminResourceListPresentation.ts` | Modify | Add row labels, status, confirmation copy, and action availability. |
| `src/pages/admin/AdminResourcesListPage.tsx` | Modify | Render archive/delete controls and confirmation UI inside admin boundary. |
| Relevant `*.test.ts(x)` and fixtures | Modify | Cover schema, repository, hook, presentation, and page behavior. |

## Interfaces / Contracts

```ts
type AdminResourceStatus = "activo" | "inactivo";
type AdminResource = Resource & { estado: AdminResourceStatus; deletedAt: string | null; createdAt: string; updatedAt: string };
type AdminResourceRepository = {
  listAll(): Promise<AdminResource[]>;
  getById(id: string): Promise<AdminResource | null>;
  create(input: AdminResourceDraft): Promise<AdminResource>;
  update(id: string, input: AdminResourceDraft): Promise<AdminResource>;
  archive(id: string): Promise<AdminResource>;
  delete(id: string): Promise<void>;
};
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Schema maps inactive rows and `deleted_at`; archive payload is correct | `adminResourceSchema.test.ts` with fixture overrides. |
| Unit | Repository calls `update`/`delete`, preserves safe `AdminResourcePersistenceError`, and does not fallback | Mock Supabase chain in `adminResourceRepository.test.ts`. |
| Unit | Confirmation blocks delete before persistence; rejected archive/delete returns safe recoverable state | `useAdminResources.test.ts`. |
| Presentation | Row actions, irreversible copy, non-sensitive errors, no bulk/restore actions | `AdminResourcesListPage.test.ts` and presentation tests. |
| DB/RLS | Admin delete policy exists and non-admin delete is rejected | Migration review plus Supabase policy tests if project adds DB test harness later. |

## Migration / Rollout

Create a forward migration only. It adds `for delete to authenticated using (public.is_admin())` and updates resource comments. Rollback is a follow-up migration dropping that policy and restoring the comment. No data backfill is required because `estado` and `deleted_at` already exist.

## Open Questions

- [ ] Exact confirmation phrase/copy is not specified; implementation should keep irreversible-delete copy explicit and non-sensitive.
