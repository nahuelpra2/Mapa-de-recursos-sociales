# Admin Resource CRUD Specification

## Purpose

Define admin-only resource listing, creation, and editing without changing public resource UX or adding delete behavior.

## Requirements

### Requirement: Protected Admin Resource Access

The system MUST expose admin resource management only inside the existing admin boundary. It MUST rely on existing admin authorization and database policies as the security boundary.

#### Scenario: Authorized admin opens resources

- GIVEN an active session authorized as admin
- WHEN the user opens `/admin/resources`
- THEN the admin resource list is available

#### Scenario: Unauthorized user opens resources

- GIVEN no admin authorization exists
- WHEN the user opens any admin resource route
- THEN resource management content MUST NOT be shown

### Requirement: Resource List States

The system MUST show testable loading, error, empty, and success states for the admin resource list.

#### Scenario: Resources load successfully

- GIVEN the admin repository returns resources
- WHEN the list finishes loading
- THEN each resource is shown with enough data to choose edit

#### Scenario: List cannot load

- GIVEN the admin repository returns an error
- WHEN the list finishes loading
- THEN a recoverable non-sensitive error state is shown

#### Scenario: No resources exist

- GIVEN the admin repository returns no resources
- WHEN the list finishes loading
- THEN an empty state is shown with a create action

### Requirement: Create Resource

The system MUST let authorized admins create resources through an admin Supabase repository. Writes MUST NOT use local fallback data.

#### Scenario: Valid resource is created

- GIVEN valid resource input
- WHEN the admin submits create
- THEN the resource is persisted
- AND the admin receives success feedback or navigation

#### Scenario: Invalid create input

- GIVEN invalid or incomplete resource input
- WHEN the admin submits create
- THEN persistence MUST NOT be attempted
- AND field-safe validation feedback is shown

### Requirement: Edit Resource

The system MUST let authorized admins load and update an existing resource through the admin Supabase repository. Writes MUST NOT use local fallback data.

#### Scenario: Existing resource is updated

- GIVEN an existing resource and valid edits
- WHEN the admin submits edit
- THEN the persisted resource is updated
- AND the admin receives success feedback or navigation

#### Scenario: Edit target cannot load

- GIVEN the requested resource cannot be loaded
- WHEN the edit route resolves
- THEN a non-sensitive not-found or error state is shown

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

### Requirement: Safe Persistence and Scope Limits

The system MUST surface Supabase/RLS failures safely and MUST NOT expose secrets. This phase MUST provide only single-resource archive and hard-delete lifecycle behavior; it MUST NOT provide bulk action, restore/unarchive, audit log, geocoding, upload, or user-management behavior.

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
