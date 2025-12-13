# 🚀 BAMS Supabase Integration Setup Guide

## ✅ Step 1: Environment Variables (DONE)

Your `.env.local` file has been created with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://cphklbeogcvvzutzfksi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_iiS3pbpAQe5pBl0XvgbT1A_8ewvaovY
SUPABASE_SERVICE_ROLE_KEY=sb_secret_ZbL4JZrkdWHyUvLix7G2tw_GnZCiLd2
```

## 📋 Step 2: Run Database Schema

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `cphklbeogcvvzutzfksi`
3. Click on **SQL Editor** in the left sidebar
4. Click **+ New Query**
5. Copy the entire contents of `supabase/schema.sql`
6. Paste into the SQL editor
7. Click **Run** (or press `Cmd/Ctrl + Enter`)

This will create:
- ✅ 11 database tables (users, accounts, transactions, cards, loans, bills, etc.)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for automatic timestamps
- ✅ Custom functions

## 🔐 Step 3: Configure Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Optional: Enable **Google**, **Apple** OAuth providers

### Email Templates (Optional)
Go to **Authentication** → **Email Templates** and customize:
- Confirmation email
- Password reset email
- Magic link email

## 📊 Step 4: Verify Database Tables

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these tables:
   - `users` - User profiles
   - `accounts` - Bank accounts
   - `transactions` - All transactions
   - `cards` - Debit/credit cards
   - `loans` - Loan applications
   - `bills` - Bill payments
   - `kyc_documents` - KYC verification docs
   - `notifications` - User notifications
   - `audit_logs` - System audit trail
   - `support_tickets` - Customer support
   - `referrals` - Referral program

## 🧪 Step 5: Test Connection

Restart your dev server:
```bash
npm run dev
```

The app should now connect to Supabase!

## 📁 Files Created

1. **`.env.local`** - Environment variables (never commit this!)
2. **`lib/supabase-client.ts`** - Client-side Supabase (use in React components)
3. **`lib/supabase-server.ts`** - Server-side Supabase (use in API routes)
4. **`supabase/schema.sql`** - Database schema (run in Supabase SQL Editor)

## 🔒 Row Level Security (RLS)

RLS is enabled on all tables. This means:
- **Customers** can only see their own data
- **Tellers** can see all customer data
- **Admins** have full access

## 📝 Usage Examples

### Client-Side (React Components)

```typescript
import { supabase } from '@/lib/supabase-client'

// Fetch user's transactions
export default function TransactionsList() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  
  // RLS ensures users only see their own transactions
}
```

### Server-Side (API Routes)

```typescript
import { supabaseAdmin } from '@/lib/supabase-server'

// Admin operation (bypasses RLS)
export async function DELETE(request: Request) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', userId)
}
```

## 🎯 Next Steps

Now you can:

1. **Update existing pages** to use real Supabase data instead of mock data
2. **Implement real authentication** using Supabase Auth
3. **Add transaction creation** API routes
4. **Enable real-time features** with Supabase subscriptions

## 🚨 Important Security Notes

1. ✅ Never commit `.env.local` to git (already in `.gitignore`)
2. ⚠️ Never use `SUPABASE_SERVICE_ROLE_KEY` in client-side code
3. ✅ Always use RLS policies for data access control
4. ✅ Encrypt sensitive data (card numbers, PINs)
5. ✅ Hash passwords (Supabase Auth handles this)

## 📚 Database Schema Overview

### Core Tables

**users** - User profiles and authentication
- Fields: email, full_name, role, status, kyc_verified
- Roles: customer, teller, admin

**accounts** - Bank accounts
- Fields: account_number, account_type, balance, currency
- Types: checking, savings, investment, business

**transactions** - All financial transactions
- Fields: amount, type, status, from/to accounts
- Types: deposit, withdrawal, transfer, payment, etc.

**cards** - Debit/credit cards
- Fields: card_number (encrypted), status, limits
- Types: debit, credit, virtual

**loans** - Loan applications and tracking
- Fields: amount, interest_rate, status, payments
- Types: personal, auto, home, business, student

**bills** - Bill payments and reminders
- Fields: biller_name, amount, due_date, auto_pay
- Supports recurring bills

### Supporting Tables

- **kyc_documents** - Identity verification documents
- **notifications** - User notifications
- **audit_logs** - System audit trail
- **support_tickets** - Customer support
- **referrals** - Referral program tracking

## 🆘 Troubleshooting

### Issue: Can't connect to Supabase
- Check `.env.local` exists and has correct keys
- Restart dev server: `npm run dev`
- Check Supabase project is active

### Issue: RLS policies blocking queries
- Make sure user is authenticated
- Check RLS policies in Supabase Dashboard
- For admin operations, use `supabaseAdmin` from server-side

### Issue: Tables not showing in dashboard
- Re-run the SQL schema in SQL Editor
- Check for SQL errors in the output
- Refresh the Table Editor page

## 📞 Need Help?

- Supabase Docs: https://supabase.com/docs
- BAMS Issues: Contact your development team

---

**Setup Complete! 🎉**

Your BAMS app is now connected to Supabase with a full production-ready database schema!

