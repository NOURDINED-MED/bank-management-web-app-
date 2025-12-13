-- =====================================================
-- Fix RLS Policy Infinite Recursion
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins and tellers can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins and tellers can view all transactions" ON public.transactions;

-- Recreate users policy (simple - no recursion)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- Note: Admin/Teller full access is handled via service role key in API routes
-- RLS policies here only protect direct client access from browser

