# 🚀 Vercel Environment Variables Setup Guide

## 📋 Required Environment Variables for Vercel

Copy these environment variables from your `.env.local` file to your Vercel dashboard:

### 🔑 Critical Variables (Required for deployment)

1. **DATABASE_URL** - Your Neon database connection string
2. **POSTGRES_PRISMA_URL** - Your Prisma database URL
3. **JWT_SECRET** - Secret key for JWT tokens
4. **JWT_EXPIRES_IN** - JWT expiration time

### 🔥 Firebase Variables (Required for authentication)

5. **NEXT_PUBLIC_FIREBASE_API_KEY**
6. **NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN** 
7. **NEXT_PUBLIC_FIREBASE_PROJECT_ID**
8. **NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET**
9. **NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**
10. **NEXT_PUBLIC_FIREBASE_APP_ID**
11. **NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID**

### 📁 Storage Variables (Optional - if using file uploads)

12. **USE_LOCAL_STORAGE** (set to "false" for production)
13. **USE_S3_STORAGE** (set to "true" if using S3)
14. **UPLOAD_DIR** (for local development only)

### 🔧 Stack Variables (Optional - if using Stack Auth)

15. **NEXT_PUBLIC_STACK_PROJECT_ID**
16. **NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY**
17. **STACK_SECRET_SERVER_KEY**

### 📧 SMTP Email Variables (Required for email sending & password reset)

18. **SMTP_HOST** - Your SMTP server (e.g., dental.englizyedu.com)
19. **SMTP_PORT** - SMTP port (usually 465 for SSL)
20. **SMTP_USER** - Your SMTP username/email
21. **SMTP_PASSWORD** - Your SMTP password
22. **SMTP_FROM_EMAIL** - Sender email address
23. **SMTP_FROM_NAME** - Sender name (e.g., Cairo Dental Clinic)

### 🌐 Application URL Variables (Required for password reset links)

24. **NEXT_PUBLIC_BASE_URL** - Your production URL (e.g., https://dental-blush.vercel.app)

---

## 🎯 How to Add Variables in Vercel:

1. Go to your Vercel dashboard: https://vercel.com/dental-essams-projects/dental
2. Click on **"Settings"** tab
3. Click on **"Environment Variables"** in the sidebar
4. For each variable above:
   - **Name**: Enter the variable name (e.g., `DATABASE_URL`)
   - **Value**: Copy the value from your `.env.local` file
   - **Environment**: Select "Production, Preview, and Development"
   - Click **"Add"**

## ⚡ Quick Copy Commands:

Run these commands to see your current values (mask sensitive parts manually):

```bash
# Database
echo "DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d'=' -f2-)"

# JWT
echo "JWT_SECRET=$(grep '^JWT_SECRET=' .env.local | cut -d'=' -f2-)"
echo "JWT_EXPIRES_IN=$(grep '^JWT_EXPIRES_IN=' .env.local | cut -d'=' -f2-)"

# Firebase (these are safe to share as they're public)
grep '^NEXT_PUBLIC_FIREBASE_' .env.local
```

## 🚨 Important Notes:

- **Never commit `.env.local` to Git** (it's in .gitignore)
- **DATABASE_URL** is the most critical - without it, the app won't work
- **Firebase variables** are needed for authentication
- **JWT_SECRET** should be a long, random string
- After adding variables, Vercel will automatically redeploy

## ✅ Test After Setup:

1. Add the variables in Vercel
2. Check if deployment succeeds  
3. Visit your live site: https://dental-blush.vercel.app
4. Try logging in to test authentication

---

*Need help? The deployment will show specific error messages if any variables are missing.*