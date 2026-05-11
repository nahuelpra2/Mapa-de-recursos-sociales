# App Routing Specification

## Purpose

Define public/admin route boundaries for Phase 4 while preserving the current public resource experience.

## Requirements

### Requirement: Public Resource Route

The system MUST serve the existing public resource map, list, and filters at `/` without requiring authentication.

#### Scenario: Public visitor opens home

- GIVEN any visitor with no active session
- WHEN they navigate to `/`
- THEN the public resource map/list/filter experience is available
- AND no admin authentication check blocks the page

### Requirement: Admin Route Boundary

The system MUST expose `/admin/login` for admin sign-in and `/admin` as a protected admin route. Admin routes SHOULD be structured with React Router-compatible route boundaries for later admin subroutes.

#### Scenario: Unauthenticated visitor opens admin

- GIVEN no active session exists
- WHEN the visitor navigates to `/admin`
- THEN they are redirected or sent to `/admin/login`

#### Scenario: Admin opens admin route

- GIVEN an active session authorized as admin
- WHEN the user navigates to `/admin`
- THEN the protected admin shell is shown

#### Scenario: Admin opens login route

- GIVEN an active session authorized as admin
- WHEN the user navigates to `/admin/login`
- THEN they SHOULD be redirected away from login to `/admin`

#### Scenario: Authenticated non-admin opens admin route

- GIVEN an active session that is not admin-authorized
- WHEN the user navigates to `/admin`
- THEN admin content MUST NOT be shown
- AND the user is redirected to login or shown an access-denied state

### Requirement: Routing Scope Limits

The system MUST NOT add resource CRUD routes, frontend admin creation/invitation routes, or role hierarchy screens in Phase 4. The system SHOULD NOT add E2E or Testing Library setup unless design later proves it necessary.

#### Scenario: Out-of-scope admin URL is requested

- GIVEN a Phase 4 build
- WHEN a user expects CRUD, invitation, or role-management pages
- THEN those features are unavailable
