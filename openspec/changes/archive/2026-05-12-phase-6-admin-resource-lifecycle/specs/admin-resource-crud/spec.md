# Delta for Admin Resource CRUD

## ADDED Requirements

### Requirement: Admin Archive Resource

The system MUST let authorized admins archive an existing resource from admin resource management. Archived resources MUST be inactive for public reads and MUST remain recoverable by database-level update or backup operations outside this UI.

#### Scenario: Admin archives a resource

- GIVEN an active admin session and an existing active resource
- WHEN the admin confirms archive
- THEN the resource is persisted as inactive
- AND public resource reads MUST NOT show it

#### Scenario: Archive is rejected

- GIVEN the archive operation is rejected by Supabase or RLS
- WHEN the operation returns
- THEN the UI shows a recoverable non-sensitive error
- AND no local fallback pretends the archive succeeded

### Requirement: Admin Hard Delete Resource

The system MUST let authorized admins hard delete an existing resource only after explicit irreversible confirmation. Hard delete MUST physically remove the row through admin-only persistence protected by RLS.

#### Scenario: Admin hard deletes with confirmation

- GIVEN an active admin session and an existing resource
- WHEN the admin confirms irreversible delete
- THEN the resource row is physically deleted
- AND it no longer appears in admin or public resource reads

#### Scenario: Delete without confirmation

- GIVEN an admin has not completed the required confirmation
- WHEN delete is requested
- THEN persistence MUST NOT be attempted
- AND irreversible-delete copy remains visible

#### Scenario: Non-admin delete attempt fails

- GIVEN a session without admin authorization
- WHEN hard delete is attempted against persistence
- THEN RLS MUST reject the delete
- AND the UI or caller receives a non-sensitive failure

## MODIFIED Requirements

### Requirement: Safe Persistence and Scope Limits

The system MUST surface Supabase/RLS failures safely and MUST NOT expose secrets. This phase MUST provide only single-resource archive and hard-delete lifecycle behavior; it MUST NOT provide bulk action, restore/unarchive, audit log, geocoding, upload, or user-management behavior.
(Previously: this requirement prohibited delete, soft-delete, archive, and deactivate behavior entirely.)

#### Scenario: Supabase write is rejected

- GIVEN Supabase rejects create, edit, archive, or delete
- WHEN the operation returns
- THEN the UI shows a recoverable non-sensitive error
- AND no local fallback pretends the write succeeded

#### Scenario: Delete action is expected

- GIVEN an admin views resource management
- WHEN they look for archive or hard-delete actions
- THEN those single-resource lifecycle actions are available only inside the admin boundary
- AND bulk, restore, geocoding, upload, and user-management actions are unavailable
