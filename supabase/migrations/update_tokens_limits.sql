-- Migration: Update token limits to 32 000 per generation
-- Run this in Supabase SQL Editor

-- 1. Update default for new users (free plan)
ALTER TABLE public.users ALTER COLUMN tokens_limit SET DEFAULT 32000;

-- 2. Update existing free users still on old 16 000 limit
UPDATE public.users SET tokens_limit = 32000 WHERE plan = 'free' AND tokens_limit = 16000;

-- 3. Update handle_new_user trigger to use new default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, plan, tokens_used, tokens_limit)
  VALUES (NEW.id, NEW.email, 'free', 0, 32000)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
