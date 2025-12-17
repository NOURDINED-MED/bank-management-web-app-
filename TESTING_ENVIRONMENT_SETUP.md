# 🧪 Testing Environment Setup Guide

Complete guide to set up your BAMS testing environment.

---

## 📋 Prerequisites

### Required Software
- ✅ **Node.js** (v18 or higher)
- ✅ **npm** or **yarn**
- ✅ **Git** (for version control)
- ✅ **Code Editor** (VS Code recommended)

### Required Accounts
- ✅ **Supabase Account** (free tier works)
- ✅ **Supabase Project** created

---

## 🚀 Step 1: Environment Variables Setup

### 1.1 Create `.env.local` File

In your project root, create `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 1.2 Get Your Supabase Keys

1. Go to: **https://supabase.com/dashboard**
2. Select your project
3. Go to: **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Verify Environment Variables

```bash
# Check if .env.local exists
cat .env.local

# Verify keys are set (don't run this if sharing output)
grep -E "SUPABASE" .env.local
```

---

## 🗄️ Step 2: Database Setup

### 2.1 Create Database Tables

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **"Run"** (or `Ctrl+Enter`)
5. Wait for success message

**Tables Created:**
- ✅ `users` - User accounts
- ✅ `accounts` - Bank accounts
- ✅ `transactions` - Transaction records
- ✅ `cards` - Card information
- ✅ `loans` - Loan records
- ✅ `support_tickets` - Support tickets
- ✅ `notifications` - Notifications
- ✅ `audit_logs` - Audit trail

### 2.2 Create Messages Table (Optional but Recommended)

1. Go to: **http://localhost:3000/setup-messages**
2. Follow the instructions to create the messages table
3. Or manually run: `CREATE_MESSAGES_TABLE.sql` in Supabase SQL Editor

---

## 👥 Step 3: Create Test Users

### 3.1 Method A: Create via Supabase Dashboard (Recommended)

#### Create Admin User

1. **Create Auth User:**
   - Go to: **Supabase Dashboard** → **Authentication** → **Users**
   - Click **"Add User"** or **"Create New User"**
   - **Email:** `admin@bams.test`
   - **Password:** `admin123` (or your choice)
   - ✅ Check **"Auto Confirm User"**
   - ✅ Check **"Email Confirmed"**
   - Click **"Create User"**
   - **Copy the User ID** (UUID) - you'll need it!

2. **Create User Profile:**
   - Go to: **SQL Editor** → **New Query**
   - Paste this SQL (replace `YOUR_USER_ID` with the UUID you copied):
   ```sql
   INSERT INTO public.users (
     id, email, full_name, role, status, is_active, kyc_status, created_at
   ) VALUES (
     'YOUR_USER_ID',           -- Paste UUID from Step 1
     'admin@bams.test',        -- Must match email from Step 1
     'Admin Test User',
     'admin',                  -- Role: admin, teller, or customer
     'active',
     true,
     'verified',
     NOW()
   );
   ```
   - Click **"Run"**

#### Create Teller User

1. **Auth User:**
   - Email: `teller@bams.test`
   - Password: `teller123`
   - Auto Confirm: ✅
   - Copy User ID

2. **User Profile:**
   ```sql
   INSERT INTO public.users (
     id, email, full_name, role, status, is_active, kyc_status, created_at
   ) VALUES (
     'TELLER_USER_ID',
     'teller@bams.test',
     'Teller Test User',
     'teller',
     'active',
     true,
     'verified',
     NOW()
   );
   ```

#### Create Customer User

1. **Auth User:**
   - Email: `customer@bams.test`
   - Password: `customer123`
   - Auto Confirm: ✅
   - Copy User ID

2. **User Profile:**
   ```sql
   INSERT INTO public.users (
     id, email, full_name, role, status, is_active, kyc_status, created_at
   ) VALUES (
     'CUSTOMER_USER_ID',
     'customer@bams.test',
     'Customer Test User',
     'customer',
     'active',
     true,
     'verified',
     NOW()
   );
   ```

3. **Create Account for Customer:**
   ```sql
   INSERT INTO public.accounts (
     user_id, account_number, account_type, account_name, balance, available_balance, status
   ) VALUES (
     'CUSTOMER_USER_ID',              -- Same UUID as customer
     'ACC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((RANDOM() * 1000)::INT::TEXT, 3, '0'),
     'checking',
     'Main Checking Account',
     1000.00,                         -- Starting balance
     1000.00,
     'active'
   );
   ```

### 3.2 Method B: Create via Admin Dashboard (After First Admin Created)

1. Login as admin (from Method A)
2. Go to: **Admin Dashboard** → **Customer Management**
3. Click **"Create New Customer"**
4. Fill in the form
5. System will automatically create auth user + profile + account

---

## 🏦 Step 4: Initialize Bank Balance (Optional)

Set the bank's reserve balance to $10,000,000,000:

1. Go to: **http://localhost:3000/admin/initialize**
2. Click **"Initialize Bank Balance"**
3. Or manually in SQL:
   ```sql
   INSERT INTO public.accounts (
     user_id, account_number, account_type, account_name, balance, available_balance, status
   ) VALUES (
     '00000000-0000-0000-0000-000000000000',
     'BANK-RESERVE-001',
     'reserve',
     'Bank Reserve Account',
     10000000000.00,
     10000000000.00,
     'active'
   )
   ON CONFLICT DO NOTHING;
   ```

---

## 🔧 Step 5: Install Dependencies

```bash
# Install all dependencies
npm install

# Or if using yarn
yarn install
```

**Verify installation:**
```bash
npm list --depth=0
```

---

## ▶️ Step 6: Start Development Server

```bash
# Start the development server
npm run dev

# Server should start at:
# http://localhost:3000
```

**Verify server is running:**
- Open browser: `http://localhost:3000`
- Should see landing page or redirect to login

---

## ✅ Step 7: Verify Setup

### 7.1 Check Environment Variables

Visit: **http://localhost:3000/login/check-config**

**Expected Output:**
```
✅ NEXT_PUBLIC_SUPABASE_URL: Set
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Set
✅ SUPABASE_SERVICE_ROLE_KEY: Set
✅ Connection: Connected Successfully
```

### 7.2 Test Login

1. Go to: **http://localhost:3000/login**
2. Try logging in with:
   - **Admin:** `admin@bams.test` / `admin123`
   - **Teller:** `teller@bams.test` / `teller123`
   - **Customer:** `customer@bams.test` / `customer123`

**Expected:**
- Admin → Redirects to `/admin`
- Teller → Redirects to `/teller`
- Customer → Redirects to `/customer`

### 7.3 Test Database Connection

In browser console (F12), you should see:
```
🔍 Supabase Client Debug: {
  url: "https://...",
  key: "...",
  keyLength: 200+
}
```

---

## 📊 Step 8: Create Test Data (Optional)

### Add Sample Transactions

Run this SQL in Supabase SQL Editor:

```sql
-- Get a customer account
DO $$
DECLARE
  customer_account_id UUID;
  customer_user_id UUID;
BEGIN
  -- Find first customer user
  SELECT id INTO customer_user_id 
  FROM public.users 
  WHERE role = 'customer' 
  LIMIT 1;
  
  -- Find their account
  SELECT id INTO customer_account_id 
  FROM public.accounts 
  WHERE user_id = customer_user_id 
  LIMIT 1;
  
  -- Add sample transactions
  IF customer_account_id IS NOT NULL THEN
    INSERT INTO public.transactions (
      account_id, transaction_type, amount, description, status, created_at
    ) VALUES
      (customer_account_id, 'deposit', 500.00, 'Initial deposit', 'completed', NOW() - INTERVAL '5 days'),
      (customer_account_id, 'withdrawal', 50.00, 'ATM withdrawal', 'completed', NOW() - INTERVAL '3 days'),
      (customer_account_id, 'deposit', 200.00, 'Salary deposit', 'completed', NOW() - INTERVAL '1 day'),
      (customer_account_id, 'payment', 25.99, 'Online purchase', 'completed', NOW() - INTERVAL '12 hours');
  END IF;
END $$;
```

---

## 🧹 Step 9: Cleanup Test Data (If Needed)

### Remove All Test Data

**⚠️ WARNING: This will delete ALL data!**

```sql
-- Delete all transactions
DELETE FROM public.transactions;

-- Delete all accounts (except bank reserve)
DELETE FROM public.accounts WHERE account_number != 'BANK-RESERVE-001';

-- Delete all users (except admin)
DELETE FROM public.users WHERE role != 'admin';

-- Reset sequences
ALTER SEQUENCE IF EXISTS transactions_id_seq RESTART WITH 1;
```

---

## 📝 Test Accounts Summary

After setup, you'll have:

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Admin | `admin@bams.test` | `admin123` | `/admin` |
| Teller | `teller@bams.test` | `teller123` | `/teller` |
| Customer | `customer@bams.test` | `customer123` | `/customer` |

**Note:** You can change these emails/passwords to whatever you prefer.

---

## 🔍 Troubleshooting

### Problem: "Cannot connect to Supabase"
**Solution:**
1. Check `.env.local` file exists
2. Verify keys are correct
3. Restart dev server: `npm run dev`
4. Check Supabase dashboard - is project active?

### Problem: "Invalid login credentials"
**Solution:**
1. Verify user exists in Authentication → Users
2. Check "Auto Confirm User" was checked
3. Verify user profile exists in `users` table

### Problem: "User not found" after login
**Solution:**
1. Check `users` table has profile for that user
2. Verify `id` in `users` table matches auth user ID exactly

### Problem: Port 3000 already in use
**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or use different port
PORT=3001 npm run dev
```

---

## ✅ Environment Checklist

Before starting testing, verify:

- [ ] `.env.local` file exists with correct keys
- [ ] Database tables created (run `supabase-schema.sql`)
- [ ] Messages table created (if using messaging)
- [ ] Test users created (admin, teller, customer)
- [ ] Test accounts created for customers
- [ ] Dev server running (`npm run dev`)
- [ ] Can access `http://localhost:3000`
- [ ] Can login with test accounts
- [ ] No console errors (F12)

---

## 🎯 Next Steps

After setup is complete:

1. ✅ Follow `TESTING_GUIDE.md` for comprehensive testing
2. ✅ Or use `QUICK_TEST.md` for quick 5-minute test
3. ✅ Review `SYSTEM_SUMMARY.md` for feature overview

---

## 📚 Additional Resources

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

**Your testing environment is ready! 🚀**























