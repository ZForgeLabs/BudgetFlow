-- Add last_paid_date column to track when subscription was last paid
ALTER TABLE public.subscriptions 
ADD COLUMN last_paid_date DATE;

-- Update existing records to have last_paid_date set to start_date
UPDATE public.subscriptions 
SET last_paid_date = start_date 
WHERE last_paid_date IS NULL;

-- Create schedules table for savings bin scheduling
-- First drop the table if it exists to fix any constraint issues
DROP TABLE IF EXISTS public.schedules CASCADE;

CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bin_id UUID REFERENCES public.savings_bins(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'semi-weekly', 'monthly', 'custom')),
    custom_month INTEGER CHECK (custom_month >= 1 AND custom_month <= 12),
    custom_day INTEGER CHECK (custom_day >= 1 AND custom_day <= 31),
    monthly_allocation DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON public.schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_bin_id ON public.schedules(bin_id);

-- Enable Row Level Security
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own schedules" ON public.schedules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedules" ON public.schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules" ON public.schedules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules" ON public.schedules
    FOR DELETE USING (auth.uid() = user_id);
