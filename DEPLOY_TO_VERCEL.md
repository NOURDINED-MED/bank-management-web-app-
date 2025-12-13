# 🚀 Deploy BAMS to Vercel - Quick Guide

## ✅ Build Test Passed!
Your app builds successfully! Ready to deploy.

---

## 🎯 Quick Deployment Steps

### Method 1: Via Vercel Website (Easiest - Recommended)

#### Step 1: Push Code to GitHub

```bash
cd "/Users/nourdine/Desktop/BAMS 2"

# Add all files
git add .

# Commit
git commit -m "Ready for deployment - BAMS Banking App"

# Create a new repository on GitHub.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/bams-banking.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy on Vercel

1. **Go to:** https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click:** "Add New..." → "Project"
4. **Import** your GitHub repository
5. **Configure:**
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add these 3 variables:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://cphklbeogcvvzutzfksi.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_iiS3pbpAQe5pBl0XvgbT1A_8ewvaovY
   SUPABASE_SERVICE_ROLE_KEY = sb_secret_ZbL4JZrkdWHyUvLix7G2tw_GnZCiLd2
   ```

7. **Click:** "Deploy"
8. **Wait 2-3 minutes** for deployment
9. **Done!** Your app will be live at: `https://your-project-name.vercel.app`

---

### Method 2: Via Vercel CLI (Command Line)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from your project directory)
cd "/Users/nourdine/Desktop/BAMS 2"
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://cphklbeogcvvzutzfksi.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
# Paste: sb_publishable_iiS3pbpAQe5pBl0XvgbT1A_8ewvaovY

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste: sb_secret_ZbL4JZrkdWHyUvLix7G2tw_GnZCiLd2

# Deploy to production
vercel --prod
```

---

## ⚙️ After Deployment - Configure Supabase

1. **Go to:** https://app.supabase.com
2. **Select your project**
3. **Go to:** Authentication → URL Configuration
4. **Add Site URL:**
   ```
   https://your-project-name.vercel.app
   ```
5. **Add Redirect URLs:**
   ```
   https://your-project-name.vercel.app/**
   ```

---

## ✅ Test Your Live App

Visit your Vercel URL and test:
- ✅ Homepage loads
- ✅ Signup works
- ✅ Login works
- ✅ Dashboards work

---

## 🆘 Troubleshooting

### Build Fails
- Check Vercel logs for errors
- Ensure all dependencies are in package.json

### Environment Variables Not Working
- Make sure variables are added in Vercel Dashboard
- Redeploy after adding variables

### Supabase Connection Issues
- Verify Supabase URL is correct
- Check Supabase project is active
- Update Supabase allowed URLs with your Vercel domain

