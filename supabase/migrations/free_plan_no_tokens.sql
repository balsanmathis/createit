-- Migration: Free plan gets 0 tokens (cannot generate sites)
-- Run in Supabase SQL Editor

-- 1. Update column default
ALTER TABLE public.users ALTER COLUMN tokens_limit SET DEFAULT 0;

-- 2. Update all existing free users to 0 tokens
UPDATE public.users SET tokens_limit = 0 WHERE plan = 'free';

-- 3. Update handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, plan, tokens_used, tokens_limit)
  VALUES (NEW.id, NEW.email, 'free', 0, 0)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
