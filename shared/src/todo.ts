export const Priority = {
  NONE: 0,
  LOW: 3,
  MEDIUM: 5,
  HIGH: 7,
} as const;

export type Priority = typeof Priority[keyof typeof Priority];

export interface Category {
  id: number;
  name: string;
}

export interface Todo {
  id: string;
  name: string;
  completed: boolean;
  categories: Category[];
  priority: Priority;
  utcDueDate?: string | undefined;
}
