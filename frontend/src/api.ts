import type { Todo, Category } from '@todo-app/shared';

const deleteTodo = (path: string) => async (id: Todo['id']) => {
  await fetch(`${path}/items/${id}`, { method: 'DELETE' });
};

const updateTodo =
  (path: string) => async (id: Todo['id'], updatedTodo: Todo) => {
    const response = await fetch(`${path}/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedTodo),
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  };

const createTodo = (path: string) => async (name: Todo['name']) => {
  const response = await fetch(`${path}/items`, {
    method: 'POST',
    body: JSON.stringify({ name }),
    headers: { 'Content-Type': 'application/json' },
  });

  return await response.json();
};

const getTodos = (path: string) => async () => {
  const response = await fetch(`${path}/items`);
  return await response.json();
};

const addCategory = (path: string) => async (name: Category['name']) => {
  const response = await fetch(`${path}/items`, {
    method: 'POST',
    body: JSON.stringify({ name }),
    headers: { 'Content-Type': 'application/json' },
  });

  return await response.json();
};

const getCategories = (path: string) => async () => {
  const response = await fetch(`${path}/categories`);
  return await response.json();
};

const addItemToCategory =
  (path: string) => async (todoId: Todo['id'], categoryId: Category['id']) => {
    await fetch(`${path}/items/${todoId}/categories`, {
      method: 'POST',
      body: JSON.stringify({ categoryId }),
      headers: { 'Content-Type': 'application/json' },
    });
  };

const removeItemFromCategory =
  (path: string) => async (todoId: Todo['id'], categoryId: Category['id']) => {
    await fetch(`${path}/items/${todoId}/categories`, {
      method: 'DELETE',
      body: JSON.stringify({ categoryId }),
      headers: { 'Content-Type': 'application/json' },
    });
  };

const getPriorities = (path: string) => async () => {
  const response = await fetch(`${path}/priorities`);
  return await response.json();
};

const init = (path: string) => ({
  deleteTodo: deleteTodo(path),
  updateTodo: updateTodo(path),
  createTodo: createTodo(path),
  getTodos: getTodos(path),
  addCategory: addCategory(path),
  getCategories: getCategories(path),
  addItemToCategory: addItemToCategory(path),
  removeItemFromCategory: removeItemFromCategory(path),
  getPriorities: getPriorities(path),
});
let api: ReturnType<typeof init> = init('http://localhost:3000'); // TODO: load from env or similar

export const setup = (path: string) => {
  api = init(path);
};
export default api;
