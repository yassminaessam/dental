#!/usr/bin/env pwsh

# Vercel Environment Variables Helper Script
# This script helps you copy environment variables to Vercel

Write-Host "🚀 Dental Management System - Vercel Environment Setup" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "Please make sure you're in the project directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📋 Environment Variables for Vercel:" -ForegroundColor Green
Write-Host "-" * 40 -ForegroundColor Gray

# Critical Variables
Write-Host "`n🔑 CRITICAL VARIABLES (Required):" -ForegroundColor Yellow

$criticalVars = @("DATABASE_URL", "POSTGRES_PRISMA_URL", "JWT_SECRET", "JWT_EXPIRES_IN")
foreach ($var in $criticalVars) {
    $value = (Get-Content .env.local | Where-Object { $_ -match "^$var=" }) -replace "^$var=", ""
    if ($value) {
        if ($var -match "SECRET|PASSWORD|KEY") {
            $maskedValue = $value.Substring(0, [Math]::Min(10, $value.Length)) + "***[HIDDEN]***"
            Write-Host "$var=" -NoNewline -ForegroundColor White
            Write-Host $maskedValue -ForegroundColor DarkGray
        } else {
            Write-Host "$var=" -NoNewline -ForegroundColor White
            Write-Host $value -ForegroundColor Green
        }
    } else {
        Write-Host "$var=" -NoNewline -ForegroundColor White
        Write-Host "NOT FOUND" -ForegroundColor Red
    }
}

# Firebase Variables (Safe to show)
Write-Host "`n🔥 FIREBASE VARIABLES (Public - Safe to share):" -ForegroundColor Yellow

$firebaseVars = @("NEXT_PUBLIC_FIREBASE_API_KEY", "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", 
                  "NEXT_PUBLIC_FIREBASE_PROJECT_ID", "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
                  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "NEXT_PUBLIC_FIREBASE_APP_ID")

foreach ($var in $firebaseVars) {
    $value = (Get-Content .env.local | Where-Object { $_ -match "^$var=" }) -replace "^$var=", ""
    if ($value) {
        Write-Host "$var=" -NoNewline -ForegroundColor White
        Write-Host $value -ForegroundColor Cyan
    } else {
        Write-Host "$var=" -NoNewline -ForegroundColor White
        Write-Host "NOT FOUND" -ForegroundColor Red
    }
}

Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "📋 Next Steps:" -ForegroundColor Green
Write-Host "1. Go to: https://vercel.com/dental-essams-projects/dental/settings/environment-variables" -ForegroundColor White
Write-Host "2. Add each variable above (copy the values from your .env.local)" -ForegroundColor White
Write-Host "3. Select 'Production, Preview, and Development' for each" -ForegroundColor White
Write-Host "4. Click 'Add' for each variable" -ForegroundColor White
Write-Host "5. Vercel will automatically redeploy after adding variables" -ForegroundColor White

Write-Host "`n⚠️  SECURITY NOTE:" -ForegroundColor Red
Write-Host "Never share DATABASE_URL, JWT_SECRET, or other sensitive values publicly!" -ForegroundColor Yellow

Write-Host "`n✅ Your live site: https://dental-blush.vercel.app" -ForegroundColor Green