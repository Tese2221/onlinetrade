CREATE TABLE luck_wheel_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  spin_type TEXT NOT NULL CHECK (spin_type IN ('SIGNUP', 'REFERRAL')),
  qualifying_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  claimed_at TIMESTAMPTZ,
  CHECK (
    (spin_type = 'SIGNUP' AND qualifying_user_id IS NULL)
    OR (spin_type = 'REFERRAL' AND qualifying_user_id IS NOT NULL)
  )
);
CREATE UNIQUE INDEX luck_wheel_signup_eligibility_once
  ON luck_wheel_eligibility(user_id) WHERE spin_type = 'SIGNUP';
CREATE UNIQUE INDEX luck_wheel_referral_eligibility_once
  ON luck_wheel_eligibility(user_id, qualifying_user_id) WHERE spin_type = 'REFERRAL';
CREATE INDEX luck_wheel_eligibility_available_idx
  ON luck_wheel_eligibility(user_id, created_at) WHERE claimed_at IS NULL;

INSERT INTO luck_wheel_eligibility(user_id, spin_type)
SELECT id, 'SIGNUP' FROM users WHERE role = 'CUSTOMER'
ON CONFLICT DO NOTHING;

ALTER TABLE luck_wheel_spins DROP CONSTRAINT IF EXISTS luck_wheel_spins_user_id_key;
ALTER TABLE luck_wheel_spins ADD COLUMN spin_type TEXT NOT NULL DEFAULT 'SIGNUP'
  CHECK (spin_type IN ('SIGNUP', 'REFERRAL'));
ALTER TABLE luck_wheel_spins ADD COLUMN eligibility_id UUID;
ALTER TABLE luck_wheel_spins DROP CONSTRAINT IF EXISTS luck_wheel_spins_amount_check;
UPDATE luck_wheel_spins SET amount = LEAST(amount, 20);
ALTER TABLE luck_wheel_spins ADD CONSTRAINT luck_wheel_spins_amount_check
  CHECK (
    (spin_type = 'SIGNUP' AND amount BETWEEN 0 AND 20)
    OR (spin_type = 'REFERRAL' AND amount BETWEEN 0 AND 50)
  );

UPDATE luck_wheel_spins s
SET eligibility_id = e.id
FROM luck_wheel_eligibility e
WHERE e.user_id = s.user_id AND e.spin_type = 'SIGNUP';

UPDATE luck_wheel_eligibility e
SET claimed_at = s.created_at
FROM luck_wheel_spins s
WHERE s.eligibility_id = e.id;

ALTER TABLE luck_wheel_spins ALTER COLUMN eligibility_id SET NOT NULL;
ALTER TABLE luck_wheel_spins ADD CONSTRAINT luck_wheel_spins_eligibility_fkey
  FOREIGN KEY (eligibility_id) REFERENCES luck_wheel_eligibility(id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX luck_wheel_spins_eligibility_once ON luck_wheel_spins(eligibility_id);
CREATE INDEX luck_wheel_spins_user_created_idx ON luck_wheel_spins(user_id, created_at DESC);

INSERT INTO settings(key, value) VALUES
  ('luck_wheel_signup_prizes', '[{"label":"5 ETB","amount":5,"weight":40,"kind":"CASH"},{"label":"10 ETB","amount":10,"weight":30,"kind":"CASH"},{"label":"20 ETB","amount":20,"weight":10,"kind":"CASH"},{"label":"100 ETB 😂 (joke)","amount":null,"weight":10,"kind":"JOKE"},{"label":"1,000 ETB 🤣 (joke)","amount":null,"weight":7,"kind":"JOKE"},{"label":"10,000 ETB 😅 (joke)","amount":null,"weight":3,"kind":"JOKE"},{"label":"iPhone 📱 (joke)","amount":null,"weight":1,"kind":"JOKE"},{"label":"Android phone 📱 (joke)","amount":null,"weight":1,"kind":"JOKE"}]'::jsonb),
  ('luck_wheel_referral_prizes', '[{"label":"20 ETB","amount":20,"weight":50,"kind":"CASH"},{"label":"30 ETB","amount":30,"weight":30,"kind":"CASH"},{"label":"50 ETB","amount":50,"weight":10,"kind":"CASH"},{"label":"100 ETB 😂 (joke)","amount":null,"weight":5,"kind":"JOKE"},{"label":"1,000 ETB 🤣 (joke)","amount":null,"weight":3,"kind":"JOKE"},{"label":"10,000 ETB 😅 (joke)","amount":null,"weight":1,"kind":"JOKE"},{"label":"iPhone 📱 (joke)","amount":null,"weight":1,"kind":"JOKE"},{"label":"Android phone 📱 (joke)","amount":null,"weight":1,"kind":"JOKE"}]'::jsonb)
ON CONFLICT (key) DO NOTHING;
