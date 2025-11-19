# Vercel Environment Variables Checklist

## Critical Issue
The FTP proxy is returning 500 error on production, but local FTP download works perfectly.

## What to Check on Vercel Dashboard

### 1. Go to Vercel Dashboard
https://vercel.com/dashboard → Your Project → Settings → Environment Variables

### 2. Required FTP Variables

Check these variables exist and have correct values:

| Variable | Required Value | Notes |
|----------|---------------|-------|
| `USE_FTP_STORAGE` | `true` | Must be string "true" |
| `FTP_HOST` | `ftps5.us.freehostia.com` | ✅ Correct |
| `FTP_USER` | `dental_dental.adsolutions-eg.com` | ✅ Correct |
| `FTP_PASSWORD` | `Smsm@2103` | ✅ Correct |
| `FTP_SECURE` | `true` | Must be string "true" |
| `FTP_BASE_PATH` | **(empty or not set)** | ⚠️ Must NOT be `/www` |
| `FTP_PUBLIC_URL` | `https://dental.adsolutions-eg.com/assets` | ✅ Correct |
| `NEXT_PUBLIC_FTP_PUBLIC_URL` | `https://dental.adsolutions-eg.com/assets` | For client-side |

### 3. Common Issues

#### ❌ Issue: `FTP_BASE_PATH=/www`
**Problem:** Creates double path `/www/.../www/...`
**Fix:** Delete the variable or set to empty string

#### ❌ Issue: Variables not set for Production environment
**Problem:** Variables might only be set for Preview/Development
**Fix:** Make sure all variables are checked for "Production" environment

#### ❌ Issue: Old deployment still running
**Problem:** Latest code not deployed yet
**Fix:** Go to Deployments tab → Click "Redeploy" on latest

### 4. Check Deployment Status

Go to: https://vercel.com/dashboard → Deployments

Latest commit should be:
```
658c4a8 - fix: FTP basePath handling for image uploads
```

Status should be: **✅ Ready** (not Building or Error)

### 5. Check Function Logs

Go to: https://vercel.com/dashboard → Deployments → Click latest → Runtime Logs

Look for FTP proxy errors. You should see logs like:
```
🔹 ==================== FTP PROXY REQUEST ====================
  Full URL: ...
  Image Path Param: clinical-images/...
```

If you see errors like:
- `❌ FTP credentials not configured` → Environment variables missing
- `❌ Connection timeout` → Vercel can't reach FTP server (firewall?)
- `No such file or directory` → Path mismatch (old code)

### 6. After Making Changes

1. ✅ Save environment variables
2. ✅ Go to Deployments tab
3. ✅ Click "..." on latest deployment
4. ✅ Click "Redeploy"
5. ✅ Wait for deployment to complete (~2-3 min)
6. ✅ Test image upload again

## Quick Test URLs

After fixing, you can test directly:

**Test if proxy works:**
```
https://dental.englizyedu.com/api/ftp-proxy?path=clinical-images/622eb126-cd7f-48f1-9b53-5183e8d23a77/622eb126-cd7f-48f1-9b53-5183e8d23a77_x-ray_1763546205737_t15.jpeg
```

Should return the JPEG image (not 500 error).

**Test if direct FTP URL works (will fail because no web server):**
```
https://dental.adsolutions-eg.com/assets/clinical-images/622eb126-cd7f-48f1-9b53-5183e8d23a77/622eb126-cd7f-48f1-9b53-5183e8d23a77_x-ray_1763546205737_t15.jpeg
```

This won't work because you don't have a web server at dental.adsolutions-eg.com serving files.
That's why we need the FTP proxy!

## Alternative: Check if Vercel Can Connect to FTP

Vercel functions run from specific IP ranges. Your FTP server might be blocking them.

**If FTP connection is blocked:**
- Option 1: Whitelist Vercel IPs on FTP server (check Freehostia settings)
- Option 2: Use local storage instead (set `USE_FTP_STORAGE=false`)
- Option 3: Use a different storage solution (AWS S3, Cloudinary, etc.)

**Test from Vercel:**
Create a test endpoint to verify FTP connection from Vercel servers.
