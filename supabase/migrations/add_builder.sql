CREATE TABLE IF NOT EXISTS public.builder_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL DEFAULT 'Mon site',
  blocks JSONB DEFAULT '[]',
  styles JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.builder_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own builder sites" ON public.builder_sites
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS builder_sites_user_id_idx ON public.builder_sites(user_id);
