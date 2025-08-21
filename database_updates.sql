-- Add last_paid_date column to track when subscription was last paid
ALTER TABLE public.subscriptions 
ADD COLUMN last_paid_date DATE;

-- Update existing records to have last_paid_date set to start_date
UPDATE public.subscriptions 
SET last_paid_date = start_date 
WHERE last_paid_date IS NULL;
