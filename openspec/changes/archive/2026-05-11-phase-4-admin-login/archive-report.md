# Archive Report: phase-4-admin-login

**Project**: mapa-recursos-sociales  
**Artifact store mode**: hybrid (OpenSpec + Engram)  
**Archive date**: 2026-05-11  
**Status**: archived  

## Summary

Phase 4 admin login was archived after verification reported **PASS WITH WARNINGS** and no CRITICAL findings. The change establishes the public/admin route boundary, Supabase email/password admin login, allow-list authorization through the existing admin boundary, session restore, logout, and docs for safe external admin provisioning.

Operational validation was completed before archive: a real Supabase Auth admin was provisioned externally, its Auth UID was inserted into `public.admin_users`, `/admin/login` reached the protected `/admin` shell, logout returned to `/admin/login`, and direct logged-out `/admin` access redirected to `/admin/login`.

## Verification Gate

- Verdict: PASS WITH WARNINGS
- Critical issues: 0
- Warnings acknowledged:
  - Build/type-check verification was skipped because project standards prohibit `npm run build`.
  - Coverage was skipped because no Vitest coverage provider is installed.
- Allowed checks previously passed:
  - Targeted Phase 4 suite: 16/16 tests passed.
  - Full test suite: 94/94 tests passed.
  - Lint: passed.

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| `admin-auth` | Created main spec | Copied delta spec to `openspec/specs/admin-auth/spec.md` because no prior main spec existed. |
| `app-routing` | Created main spec | Copied delta spec to `openspec/specs/app-routing/spec.md` because no prior main spec existed. |

## Archive Destination

`openspec/changes/archive/2026-05-11-phase-4-admin-login/`

## Expected Archive Contents

- `exploration.md`
- `proposal.md`
- `specs/admin-auth/spec.md`
- `specs/app-routing/spec.md`
- `design.md`
- `tasks.md`
- `apply-progress.md`
- `verify-report.md`
- `archive-report.md`

## Engram Traceability

| Artifact | Topic key | Observation ID |
|----------|-----------|----------------|
| Exploration | `sdd/phase-4-admin-login/explore` | `#262` |
| Proposal | `sdd/phase-4-admin-login/proposal` | `#266` |
| Spec | `sdd/phase-4-admin-login/spec` | `#268` |
| Design | `sdd/phase-4-admin-login/design` | `#275` |
| Tasks | `sdd/phase-4-admin-login/tasks` | `#278` |
| Apply progress | `sdd/phase-4-admin-login/apply-progress` | `#284` |
| Verify report | `sdd/phase-4-admin-login/verify-report` | `#289` |

## Source of Truth Updated

- `openspec/specs/admin-auth/spec.md`
- `openspec/specs/app-routing/spec.md`

## Notes

- `openspec/config.yaml` was not present, so no project-specific archive rules were applied beyond the global OpenSpec convention.
- No build was run during archive.
- No commit or push was performed.

## SDD Cycle Complete

The change has been planned, implemented, verified, synced into main specs, and archived.
