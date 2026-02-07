# Row Level Security (RLS) Policies

This document describes the RLS policies implemented for the TechAssassin backend.

## Overview

Row Level Security (RLS) is enabled on all tables to provide database-level access control. This ensures data security even if application-level authorization fails.

## Policy Summary

### Profiles Table
- **Read**: Public (everyone can view profiles)
- **Update**: Own profile only (users can only update their own profile)
- **Insert/Delete**: Not allowed via RLS (handled by auth trigger)

### Events Table
- **Read**: Public (everyone can view events)
- **Write**: Admin only (only admins can create, update, or delete events)

### Registrations Table
- **Read**: Users see their own registrations, admins see all
- **Insert**: Users can create registrations for themselves
- **Update**: Admin only (admins can change registration status)
- **Delete**: Not explicitly allowed (handled by cascade on event deletion)

### Announcements Table
- **Read**: Authenticated users only
- **Insert**: Admin only
- **Update/Delete**: Author or admin only

### Resources Table
- **Read**: Authenticated users only
- **Write**: Admin only

### Sponsors Table
- **Read**: Public (everyone can view sponsors)
- **Write**: Admin only

### Leaderboard Table
- **Read**: Authenticated users only
- **Write**: Admin only

## Admin Check Pattern

Most policies use this pattern to check for admin privileges:

```sql
EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = auth.uid()
  AND profiles.is_admin = true
)
```

## Testing RLS Policies

To test RLS policies, you can use the Supabase SQL editor with different user contexts:

```sql
-- Test as unauthenticated user
SET request.jwt.claims TO '{}';

-- Test as regular user
SET request.jwt.claims TO '{"sub": "user-uuid-here"}';

-- Test as admin user (requires user to have is_admin = true)
SET request.jwt.claims TO '{"sub": "admin-uuid-here"}';
```

## Migration Files

- `20260207000009_create_rls_policies_profiles.sql` - Profiles table RLS
- `20260207000010_create_rls_policies_events.sql` - Events table RLS
- `20260207000011_create_rls_policies_registrations.sql` - Registrations table RLS
- `20260207000012_create_rls_policies_announcements.sql` - Announcements table RLS
- `20260207000013_create_rls_policies_resources.sql` - Resources table RLS
- `20260207000014_create_rls_policies_sponsors.sql` - Sponsors table RLS
- `20260207000015_create_rls_policies_leaderboard.sql` - Leaderboard table RLS

## Security Notes

1. RLS policies are enforced at the database level, providing defense in depth
2. The `auth.uid()` function returns the authenticated user's ID from the JWT token
3. Policies use `USING` clause for SELECT/UPDATE/DELETE and `WITH CHECK` for INSERT
4. The `FOR ALL` policy type applies to all operations (INSERT, SELECT, UPDATE, DELETE)
5. Multiple SELECT policies are combined with OR logic (user sees data if ANY policy allows it)
