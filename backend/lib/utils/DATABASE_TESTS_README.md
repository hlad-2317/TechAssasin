# Database Schema Tests

This directory contains comprehensive tests for the TechAssassin backend database schema.

## Test Files

### 1. `database-schema-validation.test.ts` ✅
**Status**: Ready to run (no database required)

This test suite validates the database migration files themselves by reading and parsing the SQL files. It verifies:

- ✅ All migration files exist
- ✅ Tables are created with correct columns
- ✅ Unique constraints are defined (profiles.username, registrations composite)
- ✅ Check constraints are defined (registration status, sponsor tier)
- ✅ Foreign key constraints with CASCADE DELETE are defined
- ✅ Indexes are created on appropriate columns
- ✅ Profile creation trigger is defined

**Run this test:**
```bash
npm test -- database-schema-validation.test.ts
```

**Coverage**: 34 tests covering all 8 migration files

### 2. `database-schema.test.ts` ⏸️
**Status**: Requires Supabase configuration

This test suite performs live database tests against a real Supabase instance. It verifies:

- Table existence and structure
- Unique constraint enforcement (actual database rejections)
- Check constraint enforcement (actual database rejections)
- Foreign key constraint enforcement
- Cascade deletion behavior
- Index effectiveness

**Setup required:**
1. Create a Supabase project (or use local Supabase)
2. Run all migrations in `backend/supabase/migrations/`
3. Configure environment variables in `backend/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

**Run this test:**
```bash
npm test -- database-schema.test.ts
```

**Note**: This test will skip gracefully if Supabase is not configured.

## Test Coverage Summary

### Requirements Validated

**Requirement 1.1** (Profiles table): ✅
- Migration file validation
- Column structure validation
- Unique constraint on username
- Index on username
- Foreign key to auth.users with CASCADE

**Requirement 1.2** (Events table): ✅
- Migration file validation
- Column structure validation
- Check constraint on max_participants
- Index on start_date

**Requirement 1.3** (Registrations table): ✅
- Migration file validation
- Column structure validation
- Unique constraint on (user_id, event_id)
- Check constraint on status
- Foreign keys with CASCADE DELETE
- Indexes on event_id and user_id

**Requirement 1.4** (Announcements table): ✅
- Migration file validation
- Column structure validation
- Foreign key with CASCADE DELETE
- Index on created_at DESC

**Requirement 1.5** (Resources table): ✅
- Migration file validation
- Column structure validation
- Index on category

**Requirement 1.6** (Sponsors table): ✅
- Migration file validation
- Column structure validation
- Check constraint on tier

**Requirement 1.7** (Leaderboard table): ✅
- Migration file validation
- Column structure validation
- Foreign keys with CASCADE DELETE
- Composite index on (event_id, rank)

**Requirement 1.8** (Unique constraints): ✅
- profiles.username unique constraint
- registrations(user_id, event_id) unique constraint

**Requirement 1.9** (Indexes): ✅
- events.start_date
- registrations.event_id
- registrations.user_id
- announcements.created_at
- resources.category
- leaderboard(event_id, rank)
- profiles.username

**Requirement 2.8** (Profile creation trigger): ✅
- handle_new_user() function
- on_auth_user_created trigger
- Default values (is_admin = false, skills = [])

## Running All Tests

To run all database tests:
```bash
npm test -- database-schema
```

This will run both test suites. The validation tests will always pass (if migration files are correct), and the live database tests will skip if Supabase is not configured.

## Test Strategy

The dual-test approach provides:

1. **Fast feedback**: Validation tests run instantly without database setup
2. **Comprehensive coverage**: Live tests verify actual database behavior
3. **CI/CD friendly**: Validation tests can run in any environment
4. **Development flexibility**: Live tests can be run when database is available

## Next Steps

After these schema tests pass, you can proceed to:
- Task 3: Set up Row Level Security policies
- Task 4: Set up Supabase Storage buckets
- Task 5: Create TypeScript types and interfaces
