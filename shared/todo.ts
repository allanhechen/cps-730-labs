export const priorityMap = {
  NONE: 0,
  LOW: 3,
  MEDIUM: 5,
  HIGH: 7,
} as const;
export type Priority = (typeof priorityMap)[keyof typeof priorityMap];

export interface Todo {
  id: string;
  name: string;
  completed: boolean;
  categories: string[];
  priority: Priority;
  utcDueDate?: string;
}
