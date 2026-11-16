import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';

test('POST then GET /todos', async (t) => {
  const server = createServer().listen(0);
  t.after(() => server.close());
  const base = `http://localhost:${server.address().port}`;
  const created = await fetch(`${base}/todos`, { method: 'POST', body: JSON.stringify({ title: 'Écrire les tests' }) });
  assert.equal(created.status, 201);
  const list = await (await fetch(`${base}/todos`)).json();
  assert.equal(list[0].title, 'Écrire les tests');
});

test('POST /todos without a title returns 400', async (t) => {
  const server = createServer().listen(0);
  t.after(() => server.close());
  const res = await fetch(`http://localhost:${server.address().port}/todos`, { method: 'POST', body: '{}' });
  assert.equal(res.status, 400);
});

test('GET /todos/export returns the todos as JSON', async (t) => {
  const server = createServer().listen(0);
  t.after(() => server.close());
  const base = `http://localhost:${server.address().port}`;
  await fetch(`${base}/todos`, { method: 'POST', body: JSON.stringify({ title: 'Exporter' }) });
  const res = await fetch(`${base}/todos/export?token=exp_9f2c4e7a1b8d6035`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.todos.length > 0);
});
