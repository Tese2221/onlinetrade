UPDATE settings
SET value = '{"A":10,"B":3,"C":2}'::jsonb
WHERE key = 'referral_rates'
  AND value = '{"A":22,"B":2,"C":1}'::jsonb;

ALTER TABLE luck_wheel_eligibility
  ADD COLUMN source TEXT NOT NULL DEFAULT 'SIGNUP';

UPDATE luck_wheel_eligibility
SET source = spin_type;

ALTER TABLE luck_wheel_eligibility
  DROP CONSTRAINT luck_wheel_eligibility_check;

ALTER TABLE luck_wheel_eligibility
  ADD CONSTRAINT luck_wheel_eligibility_source_check
  CHECK (source IN ('SIGNUP', 'REFERRAL', 'DAILY', 'ADMIN'));

ALTER TABLE luck_wheel_eligibility
  ADD CONSTRAINT luck_wheel_eligibility_qualifying_source_check
  CHECK (
    (source = 'REFERRAL' AND spin_type = 'REFERRAL' AND qualifying_user_id IS NOT NULL)
    OR (source <> 'REFERRAL' AND qualifying_user_id IS NULL)
  );

DROP INDEX IF EXISTS luck_wheel_signup_eligibility_once;
CREATE UNIQUE INDEX luck_wheel_signup_eligibility_once
  ON luck_wheel_eligibility(user_id) WHERE source = 'SIGNUP';

CREATE TABLE luck_wheel_daily_state (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  next_spin_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO luck_wheel_daily_state(user_id, next_spin_at)
SELECT id, coalesce(created_at, now()) + interval '24 hours'
FROM users
WHERE role = 'CUSTOMER'
ON CONFLICT (user_id) DO NOTHING;
