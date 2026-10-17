import { randomBytes, randomInt } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { inTransaction, pool } from '../db/pool.js';
import { getWheelPrizes, normalizeWheelPrizes, selectWheelPrizeIndex, wheelSettingKey } from '../lib/promotions.js';
import { DEFAULT_MULTIPLIER_GAME_ODDS, multiplierOddsWithProbability, normalizeMultiplierGameOdds, selectMultiplier } from '../lib/multiplierGame.js';
import {
    DEFAULT_DAILY_SPIN_CONFIG,
    DEFAULT_MULTIPLIER_GAME_CONFIG,
    MAX_GAME_STAKE,
    normalizeDailySpinConfig,
    normalizeMultiplierGameConfig,
} from '../lib/promotionConfig.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { createUserRateLimit } from '../middleware/userRateLimit.js';
import { postWalletMovement } from '../services/wallet.js';

export const promotionsRouter = Router();
promotionsRouter.use(requireAuth, (request, response, next) => {
    if (request.auth.role !== 'CUSTOMER') {
        return response.status(403).json({ success: false, message: 'Customer access is required.', code: 'FORBIDDEN' });
    }
    next();
});

async function getMultiplierGameOdds(client) {
    const result = await client.query("SELECT value FROM settings WHERE key = 'multiplier_game_odds'");
    return normalizeMultiplierGameOdds(result.rows[0]?.value ?? DEFAULT_MULTIPLIER_GAME_ODDS);
}

async function getMultiplierGameConfig(client) {
    const result = await client.query("SELECT value FROM settings WHERE key = 'multiplier_game_config'");
    return normalizeMultiplierGameConfig(result.rows[0]?.value ?? DEFAULT_MULTIPLIER_GAME_CONFIG);
}

async function getDailySpinConfig(client) {
    const result = await client.query("SELECT value FROM settings WHERE key = 'luck_wheel_daily_config'");
    return normalizeDailySpinConfig(result.rows[0]?.value ?? DEFAULT_DAILY_SPIN_CONFIG);
}

promotionsRouter.get('/game', async (request, response, next) => {
    try {
        const [odds, config, wallet, history] = await Promise.all([
            getMultiplierGameOdds(pool),
            getMultiplierGameConfig(pool),
            pool.query('SELECT available_balance::text AS "availableBalance" FROM wallets WHERE user_id = $1', [request.auth.userId]),
            pool.query(`SELECT id, stake::text, multiplier::text, payout::text, created_at AS "createdAt"
                FROM multiplier_game_rounds WHERE user_id = $1
                ORDER BY created_at DESC LIMIT 20`, [request.auth.userId]),
        ]);
        if (!wallet.rowCount) {
            throw Object.assign(new Error('Wallet not found.'), { status: 409, code: 'WALLET_NOT_FOUND' });
        }
        response.json({ success: true, data: {
            odds: multiplierOddsWithProbability(odds),
            ...config,
            balance: wallet.rows[0].availableBalance,
            history: history.rows,
        } });
    } catch (error) {
        next(error);
    }
});

const gameStakeSchema = z.object({
    amount: z.coerce.number().finite().min(0.01).max(MAX_GAME_STAKE)
        .refine((amount) => Math.abs(amount * 100 - Math.round(amount * 100)) < 0.000001, 'Enter an amount with at most two decimal places.'),
});

const multiplierGameLimiter = createUserRateLimit({ limit: 30 });
promotionsRouter.post('/game/play', multiplierGameLimiter, async (request, response, next) => {
    try {
        const parsed = gameStakeSchema.safeParse(request.body);
        if (!parsed.success) {
            return response.status(400).json({ success: false, message: parsed.error.issues[0]?.message ?? 'Enter a valid stake amount.', code: 'VALIDATION_ERROR' });
        }
        const result = await inTransaction(async (client) => {
            const wallet = await client.query(`SELECT id, available_balance::text AS balance
                FROM wallets WHERE user_id = $1 FOR UPDATE`, [request.auth.userId]);
            if (!wallet.rowCount) {
                throw Object.assign(new Error('Wallet not found.'), { status: 409, code: 'WALLET_NOT_FOUND' });
            }
            const stakeCents = Math.round(parsed.data.amount * 100);
            const stake = (stakeCents / 100).toFixed(2);
            if (Math.round(Number(wallet.rows[0].balance) * 100) < stakeCents) {
                throw Object.assign(new Error('Your available balance is not enough for this stake.'), { status: 400, code: 'INSUFFICIENT_BALANCE' });
            }

            const [odds, config] = await Promise.all([
                getMultiplierGameOdds(client),
                getMultiplierGameConfig(client),
            ]);
            if (parsed.data.amount > config.maxStake) {
                throw Object.assign(new Error(`The maximum stake is ${config.maxStake} ETB.`), { status: 400, code: 'STAKE_LIMIT_EXCEEDED' });
            }
            const totalWeight = odds.reduce((total, entry) => total + entry.weight, 0);
            const multiplier = selectMultiplier(odds, randomInt(totalWeight));
            const multiplierHundredths = BigInt(Math.round(multiplier * 100));
            const payoutCents = (BigInt(stakeCents) * multiplierHundredths + 50n) / 100n;
            const payout = `${payoutCents / 100n}.${String(payoutCents % 100n).padStart(2, '0')}`;
            const round = await client.query(`INSERT INTO multiplier_game_rounds(user_id, stake, multiplier, payout, odds_snapshot)
                VALUES ($1, $2, $3, $4, $5::jsonb)
                RETURNING id, stake::text, multiplier::text, payout::text, created_at AS "createdAt"`,
            [request.auth.userId, stake, multiplier, payout, JSON.stringify(multiplierOddsWithProbability(odds))]);

            const stakeMovement = await postWalletMovement(client, {
                userId: request.auth.userId,
                walletId: wallet.rows[0].id,
                amount: stake,
                direction: 'DEBIT',
                transactionType: 'GAME_STAKE',
                referenceId: round.rows[0].id,
                referenceType: 'MULTIPLIER_GAME',
                description: 'Multiplier game stake',
            });
            let balance = stakeMovement.availableBalance;
            if (payoutCents > 0n) {
                const payoutMovement = await postWalletMovement(client, {
                    userId: request.auth.userId,
                    walletId: wallet.rows[0].id,
                    amount: payout,
                    direction: 'CREDIT',
                    transactionType: 'GAME_PAYOUT',
                    referenceId: round.rows[0].id,
                    referenceType: 'MULTIPLIER_GAME',
                    description: `Multiplier game payout at ${multiplier}x`,
                });
                balance = payoutMovement.availableBalance;
            }
            return { ...round.rows[0], balance, odds: multiplierOddsWithProbability(odds) };
        });
        response.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

const giftRedeemLimiter = createUserRateLimit({ limit: 10 });
promotionsRouter.post('/gifts/redeem', giftRedeemLimiter, async (request, response, next) => {
    try {
        const parsed = z.object({
            code: z.string().trim().min(4).max(32).transform((code) => code.toUpperCase()).refine((code) => /^[A-Z0-9-]+$/.test(code)),
        }).safeParse(request.body);
        if (!parsed.success) {
            return response.status(400).json({ success: false, message: 'Enter a valid gift code.', code: 'VALIDATION_ERROR' });
        }

        const result = await inTransaction(async (client) => {
            const selected = await client.query(`SELECT id, code, label, amount::text, max_redemptions, redeemed_count, status
                FROM gift_codes WHERE code = $1 FOR UPDATE`, [parsed.data.code]);
            const gift = selected.rows[0];
            if (!gift || gift.status !== 'ACTIVE') {
                throw Object.assign(new Error('This gift code is not available.'), { status: 404, code: 'GIFT_CODE_UNAVAILABLE' });
            }
            if (gift.redeemed_count >= gift.max_redemptions) {
                throw Object.assign(new Error('This gift code has already been fully claimed.'), { status: 409, code: 'GIFT_CODE_EXHAUSTED' });
            }
            const existing = await client.query('SELECT 1 FROM gift_redemptions WHERE gift_code_id = $1 AND user_id = $2', [gift.id, request.auth.userId]);
            if (existing.rowCount) {
                throw Object.assign(new Error('You have already used this gift code.'), { status: 409, code: 'GIFT_CODE_ALREADY_REDEEMED' });
            }

            const redemption = await client.query(`INSERT INTO gift_redemptions(gift_code_id, user_id, amount)
                VALUES ($1, $2, $3) RETURNING id`, [gift.id, request.auth.userId, gift.amount]);
            await client.query('UPDATE gift_codes SET redeemed_count = redeemed_count + 1 WHERE id = $1', [gift.id]);
            await postWalletMovement(client, {
                userId: request.auth.userId,
                amount: gift.amount,
                direction: 'CREDIT',
                transactionType: 'GIFT_CODE',
                referenceId: redemption.rows[0].id,
                referenceType: 'GIFT_CODE_REDEMPTION',
                description: `Gift code ${gift.code}`,
            });
            return { amount: gift.amount, label: gift.label };
        });

        response.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

async function replenishDailySpins(userId) {
    return inTransaction(async (client) => {
        const config = await getDailySpinConfig(client);
        await client.query(`INSERT INTO luck_wheel_daily_state(user_id, next_spin_at)
            VALUES ($1, now() + ($2 * interval '1 hour')) ON CONFLICT (user_id) DO NOTHING`, [userId, config.intervalHours]);
        const [stateResult, availableResult, clockResult] = await Promise.all([
            client.query('SELECT next_spin_at AS "nextSpinAt" FROM luck_wheel_daily_state WHERE user_id = $1 FOR UPDATE', [userId]),
            client.query(`SELECT count(*)::int AS count FROM luck_wheel_eligibility
                WHERE user_id = $1 AND source = 'DAILY' AND claimed_at IS NULL`, [userId]),
            client.query('SELECT now() AS now'),
        ]);
        let nextSpinAt = new Date(stateResult.rows[0].nextSpinAt);
        const now = new Date(clockResult.rows[0].now);
        let available = availableResult.rows[0].count;
        const intervalMs = config.intervalHours * 60 * 60 * 1000;

        if (available >= config.dailySpinCap && nextSpinAt <= now) {
            nextSpinAt = new Date(now.getTime() + intervalMs);
        } else {
            while (available < config.dailySpinCap && nextSpinAt <= now) {
                await client.query(`INSERT INTO luck_wheel_eligibility(user_id, spin_type, source)
                    VALUES ($1, 'SIGNUP', 'DAILY')`, [userId]);
                available += 1;
                nextSpinAt = new Date(nextSpinAt.getTime() + intervalMs);
            }
            if (available >= config.dailySpinCap && nextSpinAt <= now) {
                nextSpinAt = new Date(now.getTime() + intervalMs);
            }
        }
        await client.query(`UPDATE luck_wheel_daily_state SET next_spin_at = $2, updated_at = now()
            WHERE user_id = $1`, [userId, nextSpinAt]);
        return { available, nextSpinAt, config };
    });
}

promotionsRouter.get('/wheel', async (request, response, next) => {
    try {
        const dailySpins = await replenishDailySpins(request.auth.userId);
        const [signupPrizes, referralPrizes, eligibility, spinHistory, winnerFeed] = await Promise.all([
            getWheelPrizes(pool, 'SIGNUP'),
            getWheelPrizes(pool, 'REFERRAL'),
            pool.query(`SELECT id, spin_type AS "spinType", source, created_at AS "createdAt"
                FROM luck_wheel_eligibility WHERE user_id = $1 AND claimed_at IS NULL ORDER BY created_at, id`, [request.auth.userId]),
            pool.query(`SELECT s.id, s.spin_type AS "spinType", e.source, s.prize_index AS "prizeIndex", s.prize_label AS "prizeLabel",
                s.amount::text, s.created_at AS "createdAt"
                FROM luck_wheel_spins s JOIN luck_wheel_eligibility e ON e.id = s.eligibility_id
                WHERE s.user_id = $1 ORDER BY s.created_at DESC`, [request.auth.userId]),
            pool.query(`SELECT s.id, '0' || left(trim(u.phone_number::text), 3) || '*****' || right(trim(u.phone_number::text), 2) AS phone,
                s.amount::text AS amount
                FROM luck_wheel_spins s JOIN users u ON u.id = s.user_id
                WHERE s.amount > 0 ORDER BY s.created_at DESC LIMIT 12`),
        ]);
        response.json({
            success: true,
            data: {
                pools: { SIGNUP: signupPrizes, REFERRAL: referralPrizes },
                availableSpins: eligibility.rows,
                spinHistory: spinHistory.rows,
                winnerFeed: winnerFeed.rows,
                dailySpinCap: dailySpins.config.dailySpinCap,
                dailySpinsAvailable: dailySpins.available,
                nextDailySpinAt: dailySpins.nextSpinAt,
            },
        });
    } catch (error) {
        next(error);
    }
});

const wheelSpinLimiter = createUserRateLimit({ limit: 3 });
promotionsRouter.post('/wheel/spin', wheelSpinLimiter, async (request, response, next) => {
    try {
        const parsed = z.object({ eligibilityId: z.string().uuid() }).safeParse(request.body);
        if (!parsed.success) {
            return response.status(400).json({ success: false, message: 'Select an available wheel spin.', code: 'VALIDATION_ERROR' });
        }
        const result = await inTransaction(async (client) => {
            const eligibilityResult = await client.query(`SELECT id, spin_type, source FROM luck_wheel_eligibility
                WHERE id = $1 AND user_id = $2 FOR UPDATE`, [parsed.data.eligibilityId, request.auth.userId]);
            const eligibility = eligibilityResult.rows[0];
            if (!eligibility) {
                throw Object.assign(new Error('This wheel spin is not available.'), { status: 404, code: 'WHEEL_SPIN_UNAVAILABLE' });
            }
            const claimed = await client.query('SELECT 1 FROM luck_wheel_spins WHERE eligibility_id = $1', [eligibility.id]);
            if (claimed.rowCount) {
                throw Object.assign(new Error('This wheel spin has already been used.'), { status: 409, code: 'WHEEL_ALREADY_SPUN' });
            }
            const prizes = await getWheelPrizes(client, eligibility.spin_type);
            const totalWeight = prizes.reduce((total, prize) => total + prize.weight, 0);
            const prizeIndex = selectWheelPrizeIndex(prizes, randomInt(totalWeight));
            const prize = prizes[prizeIndex];
            const amount = prize.amount.toFixed(2);
            const spin = await client.query(`INSERT INTO luck_wheel_spins(user_id, spin_type, eligibility_id, prize_index, prize_label, amount)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, spin_type AS "spinType", prize_index AS "prizeIndex", prize_label AS "prizeLabel",
                    amount::text, created_at AS "createdAt"`,
            [request.auth.userId, eligibility.spin_type, eligibility.id, prizeIndex, prize.label, amount]);
            await client.query('UPDATE luck_wheel_eligibility SET claimed_at = now() WHERE id = $1 AND claimed_at IS NULL', [eligibility.id]);
            await postWalletMovement(client, {
                userId: request.auth.userId,
                amount,
                direction: 'CREDIT',
                transactionType: 'LUCKY_WHEEL',
                referenceId: spin.rows[0].id,
                referenceType: 'LUCKY_WHEEL_SPIN',
                description: `${eligibility.source === 'DAILY' ? 'Daily' : eligibility.source === 'ADMIN' ? 'Admin-granted' : eligibility.spin_type === 'SIGNUP' ? 'Signup' : 'Referral'} wheel prize: ${prize.label}`,
            });
            const user = await client.query(`SELECT '0' || left(trim(phone_number::text), 3) || '*****' || right(trim(phone_number::text), 2) AS phone
                FROM users WHERE id = $1`, [request.auth.userId]);
            return { ...spin.rows[0], source: eligibility.source, prizes, amount, phone: user.rows[0].phone };
        });
        response.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

export const adminPromotionsRouter = Router();
adminPromotionsRouter.use(requireAuth, requireAdmin);

adminPromotionsRouter.get('/game', async (_request, response, next) => {
    try {
        const [odds, config] = await Promise.all([
            getMultiplierGameOdds(pool),
            getMultiplierGameConfig(pool),
        ]);
        response.json({ success: true, data: { odds: multiplierOddsWithProbability(odds), config } });
    } catch (error) {
        next(error);
    }
});

adminPromotionsRouter.put('/game', async (request, response, next) => {
    try {
        let odds;
        try {
            odds = normalizeMultiplierGameOdds(request.body?.odds);
        } catch (error) {
            return response.status(400).json({ success: false, message: error.message, code: 'VALIDATION_ERROR' });
        }
        await inTransaction(async (client) => {
            await client.query(`INSERT INTO settings(key, value, updated_by, updated_at)
                VALUES ('multiplier_game_odds', $1::jsonb, $2, now())
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`,
            [JSON.stringify(odds), request.auth.userId]);
            await client.query(`INSERT INTO audit_logs(admin_id, action, entity_type, new_value)
                VALUES ($1, 'MULTIPLIER_GAME_ODDS_UPDATE', 'multiplier_game', $2)`,
            [request.auth.userId, JSON.stringify(odds)]);
        });
        response.json({ success: true, data: { odds: multiplierOddsWithProbability(odds) } });
    } catch (error) {
        next(error);
    }
});

adminPromotionsRouter.put('/game/config', async (request, response, next) => {
    try {
        let config;
        try {
            config = normalizeMultiplierGameConfig(request.body);
        } catch (error) {
            return response.status(400).json({ success: false, message: error.message, code: 'VALIDATION_ERROR' });
        }
        await inTransaction(async (client) => {
            await client.query(`INSERT INTO settings(key, value, updated_by, updated_at)
                VALUES ('multiplier_game_config', $1::jsonb, $2, now())
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`,
            [JSON.stringify(config), request.auth.userId]);
            await client.query(`INSERT INTO audit_logs(admin_id, action, entity_type, new_value)
                VALUES ($1, 'MULTIPLIER_GAME_CONFIG_UPDATE', 'multiplier_game', $2)`,
            [request.auth.userId, JSON.stringify(config)]);
        });
        response.json({ success: true, data: config });
    } catch (error) {
        next(error);
    }
});

adminPromotionsRouter.get('/gifts', async (_request, response, next) => {
    try {
        const result = await pool.query(`SELECT gc.id, gc.code, gc.label, gc.amount::text AS amount,
            gc.max_redemptions AS "maxRedemptions", gc.redeemed_count AS "redeemedCount",
            gc.status, gc.created_at AS "createdAt"
            FROM gift_codes gc ORDER BY gc.created_at DESC LIMIT 200`);
        response.json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
});

const giftCodeSchema = z.object({
    code: z.string().trim().min(4).max(32).regex(/^[A-Z0-9-]+$/).optional(),
    label: z.string().trim().min(2).max(80),
    amount: z.coerce.number().min(2).max(15)
        .refine((amount) => Math.abs(amount * 100 - Math.round(amount * 100)) < 0.000001, 'Gift amounts must have at most two decimal places.'),
    maxRedemptions: z.coerce.number().int().min(1).max(1000000),
});

adminPromotionsRouter.post('/gifts', async (request, response, next) => {
    try {
        const body = {
            ...request.body,
            code: typeof request.body?.code === 'string' && request.body.code.trim()
                ? request.body.code.trim().toUpperCase()
                : undefined,
        };
        const parsed = giftCodeSchema.safeParse(body);
        if (!parsed.success) {
            return response.status(400).json({ success: false, message: parsed.error.issues[0]?.message ?? 'Check the gift code settings.', code: 'VALIDATION_ERROR' });
        }
        const code = parsed.data.code ?? `GIFT-${randomBytes(6).toString('hex').toUpperCase()}`;
        const created = await inTransaction(async (client) => {
            const result = await client.query(`INSERT INTO gift_codes(code, label, amount, max_redemptions, created_by)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, code, label, amount::text AS amount, max_redemptions AS "maxRedemptions",
                    redeemed_count AS "redeemedCount", status, created_at AS "createdAt"`,
            [code, parsed.data.label, parsed.data.amount.toFixed(2), parsed.data.maxRedemptions, request.auth.userId]);
            await client.query(`INSERT INTO audit_logs(admin_id, action, entity_type, entity_id, new_value)
                VALUES ($1, 'GIFT_CODE_CREATE', 'gift_code', $2, $3)`,
            [request.auth.userId, result.rows[0].id, JSON.stringify({ code, label: parsed.data.label, amount: parsed.data.amount, maxRedemptions: parsed.data.maxRedemptions })]);
            return result.rows[0];
        });
        response.status(201).json({ success: true, data: created });
    } catch (error) {
        if (error.code === '23505') {
            return response.status(409).json({ success: false, message: 'That gift code is already in use.', code: 'GIFT_CODE_CONFLICT' });
        }
        next(error);
    }
});

adminPromotionsRouter.patch('/gifts/:giftId', async (request, response, next) => {
    try {
        const giftId = z.string().uuid().safeParse(request.params.giftId);
        const status = z.enum(['ACTIVE', 'DISABLED']).safeParse(request.body?.status);
        if (!giftId.success || !status.success) {
            return response.status(400).json({ success: false, message: 'Invalid gift code update.', code: 'VALIDATION_ERROR' });
        }
        const result = await inTransaction(async (client) => {
            const updated = await client.query(`UPDATE gift_codes SET status = $2 WHERE id = $1
                RETURNING id, code, status`, [giftId.data, status.data]);
            if (!updated.rowCount) {
                throw Object.assign(new Error('Gift code not found.'), { status: 404, code: 'NOT_FOUND' });
            }
            await client.query(`INSERT INTO audit_logs(admin_id, action, entity_type, entity_id, new_value)
                VALUES ($1, 'GIFT_CODE_STATUS_UPDATE', 'gift_code', $2, $3)`,
            [request.auth.userId, giftId.data, JSON.stringify({ status: status.data })]);
            return updated.rows[0];
        });
        response.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

adminPromotionsRouter.get('/wheel', async (_request, response, next) => {
    try {
        const [signupPrizes, referralPrizes] = await Promise.all([
            getWheelPrizes(pool, 'SIGNUP'),
            getWheelPrizes(pool, 'REFERRAL'),
        ]);
        response.json({ success: true, data: { signupPrizes, referralPrizes } });
    } catch (error) {
        next(error);
    }
});

adminPromotionsRouter.get('/wheel/config', async (_request, response, next) => {
    try {
        response.json({ success: true, data: await getDailySpinConfig(pool) });
    } catch (error) {
        next(error);
    }
});

adminPromotionsRouter.put('/wheel/config', async (request, response, next) => {
    try {
        let config;
        try {
            config = normalizeDailySpinConfig(request.body);
        } catch (error) {
            return response.status(400).json({ success: false, message: error.message, code: 'VALIDATION_ERROR' });
        }
        await inTransaction(async (client) => {
            await client.query(`INSERT INTO settings(key, value, updated_by, updated_at)
                VALUES ('luck_wheel_daily_config', $1::jsonb, $2, now())
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`,
            [JSON.stringify(config), request.auth.userId]);
            await client.query(`INSERT INTO audit_logs(admin_id, action, entity_type, new_value)
                VALUES ($1, 'WHEEL_DAILY_CONFIG_UPDATE', 'wheel_daily_config', $2)`,
            [request.auth.userId, JSON.stringify(config)]);
        });
        response.json({ success: true, data: config });
    } catch (error) {
        next(error);
    }
});

adminPromotionsRouter.post('/wheel/spins', async (request, response, next) => {
    try {
        const parsed = z.object({
            phoneNumber: z.string().trim().min(9).max(24).regex(/^[+0-9\s()-]+$/),
            count: z.coerce.number().int().min(1).max(100),
            spinType: z.enum(['SIGNUP', 'REFERRAL']),
        }).safeParse(request.body);
        if (!parsed.success) {
            return response.status(400).json({ success: false, message: 'Enter a valid customer phone, spin count, and prize pool.', code: 'VALIDATION_ERROR' });
        }
        let phoneDigits = parsed.data.phoneNumber.replace(/\D/g, '');
        if (phoneDigits.startsWith('251') && phoneDigits.length === 12) phoneDigits = phoneDigits.slice(3);
        if (phoneDigits.startsWith('0') && phoneDigits.length === 10) phoneDigits = phoneDigits.slice(1);
        if (phoneDigits.length !== 9) {
            return response.status(400).json({ success: false, message: 'Enter the customer’s 9-digit Ethiopian phone number.', code: 'VALIDATION_ERROR' });
        }

        const result = await inTransaction(async (client) => {
            const customer = await client.query(`SELECT id, full_name AS "fullName", phone_number AS "phoneNumber"
                FROM users
                WHERE role = 'CUSTOMER'
                  AND CASE
                    WHEN regexp_replace(phone_number::text, '[^0-9]', '', 'g') LIKE '251%'
                      AND length(regexp_replace(phone_number::text, '[^0-9]', '', 'g')) = 12
                      THEN substring(regexp_replace(phone_number::text, '[^0-9]', '', 'g') FROM 4)
                    WHEN regexp_replace(phone_number::text, '[^0-9]', '', 'g') LIKE '0%'
                      AND length(regexp_replace(phone_number::text, '[^0-9]', '', 'g')) = 10
                      THEN substring(regexp_replace(phone_number::text, '[^0-9]', '', 'g') FROM 2)
                    ELSE regexp_replace(phone_number::text, '[^0-9]', '', 'g')
                  END = $1
                FOR UPDATE`, [phoneDigits]);
            if (!customer.rowCount) {
                throw Object.assign(new Error('No customer was found with that phone number.'), { status: 404, code: 'CUSTOMER_NOT_FOUND' });
            }
            const added = await client.query(`INSERT INTO luck_wheel_eligibility(user_id, spin_type, source)
                SELECT $1, $2, 'ADMIN' FROM generate_series(1, $3)
                RETURNING id`, [customer.rows[0].id, parsed.data.spinType, parsed.data.count]);
            await client.query(`INSERT INTO audit_logs(admin_id, action, entity_type, entity_id, new_value)
                VALUES ($1, 'LUCK_WHEEL_SPINS_GRANTED', 'customer', $2, $3)`,
            [request.auth.userId, customer.rows[0].id, JSON.stringify({
                count: added.rowCount,
                spinType: parsed.data.spinType,
                phoneNumber: customer.rows[0].phoneNumber,
            })]);
            return {
                customerName: customer.rows[0].fullName,
                phoneNumber: customer.rows[0].phoneNumber,
                count: added.rowCount,
                spinType: parsed.data.spinType,
            };
        });
        response.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

adminPromotionsRouter.put('/wheel', async (request, response, next) => {
    try {
        let signupPrizes;
        let referralPrizes;
        try {
            signupPrizes = normalizeWheelPrizes(request.body?.signupPrizes, 'SIGNUP', { rejectJokePrizes: true });
            referralPrizes = normalizeWheelPrizes(request.body?.referralPrizes, 'REFERRAL', { rejectJokePrizes: true });
        } catch (error) {
            return response.status(400).json({ success: false, message: error.issues?.[0]?.message ?? error.message ?? 'Check the wheel prizes.', code: 'VALIDATION_ERROR' });
        }
        await inTransaction(async (client) => {
            for (const [spinType, prizes] of [['SIGNUP', signupPrizes], ['REFERRAL', referralPrizes]]) {
                await client.query(`INSERT INTO settings(key, value, updated_by, updated_at)
                    VALUES ($1, $2::jsonb, $3, now())
                    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`,
                [wheelSettingKey(spinType), JSON.stringify(prizes), request.auth.userId]);
            }
            await client.query(`INSERT INTO audit_logs(admin_id, action, entity_type, new_value)
                VALUES ($1, 'LUCK_WHEEL_SETTINGS_UPDATE', 'luck_wheel', $2)`,
            [request.auth.userId, JSON.stringify({ signupPrizes, referralPrizes })]);
        });
        response.json({ success: true, data: { signupPrizes, referralPrizes } });
    } catch (error) {
        next(error);
    }
});
