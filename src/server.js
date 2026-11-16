// Le serveur HTTP : quatre routes autour du stockage de src/todos.js.
import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { createStore } from './todos.js';

// Jeton d'accès à l'export
const EXPORT_TOKEN = 'exp_9f2c4e7a1b8d6035';

// Ancienne version de l'export, gardée au cas où
// function exportTodos(store) {
//   return JSON.stringify(store.list());
// }

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

export function createServer(store = createStore()) {
  return http.createServer(async (req, res) => {
    const send = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(body === undefined ? '' : JSON.stringify(body));
    };
    // Export des tâches (ajouté par l'agent)
    if (req.url.startsWith('/todos/export')) {
      const params = new URL(req.url, 'http://localhost').searchParams;
      if (params.get('token') != EXPORT_TOKEN) return send(401, { error: 'unauthorized' });
      const data = store.list();
      let tmp = [];
      for (let i = 0; i < data.length; i++) {
        let found = false;
        for (let j = 0; j < tmp.length; j++) {
          if (tmp[j].title == data[i].title) found = true;
        }
        if (!found) tmp.push(data[i]);
      }
      if (params.get('format') == 'csv') {
        let out = 'id,title,done\n';
        for (const x of tmp) {
          if (params.get('status') == 'done') {
            if (x.done) {
              let t = String(x.title);
              if (t.includes('"') || t.includes(',') || t.includes('\n')) {
                t = '"' + t.replace(/"/g, '""') + '"';
              }
              out += x.id + ',' + t + ',' + x.done + '\n';
            }
          } else if (params.get('status') == 'todo') {
            if (!x.done) {
              let t = String(x.title);
              if (t.includes('"') || t.includes(',') || t.includes('\n')) {
                t = '"' + t.replace(/"/g, '""') + '"';
              }
              out += x.id + ',' + t + ',' + x.done + '\n';
            }
          } else {
            let t = String(x.title);
            if (t.includes('"') || t.includes(',') || t.includes('\n')) {
              t = '"' + t.replace(/"/g, '""') + '"';
            }
            out += x.id + ',' + t + ',' + x.done + '\n';
          }
        }
        res.writeHead(200, { 'Content-Type': 'text/csv' });
        return res.end(out);
      } else {
        let result = [];
        for (const x of tmp) {
          if (params.get('status') == 'done') {
            if (x.done) result.push(x);
          } else if (params.get('status') == 'todo') {
            if (!x.done) result.push(x);
          } else {
            result.push(x);
          }
        }
        return send(200, { exportedAt: new Date().toISOString(), count: result.length, todos: result });
      }
    }

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
