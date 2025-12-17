# Fix Login "Unable to connect to server" Error

## The Problem
You're seeing: **"Unable to connect to the server. Please check your internet connection and try again."**

## Possible Causes

### 1. **Supabase API Keys Format Issue**
Your Supabase keys appear to be in an unusual format:
- Current format: `sb_publishable_...` and `sb_secret_...`
- Expected format: JWT tokens starting with `eyJ...`

### 2. **How to Fix**

#### Option A: Verify Your Supabase Keys
1. Go to **https://supabase.com/dashboard**
2. Select your project
3. Go to **Settings** → **API**
4. Check the **anon/public** key:
   - It should be a **long JWT token** starting with `eyJ...`
   - If it starts with `sb_publishable_`, that's the wrong key format

5. Copy the correct keys and update your `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://cphklbeogcvvzutzfksi.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (should be a JWT token)
   SUPABASE_SERVICE_ROLE_KEY=eyJ... (should be a JWT token)
   ```

6. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

#### Option B: Check if Supabase Project is Active
1. Go to **https://supabase.com/dashboard**
2. Check if your project is **paused** (free tier projects pause after inactivity)
3. If paused, click **"Restore"** to reactivate it
4. Wait 1-2 minutes for it to fully restore

#### Option C: Test Connection Manually
1. Go to: **http://localhost:3000/login/check-config**
2. This page will test your Supabase connection and show detailed diagnostics

## Quick Fix Steps

1. **Verify Supabase keys are correct:**
   - Dashboard → Settings → API
   - Copy the **anon/public** key (JWT format)

2. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (full JWT token)
   ```

3. **Restart dev server:**
   ```bash
   # Kill current server
   pkill -f "next dev"
   # Start fresh
   npm run dev
   ```

4. **Try logging in again**

## Still Not Working?

1. Check browser console (F12) for detailed error messages
2. Visit `/login/check-config` for diagnostic info
3. Verify your internet connection
4. Check if Supabase dashboard is accessible: https://supabase.com/dashboard
























