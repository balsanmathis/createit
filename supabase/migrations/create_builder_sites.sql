-- Builder Sites table for the no-code visual editor
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.builder_sites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Mon site',
  blocks JSONB NOT NULL DEFAULT '[]',
  styles JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_builder_sites_user_id ON public.builder_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_builder_sites_updated_at ON public.builder_sites(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.builder_sites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own builder sites"
  ON public.builder_sites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own builder sites"
  ON public.builder_sites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own builder sites"
  ON public.builder_sites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own builder sites"
  ON public.builder_sites FOR DELETE
  USING (auth.uid() = user_id);
