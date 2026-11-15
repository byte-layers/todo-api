// Le serveur HTTP : quatre routes autour du stockage de src/todos.js.
import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { createStore } from './todos.js';

export function createServer(store = createStore()) {
  return http.createServer(async (req, res) => {
    const send = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(body === undefined ? '' : JSON.stringify(body));
    };
    const match = req.url.match(/^\/todos(?:\/(\d+))?$/);
    if (!match) return send(404, { error: 'not found' });
    const id = match[1] ? Number(match[1]) : null;

    if (req.method === 'GET' && id === null) return send(200, store.list());
    if (req.method === 'POST' && id === null) {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      try {
        return send(201, store.add(JSON.parse(raw || '{}').title));
      } catch (err) {
        return send(400, { error: err.message });
      }
    }
    if (req.method === 'PATCH' && id !== null) {
      const todo = store.complete(id);
      return todo ? send(200, todo) : send(404, { error: 'not found' });
    }
    if (req.method === 'DELETE' && id !== null) {
      return store.remove(id) ? send(204) : send(404, { error: 'not found' });
    }
    return send(405, { error: 'method not allowed' });
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => console.log(`todo-api listening on http://localhost:${port}`));
}
