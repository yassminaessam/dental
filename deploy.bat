@echo off
REM Dental Management System - Vercel Deployment Script for Windows

echo 🚀 Deploying Dental Management System to Vercel...

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Login to Vercel (if not already logged in)
echo 🔐 Checking Vercel authentication...
vercel whoami || vercel login

REM Deploy to Vercel
echo 📦 Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete!
echo.
echo 📋 Next steps:
echo 1. Add environment variables in Vercel dashboard:
echo    - DATABASE_URL (your Neon database URL)
echo    - All FIREBASE_* variables
echo    - JWT_SECRET
echo    - Any other environment variables from your .env.local
echo.
echo 2. Your app will be available at the URL provided by Vercel
echo 3. Set up custom domain if needed in Vercel dashboard

pause