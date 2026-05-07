-- Table: segments
CREATE TABLE segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  probability INTEGER NOT NULL CHECK (probability > 0),
  is_prize BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_segments_active ON segments(is_active) WHERE is_active = true;
CREATE INDEX idx_segments_display_order ON segments(display_order);

-- Table: settings (single-row config)
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  primary_color TEXT DEFAULT '#f59e0b',
  secondary_color TEXT DEFAULT '#ef4444',
  wheel_bg TEXT DEFAULT '#ffffff',
  segment_text_color TEXT DEFAULT '#ffffff',
  logo_url TEXT,
  spin_button_label TEXT DEFAULT 'SPIN',
  session_label TEXT DEFAULT 'Mon Événement',
  spin_duration_min INTEGER DEFAULT 5000,
  spin_duration_max INTEGER DEFAULT 7000,
  is_spinning BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row_constraint CHECK (id = 1)
);

-- Insert default settings row
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Table: draws
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  drawn_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_label TEXT NOT NULL,
  spin_duration INTEGER NOT NULL,
  is_prize BOOLEAN NOT NULL
);

CREATE INDEX idx_draws_drawn_at ON draws(drawn_at DESC);
CREATE INDEX idx_draws_session ON draws(session_label);
CREATE INDEX idx_draws_segment ON draws(segment_id);
