-- Insert 12 default segments (3 prizes + 9 non-prizes)
INSERT INTO segments (label, color, probability, is_prize, display_order) VALUES
  -- PRIZES
  ('🎁 Grand Prix', '#f59e0b', 5, true, 1),
  ('🎁 Prix Moyen', '#ef4444', 8, true, 2),
  ('🎁 Petit Cadeau', '#8b5cf6', 10, true, 3),

  -- NON-PRIZES
  ('Merci !', '#10b981', 15, false, 4),
  ('Bonne chance', '#3b82f6', 15, false, 5),
  ('Presque !', '#ec4899', 12, false, 6),
  ('Réessayez', '#14b8a6', 15, false, 7),
  ('Dommage', '#f97316', 12, false, 8),
  ('Continuez !', '#6366f1', 15, false, 9),
  ('Tentez encore', '#a855f7', 12, false, 10),
  ('Courage !', '#06b6d4', 15, false, 11),
  ('Prochaine fois', '#84cc16', 12, false, 12);
