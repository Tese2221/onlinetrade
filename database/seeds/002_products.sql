INSERT INTO products (
  name,
  price,
  daily_rate,
  duration_days,
  description,
  image_url,
  status,
  available_from,
  available_until,
  display_order
)
VALUES
  ('Fresh Apple', 300.00, 0.05, 30, 'Invest in fresh apple trade and earn daily income from our trader network.', '/fruits/apple.svg', 'AVAILABLE', now(), NULL, 1),
  ('Sweet Banana', 600.00, 0.05, 30, 'Invest in high-demand banana trade for daily harvest profits.', '/fruits/banana.svg', 'AVAILABLE', now(), NULL, 2),
  ('Golden Orange', 1000.00, 0.05, 30, 'Invest in citrus orange trade with daily returns.', '/fruits/orange.svg', 'AVAILABLE', now(), NULL, 3),
  ('Tropical Mango', 1800.00, 0.05, 30, 'Invest in premium mango harvests with daily returns.', '/fruits/mango.svg', 'AVAILABLE', now(), NULL, 4),
  ('Ruby Strawberry', 8000.00, 0.05, 30, 'VIP strawberry trade package with daily returns.', '/fruits/strawberry.svg', 'AVAILABLE', now(), NULL, 5),
  ('Royal Pineapple', 20000.00, 0.05, 30, 'High-yield pineapple plantation trade for active investors.', '/fruits/pineapple.svg', 'AVAILABLE', now(), NULL, 6),
  ('Dragon Fruit', 50000.00, 0.05, 30, 'Exotic dragon fruit trade tier with daily returns.', '/fruits/dragonfruit.svg', 'AVAILABLE', now(), NULL, 7),
  ('Master Avocado', 100000.00, 0.05, 30, 'Premier avocado export trade with daily returns.', '/fruits/avocado.svg', 'AVAILABLE', now(), NULL, 8)
ON CONFLICT DO NOTHING;
