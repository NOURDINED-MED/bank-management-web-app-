# 🔍 How to Check Existing Users in Supabase

## Check Users in Supabase Dashboard

1. **Go to Supabase Dashboard:**
   - Visit: https://app.supabase.com
   - Select your project

2. **Check Authentication Users:**
   - Go to **Authentication** → **Users**
   - You'll see all users who can log in
   - Note their emails

3. **Check Database Users:**
   - Go to **Table Editor** → **users** table
   - You'll see all user profiles
   - Check the `role` column (customer, teller, admin)

## Common Issue: User Exists in Database but Not in Auth

If you see a user in the `users` table but not in Authentication → Users, you need to:
1. Create the auth user (Authentication → Users → Add User)
2. Make sure the `id` in the `users` table matches the auth user's UUID

## Reset Password for Existing User

1. Go to **Authentication** → **Users**
2. Click on the user
3. Click **"Reset Password"** or **"Update User"**
4. Set a new password
5. Try logging in with the new password

