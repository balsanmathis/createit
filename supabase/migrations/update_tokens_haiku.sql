-- Migration: Update token limits for Haiku pricing (8 000 per generation)
-- Run this in Supabase SQL Editor

-- 1. Update default for new users (free plan)
ALTER TABLE public.users ALTER COLUMN tokens_limit SET DEFAULT 8000;

-- 2. Update existing free users to new limit
UPDATE public.users SET tokens_limit = 8000 WHERE plan = 'free' AND tokens_limit = 32000;

-- 3. Update handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, plan, tokens_used, tokens_limit)
  VALUES (NEW.id, NEW.email, 'free', 0, 8000)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
