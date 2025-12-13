# 🔧 Fix Admin Dashboard Access - Change Role to Admin

## The Problem
You're seeing "Access Denied" because your account has the **"customer"** role, but you need the **"admin"** role to access admin pages.

---

## ✅ Solution: Update Your Role to Admin

You have **3 options** to get admin access:

### Option 1: Update Role in Supabase Dashboard (Recommended - 2 minutes)

1. **Go to Supabase Dashboard:**
   - Visit: https://app.supabase.com
   - Select your project

2. **Find Your User in Database:**
   - Go to: **Table Editor** → **users** table
   - Find your email (the one you're logged in with)
   - Note the `id` (UUID) - you'll need it!

3. **Update Your Role:**
   - Click on your user row
   - Find the `role` column
   - Change it from `customer` to `admin`
   - Click **Save**

4. **Refresh the Page:**
   - Go back to: `http://localhost:3000/admin`
   - Refresh the page (F5 or Cmd+R)
   - You should now have access!

**OR use SQL Editor:**
```sql
-- Update your role to admin (replace 'YOUR_EMAIL_HERE' with your actual email)
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'YOUR_EMAIL_HERE';
```

---

### Option 2: Create a New Admin User

1. **Go to Signup:**
   - Visit: `http://localhost:3000/signup`
   - Create a new account (e.g., `admin@test.com`)

2. **Update Role in Supabase:**
   - Go to: **Table Editor** → **users**
   - Find the new user
   - Change `role` from `customer` to `admin`

3. **Log in with the new admin account**

---

### Option 3: Use API to Update Role (Advanced)

If you have admin access to another account, you can use the API, but the easiest way is Option 1 above.

---

## 🎯 Quick Steps (Copy & Paste)

1. **Open Supabase Dashboard:**
   ```
   https://app.supabase.com
   ```

2. **Go to Table Editor → users**

3. **Find your email, change role to "admin"**

4. **Refresh** `http://localhost:3000/admin`

---

## ⚠️ Important Notes

- **You need BOTH:**
  - ✅ User in `users` table with `role = 'admin'`
  - ✅ Auth user exists (for login)

- **After changing role:**
  - Refresh the page (F5)
  - Or log out and log back in

- **If it still doesn't work:**
  - Check browser console (F12) for errors
  - Make sure you're logged in with the correct email
  - Clear browser cache and try again

---

## 🔍 Verify Your Role

After updating, check:
1. Go to: `http://localhost:3000/admin`
2. You should see the admin dashboard (not "Access Denied")
3. In the navbar, you should see "Admin" badge

---

## 📝 SQL Query to Check Your Role

```sql
-- Check your current role
SELECT id, email, role, status 
FROM public.users 
WHERE email = 'YOUR_EMAIL_HERE';
```

---

## 🚀 After Getting Admin Access

Once you're an admin, you can:
- ✅ View all customers
- ✅ Manage users and accounts
- ✅ View all transactions
- ✅ Access analytics and reports
- ✅ Manage system settings

