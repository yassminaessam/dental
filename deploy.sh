#!/bin/bash

# Dental Management System - Vercel Deployment Script
echo "🚀 Deploying Dental Management System to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add environment variables in Vercel dashboard:"
echo "   - DATABASE_URL (your Neon database URL)"
echo "   - All FIREBASE_* variables"
echo "   - JWT_SECRET"
echo "   - Any other environment variables from your .env.local"
echo ""
echo "2. Your app will be available at the URL provided by Vercel"
echo "3. Set up custom domain if needed in Vercel dashboard"