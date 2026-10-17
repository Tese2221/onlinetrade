export const MULTIPLIER_GAME_VALUES = [0, 1, 1.5, 2, 5, 10, 15];
export const DEFAULT_MULTIPLIER_GAME_ODDS = [
    { multiplier: 0, weight: 3500 },
    { multiplier: 1, weight: 4300 },
    { multiplier: 1.5, weight: 1300 },
    { multiplier: 2, weight: 600 },
    { multiplier: 5, weight: 250 },
    { multiplier: 10, weight: 45 },
    { multiplier: 15, weight: 5 },
];

export function normalizeMultiplierGameOdds(value) {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (!Array.isArray(parsed) || parsed.length !== MULTIPLIER_GAME_VALUES.length) {
        throw new TypeError('Game settings must include exactly one weight for each multiplier.');
    }

    const odds = parsed.map((entry) => {
        const multiplier = Number(entry?.multiplier);
        const weight = Number(entry?.weight);
        if (!MULTIPLIER_GAME_VALUES.includes(multiplier) || !Number.isSafeInteger(weight) || weight < 1 || weight > 100000) {
            throw new TypeError('Each multiplier weight must be a whole number from 1 to 100000.');
        }
        return { multiplier, weight };
    }).sort((left, right) => left.multiplier - right.multiplier);

    if (new Set(odds.map(({ multiplier }) => multiplier)).size !== MULTIPLIER_GAME_VALUES.length) {
        throw new TypeError('Game settings must include each multiplier exactly once.');
    }
    return odds;
}

export function selectMultiplier(odds, draw) {
    const totalWeight = odds.reduce((total, entry) => total + entry.weight, 0);
    if (!Number.isSafeInteger(draw) || draw < 0 || draw >= totalWeight) {
        throw new RangeError('The random game draw is outside the configured weights.');
    }
    let remaining = draw;
    for (const entry of odds) {
        if (remaining < entry.weight) return entry.multiplier;
        remaining -= entry.weight;
    }
    throw new RangeError('The configured game weights did not select a multiplier.');
}

export function multiplierOddsWithProbability(odds) {
    const totalWeight = odds.reduce((total, entry) => total + entry.weight, 0);
    return odds.map(({ multiplier, weight }) => ({
        multiplier,
        weight,
        probability: Number((weight / totalWeight * 100).toFixed(4)),
    }));
}
