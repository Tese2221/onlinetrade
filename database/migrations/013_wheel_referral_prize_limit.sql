ALTER TABLE luck_wheel_spins DROP CONSTRAINT IF EXISTS luck_wheel_spins_amount_check;
ALTER TABLE luck_wheel_spins ADD CONSTRAINT luck_wheel_spins_amount_check
  CHECK (
    (spin_type = 'SIGNUP' AND amount BETWEEN 0 AND 20)
    OR (spin_type = 'REFERRAL' AND amount BETWEEN 0 AND 100)
  );

UPDATE settings
SET value = (
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'label', mapped.amount::text || ' ETB',
      'amount', mapped.amount,
      'weight', (mapped.prize->>'weight')::integer,
      'kind', 'CASH'
    ) ORDER BY mapped.position
  ), '[]'::jsonb)
  FROM (
    SELECT
      CASE
        WHEN (prize->>'amount')::numeric <= 7.5 THEN 5
        WHEN (prize->>'amount')::numeric <= 15 THEN 10
        ELSE 20
      END AS amount,
      prize,
      position
    FROM jsonb_array_elements(value) WITH ORDINALITY AS entries(prize, position)
    WHERE prize->>'kind' = 'CASH'
  ) AS mapped
)
WHERE key = 'luck_wheel_signup_prizes';

UPDATE settings
SET value = (
  SELECT coalesce(jsonb_agg(prizes.prize ORDER BY prizes.position), '[]'::jsonb)
  FROM (
    SELECT
      jsonb_build_object(
        'label', (entry.prize->>'amount') || ' ETB',
        'amount', (entry.prize->>'amount')::numeric,
        'weight', (entry.prize->>'weight')::integer,
        'kind', 'CASH'
      ) AS prize,
      entry.position
    FROM jsonb_array_elements(value) WITH ORDINALITY AS entry(prize, position)
    WHERE entry.prize->>'kind' = 'CASH'
    UNION ALL
    SELECT
      '{"label":"100 ETB","amount":100,"weight":10,"kind":"CASH"}'::jsonb,
      999999
    WHERE NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(value) AS entry(prize)
      WHERE entry.prize->>'kind' = 'CASH' AND (entry.prize->>'amount')::numeric = 100
    )
  ) AS prizes
)
WHERE key = 'luck_wheel_referral_prizes';
