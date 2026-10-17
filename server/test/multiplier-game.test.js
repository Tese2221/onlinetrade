import assert from 'node:assert/strict';
import test from 'node:test';
import {
    DEFAULT_MULTIPLIER_GAME_ODDS,
    multiplierOddsWithProbability,
    normalizeMultiplierGameOdds,
    selectMultiplier,
} from '../src/lib/multiplierGame.js';

test('default game odds include every supported multiplier and publish probabilities', () => {
    const odds = normalizeMultiplierGameOdds(DEFAULT_MULTIPLIER_GAME_ODDS);
    assert.deepEqual(odds.map(({ multiplier }) => multiplier), [0, 1, 1.5, 2, 5, 10, 15]);
    assert.equal(multiplierOddsWithProbability(odds).reduce((total, entry) => total + entry.probability, 0), 100);
});

test('game outcome selection follows weights and rejects an out-of-range draw', () => {
    const odds = [{ multiplier: 0, weight: 2 }, { multiplier: 1, weight: 1 }];
    assert.equal(selectMultiplier(odds, 0), 0);
    assert.equal(selectMultiplier(odds, 1), 0);
    assert.equal(selectMultiplier(odds, 2), 1);
    assert.throws(() => selectMultiplier(odds, 3), RangeError);
});

test('game odds reject missing, duplicate, unsupported, and invalid weights', () => {
    assert.throws(() => normalizeMultiplierGameOdds(DEFAULT_MULTIPLIER_GAME_ODDS.slice(1)));
    assert.throws(() => normalizeMultiplierGameOdds([
        ...DEFAULT_MULTIPLIER_GAME_ODDS.slice(1),
        { multiplier: 1, weight: 1 },
    ]));
    assert.throws(() => normalizeMultiplierGameOdds([
        ...DEFAULT_MULTIPLIER_GAME_ODDS.slice(1),
        { multiplier: 3, weight: 1 },
    ]));
    assert.throws(() => normalizeMultiplierGameOdds(
        DEFAULT_MULTIPLIER_GAME_ODDS.map((entry) => ({ ...entry, weight: 0 })),
    ));
});
