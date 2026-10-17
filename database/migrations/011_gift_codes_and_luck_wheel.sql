ALTER TABLE transactions DROP CONSTRAINT transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check
  CHECK (type IN (
    'DEPOSIT', 'WITHDRAWAL', 'PRODUCT_PURCHASE', 'DAILY_REWARD', 'REFERRAL_COMMISSION',
    'REGISTRATION_BONUS', 'MILESTONE_REWARD', 'WEEKLY_REWARD', 'REFUND', 'ADJUSTMENT',
    'WITHDRAWAL_FEE', 'GIFT_CODE', 'LUCKY_WHEEL'
  ));

ALTER TABLE wallet_ledger DROP CONSTRAINT wallet_ledger_transaction_type_check;
ALTER TABLE wallet_ledger ADD CONSTRAINT wallet_ledger_transaction_type_check
  CHECK (transaction_type IN (
    'REGISTRATION_BONUS', 'DEPOSIT', 'PRODUCT_PURCHASE', 'DAILY_REWARD', 'REFERRAL_COMMISSION',
    'MILESTONE_REWARD', 'WEEKLY_REWARD', 'WITHDRAWAL', 'WITHDRAWAL_FEE', 'REFUND', 'ADJUSTMENT',
    'GIFT_CODE', 'LUCKY_WHEEL'
  ));

CREATE TABLE gift_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (code = upper(code) AND code ~ '^[A-Z0-9-]{4,32}$'),
  label TEXT NOT NULL CHECK (length(trim(label)) BETWEEN 2 AND 80),
  amount NUMERIC(20,2) NOT NULL CHECK (amount BETWEEN 2 AND 15),
  max_redemptions INTEGER NOT NULL CHECK (max_redemptions BETWEEN 1 AND 1000000),
  redeemed_count INTEGER NOT NULL DEFAULT 0 CHECK (redeemed_count >= 0 AND redeemed_count <= max_redemptions),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX gift_codes_status_created_idx ON gift_codes(status, created_at DESC);

CREATE TABLE gift_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_code_id UUID NOT NULL REFERENCES gift_codes(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount NUMERIC(20,2) NOT NULL CHECK (amount BETWEEN 2 AND 15),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (gift_code_id, user_id)
);
CREATE INDEX gift_redemptions_user_created_idx ON gift_redemptions(user_id, created_at DESC);

CREATE TABLE luck_wheel_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  prize_index SMALLINT NOT NULL CHECK (prize_index >= 0),
  prize_label TEXT NOT NULL,
  amount NUMERIC(20,2) NOT NULL CHECK (amount BETWEEN 2 AND 15),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO settings(key, value) VALUES (
  'luck_wheel_prizes',
  '[{"label":"2 ETB","amount":2,"weight":35},{"label":"3 ETB","amount":3,"weight":30},{"label":"5 ETB","amount":5,"weight":20},{"label":"8 ETB","amount":8,"weight":10},{"label":"15 ETB","amount":15,"weight":5}]'::jsonb
) ON CONFLICT (key) DO NOTHING;
