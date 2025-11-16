# 🚨 NEW Environment Variables Required for Vercel

## ⚠️ Action Required: Add These to Vercel Dashboard

The following **NEW** environment variables must be added to your Vercel project for the email sending and password reset features to work in production.

---

## 📧 SMTP Configuration (Email Sending)

Go to: https://vercel.com/[your-account]/[your-project]/settings/environment-variables

Add these 6 variables:

### 1. SMTP_HOST
- **Name**: `SMTP_HOST`
- **Value**: `dental.englizyedu.com`
- **Environment**: Production, Preview, Development

### 2. SMTP_PORT
- **Name**: `SMTP_PORT`
- **Value**: `465`
- **Environment**: Production, Preview, Development

### 3. SMTP_USER
- **Name**: `SMTP_USER`
- **Value**: `info@dental.englizyedu.com`
- **Environment**: Production, Preview, Development

### 4. SMTP_PASSWORD
- **Name**: `SMTP_PASSWORD`
- **Value**: `Smsm@2103`
- **Environment**: Production, Preview, Development
- ⚠️ **SENSITIVE** - Keep this private!

### 5. SMTP_FROM_EMAIL
- **Name**: `SMTP_FROM_EMAIL`
- **Value**: `info@dental.englizyedu.com`
- **Environment**: Production, Preview, Development

### 6. SMTP_FROM_NAME
- **Name**: `SMTP_FROM_NAME`
- **Value**: `Cairo Dental Clinic`
- **Environment**: Production, Preview, Development

---

## 🌐 Application Base URL

### 7. NEXT_PUBLIC_BASE_URL
- **Name**: `NEXT_PUBLIC_BASE_URL`
- **Value**: `https://your-vercel-url.vercel.app` (e.g., `https://dental-blush.vercel.app`)
- **Environment**: Production, Preview, Development
- 📝 **Note**: Use your actual Vercel deployment URL

---

## ✅ Step-by-Step Instructions:

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com
   - Select your Cairo Dental project

2. **Navigate to Settings**
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in left sidebar

3. **Add Each Variable**
   - Click **"Add New"** button
   - Enter **Name** (e.g., `SMTP_HOST`)
   - Enter **Value** (copy from above)
   - Select **All environments** (Production, Preview, Development)
   - Click **"Save"**

4. **Repeat for all 7 variables**

5. **Redeploy**
   - Vercel will automatically redeploy after adding variables
   - Or manually redeploy from the Deployments tab

---

## 🧪 Test After Deployment:

### Test Email Sending:
1. Go to Communications page (`/communications`)
2. Click "Send Message"
3. Select a patient with email
4. Send a test message
5. Check if email arrives

### Test Forgot Password:
1. Go to login page (`/login`)
2. Click "Forgot your password?"
3. Enter your email
4. Check inbox for password reset email
5. Click reset link
6. Set new password
7. Login with new password

---

## 🔍 What These Variables Enable:

### SMTP Variables:
- ✅ Send emails to patients from Communications page
- ✅ Send password reset emails
- ✅ Professional email templates with clinic branding
- ✅ Automated appointment reminders (future)

### BASE_URL Variable:
- ✅ Password reset links work correctly
- ✅ Email links point to production URL
- ✅ Proper redirect URLs in emails

---

## 🚨 Common Issues & Solutions:

### Issue: "Failed to send email"
**Solution**: Check that all SMTP variables are set correctly, especially `SMTP_PASSWORD`

### Issue: "Reset link not working"
**Solution**: Make sure `NEXT_PUBLIC_BASE_URL` matches your actual Vercel URL

### Issue: "Variables not taking effect"
**Solution**: Trigger a new deployment after adding variables (push a commit or redeploy manually)

---

## 📋 Quick Checklist:

- [ ] Added `SMTP_HOST` to Vercel
- [ ] Added `SMTP_PORT` to Vercel
- [ ] Added `SMTP_USER` to Vercel
- [ ] Added `SMTP_PASSWORD` to Vercel
- [ ] Added `SMTP_FROM_EMAIL` to Vercel
- [ ] Added `SMTP_FROM_NAME` to Vercel
- [ ] Added `NEXT_PUBLIC_BASE_URL` to Vercel (with your actual URL)
- [ ] Deployment completed successfully
- [ ] Tested email sending
- [ ] Tested forgot password flow

---

## 🔐 Security Notes:

- ⚠️ **Never commit** these values to Git
- ⚠️ Keep `SMTP_PASSWORD` private
- ⚠️ Only share credentials with authorized team members
- ✅ Variables in Vercel are encrypted and secure
- ✅ `NEXT_PUBLIC_*` variables are safe to expose client-side

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs/concepts/projects/environment-variables
- Contact: Check deployment logs in Vercel dashboard for specific errors
