# 🔧 Fix "Invalid login credentials" Error

## The Problem
You're seeing: **"Invalid login credentials"** or **"AuthApiError: Invalid login credentials"**

This means the email/password combination you're using doesn't exist in Supabase Auth.

---

## ✅ Solution 1: Create a New Account (Easiest)

1. **Go to Signup Page:**
   - Visit: `http://localhost:3000/signup`
   - Fill out the registration form
   - This will create both:
     - Auth user (can log in)
     - User profile (database record)
     - Bank account (with $0 starting balance)

2. **Use the credentials you just created to log in**

---

## ✅ Solution 2: Create User Manually in Supabase

### Step 1: Create Auth User
1. Go to: https://app.supabase.com
2. Select your project
3. Go to: **Authentication** → **Users**
4. Click: **"Add User"** or **"Create New User"**
5. Fill in:
   - **Email:** `your-email@example.com`
   - **Password:** `your-password`
   - ✅ Check **"Auto Confirm User"** (IMPORTANT!)
   - ✅ Check **"Email Confirmed"**
6. Click **"Create User"**
7. **Copy the User ID** (UUID) - you'll need it!

### Step 2: Create User Profile
1. Go to: **SQL Editor** → **New Query**
2. Paste this (replace `YOUR_USER_ID` and email):

```sql
INSERT INTO public.users (
  id, email, full_name, role, status, is_active, kyc_status, created_at
) VALUES (
  'YOUR_USER_ID',           -- Paste UUID from Step 1
  'your-email@example.com', -- Must match email from Step 1
  'Your Name',
  'customer',               -- or 'teller' or 'admin'
  'active',
  true,
  'verified',
  NOW()
);
```

3. Click **"Run"**

### Step 3: Create Account (for customers)
```sql
INSERT INTO public.accounts (
  user_id, account_number, account_type, account_name, balance, available_balance, status
) VALUES (
  'YOUR_USER_ID',  -- Same UUID from Step 1
  'ACC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((RANDOM() * 1000)::INT::TEXT, 3, '0'),
  'checking',
  'Main Checking Account',
  0.00,
  0.00,
  'active'
);
```

### Step 4: Try Logging In
- Use the email and password from Step 1

---

## ✅ Solution 3: Reset Password for Existing User

If you have an existing user but forgot the password:

1. Go to: **Authentication** → **Users**
2. Find your user by email
3. Click on the user
4. Click **"Reset Password"** or **"Update User"**
5. Set a new password
6. Try logging in with the new password

---

## ✅ Solution 4: Use Forgot Password Feature

1. Go to: `http://localhost:3000/forgot-password`
2. Enter your email
3. Check your email for password reset link
4. Reset your password

---

## 🔍 Check if User Exists

### Check Authentication Users (can log in):
1. Go to: **Authentication** → **Users**
2. Look for your email

### Check Database Users (profiles):
1. Go to: **Table Editor** → **users** table
2. Look for your email

**Note:** You need BOTH:
- ✅ User in Authentication (can log in)
- ✅ User profile in `users` table (has role, etc.)

---

## 🎯 Quick Test: Create Admin User

To quickly test the system, create an admin user:

### In Supabase Dashboard:
1. **Auth User:**
   - Email: `admin@test.com`
   - Password: `admin123`
   - ✅ Auto Confirm: ON
   - ✅ Email Confirmed: ON
   - Copy the User ID

2. **User Profile (SQL Editor):**
```sql
INSERT INTO public.users (
  id, email, full_name, role, status, is_active, kyc_status
) VALUES (
  'YOUR_ADMIN_USER_ID',
  'admin@test.com',
  'Admin User',
  'admin',  -- Admin role
  'active',
  true,
  'verified'
);
```

3. **Login:**
   - Go to: `http://localhost:3000/login`
   - Email: `admin@test.com`
   - Password: `admin123`

---

## ⚠️ Common Mistakes

1. **Forgetting "Auto Confirm User"** - User won't be able to log in
2. **User ID mismatch** - Profile `id` must match Auth user `id`
3. **Email mismatch** - Email in profile must match Auth email
4. **Wrong password** - Make sure you're using the correct password
5. **Project paused** - Check if your Supabase project is active

---

## 🆘 Still Not Working?

1. **Check browser console (F12)** for detailed errors
2. **Visit:** `http://localhost:3000/login/check-config` for diagnostics
3. **Verify Supabase project is active:**
   - Go to: https://app.supabase.com
   - Check if project is paused (free tier pauses after inactivity)
   - If paused, click "Restore"
4. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

---

## 📝 Quick Checklist

Before logging in, make sure:
- [ ] User exists in **Authentication → Users**
- [ ] "Auto Confirm User" is checked
- [ ] User profile exists in **users** table
- [ ] User ID in profile matches Auth user ID
- [ ] Supabase project is active (not paused)
- [ ] Dev server is running (`npm run dev`)
- [ ] Environment variables are correct in `.env.local`

