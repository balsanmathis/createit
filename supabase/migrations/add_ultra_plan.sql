-- Add 'ultra' plan and update constraints for users and subscriptions tables

-- Users table: update plan CHECK constraint
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'ultra', 'agency'));

-- Subscriptions table: update plan CHECK constraint
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('starter', 'pro', 'ultra', 'agency'));

-- Migrate existing 'agency' (250€, 16M tokens) users to 'ultra'
UPDATE public.users SET plan = 'ultra' WHERE plan = 'agency';
UPDATE public.subscriptions SET plan = 'ultra' WHERE plan = 'agency';
