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
