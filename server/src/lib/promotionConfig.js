import { z } from 'zod';

export const DEFAULT_DAILY_SPIN_CONFIG = {
    dailySpinCap: 4,
    intervalHours: 24,
};

export const MAX_GAME_STAKE = 5_000_000_000_000;
export const DEFAULT_MULTIPLIER_GAME_CONFIG = {
    stakePresets: [10, 20, 50, 100],
    maxStake: MAX_GAME_STAKE,
};

const dailySpinConfigSchema = z.object({
    dailySpinCap: z.coerce.number().int().min(1).max(100),
    intervalHours: z.coerce.number().int().min(1).max(720),
});

const multiplierGameConfigSchema = z.object({
    stakePresets: z.array(z.coerce.number().positive().max(MAX_GAME_STAKE)).min(1).max(8),
    maxStake: z.coerce.number().positive().max(MAX_GAME_STAKE),
}).superRefine((config, context) => {
    const uniquePresets = new Set(config.stakePresets);
    if (uniquePresets.size !== config.stakePresets.length) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'Game stake presets must be unique.' });
    }
    if (config.stakePresets.some((amount) => amount > config.maxStake)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'Game stake presets cannot exceed the maximum stake.' });
    }
    if ([...config.stakePresets, config.maxStake].some((amount) => Math.abs(amount * 100 - Math.round(amount * 100)) >= 0.000001)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'Game stake amounts must have at most two decimal places.' });
    }
});

function parseConfig(value, schema) {
    return schema.parse(typeof value === 'string' ? JSON.parse(value) : value);
}

export function normalizeDailySpinConfig(value) {
    return parseConfig(value, dailySpinConfigSchema);
}

export function normalizeMultiplierGameConfig(value) {
    return parseConfig(value, multiplierGameConfigSchema);
}
