import assert from 'node:assert/strict';
import { test } from 'node:test';

import { greeting, MAX_NAME_LENGTH } from '../src/greeting.js';

test('greets a name', () => {
  assert.equal(greeting('Ada'), 'Bonjour, Ada !');
});

test('greets the world without a name, or with a blank one', () => {
  assert.equal(greeting(undefined), 'Bonjour, le monde !');
  assert.equal(greeting(null), 'Bonjour, le monde !');
  assert.equal(greeting('   '), 'Bonjour, le monde !');
});

test('trims a name and cuts it to its longest length', () => {
  assert.equal(greeting('  Ada  '), 'Bonjour, Ada !');
  assert.equal(greeting('a'.repeat(MAX_NAME_LENGTH + 5)), `Bonjour, ${'a'.repeat(MAX_NAME_LENGTH)} !`);
});
