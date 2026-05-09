# Tasks: Phase 4 Admin Login

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 330-430 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR; if it grows, split router/auth helpers -> UI/docs |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Router + public route preservation | PR 1 | Includes dependency and route tests |
| 2 | Admin auth boundary | PR 1 | Includes helper/provider tests |
| 3 | Login, protected shell, docs | PR 1 | Includes logout and docs |

## Phase 1: Routing Foundation

- [x] 1.1 Install `react-router-dom` and update `package.json`/lockfile; do not add React Router alternatives.
- [x] 1.2 Move current `src/App.tsx` public UI unchanged into `src/pages/PublicResourcesPage.tsx`.
- [x] 1.3 Rewrite `src/App.tsx` as route composition: `/` -> `PublicResourcesPage`, `/admin/login`, protected `/admin`.
- [x] 1.4 Keep `src/main.tsx` mounting behavior compatible with Vite/React 18.
- [x] 1.5 Test public route preservation and admin redirect decisions without adding E2E/Testing Library.

## Phase 2: Admin Auth Foundation

- [x] 2.1 Create `src/lib/adminAuth.ts` with `signInAdmin`, `restoreAdminSession`, `checkIsAdmin`, `signOutAdmin` around the anon Supabase client.
- [x] 2.2 Ensure `checkIsAdmin` separates session auth from admin authorization via `rpc("is_admin")` or existing `admin_users` boundary.
- [x] 2.3 Keep `src/lib/supabaseClient.ts` anon-only; do not add `service_role`, DB password, or admin provisioning helpers.
- [x] 2.4 Add `src/lib/adminAuth.test.ts` for valid admin, invalid credentials, non-admin denial, restore failure, and logout.

## Phase 3: Admin State and Guards

- [x] 3.1 Create `src/context/AdminAuthContext.tsx` with loading/anonymous/admin/denied/error states and a hook.
- [x] 3.2 Create `src/components/admin/RequireAdmin.tsx` to hide protected content while loading, redirect anonymous users, and deny non-admins.
- [x] 3.3 Add focused tests for auth state transitions and guard decisions matching spec scenarios.

## Phase 4: Login, Shell, Logout

- [x] 4.1 Create `src/pages/AdminLoginPage.tsx` with email/password form, generic invalid-credentials copy, loading state, and admin redirect.
- [x] 4.2 Create `src/pages/AdminShell.tsx` placeholder with no CRUD routes and a logout action returning to login/public flow.
- [x] 4.3 Verify `/admin/login` redirects authorized admins and `/admin` never shows content to anonymous or non-admin users.

## Phase 5: Documentation and Verification

- [x] 5.1 Update `README.md` with manual external admin provisioning and signup-disabled expectations.
- [x] 5.2 Update `.env.example` with safe browser env guidance; explicitly forbid `service_role`, DB passwords, and `.env.local` commits.
- [x] 5.3 Run allowed checks only: targeted Vitest files, `npm test`, and `npm run lint`; explicitly do not run build.
