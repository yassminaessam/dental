# Firebase Storage CORS Setup

## Issue
Firebase Storage blocks cross-origin requests from localhost, causing CORS errors when downloading images.

## Solution 1: Update Firebase Storage Rules (Recommended for Development)

1. Go to your Firebase Console: https://console.firebase.google.com/
2. Select your project: `dental-a627d`
3. Navigate to Storage in the left sidebar
4. Go to the "Rules" tab
5. Replace the current rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Allow read access to all files for development
      allow read: if true;
      // Allow write access for authenticated users (you can adjust this)
      allow write: if request.auth != null;
    }
  }
}
```

## Solution 2: CORS Configuration (Alternative)

If you want to configure CORS manually, you can use the Google Cloud Console:

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Select your project: `dental-a627d`
3. Navigate to Cloud Storage
4. Find your bucket: `dental-a627d.firebasestorage.app`
5. Click on the bucket name
6. Go to the "Permissions" tab
7. Add CORS configuration:

```json
[
  {
    "origin": ["http://localhost:3000", "http://localhost:9002", "https://yourdomain.com"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"]
  }
]
```

## Current Workaround in Code

The current implementation will:
1. Try direct download first
2. If that fails, open the image in a new tab
3. User can right-click and "Save image as..." manually

## For Production

Make sure to update the storage rules for production to be more restrictive:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /clinical-images/{fileName} {
      // Only authenticated users can read/write clinical images
      allow read, write: if request.auth != null;
    }
    match /{allPaths=**} {
      // Default: deny all other access
      allow read, write: if false;
    }
  }
}
```

## Testing

After updating the rules:
1. Wait 1-2 minutes for rules to propagate
2. Try downloading an image again
3. The download should work without CORS errors
