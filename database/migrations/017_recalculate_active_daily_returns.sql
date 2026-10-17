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
