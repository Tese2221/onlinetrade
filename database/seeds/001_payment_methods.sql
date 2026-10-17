INSERT INTO payment_methods (
  name,
  type,
  account_number,
  account_name,
  bank_code,
  phone_number,
  instructions,
  logo_url,
  is_active,
  display_order
)
SELECT 'Commercial Bank of Ethiopia', 'BANK_TRANSFER', '1000419637649', 'Tesema', 'CBE', NULL, 'Transfer the amount to Commercial Bank of Ethiopia and keep the transaction reference / FT code for review.', '/icons/cbe.svg', true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM payment_methods WHERE name = 'Commercial Bank of Ethiopia'
);

INSERT INTO payment_methods (
  name,
  type,
  account_number,
  account_name,
  bank_code,
  phone_number,
  instructions,
  logo_url,
  is_active,
  display_order
)
SELECT 'Telebirr Wallet', 'MOBILE_MONEY', '0929688828', 'Markos', 'TELEBIRR', NULL, 'Send the amount to Telebirr Wallet and keep the transaction reference for review.', '/icons/telebirr.svg', true, 2
WHERE NOT EXISTS (
  SELECT 1 FROM payment_methods WHERE name = 'Telebirr Wallet'
);

INSERT INTO payment_methods (
  name,
  type,
  account_number,
  account_name,
  bank_code,
  phone_number,
  instructions,
  logo_url,
  is_active,
  display_order
)
SELECT 'Awash Bank', 'BANK_TRANSFER', '013201013577300', 'Tesema', 'AWASH', NULL, 'Transfer the amount to Awash Bank and keep the transaction reference for review.', '/icons/awash.svg', true, 3
WHERE NOT EXISTS (
  SELECT 1 FROM payment_methods WHERE name = 'Awash Bank'
);

INSERT INTO payment_methods (
  name,
  type,
  account_number,
  account_name,
  bank_code,
  phone_number,
  instructions,
  logo_url,
  is_active,
  display_order
)
SELECT 'Bank of Abyssinia', 'BANK_TRANSFER', '221759389', 'Markos', 'ABYSSINIA', NULL, 'Transfer the amount to Bank of Abyssinia and keep the transaction reference for review.', '/icons/abyssinia.svg', true, 4
WHERE NOT EXISTS (
  SELECT 1 FROM payment_methods WHERE name = 'Bank of Abyssinia'
);
