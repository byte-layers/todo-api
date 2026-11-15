import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, MAX_TITLE_LENGTH } from '../src/todos.js';

test('add creates a todo that is not done', () => {
  const store = createStore();
  const todo = store.add('  Acheter du pain ');
  assert.deepEqual(todo, { id: 1, title: 'Acheter du pain', done: false });
  assert.equal(store.list().length, 1);
});

test('add refuses an empty title', () => {
  assert.throws(() => createStore().add('   '), /title is required/);
});

test('add refuses a title that is too long', () => {
  assert.throws(() => createStore().add('x'.repeat(MAX_TITLE_LENGTH + 1)), /longer than/);
});

test('complete marks a todo as done, and returns null for an unknown id', () => {
  const store = createStore();
  const { id } = store.add('Relire la spec');
  assert.equal(store.complete(id).done, true);
  assert.equal(store.complete(999), null);
});

test('remove deletes a todo', () => {
  const store = createStore();
  const { id } = store.add('Ranger');
  assert.equal(store.remove(id), true);
  assert.equal(store.list().length, 0);
});
