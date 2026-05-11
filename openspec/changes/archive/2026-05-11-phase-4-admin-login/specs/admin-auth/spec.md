# Admin Auth Specification

## Purpose

Define Supabase email/password admin login, session restore, allow-list authorization, logout, and safe error/security behavior.

## Requirements

### Requirement: Email Password Login

The system MUST authenticate admins with Supabase Auth email/password. The frontend MUST NOT expose public signup or registration.

#### Scenario: Valid admin credentials

- GIVEN an admin exists in Supabase Auth and is allow-listed
- WHEN they submit valid email/password credentials
- THEN a session is established
- AND admin access is granted

#### Scenario: Invalid credentials

- GIVEN credentials are invalid
- WHEN the user submits the login form
- THEN no admin access is granted
- AND a non-sensitive invalid-credentials error is shown

### Requirement: Admin Authorization

The system MUST treat authentication and admin authorization as separate checks. Admin access MUST require an allow-list boundary such as `admin_users`/`is_admin()` or an equivalent existing database boundary.

#### Scenario: Authenticated non-admin login

- GIVEN a valid Supabase Auth session for a non-allow-listed user
- WHEN admin authorization is checked
- THEN admin access MUST be denied
- AND the session MAY be signed out or kept with an access-denied message

### Requirement: Session Persistence and Restore

The system MUST restore existing Supabase sessions on app load and re-check admin authorization before showing protected admin content.

#### Scenario: Existing admin session restores

- GIVEN a persisted session for an allow-listed admin
- WHEN the app loads an admin route
- THEN the session is restored
- AND admin content is shown after authorization succeeds

#### Scenario: Session check fails

- GIVEN session restoration or authorization fails unexpectedly
- WHEN the app evaluates admin access
- THEN protected content MUST remain hidden
- AND a recoverable auth/session error state is shown

### Requirement: Logout and Secret Boundaries

The system MUST provide logout that ends admin access and returns the user to login or public flow. Frontend code MUST use only public client configuration and MUST NOT include `service_role`, database passwords, or credential secrets.

#### Scenario: Admin logs out

- GIVEN an authorized admin session
- WHEN the user logs out
- THEN the session is cleared
- AND `/admin` no longer shows protected content

#### Scenario: Secret is considered for frontend config

- GIVEN a privileged key or password is available outside the browser
- WHEN frontend configuration is prepared
- THEN that secret MUST NOT be embedded or documented as client-safe
