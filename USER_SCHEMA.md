# MBO User Table Schema (Recreated)

The `mbo_users` table was dropped and recreated to align with application needs in `lib/database/mbo-data-access.ts`.

## Columns
- id (UNIQUEIDENTIFIER, PK, default NEWID())
- employeeId (NVARCHAR(50), optional) - External/company employee identifier.
- email (NVARCHAR(255), unique, required) - Login identifier.
- firstName (NVARCHAR(100), optional)
- lastName (NVARCHAR(100), optional)
- name (computed, persisted) - Concatenation of first + last.
- role (NVARCHAR(30), required, default 'EMPLOYEE') - ENUM: EMPLOYEE | MANAGER | HR | SENIOR_MANAGEMENT.
- title (NVARCHAR(150), optional)
- phone (NVARCHAR(40), optional)
- hireDate (DATE, optional)
- salary (DECIMAL(18,2), optional)
- status (NVARCHAR(30), required, default 'ACTIVE') - Employment status.
- departmentId (UNIQUEIDENTIFIER, FK -> mbo_departments.id)
- teamId (UNIQUEIDENTIFIER, FK -> mbo_teams.id)
- managerId (UNIQUEIDENTIFIER, self FK -> mbo_users.id)
- createdAt (DATETIME2, default GETDATE())
- updatedAt (DATETIME2, default GETDATE())

## Triggers
- trg_mbo_users_updatedAt: Updates `updatedAt` on any row update.

## Rationale
Previous table lacked critical columns (role, title, relationships) causing seeding and auth failures. Recreating ensured a clean, explicit schema rather than iterative ALTER attempts failing silently.

## Seeder Alignment
`scripts/complete-test.js` dynamically inspects columns and inserts seed users with extended fields (firstName, lastName, employeeId, status, etc.).

## Next Steps
- Extend objective seeding once auth confirmed.
- Add indices (email, role, departmentId, teamId) if performance requires.
- Consider adding soft delete (deletedAt) later.
