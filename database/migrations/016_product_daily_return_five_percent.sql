UPDATE products
SET daily_rate = 0.05,
    updated_at = now()
WHERE daily_rate IS DISTINCT FROM 0.05;

UPDATE daily_task_records AS task
SET base_amount = investment.amount,
    configured_rate = 0.05,
    calculated_amount = ROUND(investment.amount * 0.05, 2)
FROM product_purchases AS investment
WHERE investment.id = task.product_purchase_id
  AND investment.status = 'ACTIVE'
  AND task.status = 'WAITING';

UPDATE settings
SET value = '15'::jsonb,
    updated_at = now()
WHERE key = 'welcome_example_daily_earnings'
  AND value = '72'::jsonb
  AND COALESCE(
    (SELECT value FROM settings WHERE key = 'welcome_example_price'),
    '300'::jsonb
  ) = '300'::jsonb;

UPDATE settings AS promotion_settings
SET value = (
  COALESCE(
    (
      SELECT jsonb_agg(
        CASE
          WHEN banner.ordinality = 1
            AND banner.item->>'subtitle' = 'Earn 24% Daily Income'
            THEN jsonb_set(banner.item, '{subtitle}', '"Earn 5% Daily Income"'::jsonb)
          WHEN banner.ordinality = 5
            AND banner.item->>'subtitle' = '3-Level Rewards (22%-2%-1%)'
            THEN jsonb_set(banner.item, '{subtitle}', '"3-Level Rewards (10%-3%-2%)"'::jsonb)
          ELSE banner.item
        END
        ORDER BY banner.ordinality
      )
      FROM jsonb_array_elements(promotion_settings.value) WITH ORDINALITY AS banner(item, ordinality)
    ),
    '[]'::jsonb
  )
)
WHERE promotion_settings.key = 'promotion_banners'
  AND jsonb_typeof(promotion_settings.value) = 'array';
