# Proposal: Phase 4 Admin Login

## Intent

Establish a safe admin authentication foundation before CRUD. The app needs a clear public/admin boundary, Supabase email/password login, admin allow-list authorization, and documentation that keeps privileged credentials out of the browser.

## Scope

### In Scope
- Add React Router as the route foundation.
- Preserve current public map/resources behavior at `/`.
- Add `/admin/login` for Supabase Auth email/password sign-in.
- Add protected `/admin` shell placeholder with explicit admin check against `admin_users`/`is_admin()` or equivalent DB boundary.
- Add logout from the admin shell.
- Add Vitest coverage for pure auth, routing, and session logic that fits the current setup.
- Document manual admin provisioning and safe env usage.

### Out of Scope
- CRUD resource management.
- Creating admins from the frontend.
- `service_role`, DB password, or secrets in frontend env.
- Role hierarchy/permissions beyond the admin allow-list.
- E2E or Testing Library setup unless later design proves unavoidable.

## Capabilities

### New Capabilities
- `admin-auth`: Supabase-backed admin login, session hydration, allow-list authorization, protected admin shell, and logout.
- `app-routing`: Public `/` route and admin route boundary using React Router.

### Modified Capabilities
- None — no existing OpenSpec specs were found.

## Approach

Install `react-router-dom` and define a small route tree: public page at `/`, login at `/admin/login`, protected placeholder at `/admin`. Extract testable auth/session helpers around the existing Supabase browser client. Treat authenticated and authorized as separate states: a session alone is not admin access. React Router increases slice size, but avoids manual routing debt and creates a scalable public/admin boundary for later admin CRUD.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | Modified | Add React Router dependency. |
| `src/main.tsx`, `src/App.tsx` | Modified | Introduce router and preserve public behavior. |
| `src/lib/` | New/Modified | Auth/session/admin-check helpers. |
| `src/**/*.test.ts` | New/Modified | Pure logic tests. |
| `README.md`, `.env.example` | Modified | Admin provisioning and env safety docs. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Non-admin Auth user signs in | Med | Block `/admin` via `admin_users`/`is_admin()` check. |
| Router change regresses public UI | Med | Keep `/` behavior equivalent and cover route decisions. |
| Secrets leak into frontend | Low | Document anon-only env and forbid service-role usage. |
| Slice grows too large | Med | Keep admin shell placeholder; defer CRUD and E2E. |

## Rollback Plan

Remove React Router/auth files, restore the single public `App` mount, and revert docs/dependency changes. Supabase schema remains compatible because Phase 4 adds no required DB migration.

## Dependencies

- Existing Supabase Auth config with signup disabled.
- Existing `admin_users` and `is_admin()` boundary.
- `react-router-dom`.

## Success Criteria

- [ ] `/` keeps current public map/resources behavior.
- [ ] `/admin/login` signs in with email/password and rejects failed auth.
- [ ] `/admin` requires both session and admin allow-list authorization.
- [ ] Admin logout clears access and returns to login/public flow.
- [ ] Tests cover pure auth/routing/session decisions.
- [ ] Docs explain manual provisioning and safe env usage.
