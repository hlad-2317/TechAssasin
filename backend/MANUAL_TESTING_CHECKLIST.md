# Manual Testing Checklist - TechAssassin Backend

This document provides a comprehensive manual testing checklist for validating all features of the TechAssassin backend API.

## Prerequisites

- Backend server running locally or deployed
- Supabase project configured with all migrations applied
- Resend API key configured
- Test user accounts created (regular user and admin user)
- API testing tool (Postman, Thunder Client, or curl)

## Test Environment Setup

### Create Test Users

1. **Regular User**
   - Email: `testuser@example.com`
   - Password: `TestPassword123!`
   - Username: `testuser`

2. **Admin User**
   - Email: `admin@example.com`
   - Password: `AdminPassword123!`
   - Username: `adminuser`
   - Set `is_admin = true` in profiles table

## 1. User Registration Flow

### 1.1 Sign Up
- [ ] **POST /api/auth/signup**
  - Request: `{ "email": "newuser@example.com", "password": "Password123!" }`
  - Expected: 200 status, user object with session token
  - Verify: Profile automatically created in database
  - Verify: Welcome email sent (check Resend dashboard)

- [ ] **Duplicate Email**
  - Request: Same email as above
  - Expected: 400 status with error message

- [ ] **Weak Password**
  - Request: `{ "email": "test@example.com", "password": "123" }`
  - Expected: 400 status with validation error

### 1.2 Sign In
- [ ] **POST /api/auth/signin**
  - Request: `{ "email": "testuser@example.com", "password": "TestPassword123!" }`
  - Expected: 200 status, user object with session token
  - Save token for subsequent requests

- [ ] **Invalid Credentials**
  - Request: `{ "email": "testuser@example.com", "password": "WrongPassword" }`
  - Expected: 401 status with error message

### 1.3 Password Reset
- [ ] **POST /api/auth/reset-password**
  - Request: `{ "email": "testuser@example.com" }`
  - Expected: 200 status
  - Verify: Reset email sent (check Resend dashboard)

- [ ] **Non-existent Email**
  - Request: `{ "email": "nonexistent@example.com" }`
  - Expected: 200 status (don't reveal if email exists)

### 1.4 Sign Out
- [ ] **POST /api/auth/signout**
  - Expected: 200 status
  - Verify: Session invalidated

## 2. Profile Management

### 2.1 Get Own Profile
- [ ] **GET /api/profile**
  - Headers: `Authorization: Bearer {token}`
  - Expected: 200 status, profile with all fields including `is_admin`

- [ ] **Unauthenticated**
  - No Authorization header
  - Expected: 401 status

### 2.2 Get Other User's Profile
- [ ] **GET /api/profile/{userId}**
  - Expected: 200 status, public profile fields only (no sensitive data)

- [ ] **Non-existent User**
  - Expected: 404 status

### 2.3 Update Profile
- [ ] **PATCH /api/profile**
  - Headers: `Authorization: Bearer {token}`
  - Request: `{ "username": "updateduser", "full_name": "Updated Name", "skills": ["JavaScript", "TypeScript"] }`
  - Expected: 200 status, updated profile
  - Verify: Changes persisted in database

- [ ] **Duplicate Username**
  - Request: Username that already exists
  - Expected: 409 status with error message

- [ ] **Invalid Username Format**
  - Request: `{ "username": "invalid user!" }`
  - Expected: 400 status with validation error

- [ ] **Attempt to Modify is_admin**
  - Request: `{ "is_admin": true }`
  - Expected: Field should be ignored or rejected

### 2.4 Upload Avatar
- [ ] **POST /api/profile/avatar**
  - Headers: `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`
  - Request: Valid image file (< 2MB, jpg/png/webp)
  - Expected: 200 status, profile with updated `avatar_url`
  - Verify: File stored in Supabase Storage `avatars/{userId}/` folder
  - Verify: URL is publicly accessible

- [ ] **Invalid File Type**
  - Request: PDF or text file
  - Expected: 400 status with validation error

- [ ] **Oversized File**
  - Request: Image > 2MB
  - Expected: 400 status with validation error

## 3. Event Creation and Registration Flow

### 3.1 Create Event (Admin Only)
- [ ] **POST /api/events**
  - Headers: `Authorization: Bearer {adminToken}`
  - Request:
    ```json
    {
      "title": "Test Hackathon 2026",
      "description": "A test hackathon event",
      "start_date": "2026-03-01T09:00:00Z",
      "end_date": "2026-03-02T18:00:00Z",
      "location": "Virtual",
      "max_participants": 50,
      "registration_open": true,
      "themes": ["AI", "Web3"],
      "prizes": { "first": "$1000", "second": "$500" }
    }
    ```
  - Expected: 201 status, created event object
  - Save `event_id` for subsequent tests

- [ ] **Non-Admin Attempt**
  - Headers: `Authorization: Bearer {regularUserToken}`
  - Expected: 403 status

- [ ] **Invalid Date Range**
  - Request: `end_date` before `start_date`
  - Expected: 400 status with validation error

### 3.2 List Events
- [ ] **GET /api/events**
  - Expected: 200 status, array of events with participant counts

- [ ] **Filter by Status**
  - GET /api/events?status=upcoming
  - Expected: Only upcoming events returned
  - Verify: Status calculated correctly based on dates

- [ ] **Pagination**
  - GET /api/events?page=1&limit=10
  - Expected: 200 status, pagination metadata included

### 3.3 Get Event Details
- [ ] **GET /api/events/{eventId}**
  - Expected: 200 status, event with participant count and status

- [ ] **Non-existent Event**
  - Expected: 404 status

### 3.4 Register for Event
- [ ] **POST /api/registrations**
  - Headers: `Authorization: Bearer {token}`
  - Request:
    ```json
    {
      "event_id": "{eventId}",
      "team_name": "Test Team",
      "project_idea": "Building an innovative solution for testing"
    }
    ```
  - Expected: 201 status, registration with status "confirmed"
  - Verify: Confirmation email sent (check Resend dashboard)
  - Verify: Participant count increased for event

- [ ] **Duplicate Registration**
  - Request: Same user, same event
  - Expected: 409 status with error message

- [ ] **Registration Closed**
  - Update event: `registration_open = false`
  - Attempt registration
  - Expected: 400 status with error message

- [ ] **Capacity Limit (Waitlist)**
  - Create event with `max_participants = 1`
  - Register first user (should be "confirmed")
  - Register second user (should be "waitlisted")
  - Verify: Second registration has status "waitlisted"

### 3.5 View Own Registrations
- [ ] **GET /api/registrations**
  - Headers: `Authorization: Bearer {token}`
  - Expected: 200 status, array of user's registrations with event details

### 3.6 View Event Registrations (Admin Only)
- [ ] **GET /api/registrations/event/{eventId}**
  - Headers: `Authorization: Bearer {adminToken}`
  - Expected: 200 status, all registrations for event with user profiles

- [ ] **Non-Admin Attempt**
  - Headers: `Authorization: Bearer {regularUserToken}`
  - Expected: 403 status

### 3.7 Update Registration Status (Admin Only)
- [ ] **PATCH /api/registrations/{registrationId}**
  - Headers: `Authorization: Bearer {adminToken}`
  - Request: `{ "status": "confirmed" }`
  - Expected: 200 status, updated registration

### 3.8 Update Event
- [ ] **PATCH /api/events/{eventId}**
  - Headers: `Authorization: Bearer {adminToken}`
  - Request: `{ "title": "Updated Hackathon Title" }`
  - Expected: 200 status, updated event

### 3.9 Delete Event
- [ ] **DELETE /api/events/{eventId}**
  - Headers: `Authorization: Bearer {adminToken}`
  - Expected: 204 status
  - Verify: Event deleted from database
  - Verify: Associated registrations cascade deleted

## 4. Admin Operations

### 4.1 Announcements
- [ ] **Create Announcement (Admin)**
  - POST /api/announcements
  - Headers: `Authorization: Bearer {adminToken}`
  - Request: `{ "content": "Important announcement for all users!" }`
  - Expected: 201 status

- [ ] **Non-Admin Attempt**
  - Expected: 403 status

- [ ] **List Announcements**
  - GET /api/announcements
  - Headers: `Authorization: Bearer {token}`
  - Expected: 200 status, announcements with author info, ordered by created_at DESC

- [ ] **Update Own Announcement**
  - PATCH /api/announcements/{id}
  - Headers: `Authorization: Bearer {adminToken}` (as author)
  - Request: `{ "content": "Updated announcement" }`
  - Expected: 200 status

- [ ] **Delete Announcement**
  - DELETE /api/announcements/{id}
  - Expected: 204 status

### 4.2 Resources
- [ ] **Create Resource (Admin)**
  - POST /api/resources
  - Headers: `Authorization: Bearer {adminToken}`
  - Request:
    ```json
    {
      "title": "Getting Started Guide",
      "description": "A comprehensive guide for beginners",
      "content_url": "https://example.com/guide",
      "category": "tutorial"
    }
    ```
  - Expected: 201 status

- [ ] **List Resources**
  - GET /api/resources
  - Expected: 200 status

- [ ] **Filter by Category**
  - GET /api/resources?category=tutorial
  - Expected: Only resources in "tutorial" category

- [ ] **Update Resource (Admin)**
  - PATCH /api/resources/{id}
  - Expected: 200 status

- [ ] **Delete Resource (Admin)**
  - DELETE /api/resources/{id}
  - Expected: 204 status

### 4.3 Sponsors
- [ ] **Create Sponsor (Admin)**
  - POST /api/sponsors
  - Headers: `Authorization: Bearer {adminToken}`
  - Request:
    ```json
    {
      "name": "Tech Corp",
      "logo_url": "https://example.com/logo.png",
      "website_url": "https://techcorp.com",
      "tier": "gold",
      "description": "Leading tech company"
    }
    ```
  - Expected: 201 status

- [ ] **List Sponsors (Public)**
  - GET /api/sponsors
  - No authentication required
  - Expected: 200 status, sponsors ordered by tier

- [ ] **Upload Sponsor Logo (Admin)**
  - POST /api/sponsors/{id}/logo
  - Headers: `Authorization: Bearer {adminToken}`, `Content-Type: multipart/form-data`
  - Request: Valid image file
  - Expected: 200 status, sponsor with updated logo_url

- [ ] **Update Sponsor (Admin)**
  - PATCH /api/sponsors/{id}
  - Expected: 200 status

- [ ] **Delete Sponsor (Admin)**
  - DELETE /api/sponsors/{id}
  - Expected: 204 status

### 4.4 Leaderboard
- [ ] **Update Leaderboard Entry (Admin)**
  - POST /api/leaderboard
  - Headers: `Authorization: Bearer {adminToken}`
  - Request:
    ```json
    {
      "event_id": "{eventId}",
      "user_id": "{userId}",
      "score": 100
    }
    ```
  - Expected: 200 status
  - Verify: Ranks recalculated for all entries in event

- [ ] **Get Leaderboard**
  - GET /api/leaderboard/{eventId}
  - Headers: `Authorization: Bearer {token}`
  - Expected: 200 status, entries ordered by rank with participant info

## 5. File Uploads

### 5.1 Avatar Upload
- [ ] **Valid Image**
  - POST /api/profile/avatar
  - File: JPG, PNG, or WebP < 2MB
  - Expected: 200 status, URL in response
  - Verify: File accessible at URL

- [ ] **Invalid Type**
  - File: PDF or other non-image
  - Expected: 400 status

- [ ] **Oversized**
  - File: > 2MB
  - Expected: 400 status

### 5.2 Event Images
- [ ] **Upload Event Images (Admin)**
  - POST /api/events/{eventId}/images
  - Headers: `Authorization: Bearer {adminToken}`
  - Files: Multiple valid images
  - Expected: 200 status, event with updated image_urls array

### 5.3 Sponsor Logo
- [ ] **Upload Sponsor Logo (Admin)**
  - POST /api/sponsors/{sponsorId}/logo
  - Expected: 200 status, sponsor with updated logo_url

### 5.4 Storage Cleanup
- [ ] **Delete Profile with Avatar**
  - Create profile with avatar
  - Delete profile
  - Verify: Avatar file removed from storage

- [ ] **Delete Event with Images**
  - Create event with images
  - Delete event
  - Verify: Image files removed from storage

## 6. Real-time Updates

### 6.1 Registration Updates
- [ ] **Setup**
  - Open two browser tabs/clients
  - Subscribe to event registrations in Tab 1
  - Create registration in Tab 2
  - Expected: Tab 1 receives real-time update with new participant count

### 6.2 Announcement Updates
- [ ] **Setup**
  - Subscribe to announcements in Tab 1
  - Create announcement in Tab 2 (as admin)
  - Expected: Tab 1 receives real-time update with new announcement

### 6.3 Leaderboard Updates
- [ ] **Setup**
  - Subscribe to leaderboard for event in Tab 1
  - Update score in Tab 2 (as admin)
  - Expected: Tab 1 receives real-time update with new scores/ranks

## 7. Error Scenarios

### 7.1 Authentication Errors
- [ ] **Missing Token**
  - Request to protected endpoint without Authorization header
  - Expected: 401 status

- [ ] **Invalid Token**
  - Request with malformed or expired token
  - Expected: 401 status

### 7.2 Authorization Errors
- [ ] **Non-Admin Access**
  - Regular user attempts admin-only operation
  - Expected: 403 status

### 7.3 Validation Errors
- [ ] **Missing Required Fields**
  - POST request with missing required fields
  - Expected: 400 status with descriptive error

- [ ] **Invalid Data Types**
  - POST request with wrong data types
  - Expected: 400 status with validation error

- [ ] **Invalid Format**
  - Email without @ symbol, URL without protocol, etc.
  - Expected: 400 status with validation error

### 7.4 Not Found Errors
- [ ] **Non-existent Resource**
  - GET /api/events/{invalidId}
  - Expected: 404 status

### 7.5 Conflict Errors
- [ ] **Duplicate Username**
  - Update profile with existing username
  - Expected: 409 status

- [ ] **Duplicate Registration**
  - Register for same event twice
  - Expected: 409 status

### 7.6 Rate Limiting
- [ ] **Registration Rate Limit**
  - Attempt 6+ registrations within 1 hour
  - Expected: 429 status after 5th registration

### 7.7 Server Errors
- [ ] **Database Connection Error**
  - Simulate database unavailability
  - Expected: 500 status with generic error message (no sensitive details)

### 7.8 Email Failures
- [ ] **Email Service Down**
  - Simulate Resend API failure
  - Expected: Primary operation (registration) succeeds, error logged
  - Verify: Registration created despite email failure

## 8. Health Check
- [ ] **GET /api/health**
  - Expected: 200 status with system status

## Test Results Summary

| Category | Tests Passed | Tests Failed | Notes |
|----------|--------------|--------------|-------|
| User Registration | | | |
| Profile Management | | | |
| Event Management | | | |
| Admin Operations | | | |
| File Uploads | | | |
| Real-time Updates | | | |
| Error Scenarios | | | |
| **Total** | | | |

## Issues Found

Document any issues discovered during testing:

1. **Issue**: 
   - **Severity**: Critical / High / Medium / Low
   - **Steps to Reproduce**: 
   - **Expected Behavior**: 
   - **Actual Behavior**: 
   - **Status**: Open / Fixed

## Sign-off

- [ ] All critical tests passed
- [ ] All high-priority tests passed
- [ ] Known issues documented
- [ ] Ready for deployment

**Tested by**: _______________  
**Date**: _______________  
**Environment**: _______________
