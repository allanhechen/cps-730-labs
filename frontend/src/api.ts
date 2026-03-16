import type { Todo, Category } from '@todo-app/shared';

const deleteTodo =
  (path: string) =>
  async (id: Todo['id']): Promise<void> => {
    await fetch(`${path}/items/${id}`, { method: 'DELETE', credentials: 'include' });
  };

const updateTodo =
  (path: string) =>
  async (id: Todo['id'], updatedTodo: Partial<Todo>): Promise<Todo> => {
    const response = await fetch(`${path}/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedTodo),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
      credentials: 'include',
    });
    return await response.json();
  };

const getTodos =
  (path: string) =>
  async (filters?: {
    name?: string;
    categoryId?: number;
    priority?: number;
  }): Promise<Todo[]> => {
    const params = new URLSearchParams();
    if (filters?.name) {
      params.append('search', filters.name);
    }
    if (filters?.categoryId) {
      params.append('categories', filters.categoryId.toString());
    }
    if (filters?.priority !== undefined) {
      params.append('priority', filters.priority.toString());
    }

    const response = await fetch(`${path}/items?${params.toString()}`, { credentials: 'include' });
    return await response.json();
  };

const addCategory =
  (path: string) =>
  async (name: Category['name']): Promise<Category | null> => {
    const response = await fetch(`${path}/categories`, {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  };

const getCategories = (path: string) => async (): Promise<Category[]> => {
  const response = await fetch(`${path}/categories`, { credentials: 'include' });
  return await response.json();
};

const addItemToCategory =
  (path: string) =>
  async (todoId: Todo['id'], categoryId: Category['id']): Promise<Todo> => {
    const response = await fetch(`${path}/items/${todoId}/categories`, {
      method: 'POST',
      body: JSON.stringify({ categoryId }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
      credentials: 'include',
    });
    return await repsonse.json();
  };

const getUser = (path: string) => async () => {
  const response = await fetch(`${path}/auth/user`, { credentials: 'include' });
  if (response.ok) {
    return await response.json();
  }
  return null;
};

const logout = (path: string) => async () => {
  await fetch(`${path}/auth/logout`, { credentials: 'include' });
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
  getUser: getUser(path),
  logout: logout(path),
});
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'PLACEHOLDER_URL';
const api: ReturnType<typeof init> = init(BASE_URL);

export default api;
