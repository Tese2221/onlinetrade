import assert from 'node:assert/strict';
import test from 'node:test';
import {
    DEFAULT_REFERRAL_WHEEL_PRIZES,
    DEFAULT_SIGNUP_WHEEL_PRIZES,
    normalizeWheelPrizes,
    selectWheelPrizeIndex,
    wheelSettingKey,
} from '../src/lib/promotions.js';

test('signup wheel contains only the 5, 10, and 20 ETB cash prize values', () => {
    const prizes = normalizeWheelPrizes(DEFAULT_SIGNUP_WHEEL_PRIZES, 'SIGNUP');
    assert.ok(prizes.every(({ kind, amount }) => kind === 'CASH' && [5, 10, 20].includes(amount)));
});

test('referral wheel cash prizes stay within 20–100 ETB', () => {
    const prizes = normalizeWheelPrizes(DEFAULT_REFERRAL_WHEEL_PRIZES, 'REFERRAL');
    assert.ok(prizes.every(({ kind, amount }) => kind === 'CASH' && amount >= 20 && amount <= 100));
    assert.ok(prizes.some(({ amount }) => amount === 100));
});

test('wheel prize rules reject cash amounts outside each spin type range', () => {
    const signupPrizes = [
        { label: '21 ETB', amount: 21, weight: 1, kind: 'CASH' },
        { label: 'Joke', amount: null, weight: 1, kind: 'JOKE' },
    ];
    const referralPrizes = [
        { label: '19 ETB', amount: 19, weight: 1, kind: 'CASH' },
        { label: 'Joke', amount: null, weight: 1, kind: 'JOKE' },
    ];
    assert.throws(() => normalizeWheelPrizes(signupPrizes, 'SIGNUP'));
    assert.throws(() => normalizeWheelPrizes(referralPrizes, 'REFERRAL'));
    assert.throws(() => normalizeWheelPrizes([
        { label: '5 ETB', amount: 5, weight: 1, kind: 'CASH' },
        { label: '25 ETB', amount: 25, weight: 1, kind: 'CASH' },
    ], 'SIGNUP'));
    assert.throws(() => normalizeWheelPrizes([
        { label: '20 ETB', amount: 20, weight: 1, kind: 'CASH' },
        { label: '101 ETB', amount: 101, weight: 1, kind: 'CASH' },
    ], 'REFERRAL'));
});

test('wheel prize labels always match the cash amounts', () => {
    const prizes = normalizeWheelPrizes([
        { label: '10000 ETB', amount: 5, weight: 1, kind: 'CASH' },
        { label: 'whatever', amount: 10, weight: 1, kind: 'CASH' },
    ], 'SIGNUP');
    assert.deepEqual(prizes.map(({ label }) => label), ['5 ETB', '10 ETB']);
});

test('legacy joke wedges are ignored and new joke prizes are rejected', () => {
    const legacyPrizes = normalizeWheelPrizes([
        { label: '5 ETB', amount: 5, weight: 1, kind: 'CASH' },
        { label: '10 ETB', amount: 10, weight: 1, kind: 'CASH' },
        { label: '1,000 ETB (joke)', amount: null, weight: 10, kind: 'JOKE' },
    ], 'SIGNUP');
    assert.deepEqual(legacyPrizes.map(({ label }) => label), ['5 ETB', '10 ETB']);
    assert.throws(() => normalizeWheelPrizes([
        { label: '5 ETB', amount: 5, weight: 1, kind: 'CASH' },
        { label: '10 ETB', amount: 10, weight: 1, kind: 'CASH' },
        { label: '1,000 ETB', amount: null, weight: 10, kind: 'JOKE' },
    ], 'SIGNUP', { rejectJokePrizes: true }), /Joke prizes are no longer supported/);
});

test('wheel prize settings are kept separate by eligibility type', () => {
    assert.equal(wheelSettingKey('SIGNUP'), 'luck_wheel_signup_prizes');
    assert.equal(wheelSettingKey('REFERRAL'), 'luck_wheel_referral_prizes');
    assert.throws(() => wheelSettingKey('OTHER'));
});

test('wheel prize selection follows configured weights', () => {
    const prizes = [
        { label: 'Small', amount: 2, weight: 2, kind: 'CASH' },
        { label: 'Large', amount: 15, weight: 3, kind: 'CASH' },
    ];

    assert.equal(selectWheelPrizeIndex(prizes, 0), 0);
    assert.equal(selectWheelPrizeIndex(prizes, 1), 0);
    assert.equal(selectWheelPrizeIndex(prizes, 2), 1);
    assert.equal(selectWheelPrizeIndex(prizes, 4), 1);
});

test('wheel selection rejects a draw outside the configured weights', () => {
    assert.throws(() => selectWheelPrizeIndex([{ label: 'Only', amount: 2, weight: 1 }], 1), RangeError);
});
