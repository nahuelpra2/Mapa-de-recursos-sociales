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

### Requirement: Safe Persistence and Scope Limits

The system MUST surface Supabase/RLS failures safely and MUST NOT expose secrets. This phase MUST NOT provide delete, soft-delete, archive, deactivate, bulk action, geocoding, upload, or user-management behavior.

#### Scenario: Supabase write is rejected

- GIVEN Supabase rejects create or edit
- WHEN the operation returns
- THEN the UI shows a recoverable non-sensitive error
- AND no local fallback pretends the write succeeded

#### Scenario: Delete action is expected

- GIVEN an admin views resource management
- WHEN they look for delete, archive, deactivate, or bulk actions
- THEN those actions are unavailable
