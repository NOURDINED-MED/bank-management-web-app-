# 🚀 Quick Start - Fix Login Error

## ❌ Error: "Invalid login credentials"

This error means you don't have an account yet. You need to **create an account first** before you can log in.

---

## ✅ Solution: Create Your Account

### Option 1: Use Signup Page (Easiest - Recommended)

1. **Go to Signup Page:**
   ```
   http://localhost:3000/signup
   ```

2. **Fill out the registration form:**
   - Enter your name
   - Enter your email (e.g., `yourname@example.com`)
   - Create a password (at least 8 characters)
   - Complete all steps

3. **That's it!** The system will automatically:
   - ✅ Create your auth account (can log in)
   - ✅ Create your user profile
   - ✅ Create a bank account with $0 starting balance

4. **Now log in:**
   - Go to: `http://localhost:3000/login`
   - Use the email and password you just created

---

### Option 2: Create Test User via Supabase Dashboard

If you prefer to create a user manually:

1. **Go to Supabase Dashboard:**
   - Visit: https://app.supabase.com
   - Select your project

2. **Create Auth User:**
   - Go to: **Authentication** → **Users**
   - Click: **"Add User"**
   - Fill in:
     - **Email:** `test@example.com`
     - **Password:** `password123`
     - ✅ **Check "Auto Confirm User"** (IMPORTANT!)
     - ✅ **Check "Email Confirmed"**
   - Click **"Create User"**
   - **Copy the User ID** (UUID)

3. **Create User Profile (SQL Editor):**
   ```sql
   INSERT INTO public.users (
     id, email, full_name, role, status, is_active, kyc_status, created_at
   ) VALUES (
     'YOUR_USER_ID_HERE',  -- Paste UUID from Step 2
     'test@example.com',   -- Must match email from Step 2
     'Test User',
     'customer',           -- or 'admin' or 'teller'
     'active',
     true,
     'verified',
     NOW()
   );
   ```

4. **Create Account (for customers):**
   ```sql
   INSERT INTO public.accounts (
     user_id, account_number, account_type, account_name, balance, available_balance, status
   ) VALUES (
     'YOUR_USER_ID_HERE',  -- Same UUID
     'ACC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((RANDOM() * 1000)::INT::TEXT, 3, '0'),
     'checking',
     'Main Checking Account',
     0.00,
     0.00,
     'active'
   );
   ```

5. **Log in with the credentials from Step 2**

---

## 📝 Quick Test Account

To quickly test the system, use these steps:

### 1. Create Account via Signup
- Visit: `http://localhost:3000/signup`
- Email: `admin@test.com`
- Password: `admin123` (or any password you prefer)
- Name: `Admin User`
- After signup, you'll be automatically logged in!

### 2. Or Create via Supabase (for Admin)
If you need an admin account:

1. **Supabase Dashboard** → **Authentication** → **Users** → **Add User**
   - Email: `admin@test.com`
   - Password: `admin123`
   - ✅ Auto Confirm: ON
   - Copy User ID

2. **SQL Editor:**
   ```sql
   INSERT INTO public.users (id, email, full_name, role, status, is_active, kyc_status)
   VALUES ('YOUR_USER_ID', 'admin@test.com', 'Admin User', 'admin', 'active', true, 'verified');
   ```

3. **Login:** Use `admin@test.com` / `admin123`

---

## ⚠️ Important Notes

- **You must create an account first** - there are no default accounts
- **Email confirmation:** If creating via Supabase, always check "Auto Confirm User"
- **User ID must match:** The `id` in the `users` table must match the Auth user's UUID
- **Email must match:** Email in profile must match email in Auth

---

## 🎯 What to Do Right Now

1. **Go to:** `http://localhost:3000/signup`
2. **Fill out the form** (takes 2 minutes)
3. **Log in** with your new credentials
4. **Start using the app!**

---

## 🔍 Still Having Issues?

1. **Check if dev server is running:**
   ```bash
   npm run dev
   ```

2. **Verify Supabase is configured:**
   - Visit: `http://localhost:3000/login/check-config`
   - Should show ✅ for all checks

3. **Check browser console (F12)** for detailed errors

4. **See detailed guide:** `FIX_INVALID_CREDENTIALS.md`

