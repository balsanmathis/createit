CREATE TABLE IF NOT EXISTS landing_content (
  id SERIAL PRIMARY KEY,
  key VARCHAR NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_landing_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS landing_content_updated_at ON landing_content;
CREATE TRIGGER landing_content_updated_at
  BEFORE UPDATE ON landing_content
  FOR EACH ROW EXECUTE FUNCTION update_landing_content_updated_at();
