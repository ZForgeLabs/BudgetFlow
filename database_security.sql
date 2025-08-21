-- =====================================================
-- BudgetFlow Database Security Setup
-- Comprehensive Row Level Security (RLS) Implementation
-- =====================================================

-- This script ensures all user data is properly isolated
-- Each user can only access their own data across all tables

-- =====================================================
-- 1. EXPENSES TABLE SECURITY
-- =====================================================

-- Enable Row Level Security on expenses table
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;

-- Create RLS policies for expenses
CREATE POLICY "Users can view their own expenses" ON public.expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" ON public.expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" ON public.expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" ON public.expenses
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 2. SAVINGS_BINS TABLE SECURITY
-- =====================================================

-- Enable Row Level Security on savings_bins table
ALTER TABLE public.savings_bins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own savings bins" ON public.savings_bins;
DROP POLICY IF EXISTS "Users can insert their own savings bins" ON public.savings_bins;
DROP POLICY IF EXISTS "Users can update their own savings bins" ON public.savings_bins;
DROP POLICY IF EXISTS "Users can delete their own savings bins" ON public.savings_bins;

-- Create RLS policies for savings_bins
CREATE POLICY "Users can view their own savings bins" ON public.savings_bins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings bins" ON public.savings_bins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings bins" ON public.savings_bins
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings bins" ON public.savings_bins
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. PROFILES TABLE SECURITY
-- =====================================================

-- Enable Row Level Security on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 4. SUBSCRIPTIONS TABLE SECURITY (Reinforce existing)
-- =====================================================

-- Ensure Row Level Security is enabled on subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're up to date
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.subscriptions;

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" ON public.subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 5. SCHEDULES TABLE SECURITY (Reinforce existing)
-- =====================================================

-- Ensure Row Level Security is enabled on schedules table
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're up to date
DROP POLICY IF EXISTS "Users can view their own schedules" ON public.schedules;
DROP POLICY IF EXISTS "Users can insert their own schedules" ON public.schedules;
DROP POLICY IF EXISTS "Users can update their own schedules" ON public.schedules;
DROP POLICY IF EXISTS "Users can delete their own schedules" ON public.schedules;

-- Create RLS policies for schedules
CREATE POLICY "Users can view their own schedules" ON public.schedules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedules" ON public.schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules" ON public.schedules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules" ON public.schedules
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 6. ADDITIONAL SECURITY MEASURES
-- =====================================================

-- Create indexes for better performance and security
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_bins_user_id ON public.savings_bins(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Add created_at and updated_at columns if they don't exist
DO $$
BEGIN
    -- Add created_at to expenses if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' AND column_name = 'created_at') THEN
        ALTER TABLE public.expenses ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at to expenses if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' AND column_name = 'updated_at') THEN
        ALTER TABLE public.expenses ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add created_at to savings_bins if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'savings_bins' AND column_name = 'created_at') THEN
        ALTER TABLE public.savings_bins ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at to savings_bins if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'savings_bins' AND column_name = 'updated_at') THEN
        ALTER TABLE public.savings_bins ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add created_at to profiles if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at to profiles if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- The following queries can be run to verify security is working:
-- (Uncomment and run these in your Supabase SQL editor to test)

/*
-- Check if RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('expenses', 'savings_bins', 'profiles', 'subscriptions', 'schedules');

-- Check RLS policies on all tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('expenses', 'savings_bins', 'profiles', 'subscriptions', 'schedules')
ORDER BY tablename, policyname;
*/

-- =====================================================
-- SECURITY SUMMARY
-- =====================================================
-- 
-- ✅ All tables now have Row Level Security enabled
-- ✅ Each user can only access their own data
-- ✅ All CRUD operations are properly secured
-- ✅ Indexes added for performance
-- ✅ Timestamp columns added for audit trails
-- 
-- Your database is now secure for multiple users!
-- =====================================================
