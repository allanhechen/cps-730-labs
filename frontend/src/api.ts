import type { Todo, Category } from '@todo-app/shared';

const deleteTodo =
  (path: string) =>
  async (id: Todo['id']): Promise<void> => {
    await fetch(`${path}/items/${id}`, { method: 'DELETE' });
  };

const updateTodo =
  (path: string) =>
  async (id: Todo['id'], updatedTodo: any): Promise<Todo> => {
    const response = await fetch(`${path}/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedTodo),
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  };

const createTodo =
  (path: string) =>
  async (name: Todo['name']): Promise<Todo> => {
    const response = await fetch(`${path}/items`, {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  };

const getTodos = (path: string) => async (): Promise<Todo[]> => {
  const response = await fetch(`${path}/items`);
  return await response.json();
};

const addCategory =
  (path: string) =>
  async (name: Category['name']): Promise<Category> => {
    const response = await fetch(`${path}/categories`, {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: { 'Content-Type': 'application/json' },
    });

    return await response.json();
  };

const getCategories = (path: string) => async (): Promise<Category[]> => {
  const response = await fetch(`${path}/categories`);
  return await response.json();
};

const addItemToCategory =
  (path: string) =>
  async (todoId: Todo['id'], categoryId: Category['id']): Promise<Todo> => {
    const response = await fetch(`${path}/items/${todoId}/categories`, {
      method: 'POST',
      body: JSON.stringify({ categoryId }),
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  };

const removeItemFromCategory =
  (path: string) =>
  async (todoId: Todo['id'], categoryId: Category['id']): Promise<Todo> => {
    const repsonse = await fetch(`${path}/items/${todoId}/categories`, {
      method: 'DELETE',
      body: JSON.stringify({ categoryId }),
      headers: { 'Content-Type': 'application/json' },
    });
    return await repsonse.json();
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
});
let api: ReturnType<typeof init> = init('http://localhost:3000'); // TODO: load from env or similar

export const setup = (path: string) => {
  api = init(path);
};
export default api;
