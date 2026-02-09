# Authentication Guide - TechAssassin

## ✅ What's Been Created

### Pages
1. **Sign Up Page** (`/signup`) - User registration
2. **Sign In Page** (`/signin`) - User login
3. **Dashboard Page** (`/dashboard`) - Protected user dashboard

### Features
- ✅ Email/password authentication
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling with toast notifications
- ✅ Automatic token management
- ✅ Protected routes
- ✅ Responsive design
- ✅ Navigation integration

---

## 🌐 Access the Pages

### Frontend URLs
- **Home:** http://localhost:8080
- **Sign Up:** http://localhost:8080/signup
- **Sign In:** http://localhost:8080/signin
- **Dashboard:** http://localhost:8080/dashboard (requires authentication)

### Backend API Endpoints
- **Sign Up:** POST http://localhost:3000/api/auth/signup
- **Sign In:** POST http://localhost:3000/api/auth/signin
- **Sign Out:** POST http://localhost:3000/api/auth/signout
- **Get Profile:** GET http://localhost:3000/api/profile

---

## 🎯 How to Test

### 1. Sign Up Flow

1. **Navigate to Sign Up:**
   - Open http://localhost:8080
   - Click "Sign Up" in the navbar
   - Or go directly to http://localhost:8080/signup

2. **Fill the Form:**
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`

3. **Submit:**
   - Click "Sign Up" button
   - You'll see a success message
   - Automatically redirected to sign in page

4. **Check Email:**
   - Supabase will send a verification email
   - Check your email inbox
   - Click the verification link

### 2. Sign In Flow

1. **Navigate to Sign In:**
   - Click "Sign In" in the navbar
   - Or go to http://localhost:8080/signin

2. **Enter Credentials:**
   - Email: `test@example.com`
   - Password: `password123`

3. **Submit:**
   - Click "Sign In" button
   - You'll see a welcome message
   - Automatically redirected to dashboard

### 3. Dashboard

1. **After Sign In:**
   - You'll be on the dashboard at `/dashboard`
   - See your profile information
   - Access to events and registrations

2. **Features:**
   - View profile details
   - Edit profile (button ready)
   - View events (button ready)
   - View registrations (button ready)
   - Sign out

3. **Sign Out:**
   - Click "Sign Out" button in top right
   - You'll be signed out
   - Redirected to sign in page

---

## 🔒 Security Features

### Authentication
- ✅ Passwords hashed by Supabase
- ✅ JWT tokens for session management
- ✅ Tokens stored in localStorage
- ✅ Automatic token inclusion in API requests

### Validation
- ✅ Email format validation
- ✅ Password minimum length (6 characters)
- ✅ Password confirmation matching
- ✅ Required field validation

### Protected Routes
- ✅ Dashboard requires authentication
- ✅ Automatic redirect to sign in if not authenticated
- ✅ Token expiration handling

---

## 🎨 UI Components Used

### shadcn/ui Components
- `Card` - Container for forms
- `Input` - Text and password inputs
- `Label` - Form labels
- `Button` - Action buttons
- `Toast` - Notifications

### Icons (lucide-react)
- `Loader2` - Loading spinner
- `LogOut` - Sign out icon
- `User` - Profile icon

---

## 📱 Responsive Design

### Desktop
- Centered form cards
- Full navigation bar
- Side-by-side layout for dashboard cards

### Mobile
- Stacked layout
- Mobile-friendly navigation
- Touch-optimized buttons
- Full-width forms

---

## 🔧 How It Works

### Sign Up Process

```typescript
// 1. User fills form
const formData = {
  email: 'user@example.com',
  password: 'password123'
};

// 2. Frontend calls auth service
await authService.signUp(formData);

// 3. Auth service calls API
api.post('/auth/signup', formData);

// 4. Backend creates user in Supabase
// 5. Supabase sends verification email
// 6. User redirected to sign in
```

### Sign In Process

```typescript
// 1. User enters credentials
const credentials = {
  email: 'user@example.com',
  password: 'password123'
};

// 2. Frontend calls auth service
const response = await authService.signIn(credentials);

// 3. Auth service stores token
setAuthToken(response.session.access_token);

// 4. User redirected to dashboard
navigate('/dashboard');
```

### Protected Route

```typescript
// Dashboard checks authentication
useEffect(() => {
  if (!authService.isAuthenticated()) {
    navigate('/signin'); // Redirect if not authenticated
  }
  
  // Fetch user profile
  const profile = await profileService.getMyProfile();
}, []);
```

---

## 🐛 Troubleshooting

### "Invalid email or password"
**Problem:** Can't sign in with correct credentials

**Solutions:**
1. Check if you verified your email
2. Try resetting password
3. Check backend logs for errors
4. Verify Supabase is configured correctly

### "Failed to load profile"
**Problem:** Dashboard shows error loading profile

**Solutions:**
1. Check if backend is running
2. Check browser console for errors
3. Verify token is stored: `localStorage.getItem('auth_token')`
4. Check backend logs

### Redirected to sign in immediately
**Problem:** Can't access dashboard, keeps redirecting

**Solutions:**
1. Check if token exists in localStorage
2. Try signing in again
3. Clear localStorage and sign in fresh
4. Check token expiration

### CORS errors
**Problem:** Browser shows CORS errors

**Solutions:**
1. Verify backend middleware includes `http://localhost:8080`
2. Restart both servers
3. Clear browser cache
4. Check backend logs

---

## 🎓 Code Examples

### Using Auth Service

```typescript
import { authService } from '@/services';

// Sign up
await authService.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
await authService.signIn({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out
await authService.signOut();

// Check if authenticated
if (authService.isAuthenticated()) {
  // User is logged in
}
```

### Using Profile Service

```typescript
import { profileService } from '@/services';

// Get current user's profile
const profile = await profileService.getMyProfile();

// Update profile
await profileService.update({
  username: 'johndoe',
  full_name: 'John Doe',
  skills: ['React', 'TypeScript']
});

// Upload avatar
await profileService.uploadAvatar(file);
```

### Error Handling

```typescript
import { ApiError } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';

try {
  await authService.signIn(credentials);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      toast({
        title: 'Sign In Failed',
        description: 'Invalid email or password',
        variant: 'destructive',
      });
    }
  }
}
```

---

## 📊 Testing Checklist

### Sign Up
- [ ] Can access sign up page
- [ ] Form validation works
- [ ] Can submit with valid data
- [ ] Success message appears
- [ ] Redirected to sign in
- [ ] Verification email received

### Sign In
- [ ] Can access sign in page
- [ ] Form validation works
- [ ] Can sign in with valid credentials
- [ ] Error shown for invalid credentials
- [ ] Token stored in localStorage
- [ ] Redirected to dashboard

### Dashboard
- [ ] Can access after sign in
- [ ] Profile information displayed
- [ ] Can sign out
- [ ] Redirected to sign in after sign out
- [ ] Cannot access without authentication

### Navigation
- [ ] Sign up/sign in buttons visible when not authenticated
- [ ] Dashboard button visible when authenticated
- [ ] Links work correctly
- [ ] Mobile menu works

---

## 🚀 Next Steps

### Immediate
1. ✅ Sign up for an account
2. ✅ Sign in
3. ✅ View dashboard
4. ✅ Test sign out

### Future Enhancements
- [ ] Forgot password page
- [ ] Email verification reminder
- [ ] Profile editing page
- [ ] Avatar upload
- [ ] OAuth providers (GitHub, Google)
- [ ] Remember me checkbox
- [ ] Session timeout handling
- [ ] Account settings page

---

## 📝 Notes

### Environment Variables
Make sure your `Client/.env.local` has:
```bash
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend Configuration
Make sure your `backend/.env.local` has:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_key
```

### Database
Make sure you've run all migrations:
- See `backend/DATABASE_MIGRATION_GUIDE.md`
- Profiles table must exist
- RLS policies must be enabled

---

## 🎉 Success!

You now have a fully functional authentication system with:
- ✅ User registration
- ✅ User login
- ✅ Protected dashboard
- ✅ Profile management
- ✅ Secure token handling
- ✅ Beautiful UI
- ✅ Error handling
- ✅ Responsive design

Start testing by visiting: **http://localhost:8080**

---

**Auth Guide Version:** 1.0  
**Last Updated:** February 8, 2026
