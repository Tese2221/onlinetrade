import assert from 'node:assert/strict';
import test from 'node:test';
import {
    DEFAULT_DAILY_SPIN_CONFIG,
    DEFAULT_MULTIPLIER_GAME_CONFIG,
    MAX_GAME_STAKE,
    normalizeDailySpinConfig,
    normalizeMultiplierGameConfig,
} from '../src/lib/promotionConfig.js';

test('default spin and game configuration is valid', () => {
    assert.deepEqual(normalizeDailySpinConfig(DEFAULT_DAILY_SPIN_CONFIG), DEFAULT_DAILY_SPIN_CONFIG);
    assert.deepEqual(normalizeMultiplierGameConfig(DEFAULT_MULTIPLIER_GAME_CONFIG), DEFAULT_MULTIPLIER_GAME_CONFIG);
});

test('daily spin settings enforce bounded cap and interval values', () => {
    assert.deepEqual(normalizeDailySpinConfig('{"dailySpinCap":8,"intervalHours":12}'), { dailySpinCap: 8, intervalHours: 12 });
    assert.throws(() => normalizeDailySpinConfig({ dailySpinCap: 0, intervalHours: 24 }));
    assert.throws(() => normalizeDailySpinConfig({ dailySpinCap: 4, intervalHours: 721 }));
});

test('game stake settings require unique presets within the configured maximum', () => {
    assert.deepEqual(
        normalizeMultiplierGameConfig({ stakePresets: [5, 10.5], maxStake: 20 }),
        { stakePresets: [5, 10.5], maxStake: 20 },
    );
    assert.throws(() => normalizeMultiplierGameConfig({ stakePresets: [10, 10], maxStake: 20 }));
    assert.throws(() => normalizeMultiplierGameConfig({ stakePresets: [25], maxStake: 20 }));
    assert.throws(() => normalizeMultiplierGameConfig({ stakePresets: [10], maxStake: MAX_GAME_STAKE + 1 }));
    assert.throws(() => normalizeMultiplierGameConfig({ stakePresets: [1.001], maxStake: 2 }));
});
