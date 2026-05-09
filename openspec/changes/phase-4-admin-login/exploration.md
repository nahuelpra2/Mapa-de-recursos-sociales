## Exploration: phase-4-admin-login

### Current State
The app is a single React/Vite entry with no router: `src/main.tsx` dynamically imports `App`, and `src/App.tsx` renders the public resource map/list directly inside one `<main>`. There is no existing private layout, admin route, or route-level boundary.

Supabase is already integrated through `src/lib/supabaseClient.ts`, which creates a browser client only when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present. Missing env falls back to local public resources through `createSupabaseResourceRepository`, so Phase 4 should preserve public-app resilience.

Supabase Auth is enabled in `supabase/config.toml`, with global/email/SMS signup disabled (`enable_signup = false`) and anonymous sign-ins disabled. The existing migration already creates `public.admin_users`, `public.is_admin()`, and admin RLS policies for `public.resources`, so the login foundation can use that allow-list instead of inventing roles in frontend metadata.

### Affected Areas
- `src/main.tsx` — entry point currently mounts only `App`; routing can be introduced here or kept inside `App`.
- `src/App.tsx` — public page is monolithic; should be extracted or wrapped so `/admin/login` and `/admin` do not pollute public map state.
- `src/lib/supabaseClient.ts` — existing client can support `auth.signInWithPassword`, `auth.getSession`, `auth.onAuthStateChange`, and `auth.signOut`; may need typed auth helper wrappers for testability.
- `src/lib/supabaseClient.test.ts` — existing env/client tests should be extended without exposing secrets.
- `supabase/config.toml` — confirms signup is disabled; Phase 4 should not turn signup back on.
- `supabase/migrations/20260508120000_create_resources_schema.sql` — already has `admin_users` and `is_admin()`; Phase 4 may need a read/check path for the current user but should avoid CRUD schema changes unless unavoidable.
- `.env.example` / README — already document public Vite env and forbid service-role keys in client env; Phase 4 can add admin-creation instructions if needed.

### Approaches
1. **Minimal browser-path routing with auth helpers** — Add a tiny internal router based on `window.location.pathname`, split `PublicApp`, add `/admin/login` and `/admin` protected placeholder/shell, and keep dependencies unchanged.
   - Pros: Smallest slice, no new dependency, fits current no-router app, easy to test pure route/auth state helpers.
   - Cons: Manual routing gets brittle if admin grows beyond a few pages; links/navigation must be handled carefully.
   - Effort: Low

2. **Install React Router and define public/admin route tree** — Add `react-router-dom`, move public app to `/`, add admin login/protected layout under `/admin`.
   - Pros: Scales better for Phase 5 CRUD/admin subroutes; clearer private/public route boundaries.
   - Cons: Adds dependency and more changed lines; more review surface for a foundation-only phase.
   - Effort: Medium

3. **Auth-only service layer, no admin route yet** — Implement reusable auth/session functions and tests only; defer UI/routing to Phase 5.
   - Pros: Very small and low risk.
   - Cons: Does not prove the protected boundary or logout UX; weak foundation for admin work.
   - Effort: Low

### Recommendation
Use Approach 1 for Phase 4: a small manual route boundary plus auth helpers and a protected admin placeholder. This fits the current app shape, avoids adding routing dependency before it is necessary, and still establishes the important foundation: email/password login, persisted session hydration, logout, admin allow-list check, and a public/private boundary.

For admin creation, keep it outside the public app. With signup disabled, admins should be created through Supabase Dashboard/Auth Admin API/CLI or a local trusted script using `service_role`, then their `auth.users.id` must be inserted into `public.admin_users`. The browser app must only use the public anon key; no `service_role`, DB password, or admin creation endpoint belongs in Phase 4 frontend code.

### Risks
- Supabase sessions persist in browser storage by default; shared-device admins need explicit logout and conservative copy around session persistence.
- A valid Supabase session is not the same as admin authorization. The protected admin shell should verify `public.is_admin()`/`admin_users`, not merely check `session !== null`.
- Signup-disabled config prevents public registration, but any manually created non-admin Auth user could still sign in unless the app blocks non-allow-listed users after login.
- Do not expose admin creation in the browser; `service_role` and DB credentials must remain local/server-only.
- Current tests do not use Testing Library or E2E tooling, so Phase 4 UI tests should stay at pure helper/component-return level unless adding test dependencies is explicitly scoped.
- Phase 4 should not implement resource CRUD, delete flows, role management UI, password reset/invite email customization, MFA, or real data moderation.

### Ready for Proposal
Yes — propose Phase 4 as a safe authentication foundation: login route, session provider/helpers, admin allow-list check, protected admin placeholder/shell, logout, documentation for out-of-app admin provisioning, and Vitest coverage. Keep CRUD/admin resource management for Phase 5.
