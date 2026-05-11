# App Routing Specification

## Purpose

Define public/admin route boundaries for Phase 5 while preserving the current public resource experience.

## Requirements

### Requirement: Public Resource Route

The system MUST serve the existing public resource map, list, and filters at `/` without requiring authentication.

#### Scenario: Public visitor opens home

- GIVEN any visitor with no active session
- WHEN they navigate to `/`
- THEN the public resource map/list/filter experience is available
- AND no admin authentication check blocks the page

### Requirement: Admin Route Boundary

The system MUST expose `/admin/login` for admin sign-in, `/admin` as a protected admin route, and `/admin/resources` plus create/edit subroutes as protected admin resource routes. Admin routes SHOULD remain React Router-compatible for later admin subroutes.

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

#### Scenario: Admin opens resource route

- GIVEN an active session authorized as admin
- WHEN the user navigates to `/admin/resources`, `/admin/resources/new`, or `/admin/resources/:id/edit`
- THEN the matching protected resource management screen is shown

#### Scenario: Authenticated non-admin opens admin route

- GIVEN an active session that is not admin-authorized
- WHEN the user navigates to `/admin`
- THEN admin content MUST NOT be shown
- AND the user is redirected to login or shown an access-denied state

### Requirement: Routing Scope Limits

The system MUST allow Phase 5 admin resource list, create, and edit routes. The system MUST NOT add delete, soft-delete, archive, deactivate, bulk action, admin provisioning, invitation, role hierarchy, public UX redesign, E2E, or Testing Library setup in this phase.

#### Scenario: Out-of-scope admin URL is requested

- GIVEN a Phase 5 build
- WHEN a user expects CRUD, invitation, or role-management pages
- THEN those features are unavailable
