ALTER TABLE transactions DROP CONSTRAINT transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check
  CHECK (type IN (
    'DEPOSIT', 'WITHDRAWAL', 'PRODUCT_PURCHASE', 'DAILY_REWARD', 'REFERRAL_COMMISSION',
    'REGISTRATION_BONUS', 'MILESTONE_REWARD', 'WEEKLY_REWARD', 'REFUND', 'ADJUSTMENT',
    'WITHDRAWAL_FEE', 'GIFT_CODE', 'LUCKY_WHEEL', 'GAME_STAKE', 'GAME_PAYOUT'
  ));

ALTER TABLE wallet_ledger DROP CONSTRAINT wallet_ledger_transaction_type_check;
ALTER TABLE wallet_ledger ADD CONSTRAINT wallet_ledger_transaction_type_check
  CHECK (transaction_type IN (
    'REGISTRATION_BONUS', 'DEPOSIT', 'PRODUCT_PURCHASE', 'DAILY_REWARD', 'REFERRAL_COMMISSION',
    'MILESTONE_REWARD', 'WEEKLY_REWARD', 'WITHDRAWAL', 'WITHDRAWAL_FEE', 'REFUND', 'ADJUSTMENT',
    'GIFT_CODE', 'LUCKY_WHEEL', 'GAME_STAKE', 'GAME_PAYOUT'
  ));

INSERT INTO settings(key, value) VALUES (
  'multiplier_game_odds',
  '[{"multiplier":0,"weight":3500},{"multiplier":1,"weight":4300},{"multiplier":1.5,"weight":1300},{"multiplier":2,"weight":600},{"multiplier":5,"weight":250},{"multiplier":10,"weight":45},{"multiplier":15,"weight":5}]'::jsonb
)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE multiplier_game_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  stake NUMERIC(20,2) NOT NULL CHECK (stake > 0),
  multiplier NUMERIC(5,2) NOT NULL CHECK (multiplier IN (0, 1, 1.5, 2, 5, 10, 15)),
  payout NUMERIC(20,2) NOT NULL CHECK (payout >= 0),
  odds_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX multiplier_game_rounds_user_created_idx
  ON multiplier_game_rounds(user_id, created_at DESC);
