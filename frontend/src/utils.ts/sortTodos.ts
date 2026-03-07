import type { Todo } from '@todo-app/shared';

export function sortTodos(items: Todo[]): Todo[] {
  return [...items].sort((a, b) => {
    // false before true
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // decreasing priority
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }

    // smallest first, undefined at the end
    if (a.utcDueDate !== b.utcDueDate) {
      if (!a.utcDueDate) return 1; // a moves to the end
      if (!b.utcDueDate) return -1; // b moves to the end

      const dateA = new Date(a.utcDueDate).getTime();
      const dateB = new Date(b.utcDueDate).getTime();

      if (dateA !== dateB) {
        return dateA - dateB;
      }
    }

    // alphabetical
    return a.name.localeCompare(b.name);
  });
}
