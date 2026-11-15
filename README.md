# todo-api

Une petite API de tâches en Node.js, sans dépendance : le projet fil rouge des contenus
[byte_layers](https://byte-layers.com) sur le développement avec un agent d'IA.

```bash
npm test     # lance les tests (node --test)
npm start    # démarre l'API sur http://localhost:3000
```

| Route | Rôle |
|---|---|
| `GET /todos` | liste les tâches |
| `POST /todos` | crée une tâche, corps `{"title": "..."}` |
| `PATCH /todos/:id` | marque une tâche comme faite |
| `DELETE /todos/:id` | supprime une tâche |

Licence MIT.
