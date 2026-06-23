const test = require('node:test');
const assert = require('node:assert');
const { getZodiacScore, calculateMatchPercentage, zodiacElements } = require('../utils');

test('Zodiac Elements Mapping', () => {
  assert.strictEqual(zodiacElements['Aries'], 'Fire');
  assert.strictEqual(zodiacElements['Taurus'], 'Earth');
  assert.strictEqual(zodiacElements['Gemini'], 'Air');
  assert.strictEqual(zodiacElements['Cancer'], 'Water');
});

test('getZodiacScore compatibility scores', () => {
  // Same elements
  assert.strictEqual(getZodiacScore('Aries', 'Leo'), 50); // Fire & Fire
  assert.strictEqual(getZodiacScore('Taurus', 'Virgo'), 50); // Earth & Earth

  // Fire & Air compatible (40)
  assert.strictEqual(getZodiacScore('Aries', 'Gemini'), 40);
  assert.strictEqual(getZodiacScore('Libra', 'Leo'), 40);

  // Earth & Water compatible (40)
  assert.strictEqual(getZodiacScore('Taurus', 'Cancer'), 40);
  assert.strictEqual(getZodiacScore('Pisces', 'Capricorn'), 40);

  // Neutral (25)
  assert.strictEqual(getZodiacScore('Aries', 'Taurus'), 25); // Fire & Earth

  // Invalid zodiac names fallback (20)
  assert.strictEqual(getZodiacScore('InvalidZodiac', 'Leo'), 20);
});

test('calculateMatchPercentage scores', () => {
  // Determinism and boundaries
  const score1 = calculateMatchPercentage('Alice', 'Female', 'Aries', 'Bob', 'Male', 'Leo');
  assert.ok(score1 >= 0 && score1 <= 100, 'Score should be between 0 and 100');

  // Same names/input should produce same output (deterministic)
  const score2 = calculateMatchPercentage('Alice', 'Female', 'Aries', 'Bob', 'Male', 'Leo');
  assert.strictEqual(score1, score2, 'Result should be deterministic');

  // Empty names should return 0
  const scoreEmpty = calculateMatchPercentage('', 'Female', 'Aries', '', 'Male', 'Leo');
  assert.strictEqual(scoreEmpty, 0, 'Empty names should result in 0% match');
});
