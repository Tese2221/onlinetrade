INSERT INTO settings(key, value)
VALUES
  ('luck_wheel_daily_config', '{"dailySpinCap":4,"intervalHours":24}'::jsonb),
  ('multiplier_game_config', '{"stakePresets":[10,20,50,100],"maxStake":5000000000000}'::jsonb)
ON CONFLICT (key) DO NOTHING;
