-- Migration: Add token system, welcome_code, update plan constraint
-- Run this in Supabase SQL Editor

-- 1. New columns on users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS tokens_used    INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tokens_limit   INTEGER     NOT NULL DEFAULT 32000,
  ADD COLUMN IF NOT EXISTS welcome_code   TEXT;

-- 2. Widen plan constraint to include 'free'
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_plan_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'agency'));

-- 3. Set default plan to 'free' for users without a plan
UPDATE public.users
  SET plan = 'free'
  WHERE plan IS NULL;

-- 4. Update trigger so new users start with free tier
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, plan, tokens_used, tokens_limit)
  VALUES (NEW.id, NEW.email, 'free', 0, 32000)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Indexes for token queries
CREATE INDEX IF NOT EXISTS idx_users_plan         ON public.users(plan);
CREATE INDEX IF NOT EXISTS idx_users_tokens_used  ON public.users(tokens_used);
