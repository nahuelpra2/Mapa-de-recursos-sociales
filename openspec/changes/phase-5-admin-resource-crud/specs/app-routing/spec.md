# Delta for App Routing

## MODIFIED Requirements

### Requirement: Admin Route Boundary

The system MUST expose `/admin/login` for admin sign-in, `/admin` as a protected admin route, and `/admin/resources` plus create/edit subroutes as protected admin resource routes. Admin routes SHOULD remain React Router-compatible for later admin subroutes.
(Previously: only `/admin/login` and `/admin` were exposed, with subroutes reserved for later phases.)

#### Scenario: Unauthenticated visitor opens admin

- GIVEN no active session exists
- WHEN the visitor navigates to `/admin`
- THEN they are redirected or sent to `/admin/login`

#### Scenario: Admin opens admin route

- GIVEN an active session authorized as admin
- WHEN the user navigates to `/admin`
- THEN the protected admin shell is shown

#### Scenario: Admin opens resource route

- GIVEN an active session authorized as admin
- WHEN the user navigates to `/admin/resources`, `/admin/resources/new`, or `/admin/resources/:id/edit`
- THEN the matching protected resource management screen is shown

#### Scenario: Admin opens login route

- GIVEN an active session authorized as admin
- WHEN the user navigates to `/admin/login`
- THEN they SHOULD be redirected away from login to `/admin`

#### Scenario: Authenticated non-admin opens admin route

- GIVEN an active session that is not admin-authorized
- WHEN the user navigates to `/admin` or `/admin/resources`
- THEN admin content MUST NOT be shown
- AND the user is redirected to login or shown access denied

### Requirement: Routing Scope Limits

The system MUST allow Phase 5 admin resource list, create, and edit routes. The system MUST NOT add delete, soft-delete, archive, deactivate, bulk action, admin provisioning, invitation, role hierarchy, public UX redesign, E2E, or Testing Library setup in this phase.
(Previously: Phase 4 prohibited all resource CRUD routes.)

#### Scenario: In-scope admin resource URL is requested

- GIVEN a Phase 5 implementation
- WHEN an authorized admin opens list, create, or edit resource URLs
- THEN those routes are available under the admin boundary

#### Scenario: Out-of-scope admin URL is requested

- GIVEN a Phase 5 implementation
- WHEN a user expects delete, bulk, invitation, or role-management pages
- THEN those features are unavailable
