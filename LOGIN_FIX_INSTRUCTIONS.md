# Login Fix - Testing Instructions

## Problem Summary
The login was failing with "Invalid credentials" error. Investigation revealed:
1. ✅ Database has correct admin user with valid password hash
2. ✅ Password hash validation works correctly  
3. ✅ All database queries return the user successfully
4. ❌ Browser has stale session ID causing 404 errors

## What Was Fixed

### 1. Email Normalization
- All emails are now normalized (lowercased and trimmed) for consistent lookups
- Case-insensitive database queries added

### 2. Session Cleanup
- Added automatic localStorage clearing when user ID returns 404
- Prevents repeated failing requests

### 3. Enhanced Logging
- Added detailed server-side logging to trace login flow
- Check terminal output to see exactly where login fails

### 4. Password Hash
- Verified admin user has correct bcrypt hash
- Email: admin@cairodental.com  
- Password: Admin123!
- User ID: d7f3dde9-7c5b-43cc-892b-c2f96aa1c33a

## Testing Steps

### Option 1: Use Debug Page (Recommended)
1. Navigate to: http://localhost:9002/debug-login.html
2. Click "Clear Session" button to remove stale data
3. Use the test login form:
   - Email: admin@cairodental.com
   - Password: Admin123!
4. Click "Test Sign In"
5. If successful, click "Go to App"

### Option 2: Clear Browser Storage Manually
1. Open browser DevTools (F12)
2. Go to Application tab → Local Storage
3. Find `localStorage` for localhost:9002
4. Delete the `sessionUserId` key (or clear all)
5. Refresh the page
6. Go to login page and try signing in

### Option 3: Use Incognito/Private Window
1. Open new incognito/private browser window
2. Go to http://localhost:9002/login
3. Sign in with:
   - Email: admin@cairodental.com
   - Password: Admin123!

## What to Check

### In Browser Console:
- Should NOT see repeated 404 errors for `/api/auth/users/e8aea08f-...`
- After clearing session, that old ID should be gone

### In Terminal (where dev server runs):
Look for these log messages during sign-in attempt:
```
[sign-in] Request received
[sign-in] Email provided: true Length: 23
[sign-in] Password provided: true Length: 9
[sign-in] Email normalized: admin@cairodental.com
[sign-in] User lookup result: { found: true, hasHash: true, hashLength: 60, isActive: true }
[sign-in] Password comparison result: true
[sign-in] SUCCESS: User authenticated: d7f3dde9-7c5b-43cc-892b-c2f96aa1c33a
```

### Expected Success:
- POST /api/auth/sign-in returns 200 (not 401)
- Browser localStorage gets new `sessionUserId`
- User is redirected to dashboard

## Troubleshooting

### If still getting 401:
1. Check terminal logs to see where it fails
2. Run: `node check-admin.js` to verify user exists
3. Run: `node test-signin.js` to test backend directly
4. Check browser Network tab - what's being sent?

### If password is wrong:
Run this to reset it:
```bash
node check-admin.js
```

### If user doesn't exist:
The check-admin.js script will create one automatically.

## Files Changed
- `src/app/api/auth/sign-in/route.ts` - Added logging and email normalization
- `src/services/users.ts` - Case-insensitive email queries  
- `src/lib/auth.ts` - Clear stale session on 404
- `public/debug-login.html` - Debug/test tool
- `check-admin.js` - Verify and fix admin user
- `test-signin.js` - Test sign-in logic

## Next Steps
After confirming login works:
1. Test creating new users
2. Test password reset flows
3. Consider adding user registration email normalization
4. Remove debug logging from sign-in route (or keep for production debugging)
