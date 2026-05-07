-- Enable RLS
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;

-- Public read access (no auth required)
CREATE POLICY "Public can read segments"
  ON segments FOR SELECT
  USING (true);

CREATE POLICY "Public can read settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Public can read draws"
  ON draws FOR SELECT
  USING (true);

-- Public insert on draws (for client-side logging if needed)
CREATE POLICY "Public can insert draws"
  ON draws FOR INSERT
  WITH CHECK (true);

-- Server Actions use service role key to bypass RLS for writes
