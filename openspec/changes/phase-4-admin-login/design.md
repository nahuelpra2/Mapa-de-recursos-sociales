# Design: Phase 4 Admin Login

## Technical Approach

Add `react-router-dom` and keep the current public app as the `/` route by extracting the existing `App.tsx` body into a public page component. Add `/admin/login` and a protected `/admin` shell placeholder. Supabase Auth remains behind small typed helpers around the existing browser anon client; identity (`session`) and authorization (`is_admin()`/`admin_users`) stay separate.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Routing | Use `react-router-dom` with `BrowserRouter`, `Routes`, `Route`, `Navigate`, and a protected admin route. | Manual pathname router. | Proposal requires React Router for scalability; admin CRUD subroutes can later nest under `/admin` without reworking navigation. |
| Public UI isolation | Move current `App.tsx` UI into `src/pages/PublicResourcesPage.tsx`; make `App.tsx` only route composition. | Keep all routes inside current monolithic `App`. | Minimizes disruption: public hooks/components stay unchanged and admin code does not pollute map/list state. |
| Auth boundary | Create `src/lib/adminAuth.ts` with `signInAdmin`, `restoreAdminSession`, `signOutAdmin`, `checkIsAdmin`. | Inline Supabase calls in components. | Pure helpers are testable with Vitest mocks and prevent components from confusing session with admin permission. |
| State | Use a small `AdminAuthProvider` + hook for `loading/session/isAdmin/error`; no Redux/Zustand. | Global store library. | State is local to admin routing and Supabase already persists sessions; extra state tooling is overengineering. |
| Non-admin handling | Show access denied on login/admin flow and sign out by default after denied admin check. | Keep signed-in non-admin session. | Safer for shared devices and simpler UX; spec allows sign-out or access-denied. |

## Data Flow

```txt
/ ──→ PublicResourcesPage ──→ existing public hooks/repositories

/admin ──→ RequireAdmin ──→ AdminAuthProvider ──→ adminAuth.ts ──→ Supabase anon client
                    │                         ├─ auth.getSession/signIn/signOut
                    │                         └─ rpc("is_admin") or admin_users check
                    ├─ anonymous/error → /admin/login
                    ├─ non-admin → access denied + signOut
                    └─ admin → AdminShell
```

`/admin/login` redirects authorized admins to `/admin`; auth failures show generic non-sensitive copy.

## File Changes

| File | Action | Description |
|---|---|---|
| `package.json`, lockfile | Modify | Add `react-router-dom`. |
| `src/App.tsx` | Modify | Define route tree only. |
| `src/pages/PublicResourcesPage.tsx` | Create | Current public map/list/filter UI moved here unchanged. |
| `src/pages/AdminLoginPage.tsx` | Create | Email/password form, loading, errors, redirect on success. |
| `src/pages/AdminShell.tsx` | Create | Protected placeholder with logout; no CRUD. |
| `src/components/admin/RequireAdmin.tsx` | Create | Route guard for loading/anonymous/non-admin/admin states. |
| `src/context/AdminAuthContext.tsx` | Create | Minimal auth state provider/hook. |
| `src/lib/adminAuth.ts` | Create | Supabase Auth and admin authorization helpers. |
| `src/lib/supabaseClient.ts` | Modify | Keep anon-only client; no service-role support. |
| `README.md`, `.env.example` | Modify | Manual admin provisioning and frontend secret boundaries. |

## Interfaces / Contracts

```ts
type AdminAuthState =
  | { status: "loading"; session: null; isAdmin: false; error: null }
  | { status: "anonymous" | "denied" | "error"; session: null; isAdmin: false; error: string | null }
  | { status: "admin"; session: Session; isAdmin: true; error: null };
```

`checkIsAdmin(client)` SHOULD call `rpc("is_admin")`. If typing/mocking requires it, fall back to selecting `admin_users.user_id` for the current user; never expose admin creation.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | `adminAuth.ts` success/failure/session restore/logout/admin denied. | Vitest with mocked Supabase-like client. |
| Unit | route decision helpers / `RequireAdmin` return decisions. | Pure function or direct component-return tests, matching current no-Testing-Library pattern. |
| Integration | Public route extraction does not change public component composition. | Target small helpers/components; no build. |
| E2E | Not in Phase 4. | Avoid Playwright/Cypress unless later explicitly scoped. |

## Migration / Rollout

No database migration required: `admin_users` and `is_admin()` already exist. Roll out in slices: dependency/router shell, auth helpers tests, login/guard UI, docs. Keep each slice reviewable and defer CRUD/admin management.

## Open Questions

- None.
