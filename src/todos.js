// Le stockage des tâches, en mémoire : aucune base de données à installer.
export const MAX_TITLE_LENGTH = 200;

export function createStore() {
  const todos = new Map();
  let nextId = 1;

  function add(title) {
    const clean = typeof title === 'string' ? title.trim() : '';
    if (clean === '') throw new Error('title is required');
    if (clean.length > MAX_TITLE_LENGTH) throw new Error(`title is longer than ${MAX_TITLE_LENGTH} characters`);
    const todo = { id: nextId++, title: clean, done: false };
    todos.set(todo.id, todo);
    return todo;
  }

  function list() {
    return [...todos.values()];
  }

  function complete(id) {
    const todo = todos.get(id);
    if (!todo) return null;
    todo.done = true;
    return todo;
  }

  function remove(id) {
    return todos.delete(id);
  }

  return { add, list, complete, remove };
}
