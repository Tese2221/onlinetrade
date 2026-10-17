import { z } from 'zod';

export const DEFAULT_SIGNUP_WHEEL_PRIZES = [
    { label: '5 ETB', amount: 5, weight: 40, kind: 'CASH' },
    { label: '10 ETB', amount: 10, weight: 30, kind: 'CASH' },
    { label: '20 ETB', amount: 20, weight: 10, kind: 'CASH' },
];

export const DEFAULT_REFERRAL_WHEEL_PRIZES = [
    { label: '20 ETB', amount: 20, weight: 50, kind: 'CASH' },
    { label: '50 ETB', amount: 50, weight: 30, kind: 'CASH' },
    { label: '100 ETB', amount: 100, weight: 20, kind: 'CASH' },
];

const wheelPrizesSchema = z.array(z.object({
    label: z.string().trim().min(1).max(60),
    amount: z.coerce.number().nullable(),
    weight: z.coerce.number().int().min(1).max(10000),
    kind: z.enum(['CASH', 'JOKE']),
})).min(1).max(12);

export function normalizeWheelPrizes(value, spinType = 'SIGNUP', { rejectJokePrizes = false } = {}) {
    const parsed = wheelPrizesSchema.parse(value);
    if (rejectJokePrizes && parsed.some((prize) => prize.kind === 'JOKE')) {
        throw new TypeError('Joke prizes are no longer supported.');
    }
    const minimum = spinType === 'REFERRAL' ? 20 : 2;
    const maximum = spinType === 'REFERRAL' ? 100 : 20;

    const cashPrizes = parsed.filter((prize) => prize.kind === 'CASH');
    for (const prize of cashPrizes) {
        if (
            prize.amount === null
            || prize.amount < minimum
            || prize.amount > maximum
            || Math.abs(prize.amount * 100 - Math.round(prize.amount * 100)) >= 0.000001
            || (spinType === 'SIGNUP' && ![5, 10, 20].includes(prize.amount))
        ) {
            throw new TypeError(spinType === 'SIGNUP'
                ? 'Signup cash prizes must be 5, 10, or 20 ETB.'
                : `Cash prizes must be between ${minimum} and ${maximum} ETB with at most two decimal places.`);
        }
    }
    if (cashPrizes.length < 1) {
        throw new TypeError('Each wheel must include at least one cash prize.');
    }
    return cashPrizes.map((prize) => ({ ...prize, label: `${prize.amount} ETB` }));
}

export function wheelSettingKey(spinType) {
    if (spinType === 'SIGNUP') return 'luck_wheel_signup_prizes';
    if (spinType === 'REFERRAL') return 'luck_wheel_referral_prizes';
    throw new TypeError('Unknown wheel spin type.');
}

export async function getWheelPrizes(client, spinType) {
    const result = await client.query('SELECT value FROM settings WHERE key = $1', [wheelSettingKey(spinType)]);
    if (result.rowCount) return normalizeWheelPrizes(result.rows[0].value, spinType);
    return spinType === 'SIGNUP' ? DEFAULT_SIGNUP_WHEEL_PRIZES : DEFAULT_REFERRAL_WHEEL_PRIZES;
}

export function selectWheelPrizeIndex(prizes, draw) {
    const totalWeight = prizes.reduce((total, prize) => total + prize.weight, 0);
    if (!Number.isInteger(draw) || draw < 0 || draw >= totalWeight) {
        throw new RangeError('Wheel prize draw must be within the configured prize weights.');
    }

    let cumulativeWeight = 0;
    for (const [index, prize] of prizes.entries()) {
        cumulativeWeight += prize.weight;
        if (draw < cumulativeWeight) return index;
    }

    throw new RangeError('Wheel prize draw did not match a configured prize.');
}
