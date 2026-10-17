import { Router } from 'express';
import { z } from 'zod';
import { runIdempotent } from '../db/idempotency.js';
import { inTransaction, pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { buildDailyTaskForecast } from '../lib/rewardEngine.js';
import { postWalletMovement } from '../services/wallet.js';
export const productsRouter = Router();
productsRouter.get('/', async (_request, response, next) => {
    try {
        const result = await pool.query(`SELECT id, name, price::text, daily_rate::text AS "dailyRate", duration_days AS "durationDays",
        description, image_url AS "imageUrl",
        CASE WHEN status = 'AVAILABLE' AND available_until <= now() THEN 'EXPIRED'
             ELSE status END AS status,
        available_from AS "availableFrom", available_until AS "availableUntil",
        display_order AS "displayOrder"
       FROM products WHERE status <> 'DRAFT' ORDER BY display_order, price ASC`);
        response.json({ success: true, data: result.rows });
    }
    catch (error) {
        next(error);
    }
});
productsRouter.get('/:productId', async (request, response, next) => {
    try {
        const parsed = z.string().uuid().safeParse(request.params.productId);
        if (!parsed.success)
            return response.status(400).json({ success: false, message: 'Invalid product.', code: 'VALIDATION_ERROR' });
        const result = await pool.query(`SELECT id, name, price::text, daily_rate::text AS "dailyRate", duration_days AS "durationDays",
          description, image_url AS "imageUrl",
          CASE WHEN status = 'AVAILABLE' AND available_until <= now() THEN 'EXPIRED'
               ELSE status END AS status,
          available_from AS "availableFrom", available_until AS "availableUntil",
          display_order AS "displayOrder"
        FROM products WHERE id = $1 AND status <> 'DRAFT'`, [parsed.data]);
        if (!result.rowCount)
            return response.status(404).json({ success: false, message: 'Product not found.', code: 'NOT_FOUND' });
        response.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        next(error);
    }
});
productsRouter.post('/:productId/purchase', requireAuth, async (request, response, next) => {
    try {
        const parsed = z.string().uuid().safeParse(request.params.productId);
        if (!parsed.success)
            return response.status(400).json({ success: false, message: 'Invalid product.', code: 'VALIDATION_ERROR' });
        const result = await inTransaction(async (client) => runIdempotent(client, {
            userId: request.auth.userId,
            operation: `product.purchase.${parsed.data}`,
            key: request.get('Idempotency-Key'),
            payload: { productId: parsed.data },
        }, async () => {
            const productResult = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [parsed.data]);
            const product = productResult.rows[0];
            if (!product)
                throw Object.assign(new Error('Product not found.'), { status: 404, code: 'NOT_FOUND' });
            if (product.status !== 'AVAILABLE' || (product.available_from && new Date(product.available_from) > new Date()) || (product.available_until && new Date(product.available_until) <= new Date())) {
                throw Object.assign(new Error('This product is not currently available.'), { status: 409, code: 'PRODUCT_UNAVAILABLE' });
            }
            const userResult = await client.query("SELECT id FROM users WHERE id = $1 AND status = 'ACTIVE' FOR UPDATE", [request.auth.userId]);
            if (!userResult.rowCount)
<<<<<<< HEAD
                throw Object.assign(new Error('This account cannot make purchases.'), { status: 403, code: 'ACCOUNT_INACTIVE' });
=======
                throw Object.assign(new Error('This account cannot make investments.'), { status: 403, code: 'ACCOUNT_INACTIVE' });
>>>>>>> d1aaf18 (Update OnlineTrade project)
            const walletResult = await client.query('SELECT id FROM wallets WHERE user_id = $1 FOR UPDATE', [request.auth.userId]);
            const wallet = walletResult.rows[0];
            if (!wallet)
                throw Object.assign(new Error('Your wallet is not available.'), { status: 400, code: 'WALLET_NOT_FOUND' });
            const record = await client.query(`INSERT INTO product_purchases(user_id, product_id, amount, status, activated_at, expires_at)
         VALUES ($1, $2, $3, 'ACTIVE', now(), now() + ($4::text || ' days')::interval) RETURNING id, expires_at`, [request.auth.userId, product.id, product.price, product.duration_days]);
            await postWalletMovement(client, {
                userId: request.auth.userId,
                walletId: wallet.id,
                amount: product.price,
                direction: 'DEBIT',
                insufficientBalanceStatus: 400,
                insufficientBalanceMessage: 'Your available balance is not enough for this investment.',
                transactionType: 'PRODUCT_PURCHASE',
                referenceId: record.rows[0].id,
                referenceType: 'product_purchase',
                description: `Investment: ${product.name}`,
            });
            const taskRows = buildDailyTaskForecast({
                amount: Number(product.price),
                dailyRate: Number(product.daily_rate),
                activatedAt: new Date().toISOString(),
                expiresAt: new Date(record.rows[0].expires_at).toISOString(),
            });
            for (const row of taskRows) {
                await client.query(`INSERT INTO daily_task_records (user_id, product_purchase_id, business_date, base_amount, configured_rate, calculated_amount, status)
                    VALUES ($1, $2, $3::date, $4, $5, $6, $7)
                    ON CONFLICT (product_purchase_id, business_date) DO NOTHING`,
                    [request.auth.userId, record.rows[0].id, row.businessDate, row.baseAmount, row.configuredRate, row.calculatedAmount, row.status]);
            }
            const previousPurchase = await client.query('SELECT 1 FROM product_purchases WHERE user_id = $1 AND id <> $2 LIMIT 1', [request.auth.userId, record.rows[0].id]);
            if (!previousPurchase.rowCount) {
                const referral = await client.query("SELECT referrer_id FROM referrals WHERE referred_user_id = $1 AND status = 'ACTIVE'", [request.auth.userId]);
                if (referral.rowCount) {
                    const eligibility =                     await client.query(`INSERT INTO luck_wheel_eligibility(user_id, spin_type, qualifying_user_id, source)
                        VALUES ($1, 'REFERRAL', $2, 'REFERRAL')
                        ON CONFLICT DO NOTHING
                        RETURNING id`, [referral.rows[0].referrer_id, request.auth.userId]);
                    if (eligibility.rowCount) {
                        await client.query(`INSERT INTO notifications(user_id, title, message, type)
                            VALUES ($1, 'Referral spin unlocked', 'Your invited customer made their first product investment. A referral wheel spin is ready for you.', 'LUCK_WHEEL_ELIGIBILITY')`,
                        [referral.rows[0].referrer_id]);
                    }
                }
            }
            await client.query("INSERT INTO notifications(user_id, title, message, type) VALUES ($1, 'Product activated', $2, 'PRODUCT_ACTIVATION')", [request.auth.userId, `${product.name} is now active.`]);
            return { status: 201, body: { success: true, data: { purchaseId: record.rows[0].id, expiresAt: record.rows[0].expires_at } } };
        }));
        response.status(result.status).json(result.body);
    }
    catch (error) {
        next(error);
    }
});
export const paymentMethodsRouter = Router();
paymentMethodsRouter.get('/', requireAuth, async (_request, response, next) => {
    try {
        const result = await pool.query(`SELECT id, name, type, account_number AS "accountNumber", account_name AS "accountName",
        bank_code AS "bankCode", phone_number AS "phoneNumber", instructions, logo_url AS "logoUrl"
       FROM payment_methods WHERE is_active = true ORDER BY display_order, name`);
        response.json({ success: true, data: result.rows });
    }
    catch (error) {
        next(error);
    }
});
